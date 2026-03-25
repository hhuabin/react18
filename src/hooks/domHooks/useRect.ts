/**
 * @Author: bin
 * @Date: 2026-01-06 15:51:37
 * @LastEditors: bin
 * @LastEditTime: 2026-03-25 17:53:07
 */
import { useLayoutEffect, useState, type RefObject } from 'react'

export interface Rect {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
}

/**
 * 空 Rect，用于初始化及 ref 尚未挂载时兜底
 */
const EMPTY_RECT: Rect = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
}

/**
 * @description 获取 元素相对于**浏览器可视区域（viewport）**的位置
 * 注意：只能在 DOM 已挂载后调用
 * @example
 * const rect = getRect(ref.current) => 一次性获取，不监听元素变化
 */
export const getRect = (el: HTMLElement | null): Rect => {
    if (!el) return EMPTY_RECT

    const rect = el.getBoundingClientRect()
    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
    }
}

/**
 * @description useRect 用于监听元素尺寸和位置信息的变化（基于 ResizeObserver）
 * 设计约束：
 * - useRect 能不能拿到正确尺寸，取决于：该元素的尺寸是否能在 CSS 布局中被“确定地计算出来”
 * - 只接受 React RefObject，不接受直接传入的 DOM
 * - 保证 DOM 生命周期完全由 React 管理
 * - 避免因 DOM 查询或并发渲染导致的潜在问题
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null)
 * const rect = useRect(ref)
 * return <div ref={ref} />
 * ```
 */
export default function useRect(ref: RefObject<HTMLElement>): Rect {
    const [rect, setRect] = useState<Rect>(() => getRect(ref.current))

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        const updateRect = () => {
            setRect(getRect(el))
        }
        // 初始化同步一次，避免首次为 0
        updateRect()

        /**
         * @description 使用 ResizeObserver 监听元素尺寸变化
         * - 能感知 width / height 的变化
         * - 比 window.resize 更精确
         * - 不依赖全局事件
         */
        const observer = new ResizeObserver(updateRect)
        observer.observe(el)

        return () => {
            observer.disconnect()
        }
    }, [ref])

    return rect
}
