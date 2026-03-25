import { useState, useRef } from 'react'

import CSSMotion, { type CSSMotionRef } from '@/components/CSSMotion'
import { clsx } from './utils/clsx'
import { getRect } from '@/hooks/domHooks/useRect'

type ContentProps = {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;                        // 是否显示关闭按钮
    destroyOnHidden?: boolean;                 // 关闭时销毁 Modal 里的子元素
    forceRender?: boolean;                     // 强制渲染 Modal
    duration?: number;                         // 动画时长，单位为 ms
    onClose?: () => void;                      // Dialog 关闭时触发
    onVisibleChanged?: (visible: boolean) => void;      // 显示状态改变时触发

    // 弹窗内容
    title?: React.ReactNode;                   // RCDialog title
    children?: React.ReactNode;                // RCDialog content
    footer?: React.ReactNode;                  // RCDialog footer

    // 弹窗样式
    mousePosition?: {x: number, y: number} | null;     // 设置当前鼠标的pageX和pageY
    motionName?: string;                       // 动画名称
    width?: string | number;                   // 宽度
    height?: string | number;                  // 高度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
}

const Content: React.FC<ContentProps> = (props) => {

    const {
        visible = false,
        closable = false,
        destroyOnHidden = false,
        forceRender = false,
        duration,
        onClose,
        onVisibleChanged,

        title,
        children,
        footer,

        mousePosition,
        motionName,
        width,
        height,
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

        const transformOrigin = mousePosition && (mousePosition.x || mousePosition.y)
            ? `${mousePosition.x - dialogRect.left - window.pageXOffset}px ${mousePosition.y - dialogRect.top - window.pageXOffset}px`
            : ''

        setTransformOrigin(transformOrigin)
    }

    const headerNode = title ? (
        <div className='bin-dialog-header'>
            { title }
        </div>
    ) : null

    const content = (
        <div className='bin-dialog-body'>
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
            onClick={() => onClose?.()}
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
                        height: height ? height : style['height'],
                        '--animation-duration': duration ? duration + 'ms' : (style as Record<string, string>)['--animation-duration'],
                        transformOrigin,
                    } as React.CSSProperties }
                >
                    <div className='bin-dialog-content'>
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
