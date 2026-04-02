# 原理

`CSSMotion` 是一个参考 `rc-motion` 实现的 `CSS` 动画状态机组件。它本身不直接决定具体渲染什么内容，而是通过 **render props** 把动画过程中的 `className / style / ref / visible` 透传给子节点，由子节点负责输出真实 `DOM`。

直接原理：

1. 外部通过 `visible` 控制组件显示/隐藏
2. `CSSMotion` 根据可见性变化决定当前动画类型：`appear / enter / leave / none`
3. `useStepQueue` 将每次动画拆成步骤队列：`prepare -> start -> active -> end`
4. `CSSMotion` 按照 `motionName + status + step` 规则给子节点拼接动画类名
5. 子节点上的 `transition / animation` 执行结束后，通过 `transitionend / animationend` 事件通知状态机收尾
6. 动画结束后，再由 `removeOnLeave / leavedClassName / forceRender` 决定节点是移除、隐藏还是保留

设计理念：

1. `CSSMotion` 不包办渲染，而是专注于**动画状态管理**
2. 子元素必须能拿到 `ref`，因为动画事件监听、生命周期控制都依赖真实 `DOM`
3. 动画不是“一次加 class 就结束”，而是通过多帧推进 `prepare/start/active`，避免浏览器把样式合并导致动画失效
4. 即使不支持动画，只要定义了 `prepare`，准备阶段依然会执行
5. `leave` 时不会立刻卸载节点，而是等动画真正结束后再处理最终渲染结果

设计原理可以拆成三层：

1. 第一层：渲染驱动层 `CSSMotion.tsx`

   `CSSMotion` 负责：

   - 调用 `useStatus` 获取当前动画状态
   - 生成 `motion className`
   - 通过 `children(props, ref)` 把动画属性交给子节点
   - 在离场后根据配置决定是否保留节点

2. 第二层：状态机层 `hooks/useStatus.ts`

   `useStatus` 负责：

   - 根据 `visible` 判断当前是 `appear / enter / leave`
   - 调用 `onAppearPrepare / onEnterPrepare / onLeavePrepare` 等生命周期
   - 在 `active` 阶段绑定 `transitionend / animationend`
   - 在动画完成后统一收尾，并触发 `onVisibleChanged`

3. 第三层：步骤调度层 `hooks/useStepQueue.ts`

   `useStepQueue` 负责：

   - 将动画拆成 `prepare -> start -> active -> end`
   - 借助 `requestAnimationFrame` 跨帧推进步骤
   - 支持跳过当前步骤
   - 支持无动画场景下的精简流程：`prepare -> prepared`



# rc-motion 动画心智模型

`rc-motion` 不是简单加个 `class` 就完事，而是通过 `MotionStatus × StepStatus` 的双状态机 + `step` 队列 + `DOM` 事件 + `deadline` + `style` 管理，完整控制 `CSS` 动画的生命周期。

```
状态机
      ↓
Motion 计算 class
      ↓
children({ className, style })
      ↓
子组件渲染 DOM
```



# 使用

## 1.基础用法

`CSSMotion` 的子元素必须是一个函数，并返回一个可以挂 `ref` 的 React 元素：

```tsx
import { useState, memo, forwardRef } from 'react'

import CSSMotion from '@/components/CSSMotion'

import './CSSMotion.less'

const CSSMotionComponents: React.FC = () => {

    // 
    const [appearVisible, setAppearVisible] = useState(true)

    return (
        <div className='w-full p-3' key={2}>
            <div className='flex items-center full'>
                <div className=''>enter（进入）</div>
                <button
                    type='button'
                    className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                        text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                    onClick={() => { setEnterVisible(!enterVisible) }}
                >
                    <span>change enter</span>
                </button>
            </div>
			{/* enter 进入 */}
            <div className='w-full h-[150px] mt-2'>
                <CSSMotion
                    visible={enterVisible}
                    motionName="fade"
                    motionAppear={false}
                    removeOnLeave={false}
                >
                    {({ className: motionClassName, style: motionStyle }, motionRef) => (
                        <div
                            ref={motionRef}
                            className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                            style={motionStyle}
                        ></div>
                    )}
                </CSSMotion>
            </div>
        </div>
    )
}
```

