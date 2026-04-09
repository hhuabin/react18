# 原理

直接原理：使用 `React.createPortal` 将 `Message` 组件渲染到 自定义元素 或者 `document.body`中

设计理念：

1. `useMessage` 基于 `notification` 核心库做代理
1. 需要支持全局 `message` 调用，所以有 `Message.tsx` 的产出

---

设计原理总共分为三层结构：

- 第一层（最外层）：`Message.tsx`

   1. `open / typeOpen`：代理 `message` 的所有方法，每次任务触发的方法都会收入到 `taskQueue` 中
   2. `flushNotice`：消费 `taskQueue`，将其转发到 `MessageInstance` 实例中
   3. 使用唯一空标签容器 `document.createDocumentFragment()`

- 第二层（代理层）：`useMessage.tsx` 

   1. `useInternalMessage`：受理 `Message` 转发过来的方法，将非 `open` 的打开方法转发给 `open` 方法
   2. 代理调用 `notification` 的方法
   3. 重写 `notification` 的 `content`，使用自定义的内容

- 第三层（核心显示层）：`Notification`

   使用 `useNotification` 注册 `notification`



# 使用

## 全局方法

还提供了全局配置和全局销毁方法：

- `message.config(options)`
- `message.destroy()`

```typescript
message.config({
    duration: 3000,
    getContainer: () => messageRef.current,
})
```

| 参数             | 说明                                                      | 类型                  | 默认值                |
| :--------------- | :-------------------------------------------------------- | :-------------------- | :-------------------- |
| `duration`       | 默认自动关闭延时，单位毫秒                                | `number`              | `3000`                |
| `prefixCls`      | 样式 `className` 前缀                                     | `string`              | `bin-message`         |
| `pauseOnHover`   | 鼠标悬停时，是否暂停计时器                                | `boolean`             | `true`                |
| `className`      | 自定义 `CSS class`将会传给 `content` 的容器               | `string`              | -                     |
| `style`          | 自定义提示内联样式。将会传给 `content` 的容器             | `React.CSSProperties` | -                     |
| `getContainer`   | 配置渲染节点的输出位置                                    | `() => HTMLElement`   | `() => document.body` |
| `transitionName` | 配置动画名称，最终动画名称为 `prefixCls + transitionName` | `string`              | `'move-up'`           |
| `maxCount`       | 最大显示数，超过限制时，最早的消息会被自动关闭            | `number`              | -                     |

```typescript
// useMessage() / message.config() 的参数类型
interface ConfigOptions {
    duration?: number;                         // 默认自动关闭延时，单位毫秒，默认值 3000
    prefixCls?: string;                        // 样式 className 前缀
    pauseOnHover?: boolean;                    // 鼠标悬停时，是否暂停计时器
    className?: string;                        // 自定义 CSS class。将会传给 content 容器
    style?: React.CSSProperties;               // 自定义提示内联样式。将会传给 content 容器
    getContainer?: () => HTMLElement;          // 配置渲染节点的输出位置，默认为 () => document.body
    transitionName?: string;                   // 配置动画名称，最终动画名称为 prefixCls + transitionName
    maxCount?: number;                         // 最大显示数，超过限制时，最早的消息会被自动关闭
}
```



## API

组件提供了一些静态方法，使用方式和参数如下：

- `message.success(content, [duration], onClose)`
- `message.error(content, [duration], onClose)`
- `message.info(content, [duration], onClose)`
- `message.warning(content, [duration], onClose)`
- `message.loading(content, [duration], onClose)`

```typescript
message.info(
    'hello message',
    0,
    () => { console.log('关闭') },
)
```

```typescript
type TypeOpen = {
    /**
     * @param { number } duration 消息通知持续显示的时间
     * @param { VoidFunction } onClose 消息通知关闭时进行调用的回调函数
     */
    (content: JointContent): MessageType;
    (content: JointContent, onClose: VoidFunction): MessageType;
    (content: JointContent, duration: number, onClose?: VoidFunction): MessageType;
}
```

