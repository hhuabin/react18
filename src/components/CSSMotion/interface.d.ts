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

