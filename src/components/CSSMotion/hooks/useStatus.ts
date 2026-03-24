/**
 * @Author: bin
 * @Date: 2026-02-28 09:50:08
 * @LastEditors: bin
 * @LastEditTime: 2026-03-24 15:46:39
 */
/* eslint-disable max-lines */
import { useState, useRef, useEffect, useMemo } from 'react'

import {
    STATUS_NONE, STATUS_APPEAR, STATUS_ENTER, STATUS_LEAVE,
    STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_PREPARED,
    type MotionStatus, type StepStatus, type CSSMotionProps,
    type MotionEvent, type MotionPrepareEventHandler, type MotionEventHandler,
} from '../interface'

import useStepQueue, { DoStep, isActive, SkipStep } from './useStepQueue'
import useDomMotionEvents from './useDomMotionEvents'

import { useSyncState, useEvent } from '@/hooks/reactHooks'
import { useInternalLayoutEffect } from '@/hooks/reactHooks/useLayoutUpdateEffect'

// `useStatus` 负责“现在动画进行到哪一步了”

/**
 * @description 核心动画状态机
 * 动画不是一瞬间完成，而是有“队列步骤”的状态机，保证 DOM 和 CSS 都准备好才触发动画
 * 1. 根据 `visible` 的变化，决定当前应该进入哪一种 motion 状态：`appear` / `enter` / `leave` / `none`
 * 2. 通过分步队列推进动画阶段：`prepare -> start -> active -> end`
 * 3. 调用外部传入的生命周期回调，比如 `onEnterPrepare`、`onLeaveActive`、`onAppearEnd`
 * 4. 监听 DOM 的 `transitionend` / `animationend`，在动画完成后收尾
 * 5. 返回当前渲染所需要的信息给 `CSSMotion`：状态、步骤、样式、可见性、样式是否准备好
 * PREPARE：调用 onAppearPrepare / onEnterPrepare / onLeavePrepare，可以返回 style 或 SkipStep（跳过 prepare）
 * START：设置初始样式（transition: none + 自定义样式），让浏览器准备好 transition
 * ACTIVE：添加 transition / animation，Patch 事件监听 transitionend / animationend；如果设置 motionDeadline，在超时后强制调用 onInternalMotionEnd
 * PREPARED：动画结束，清理 style 和 status
 * @param supportMotion 表示当前环境和配置是否真的支持动画；如 浏览器不支持 transition/animation
 * @param visible 当前目标可见状态；`false -> true` 可能触发 `appear` 或 `enter`；`true -> false` 可能触发 `leave`
 * @param getElement 返回真实 DOM 元素；绑定 / 解绑 transitionend 和 animationend 事件，如果无法获取则无法绑定事件，导致 updateMotionEndStatus() 无法执行，动画一直处于 active 状态
 * @param { CSSMotionProps } props 里面包含各种 motion 配置和回调
 * @returns [status, step, style, visible, styleReady] 当前渲染所需要的信息 [状态, 步骤, 当前步骤计算出来的 style, 可见性, 样式是否准备好]
 */
