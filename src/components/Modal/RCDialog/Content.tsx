import { useState, useRef, useEffect } from 'react'

import useRect, { getRect } from '@/hooks/domHooks/useRect'

type ContentProps = {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;                        // 是否显示关闭按钮
    duration?: number;                         // 动画时长，单位为 ms
    onClose?: () => void;                      // Dialog 关闭时触发
    afterClose?: () => void;                   // 动画执行完成，关闭函数，可以执行卸载逻辑

    title?: React.ReactNode;                   // RCDialog title
    children?: React.ReactNode;                // RCDialog content
    footer?: React.ReactNode;                  // RCDialog footer

    mousePosition?: {x: number, y: number} | null;     // 设置当前鼠标的pageX和pageY
    width?: string | number;                   // 宽度
    height?: string | number;                  // 高度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
}

const Content: React.FC<ContentProps> = (props) => {

    const {
        visible = false,
        closable = false,
        duration,
        onClose,
        afterClose,

        title,
        children,
        footer,

        mousePosition,
        width,
        height,
        className,
        style = {},
    } = props

    const dialogRef = useRef<HTMLDivElement | null>(null)
    // 记忆鼠标位置
    const [transformOrigin, setTransformOrigin] = useState('')

    // 获取元素尺寸
    const dialogRect = getRect(dialogRef.current!)

    useEffect(() => {
        if (visible) {
            changeTransformOrigin()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    // 什么时候去改变 transformOrigin 的值？在
    // transfrom 会改变元素的 getBoundingClientRect 返回值，所以解决该bug需要使用样式状态机
    const changeTransformOrigin = () => {
        const transformOrigin = mousePosition && (mousePosition.x || mousePosition.y)
            ? `${mousePosition.x - dialogRect.left}px ${mousePosition.y - dialogRect.top}px`
            : ''

        setTransformOrigin(transformOrigin)
    }

    /**
     * @description 过渡结束触发
     * 相比 onAnimationEnd，不会造成初始的 bin-mask-hidden 动画执行
     */
    const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return

        // 👇 只在「隐藏完成」时处理
        if (!visible) {
            afterClose?.()
        }
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
        <div
            role='dialog'
            ref={dialogRef}
            className={'bin-dialog' + (className ? ' ' + className : '') + (visible ? '' : ' bin-dialog-hidden')}
            onTransitionEnd={(e) => onTransitionEnd(e)}
            style={{
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
    )
}

export default Content
