import type React from 'react'

// ========================== Status ==========================
export const STATUS_NONE = 'none' as const
export const STATUS_APPEAR = 'appear' as const
export const STATUS_ENTER = 'enter' as const
export const STATUS_LEAVE = 'leave' as const

export type MotionStatus =
    | typeof STATUS_NONE
    | typeof STATUS_APPEAR
    | typeof STATUS_ENTER
    | typeof STATUS_LEAVE

// =========================== Step ===========================
export const STEP_NONE = 'none' as const
export const STEP_PREPARE = 'prepare' as const
export const STEP_START = 'start' as const
export const STEP_ACTIVE = 'active' as const
export const STEP_ACTIVATED = 'end' as const
/** 禁用动画时使用，跳过 start & active 阶段 */
export const STEP_PREPARED = 'prepared' as const

export type MotionStep =
    | typeof STEP_NONE
    | typeof STEP_PREPARE
    | typeof STEP_START
    | typeof STEP_ACTIVE
    | typeof STEP_ACTIVATED
    | typeof STEP_PREPARED

// ========================== Events ==========================
export type MotionEvent = (TransitionEvent | AnimationEvent) & {
    /** 由 motionDeadline 触发的超时事件标记 */
    deadline?: boolean
}

/** 动画阶段回调，可返回样式对象或 Promise（异步 prepare） */
export type MotionEventHandler = (
    element: HTMLElement,
    event: MotionEvent | null,
) => React.CSSProperties | void | Promise<void>

/** 动画结束回调，返回 false 可阻止结束 */
export type MotionEndEventHandler = (
    element: HTMLElement,
    event: MotionEvent,
) => boolean | void

// ========================== Props ==========================
export interface CSSMotionProps {
    visible?: boolean
    /** CSS 类名前缀，如 "fade" → "fade-appear" / "fade-appear-active" 等 */
    motionName?: string | Partial<Record<string, string>>
    motionAppear?: boolean
    motionEnter?: boolean
    motionLeave?: boolean
    /** 初始 visible=false 时也执行 leave 动画 */
    motionLeaveImmediately?: boolean
    /** 动画超时时间（ms），超时后强制结束 */
    motionDeadline?: number
    /** leave 结束后是否从 DOM 移除，默认 true */
    removeOnLeave?: boolean
    /** leave 后保留在 DOM 并添加此 className */
    leavedClassName?: string
    /** 强制渲染（即使 visible=false 且未曾渲染过） */
    forceRender?: boolean
    /** 透传给 children 的额外 props */
    eventProps?: Record<string, unknown>

    onAppearPrepare?: MotionEventHandler
    onEnterPrepare?: MotionEventHandler
    onLeavePrepare?: MotionEventHandler

    onAppearStart?: MotionEventHandler
    onEnterStart?: MotionEventHandler
    onLeaveStart?: MotionEventHandler

    onAppearActive?: MotionEventHandler
    onEnterActive?: MotionEventHandler
    onLeaveActive?: MotionEventHandler

    onAppearEnd?: MotionEndEventHandler
    onEnterEnd?: MotionEndEventHandler
    onLeaveEnd?: MotionEndEventHandler

    onVisibleChanged?: (visible: boolean) => void

    /**
     * render prop 模式。children 接收运动期间的 className/style，
     * 以及 ref 回调用于绑定目标 DOM 节点。
     */
    children?: (
        props: {
            className?: string
            style?: React.CSSProperties
            visible?: boolean
            [key: string]: unknown
        },
        ref: React.Ref<HTMLElement>,
    ) => React.ReactElement | null
}
