/**
 * @Author: bin
 * @Date: 2026-03-19 17:37:32
 * @LastEditors: bin
 * @LastEditTime: 2026-03-19 17:37:41
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const isDOM = (node: any): node is HTMLElement | SVGElement => {
    return node instanceof HTMLElement || node instanceof SVGElement
}

export const getDOM = (node: any): HTMLElement | SVGElement | null => {
    if (node && typeof node === 'object' && isDOM(node.nativeElement)) {
        return node.nativeElement
    }

    if (isDOM(node)) {
        return node as any
    }

    return null
}
