/**
 * @Author: bin
 * @Date: 2026-02-10 10:13:42
 * @LastEditors: bin
 * @LastEditTime: 2026-03-25 17:30:29
 */
import { useRef, useEffect } from 'react'

import { renderToContainer } from './utils/renderToContainer'
import Mask from './Mask'
import Content from './Content'
import './style/Dialog.less'

type RCDialogProps = {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;                        // 是否显示关闭按钮，默认为 false
    mask?: boolean;                            // 是否显示 Mask 蒙层，默认为 false
    maskClosable?: boolean;                    // 点击蒙层是否允许关闭
    destroyOnHidden?: boolean;                 // 关闭时销毁 Dialog
    duration?: number;                         // 动画时长，单位为 ms
    zIndex?: number;                           // 蒙层层级
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

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}

const RCDialog: React.FC<RCDialogProps> = (props) => {

    const {
        visible = false,
        closable = false,
        mask = true,
        maskClosable = false,
        destroyOnHidden = true,
        duration,
        zIndex = 999,
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
        getContainer,
    } = props

    // 动画状态锁，防止开发环境下的热更新持续触发 afterClose
    const animatedVisibleRef = useRef(visible)

    useEffect(() => {
        if (visible) {
            animatedVisibleRef.current = true
        }
    }, [visible])

    // 点击遮罩层时触发
    const onMaskClick = () => {
        if (maskClosable) {
            onClose?.()
        }
    }

    const onDialogVisibleChanged = (dialogVisible: boolean) => {
        if (!dialogVisible) {
            // 保证显示是从 true -> false 才会触发 afterClose
            if (animatedVisibleRef.current) {
                afterClose?.()
            }
            animatedVisibleRef.current = false
        }
    }

    return renderToContainer(
        // 统一容器
        <div className='rc-dialog'>
            {/* 蒙层 */}
            <Mask
                visible={mask && visible}
                duration={duration}
                zIndex={zIndex}
                onMaskClick={onMaskClick}
            ></Mask>

            <div
                className={'bin-dialog-warp' + (className ? ' ' + className : '')}
                style={{
                    ...style,
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                } as React.CSSProperties}
            >
                <Content
                    visible={visible}
                    closable={closable}
                    duration={duration}
                    forceRender={destroyOnHidden}
                    onClose={() => onClose?.()}
                    onVisibleChanged={onDialogVisibleChanged}

                    title={title}
                    children={children}
                    footer={footer}

                    mousePosition={mousePosition}
                    motionName={'bin-dialog-zoom'}
                    width={width}
                    height={height}
                    className={className}
                    style={style}
                ></Content>
            </div>
        </div>,
        getContainer,
    )
}

export default RCDialog
