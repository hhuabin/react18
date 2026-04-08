// 消息的显示位置；如 message 为 'top'、notification 为 'topRight'，当前只考虑 message 的情况，其他情况有需要再开发
export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

// 消息参数
export interface NoticeConfig {
    content?: React.ReactNode;                 // 消息内容
    duration?: number;                         // 显示时长
    pauseOnHover?: boolean;                    // 悬停时是否暂停计时器，默认值为 true
    showProgress?: boolean;                    // 倒计时进度条，仅作用在 Notice
    closable?: boolean | ({ closeIcon?: React.ReactNode } & React.AriaAttributes);     // 是否显示关闭按钮，提供 closeIcon 会覆盖关闭按钮元素
    className?: string;                        // 自定义类名，将会被赋到 notice 上
    style?: React.CSSProperties;               // 自定义样式，将会被赋到 notice 上
    onClose?: VoidFunction;                    // 开发者传入的关闭回调（不等待动画完成）
    onClick?: React.MouseEventHandler<HTMLDivElement>;   // 点击回调
}

export interface OpenConfig extends NoticeConfig {
    key: React.Key;                            // 唯一 key
    placement?: Placement;                     // 显示位置，这里默认是 'top'，不做其他提示的处理
}

// times 用于标记“同一个 key 的通知被更新了多少次”，从而触发 Notice 内部副作用（主要是重新计时），初始值为 0
export type InnerOpenConfig = OpenConfig & { times?: number }