| 参数       | 说明                                        | 类型                 | 默认值 |
| :--------- | :------------------------------------------ | :------------------- | :----- |
| `content`  | 提示内容                                    | `ReactNode | config` | -      |
| `duration` | 自动关闭的延时，单位秒。设为 0 时不自动关闭 | `number`             | 3000   |
| `onClose`  | 关闭时触发的回调函数                        | `function`           | -      |

也可以对象的形式传递参数：

- `message.open(config)`
- `message.success(config)`
- `message.error(config)`
- `message.info(config)`
- `message.warning(config)`
- `message.loading(config)`

```typescript
message.info({
    content: 'hello message',
    duration: 0,
    key: id.current,
    onClose: () => { console.log('关闭') },
})
```

`config` 对象属性如下：

| 参数           | 说明                                                         | 类型                                            | 默认值  |
| :------------- | :----------------------------------------------------------- | :---------------------------------------------- | :------ |
| `content`      | 消息内容                                                     | `React.ReactNode`                               | -       |
| `duration`     | 自动关闭的延时，单位毫秒秒。设为 0 时不自动关闭<br />（`config` 的 `duration` 优先级更高） | `number`                                        | `3000`  |
| `icon`         | 自定义图标                                                   | `React.ReactNode`                               | -       |
| `key`          | 当前提示的唯一标志                                           | `React.Key`                                     | -       |
| `forbidClick`  | 是否禁止背景点击（移动端独有）                               | `boolean`                                       | `false` |
| `pauseOnHover` | 鼠标悬停时，是否暂停计时器                                   | `boolean`                                       | `true`  |
| `showCloseBtn` | 是否展示关闭按钮                                             | `boolean`                                       | `false` |
| `className`    | 自定义 `CSS class`。将会传给 `content` 的容器                | `string`                                        | -       |
| `style`        | 自定义该提示内联样式。将会传给 `content` 的容器              | `React.CSSProperties`                           | -       |
| `onClose`      | 消息关闭时的回调函数                                         | `() => void`                                    | -       |
| `onClick`      | 点击消息时触发                                               | `(e: React.MouseEvent<HTMLDivElement>) => void` | -       |

```typescript
// message.open() 的参数类型
interface ArgsProps {
    content: React.ReactNode;                  // 消息内容
    duration?: number;                         // 自动关闭的延时，单位毫秒秒。设为 0 时不自动关闭，默认值 3000
    type?: NoticeType;                         // 消息类型
    icon?: React.ReactNode;                    // 自定义图标
    key?: React.Key;                           // 当前提示的唯一标志
    forbidClick?: boolean;                     // 是否禁止背景点击（移动端独有）
    pauseOnHover?: boolean;                    // 鼠标悬停时，是否暂停计时器
    showCloseBtn?: boolean;                    // 是否展示关闭按钮
    className?: string;                        // 自定义 CSS class
    style?: React.CSSProperties;               // 自定义该提示内联样式
    onClose?: () => void;                      // 消息关闭时的回调函数
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;     // 点击消息时触发
}
```



## 关闭方法

自动关闭：关闭后执行函数

```typescript
message.info({
    content: 'hello message',
    duration: 0,
    key: id.current,
    onClose: () => { console.log('关闭') },
})
.then(() => {
    console.log('关闭2')
})
// 关闭
// 关闭2
```

手动关闭：方法会返回一个关闭函数，执行该函数即可关闭消息

```typescript
const closeFn = message.loading({
    content: 'loading...',
    duration: 0,       // 以这个为准
    key: id.current,
    onClose: () => { console.log('关闭') },
}, 3000)

closeFn()     // 手动关闭函数
```



## CSS 变量

| 属性               | 说明         | 默认值                                                       |
| ------------------ | ------------ | ------------------------------------------------------------ |
| `--bg-color`       | 提示背景颜色 | `#fff`                                                       |
| `--color-text`     | 提示文字颜色 | `rgba(0, 0, 0, 0.88)`                                        |
| `--content-shadow` | 提示框阴影   | `0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)` |



## 实例化 Hooks

```tsx
const Message = () => {
    const [messageApi, contextHolder] = message.useMessage()

    const open = () => {
        messageApi.info({
            content: 'hello message',
        })
    }

    const destroy = () => {
        messageApi.destroy()
    }

    return (
        <>
            {contextHolder}
            <div></div>
        </>
    )
}
```

