/**
 * @Author: bin
 * @Date: 2025-09-16 14:40:22
 * @LastEditors: bin
 * @LastEditTime: 2026-03-12 10:38:39
 */
/* eslint-disable max-lines */
import React, {
    useEffect, useRef, forwardRef, useImperativeHandle,
    type ForwardedRef,
} from 'react'
import { flushSync } from 'react-dom'
import { useInternalLayoutEffect } from '@/hooks/reactHooks/useLayoutUpdateEffect'

import useSyncState from '@/hooks/reactHooks/useSyncState'
import SwiperItem, { type SwiperItemProps } from './SwiperItem'
import useTouch from '@/hooks/domHooks/useTouch'
import { getEnv } from './utils'

import './Swiper.less'

type SwiperProps = {
    direction?: 'horizontal' | 'vertical';     // 滚动方向，默认为 'horizontal'
    autoplay?: boolean;                        // 是否自动切换，默认为 false
    duration?: number;                         // 切换动画时长，单位为 ms，默认为 500
    loop?: boolean;                            // 是否循环播放，默认值 false
    autoplayInterval?: number;                 // 自动切换的间隔，单位为 ms，默认为 3000
    defaultIndex?: number;                     // 默认位置索引值
    width?: number | string;                   // 滑块宽度，默认值 100%，若是 number 类型，则单位是 px
    height?: number | string;                  // 滑块高度，默认值 100%，若是 number 类型，则单位是 px
    basicOffset?: number;                      // 滑块基础偏移量，单位 px
    slideItemSize?: number;                    // 轮播项的宽 / 高，单位 px
    showIndicator?: boolean;                   // 是否显示指示器，默认为 true
    indicatorColor?: string;                   // 指示器颜色，默认为 #1989fa
    indicator?: (total: number, current: number) => React.ReactNode;     // 自定义指示器，优先级比 showIndicator 高
    touchable?: boolean;                       // 是否可以通过手势滑动，默认为 true
    stopPropagation?: boolean;                 // 是否阻止滑动事件冒泡，默认为 true
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
    onChange?: (index: number) => void;        // 切换时触发
    onDragStart?: () => void;                  // 当用户开始拖动轮播组件时触发
    onDragEnd?: () => void;                    // 当用户结束拖动轮播组件时触发
    children?: React.ReactElement<typeof SwiperItem> | React.ReactElement<typeof SwiperItem>[];       // 轮播内容(`<SwiperItem/>`)
}
export type SwiperRef = {
    prev: () => void;
    next: () => void;
    swipeTo: (index: number) => void;
}

const DEFAULT_DURATION = 500                // 默认动画时长
const INERTIAL_SLIDE_TIME = 300             // 惯性滚动判定时间，在该时间范围内为惯性滚动
const INERTIAL_SLIDE_DISTANCE = 15          // 惯性滚动判定距离

// 获取中间的数字
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

/**
 * Swiper 要求在初始化时，容器必须参与布局，如不能被 `display: none;` 的容器包裹
 * 否则 getRootRefDOMSize() 获取容器尺寸会失败，可以尝试通过设置 slideItemSize 解决
 */