对应的 `CSS class` 需要自行提供：

```less
.motion-children {
    width: 100%;
    max-width: 500px;
    height: 150px;
    border-radius: 8px;
    background-color: aqua;
}

/* ========== appear（首次渲染） ========== */
.fade-appear,
.fade-enter {
    opacity: 0;
    transform: scale(0);
}

.fade-appear-prepare,
.fade-enter-prepare {
    // 重置缩放比例以避免 mousePosition bug
    transform: none;
    opacity: 0;
    user-select: none;
}

.fade-appear-active,
.fade-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity 500ms ease, transform 500ms ease;
}

.fade-leave {
    opacity: 1;
    transform: scale(1);
}
.fade-leave-active {
    opacity: 0;
    transform: scale(0);
    transition: opacity 500ms ease, transform 500ms ease;
}
```



## 2.首次挂载动画（appear）

首次挂载且 `visible = true` 时，如果开启 `motionAppear`，会执行 `appear` 动画：

```tsx
const [showAppear, setShowAppear] = useState(true)
const [appearVisible, setAppearVisible] = useState(true)

const changeShowAppear = () => {
    if (!showAppear) {
        setShowAppear(true)
        setAppearVisible(true)
    } else {
        setAppearVisible(false)
    }
}
const onVisibleChanged = (visible: boolean) => {
    setShowAppear(visible)
}

return (
	<>
    	<button
            type='button'
            onClick={() => { changeShowAppear() }}
        >
            <span>change show appear</span>
        </button>
    	{
            showAppear && (
                <CSSMotion
                    visible={appearVisible}
                    motionName="fade"
                    motionAppear={true}
                    removeOnLeave={true}
                    onVisibleChanged={onVisibleChanged}
                >
                    {({ className: motionClassName, style: motionStyle }, motionRef) => (
                        <div
                            ref={motionRef}
                            className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                            style={motionStyle}
                        ></div>
                    )}
                </CSSMotion>
            )
        }
    </>
)
```



## 3.配合 prepare 测量 DOM

`prepare` 适合在动画开始前读取尺寸、位置等信息：

```tsx
import CSSMotion, { type CSSMotionRef } from '@/components/CSSMotion'
import { getRect } from '@/hooks/domHooks/useRect'

const CSSMotionComponents: React.FC = () => {
    const [prepareVisible, setPrepareVisible] = useState(true)
    const dialogRef = useRef<CSSMotionRef>(null)

    const onPrepare = () => {
        if (!dialogRef.current?.nativeElement) return

        // 获取元素尺寸
        const dialogRect = getRect(dialogRef.current.nativeElement)

        console.log('dialogRect', dialogRect)

    }
    
    return (
        <CSSMotion
            ref={dialogRef}
            visible={prepareVisible}
            motionName="fade"
            motionAppear={false}
            removeOnLeave={false}
            onAppearPrepare={onPrepare}
            onEnterPrepare={onPrepare}
        >
            {({ className: motionClassName, style: motionStyle }, motionRef) => (
                <div
                    ref={motionRef}
                    className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                    style={motionStyle}
                ></div>
            )}
        </CSSMotion>
    )
}
```

`CSS`需要设置 `prepare` 步骤的样式，防止 `transform: scale(0);` 导致的 `getRect()` 错误

```less
.fade-appear-prepare,
.fade-enter-prepare {
    // 重置缩放比例以避免 mousePosition bug
    transform: none;
    opacity: 0;
    user-select: none;
}
```



## 4.memo 组件的写法

