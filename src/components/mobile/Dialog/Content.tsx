/**
 * @Author: bin
 * @Date: 2026-03-27 16:17:35
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 10:12:18
 */
import { useState, useRef } from 'react'

import CSSMotion, { type CSSMotionRef } from '@/components/CSSMotion'
import { clsx } from './utils/clsx'
import { getRect } from '@/hooks/domHooks/useRect'

import type { DialogProps } from './interface.d'

interface ContentProps extends Omit<
    DialogProps,
    'mask' | 'closeOnMaskClick' | 'zIndex' | 'afterClose'    // 这些是 RCDialog 需要消费的属性
> {
    onVisibleChanged?: (visible: boolean) => void;       // 弹窗显示状态改变时触发
}

const Content: React.FC<ContentProps> = (props) => {

    const {
        visible = false,
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = '确认',
        confirmButtonColor,
        cancelButtonText = '取消',
        cancelButtonColor,

        destroyOnHidden = false,
        forceRender = false,
        duration,
        onCancel,
        onConfirm,
        onVisibleChanged,

        title = null,
        children = null,
        footer = null,

        mousePosition,
        diableMousePosition = false,
        motionName = 'bin-dialog-zoom',
        width,
        className,
        style = {},
    } = props

    const dialogRef = useRef<CSSMotionRef>(null)

    // 记忆鼠标位置
    const [transformOrigin, setTransformOrigin] = useState('')

    // 测量弹窗大小
    const onPrepare = () => {
        if (diableMousePosition) return
        if (!dialogRef.current?.nativeElement) return

        // 获取元素尺寸
        const dialogRect = getRect(dialogRef.current.nativeElement)

        // mousePosition 是相对于视口的，dialogRect 是相对于 html 的，故而需要加入 pageXOffset 计算
        const transformOrigin = mousePosition && (mousePosition.x || mousePosition.y)
            ? `${mousePosition.x - dialogRect.left - window.pageXOffset}px ${
                mousePosition.y - dialogRect.top - window.pageYOffset
            }px`
            : ''

        setTransformOrigin(transformOrigin)
    }

    const handleConfirm = () => {
        onConfirm?.()
    }
    const handleCancel = () => {
        onCancel?.()
    }

    const headerNode = (): React.ReactNode => {
        const headerClassName = children ? 'bin-dialog-header' : 'bin-dialog-header bin-dialog-header-isolated'
        if (title) {
            return (
                <div className={headerClassName}>
                    { title }
                </div>
            )
        }
        return null
    }

    const content = () => {

        const contentClassName = title ? 'bin-dialog-content' : 'bin-dialog-content bin-dialog-content-isolated'
        const messageClassName = title ? 'bin-dialog-message bin-dialog-message-has-title' : 'bin-dialog-message'

        return (
            <div className={contentClassName}>
                {
                    (typeof children === 'string' || typeof children === 'number') ? (
                        <div className={messageClassName}>
                            { children }
                        </div>
                    ) : (
                        children
                    )
                }
            </div>
        )
    }

    const footerNode = () => {
        let footerNode: React.ReactNode
        if (footer) {
            if (typeof footer === 'function') {
                footerNode = footer(handleConfirm, handleCancel)
            } else {
                footerNode = footer
            }
        } else {
            // 当也有确认按钮的时候，展示按钮中间的分隔线
            const cancelButtonClassName = showConfirmButton ? 'bin-dialog-footer-button bin-dialog-dividing-line' : 'bin-dialog-footer-button'

            footerNode = (
                <div className='bin-dialog-footer'>
                    {
                        showCancelButton && (
                            <button
                                type='button'
                                className={cancelButtonClassName}
                                style={{ color: cancelButtonColor ? cancelButtonColor : '' }}
                                onClick={() => handleCancel?.()}
                            >
                                <span className='bin-dialog-footer-button-content'>{ cancelButtonText }</span>
                            </button>
                        )
                    }
                    {
                        showConfirmButton && (
                            <button
                                type='button'
                                className='bin-dialog-footer-button bin-dialog-footer-confirm-button'
                                style={{ color: confirmButtonColor ? confirmButtonColor : '' }}
                                onClick={() => handleConfirm?.()}
                            >
                                <span className='bin-dialog-footer-button-content'>{ confirmButtonText }</span>
                            </button>
                        )
                    }
                </div>
            )
        }

        return footerNode
    }

    return (
        <CSSMotion
            ref={dialogRef}
            visible={visible}
            motionName={motionName}
            forceRender={forceRender}
            removeOnLeave={destroyOnHidden}
            onVisibleChanged={onVisibleChanged}
            onAppearPrepare={onPrepare}
            onEnterPrepare={onPrepare}
        >
            {({ className: motionClassName, style: motionStyle }, ref) => (
                <div
                    role='dialog'
                    ref={ref}
                    className={clsx('bin-dialog', motionClassName, className)}
                    style={{
                        ...motionStyle,
                        ...style,
                        width: width ? width : style['width'],
                        '--animation-duration': duration ? duration + 'ms' : (style as Record<string, string>)['--animation-duration'],
                        transformOrigin,
                    } as React.CSSProperties }
                >
                    <div className='bin-dialog-body'>
                        {headerNode()}
                        {content()}
                        {footerNode()}
                    </div>
                </div>
            )}
        </CSSMotion>
    )
}

export default Content
