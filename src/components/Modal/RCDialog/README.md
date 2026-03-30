# 原理

直接原理：使用 `React.createPortal` 将 `RCDialog` 渲染到自定义元素或 `document.body` 中，并借助 `CSSMotion` 分别驱动遮罩层与弹窗内容的进出场动画。

设计理念：

1. `RCDialog` 只负责基础弹窗能力，不关心业务状态；外部通过 `visible` 控制显示隐藏，通过 `onClose`、`afterClose` 感知关闭过程。
2. 弹窗拆分为 `Dialog.tsx`、`Mask.tsx`、`Content.tsx` 三层，分别处理容器/生命周期、蒙层行为、弹窗内容与动画，避免把所有逻辑堆在一个组件里。
3. 显示状态与渲染状态分离。`visible` 负责声明是否展示，`animatedVisible` 负责确保退场动画执行完成后再触发 `afterClose` 或销毁节点。
4. 所有挂载能力统一走 `renderToContainer()`，从而同时支持默认挂载到 `document.body` 和挂载到指定容器。

设计原理总共分为三层结构：

1. 第一层：容器层 `Dialog.tsx`

   `renderToContainer`：将整棵弹窗树通过 Portal 渲染到目标容器。

   `animatedVisible`：维护动画锁，保证关闭动画结束后才触发 `afterClose`，并配合 `destroyOnHidden` 决定是否卸载节点。

2. 第二层：蒙层层 `Mask.tsx`

   `CSSMotion`：负责蒙层淡入淡出动画。

   `disableBodyScroll`：弹窗打开时禁止 `body` 滚动，关闭或卸载时恢复原始 `overflow`。

   `onMaskClick`：仅在点击当前蒙层本身时触发，配合 `maskClosable` 实现点击遮罩关闭。

3. 第三层：内容层 `Content.tsx`

   `CSSMotion`：负责弹窗缩放动画。

   `onPrepare`：在 appear / enter 前测量弹窗位置，结合 `mousePosition` 计算 `transform-origin`，实现从点击位置展开的动画效果。

   `header / body / footer / close`：按需渲染标题区、内容区、底部区和关闭按钮。



# 使用

```tsx
<Dialog
    visible={dialogVisiable}
    width={520}
    destroyOnHidden={true}
    closable={true}
    onClose={() => setDialogVisiable(false)}
    afterClose={() => console.log('动画结束')}
    title='标题'
    footer='页脚'
>我是一个弹窗</Dialog>
```



## API

| 参数 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `visible` | 是否显示弹窗 | `boolean` | `false` |
| `closable` | 是否显示右上角关闭按钮 | `boolean` | `false` |
| `mask` | 是否显示遮罩层 | `boolean` | `true` |
| `maskClosable` | 点击遮罩层是否触发关闭 | `boolean` | `false` |
| `destroyOnHidden` | 关闭后是否销毁内容节点 | `boolean` | `false` |
| `forceRender` | 是否在首次隐藏时也提前渲染内容 | `boolean` | `false` |
| `onClose`         | 请求关闭时触发                 | `(e: React.SyntheticEvent) => void`        | -                   |
| `afterClose`      | 关闭动画结束后触发             | `() => void`                               | -                   |
| `title`           | 弹窗头部内容                   | `ReactNode`                                | `null`              |
| `children`        | 弹窗主体内容                   | `ReactNode`                                | `null`              |
| `footer`          | 弹窗底部内容                   | `ReactNode`                                | `null`              |
| `mousePosition`   | 用于计算开始动画原点           | `{ x: number, y: number } | null`          | -                   |
| `motionName`      | 内容区动画名前缀               | `string`                                   | `'bin-dialog-zoom'` |
| `width`           | 弹窗宽度                       | `string | number`                          | -                   |
| `duration`        | 动画时长，单位毫秒             | `number`                                   | `300`               |
| `zIndex`          | 遮罩层与弹窗层级               | `number`                                   | `999`               |
| `className`       | 自定义类名                     | `string`                                   | -                   |
| `style`           | 自定义样式                     | `React.CSSProperties`                      | `{}`                |
| `getContainer`    | 指定挂载容器                   | `HTMLElement | (() => HTMLElement) | null` | `document.body`     |



## 生命周期

### 打开

1. `visible` 变为 `true`
2. `Dialog.tsx` 将 `animatedVisible` 设为 `true`
3. `Mask` 与 `Content` 分别通过 `CSSMotion` 执行进入动画
4. `Content` 在 `prepare` 阶段测量弹窗位置，并根据 `mousePosition` 设置 `transform-origin`

### 关闭

1. 外部把 `visible` 设为 `false`
2. `Mask` 与 `Content` 执行离场动画
3. `Content` 动画结束后触发 `onVisibleChanged(false)`
4. `Dialog.tsx` 内部根据 `animatedVisible` 安全触发 `afterClose`
5. 若 `destroyOnHidden=true`，则在动画结束后卸载节点



## CSS 变量

### `Dialog.less`

| 属性 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `--z-index` | 弹窗容器层级 | `999` |
| `--animation-duration` | 弹窗动画时长 | `0.3s` |

### `Mask.less`

| 属性 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `--z-index` | 遮罩层级 | `999` |
| `--animation-duration` | 遮罩动画时长 | `0.3s` |
| `--bg-color` | 遮罩背景色 | `rgba(0, 0, 0, .55)` |



## 行为说明

### 点击遮罩关闭

```tsx
<Dialog
    visible={visible}
    maskClosable
    onClose={() => setVisible(false)}
>
    content
</Dialog>
```

只有点击遮罩层本身时才会触发关闭；点击弹窗内容区不会冒泡触发关闭。

### 从鼠标点击点展开

```tsx
<Dialog
    visible={visible}
    mousePosition={{ x: 300, y: 240 }}
>
    content
</Dialog>
```

传入 `mousePosition` 后，`Content.tsx` 会在动画开始前测量弹窗位置，并把缩放原点设置为相对于弹窗的点击坐标。

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