如果子节点是组件而不是原生标签，那么它必须支持 `ref`。`memo` 组件需要配合 `forwardRef` 使用：

```tsx
type MemoProps = {
    visible?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

// eslint-disable-next-line prefer-arrow-callback
const ForwardedComponent = forwardRef(function ForwardedComponent(
    { className: motionClassName, style: motionStyle }: MemoProps,
    ref: React.Ref<HTMLDivElement>,        // 这个 ref 来自父组件或 CSSMotion，用于访问真实 DOM
) {
    // 把 CSSMotion 的 ref 绑定到当前的 HTMLDivElement
    // 这样父组件 / CSSMotion 就能直接访问 DOM 节点，绑定动画事件或操作 DOM
    return (
        <div
            ref={ref}
            className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
            style={motionStyle}
        />
    )
})
// memo 组件需要配合 forwardRef 组件使用
const MemoComponent = memo(ForwardedComponent)

<CSSMotion
    visible={memoVisible}
    motionName="fade"
    motionAppear={false}
    removeOnLeave={false}
>
    {({ className, style }) => <MemoComponent className={className} style={style} />}
</CSSMotion>
```



# className 规则

组件会按照`motionName-status-step`（类名-状态-步骤）的给子元素添加类名

当 `motionName="fade"` 时，组件会按阶段生成如下类名：

- `fade-appear`
- `fade-appear-prepare`
- `fade-appear-start`
- `fade-appear-active`
- `fade-enter`
- `fade-enter-prepare`
- `fade-enter-start`
- `fade-enter-active`
- `fade-leave`
- `fade-leave-prepare`
- `fade-leave-start`
- `fade-leave-active`

同时在动画过程中，还会额外挂上基础类名：

- `fade`

因此子节点常见收到的类名形态是：

```tsx
className="fade-enter fade-enter-active fade"
```



# 生命周期

## 动画状态

| 状态     | 说明                               |
| :------- | :--------------------------------- |
| `none`   | 当前没有动画                       |
| `appear` | 首次挂载且初始可见时触发           |
| `enter`  | 已挂载状态下，从隐藏切到显示时触发 |
| `leave`  | 已挂载状态下，从显示切到隐藏时触发 |

## 步骤状态

| 步骤       | 说明                                    |
| :--------- | :-------------------------------------- |
| `prepare`  | 动画前准备阶段，适合测量 DOM            |
| `start`    | 设置动画初始样式，通常会禁用 transition |
| `active`   | 正式触发动画                            |
| `end`      | 动画结束阶段                            |
| `prepared` | 无动画时的快捷结束步骤                  |

## 完整流程

### 首次挂载且 `visible = true`

前提：`motionAppear = true`

1. 初始状态为 `none`
2. 检测到首次挂载且可见
3. 进入 `appear`
4. 依次执行 `prepare -> start -> active`
5. 监听 `transitionend / animationend`
6. 动画结束后回到 `none`
7. 触发 `onVisibleChanged(true)`

### 已挂载，`visible: false -> true`

前提：`motionEnter = true`

1. 状态切换为 `enter`
2. 执行 `onEnterPrepare`
3. 执行 `onEnterStart`
4. 执行 `onEnterActive`
5. 等待结束事件
6. 收尾并触发 `onVisibleChanged(true)`

### 已挂载，`visible: true -> false`

前提：`motionLeave = true`

1. 状态切换为 `leave`
2. 节点暂时保留在 DOM 中
3. 执行 `prepare -> start -> active`
4. 动画结束后回到 `none`
5. 触发 `onVisibleChanged(false)`
6. 最终根据 `removeOnLeave / leavedClassName / forceRender` 决定渲染结果

### 不支持 motion，但定义了 prepare

1. 进入目标状态
2. 执行 `prepare`
3. 走精简流程 `prepare -> prepared`
4. 直接收尾，不进入真实 `start / active`



# API

## Props