// eslint-disable-next-line prefer-arrow-callback
const Swiper = forwardRef(function Swiper(props: SwiperProps, ref: ForwardedRef<SwiperRef>) {

    const {
        direction = 'horizontal',
        autoplay = false,
        duration = DEFAULT_DURATION,
        loop = false,
        autoplayInterval = 3000,
        defaultIndex = 0,
        width = '',
        height = '',
        basicOffset = 0,
        slideItemSize,
        showIndicator = true,
        indicatorColor = '',
        indicator,
        touchable = true,
        stopPropagation = true,
        className = '',
        style = {},
        children,
        onChange,
        onDragStart,
        onDragEnd,
    } = props

    const rootRef = useRef<HTMLDivElement | null>(null)                // 最外层元素，框框
    const trackRef = useRef<HTMLDivElement | null>(null)               // 滚动块
    const [stableRootSize, setStableRootSize] = useSyncState({         // 存放最外层 swiper(rootRef) 的样式
        width: 0,
        height: 0,
    })
    // trackState 会被闭包取值，故使用 useSyncState
    const [stableTrackState, setTrackState] = useSyncState({           // 滚动块(trackRef)的状态
        width: 0,                    // 单个 item 宽
        height: 0,                   // 单个 item 高
        offset: 0,                   // track 当前的偏移量
        active: defaultIndex,        // 当前激活的索引
        // moving: false,               // 滚动判定，正在滚动时点击无效
    })

    const autoplayTimer = useRef<ReturnType<typeof setTimeout>>()      // 自动滚动的定时器
    const startOffset = useRef(0)                              // 滑动开始时的 transformY
    const moving = useRef(false)                               // 滚动判定，正在滚动时点击无效
    const inertialStartTime = useRef(0)                        // 惯性滚动前置时间，用于惯性滚动判定
    const inertialOffset = useRef(0)                           // 惯性滚动前置偏移量，用于惯性滚动判定

    // 获取子元素个数
    const swiperItemCount = React.Children.count(children)

    const touch = useTouch()

    useEffect(() => {
        // 仅作提示使用，无其他用法
        for (const child of (Array.isArray(children) ? children : [children])) {
            if (child?.type !== SwiperItem) {
                console.warn('The children of `Swiper` must be `Swiper.Item` components.')
                return
            }
        }
    }, [children])

    /***************************
     * 窗口改变，获取 swiper 的大小
     ***************************/
    useEffect(() => {
        const resizeHandler = () => getRootRefDOMSize()
        window.addEventListener('resize', resizeHandler, { passive: true })
        return () => {
            window.removeEventListener('resize', resizeHandler)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // 监听宽度、高度，获取 swiper 的大小
    useInternalLayoutEffect(() => {
        getRootRefDOMSize()
    }, [width, height, basicOffset])
    /**
     * @description 获取并设置 swiper 框及滑块的大小
     * 不管参数 / 窗口是否发生变化，都能获取到正确的大小
     * 使用 offsetWidth 要求 Swiper 在初始化时，容器必须参与布局
     */
    const getRootRefDOMSize = () => {
        if (!rootRef.current) return

        // 确保取到正确的 offsetWidth 值
        window.requestAnimationFrame(() => {
            //bug：Swiper 一定要参与布局才能获取到正确的尺寸，否则为0
            const { offsetWidth, offsetHeight } = rootRef.current!
            // 轮播项的宽
            let slideItemWidth = offsetWidth
            // 轮播项的高
            let slideItemHeight = offsetHeight

            /**
             * bug：当 defaultIndex !== 0 时，窗口变化会跳转到默认位置索引
             * 想要达到的效果：初始化 -> defaultIndex；窗口变化 -> getNearIndexByOffset()
             * 初始化和窗口变化函数估计要重写
             */
            const trustedDefaultIndex = defaultIndex !== 0
                ? clamp(defaultIndex, 0, swiperItemCount - 1)
                : getNearIndexByOffset()
            // const trustedDefaultIndex = clamp(defaultIndex, 0, swiperItemCount - 1)       // 初始化 / 窗口变化，重置到默认索引
            // const trustedDefaultIndex = getNearIndexByOffset()                            // 初始化 / 窗口变化，重置到位置较近的索引

            if (direction === 'horizontal') {
                slideItemWidth = slideItemSize ?? offsetWidth
                if (getEnv() === 'development' && slideItemWidth === 0) {
                    console.warn('Swiper: 初始化宽度（尺寸）不能为0')
                }
            } else if (direction === 'vertical') {
                slideItemHeight = slideItemSize ?? offsetHeight
                if (getEnv() === 'development' && slideItemHeight === 0) {
                    console.warn('Swiper: 初始化高度（尺寸）不能为0')
                }
            }

            setStableRootSize({
                width: offsetWidth,
                height: offsetHeight,
            })
            setTrackState(prevState => ({
                ...prevState,
                width: slideItemWidth,
                height: slideItemHeight,
            }))

            // 更新
            // updateAnimate(_basicOffset)
            updateAnimateByIndex(trustedDefaultIndex)
        })
    }

    /************************
     * 自动播放
     ************************/
    useEffect(() => {
        startAutoPlay()
        return () => {
            if (autoplayTimer.current) clearTimeout(autoplayTimer.current)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoplay, autoplayInterval])

    // 获取非循环 / 循环状态下的可信任的 Swiper 下标
    const getTrustedSwiperIndex = (index: number) => {
        let trustIndex = index
        if (loop) {
            // 循环时可以超出 [0, swiperItemCount - 1]
            trustIndex = clamp(index, -1, swiperItemCount)
        } else {
            trustIndex = clamp(index, 0, swiperItemCount - 1)
        }
        return trustIndex
    }
    /**
     * @description 获取轮播块最大偏移量，需要考虑 basicOffset ≠ 0 的情况
     * 在 onTouchMove()、updateAnimateByIndex() 中调用
     * @param { boolean } isLoop 是否循环
     * @returns { number } 最大偏移量
     */
    const getMaxOffset = (isLoop = loop) => {
        let maxOffset: number = 0

        if (isLoop) {
            // 循环时最大偏移量可向右 / 上滚动多一项
            if (direction === 'horizontal') {
                maxOffset = stableTrackState().width
            } else if (direction === 'vertical') {
                maxOffset = stableTrackState().height
            }
        } else {
            if (direction === 'horizontal') {
                maxOffset = basicOffset
            } else if (direction === 'vertical') {
                maxOffset = basicOffset
            }
        }
        return maxOffset
    }
    /**
     * @description 获取轮播块最小偏移量
     * 需要考虑 slideItemSize ≠ 100 的情况(加多项减去框的宽/高即可)
     * 在 onTouchMove()、updateAnimateByIndex() 中调用
     * @param { boolean } isLoop 是否循环
     * @returns { number } 最小偏移量
     */
    const getMinOffset = (isLoop = loop): number => {
        let minOffset: number = 0
        if (isLoop) {
            // 循环时最小偏移量可向左 / 下滚动多一项
            if (direction === 'horizontal') {
                minOffset = -(swiperItemCount + 1) * stableTrackState().width + stableRootSize().width
                // 循环状态下，限制最小偏移量 至少 为 一个轮播项宽。
                // 不能让 stableTrackState().offset <= getMinOffset() 一直是 true 造成 updateAnimate 死循环
                // 由于 updateAnimateByIndex(0) 将会移动到 basicOffset 的位置，故而当 basicOffset <= 项宽时候，应取值为 basicOffset - 1
                const limitMinOffset = -stableTrackState().width < basicOffset ? -stableTrackState().width : basicOffset - 1
                // 风险控制
                if (stableRootSize().width > 2 * stableTrackState().width) {
                    // 当滑块太大时（超大屏幕并且被定宽*px），就不要搞那么多花里胡哨的，直接一点
                    minOffset = -(swiperItemCount) * stableTrackState().width
                }

                minOffset = Math.min(minOffset, limitMinOffset)
            } else if (direction === 'vertical') {
                minOffset = -(swiperItemCount + 1) * stableTrackState().height + stableRootSize().height

                const limitMinOffset = -stableTrackState().height < basicOffset ? -stableTrackState().height : basicOffset - 1
                if (stableRootSize().height > 2 * stableTrackState().height) {
                    minOffset = -(swiperItemCount) * stableTrackState().height
                }

                minOffset = Math.min(minOffset, limitMinOffset)
            }
        } else {
            if (direction === 'horizontal') {
                minOffset = -swiperItemCount * stableTrackState().width + stableRootSize().width
                // 风险控制
                /* if (stableRootSize().width > 2 * stableTrackState().width) {
                    // 当滑块太大时（超大屏幕并且被定宽*px），就不要搞那么多花里胡哨的，直接一点
                    minOffset = -(swiperItemCount - 1) * stableTrackState().width
                } */

                minOffset = Math.min(minOffset, 0)
            } else if (direction === 'vertical') {
                minOffset = -swiperItemCount * stableTrackState().height + stableRootSize().height

                /* if (stableRootSize().width > 2 * stableTrackState().height) {
                    minOffset = -(swiperItemCount - 1) * stableTrackState().height
                } */

                minOffset = Math.min(minOffset, 0)
            }
        }
        return minOffset
    }

    // 根据 offset 获取更靠近的下标
    const getNearIndexByOffset = (offset = stableTrackState().offset): number => {
        // 向左 / 向上滑动时，offset 是负数
        offset = -offset

        let nearIndex: number = 0
        if (direction === 'horizontal') {
            // 需要考虑 basicOffset
            nearIndex = Math.round((offset + basicOffset) / stableTrackState().width)
        } else if (direction === 'vertical') {
            nearIndex = Math.round((offset + basicOffset) / stableTrackState().height)
        }

        if (Number.isNaN(nearIndex)) nearIndex = 0
        nearIndex = getTrustedSwiperIndex(nearIndex)

        return nearIndex
    }

    const prev = () => {
        // const nearIndex = getNearIndexByOffset()
        const activeIndex = stableTrackState().active
        const targetIndex = getTrustedSwiperIndex(activeIndex - 1)

        updateAnimateByIndex(targetIndex, duration)
    }
    const next = () => {
        const activeIndex = stableTrackState().active
        const targetIndex = getTrustedSwiperIndex(activeIndex + 1)

        updateAnimateByIndex(targetIndex, duration)
    }
    const swipeTo = (index: number, swiperDuration = duration) => {
        updateAnimateByIndex(index, swiperDuration)
    }

    const stopAutoPlay = () => clearTimeout(autoplayTimer.current)

    const startAutoPlay = () => {
        if (!autoplay || swiperItemCount === 1) return
        // 非循环时，当处于最后一项时，停止自动播放
        if (!loop && stableTrackState().active >= swiperItemCount - 1) return

        stopAutoPlay()
        if (swiperItemCount > 1) {
            autoplayTimer.current = setTimeout(() => {
                next()
                startAutoPlay()
            }, autoplayInterval)
        }
    }

    const onTouchStart = (event: React.TouchEvent) => {
        if (!touchable) return
        stopAutoPlay()
        touch.start(event)

        let _startOffset = stableTrackState().offset
        if (loop && swiperItemCount > 1) {
            // 循环时，处理轮播第一项和最后一项的衔接问题
            // 该代码用于处理，滑动从 n + 1 轮播项目直接向左跳转至 -1 项
            const { transform } = window.getComputedStyle(trackRef.current as HTMLDivElement)
            const { m41, m42 } = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
            // 获取非轮播的最大、最小偏移量，便于计算
            const maxOffset = getMaxOffset(false)
            let minOffset = getMinOffset(false)

            if (direction === 'horizontal') {
                if (stableRootSize().width > 2 * stableTrackState().width) {
                    // 容器过宽限制
                    minOffset = -(swiperItemCount - 1) * stableTrackState().width
                } else {
                    // 由于非轮播状态下的最小偏移量被限制的与 stableRootSize().width 相关，故而此处需要矫正最小偏移量
                    minOffset = minOffset + stableTrackState().width - stableRootSize().width + basicOffset
                }
                if (m41 > maxOffset) {
                    // 轮播 -1 项，瞬移到尾项
                    _startOffset = m41 + (-swiperItemCount * stableTrackState().width)
                } else if (m41 < minOffset) {
                    // 轮播 n + 1 项，瞬移到第一项
                    _startOffset = m41 - (-swiperItemCount * stableTrackState().width)
                } else if (moving.current) {
                    _startOffset = m41
                }
                updateAnimate(_startOffset, 0)
            } else if (direction === 'vertical') {
                if (stableRootSize().height > 2 * stableTrackState().height) {
                    // 容器过高限制
                    minOffset = -(swiperItemCount - 1) * stableTrackState().height
                } else {
                    // 由于非轮播状态下的最小偏移量被限制的与 stableRootSize().height 相关，故而此处需要矫正最小偏移量
                    minOffset = minOffset + stableTrackState().height - stableRootSize().height + basicOffset
                }

                if (m42 > maxOffset) {
                    _startOffset = m42 + (-swiperItemCount * stableTrackState().height)
                } else if (m42 < minOffset) {
                    _startOffset = m42 - (-swiperItemCount * stableTrackState().height)
                } else if (moving.current) {
                    _startOffset = m42
                }
                updateAnimate(_startOffset, 0)
            }
        } else if (moving.current) {
            // 正在滚动时点击固定到当前位置
            const { transform } = window.getComputedStyle(trackRef.current as HTMLDivElement)
            const { m41, m42 } = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
            if (direction === 'horizontal') {
                // 设置横向偏移量
                _startOffset = m41
                updateAnimate(m41, 0)
            } else {
                // 设置纵向偏移量
                _startOffset = m42
                updateAnimate(m42, 0)
            }
        }
        startOffset.current = _startOffset
        inertialOffset.current = _startOffset
        inertialStartTime.current = Date.now()
    }
    /* const getLoopTranslateX = (offset: number): number => {
        const boxWidth = stableTrackState().width
        const min = -boxWidth * (swiperItemCount)
        const max = boxWidth
        const range = max - min

        // 使用数学模，保证 x 无论多大多小都能映射到 [min, max)
        const safeOffset = ((offset - min) % range + range) % range + min
        console.log('safeOffset', safeOffset, range);

        return safeOffset
    } */
    const onTouchMove = (event: React.TouchEvent) => {
        if (!touchable) return
        touch.move(event)
        // 阻止 onTouchMove 事件向父组件冒泡
        if (stopPropagation) event.stopPropagation()

        // let newOffset = startOffset.current + touch.deltaX.current
        let newOffset = startOffset.current
        if (direction === 'horizontal' && touch.isHorizontal()) {
            if (!moving.current) {
                moving.current = true
                onDragStart?.()
            }
            if (loop) {
                if (swiperItemCount === 1) {
                    newOffset = newOffset + touch.deltaX.current / 5
                    // 边界限制
                    const boundaryDistance = stableTrackState().width / 2
                    newOffset = clamp(newOffset, getMinOffset(false) - boundaryDistance, getMaxOffset(false) + boundaryDistance)
                } else {
                    // 不搞那么花里胡哨了，直接限制 touch.deltaX.current 的取值范围即可
                    // newOffset += clamp(touch.deltaX.current, -stableTrackState().width * 0.8, stableTrackState().width * 0.8)
                    newOffset = clamp(newOffset + touch.deltaX.current, getMinOffset(), getMaxOffset())
                }
            } else {
                // 未开启循环要做边界处理
                const maxOffset = getMaxOffset()
                const minOffset = getMinOffset()

                if (newOffset + touch.deltaX.current > maxOffset) {
                    newOffset = maxOffset + (newOffset + touch.deltaX.current - maxOffset) / 5
                } else if (newOffset + touch.deltaX.current < minOffset) {
                    newOffset = minOffset + (newOffset + touch.deltaX.current - minOffset) / 5
                } else {
                    newOffset += touch.deltaX.current
                }
                // 边界限制
                const boundaryDistance = stableTrackState().width / 2
                newOffset = clamp(newOffset, minOffset - boundaryDistance, maxOffset + boundaryDistance)
            }
        } else if (direction === 'vertical' && touch.isVertical()) {
            if (!moving.current) {
                moving.current = true
                onDragStart?.()
            }
            if (loop) {
                if (swiperItemCount === 1) {
                    newOffset = newOffset + touch.deltaY.current / 5
                    // 边界限制
                    const boundaryDistance = stableTrackState().height / 2
                    newOffset = clamp(newOffset, getMinOffset(false) - boundaryDistance, getMaxOffset(false) + boundaryDistance)
                } else {
                    // newOffset += clamp(touch.deltaY.current, -stableTrackState().height * 0.8, stableTrackState().height * 0.8)
                    newOffset = clamp(newOffset + touch.deltaY.current, getMinOffset(), getMaxOffset())
                }
            } else {
                // 未开启循环要做边界处理
                const maxOffset = getMaxOffset()
                const minOffset = getMinOffset()

                if (newOffset + touch.deltaY.current > maxOffset) {
                    newOffset = maxOffset + (newOffset + touch.deltaY.current - maxOffset) / 5
                } else if (newOffset + touch.deltaY.current < minOffset) {
                    newOffset = minOffset + (newOffset + touch.deltaY.current - minOffset) / 5
                } else {
                    newOffset += touch.deltaY.current
                }
                // 边界限制
                const boundaryDistance = stableTrackState().height / 2
                newOffset = clamp(newOffset, minOffset - boundaryDistance, maxOffset + boundaryDistance)
            }
        }

        updateAnimate(newOffset, 0)

        // 重置惯性滚动判定
        const now = Date.now()
        if (now - inertialStartTime.current > INERTIAL_SLIDE_TIME) {
            inertialOffset.current = newOffset
            inertialStartTime.current = Date.now()
        }
    }
    const onTouchEnd = (event: React.TouchEvent) => {
        if (!touchable) return
        startAutoPlay()
        // 判定是否属于惯性滚动
        const distance = stableTrackState().offset - inertialOffset.current
        const duration = Date.now() - inertialStartTime.current
        if (Math.abs(distance) > INERTIAL_SLIDE_DISTANCE && duration < INERTIAL_SLIDE_TIME) {
            if (direction === 'horizontal') {
                // 滚动块的偏移量小于 0，则向左滚动
                if (touch.deltaX.current > 0) prev()
                // 滚动块的偏移量大于 0，则向右滚动
                else if (touch.deltaX.current < 0) next()
            } else {
                if (touch.deltaY.current > 0) prev()
                else if (touch.deltaY.current < 0) next()
            }
            return
        }
        // 非惯性滚动需要定格在某一项
        const index = getNearIndexByOffset(stableTrackState().offset)
        updateAnimateByIndex(index, duration)

        setTimeout(() => {
            moving.current = false
            onDragEnd?.()
        }, 0)
    }

    /**
     * @description 让滚动定格在某一项，里面会处理纵向/横向滚动，调用仅需关注下标即可
     * @param index 轮播项下标
     * @param duration 动画时长
     */
    const updateAnimateByIndex = (index: number, duration = 0) => {
        if (Number.isNaN(index)) index = 0

        // 控制索引不超出范围
        index = getTrustedSwiperIndex(index)
        if (loop && swiperItemCount <= 1) index = 0

        // 计算移动距离
        let trustedOffset = 0
        if (direction === 'horizontal') {
            trustedOffset = -index * stableTrackState().width + basicOffset
        } else if (direction === 'vertical') {
            trustedOffset = -index * stableTrackState().height + basicOffset
        }

        if (loop) {
            // trustedOffset = clamp(trustedOffset, getMinOffset(), getMaxOffset())
        } else {
            trustedOffset = clamp(trustedOffset, getMinOffset(), getMaxOffset())
        }

        const active = index < 0 ? swiperItemCount - 1 : index > swiperItemCount - 1 ? 0 : index

        // TODO: 考虑虚拟滚动时，下标超出，导致指示器显示错误
        setTrackState(prevState => ({
            ...prevState,
            active,
        }))

        // 触发动画
        updateAnimate(trustedOffset, duration)
        onChange?.(active)
    }

    /**
     * @description 更新动画
     * 触发时机：1. updateAnimateByIndex；2. onTouchStart；3. onTouchMove
     * @param endTransformX 动画结束的偏移量
     * @param transitionDuration 动画时长， 默认值为 0
     */
    const updateAnimate = (transformValue: number, transitionDuration = 0) => {
        if (Number.isNaN(transformValue)) transformValue = 0
        // if (transformValue === stableTrackState().offset) return
        flushSync(() => {
            setTrackState(prevState => ({
                ...prevState,
                offset: transformValue,
            }))
        })

        if (!trackRef.current) return
        // 获取动画当前的偏移量
        const { transform } = window.getComputedStyle(trackRef.current)
        const { m41, m42 } = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
        let keyframes: Keyframe[]
        if (direction === 'horizontal') {
            keyframes = [
                { transform: `translate3d(${m41}px, 0, 0)` },
                { transform: `translate3d(${transformValue}px, 0, 0)` },
            ]
        } else {
            keyframes = [
                { transform: `translate3d(0, ${m42}px, 0)` },
                { transform: `translate3d(0, ${transformValue}px, 0)` },
            ]
        }
        const options: KeyframeAnimationOptions = {
            duration: transitionDuration,
            fill: 'forwards',
            easing: 'cubic-bezier(.23, 1, .68, 1)',
        }

        trackRef.current.getAnimations().forEach(animation => animation.cancel())
        const animation = trackRef.current?.animate(keyframes, options)
        animation?.finished.then(() => {
            // moving.current = false
            /**
             * 当处于循环状态下，实现首尾无感切换。
             * 1. 滚动到第一个时，判断当前偏移量是否小于等于最小偏移量，如果是则触发动画，并切换到最后一个
             * 2. 滚动到最后一个时，判断当前偏移量是否大于等于最大偏移量，如果是则触動动画，并切换到第一个
             * 3. 正在动画中，则不处理
             */
            if (loop && swiperItemCount > 1 && !moving.current) {
                if (direction === 'horizontal') {
                    // stableTrackState().offset <= getMinOffset() 严格计算，必须小于等于它
                    if (stableTrackState().active === 0 && stableTrackState().offset <= getMinOffset()) {
                        updateAnimateByIndex(0)
                    } else if (stableTrackState().active === swiperItemCount - 1 && stableTrackState().offset > basicOffset) {
                        updateAnimateByIndex(swiperItemCount - 1)
                    }
                } else if (direction === 'vertical') {
                    if (stableTrackState().active === 0 && stableTrackState().offset <= getMinOffset()) {
                        updateAnimateByIndex(0)
                    } else if (stableTrackState().active === swiperItemCount - 1 && stableTrackState().offset > basicOffset) {
                        updateAnimateByIndex(swiperItemCount - 1)
                    }
                }
            }
        }, () => { })
    }
    /* const updateAnimate = (transformValue: number, transitionDuration = 0) => {
        if (Number.isNaN(transformValue)) transformValue = 0

        setTrackState(prevState => ({
            ...prevState,
            offset: transformValue,
        }))

        if (!trackRef.current) return
        // 设置过渡
        if (transitionDuration > 0) {
            trackRef.current.style.transition = `transform ${transitionDuration}ms cubic-bezier(.23, 1, .68, 1)`
        } else {
            trackRef.current.style.transition = 'none'
        }

        // 执行 transform
        if (direction === 'horizontal') {
            trackRef.current.style.transform = `translate3d(${transformValue}px, 0, 0)`
        } else {
            trackRef.current.style.transform = `translate3d(0, ${transformValue}px, 0)`
        }

        if (loop && transitionDuration > 0) {
            console.log('stableTrackState().active', stableTrackState().active);
            if (stableTrackState().active >= swiperItemCount) {
                const handleTransitionEnd = () => {
                    trackRef.current?.removeEventListener('transitionend', handleTransitionEnd)
                    updateAnimateByIndex(0)
                }
                trackRef.current.addEventListener('transitionend', handleTransitionEnd)
            } else if (stableTrackState().active <= -1) {
                const handleTransitionEnd = () => {
                    trackRef.current?.removeEventListener('transitionend', handleTransitionEnd)
                    updateAnimateByIndex(swiperItemCount - 1)
                }
                trackRef.current.addEventListener('transitionend', handleTransitionEnd)
            }
        }
    } */

    useImperativeHandle(ref, () => ({
        prev,
        next,
        swipeTo,
    }))

    /**
     * @description 获取 trackRef 的宽度
     * @returns trackRef 的宽度，单位px
     */
    const getTrackRefSize = (): React.CSSProperties => {
        const trackSize: React.CSSProperties = {}
        if (direction === 'horizontal') {
            // 数量 * 实际宽度
            trackSize.width = Math.max(swiperItemCount, 1) * (slideItemSize ?? stableRootSize().width) + 'px'
        } else if (direction === 'vertical') {
            trackSize.height = Math.max(swiperItemCount, 1) * (slideItemSize ?? stableRootSize().height) + 'px'
        }
        return trackSize
    }

    /**
     * @description 渲染 SwiperItem
     * @returns 渲染的SwiperItem
     */
    const renderSwiperItems = () => {
        const publcStyle: SwiperItemProps = direction === 'horizontal'
            ? { width: slideItemSize ?? stableRootSize().width }
            : { height: slideItemSize ?? stableRootSize().height }
        return React.Children.map((children || []), (child, i) => {
            const style = { ...publcStyle }
            // 只有开启了循环并且轮播项是头项或者尾项时，才需要设置偏移量
            if (loop) {
                let translateX = 0
                let translateY = 0
                let minOffset = getMinOffset(false)

                if (swiperItemCount === 2) {
                    // 当轮播项等于两个时，在判定是左右滑动后，再设置轮播项的偏移量
                    if (direction === 'horizontal') {
                        if (stableRootSize().width > 2 * stableTrackState().width) {
                            // 容器过宽限制
                            minOffset = -(swiperItemCount - 1) * stableTrackState().width
                        }
                        if (i === 0 && stableTrackState().offset < minOffset) {
                            translateX = stableTrackState().width * swiperItemCount
                        } else if (i === swiperItemCount - 1 && stableTrackState().offset > 0) {
                            translateX = -(stableTrackState().width * swiperItemCount)
                        }
                    } else if (direction === 'vertical') {
                        if (stableRootSize().height > 2 * stableTrackState().height) {
                            // 容器过高限制
                            minOffset = -(swiperItemCount - 1) * stableTrackState().height
                        }
                        if (i === 0 && stableTrackState().offset < minOffset) {
                            translateY = stableTrackState().height * swiperItemCount
                        } else if (i === swiperItemCount - 1 && stableTrackState().offset > 0) {
                            translateY = -(stableTrackState().height * swiperItemCount)
                        }
                    }
                } else if (swiperItemCount > 2) {
                    // 与 2 个的区别是相等的时候，需不需要平移，大于三个，在第一个轮播项时，最后一个轮播项需平移至第一个左边
                    if (direction === 'horizontal') {
                        if (stableRootSize().width > 2 * stableTrackState().width) {
                            // 容器过宽限制
                            minOffset = -(swiperItemCount - 1) * stableTrackState().width
                        }
                        if (i === 0 && stableTrackState().offset <= minOffset) {
                            translateX = stableTrackState().width * swiperItemCount
                        } else if (i === swiperItemCount - 1 && stableTrackState().offset >= 0) {
                            translateX = -(stableTrackState().width * swiperItemCount)
                        } else if (i === swiperItemCount - 2 && stableTrackState().offset < -(swiperItemCount - 1) * stableTrackState().width) {
                            // 第二个轮播项需要跟着第一个平移到右边
                            translateX = stableTrackState().width * swiperItemCount
                        } else if (i === swiperItemCount - 2 && stableTrackState().offset >= getMaxOffset()) {
                            // 倒数第二个轮播项需要跟着最后一个平移到左边
                            translateX = -(stableTrackState().width * swiperItemCount)
                        }
                    } else if (direction === 'vertical') {
                        if (stableRootSize().height > 2 * stableTrackState().height) {
                            // 容器过高限制
                            minOffset = -(swiperItemCount - 1) * stableTrackState().height
                        }
                        if (i === 0 && stableTrackState().offset <= minOffset) {
                            translateY = stableTrackState().height * swiperItemCount
                        } else if (i === swiperItemCount - 1 && stableTrackState().offset >= 0) {
                            translateY = -(stableTrackState().height * swiperItemCount)
                        } else if (i === swiperItemCount - 2 && stableTrackState().offset < -(swiperItemCount - 1) * stableTrackState().height) {
                            // 第二个轮播项需要跟着第一个平移到下边
                            translateY = stableTrackState().height * swiperItemCount
                        } else if (i === swiperItemCount - 2 && stableTrackState().offset >= getMaxOffset()) {
                            // 倒数第二个轮播项需要跟着最后一个平移到上边
                            translateY = -(stableTrackState().height * swiperItemCount)
                        }
                    }
                }

                if (translateX !== 0 || translateY !== 0) {
                    // style.transition = 'none'
                    style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`
                }
            }

            return React.cloneElement(child as React.ReactElement<SwiperItemProps>, style)
        })
    }

    /**
     * @description 渲染指示器
     * @param count 轮播数量
     * @param activeIndex 活动索引
     * @returns { React.ReactNode } Node 元素
     */
    const renderIndicators = (count = swiperItemCount, activeIndex: number = stableTrackState().active): React.ReactNode => {
        // 自定义指示器直接返回即可
        if (indicator) return indicator(count, activeIndex)

        // 只有一张就不用显示指示器了
        if (!showIndicator || count === 1) return null
        activeIndex = clamp(activeIndex, 0, count - 1)

        return (
            <div className='bin-swiper-indicators'>
                {Array.from({ length: count }).map((_, i) => (
                    <i
                        className={'bin-swiper-indicator' + (i === activeIndex ? ' bin-swiper-indicator-active' : '')}
                        style={{ backgroundColor: i === activeIndex ? indicatorColor : '' }}
                        key={i}
                    ></i>
                ))}
            </div>
        )
    }

    return (
        <div
            ref={rootRef}
            className={`bin-swiper${className ? ' ' + className : ''}`}
            style={{
                ...style,
                width: width ? (typeof width === 'number' ? `${width}px` : width) : style['width'],
                height: height ? (typeof height === 'number' ? `${height}px` : height) : style['height'],
            }}
        >
            <div
                ref={trackRef}
                className={'bin-swiper-track' + (direction === 'horizontal' ? ' forbid-scroll-x' : ' swiper-vertical forbid-scroll-y')}
                style={getTrackRefSize()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {renderSwiperItems()}
            </div>

            {renderIndicators()}
        </div>
    )
})

// 添加子组件
type SwiperComponent = typeof Swiper & {
    Item: typeof SwiperItem
}

const ExportedSwiper = Swiper as SwiperComponent
ExportedSwiper.Item = SwiperItem

export default ExportedSwiper