export default function useStatus(
    supportMotion: boolean,
    visible: boolean,
    getElement: () => HTMLElement | null,
    props: CSSMotionProps,
): [
    status: () => MotionStatus,
    stepStatus: StepStatus,
    style: React.CSSProperties | null,
    visible: boolean,
    styleReady: 'NONE' | boolean,
] {

    const {
        motionAppear = true,        // 首次渲染时是否播放动画
        motionEnter = true,         // 后续显示时是否播放动画
        motionLeave = true,         // 隐藏时是否播放动画
        motionDeadline,             // 动画超时时间
        motionLeaveImmediately,     // 初始 visible=false 时也执行 leave 动画
        onAppearPrepare, onAppearStart, onAppearActive, onAppearEnd,
        onEnterPrepare, onEnterStart, onEnterActive, onEnterEnd,
        onLeavePrepare, onLeaveStart, onLeaveActive, onLeaveEnd,
        onVisibleChanged,
    } = props

    // asyncVisible 用于"渲染可见性"，外部要隐藏了，不代表 DOM 立刻消失，可以先继续保留节点，把 leave 动画跑完
    const [asyncVisible, setAsyncVisible] = useState<boolean | undefined>(undefined)

    const [getStatus, setStatus] = useSyncState<MotionStatus>(STATUS_NONE)
    const currentStatus = getStatus()                    // // 获取当前动画状态（'none' | 'appear' | 'enter' | 'leave'）

    // 每个步骤返回的内联样式（可能有 transition/transform 等）
    const [style, setStyle] = useState<[
        style: React.CSSProperties | null,               // 记录每个步骤（step）的 用户传入 的内联样式
        step: StepStatus | null,                         // 记录产生样式的 step，被赋值会比 useStepQueue 的 step 稍慢两帧
    ]>([null, null])

    const mountedRef = useRef(false)                     // 标记组件是否已经挂载过；用来区分 `appear` 和 `enter`
    const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null)     // 保存 `motionDeadline` 的定时器，超时后会强制执行 onInternalMotionEnd 事件

    // 判定 step === 'active' | step === 'end'
    const activeRef = useRef(false)                      // 示当前是否处于“动画真正激活”的阶段

    // ======== 动画结束后的统一收尾，只要动画真正结束，都会尽量走到这里 ==========
    const updateMotionEndStatus = () => {
        setStatus(STATUS_NONE)       // 把 motion 状态重置为 `none`
        setStyle([null, null])       // 清空当前步骤样式
    }

    /**
     * @description transitionend / animationend 动画结束处理器。在动画完成后收尾执行的函数
     * 1. 使用 useEvent 保证回调稳定，才可以取消监听
     * 2. 执行 updateMotionEndStatus()
     * @param { (TransitionEvent | AnimationEvent) & { deadline?: boolean } } event DOM 的 transitionend / animationend 事件
     */
    const onInternalMotionEnd = useEvent((event: MotionEvent) => {
        const status = getStatus()

        // 如果本来就不在动画中，直接忽略
        if (status === STATUS_NONE) return

        const element = getElement()
        /**
         * 1. 过滤冒泡上来的子元素动画结束事件
         * 2. event.deadline = true(由 motionDeadline 超时触发) 时强制继续执行函数
         */
        if (event && !event.deadline && event.target !== element) return

        // 只有 active (step === ('active' | 'end')) 阶段，才认为可以检查动画是否结束
        if (!activeRef.current) return

        let canEnd: boolean | void = undefined
        // 调用对应的 `onAppearEnd / onEnterEnd / onLeaveEnd`
        if (status === STATUS_APPEAR) {
            canEnd = onAppearEnd?.(element, event)
        } else if (status === STATUS_ENTER) {
            canEnd = onEnterEnd?.(element, event)
        } else if (status === STATUS_LEAVE) {
            canEnd = onLeaveEnd?.(element, event)
        }
        // 如果用户的 `onXxxEnd` 明确返回 `false`，本次动画不会结束
        if (canEnd !== false) {
            updateMotionEndStatus()
        }
    })

    // ========== 获取注册 transitionend / animationend 的事件 ===========
    const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd)

    // ========== 按 status 取对应回调组 ===========
    const getEventHandlers = (targetStatus: MotionStatus): {
        [STEP_PREPARE]?: MotionPrepareEventHandler;        // prepare 事件
        [STEP_START]?: MotionEventHandler;                 // start 事件
        [STEP_ACTIVE]?: MotionEventHandler;                // active 事件
    } => {
        switch (targetStatus) {
            // appear
            case STATUS_APPEAR:
                return { [STEP_PREPARE]: onAppearPrepare, [STEP_START]: onAppearStart, [STEP_ACTIVE]: onAppearActive }
            // enter
            case STATUS_ENTER:
                return { [STEP_PREPARE]: onEnterPrepare, [STEP_START]: onEnterStart, [STEP_ACTIVE]: onEnterActive }
            // leave
            case STATUS_LEAVE:
                return { [STEP_PREPARE]: onLeavePrepare, [STEP_START]: onLeaveStart, [STEP_ACTIVE]: onLeaveActive }
            // none
            default:
                return {}
        }
    }

    // =============== 步骤队列 ===============
    const eventHandlers = useMemo<{
        [STEP_PREPARE]?: MotionPrepareEventHandler;
        [STEP_START]?: MotionEventHandler;
        [STEP_ACTIVE]?: MotionEventHandler;
    }>(
        () => getEventHandlers(currentStatus),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentStatus],
    )

    const [startStep, step] = useStepQueue(
        currentStatus,
        !supportMotion,
        newStep => {
            // 如果当前状态没有 prepare 回调，直接跳过 prepare；只有准备步骤可以跳过
            if (newStep === STEP_PREPARE) {
                const onPrepare = eventHandlers[STEP_PREPARE]
                if (!onPrepare) return SkipStep

                return onPrepare(getElement())
            }

            if (newStep in eventHandlers) {
                // STEP_START / STEP_ACTIVE
                const handler = eventHandlers[newStep as typeof STEP_START | typeof STEP_ACTIVE]
                /**
                 * @description 从传入函数获取内联样式；如果回调返回 style，就保存下来
                 * 这里的 style 一般会被 `CSSMotion` 传给子元素作为内联样式
                 * 注意：这里 setStyle() 的 newStep 是 useStepQueue 传过来的，也就说 useStepQueue 的 step 会比 style[1](useStatue的step) 状态变化更快
                 * 这就导致了 newStep 和 MotionEventHandler 返回的样式，并不是同步的，也就催生出了 useStatus hooks 的第五个返回值 styleReady
                 */
                setStyle([
                    handler?.(getElement(), null) || null,
                    newStep,
                ])
            }

            /**
             * @description 进入 `STEP_ACTIVE` 时做两件大事
             * 1. 绑定 transition / animation 事件
             * 2. 启动 deadline 兜底计时器
             */
            if (newStep === STEP_ACTIVE && currentStatus !== STATUS_NONE) {
                // 1. 等动画真正进入 active 阶段后再开始监听 transitionend/animationend
                patchMotionEvents(getElement())
                // 2. 超时兜底
                if (motionDeadline && motionDeadline > 0) {
                    if (deadlineRef.current) clearTimeout(deadlineRef.current)
                    // 当动画超时（deadline）时触发 onInternalMotionEnd
                    deadlineRef.current = setTimeout(() => {
                        onInternalMotionEnd({ deadline: true } as MotionEvent)
                    }, motionDeadline)
                }
            }
            // 无 motion 时的快速结束；这只会在简化队列下出现
            if (newStep === STEP_PREPARED) {
                updateMotionEndStatus()
            }
            // 正常推进到下一步
            return DoStep
        },
    )

    // 避免获取闭包旧值
    activeRef.current = isActive(step)

    // ============================ Status ============================
    const visibleRef = useRef<boolean | null>(null)

    // 监听 visible 改变
    useInternalLayoutEffect(() => {
        // 使用 Suspense 时，`visible` 会重复触发；但不是`visible`的真正变化，我们需要跳过它
        if (mountedRef.current && visibleRef.current === visible) return

        setAsyncVisible(visible)

        const isMounted = mountedRef.current
        mountedRef.current = true

        let nextStatus: MotionStatus | undefined = undefined

        // Appear：首次挂载、初始可见、允许 appear -> 走 appear
        if (!isMounted && visible && motionAppear) {
            nextStatus = STATUS_APPEAR
        }

        // Enter：非首次挂载、切换到可见、允许 enter -> 走 enter
        if (isMounted && visible && motionEnter) {
            nextStatus = STATUS_ENTER
        }

        /**
         * Leave
         * 1. 正常更新导致隐藏
         * 2. 首次挂载时本来就是隐藏，但要求 `motionLeaveImmediately` -> 这种要求闻所未闻
         */
        if (
            (isMounted && !visible && motionLeave) ||
            (!isMounted && motionLeaveImmediately && !visible && motionLeave)
        ) {
            nextStatus = STATUS_LEAVE
        }

        const nextEventHandlers = nextStatus ? getEventHandlers(nextStatus) : {}

        // 决定是否真正启动 motion
        // Update to next status
        if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
            setStatus(nextStatus)
            // 进入 step 队列
            startStep()
        } else {
            // Set back in case no motion but prev status has prepare step
            setStatus(STATUS_NONE)
        }

        // 最后再记录本次 visible
        visibleRef.current = visible
    }, [visible])

    // ============================ Effect ============================
    // 动画开关变化时取消进行中的动画
    useEffect(() => () => {
        // 如 motionAppear 是 STATUS_APPEAR 的开关
        if (
            // Cancel appear
            (currentStatus === STATUS_APPEAR && !motionAppear) ||
            // Cancel enter
            (currentStatus === STATUS_ENTER && !motionEnter) ||
            // Cancel leave
            (currentStatus === STATUS_LEAVE && !motionLeave)
        ) {
            setStatus(STATUS_NONE)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motionAppear, motionEnter, motionLeave])

    // =================== 卸载清理 ===================
    useEffect(() => () => {
        mountedRef.current = false
        if (deadlineRef.current) clearTimeout(deadlineRef.current)
    }, [motionAppear, motionEnter, motionLeave])

    // =========== 触发 onVisibleChanged ================
    const firstMountChangeRef = useRef(false)
    useEffect(() => {
        if (asyncVisible) firstMountChangeRef.current = true

        // 只有当最终状态稳定下来（currentStatus === STATUS_NONE）时，再通知外部 visible 已真正变化
        if (asyncVisible !== undefined && currentStatus === STATUS_NONE) {
            // 跳过首次 invisible 的无意义通知
            if (firstMountChangeRef.current || asyncVisible) {
                onVisibleChanged?.(asyncVisible)
            }
            firstMountChangeRef.current = true
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asyncVisible, currentStatus])


    // 合并样式：prepare 阶段禁用 transition，防止从初始值跳变
    const mergedStyle: React.CSSProperties | null =
        eventHandlers[STEP_PREPARE] && step === STEP_START
            ? { transition: 'none', ...style[0] }
            : style[0]

    /**
     * 1. 首次挂载前的特殊返回 'NONE'
     * 2. step 处于 `start` 或 `active`，返回当前 style 是在当前 style[1](step) 生成的，才算 ready
     * 3. 其他阶段返回 true
     */
    const styleReady =
        !mountedRef.current && currentStatus === STATUS_NONE && supportMotion && motionAppear
            ? 'NONE'                           // 首次 `appear` 前，先不要渲染内容，避免首帧闪烁
            : step === STEP_START || step === STEP_ACTIVE
                ? style[1] === step            // style[1] 是 useStatus 的 step，这个 step 被赋值会比 useStepQueue 中的更慢
                : true

    return [
        getStatus,
        step,                        // 当前 step 阶段，用于拼接 CSS class 后缀
        mergedStyle,                 // 当前步骤计算出来的 style，会作为子节点的内联样式传出去
        asyncVisible ?? visible,     // 给渲染层使用的“合并后 visible”
        styleReady,                  // 保证 style 已经和当前 step(style[1]) 同步”之后，才允许渲染 children
    ]
}