| 参数                     | 说明                                         | 类型                                       | 默认值 |
| :----------------------- | :------------------------------------------- | :----------------------------------------- | :----- |
| `motionName`             | 动画 className 前缀                          | `string`                                   | -      |
| `visible`                | 当前目标可见状态                             | `boolean`                                  | `true` |
| `removeOnLeave`          | `leave` 结束后是否从 DOM 移除                | `boolean`                                  | `true` |
| `motionAppear`           | 首次挂载且可见时是否执行 appear 动画         | `boolean`                                  | `true` |
| `motionEnter`            | 显示时是否执行 enter 动画                    | `boolean`                                  | `true` |
| `motionLeave`            | 隐藏时是否执行 leave 动画                    | `boolean`                                  | `true` |
| `motionLeaveImmediately` | 初始 `visible=false` 时是否也执行 leave 动画 | `boolean`                                  | -      |
| `motionDeadline`         | 动画超时时间，超时后强制结束                 | `number`                                   | -      |
| `leavedClassName`        | `leave` 后保留节点时附加的类名               | `string`                                   | -      |
| `forceRender`            | 即使不可见也强制渲染节点                     | `boolean`                                  | -      |
| `eventProps`             | 透传给 `children` 的额外 props               | `Record<string, unknown>`                  | -      |
| `onAppearPrepare`        | `appear` 的准备阶段回调，此处可以测量 `DOM`  | `(element) => Promise<any> | void`         | -      |
| `onAppearStart`          | `appear` 的 start 阶段回调，可返回样式       | `(element, event) => CSSProperties | void` | -      |
| `onAppearActive`         | `appear` 的 active 阶段回调，可返回样式      | `(element, event) => CSSProperties | void` | -      |
| `onAppearEnd`            | `appear` 结束回调，返回 `false` 可阻止结束   | `(element, event) => boolean | void`       | -      |
| `onEnterPrepare`         | `enter` 的准备阶段回调，此处可以测量 `DOM`   | `(element) => Promise<any> | void`         | -      |
| `onEnterStart`           | `enter` 的 start 阶段回调，可返回样式        | `(element, event) => CSSProperties | void` | -      |
| `onEnterActive`          | `enter` 的 active 阶段回调，可返回样式       | `(element, event) => CSSProperties | void` | -      |
| `onEnterEnd`             | `enter` 结束回调，返回 `false` 可阻止结束    | `(element, event) => boolean | void`       | -      |
| `onLeavePrepare`         | `leave` 的准备阶段回调                       | `(element) => Promise<any> | void`         | -      |
| `onLeaveStart`           | `leave` 的 start 阶段回调，可返回样式        | `(element, event) => CSSProperties | void` | -      |
| `onLeaveActive`          | `leave` 的 active 阶段回调，可返回样式       | `(element, event) => CSSProperties | void` | -      |
| `onLeaveEnd`             | `leave` 结束回调，返回 `false` 可阻止结束    | `(element, event) => boolean | void`       | -      |
| `onVisibleChanged`       | 当最终可见状态稳定后触发                     | `(visible: boolean) => void`               | -      |
| `children`               | render props，必须返回可挂 `ref` 的元素      | `(props, ref) => ReactElement`             | -      |



# 注意事项

1. `children` 必须返回单个 React 元素，并且该元素最终要能挂到真实 `DOM ref`
2. 如果使用自定义组件，请确保它支持 `forwardRef`
3. `motionName` 只负责拼接类名，不会自动生成样式，动画样式需要自行编写
4. `onVisibleChanged` 是在动画真正结束后触发，不是 `visible` 一变化就立即触发
5. `removeOnLeave={false}` 时，节点可能被隐藏但仍然保留在 DOM 中
6. `motionDeadline` 可作为兜底方案，防止某些场景下收不到结束事件
7. `prepare` 适合做测量，`start / active` 适合返回当前阶段需要的内联样式
