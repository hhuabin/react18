# 原理

`notification`每次执行方法，比如`notification.open()`，`open`每次只会携带一个通知的配置，而显示是一个通知列表。这就注定了`Notification`组件只能去维护一个消息队列，用于具体的`notification`队列显示，而每次`notification.open()`都是执行改变消息队列的某个方法



## 1.`Notifications`总控制层

1. 维护一个提示列表 `configList`，收集不同位置（`'top' | 'topRight'`等）的提示。并把列表按照 位置 分组到 placements 中
2. 对 `configList` 的 增、删、改(open)、全部销毁 等操作都要通过该组件
3. 暴露方法
4. 把 `configList` 传给动画层
5. 通过 `createPortal` 渲染整个列表到 `html`



## 2.`NoticeList`提示列表动画层

把 `configList` 传给 `CSSMotionList` 控制动画



## 3.`Notice`提示层

单个消息的功能层，总领样式

1. 手动关闭消息
2. 倒计时结束关闭消息
3. 鼠标移入消息，暂停倒计时
4. 鼠标移出消息，恢复倒计时
5. 管理倒计时 progress



## 4.`useNotification` hooks层

方便 `Notifications` 渲染和操作，总体功能和 `Notifications` 差不多，只是对 `open` 方法做了些许默认配置的修改

1. 维护一个 `taskQueue` 任务队列，每次调用`open`、`close`、`destroy`都会修改 `taskQueue`
2. `taskQueue` 的变化触发  `Notifications` 里面的方法
3. 消费完 `task` 任务，则从 `taskQueue` 中删除该任务，保证队列稳定
4. 设置了默认的 `key` 和默认挂载到 `document.body`



# 使用

## `Notifications` 组件化调用

```tsx
import { useRef } from 'react'
import Notifications, { type NotificationsRef } from '@/components/Message/notification/Notifications'

const NotificationComponent: React.FC = () => {
    
    const notificationsRef = useRef<NotificationsRef | null>(null)
    
    const open = () => {
        notificationsRef.current?.open({
            key: 'notification',          // 必须要传key值
            content: 'This is a notification',
        })
    }

    const destroy = () => {
        notificationsRef.current?.destroy()
    }
    
    return(
        <>
            <Notifications
                ref={notificationsRef}
                prefixCls='bin-message'
                container={document.body}
                motion={{
                    motionName: 'bin-message-move-up',
                }}
                onAllRemoved={() => console.log('all removed')}
            ></Notifications>
        </>
    )
}
```



## `useNotification`hooks调用

```tsx
const [notificationApi, notificatioHolder] = useNotification({
    prefixCls: 'bin-message',
    motion: {
        motionName: 'bin-message-move-up',
    },
    onAllRemoved: () => console.log('all removed'),

    duration: 3000,          // notification 的提示全部默认改为 3000ms（默认是4500ms）
})

const open = () => {
    notificationApi.open({
        content: 'This is a notification',
    })
}

const destroy = () => {
    notificationApi.destroy()
}

return (
    <>
        { notificatioHolder }
    </>
)
```



### `NotificationConfig` hooks参数

| 参数           | 说明                                                  | 类型                                                         | 默认值                |
| :------------- | :---------------------------------------------------- | :----------------------------------------------------------- | :-------------------- |
| `prefixCls`    | 前缀类名                                              | `string`                                                     | `'bin-notification'`  |
| `getContainer` | 容器元素                                              | `() => HTMLElement | ShadowRoot`                             | `() => document.body` |
| `motion`       | `CSSMotion` 动画配置                                  | `CSSMotionProps`                                             | -                     |
| `maxCount`     | 最大显示数；超出 `maxCount`，从提示列表第一个开始移除 | `number`                                                     | -                     |
| `className`    | 样式类名                                              | `string`                                                     | -                     |
| `style`        | 样式                                                  | `React.CSSProperties`                                        | -                     |
| `onAllRemoved` | 所有通知全部移除时触发                                | `VoidFunction`                                               | -                     |
| `duration`     | 自动关闭的延时，单位毫秒。设为 0 时不自动关闭         | `number`                                                     | `4500`                |
| `pauseOnHover` | 停时是否暂停计时器，默认值为 true；                   | `boolean`                                                    | `true`                |
| `showProgress` | 是否展示进度条                                        | `boolean`                                                    | `false`               |
| `closable`     | 是否显示关闭按钮，提供 closeIcon 会覆盖关闭按钮元素   | `boolean | ({ closeIcon?: React.ReactNode } & React.AriaAttributes)` | `false`               |



### `OpenConfig` `open`参数

| 参数           | 说明                                                | 类型                                                         | 默认值               |
| :------------- | :-------------------------------------------------- | :----------------------------------------------------------- | :------------------- |
| `content`      | 消息内容                                            | `React.ReactNode`                                            | -                    |
| `duration`     | 显示时长                                            | `number`                                                     | `4500`               |
| `pauseOnHover` | 悬停时是否暂停计时器                                | `boolean`                                                    | `true`               |
| `showProgress` | 倒计时进度条，仅作用在 `Notice`                     | `boolean`                                                    | `false`              |
| `closable`     | 是否显示关闭按钮，提供 closeIcon 会覆盖关闭按钮元素 | `boolean | ({ closeIcon?: React.ReactNode } & React.AriaAttributes)` | `false`              |
| `className`    | 定义类名，将会被赋到 `Notice`上                     | `string`                                                     | -                    |
| `style`        | 自定义样式，将会被赋到 `Notice`上                   | `React.CSSProperties`                                        | -                    |
| `onClose`      | 开发者传入的关闭回调（不等待动画完成）              | `VoidFunction`                                               | -                    |
| `onClick`      | 点击回调                                            | `React.MouseEventHandler<HTMLDivElement>`                    | -                    |
| `key`          | 唯一 key                                            | `React.Key`                                                  | `bin-notification-*` |
| `placement`    | 显示位置                                            | `Placement`                                                  | `'top'`              |