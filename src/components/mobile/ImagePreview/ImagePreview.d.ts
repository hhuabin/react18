/**
 * @Author: bin
 * @Date: 2026-01-13 17:13:04
 * @LastEditors: bin
 * @LastEditTime: 2026-01-14 15:48:52
 */

export type ImagePreviewProps = {
    visible?: boolean;                         // 是否显示，默认为 false
    direction?: 'horizontal' | 'vertical';     // 滚动方向，默认为 'horizontal'
    loop?: boolean;                            // 是否循环播放，默认值 false
    defaultIndex?: number;                     // 默认显示第几张图片，默认值 0
    images?: string[];                        // 图片地址列表，默认值 []
    maxZoom?: number;                          // 最大缩放倍数，默认值 3
    minZoom?: number;                          // 最小缩放倍数，默认值 1 / 3
    closeOnPopstate?: boolean;                 // 是否在 popstate 时关闭图片预览，默认值 true
    closeOnClickImage?: boolean;               // 是否允许点击图片关闭，默认值 true
    closeOnClickOverlay?: boolean;             // 是否在点击遮罩层后关闭图片预览，默认值 true
    doubleScale?: boolean;                     // 是否启用双击缩放手势，禁用后，点击时会立即关闭图片预览，默认值 true。不建议禁用，由于触发的是 onTouchEnd，容易造成点击穿透
    // 穿透的具体原因：浏览器在 touch 结束后补发 click，而元素已卸载，click 落到下层
    stopPropagation?: boolean;                 // 是否阻止滑动事件冒泡，默认为 true
    showIndicator?: boolean;                   // 是否显示指示器，默认为 true
    indicator?: (total: number, current: number) => React.ReactNode;         // 自定义指示器，优先级比 showIndicator 高
    showCloseBtn?: boolean;                    // 是否显示关闭按钮，默认值 false
    renderFooter?: (index: number) => React.ReactNode;                       // 渲染底部额外内容
    className?: string;                        // 自定义类名
    style?: React.CSSProperties;               // 自定义样式
    getContainer?: HTMLElement | (() => HTMLElement) | null;                 // 指定挂载的节点
    onClose?: (value?: boolean) => void;       // 关闭时触发
    afterClose?: () => void;                   // 关闭动画结束后触发
    onIndexChange?: (index: number) => void;   // 切换时触发
    onLongPress?: (index: number) => void;     // 长按当前图片时触发
}

export type ImagePreviewOptions = Omit<ImagePreviewProps, 'visible'>

export type ImagePreviewRef = {
    swipeTo: (index: number) => void;          // 切换到指定位置
    resetScale: () => void;                    // 重置当前图片的缩放比
}
