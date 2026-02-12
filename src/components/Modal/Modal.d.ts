/**
 * @description Modal 组件的 props 参数，需要支持 Modal 的组件调用
 */
export interface ModalProps {
    open?: boolean;
    // 定义内容
    title?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    // 定义按钮样式
    confirmText?: string;
    confirmType?: 'default' | 'primary';       // 确定按钮样式
    cancelText?: string;
    cancelColor?: string;

    zIndex?: number;
    closable?: boolean;
    mask?: boolean;
    maskClosable?: boolean;

    onConfirm?: () => void;
    onCancel?: () => void;

    width?: string | number;                   // 宽度
    height?: string | number;                  // 高度
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式

    getContainer?: HTMLElement | (() => HTMLElement) | null;     // 指定挂载的节点
}

export interface ModalFuncProps extends ModalProps {
    content?: React.ReactNode;
    afterClose?: () => void;
    type?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm'
}

// info 等方法的函数
export type ModalFunc = (props: ModalFuncProps) => {
    destroy: () => void;
    update: (config: ModalFuncProps) => void;
}

// 定义 info 等方法
export type ModalStaticFunctions = Record<NonNullable<ModalFuncProps['type']>, ModalFunc>

