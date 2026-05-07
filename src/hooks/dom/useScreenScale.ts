/**
 * @Author: bin
 * @Date: 2024-12-03 16:32:40
 * @LastEditors: bin
 * @LastEditTime: 2026-04-27 17:05:33
 */
import { useCallback, useEffect, useLayoutEffect } from 'react'

import { useDebounce } from '@/hooks/utils/useDebounceThrottle'

/**
 * @description 监听浏览器窗口变化，实现大屏等比缩放适配
 * @param { number } designWidth 设计稿宽度
 * @param { number } designHeight 设计稿高度
 * @param { string } renderDom 需要挂载的元素（注意不能挂载在根html上，移动端可能会出现适配问题）
 * 设计理念：-> 等比例缩放页面；剩余高度由元素间隔撑开，不改边元素本身的比例，不会造成正方形变成长方形的bug
 * 1. 这不是常规响应式布局 hook，而是“大屏/驾驶舱”场景下的固定画布缩放方案。
 * 2. 业务内容始终按 designWidth/designHeight 这套设计坐标开发，外层容器再通过 scale 做等比缩放。
 * 3. 缩放时优先使用“短边”作为基准，保证内容不会被裁切；剩余的长边空间通过放大容器逻辑尺寸来填满。
 *    这样做的结果是：视觉上始终铺满当前视口，同时内部布局仍然可以沿用设计稿坐标系。
 * 4. 首次渲染使用 useLayoutEffect，避免页面先以错误尺寸闪一下；resize 再通过防抖降低频繁重排成本。
 * 5. 直接写 DOM style，而不是通过 React state 驱动，是因为这里本质是一次性的视口适配副作用，
 *    不需要把缩放过程再走一轮组件渲染。
 */
export default function useScreenScale(designWidth = 1920, designHeight = 1080, renderDOM = '#root') {

    /**
     * 根据当前视口尺寸，计算目标容器的逻辑宽高和最终缩放倍数。
     * 这里的“逻辑宽高”是 scale 之前的尺寸；用户真正看到的尺寸 = 逻辑尺寸 * scale。
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
        // 默认以宽度为缩放基准，后面再按视口宽高比决定是否切换为高度基准
        let scale = htmlClientWidth / designWidth

        if (htmlClientWidth / htmlClientHeight < designWidth / designHeight) {
            // 视口更“窄”，说明宽度先到边界，应以宽度作为缩放基准
            scale = htmlClientWidth / designWidth
            // 反推缩放前的逻辑高度，使 scale 后的实际高度正好铺满视口高度
            // 推导：renderDOMHeight * scale = htmlClientHeight
            renderDOMHeight = designHeight * (htmlClientHeight / designHeight / scale)
        } else if (htmlClientWidth / htmlClientHeight > designWidth / designHeight) {
            // 视口更“宽”，说明高度先到边界，应以高度作为缩放基准
            scale = htmlClientHeight / designHeight
            // 反推缩放前的逻辑宽度，使 scale 后的实际宽度正好铺满视口宽度
            // 推导：renderDOMWith * scale = htmlClientWidth
            renderDOMWith = designWidth * (htmlClientWidth / designWidth / scale)
        }

        // eslint-disable-next-line no-extra-semi
        ;(renderDomElement as HTMLElement).style.width = `${renderDOMWith}px`
        ;(renderDomElement as HTMLElement).style.height = `${renderDOMHeight}px`

        // 以左上角为缩放原点，保证坐标系和设计稿一致，避免从中心缩放导致定位偏移
        ;(renderDomElement as HTMLElement).style.transform = `scale(${scale})`
        ;(renderDomElement as HTMLElement).style.transformOrigin = '0 0'
        // 大屏场景通常不希望出现浏览器滚动条，由容器内部自己决定是否滚动
        ;(renderDomElement as HTMLElement).style.overflow = 'hidden'
        htmlElement.style.overflow = 'hidden'
        // document.body.style.overflow = 'hidden'
        // document.body.style.scrollbarWidth = 'none'
    }, [designHeight, designWidth, renderDOM])

    const [listenerFunction] = useDebounce(() => {
        htmlResize()
    }, 50)

    useLayoutEffect(() => {
        // 首屏在浏览器绘制前就完成缩放，减少闪烁
        htmlResize()
    }, [htmlResize])

    useEffect(() => {
        // resize 期间只关心最终一次结果，避免持续拖拽窗口时高频计算
        window.addEventListener('resize', listenerFunction)
        return () => {
            window.removeEventListener('resize', listenerFunction)
        }
    }, [listenerFunction])
}
