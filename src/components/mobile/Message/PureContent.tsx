/**
 * @Author: bin
 * @Date: 2026-04-08 20:51:19
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 20:51:26
 */
import type { NoticeType } from './Message.d'

import './style/message.less'
import renderIcon from './utils/renderIcon'

export interface PureContentProps {
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;

    type?: NoticeType;
    icon?: React.ReactNode;
    showCloseBtn?: boolean;
    children?: React.ReactNode;
    onClose?: VoidFunction;
}

const PureContent: React.FC<PureContentProps> = (props) => {

    const {
        prefixCls,
        className,
        style,

        type,
        icon,
        showCloseBtn,
        children,
        onClose,
    } = props

    return (
        <div
            className={`${prefixCls}-custom-content` + (className ? ` ${className}` : '')}
            style={style}
        >
            { icon
                ? icon
                : (
                        type && (
                            <span className={`${prefixCls}-icon`}>
                                { renderIcon(type) }
                            </span>
                        )
                    )
            }
            <span className={`${prefixCls}-content`}>{ children }</span>
            { showCloseBtn && (
                <span
                    className={`${prefixCls}-close`}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onClose?.()
                    }}
                >
                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                        <line x1='25' y1='25' x2='75' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                        <line x1='75' y1='25' x2='25' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                    </svg>
                </span>
            )}
        </div>
    )
}

export default PureContent
