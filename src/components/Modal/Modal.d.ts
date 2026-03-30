/**
 * @Author: bin
 * @Date: 2026-02-11 17:20:36
 * @LastEditors: bin
 * @LastEditTime: 2026-03-30 15:11:32
 */

// 记忆鼠标点击的位置
export type MousePosition = { x: number; y: number } | null

export type ModalFooter =
    | React.ReactNode
    | ((
        onConfirm: NonNullable<ModalProps['onConfirm']>,
        onCancel: NonNullable<ModalProps['onCancel']>,
    ) => React.ReactNode)

/**
 * @description Modal 组件的 props 参数，需要支持 Modal 的组件调用
 */
export interface ModalProps {
    open?: boolean;

    // 弹窗属性
    closable?: boolean;                        // 是否显示右上角的关闭按钮
    mask?: boolean;                            // 是否展示遮罩
    maskClosable?: boolean;                    // 点击遮罩层是否可以关闭
    destroyOnHidden?: boolean;                 // 关闭时销毁 Dialog
    forceRender?: boolean;                     // 强制渲染 Modal

    // 弹窗内容
    title?: React.ReactNode;                   // 弹窗标题
    children?: React.ReactNode;                // 弹窗内容
    footer?: ModalFooter                       // 弹窗底部内容
    confirmText?: string;                      // 确定按钮文字
    confirmType?: 'default' | 'primary';       // 确定按钮样式
    cancelText?: string;                       // 取消按钮文字
    cancelColor?: string;                      // 取消按钮颜色

    // 弹窗事件
    onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void;  // 点击确定按钮的回调
    onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;   // 点击遮罩层或右上角叉或取消按钮的回调
    afterClose?: () => void;                   // 弹窗关闭后回调

    mousePosition?: MousePosition;             // 自定义鼠标点击的位置
    motionName?: string;                       // 动画名称
    width?: string | number;                   // 宽度
    duration?: number;                         // 动画时长，单位为 ms
    zIndex?: number;                           // 设置 Modal 的 z-index
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}

export interface ModalFuncProps extends ModalProps {
    content?: React.ReactNode;
    type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
}

export interface ModalType {
    destroy: () => void;
    update: (config: ModalFuncProps) => void;
}

// info 等方法的函数
export type ModalFunc = (props: ModalFuncProps) => ModalType

// 定义 info 等方法
export type ModalStaticFunctions = Record<NonNullable<ModalFuncProps['type']>, ModalFunc>
