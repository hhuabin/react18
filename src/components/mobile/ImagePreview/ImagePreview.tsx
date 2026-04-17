/**
 * @Author: bin
 * @Date: 2025-09-15 17:36:13
 * @LastEditors: bin
 * @LastEditTime: 2026-04-17 11:09:22
 */
import {
    useState, useRef, useEffect,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'

import Mask from '@/components/mobile/Mask'
import Swiper, { SwiperItem, type SwiperRef } from '@/components/mobile/Swiper'
import ImagePreviewItem from './ImagePreviewItem'

import { useMergedState } from '@/hooks/core'
import { useWindowSize } from '@/hooks/device'
import { type ImagePreviewProps, type ImagePreviewRef } from './ImagePreview.d'

import './ImagePreview.less'

// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function ImagePreview(props: ImagePreviewProps, ref: ForwardedRef<ImagePreviewRef>) {
    const {
        visible,
        direction = 'horizontal',
        loop = false,
        defaultIndex = 0,
        images = [],
        maxZoom = 3,
        minZoom = 1 / 3,
        closeOnPopstate = true,
        closeOnClickImage = true,
        closeOnClickOverlay = true,
        doubleScale = true,
        stopPropagation = false,
        showIndicator = true,
        indicator,
        showCloseBtn = false,
        renderFooter,
        className = '',
        style = {},
        getContainer,
        onClose,
        afterClose,
        onIndexChange,
        onLongPress,
    } = props

    const [mergeVisible, setMergeVisible] = useMergedState(true, {
        value: visible,
        onChange: (value) => {
            onClose?.(value)      // 只有 closeImagePreview 触发关闭事件，其他事件均不调用 setMergeVisible
        },
    })
    const [swiperState, setSwiperState] = useState({
        active: 0,
        disableZoom: false,
    })

    const swiperRef = useRef<SwiperRef>(null)

    // 此处的宽高应该使用 Swiper 的宽高，目前仅用屏幕宽高代替
    const { width: rootWidth, height: rootHeight } = useWindowSize()

    /**
     * @description 监听 popstate 事件，返回时关闭弹窗
     */
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (closeOnPopstate) {
                setMergeVisible(false)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [closeOnPopstate, setMergeVisible])

    const onCloseImagePreview = () => {
        setMergeVisible(false)
    }

    const swipeTo = (index: number) => {
        swiperRef.current?.swipeTo(index)
    }

    const onSwiperChange = (index: number) => {
        setSwiperState(prevswiperState => ({
            ...prevswiperState,
            active: index,
        }))
        onIndexChange?.(index)
    }

    const onSwiperDragStart = () => {
        setSwiperState(prevswiperState => ({
            ...prevswiperState,
            disableZoom: true,
        }))
    }

    const onSwiperDragEnd = () => {
        setSwiperState(prevswiperState => ({
            ...prevswiperState,
            disableZoom: false,
        }))
    }

    useImperativeHandle(ref, () => ({
        swipeTo,
        resetScale: () => {},
    }))

    // 默认指示器，传给 Swiper 显示
    const defaultIndicator = (total: number, current: number): React.ReactNode => {
        if (indicator) return indicator(total, current)
        if (!showIndicator) return null

        return (<div className='bin-image-preview-indicator'>{ (current + 1) +  ' / ' + total }</div>)
    }

    const renderImages = () => (
        <Swiper
            ref={swiperRef}
            direction={direction}
            loop={loop}
            defaultIndex={defaultIndex}
            stopPropagation={stopPropagation}
            showIndicator={showIndicator}
            indicator={defaultIndicator}
            onChange={onSwiperChange}
            onDragStart={onSwiperDragStart}
            onDragEnd={onSwiperDragEnd}
        >
            {
                images.map((image, index) => (
                    <SwiperItem key={index}>
                        <ImagePreviewItem
                            src={image}
                            direction={direction}
                            active={swiperState.active}
                            maxZoom={maxZoom}
                            minZoom={minZoom}
                            rootWidth={rootWidth}
                            rootHeight={rootHeight}
                            closeOnClickImage={closeOnClickImage}
                            closeOnClickOverlay={closeOnClickOverlay}
                            disableZoom={swiperState.disableZoom}
                            doubleScale={doubleScale}
                            className={className}
                            style={style}
                            onCloseImagePreview={onCloseImagePreview}
                            onLongPress={() => onLongPress?.(index)}
                        >
                        </ImagePreviewItem>
                    </SwiperItem>
                ))
            }
        </Swiper>
    )

    const renderClose = () => {
        if (!showCloseBtn) return null
        return (
            <div
                role='button'
                className='bin-image-preview-close-btn'
                onClick={() => onCloseImagePreview()}
            >
                <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                    <line x1='32' y1='32' x2='68' y2='68' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
                    <line x1='68' y1='32' x2='32' y2='68' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
                </svg>
            </div>
        )
    }

    // afterClose 在 showImagePreview 用来处理销毁函数
    return (
        <Mask
            visible={mergeVisible}
            getContainer={getContainer}
            afterClose={afterClose}
        >
            { renderImages() }
            { renderClose() }
            { renderFooter?.(swiperState.active) }
        </Mask>
    )
})
