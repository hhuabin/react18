import { useRef, useEffect } from 'react'

type NextFrameCallback = (info: { isCanceled: () => boolean }) => void

/**
 * 封装 requestAnimationFrame，支持多帧延迟和取消。
 * delay=2 意味着等待两帧再执行，给浏览器足够时间应用样式（避免样式合并）。
 */
export default function useNextFrame() {
    const nextFrameIdRef = useRef<number | null>(null)

    function cancelNextFrame() {
        if (nextFrameIdRef.current !== null) {
            cancelAnimationFrame(nextFrameIdRef.current)
            nextFrameIdRef.current = null
        }
    }

    function nextFrame(callback: NextFrameCallback, delay = 2) {
        cancelNextFrame()
        const id = requestAnimationFrame(() => {
            if (delay <= 1) {
                callback({
                    isCanceled: () => id !== nextFrameIdRef.current,
                })
            } else {
                nextFrame(callback, delay - 1)
            }
        })
        nextFrameIdRef.current = id
    }

    useEffect(() => cancelNextFrame, [])

    return [nextFrame, cancelNextFrame] as const
}
