/**
 * @Author: bin
 * @Date: 2025-06-30 16:24:04
 * @LastEditors: bin
 * @LastEditTime: 2026-02-11 16:13:38
 */
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

// eslint-disable-next-line react-refresh/only-export-components
const MARK = '__rc_react_root__'

type ContainerType = (Element | DocumentFragment) & {
    [MARK]?: Root;
}

export type UnmountType = () => Promise<void>
export type RenderType = (
    node: React.ReactElement,
    container: Element | DocumentFragment,
) => UnmountType

/**
 * @descCN React 18 的 render 方法
 * @param { React.ReactElement } node
 * @param { ContainerType } container
 * @returns
 */
export const render = (node: React.ReactElement, container: ContainerType) => {
    const root = container[MARK] || createRoot(container)

    root.render(<StrictMode>{node}</StrictMode>)
    // root.render(node)

    container[MARK] = root
}

export const unmount = async (container: ContainerType) => {
    // Delay to unmount to avoid React 18 sync warning
    return Promise.resolve().then(() => {
        container[MARK]?.unmount()

        delete container[MARK]
    })
}

export const defaultReactRender: RenderType = (node: React.ReactElement, container: Element | DocumentFragment) => {
    render(node, container)

    return () => unmount(container)
}

let unstableRender: RenderType = defaultReactRender

/**
 * @description 渲染函数
 */
export const unstableSetRender = (render?: RenderType) => {
    if (render) {
        unstableRender = render
    }
    return unstableRender
}

/**
 * @description 渲染到body
 */
export const renderToBody = (element: React.ReactElement) => {
    const container = document.createDocumentFragment()
    document.body.appendChild(container)

    const unmountReact = unstableSetRender()(element, container)

    return async () => {
        await unmountReact()
        // 卸载后，删除容器
        container.parentNode?.removeChild(container)
    }
}
