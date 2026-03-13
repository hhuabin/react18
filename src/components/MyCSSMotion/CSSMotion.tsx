import React, { useRef, useCallback, forwardRef, useImperativeHandle, type ForwardedRef } from 'react'
import classNames from 'classnames'
import {
    STATUS_NONE,
    STEP_PREPARE, STEP_START,
    type CSSMotionProps,
} from './interface'
import { supportTransition, getTransitionName } from './utils/motion'
import useStatus from './hooks/useStatus'
import { isActive } from './hooks/useStepQueue'

export type { CSSMotionProps, MotionStatus, MotionStep, MotionEventHandler, MotionEndEventHandler } from './interface'

export interface CSSMotionRef {
    /** 绑定的目标 DOM 节点 */
    nativeElement: HTMLElement | null
    /** 是否正在动画中 */
    inMotion: () => boolean
    /** 是否支持（启用）动画 */
    enableMotion: () => boolean
}

/**
 * CSSMotion — CSS 动画状态机组件
 *
 * 仿照 rc-motion 实现，通过 visible 属性驱动三阶段动画：
 *   appear（首次出现）→ enter（再次显示）→ leave（隐藏）
 *
 * 每个阶段内依次执行四个步骤：prepare → start → active → end
 * 对应 CSS 类名后缀：`-prepare` / `-start` / `-active`（end 无后缀）
 *
 * ## 用法
 * ```tsx
 * <CSSMotion visible={open} motionName="fade" removeOnLeave>
 *   {({ className, style }, ref) => (
 *     <div className={className} style={style} ref={ref}>
 *       内容
 *     </div>
 *   )}
 * </CSSMotion>
 * ```
 *
 * 配合 CSS：
 * ```css
 * .fade-appear, .fade-enter { opacity: 0; }
 * .fade-appear-active, .fade-enter-active { opacity: 1; transition: opacity 300ms; }
 * .fade-leave { opacity: 1; }
 * .fade-leave-active { opacity: 0; transition: opacity 300ms; }
 * ```
 */
// eslint-disable-next-line prefer-arrow-callback
const CSSMotion = forwardRef(function CSSMotion(
    props: CSSMotionProps,
    ref: ForwardedRef<CSSMotionRef>,
) {
    const {
        visible = true,
        removeOnLeave = true,
        forceRender,
        children,
        motionName,
        leavedClassName,
        eventProps,
    } = props

    const supportMotion = !!(motionName && supportTransition)

    // 目标 DOM 节点引用
    const nodeRef = useRef<HTMLElement | null>(null)

    function getDomElement() {
        return nodeRef.current
    }

    const [status, statusStep, statusStyle, mergedVisible] = useStatus(
        supportMotion,
        visible,
        getDomElement,
        props,
    )

    // 记录是否曾经渲染过（用于 removeOnLeave=false 时的决策）
    const renderedRef = useRef(mergedVisible)
    if (mergedVisible) renderedRef.current = true

    // ─── ref 回调：同时绑定内部 nodeRef 和外部 ref ─────────────
    const setNodeRef = useCallback(
        (node: HTMLElement | null) => {
            nodeRef.current = node
            if (typeof ref === 'function') {
                ref({ nativeElement: node, inMotion: () => status !== STATUS_NONE, enableMotion: () => supportMotion } as CSSMotionRef)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref],
    )

    useImperativeHandle(
        ref,
        () => ({
            nativeElement: nodeRef.current,
            inMotion: () => status !== STATUS_NONE,
            enableMotion: () => supportMotion,
        }),
        [status, supportMotion],
    )

    // ─── 渲染决策 ────────────────────────────────────────────
    let motionChildren: React.ReactElement | null = null
    const mergedProps = { ...eventProps, visible }

    if (!children) {
        motionChildren = null
    } else if (status === STATUS_NONE) {
        // 静止阶段（无动画进行）
        if (mergedVisible) {
            // 正常可见
            motionChildren = children(mergedProps, setNodeRef as React.Ref<HTMLElement>)
        } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
            // 保留在 DOM，添加 leavedClassName
            motionChildren = children({ ...mergedProps, className: leavedClassName }, setNodeRef as React.Ref<HTMLElement>)
        } else if (forceRender || (!removeOnLeave && !leavedClassName)) {
            // 强制渲染或不移除，用 display:none 隐藏
            motionChildren = children({ ...mergedProps, style: { display: 'none' } }, setNodeRef as React.Ref<HTMLElement>)
        } else {
            motionChildren = null
        }
    } else {
        // 动画进行中：计算当前步骤对应的 className 后缀
        let statusSuffix: string | undefined
        if (statusStep === STEP_PREPARE) {
            statusSuffix = 'prepare'
        } else if (isActive(statusStep)) {
            statusSuffix = 'active'
        } else if (statusStep === STEP_START) {
            statusSuffix = 'start'
        }

        // e.g. "fade-appear-active"
        const motionCls = getTransitionName(motionName, `${status}-${statusSuffix}`)
        // e.g. "fade-appear"
        const baseCls  = getTransitionName(motionName, status)

        const mergedClassName = classNames(
            baseCls,
            motionCls && statusSuffix ? motionCls : undefined,
            // 当 motionName 为字符串时额外附加 motionName 本身（antd 约定）
            typeof motionName === 'string' ? motionName : undefined,
        )

        motionChildren = children(
            { ...mergedProps, className: mergedClassName, style: statusStyle ?? undefined },
            setNodeRef as React.Ref<HTMLElement>,
        )
    }

    return <>{motionChildren}</>
})

CSSMotion.displayName = 'CSSMotion'

export default CSSMotion
