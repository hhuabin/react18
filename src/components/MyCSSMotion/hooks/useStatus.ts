import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import {
    STATUS_NONE, STATUS_APPEAR, STATUS_ENTER, STATUS_LEAVE,
    STEP_PREPARE, STEP_START, STEP_ACTIVE,
    type MotionStatus, type MotionStep, type CSSMotionProps, type MotionEvent,
} from '../interface'
import useStepQueue, { DoStep, SkipStep, isActive } from './useStepQueue'
import useDomMotionEvents from './useDomMotionEvents'

type UseStatusReturn = [
    status: MotionStatus,
    step: MotionStep,
    style: React.CSSProperties | null,
    mergedVisible: boolean,
]

/**
 * 核心动画状态机。
 *
 * 根据 visible 变化驱动 status（appear/enter/leave）转换，
 * 内部调用 useStepQueue 依次执行 prepare → start → active → end 四个步骤，
 * 并在每个步骤调用对应的用户回调（onXxxPrepare / onXxxStart / onXxxActive）。
 *
 * 动画结束通过 transitionend / animationend 事件或 motionDeadline 超时触发。
 */
export default function useStatus(
    supportMotion: boolean,
    visible: boolean,
    getElement: () => HTMLElement | null,
    props: CSSMotionProps,
): UseStatusReturn {
    const {
        motionEnter = true,
        motionAppear = true,
        motionLeave = true,
        motionDeadline,
        motionLeaveImmediately,
        onAppearPrepare, onEnterPrepare, onLeavePrepare,
        onAppearStart,   onEnterStart,   onLeaveStart,
        onAppearActive,  onEnterActive,  onLeaveActive,
        onAppearEnd,     onEnterEnd,     onLeaveEnd,
        onVisibleChanged,
    } = props

    // ─── 状态 ────────────────────────────────────────────────
    // asyncVisible 用于"渲染可见性"，滞后于 visible 直到动画结束
    const [asyncVisible, setAsyncVisible] = useState<boolean | undefined>(undefined)

    // status ref 供事件回调同步读取（避免闭包旧值）
    const statusRef = useRef<MotionStatus>(STATUS_NONE)
    const [status, _setStatus] = useState<MotionStatus>(STATUS_NONE)
    function setStatus(next: MotionStatus) {
        statusRef.current = next
        _setStatus(next)
    }

    const [style, setStyle] = useState<React.CSSProperties | null>(null)

    const mountedRef = useRef(false)
    const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const visibleRef = useRef<boolean | null>(null)
    const activeRef = useRef(false)

    // ─── 工具：根据当前 status 获取各步骤的用户回调 ──────────
    function getEventHandlers(targetStatus: MotionStatus) {
        switch (targetStatus) {
            case STATUS_APPEAR:
                return { [STEP_PREPARE]: onAppearPrepare, [STEP_START]: onAppearStart, [STEP_ACTIVE]: onAppearActive }
            case STATUS_ENTER:
                return { [STEP_PREPARE]: onEnterPrepare,  [STEP_START]: onEnterStart,  [STEP_ACTIVE]: onEnterActive }
            case STATUS_LEAVE:
                return { [STEP_PREPARE]: onLeavePrepare,  [STEP_START]: onLeaveStart,  [STEP_ACTIVE]: onLeaveActive }
            default:
                return {}
        }
    }

    // ─── 动画结束处理 ─────────────────────────────────────────
    function updateMotionEndStatus() {
        setStatus(STATUS_NONE)
        setStyle(null)
    }

    // 使用 useCallback + ref 保证事件回调稳定，同时读取最新 status
    const onInternalMotionEnd = useCallback((event: MotionEvent) => {
        const currentStatus = statusRef.current
        if (currentStatus === STATUS_NONE) return

        const element = getElement()
        // 排除非目标元素触发的冒泡事件（deadline 除外）
        if (event && !event.deadline && event.target !== element) return

        if (!activeRef.current) return

        let canEnd: boolean | void = undefined
        if (currentStatus === STATUS_APPEAR) canEnd = onAppearEnd?.(element!, event)
        else if (currentStatus === STATUS_ENTER) canEnd = onEnterEnd?.(element!, event)
        else if (currentStatus === STATUS_LEAVE) canEnd = onLeaveEnd?.(element!, event)

        if (canEnd !== false) {
            updateMotionEndStatus()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd)

    // ─── 步骤队列 ─────────────────────────────────────────────
    const eventHandlersRef = useRef(getEventHandlers(status))
    useLayoutEffect(() => {
        eventHandlersRef.current = getEventHandlers(status)
    })

    const [startStep, step] = useStepQueue(status, !supportMotion, (currentStep) => {
        const handlers = eventHandlersRef.current

        if (currentStep === STEP_PREPARE) {
            const onPrepare = handlers[STEP_PREPARE]
            if (!onPrepare) return SkipStep
            return onPrepare(getElement()!, null) as ReturnType<typeof onPrepare>
        }

        // STEP_START / STEP_ACTIVE
        if (currentStep in handlers) {
            const handler = handlers[currentStep as typeof STEP_START | typeof STEP_ACTIVE]
            const newStyle = handler?.(getElement()!, null)
            setStyle((newStyle as React.CSSProperties) || null)
        }

        if (currentStep === STEP_ACTIVE) {
            // 绑定 transitionend/animationend
            patchMotionEvents(getElement())
            // 超时兜底
            if (motionDeadline && motionDeadline > 0) {
                if (deadlineRef.current) clearTimeout(deadlineRef.current)
                deadlineRef.current = setTimeout(() => {
                    onInternalMotionEnd({ deadline: true } as MotionEvent)
                }, motionDeadline)
            }
        }

        return DoStep
    })

    activeRef.current = isActive(step)

    // ─── 监听 visible 变化，切换 status ──────────────────────
    useLayoutEffect(() => {
        // Suspense 场景下 visible 可能重复触发而值未变，跳过
        if (mountedRef.current && visibleRef.current === visible) return

        setAsyncVisible(visible)
        const isMounted = mountedRef.current
        mountedRef.current = true

        let nextStatus: MotionStatus | undefined

        // 首次挂载且 visible=true → appear
        if (!isMounted && visible && motionAppear) nextStatus = STATUS_APPEAR
        // 已挂载，visible 从 false → true → enter
        if (isMounted && visible && motionEnter) nextStatus = STATUS_ENTER
        // 已挂载，visible 从 true → false → leave
        // 或 motionLeaveImmediately：首次挂载 visible=false 也触发 leave
        if (
            (isMounted && !visible && motionLeave) ||
            (!isMounted && motionLeaveImmediately && !visible && motionLeave)
        ) {
            nextStatus = STATUS_LEAVE
        }

        const nextHandlers = nextStatus ? getEventHandlers(nextStatus) : {}

        if (nextStatus && (supportMotion || nextHandlers[STEP_PREPARE])) {
            setStatus(nextStatus)
            startStep()
        } else {
            setStatus(STATUS_NONE)
        }

        visibleRef.current = visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    // ─── 动画开关变化时取消进行中的动画 ──────────────────────
    useEffect(() => {
        if (
            (status === STATUS_APPEAR && !motionAppear) ||
            (status === STATUS_ENTER  && !motionEnter)  ||
            (status === STATUS_LEAVE  && !motionLeave)
        ) {
            setStatus(STATUS_NONE)
        }
    }, [motionAppear, motionEnter, motionLeave])

    // ─── 卸载清理 ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            mountedRef.current = false
            if (deadlineRef.current) clearTimeout(deadlineRef.current)
        }
    }, [])

    // ─── 触发 onVisibleChanged ────────────────────────────────
    const firstMountChangeRef = useRef(false)
    useEffect(() => {
        if (asyncVisible) firstMountChangeRef.current = true
        if (asyncVisible !== undefined && status === STATUS_NONE) {
            if (firstMountChangeRef.current || asyncVisible) {
                onVisibleChanged?.(asyncVisible)
            }
            firstMountChangeRef.current = true
        }
    }, [asyncVisible, status])

    // ─── 合并样式：prepare 阶段禁用 transition，防止从初始值跳变 ─
    const mergedStyle: React.CSSProperties | null =
        eventHandlersRef.current[STEP_PREPARE] && step === STEP_START
            ? { transition: 'none', ...style }
            : style

    return [status, step, mergedStyle, asyncVisible ?? visible]
}
