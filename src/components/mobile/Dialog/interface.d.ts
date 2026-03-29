/**
 * @Author: bin
 * @Date: 2026-03-26 10:23:11
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 16:19:34
 */

// 记忆鼠标点击的位置
export type MousePosition = { x: number; y: number } | null

export interface DialogProps {
    visible?: boolean;                         // 是否显示 Dialog，默认为 false
    showConfirmButton?: boolean;               // 是否展示确认按钮，默认为 true
    showCancelButton?: boolean;                // 是否展示取消按钮，默认为 false
    confirmButtonText?: string;                // 确认按钮文案，默认为 确认
    confirmButtonColor?: string;               // 确认按钮颜色，默认为 #1989fa
    cancelButtonText?: string;                 // 取消按钮文案，默认为 取消
    cancelButtonColor?: string;                // 取消按钮颜色，默认为 #6b6375

    mask?: boolean;                            // 是否显示 Mask 蒙层，默认为 true
    closeOnMaskClick?: boolean;                // 点击蒙层是否允许关闭，默认为 false
    closeOnPopstate?: boolean;                 // 是否在页面回退时自动关闭，默认值 true
    disableBodyScroll?: boolean;               // 是否禁用 body 滚动，默认为 true
    destroyOnHidden?: boolean;                 // 关闭时销毁 Dialog 里的子元素，默认为 false
    forceRender?: boolean;                     // 强制渲染 Dialog，默认为 false
    duration?: number;                         // 动画时长，单位为 ms
    zIndex?: number;                           // 蒙层层级
    onCancel?: () => void;                     // 点击取消按钮时触发
    onConfirm?: () => void;                    // 点击确认按钮时触发
    afterClose?: () => void;                   // 动画执行完成，关闭函数，可以执行卸载逻辑

    // 弹窗内容
    title?: React.ReactNode;                   // Dialog title
    children?: React.ReactNode;                // Dialog content
    footer?: React.ReactNode;                  // Dialog footer

    mousePosition?: {x: number, y: number} | null;              // 设置当前鼠标的pageX和pageY
    motionName?: string;                       // 动画名称
    width?: string | number;                   // 宽度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}
