/**
 * @Author: bin
 * @Date: 2026-02-28 09:51:31
 * @LastEditors: bin
 * @LastEditTime: 2026-03-24 14:52:39
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// 最终 className = motionName + MotionStatus + MotionStep
// ========================== Status 动画类型 ==========================
// MotionStatus = 'none' | 'appear' | 'enter' | 'leave'
export const STATUS_NONE = 'none' as const
export const STATUS_APPEAR = 'appear' as const
export const STATUS_ENTER = 'enter' as const
export const STATUS_LEAVE = 'leave' as const

export type MotionStatus =
    | typeof STATUS_NONE             // 没有动画
    | typeof STATUS_APPEAR           // 组件首次挂载且 `visible=true`
    | typeof STATUS_ENTER            // 进入动画；已挂载，`visible` 从 `false` → `true`
    | typeof STATUS_LEAVE            // 离开动画；已挂载，`visible` 从 `true` → `false`

// =========================== Step 动画阶段 ===========================
// StepStatus = 'none' | 'prepare' | 'start' | 'active' | 'end'
export const STEP_NONE = 'none' as const
export const STEP_PREPARE = 'prepare' as const
export const STEP_START = 'start' as const
export const STEP_ACTIVE = 'active' as const
export const STEP_ACTIVATED = 'end' as const
// Skip motion only
export const STEP_PREPARED = 'prepared' as const

export type StepStatus =
    | typeof STEP_NONE
    | typeof STEP_PREPARE            // 准备阶段
    | typeof STEP_START              // 设置初始样式，强制 `transition: none`
    | typeof STEP_ACTIVE             // 触发 CSS transition / animation
    | typeof STEP_ACTIVATED          // 动画完成，回到 `none`
    | typeof STEP_PREPARED           // 禁用动画时，跳过 start/active 的快捷步骤


// ========================== Events ==========================
export type MotionEvent = (TransitionEvent | AnimationEvent) & {
    /** 由 motionDeadline 触发的超时事件标记 */
    deadline?: boolean
}

export type MotionPrepareEventHandler = (
    element: HTMLElement | null,
) => Promise<any> | void;

/** 动画阶段回调，可返回样式对象或 Promise（异步 prepare） */
export type MotionEventHandler = (
    element: HTMLElement | null,            // 触发动画的元素
    event: MotionEvent | null,       // 触发动画的 DOM 事件
) => React.CSSProperties | void

/** 动画结束回调，返回 false 可阻止结束 */
export type MotionEndEventHandler = (
    element: HTMLElement | null,
    event: MotionEvent,
) => boolean | void


export interface CSSMotionProps {
    motionName?: string;
    visible?: boolean;
    /** leave 结束后是否从 DOM 移除，默认 true */
    removeOnLeave?: boolean;
    motionAppear?: boolean;        // 首次挂载动画，默认 true
    motionEnter?: boolean;         // 进入动画
    motionLeave?: boolean;         // 离开动画

    /** 初始 visible=false 时也执行 leave 动画 */
    motionLeaveImmediately?: boolean;
    /** 动画超时时间（ms），超时后强制结束 */
    motionDeadline?: number;
    /** leave 后保留在 DOM 并添加此 className */
    leavedClassName?: string;
    /** 强制渲染（即使 visible=false 且未曾渲染过） */
    forceRender?: boolean;
    /** 透传给 children 的额外 props */
    eventProps?: Record<string, unknown>;

    // 准备阶段用于测量 element 信息。即使运动关闭，它也会始终触发
    onAppearPrepare?: MotionPrepareEventHandler;
    onAppearStart?: MotionEventHandler;
    onAppearActive?: MotionEventHandler;
    onAppearEnd?: MotionEndEventHandler;

    onEnterPrepare?: MotionPrepareEventHandler;
    onEnterStart?: MotionEventHandler;
    onEnterActive?: MotionEventHandler;
    onEnterEnd?: MotionEndEventHandler;

    onLeavePrepare?: MotionPrepareEventHandler;
    onLeaveStart?: MotionEventHandler;
    onLeaveActive?: MotionEventHandler;
    onLeaveEnd?: MotionEndEventHandler;

    onVisibleChanged?: (visible: boolean) => void;

    // 这就意味着，CSSMotion 的子元素只能是 render props
    children?: (
        props: {
            visible?: boolean;
            className?: string;
            style?: React.CSSProperties;
            [key: string]: any;
        },
        ref: React.Ref<any>,
    ) => React.ReactElement;
}
