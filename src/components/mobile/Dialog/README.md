# 原理

直接原理：使用 `React.createPortal` 将 `Dialog` 渲染到自定义元素或 `document.body` 中，并借助 `CSSMotion` 分别驱动遮罩层与弹窗内容的进出场动画。

设计理念：

1. `Dialog` 同时支持组件式调用和函数式调用。组件式调用由外部通过 `visible` 控制显示隐藏；函数式调用由 `confirm.tsx` 在调用时动态创建挂载容器，并返回实例用于更新或销毁。
2. 弹窗拆分为 `Dialog.tsx`、`Mask.tsx`、`Content.tsx` 三层，分别处理容器与生命周期、蒙层行为、弹窗内容与动画，避免把所有逻辑堆在一个组件里。
3. 显示状态与渲染状态分离。`visible` 负责声明是否展示，`animatedVisible` 负责确保退场动画执行完成后再触发 `afterClose` 或卸载节点。
4. 静态方法 `Dialog.alert / Dialog.show / Dialog.confirm` 本质上都走 `confirm()`，只是注入不同的 `type`，并根据类型补齐默认按钮行为。

设计原理总共分为三层结构：

1. 第一层：入口层 `index.ts`

   `Dialog.alert / Dialog.show / Dialog.confirm`：统一代理到 `confirm()`，用于函数式创建弹窗。

   `Dialog.destroyAll`：统一关闭当前已创建的所有函数式弹窗。

2. 第二层：控制层 `confirm.tsx`

   `render`：基于当前配置重复渲染同一个弹窗实例，使 `update()` 可以直接触发 React diff。

   `close / destroy`：先把 `visible` 置为 `false` 触发离场动画，再在 `afterClose` 中执行卸载。

3. 第三层：视图层 `Dialog.tsx / Mask.tsx / Content.tsx`

   `Dialog.tsx`：负责 Portal 挂载、`animatedVisible` 生命周期控制、滚动锁定和 popstate 关闭。

   `Mask.tsx`：负责遮罩层淡入淡出动画，以及仅在点击遮罩本身时触发关闭。

   `Content.tsx`：负责内容结构、按钮渲染、缩放动画，以及基于 `mousePosition` 计算 `transform-origin`。



# 使用

## 组件式调用

```tsx
const [dialogVisiable, setDialogVisiable] = useState(false)

<Dialog
    visible={dialogVisiable}
    title={'标题'}
    onCancel={() => setDialogVisiable(false)}
    onConfirm={() => setDialogVisiable(false)}
>
    我是一个弹窗
</Dialog>
```

## 函数式调用

还提供了全局销毁方法：

- `Dialog.destroyAll()`

```tsx
Dialog.alert({
    title: '提示',
    content: 'This is an alert dialog',
})

Dialog.destroyAll()
```



## API

组件提供了一些静态方法，使用方式和参数如下：

- `Dialog.alert(config)`
- `Dialog.show(config)`
- `Dialog.confirm(config)`

```tsx
Dialog.confirm({
    title: '标题',
    content: 'This is a confirm dialog',
    onConfirm: () => console.log('确认'),
    onCancel: () => console.log('取消'),
})
```

```typescript
interface DialogType {
    destroy: () => void;
    update: (config: DialogOptions) => void;
}

type DialogFunc = (props: DialogOptions) => DialogType
```

静态方法会返回一个实例对象：

- `destroy()`：关闭当前弹窗
- `update(config)`：更新当前弹窗配置

```tsx
const handler = Dialog.show({
    content: 'loading...',
    showConfirmButton: false,
})

setTimeout(() => {
    handler.update({
        title: '完成',
        content: '操作成功',
        showConfirmButton: true,
        confirmButtonText: '我知道了',
    })
}, 2000)
```

`config` 对象属性如下：

