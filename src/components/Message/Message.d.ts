/**
 * @Author: bin
 * @Date: 2025-06-10 11:22:45
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 16:58:22
 */
export type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading'

// useMessage() / message.config() 的参数类型
export interface ConfigOptions {
    // top?: string | number;                  // 消息距离顶部的位置
    duration?: number;                         // 默认自动关闭延时，单位毫秒，默认值 3000
    prefixCls?: string;                        // 样式 className 前缀
    pauseOnHover?: boolean;                    // 鼠标悬停时，是否暂停计时器
    className?: string;                        // 自定义 CSS class。将会传给 content 容器
    style?: React.CSSProperties;               // 自定义提示内联样式。将会传给 content 容器
    getContainer?: () => HTMLElement;          // 配置渲染节点的输出位置，默认为 () => document.body
    transitionName?: string;                   // 配置动画名称，最终动画名称为 prefixCls + transitionName
    maxCount?: number;                         // 最大显示数，超过限制时，最早的消息会被自动关闭
    // rtl?: boolean;                          // 是否开启 RTL 模式，文字从左边开始读
}

// message.open() 的参数类型
export interface ArgsProps {
    content: React.ReactNode;                  // 消息内容
    duration?: number;                         // 自动关闭的延时，单位毫秒秒。设为 0 时不自动关闭，默认值 3000
    type?: NoticeType;                         // 消息类型
    icon?: React.ReactNode;                    // 自定义图标
    key?: React.Key;                           // 当前提示的唯一标志
    pauseOnHover?: boolean;                    // 鼠标悬停时，是否暂停计时器
    showCloseBtn?: boolean;                    // 是否展示关闭按钮
    className?: string;                        // 自定义 CSS class
    style?: React.CSSProperties;               // 自定义该提示内联样式
    onClose?: () => void;                      // 消息关闭时的回调函数
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;     // 点击消息时触发
}

// 用于显示用的单个消息类型
export interface MessageConfig extends ConfigOptions, ArgsProps {
    key: React.Key;                            // 这里的key已经被默认赋值过了，不再是可选值
}

// message.info()... 的参数类型
export type JointContent = React.ReactNode | ArgsProps

interface OpenTask {
    type: 'open';
    config: ArgsProps;
    resolve: VoidFunction;
    setCloseFn: (closeFn: VoidFunction) => void;
    skipped?: boolean;   // 跳过当前任务，默认为 undefined
}

interface TypeTask {
    type: NoticeType;
    args: Parameters<TypeOpen>;
    resolve: VoidFunction;
    setCloseFn: (closeFn: VoidFunction) => void;
    skipped?: boolean;   // 跳过当前任务，默认为 undefined
}

export type Task =
    | OpenTask
    | TypeTask
    | {
        type: 'destroy';
        key?: React.Key;
        skipped?: boolean;   // 跳过当前任务，默认为 undefined
    }

/**
 * @descCN 函数用于关闭消息通知，函数中有.then()方法，可以被调用
 */
export interface MessageType extends PromiseLike<boolean> {
    (): void;
}

// message.info() / message.success()... 的函数类型
export type TypeOpen = {
    /**
     * @param { number } duration 消息通知持续显示的时间
     * @param { VoidFunction } onClose 消息通知关闭时进行调用的回调函数
     */
    (content: JointContent): MessageType;
    (content: JointContent, onClose: VoidFunction): MessageType;
    (content: JointContent, duration: number, onClose?: VoidFunction): MessageType;
}

export interface BaseMethods {
    open: (config: ArgsProps) => MessageType;
    destroy: (key?: React.Key) => void;
    config: (config: ConfigOptions) => void;
    useMessage: (messageConfig?: ConfigOptions) => readonly [MessageInstance, React.ReactElement];
}

export interface MessageMethods {
    info: TypeOpen;
    success: TypeOpen;
    error: TypeOpen;
    warning: TypeOpen;
    loading: TypeOpen;
}

export interface MessageInstance extends MessageMethods, Pick<BaseMethods, 'open' | 'destroy'> {}
export interface BaseStaticMethods extends MessageMethods, BaseMethods {}

export interface GlobalMessage {
  fragment: DocumentFragment;
  instance?: MessageInstance | null;
  sync?: VoidFunction;
}
