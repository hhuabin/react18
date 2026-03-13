import { useRef, useEffect } from 'react'
import { animationEndName, transitionEndName } from '../utils/motion'
import type { MotionEvent } from '../interface'

type MotionEndHandler = (event: MotionEvent) => void

/**
 * 为目标 DOM 节点绑定 transitionend / animationend 事件。
 * 自动处理节点切换时的旧监听器清理。
 */
export default function useDomMotionEvents(onMotionEnd: MotionEndHandler) {
    const elementRef = useRef<HTMLElement | null>(null)

    const removeMotionEvents = (element: HTMLElement | null) => {
        if (!element) return
        element.removeEventListener(transitionEndName, onMotionEnd as EventListener)
        element.removeEventListener(animationEndName, onMotionEnd as EventListener)
    }

    const patchMotionEvents = (element: HTMLElement | null) => {
        // 如果目标节点切换，先移除旧节点的监听
        if (elementRef.current && elementRef.current !== element) {
            removeMotionEvents(elementRef.current)
        }
        if (element && element !== elementRef.current) {
            element.addEventListener(transitionEndName, onMotionEnd as EventListener)
            element.addEventListener(animationEndName, onMotionEnd as EventListener)
            elementRef.current = element
        }
    }

    // 卸载时清理
    useEffect(() => {
        return () => removeMotionEvents(elementRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return [patchMotionEvents, removeMotionEvents] as const
}
