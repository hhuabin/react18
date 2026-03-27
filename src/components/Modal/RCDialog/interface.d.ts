/**
 * @Author: bin
 * @Date: 2026-03-26 10:23:11
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 09:27:02
 */
export interface DialogProps {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    closable?: boolean;                        // 是否显示关闭按钮，默认为 false
    mask?: boolean;                            // 是否显示 Mask 蒙层，默认为 true
    maskClosable?: boolean;                    // 点击蒙层是否允许关闭，默认为 false
    destroyOnHidden?: boolean;                 // 关闭时销毁 Dialog 里的子元素，默认为 false
    forceRender?: boolean;                     // 强制渲染 Dialog，默认为 false
    duration?: number;                         // 动画时长，单位为 ms
    zIndex?: number;                           // 蒙层层级
    onClose?: (e: React.SyntheticEvent) => void;         // Dialog 关闭时触发
    afterClose?: () => void;                   // 动画执行完成，关闭函数，可以执行卸载逻辑

    // 弹窗内容
    title?: React.ReactNode;                   // RCDialog title
    children?: React.ReactNode;                // RCDialog content
    footer?: React.ReactNode;                  // RCDialog footer

    mousePosition?: {x: number, y: number} | null;       // 设置当前鼠标的pageX和pageY
    motionName?: string;                       // 动画名称
    width?: string | number;                   // 宽度
    height?: string | number;                  // 高度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}
