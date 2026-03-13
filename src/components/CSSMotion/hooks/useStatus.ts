/* import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'

import {
    STATUS_NONE, STATUS_APPEAR, STATUS_ENTER, STATUS_LEAVE,
    STEP_PREPARE, STEP_START, STEP_ACTIVE,
    type MotionStatus, type MotionStep, type CSSMotionProps, type MotionEvent,
} from '../interface.d'

type UseStatusReturn = [
    status: MotionStatus,
    step: MotionStep,
    style: React.CSSProperties | null,
    mergedVisible: boolean,
]

export default function useStatus(
    supportMotion: boolean,
    visible: boolean,
    getElement: () => HTMLElement | null,
    props: CSSMotionProps,
): UseStatusReturn {

    // asyncVisible 用于"渲染可见性"，滞后于 visible 直到动画结束
    const [asyncVisible, setAsyncVisible] = useState<boolean | undefined>(undefined)

    // status ref 供事件回调同步读取（避免闭包旧值）
    const statusRef = useRef<MotionStatus>(STATUS_NONE)
    const [status, _setStatus] = useState<MotionStatus>(STATUS_NONE)
    const setStatus = (next: MotionStatus) => {
        statusRef.current = next
        _setStatus(next)
    }

    // return [status, step, mergedStyle, asyncVisible ?? visible]
}
 */
