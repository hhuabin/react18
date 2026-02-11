/**
 * @Author: bin
 * @Date: 2026-02-10 10:13:42
 * @LastEditors: bin
 * @LastEditTime: 2026-02-11 16:27:33
 */
import { renderToContainer } from './utils/renderToContainer'

import Mask from './Mask'
import Content from './Content'
import './style/Dialog.less'

type RCDialogProps = {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;
    mask?: boolean;                            // 是否显示 Mask 蒙层，默认为 false
    duration?: number;                         // 动画时长，单位为 ms
    zIndex?: number;                           // 蒙层层级
    onClose?: () => void;                      // Dialog 关闭时触发
    afterClose?: () => void;                   // 动画执行完成，关闭函数，可以执行卸载逻辑

    title?: React.ReactNode | (() => React.ReactNode);           // RCDialog title
    children?: React.ReactNode | (() => React.ReactNode);        // RCDialog content
    footer?: React.ReactNode | (() => React.ReactNode);          // RCDialog footer

    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}

const RCDialog: React.FC<RCDialogProps> = (props) => {

    const {
        visible = false,
        closable = false,
        mask = true,
        duration,
        zIndex = 999,
        onClose,
        afterClose,

        title,
        children,
        footer,

        className,
        style = {},
        getContainer,
    } = props

    // 点击遮罩层时触发
    const onMaskClick = () => {}

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
                    onClose={() => onClose?.()}
                    afterClose={() => afterClose?.()}

                    title={title}
                    children={children}
                    footer={footer}

                    className={className}
                    style={style}
                ></Content>
            </div>
        </div>,
        getContainer,
    )
}

export default RCDialog
