/**
 * @Author: bin
 * @Date: 2026-01-15 10:07:43
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 19:19:31
 */
import { useState, useEffect } from 'react'

import { useMergedState } from '@/hooks/core'
import { renderToContainer } from './utils/renderToContainer'

import CSSMotion from '@/components/CSSMotion'
import { clsx } from './utils/clsx'
import './Mask.less'

/**
 * @description 主要实现功能：
 * 1. 蒙层进入、退场动画
 * 2. 默认禁止 body 滑动
 * 3. 默认开启路由变化自动关闭蒙层
 * 4. 蒙层默认挂载到 body，在退场后不会卸载元素
 */

type MaskProps = {
    visible?: boolean;                         // 是否显示，默认为 true
    zIndex?: number;                           // 蒙层层级
    duration?: number;                         // 动画时长，单位为 ms
    bgColor?: string;                          // 蒙层背景颜色
    disableBodyScroll?: boolean;               // 是否禁用 body 滚动，默认为 true
    closeOnPopstate?: boolean;                 // 是否在 popstate 时关闭图片预览，默认值 true
    closeOnClickOverlay?: boolean;             // 是否在点击遮罩层后关闭，默认值 true
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
    getContainer?: HTMLElement | (() => HTMLElement) | null;       // 指定挂载的节点
    onMaskClick?: (value?: boolean) => void;   // 点击遮罩层时触发
    afterClose?: () => void;                   // 完全关闭后触发
    children?: React.ReactNode | (() => React.ReactNode);          // Mask children
}

const Mask: React.FC<MaskProps> = (props) => {

    const {
        visible,
        zIndex,
        duration,
        bgColor,
        disableBodyScroll = true,
        closeOnPopstate = true,
        closeOnClickOverlay = true,
        className = '',
        style = {},
        getContainer,
        onMaskClick,
        afterClose,
        children = null,
    } = props

    const [mergeVisible, setMergeVisible] = useMergedState(true, {
        value: visible,
        onChange: (value) => {
            // 只有 value === false 触发
            onMaskClick?.(value)
        },
    })

    // 动画状态锁，防止开发环境下的热更新持续触发 afterClose，要使用 useState，状态更新才能同步更新样式
    const [animatedVisible, setAnimatedVisible] = useState(visible)

    useEffect(() => {
        if (mergeVisible) {
            setAnimatedVisible(true)
        }
    }, [mergeVisible])

    /**
     * @description 禁止 body 滚动
     */
    useEffect(() => {
        const origin = document.body.style.overflow
        if (disableBodyScroll && animatedVisible) {
            // 禁止 body 滚动
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = origin
        }
    }, [disableBodyScroll, animatedVisible])

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

    const handleMaskClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget && closeOnClickOverlay) {
            setMergeVisible(false)
        }
    }

    const onVisibleChanged = (visible: boolean) => {
        if (!visible) {
            // 保证显示是从 true -> false 才会触发 afterClose
            if (animatedVisible) {
                afterClose?.()
            }
            setAnimatedVisible(false)
        }
    }

    // 阻止滑动穿透
    const onTouchMove = (event: React.TouchEvent) => {
        if (disableBodyScroll) event.stopPropagation()
    }

    return renderToContainer(
        <CSSMotion
            visible={mergeVisible}
            motionName={'bin-mask-fade'}
            removeOnLeave={false}
            leavedClassName={'bin-mask-hidden'}
            onVisibleChanged={onVisibleChanged}
        >
            {({ className: motionClassName, style: motionStyle }, ref) => (
                <div
                    ref={ref}
                    role='button'
                    className={clsx('bin-mask', motionClassName, className)}
                    style={{
                        ...motionStyle,
                        ...style,
                        '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                        '--animation-duration': duration ? duration + 'ms' : (style as Record<string, string>)['--animation-duration'],
                        '--bg-color': bgColor ? bgColor : (style as Record<string, string>)['--bg-color'],
                    } as React.CSSProperties }
                    onClick={(event) => handleMaskClick(event)}
                    onTouchMove={onTouchMove}
                >
                    { typeof children === 'function' ? children() : children }
                </div>
            )}
        </CSSMotion>,
        getContainer,
    )
}

export default Mask
