/**
 * @Author: bin
 * @Date: 2026-02-10 10:36:41
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 10:13:09
 */
import { useRef, useEffect } from 'react'

import CSSMotion from '@/components/CSSMotion'
import { clsx } from './utils/clsx'
import './style/Mask.less'

/**
 * @description 主要实现功能：
 * 1. 蒙层进入、退场动画
 * 2. 默认禁止 body 滑动
 */

type MaskProps = {
    visible?: boolean;                         // 是否显示，默认为 true
    zIndex?: number;                           // 蒙层层级
    duration?: number;                         // 动画时长，单位为 ms
    bgColor?: string;                          // 蒙层背景颜色
    disableBodyScroll?: boolean;               // 是否禁用 body 滚动，默认为 true
    // closeOnPopstate?: boolean;                 // 是否在 popstate 时关闭图片预览，默认值 true
    // closeOnClickOverlay?: boolean;             // 是否在点击遮罩层后关闭，默认值 true
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
    // getContainer?: HTMLElement | (() => HTMLElement) | null;       // 指定挂载的节点
    onMaskClick?: (event: React.MouseEvent) => void;                  // 点击遮罩层时触发
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
        className = '',
        style = {},
        onMaskClick,
        afterClose,
        children = null,
    } = props

    // 动画状态锁，防止开发环境下的热更新持续触发 afterClose
    const animatedVisibleRef = useRef(visible)

    useEffect(() => {
        if (visible) {
            animatedVisibleRef.current = true
        }
    }, [visible])

    /**
     * @description 禁止 body 滚动
     */
    useEffect(() => {
        const origin = document.body.style.overflow
        if (disableBodyScroll && visible) {
            // 禁止 body 滚动
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = origin
        }
    }, [disableBodyScroll, visible])

    const handleMaskClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
            onMaskClick?.(event)
        }
    }

    // 阻止滑动穿透
    const onTouchMove = (event: React.TouchEvent) => {
        if (disableBodyScroll) event.stopPropagation()
    }

    const onVisibleChanged = (visible: boolean) => {
        if (!visible) {
            // 保证显示是从 true -> false 才会触发 afterClose
            if (animatedVisibleRef.current) {
                afterClose?.()
            }
            animatedVisibleRef.current = false
        }
    }

    return (
        <CSSMotion
            visible={visible}
            motionName={'bin-dialog-mask-fade'}
            removeOnLeave={false}
            leavedClassName={'bin-dialog-mask-hidden'}
            onVisibleChanged={onVisibleChanged}
        >
            {({ className: motionClassName, style: motionStyle }, ref) => (
                <div
                    ref={ref}
                    role='button'
                    className={clsx('bin-dialog-mask', motionClassName, className)}
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
        </CSSMotion>
    )
}

export default Mask
