# 功能说明

1. 蒙层进入、退场动画
2. 默认禁止 `body` 滑动
3. 默认开启路由变化自动关闭蒙层
4. 蒙层默认挂载到 `body`，在退场后不会卸载元素



# 使用说明

```tsx
<Mask
    visible={visible}
    onMaskClick={() => {
        console.log('onMaskClick 蒙层关闭')
        setVisible(false)
    }}
></Mask>
```



## 参数

| 参数                  | 说明                             | 类型                                        | 默认值               |
| --------------------- | -------------------------------- | ------------------------------------------- | -------------------- |
| `visible`             | 是否显示                         | `boolean`                                   | `true`               |
| `zIndex`              | 蒙层层级                         | `number`                                    | `999`                |
| `duration`            | 动画时长                         | `number`                                    | `300`                |
| `bgColor`             | 蒙层背景颜色                     | `string`                                    | `rgba(0, 0, 0, .55)` |
| `disableBodyScroll`   | 是否禁用 `body` 滚动             | `boolean`                                   | `true`               |
| `closeOnPopstate`     | 是否在 `popstate` 时关闭图片预览 | `boolean`                                   | `true`               |
| `closeOnClickOverlay` | 是否在点击遮罩层后关闭           | `boolean`                                   | `true`               |
| `className`           | 自定义类名                       | `string`                                    | `''`                 |
| `style`               | 自定义样式                       | `React.CSSProperties`                       | `{}`                 |
| `getContainer`        | 指定挂载的节点                   | `HTMLElement |(() => HTMLElement) |null`    | `document.body`      |
| `onMaskClick`         | 点击遮罩层时触发                 | `(value?: boolean) => void`                 | -                    |
| `afterClose`          | 完全关闭后触发                   | `() => void`                                | -                    |
| `children`            | Mask children                    | `React.ReactNode | (() => React.ReactNode)` | `null`               |