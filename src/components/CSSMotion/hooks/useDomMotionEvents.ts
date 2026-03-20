/**
 * @Author: bin
 * @Date: 2026-03-19 09:56:17
 * @LastEditors: bin
 * @LastEditTime: 2026-03-19 10:31:22
 */
import { useRef, useEffect } from 'react'

import type { MotionEvent } from '../interface'

/**
 * @description 添加 dom 节点的 transitionend/animationend 事件
 * @param onInternalMotionEnd 节点 transitionend/animationend 事件回调
 */
export default function useDomMotionEvents(
    onInternalMotionEnd: (event: MotionEvent) => void,
): [(element: HTMLElement) => void, (element: HTMLElement) => void] {
    const cacheElementRef = useRef<HTMLElement | null>(null)

    // Remove events
    const removeMotionEvents = (element: HTMLElement | null) => {
        if (!element) return

        /**
         * 不同浏览器的 transitionEndName 名称不同，比如老版的 IE
         * 这里省略了获取 transitionEndName 的步骤，有需要可以看看utils/motion.ts
         */
        // element.removeEventListener(transitionEndName, onInternalMotionEnd)
        // element.removeEventListener(animationEndName, onInternalMotionEnd)

        element.removeEventListener('animationend', onInternalMotionEnd)
        element.removeEventListener('transitionend', onInternalMotionEnd)
    }

    // Patch events
    const patchMotionEvents = (element: HTMLElement | null) => {
        // 如果目标节点切换，先移除旧节点的监听
        if (cacheElementRef.current && cacheElementRef.current !== element) {
            removeMotionEvents(cacheElementRef.current)
        }

        if (element && element !== cacheElementRef.current) {
            element.addEventListener('animationend', onInternalMotionEnd)
            element.addEventListener('transitionend', onInternalMotionEnd)

            // Save as cache in case dom removed trigger by `motionDeadline`
            cacheElementRef.current = element
        }
    }

    // 卸载时清理
    useEffect(
        () => () => {
            removeMotionEvents(cacheElementRef.current)
            cacheElementRef.current = null
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    return [patchMotionEvents, removeMotionEvents]
}
