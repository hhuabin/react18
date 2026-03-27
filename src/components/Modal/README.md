# 原理

直接原理：`Modal` 基于 `RCDialog` 二次封装，对外提供更贴近业务的声明式组件调用与函数式静态方法调用；底层仍然通过 `React.createPortal` 将弹窗渲染到自定义元素或 `document.body` 中。

设计理念：

1. `Modal` 在 `RCDialog` 的基础上补充了更高层的弹窗语义：`open / onConfirm / onCancel / 默认页脚 / confirm 类静态方法`，让业务侧无需直接处理底层弹窗结构。
2. 组件调用与函数式调用共用同一套 `Modal` 视图能力。声明式场景走 `Modal.tsx`，函数式场景走 `confirm.tsx`，但最终都渲染同一个 `Modal` 组件。
3. 默认页脚逻辑独立到 `Footer.tsx`，由 `footer`、`confirmText`、`cancelText`、`onConfirm`、`onCancel` 组合出统一的确认/取消按钮行为。
4. 通过全局 click 事件暂存 `mousePosition`，在打开弹窗时把点击坐标透传给 `RCDialog`，从而实现“从点击位置展开”的过渡动画。
5. 函数式弹窗内部维护自己的渲染、更新、销毁逻辑，并统一记录到 `destroyFns`，从而支持 `Modal.destroyAll()` 一次性关闭所有实例。

设计原理总共分为三层结构：

1. 第一层：组件层 `Modal.tsx`

   负责把 `open` 转成底层 `Dialog` 的 `visible`，并补充默认宽度、默认页脚、鼠标点击位置等增强能力。

2. 第二层：函数式代理层 `confirm.tsx` + `index.ts`

   `Modal.info / success / error / warning / confirm`：每次调用都会创建一个独立实例，并返回 `destroy / update` 控制句柄。

   `Modal.destroyAll()`：消费 `destroyFns`，关闭当前所有函数式弹窗。

3. 第三层：底层渲染层 `RCDialog`

   负责 Portal 挂载、遮罩、内容布局、动画、生命周期与关闭后的销毁逻辑。



# 使用

## 组件调用

```tsx
<Modal
    open={visible}
    title='提示'
    onConfirm={() => {
        message.info('confirm')
    }}
    onCancel={() => setVisible(false)}
>
    我是一个弹窗
</Modal>
```

## 函数式调用

```tsx
Modal.confirm({
    title: '提示',
    content: '确定执行该操作吗？',
    onConfirm: () => console.log('确认'),
    onCancel: () => console.log('取消'),
})
```

函数式方法会立即创建弹窗实例，并返回控制对象：

```tsx
const modalRef = Modal.success({
    title: '操作成功',
    content: '数据已保存',
})

modalRef.update({
    title: '操作成功',
    content: '数据已保存并同步',
})

modalRef.destroy()
```



## API

### 组件 Props

| 参数 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `open` | 是否打开弹窗 | `boolean` | `false` |
| `zIndex` | 设置弹窗层级 | `number` | `1000+`（函数式）/ 继承底层默认值 |
| `closable` | 是否显示右上角关闭按钮 | `boolean` | `false` |
| `mask` | 是否显示遮罩 | `boolean` | `true` |
| `maskClosable` | 点击遮罩是否关闭 | `boolean` | `false` |
| `destroyOnHidden` | 关闭后是否销毁内容 | `boolean` | `false` |
| `forceRender` | 是否强制预渲染 | `boolean` | `false` |
| `title` | 弹窗标题 | `ReactNode` | - |
| `children` | 弹窗内容 | `ReactNode` | - |
| `footer` | 自定义底部内容；传 `null` 可隐藏底部 | `ReactNode | ((handleConfirm, handleCancel) => ReactNode)` | 默认页脚 |
| `confirmText` | 确认按钮文案 | `string` | `'确定'` |
| `confirmType` | 确认按钮风格类型 | `'default' \| 'primary'` | `'primary'` |
| `cancelText` | 取消按钮文案 | `string` | `'取消'` |
| `cancelColor` | 取消按钮文字颜色 | `string` | `''` |
| `onConfirm` | 点击确认按钮回调 | `(e) => void` | - |
| `onCancel` | 点击取消、右上角关闭、遮罩关闭时触发 | `(e) => void` | - |
| `afterClose` | 关闭动画完成后的回调 | `() => void` | - |
| `mousePosition` | 自定义展开动画原点 | `{ x: number, y: number } \| null` | 自动记录最近一次点击位置 |
| `motionName` | 内容区动画名前缀 | `string` | `'bin-dialog-zoom'` |
| `width` | 弹窗宽度 | `string \| number` | `520` |
| `height` | 弹窗高度 | `string \| number` | - |
| `className` | 自定义类名 | `string` | `''` |
| `style` | 自定义样式 | `React.CSSProperties` | `{}` |
| `getContainer` | 指定挂载容器 | `HTMLElement \| (() => HTMLElement) \| null` | `document.body` |