| 参数 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `visible` | 是否显示弹窗 | `boolean` | `false` |
| `title` | 标题内容 | `ReactNode` | `null` |
| `content` | 函数式调用的内容 | `ReactNode` | `null` |
| `children` | 组件式调用的内容 | `ReactNode` | `null` |
| `footer` | 自定义底部区域 | `ReactNode` | 默认按钮区 |
| `showConfirmButton` | 是否展示确认按钮 | `boolean` | `true` |
| `showCancelButton` | 是否展示取消按钮 | `boolean` | `false` |
| `confirmButtonText` | 确认按钮文案 | `string` | `alert` 时为 `我知道了`，其余为 `确认` |
| `confirmButtonColor` | 确认按钮颜色 | `string` | `#1989fa` |
| `cancelButtonText` | 取消按钮文案 | `string` | `取消` |
| `cancelButtonColor` | 取消按钮颜色 | `string` | `#6b6375` |
| `mask` | 是否显示遮罩层 | `boolean` | `true` |
| `closeOnMaskClick` | 点击遮罩是否允许关闭 | `boolean` | `false` |
| `closeOnPopstate` | 页面回退时是否自动关闭 | `boolean` | `true` |
| `disableBodyScroll` | 蒙层显示时是否禁止 body 滚动 | `boolean` | `true` |
| `destroyOnHidden` | 关闭时是否销毁内容节点 | `boolean` | `false` |
| `forceRender` | 是否强制预渲染内容 | `boolean` | `false` |
| `onCancel`            | 点击取消或触发关闭时执行     | `() => void`                               | -                                      |
| `onConfirm`           | 点击确认时执行               | `() => void`                               | -                                      |
| `afterClose`          | 关闭动画结束后执行           | `() => void`                               | -                                      |
| `type`                | 静态方法类型                 | `'alert' | 'show' | 'confirm'`             | -                                      |
| `mousePosition`       | 用于计算开始动画原点         | `{ x: number; y: number } | null`          | 自动记录最近一次点击位置               |
| `diableMousePosition` | 是否禁用鼠标位置             | `boolean`                                  | `false`                                |
| `motionName`          | 内容区动画名前缀             | `string`                                   | `'bin-dialog-zoom'`                    |
| `width`               | 弹窗宽度                     | `string | number`                          | `320px`                                |
| `duration`            | 动画时长，单位毫秒           | `number`                                   | `300`                                  |
| `zIndex`              | 弹窗和遮罩层级               | `number`                                   | `999`                                  |
| `className`           | 自定义类名                   | `string`                                   | -                                      |
| `style`               | 自定义样式                   | `React.CSSProperties`                      | `{}`                                   |
| `getContainer` | 指定挂载容器 | `HTMLElement | (() => HTMLElement) | null` | `document.body` |



## 关闭方法

函数式调用会返回一个实例，可用于手动关闭当前弹窗：

```tsx
const handler = Dialog.confirm({
    title: '标题',
    content: '确认删除吗？',
})

handler.destroy()
```

也可以通过 `update()` 更新弹窗内容，更新后仍复用同一个实例：

```tsx
const handler = Dialog.show({
    content: 'loading...',
    showConfirmButton: false,
})

handler.update({
    content: 'loaded',
    showConfirmButton: true,
})
```

全局关闭：

```tsx
Dialog.destroyAll()
```



## CSS 变量

### `Dialog.less`

| 属性 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `--z-index` | 弹窗容器层级 | `999` |
| `--dialog-width` | 弹窗宽度 | `320px` |
| `--dialog-radius` | 弹窗圆角 | `16px` |
| `--dialog-background` | 弹窗背景色 | `#fff` |
| `--dialog-font-size` | 标题字号 | `16px` |
| `--animation-duration` | 弹窗动画时长 | `0.3s` |

### `Mask.less`

| 属性 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `--z-index` | 遮罩层级 | `999` |
| `--animation-duration` | 遮罩动画时长 | `0.3s` |
| `--bg-color` | 遮罩背景色 | `rgba(0, 0, 0, .55)` |



## 行为说明

### 不同静态方法的默认行为

```tsx
Dialog.alert({
    title: '提示',
    content: '操作成功',
})

Dialog.show({
    content: '这是一段展示信息',
})

Dialog.confirm({
    title: '确认',
    content: '确认继续吗？',
})
```

- `Dialog.alert`：默认显示确认按钮，不显示取消按钮，确认文案默认为 `我知道了`
- `Dialog.show`：默认显示确认按钮，不显示取消按钮
- `Dialog.confirm`：默认同时显示确认和取消按钮

### 点击遮罩关闭

```tsx
<Dialog
    visible={visible}
    closeOnMaskClick
    onCancel={() => setVisible(false)}
>
    content
</Dialog>
```

只有点击遮罩层本身时才会触发关闭；点击弹窗内容区不会冒泡触发关闭。

### 挂载到指定容器

```tsx
<Dialog
    visible={visible}
    getContainer={() => document.getElementById('dialog-root')!}
>
    content
</Dialog>
```

若不传 `getContainer`，默认挂载到 `document.body`。

### 从点击位置展开

组件内部会自动记录最近一次点击位置，并在弹窗打开时将其作为动画原点；也可以手动传入 `mousePosition` 覆盖默认行为。

```tsx
<Dialog
    visible={visible}
    mousePosition={{ x: 300, y: 240 }}
>
    content
</Dialog>
```