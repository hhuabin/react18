
// 记忆鼠标点击的位置
export type MousePosition = { x: number; y: number } | null

export type ModalFooter =
    | React.ReactNode
    | ((
        handleConfirm: NonNullable<ModalProps['onConfirm']>,
        handleCancel: NonNullable<ModalProps['onCancel']>,
    ) => React.ReactNode)

/**
 * @description Modal 组件的 props 参数，需要支持 Modal 的组件调用
 */
export interface ModalProps {
    open?: boolean;

    // 弹窗属性
    zIndex?: number;
    closable?: boolean;
    mask?: boolean;
    maskClosable?: boolean;
    destroyOnHidden?: boolean;                 // 关闭时销毁 Dialog
    forceRender?: boolean;                     // 强制渲染 Modal

    // 弹窗内容
    title?: React.ReactNode;
    children?: React.ReactNode;
    footer?: ModalFooter
    confirmText?: string;
    confirmType?: 'default' | 'primary';       // 确定按钮样式
    cancelText?: string;
    cancelColor?: string;

    // 弹窗事件
    onConfirm?: () => void;
    onCancel?: () => void;
    afterClose?: () => void;

    mousePosition?: MousePosition;
    motionName?: string;                       // 动画名称
    width?: string | number;                   // 宽度
    height?: string | number;                  // 高度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}

export interface ModalFuncProps extends ModalProps {
    content?: React.ReactNode;
    type?: 'info' | 'success' | 'error' | 'warning' | 'confirm'
}

// info 等方法的函数
export type ModalFunc = (props: ModalFuncProps) => {
    destroy: () => void;
    update: (config: ModalFuncProps) => void;
}

// 定义 info 等方法
export type ModalStaticFunctions = Record<NonNullable<ModalFuncProps['type']>, ModalFunc>
