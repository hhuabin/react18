/**
 * @Author: bin
 * @Date: 2026-02-10 17:47:47
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 10:12:47
 */
import { useState, useRef } from 'react'

import CSSMotion, { type CSSMotionRef } from '@/components/CSSMotion'
import { clsx } from './utils/clsx'
import { getRect } from '@/hooks/dom/useRect'

import type { DialogProps } from './interface.d'

interface ContentProps extends Omit<
    DialogProps,
    'mask' | 'maskClosable' | 'zIndex' | 'afterClose'    // 这些是 RCDialog 需要消费的属性
> {
    onVisibleChanged?: (visible: boolean) => void;       // 弹窗显示状态改变时触发
}

const Content: React.FC<ContentProps> = (props) => {

    const {
        visible = false,
        closable = false,
        destroyOnHidden = false,
        forceRender = false,
        onClose,
        onVisibleChanged,

        title = null,
        children = null,
        footer = null,

        mousePosition,
        motionName = 'bin-dialog-zoom',
        width,
        duration,
        className,
        style = {},
    } = props

    const dialogRef = useRef<CSSMotionRef>(null)

    // 记忆鼠标位置
    const [transformOrigin, setTransformOrigin] = useState('')

    // 测量弹窗大小
    const onPrepare = () => {
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

    const headerNode = title ? (
        <div className='bin-dialog-header'>
            { title }
        </div>
    ) : null

    const content = (
        <div className='bin-dialog-content'>
            { children }
        </div>
    )

    const footerNode = footer ? (
        <div className='bin-dialog-footer'>
            { footer }
        </div>
    ) : null

    const closerNode = closable ? (
        <button
            type='button'
            onClick={(e) => onClose?.(e)}
            className='bin-dialog-close'
        >
            <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                <line x1='35' y1='35' x2='65' y2='65' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
                <line x1='65' y1='35' x2='35' y2='65' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
            </svg>
        </button>
    ) : null

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
                        {headerNode}
                        {content}
                        {footerNode}
                        {closerNode}
                    </div>
                </div>
            )}
        </CSSMotion>
    )
}

export default Content
