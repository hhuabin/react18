/**
 * @Author: bin
 * @Date: 2024-12-03 16:32:40
 * @LastEditors: bin
 * @LastEditTime: 2026-01-12 11:28:19
 */
import { useCallback, useEffect, useLayoutEffect } from 'react'

import { useDebounce } from '@/hooks/utils/useDebounceThrottle'

/**
 * 监听浏览器窗口变化，实现自适应（大屏使用）
 * @param { number } designWidth 设计稿宽度
 * @param { number } designHeight 设计稿高度
 * @param { string } renderDom 需要挂载的元素（注意不能挂载在根html上，移动端可能会出现适配问题）
 */
export default function useScreenScale(designWidth = 1920, designHeight = 1080, renderDOM = '#root') {

    /**
     * @description 更新 html 元素大小样式
     */
    const htmlResize = useCallback(() => {
        const htmlElement = document.documentElement      // html元素
        const htmlClientWidth = htmlElement.clientWidth
        const htmlClientHeight = htmlElement.clientHeight
        console.group('clientSize')
        console.log('浏览器可视窗口宽度', htmlElement.clientWidth)
        console.log('浏览器可视窗口高度', htmlElement.clientHeight)
        console.groupEnd()

        // 获取挂载元素
        const renderDomElement = document.querySelector(renderDOM)

        let renderDOMWith = designWidth      // 定义元素的最终宽
        let renderDOMHeight = designHeight   // 定义元素的最终高
        let scale = htmlClientWidth / designWidth

        if (htmlClientWidth / htmlClientHeight < designWidth / designHeight) {
            // 确定放大倍数
            scale = htmlClientWidth / designWidth
            // 宽高比 较小，需要以最小的为基准进行缩放。以宽度为基准，计算高度进行缩放
            renderDOMHeight = designHeight * (htmlClientHeight / designHeight / scale)
        } else if (htmlClientWidth / htmlClientHeight > designWidth / designHeight) {
            // 确定放大倍数
            scale = htmlClientHeight / designHeight
            // 宽高比 较大，需要以最小的为基准进行缩放。以高度为基准，计算宽度进行缩放
            renderDOMWith = designWidth * (htmlClientWidth / designWidth / scale)
        }

        // eslint-disable-next-line no-extra-semi
        ;(renderDomElement as HTMLElement).style.width = `${renderDOMWith}px`
        ;(renderDomElement as HTMLElement).style.height = `${renderDOMHeight}px`

        ;(renderDomElement as HTMLElement).style.transform = `scale(${scale})`
        ;(renderDomElement as HTMLElement).style.transformOrigin = '0 0'
        ;(renderDomElement as HTMLElement).style.overflow = 'hidden'
        htmlElement.style.overflow = 'hidden'
        // document.body.style.overflow = 'hidden'
        // document.body.style.scrollbarWidth = 'none'
    }, [designHeight, designWidth, renderDOM])

    const [listenerFunction] = useDebounce(() => {
        htmlResize()
    }, 50)

    useLayoutEffect(() => {
        htmlResize()
    }, [htmlResize])

    useEffect(() => {
        window.addEventListener('resize', listenerFunction)
        return () => {
            window.removeEventListener('resize', listenerFunction)
        }
    }, [listenerFunction])
}
