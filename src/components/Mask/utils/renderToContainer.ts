/**
 * @Author: bin
 * @Date: 2026-01-04 10:36:21
 * @LastEditors: bin
 * @LastEditTime: 2026-01-14 10:51:11
 */
import { type ReactElement, type ReactPortal } from 'react'
import { createPortal } from 'react-dom'

// SSR、RSC 安全
export const isBrowser = typeof window !== 'undefined'
export const canUseDom = !!(
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.document &&
    window.document.createElement
)

/**
 * @description 解析并获取挂载容器元素
 * @param getContainer
 * - HTMLElement：直接作为容器返回
 * - () => HTMLElement：返回函数执行结果作为容器
 * - undefined | null：返回 document.body
 * @returns { HTMLElement } 容器
 * @remarks
 * - 该方法 **仅适用于浏览器环境**
 * - 在 SSR / Server Components / Node 环境下调用将导致 `document is not defined`
 * - 请确保在客户端执行（如 useEffect、事件回调中）
 * @example resolveContainer(document.getElementById('root'))
 */
const resolveContainer = (getContainer?: HTMLElement | (() => HTMLElement) | null): HTMLElement => {
    const container =
        typeof getContainer === 'function'
            ? (getContainer as (() => HTMLElement))()
            : getContainer
    return container || document.body
}
/**
 * @description 将 React 元素渲染到指定容器中（基于 React Portal）
 * @param node 需要渲染的 React 元素
 * @param getContainer 参考 resolveContainer()
 * @returns
 * - 在浏览器环境下返回 ReactPortal
 * - 在 SSR / RSC / 非 DOM 环境下直接返回原 ReactElement
 * @remarks
 * - 该方法可直接在组件 render 中使用
 * @example
 * return renderToContainer(<Modal />, document.body)
 */
export const renderToContainer = (
    node: ReactElement,
    getContainer?: HTMLElement | (() => HTMLElement) | null,
): ReactElement | ReactPortal => {
    if (!canUseDom) return node

    const container = resolveContainer(getContainer)

    return createPortal(node, container)
}