### 静态方法

组件还提供了一些静态方法：

- `Modal.info(config)`
- `Modal.success(config)`
- `Modal.error(config)`
- `Modal.warning(config)`
- `Modal.confirm(config)`
- `Modal.destroyAll()`

```typescript
interface ModalFuncProps extends ModalProps {
    content?: React.ReactNode;
    type?: 'info' | 'success' | 'error' | 'warning' | 'confirm'
}

type ModalFunc = (props: ModalFuncProps) => {
    destroy: () => void;
    update: (config: ModalFuncProps) => void;
}
```

| 参数 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `title` | 标题 | `ReactNode` | - |
| `content` | 正文内容 | `ReactNode` | - |
| `type` | 弹窗类型 | `'info' | 'success' | 'error' | 'warning' | 'confirm'` | 调用方法决定 |
| `onConfirm` | 点击确认按钮回调 | `(e) => void` | - |
| `onCancel` | 点击取消或关闭按钮回调 | `(e) => void` | - |
| 其余参数 | 与 `ModalProps` 一致 | - | - |

返回值：

| 属性 | 说明 | 类型 |
| :--- | :--- | :--- |
| `destroy` | 关闭当前弹窗 | `() => void` |
| `update` | 更新当前弹窗配置 | `(config: ModalFuncProps) => void` |



## 页脚说明

### 默认页脚

当 `footer` 未传入时，组件会自动渲染底部按钮：

- 普通 `Modal`：默认显示“取消 + 确定”按钮
- `Modal.confirm`：显示“取消 + 确定”按钮
- `Modal.info / success / error / warning`：仅显示“确定”按钮

```tsx
<Modal
    open={open}
    onConfirm={handleConfirm}
    onCancel={handleCancel}
/>
```

### 自定义页脚

可以直接传入节点：

```tsx
<Modal
    open={open}
    footer={<button onClick={() => setOpen(false)}>我知道了</button>}
>
    content
</Modal>
```

也可以传入函数，复用内部的确认/取消逻辑：

```tsx
<Modal
    open={open}
    footer={(handleConfirm, handleCancel) => (
        <>
            <button onClick={handleCancel}>返回</button>
            <button onClick={handleConfirm}>提交</button>
        </>
    )}
>
    content
</Modal>
```

传入 `footer={null}` 可隐藏底部。



## 生命周期

### 组件模式

1. 外部修改 `open`
2. `Modal.tsx` 将其透传给 `RCDialog.visible`
3. 若未显式传入 `mousePosition`，则使用最近一次全局点击位置作为动画原点
4. `RCDialog` 播放遮罩与内容动画
5. 点击确认按钮触发 `onConfirm`
6. 点击取消按钮、关闭按钮、遮罩时触发 `onCancel`
7. 动画结束后触发 `afterClose`

### 函数式模式

1. 调用 `Modal.confirm / info / success / ...`
2. `confirm.tsx` 创建独立容器并立即渲染一个 `Modal`
3. 返回 `{ destroy, update }` 句柄给调用方
4. `destroy()` 或内部关闭逻辑把 `open` 设为 `false`
5. 待关闭动画结束后执行 `afterClose`，并卸载 React 节点



## 关闭方法

### 单个销毁

```tsx
const instance: ModalType = Modal.warning({
    title: '警告',
    content: '请检查配置',
})

instance.destroy()
```

### 更新后销毁

```tsx
const instance: ModalType = Modal.info({
    title: '处理中',
    content: '请稍候',
})

instance.update({
    title: '处理完成',
    content: '已完成当前操作',
})

instance.destroy()
```

### 全部销毁

```tsx
Modal.destroyAll()
```



## 样式说明

`Modal` 本身的主体结构和动画样式由 `RCDialog` 负责；当前目录主要补充了两类样式：

1. `Footer/Footer.less`

| 类名 | 说明 |
| :--- | :--- |
| `.bin-modal-confirm-btn` | 默认确认按钮样式 |
| `.bin-modal-cancel-btn` | 默认取消按钮样式 |

2. `style/ConfirmContent.less`

| 类名 | 说明 |
| :--- | :--- |
| `.bin-modal-confirm-body-wrapper` | 函数式确认弹窗内容根节点 |
| `.bin-modal-anticon-info-circle` | 图标区域 |
| `.bin-modal-confirm-title` | 标题区域 |
| `.bin-modal-confirm-content` | 正文区域 |
| `.bin-modal-confirm-btns` | 函数式页脚按钮区域 |

底层弹窗容器、遮罩和动画变量说明可参考 `src/components/Modal/RCDialog/README.md`。
