import { useRef } from 'react'

type ContentProps = {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;                        // 是否显示关闭按钮
    duration?: number;                         // 动画时长，单位为 ms
    onClose?: () => void;                      // Dialog 关闭时触发
    afterClose?: () => void;                   // 动画执行完成，关闭函数，可以执行卸载逻辑

    title?: React.ReactNode | (() => React.ReactNode);           // RCDialog title
    children?: React.ReactNode | (() => React.ReactNode);        // RCDialog content
    footer?: React.ReactNode | (() => React.ReactNode);          // RCDialog footer

    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
}

const Content: React.FC<ContentProps> = (props) => {

    const {
        visible = false,
        closable = false,
        duration = 300,
        onClose,
        afterClose,

        title,
        children,
        footer,

        className,
        style = {},
    } = props

    const dialogRef = useRef<HTMLDivElement | null>(null)

    /**
     * @description 过渡结束触发
     * 相比 onAnimationEnd，不会造成初始的 bin-mask-hidden 动画执行
     */
    const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return
        if (event.propertyName !== 'opacity') return

        // 👇 只在「隐藏完成」时处理
        if (!visible) {
            afterClose?.()
        }
    }

    const headerNode = title ? (
        <div className='bin-dialog-header'>
            { typeof title === 'function' ? title() : title }
        </div>
    ) : null

    const content = (
        <div className='bin-dialog-body'>
            { typeof children === 'function' ? children() : children }
        </div>
    )

    const footerNode = footer ? (
        <div className='bin-dialog-footer'>
            { typeof footer === 'function' ? footer() : footer }
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
                '--animation-duration': duration ? duration + 'ms' : (style as Record<string, string>)['--animation-duration'],
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
