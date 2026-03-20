/**
 * @Author: bin
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: bin
 * @LastEditTime: 2026-03-16 16:05:27
 */
import { useRef, useEffect } from 'react'

/**
 * @description 封装 requestAnimationFrame，实现“延迟 N 帧执行 + 可取消”的调度工具
 * delay=2 意味着等待两帧再执行，给浏览器足够时间应用样式（避免样式合并）
 *
 * 如果在同一帧添加两个样式 1. add class start 2. add class active，浏览器会合并样式为 active
 * 需要实现 跨多帧更新 DOM class，否则浏览器会把样式合并，导致 CSS transition 不触发
 *
 * @returns [nextFrame, cancelNextFrame]
 * @example
 * nextFrame(({ isCanceled }) => {
        if (isCanceled()) return       // 当 nextFrameId 被取消时，不执行逻辑
    })
 */
export default function useNextFrame() {
    const nextFrameIdRef = useRef<number | null>(null)

    const cancelNextFrame = () => {
        if (nextFrameIdRef.current !== null) {
            cancelAnimationFrame(nextFrameIdRef.current)
            nextFrameIdRef.current = null
        }
    }

    const nextFrame = (
        callback: (info: { isCanceled: () => boolean }) => void,
        delay = 2,
    ) => {
        cancelNextFrame()

        const nextFrameId = requestAnimationFrame(() => {
            if (delay <= 1) {
                callback({
                    isCanceled: () => nextFrameId !== nextFrameIdRef.current,
                })
            } else {
                nextFrame(callback, delay - 1)
            }
        })
        nextFrameIdRef.current = nextFrameId
    }

    useEffect(() => cancelNextFrame, [])

    return [nextFrame, cancelNextFrame] as const
}
