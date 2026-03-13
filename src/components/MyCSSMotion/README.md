# CSSMotion

仿照 `rc-motion` 实现的 CSS 动画状态机组件。通过 `visible` 属性驱动三阶段动画，每阶段内部依次执行四个步骤，最终通过 `transitionend` / `animationend` 事件或超时兜底结束动画。

---

## 文件结构

```
CSSMotion/
├── interface.ts              # 类型定义 & 常量
├── utils/
│   └── motion.ts             # 浏览器前缀检测、getTransitionName
├── hooks/
│   ├── useNextFrame.ts       # RAF 封装（多帧延迟）
│   ├── useStepQueue.ts       # 步骤队列状态机
│   ├── useDomMotionEvents.ts # transitionend/animationend 绑定
│   └── useStatus.ts          # 核心动画状态机
├── CSSMotion.tsx             # 主组件（render prop）
├── index.ts                  # 统一导出
└── README.md
```

---

## 状态机

### MotionStatus（动画阶段）

| 值       | 触发时机                              |
| -------- | ------------------------------------- |
| `none`   | 静止，无动画进行                      |
| `appear` | 组件首次挂载且 `visible=true`         |
| `enter`  | 已挂载，`visible` 从 `false` → `true` |
| `leave`  | 已挂载，`visible` 从 `true` → `false` |

### MotionStep（步骤）

```
prepare → start → active → end
```

| 步骤       | className 后缀 | 说明                                  |
| ---------- | -------------- | ------------------------------------- |
| `prepare`  | `-prepare`     | 设置初始状态，可异步（返回 Promise）  |
| `start`    | `-start`       | 设置起始样式，强制 `transition: none` |
| `active`   | `-active`      | 添加过渡目标样式，绑定 DOM 事件       |
| `end`      | —              | 动画完成，回到 `none`                 |
| `prepared` | —              | 禁用动画时跳过 start/active 的快捷步骤|

### 流程图

```
visible 变化
    │
    ▼
useStatus ──判断──► STATUS_APPEAR / ENTER / LEAVE
    │
    ▼
useStepQueue
    │
    ├─ STEP_PREPARE  →  onXxxPrepare()   可跳过 / 异步
    │       ↓ (下一帧)
    ├─ STEP_START    →  onXxxStart()     样式 + transition:none
    │       ↓ (下一帧)
    ├─ STEP_ACTIVE   →  onXxxActive()    样式 + 绑定 DOM 事件
    │                                    + motionDeadline 超时计时
    │       ↓ (transitionend / animationend / deadline)
    └─ STEP_END      →  onXxxEnd()       返回 false 可阻止结束
                              │
                              ▼
                        STATUS_NONE（动画结束）
```

---

## Props

| Prop                   | 类型                             | 默认    | 说明                                     |
| ---------------------- | -------------------------------- | ------- | ---------------------------------------- |
| `visible`              | `boolean`                        | `true`  | 控制显隐                                 |
| `motionName`           | `string \| Record<string,string>`| —       | CSS 类名前缀，缺省时禁用动画             |
| `motionAppear`         | `boolean`                        | `true`  | 是否启用 appear 阶段                     |
| `motionEnter`          | `boolean`                        | `true`  | 是否启用 enter 阶段                      |
| `motionLeave`          | `boolean`                        | `true`  | 是否启用 leave 阶段                      |
| `motionLeaveImmediately`| `boolean`                       | —       | 首次挂载 visible=false 时也执行 leave    |
| `motionDeadline`       | `number`                         | —       | 动画超时时间（ms），超时后强制结束       |
| `removeOnLeave`        | `boolean`                        | `true`  | leave 结束后是否移除 DOM                 |
| `leavedClassName`      | `string`                         | —       | leave 后保留 DOM 并附加此 className      |
| `forceRender`          | `boolean`                        | —       | 强制渲染，即使 visible=false 且未渲染过  |
| `eventProps`           | `Record<string, unknown>`        | —       | 透传给 children 的额外 props             |
| `onXxxPrepare`         | `MotionEventHandler`             | —       | 各阶段 prepare 回调，可返回 Promise      |
| `onXxxStart`           | `MotionEventHandler`             | —       | 各阶段 start 回调，返回样式对象          |
| `onXxxActive`          | `MotionEventHandler`             | —       | 各阶段 active 回调，返回样式对象         |
| `onXxxEnd`             | `MotionEndEventHandler`          | —       | 各阶段结束回调，返回 false 可阻止结束   |
| `onVisibleChanged`     | `(visible: boolean) => void`     | —       | 动画完全结束后触发                       |
| `children`             | render prop                      | —       | 见下方用法                               |

---

## 用法

### 基础

```tsx
import CSSMotion from '@/components/CSSMotion'

<CSSMotion visible={open} motionName="fade" removeOnLeave>
  {({ className, style }, ref) => (
    <div className={className} style={style} ref={ref}>
      内容
    </div>
  )}
</CSSMotion>
```

### 配套 CSS

```css
/* appear & enter */
.fade-appear,
.fade-enter            { opacity: 0; }

.fade-appear-active,
.fade-enter-active     { opacity: 1; transition: opacity 300ms ease; }

/* leave */
.fade-leave            { opacity: 1; }
.fade-leave-active     { opacity: 0; transition: opacity 300ms ease; }
```

### 对象形式的 motionName

```tsx
<CSSMotion
  motionName={{
    appear:       'my-appear',
    appearActive: 'my-appear-active',
    enter:        'my-enter',
    enterActive:  'my-enter-active',
    leave:        'my-leave',
    leaveActive:  'my-leave-active',
  }}
  visible={open}
>
  {({ className, style }, ref) => <div className={className} style={style} ref={ref} />}
</CSSMotion>
```

### 超时兜底

```tsx
<CSSMotion visible={open} motionName="slide" motionDeadline={500}>
  {({ className, style }, ref) => (
    <div className={className} style={style} ref={ref} />
  )}
</CSSMotion>
```

### leave 后保留 DOM

```tsx
<CSSMotion
  visible={open}
  motionName="fade"
  removeOnLeave={false}
  leavedClassName="hidden"
>
  {({ className, style }, ref) => (
    <div className={className} style={style} ref={ref} />
  )}
</CSSMotion>
```

### Ref

```tsx
const motionRef = useRef<CSSMotionRef>(null)

<CSSMotion ref={motionRef} visible={open} motionName="fade">
  {({ className }, ref) => <div className={className} ref={ref} />}
</CSSMotion>

motionRef.current?.inMotion()    // 是否正在动画
motionRef.current?.enableMotion() // 是否启用了动画
motionRef.current?.nativeElement  // 目标 DOM 节点
```

---

## Hooks 说明

### `useNextFrame`

封装 `requestAnimationFrame`，支持 N 帧延迟（默认 2 帧），确保浏览器有足够时间完成样式计算。

### `useStepQueue`

步骤队列驱动器。每次 `status` 变化后调用 `startStep()` 启动队列，通过 `useLayoutEffect` 同步推进步骤，`nextFrame` 异步推进到下一步（避免浏览器合并样式）。

### `useDomMotionEvents`

绑定 `transitionend` / `animationend` 事件到目标元素，节点切换时自动清理旧监听，组件卸载时统一移除。

### `useStatus`

主状态机。监听 `visible` 变化决定进入哪个 `MotionStatus`，在每个步骤调用对应的用户回调并收集样式，通过 `onInternalMotionEnd` 接收动画结束信号并重置状态。
