/* eslint-disable max-lines */
/**
 * @Author: bin
 * @Date: 2025-12-25 19:45:38
 * @LastEditors: bin
 * @LastEditTime: 2026-03-20 15:28:49
 */
// https://picsum.photos/800/1600 随机生成图片尺寸的网址
import {
    useState, useRef, useEffect,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'

import Image from '@/components/mobile/Image'

import { useSyncState } from '@/hooks/core'
import { useTouch } from '@/hooks/dom'
import { isBrowser, clamp } from './utils/utils'

type ImagePreviewItemProps = {
    src: string;
    direction?: 'horizontal' | 'vertical';     // 滚动方向，默认为 'horizontal'
    active?: number;                           // 当前正在显示的图片索引，默认值为第一张，索引 0
    maxZoom?: number;                          // 最大缩放倍数，默认值 3
    minZoom?: number;                          // 最小缩放倍数，默认值 1 / 3
    rootWidth?: number;                        // 窗口宽度
    rootHeight?: number;                       // 窗口高度
    closeOnClickImage?: boolean;               // 是否允许点击图片关闭，默认值 true
    closeOnClickOverlay?: boolean;             // 是否在点击遮罩层后关闭图片预览，默认值 true
    disableZoom?: boolean;                     // 是否禁止缩放，防止触摸事件冲突，默认值 false
    doubleScale?: boolean;                     // 是否启用双击缩放手势，禁用后，点击时会立即关闭图片预览，默认值 true
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
    onCloseImagePreview?: () => void;          // 关闭图片预览
    onLongPress?: () => void;                  // 长按当前图片时触发
}
export type ImagePreviewItemRef = {
    resetScale: () => void;
}

const TAP_TIME = 250                           // 双击超时时间。250ms内再次点击即是双击。与iOS双击超时的默认值相同
const LONG_PRESS_START_TIME = 500              // 长按判定时长，超过即是长按
const longImageRatio = 2.6                     // 长图 高宽 比，超过该比例为长图（只处理长图，不对宽图进行特殊处理）

// 获取两指之间的直线距离
const getDistance = (touches: React.TouchList) =>
    Math.sqrt(
        (touches[0].clientX - touches[1].clientX) ** 2 +
        (touches[0].clientY - touches[1].clientY) ** 2,
    )
// 获取两指的中心点（中点）
const getCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
})

// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function ImagePreviewItem(props: ImagePreviewItemProps, ref: ForwardedRef<ImagePreviewItemRef>) {
    const {
        src,
        direction = 'horizontal',
        active = 0,
        maxZoom = 3,
        minZoom = 1 / 3,
        rootWidth = 0,
        rootHeight = 0,
        closeOnClickImage = true,
        closeOnClickOverlay = true,
        disableZoom = false,
        doubleScale = true,
        className = '',
        style = {},
        onCloseImagePreview,
        onLongPress,
    } = props

    const [imageState, setImageState] = useSyncState({               // 图片状态
        scale: 1,                      // 缩放倍数
        moveX: 0,                      // 移动距离 X
        moveY: 0,                      // 移动距离 Y
        moving: false,                 // 是否正在移动
        zooming: false,                // 是否正在双指缩放
        initializing: false,           // 是否正在初始化，用于处理长图初始化显示有滚动的问题，仅在 resize() 中改变状态
        imageRatio: 0,                 // 图片 高宽 比，用于处理长图
    })
    const [isLongImage, setIsLongImage] = useState(false)            // 是否长图
    const [isVerticalImage, setIsVerticalImage] = useState(false)    // (屏幕宽高比 < 图片宽高比 < 长图)为 true 时，改动 css 样式

    const imageWrapRef = useRef<HTMLDivElement | null>(null)         // 包裹图片的元素

    const initialMoveY = useRef(0)                         // 只用于 长图 的初始化，让中段内容可见而计算出来的 初始纵向平移距离，
    const fingerNum = useRef(0)                            // 当前手势起始时的手指数，只在 touchStart 赋值一次
    const startMoveX = useRef(0)                           // 图片在本次拖拽开始前的 x 轴位移，须叠加历史位移
    const startMoveY = useRef(0)                           // 图片在本次拖拽开始前的 y 轴位移，须叠加历史位移
    const startScale = useRef(0)                           // 双指缩放开始时的 scale，放大倍数
    const startDistance = useRef(0)                        // 双指刚按下时的距离，作为缩放比例的分母
    const lastCenter = useRef({ x: 0, y: 0 })              // 最近一次双指缩放时的中心点，用于 touchend 时的“回弹修正”
    const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)    // 双击 判定的定时器
    const touchStartTime = useRef<number>(0)               // 手指按下的时间戳，判断 tap / longPress
    const isImageMoved = useRef(false)                     // 这次手势是否真的拖动了图片，解决 图片拖拽 vs Swipe 冲突

    const touch = useTouch()

    useEffect(() => {
        // Swiper 大小改变时，重新计算rootHeight / rootWidth
        resize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.rootWidth, props.rootHeight])
    useEffect(() => {
        resetScale()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    const imageStyle = () => {
        const { scale, moveX, moveY, moving, zooming, initializing } = imageState()
        /**
         * 当 zooming || moving || initializing 时，没有动画（动画时长为0）
         */
        const style: React.CSSProperties = {
            transitionDuration: zooming || moving || initializing ? '0s' : '300ms',
        }

        if (scale !== 1 || isLongImage) {
            // 使用矩阵解决safari优化导致元素不渲染的问题
            style.transform = `matrix(${scale}, 0, 0, ${scale}, ${moveX}, ${moveY})`
        }

        return style
    }

    // 根据放大倍数计算 x 轴最大移动距离
    const maxMoveX = (scale = imageState().scale): number => {
        const { imageRatio } = imageState()
        if (imageRatio) {
            /**
             * @description 当图片以「高度撑满」的方式显示（竖图场景）
             * 此时需要使用 rootHeight / imageState().imageRatio 计算图片真实宽度(imageWidth)，避免横向拖出空白
             * 解释：高度撑满，则有1. imageHeight = rootHeight 又有 2. imageRatio = imageHeight(rootHeight) / imageWidth
             * 则 imageWidth = rootHeight / imageState().imageRatio
             */
            const displayWidth = isVerticalImage
                ? rootHeight / imageRatio
                : rootWidth
            return Math.max(0, (scale * displayWidth - rootWidth) / 2)
        }

        return 0
    }
    // 根据放大倍数计算 y 轴最大移动距离
    const maxMoveY = (scale = imageState().scale): number => {
        const { imageRatio } = imageState()
        if (imageRatio) {
            /**
             * @description 当图片以「宽度撑满」的方式显示（横图 / 普通图场景）
             * 此时需要使用 rootWidth * imageState().imageRatio 计算图片真实高度(imageHeight)，避免纵向拖出空白
             * 解释：宽度撑满，则有1. imageWidth = rootWidth 又有 2. imageRatio = imageHeight / imageWidth(rootWidth)
             * 则 imageHeight = rootWidth * imageState().imageRatio
             */
            const displayHeight = isVerticalImage
                ? rootHeight
                : rootWidth * imageRatio
            return Math.max(0, (scale * displayHeight - rootHeight) / 2)
        }
        return 0
    }

    /**
     * @description 设置缩放倍数，并根据缩放中点和倍数改变图片位移
     * @param scale 缩放倍数
     * @param center 中点坐标
     */
    const setScale = (scale: number, center?: { x: number; y: number }) => {
        scale = clamp(scale, +minZoom, +maxZoom + 1)

        const prevScale = imageState().scale

        // 放大倍数相同不做处理
        if (scale === prevScale) return

        if (center) {
            // 有缩放中点坐标
            const { moveX, moveY } = imageState()
            const ratio = scale / prevScale

            // 计算放大后的位移
            // TODO: 怎么计算？
            const cx = center.x - rootWidth / 2
            const cy = center.y - rootHeight / 2

            const nextMoveX = cx - (cx - moveX) * ratio
            const nextMoveY = cy - (cy - moveY) * ratio
            // 边界控制
            const _maxMoveX = maxMoveX(scale)
            const _maxMoveY = maxMoveY(scale)

            setImageState((prevState) => ({
                ...prevState,
                scale,
                moveX: clamp(nextMoveX, -_maxMoveX, _maxMoveX),
                moveY: clamp(nextMoveY, -_maxMoveY, _maxMoveY),
            }))
        } else {
            // resetScale() 调用
            setImageState((prevState) => ({
                ...prevState,
                scale,
                moveX: 0,
                moveY: isLongImage ? initialMoveY.current : 0,
            }))
        }

        // 触发 scaleChange 事件
        // props.onScaleChange?.(scale, index)
    }
    const resetScale = () => {
        setScale(1)
    }

    /**
     * @description 触摸开始事件处理
     * @param event 触摸事件
     * onTouchStart 不负责 移动，只是负责给本次触摸事件进行定性，是什么事件?
     * 1. 点击 / 双击 事件
     * 2. 拖拽图片（drag） 事件
     * 3. 双指缩放（zoom） 事件
     * 4. 还是交给 Swiper 去翻页
     */
    const onTouchStart = (event: React.TouchEvent) => {
        const { touches } = event
        fingerNum.current = touches.length
        // disableZoom = true时，Swiper正在处理touch事件，防止 Swiper 和 ImagePreview 冲突
        if (fingerNum.current === 2 && disableZoom) return

        // 记录触摸开始的位移、时间
        const { scale, moveX, moveY } = imageState()
        touch.start(event)
        startMoveX.current = moveX
        startMoveY.current = moveY
        touchStartTime.current = Date.now()

        isImageMoved.current = false

        // 2. 拖拽图片（drag） 事件
        const isMoving = fingerNum.current === 1 && (scale !== 1 || isLongImage)
        // 3. 双指缩放（zoom） 事件
        const isZooming = fingerNum.current === 2 && !touch.offsetX.current

        if (isZooming) {
            startScale.current = scale
            startDistance.current = getDistance(touches)
        }
        // 更新图片位移 / 缩放状态
        setImageState((prevState) => ({
            ...prevState,
            moving: isMoving,
            zooming: isZooming,
        }))
    }
    const onTouchMove = (event: React.TouchEvent) => {

        const { touches } = event

        touch.move(event)

        const { moving, zooming } = imageState()

        if (moving) {
            const { deltaX, deltaY } = touch
            // 计算当前移动
            let moveX = deltaX.current + startMoveX.current
            let moveY = deltaY.current + startMoveY.current
            const _maxMoveX = maxMoveX()
            const _maxMoveY = maxMoveY()

            // 如果图像被移动到边缘，允许用户滑动到下一个图像
            const beyondBoundary = direction === 'horizontal'
                ? touch.isHorizontal() && Math.abs(moveX) > _maxMoveX
                : touch.isVertical() && Math.abs(moveY) > _maxMoveY

            // 超出边缘 并且 图片没有在拖动，返回，允许滑动事件传导到 Swiper
            // （功能点：图片处于放大时，一次滑动不能穿透到 Swiper）
            if (beyondBoundary && !isImageMoved.current) {
                setImageState((prevState) => ({
                    ...prevState,
                    moving: false,
                }))
                return
            }

            isImageMoved.current = true
            // 正在移动，禁止传导事件至 Swiper
            event.stopPropagation()
            // 边界控制
            moveX = clamp(moveX, -_maxMoveX, _maxMoveX)
            moveY = clamp(moveY, -_maxMoveY, _maxMoveY)
            // 更新图片位移
            setImageState((prevState) => ({
                ...prevState,
                moveX,
                moveY,
            }))
        }

        if (zooming) {
            // 正在双指缩放，禁止 touch 事件传导至 Swiper
            event.stopPropagation()

            // 3. 双指缩放（zoom） 事件
            if (touches.length === 2) {
                const distance = getDistance(touches)
                const scale = (startScale.current * distance) / startDistance.current
                lastCenter.current = getCenter(touches)
                // 更新图片缩放倍数
                setScale(scale, lastCenter.current)
            }
        }
    }
    const onTouchEnd = (event: React.TouchEvent) => {
        let stopPropagation = false

        const { scale, moving, zooming } = imageState()
        let { moveX, moveY } = imageState()

        if (moving || zooming) {
            // 移动 / 双指缩放结束，禁止传递事件至 Swiper
            stopPropagation = true

            // 没有拖动图片，可以传导 点击 事件
            if (moving && moveX && moveY) {
                stopPropagation = false
            }

            // 最后一根手指抬起（多指操作）
            if (!event.touches.length) {
                // 处理双指缩放的收尾，进行边界修正
                if (zooming) {
                    const _maxMoveX = maxMoveX()
                    const _maxMoveY = maxMoveY()
                    moveX = clamp(moveX, -_maxMoveX, _maxMoveX)
                    moveY = clamp(moveY, -_maxMoveY, _maxMoveY)
                }

                // 边界修正，并且退出拖动和放大状态
                setImageState((prevState) => ({
                    ...prevState,
                    moveX,
                    moveY,
                    moving: false,
                    zooming: false,
                }))

                // 重置拖动状态，便于下一次 onTouchStart
                startMoveX.current = 0
                startMoveY.current = 0
                startScale.current = 1

                // 双指放大边界处理
                if (scale < 1) {
                    resetScale()
                } else if (scale > +maxZoom) {
                    setScale(+maxZoom, lastCenter.current)
                }
            }
        }

        // 消除safari上的点击延迟
        if (stopPropagation) event.stopPropagation()

        checkTap(event)
        touch.reset()
    }

    /**
     * @description 检测点击 / 双击事件
     */
    const checkTap = (event: React.TouchEvent) => {
        // 超过一个手指，不是单击也不是双击
        if (fingerNum.current > 1) return

        const deltaTime = Date.now() - touchStartTime.current

        // 到最后一次 onTouchMove 事件为止是点击事件
        if (touch.isTap.current) {
            if (deltaTime < TAP_TIME) {
                if (doubleScale) {
                    if (doubleTapTimer.current) {
                        // 双击事件，执行缩放切换
                        clearTimeout(doubleTapTimer.current)
                        doubleTapTimer.current = null
                        doubleTap()
                    } else {
                        doubleTapTimer.current = setTimeout(() => {
                            // TAP_TIME 之后执行单击事件
                            isTapAndCheckClose(event)
                            doubleTapTimer.current = null
                        }, TAP_TIME)
                    }
                } else {
                    // 如果禁止双击缩放，下一帧执行单击事件，防止点击穿透
                    window.requestAnimationFrame(() => {
                        isTapAndCheckClose(event)
                    })
                }
            }

            // 长按判定
            if (deltaTime > LONG_PRESS_START_TIME) {
                onLongPress?.()
            }
        }
    }
    /**
     * @description 单击事件 并且 检测能不能关闭 ImagePreview
     */
    const isTapAndCheckClose = (event: React.TouchEvent) => {
        if (!imageWrapRef.current) return

        // 获取包裹图片元素
        const imageEle = imageWrapRef.current.firstElementChild

        // 点击蒙层
        const isClickOverlay = event.target === imageWrapRef.current
        // 点击图片
        const isClickImage = imageEle?.contains(event.target as HTMLElement)

        if (!closeOnClickImage && isClickImage) return
        if (!closeOnClickOverlay && isClickOverlay) return
        resetScale()
        onCloseImagePreview?.()
    }
    /**
     * @description 双击事件，执行缩放切换
     */
    const doubleTap = () => {
        const scale = imageState().scale > 1 ? 1 : 2

        const center = (scale === 2 || isLongImage)
            ? { x: touch.startX.current, y: touch.startY.current }
            : undefined
        setScale(scale, center)
    }

    const resize = () => {
        // 获取 屏幕(Swiper元素) 的高宽比
        const rootRatio = rootHeight / rootWidth
        const { imageRatio } = imageState()

        // 图片高宽比 是否 大于屏幕(Swiper元素)小于长图
        setIsVerticalImage(imageRatio > rootRatio && imageRatio < longImageRatio)
        // 长图判定
        const _isLongImage = imageRatio > rootRatio && imageRatio >= longImageRatio
        setIsLongImage(_isLongImage)

        // 如果判定为长图，会在初始化阶段强制把图片「向上偏移到中间可视区」
        // 并进入一个短暂的 initializing 状态，随后重置缩放
        if (_isLongImage) {
            initialMoveY.current = (imageRatio * rootWidth - rootHeight) / 2
            setImageState((prevState) => ({
                ...prevState,
                moveY: initialMoveY.current,
                initializing: true,
            }))
            // SSR、RSC 安全
            if (isBrowser) {
                window.requestAnimationFrame(() => {
                    setImageState((prevState) => ({
                        ...prevState,
                        initializing: false,
                    }))
                })
            }
        }

        resetScale()
    }

    /**
     * @description 图片加载完成，更新图片的 高宽 比
     * @param event React 合成事件（load），事件源为 HTMLImageElement
     */
    const onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {

        // naturalWidth, naturalHeight 图片资源本身的“原始像素宽度高度”
        const { naturalWidth, naturalHeight } = event.currentTarget
        setImageState((prevState) => ({
            ...prevState,
            imageRatio: naturalHeight / naturalWidth,
        }))

        resize()
    }

    useImperativeHandle(ref, () => ({
        resetScale,
    }))

    return (
        <div
            ref={imageWrapRef}
            className={'bin-image-preview' + (className ? ' ' + className : '')}
            style={style}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
        >
            <Image
                src={src}
                className={'bin-image-preview-image' + (isVerticalImage ? ' bin-image-preview-image-vertical' : '')}
                style={imageStyle()}
                onLoad={onLoad}
            ></Image>
        </div>
    )
})
