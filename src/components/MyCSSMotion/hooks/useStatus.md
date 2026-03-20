# useStatus.ts 代码详解

> 文件位置：`src/hooks/useStatus.ts`
>
> 相关文件：
> - `src/hooks/useStepQueue.ts`
> - `src/hooks/useDomMotionEvents.ts`
> - `src/hooks/useNextFrame.ts`
> - `src/interface.ts`
> - `src/CSSMotion.tsx`

## 1. 这个 Hook 是干什么的？

`useStatus` 是整个动效状态流转的核心 Hook。

它的职责可以概括为 5 件事：

1. 根据 `visible` 的变化，决定当前应该进入哪一种 motion 状态：`appear` / `enter` / `leave` / `none`
2. 通过分步队列推进动画阶段：`prepare -> start -> active -> end`
3. 调用外部传入的生命周期回调，比如 `onEnterPrepare`、`onLeaveActive`、`onAppearEnd`
4. 监听 DOM 的 `transitionend` / `animationend`，在动画完成后收尾
5. 返回当前渲染所需要的信息给 `CSSMotion`：状态、步骤、样式、可见性、样式是否准备好

可以把它理解成：

- `CSSMotion.tsx` 负责“渲染什么 className / style”
- `useStatus.ts` 负责“现在动画进行到哪一步了”

入口见 `src/hooks/useStatus.ts:27`，调用方见 `src/CSSMotion.tsx:149-151`。

---

## 2. 函数签名

```ts
export default function useStatus(
  supportMotion: boolean,
  visible: boolean,
  getElement: () => HTMLElement,
  props: CSSMotionProps,
): [
  status: () => MotionStatus,
  stepStatus: StepStatus,
  style: React.CSSProperties,
  visible: boolean,
  styleReady: 'NONE' | boolean,
]
```

定义位置：`src/hooks/useStatus.ts:27-57`

### 参数含义

#### `supportMotion`
- 表示当前环境和配置是否真的支持 motion
- 由 `CSSMotion.tsx` 里的 `isSupportTransition` 计算得到，见 `src/CSSMotion.tsx:120-122`、`src/CSSMotion.tsx:140`
- 通常要同时满足：
  - 有 `motionName`
  - 浏览器支持 transition/animation
  - context 没有禁用 motion

#### `visible`
- 当前目标可见状态
- 它是整个状态机最核心的输入
- `false -> true` 可能触发 `appear` 或 `enter`
- `true -> false` 可能触发 `leave`

#### `getElement`
- 返回真实 DOM 元素
- 用于：
  - 执行 prepare/start/active/end 回调
  - 绑定 / 解绑 transitionend 和 animationend 事件
  - 过滤冒泡上来的子元素动画结束事件

#### `props: CSSMotionProps`
- 里面包含各种 motion 配置和回调
- 比如：
  - 是否启用某个阶段：`motionAppear` / `motionEnter` / `motionLeave`
  - 超时结束：`motionDeadline`
  - 是否首次不可见时立即走 leave：`motionLeaveImmediately`
  - 各阶段回调：`onEnterPrepare` / `onEnterStart` / `onEnterActive` / `onEnterEnd` 等
  - 动画最终完成后的通知：`onVisibleChanged`

相关定义见 `src/CSSMotion.tsx:42-99`。

---

## 3. 先理解两个维度：status 和 step

这个 Hook 里有两个很容易混淆、但必须分清的概念。

## 3.1 status：当前是哪类动画

定义在 `src/interface.ts:1-10`：

```ts
STATUS_NONE   = 'none'
STATUS_APPEAR = 'appear'
STATUS_ENTER  = 'enter'
STATUS_LEAVE  = 'leave'
```

含义：
- `none`：当前不在任何 motion 中
- `appear`：首次挂载时从不可见到可见的入场动画
- `enter`：组件已挂载后，从不可见到可见的进入动画
- `leave`：从可见到不可见的离场动画

## 3.2 step：当前动画进行到哪一步

定义在 `src/interface.ts:12-30`：

```ts
STEP_NONE      = 'none'
STEP_PREPARE   = 'prepare'
STEP_START     = 'start'
STEP_ACTIVE    = 'active'
STEP_ACTIVATED = 'end'
STEP_PREPARED  = 'prepared'
```

含义：
- `prepare`：准备阶段，通常用于测量 DOM 或预计算样式
- `start`：动画开始前的样式状态
- `active`：动画正式激活状态
- `end`：已经进入激活后的结束态（由 `useStepQueue` 表示）
- `prepared`：特殊简化状态，只在“仅 prepare、不跑完整 motion”时使用

你可以这样理解：

- `status` 决定“动画类型”
- `step` 决定“动画阶段”

例如：
- `status = enter, step = prepare`
- `status = enter, step = start`
- `status = enter, step = active`

---

## 4. 内部状态变量逐个解释

## 4.1 `asyncVisible`

定义：`src/hooks/useStatus.ts:58-59`

```ts
const [asyncVisible, setAsyncVisible] = React.useState<boolean>();
```

作用：
- 保存一个“用于渲染过渡期”的 visible 值
- 避免外部 `visible` 已变成 `false`，但动画还没结束时，组件立刻不渲染

返回值中真正给渲染层使用的是：

```ts
asyncVisible ?? visible
```

见 `src/hooks/useStatus.ts:313`。

这意味着：
- 外部要隐藏了，不代表 DOM 立刻消失
- 可以先继续保留节点，把 leave 动画跑完

---

## 4.2 `status`

定义：`src/hooks/useStatus.ts:60`

```ts
const [getStatus, setStatus] = useSyncState<MotionStatus>(STATUS_NONE);
```

这里用的是 `useSyncState`，不是普通 `useState`。

原因：
- 某些事件回调、timeout 回调、DOM end 事件里需要同步拿到最新状态
- `getStatus()` 可以避免闭包拿到旧值

当前值：

```ts
const currentStatus = getStatus();
```

见 `src/hooks/useStatus.ts:65`。

---

## 4.3 `style`

定义：`src/hooks/useStatus.ts:61-63`

```ts
const [style, setStyle] = React.useState<[style: React.CSSProperties | undefined, step: StepStatus]>([null, null]);
```

这里保存的是一个二元组：

- `style[0]`：当前步骤产生的内联样式
- `style[1]`：这份样式是在哪个 step 生成的

这样设计的原因是：
- Hook 需要确认“当前返回出去的 style 是否已经和 step 对齐”
- 这正是最后 `styleReady` 计算的依据之一

---

## 4.4 `mountedRef`

定义：`src/hooks/useStatus.ts:67`

作用：
- 标记组件是否已经挂载过
- 用来区分 `appear` 和 `enter`

判断逻辑在 `src/hooks/useStatus.ts:217-242`：
- 首次挂载且 `visible === true` 且 `motionAppear` 为真 -> `appear`
- 非首次挂载且 `visible === true` 且 `motionEnter` 为真 -> `enter`

---

## 4.5 `deadlineRef`

定义：`src/hooks/useStatus.ts:68`

作用：
- 保存 `motionDeadline` 的定时器
- 如果浏览器没有触发 `transitionend` / `animationend`，或者用户的样式本身不会产生结束事件，就用 deadline 兜底结束动画

对应逻辑在 `src/hooks/useStatus.ts:182-189`。

---

## 4.6 `activeRef`

定义：`src/hooks/useStatus.ts:76`

作用：
- 表示当前是否处于“动画真正激活”的阶段
- 借助 `isActive(step)` 判断，见 `src/hooks/useStepQueue.ts:29-31`

更新位置：`src/hooks/useStatus.ts:200-201`

```ts
const active = isActive(step);
activeRef.current = active;
```

它的意义是：
- 只有在 active 阶段，动画结束事件才有资格真正结束这次 motion
- 避免过早结束

---

## 4.7 `visibleRef`

定义：`src/hooks/useStatus.ts:204`

作用：
- 记录上一次 `visible`
- 用于跳过 Suspense 等场景下“值没变但 effect 重跑”的情况

关键逻辑见 `src/hooks/useStatus.ts:207-213`：

```ts
if (mountedRef.current && visibleRef.current === visible) {
  return;
}
```

注释里明确提到了是为了处理 Suspense 重复触发问题。

---

## 4.8 `firstMountChangeRef`

定义：`src/hooks/useStatus.ts:282`

作用：
- 控制 `onVisibleChanged` 的首次触发行为
- 避免“首次渲染就是 invisible”时误认为发生了 visible 改变

这个细节在 `src/hooks/useStatus.ts:289-295` 非常关键。

---

## 5. `updateMotionEndStatus`：动画结束后的统一收尾

定义：`src/hooks/useStatus.ts:81-84`

```ts
function updateMotionEndStatus() {
  setStatus(STATUS_NONE);
  setStyle([null, null]);
}
```

它做两件事：

1. 把 motion 状态重置为 `none`
2. 清空当前步骤样式

只要动画真正结束，都会尽量走到这里。

---

## 6. `onInternalMotionEnd`：真正的动画结束处理器

定义：`src/hooks/useStatus.ts:86-117`

这是整个 Hook 最核心的收尾逻辑之一。

## 6.1 第一步：如果本来就不在动画中，直接忽略

```ts
if (status === STATUS_NONE) {
  return;
}
```

作用：
- 防止重复结束
- deadline 或事件竞争时避免多次收尾

---

## 6.2 第二步：过滤掉不是当前元素自己的结束事件

```ts
if (event && !event.deadline && event.target !== element) {
  return;
}
```

作用：
- 忽略内部子元素冒泡上来的 `transitionend` / `animationend`
- 只接受当前 motion DOM 本身的结束事件

这是动画组件里非常常见、也非常必要的保护。

---

## 6.3 第三步：调用对应的 `onAppearEnd / onEnterEnd / onLeaveEnd`

```ts
if (status === STATUS_APPEAR && currentActive) {
  canEnd = onAppearEnd?.(element, event);
} else if (status === STATUS_ENTER && currentActive) {
  canEnd = onEnterEnd?.(element, event);
} else if (status === STATUS_LEAVE && currentActive) {
  canEnd = onLeaveEnd?.(element, event);
}
```

注意这里要求 `currentActive` 为真，也就是：

- 只有 active 阶段，才认为可以检查动画是否结束
- prepare / start 阶段即使收到一些事件，也不会结束

---

## 6.4 第四步：决定是否真的结束

```ts
if (currentActive && canEnd !== false) {
  updateMotionEndStatus();
}
```

这句很重要：

- 如果用户的 `onXxxEnd` 明确返回 `false`
  - 本次动画不会结束
  - 可以理解为“用户决定继续等待”
- 其他情况都允许收尾

也就是说，`onXxxEnd` 有一个“阻止结束”的能力。

---

## 7. `useDomMotionEvents`：给 DOM 绑定结束事件

在 `src/hooks/useStatus.ts:119`：

```ts
const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd);
```

对应实现见 `src/hooks/useDomMotionEvents.ts:7-45`。

它主要负责：
- 给元素绑定 `transitionend`
- 给元素绑定 `animationend`
- 元素变化时清理旧元素上的事件
- 组件卸载时清理事件

真正绑定发生在进入 `STEP_ACTIVE` 时，见 `src/hooks/useStatus.ts:178-180`：

```ts
patchMotionEvents(getDomElement());
```

这说明作者的设计是：
- 不是一开始就绑事件
- 而是等动画真正进入 active 阶段后再开始监听结束

这是合理的，因为 active 才是 CSS transition / animation 真正生效的阶段。

---

## 8. `getEventHandlers`：按 status 取对应回调组

定义：`src/hooks/useStatus.ts:122-148`

它做的事情很直接：

- 如果当前状态是 `appear`
  - 返回 `onAppearPrepare / onAppearStart / onAppearActive`
- 如果当前状态是 `enter`
  - 返回 `onEnterPrepare / onEnterStart / onEnterActive`
- 如果当前状态是 `leave`
  - 返回 `onLeavePrepare / onLeaveStart / onLeaveActive`

这样后续流程就可以统一写，不用每次都分三套逻辑。

再通过 `useMemo` 生成当前状态对应的 handler 映射，见 `src/hooks/useStatus.ts:150-154`。

---

## 9. `useStepQueue`：如何推进 prepare -> start -> active

接入位置：`src/hooks/useStatus.ts:156-198`

```ts
const [startStep, step] = useStepQueue(
  currentStatus,
  !supportMotion,
  newStep => { ... }
);
```

这里第二个参数是 `!supportMotion`，也就是：

- `supportMotion === true` -> 完整队列
- `supportMotion === false` -> 简化队列

### 9.1 完整队列

定义在 `src/hooks/useStepQueue.ts:15-20`

```ts
[STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED]
```

### 9.2 简化队列

定义在 `src/hooks/useStepQueue.ts:22`

```ts
[STEP_PREPARE, STEP_PREPARED]
```

也就是说：
- 支持 motion：完整跑 prepare/start/active
- 不支持 motion：仍然允许 prepare 执行，但不进入真正动画阶段

这和 `CSSMotionProps` 注释完全一致：prepare 阶段即使 motion 关闭也可能需要触发，见 `src/CSSMotion.tsx:63-69`。

---

## 10. `useStepQueue` 回调里每一步在做什么

这段逻辑是整个 Hook 的执行核心，定义在 `src/hooks/useStatus.ts:159-197`。

## 10.1 `STEP_PREPARE`

```ts
if (newStep === STEP_PREPARE) {
  const onPrepare = eventHandlers[STEP_PREPARE];
  if (!onPrepare) {
    return SkipStep;
  }

  return onPrepare(getDomElement());
}
```

含义：
- 如果当前状态没有 prepare 回调，直接跳过 prepare
- 如果有，就执行它
- 它可以返回：
  - `void`
  - `Promise`

因为 `useStepQueue` 支持 Promise，所以 prepare 阶段可以异步，比如：
- 先测量 DOM
- 等布局稳定
- 再推进到下一步

对应 `useStepQueue.ts:55-76`。

---

## 10.2 `STEP_START` / `STEP_ACTIVE`

```ts
if (newStep in eventHandlers) {
  setStyle([
    eventHandlers[newStep]?.(getDomElement(), null) || null,
    newStep,
  ]);
}
```

含义：
- 执行 `onStart` 或 `onActive`
- 如果回调返回 style，就保存下来
- 并记录这份 style 是在哪个 step 生成的

这里的 style 一般会被 `CSSMotion` 传给子元素作为内联样式，见 `src/CSSMotion.tsx:236-245`。

---

## 10.3 进入 `STEP_ACTIVE` 时做两件大事

```ts
if (newStep === STEP_ACTIVE && currentStatus !== STATUS_NONE) {
  patchMotionEvents(getDomElement());

  if (motionDeadline > 0) {
    clearTimeout(deadlineRef.current);
    deadlineRef.current = setTimeout(() => {
      onInternalMotionEnd({ deadline: true } as MotionEvent);
    }, motionDeadline);
  }
}
```

### 第一件：绑定 motion end 事件
- 监听 transition/animation 结束

### 第二件：启动 deadline 兜底计时器
- 如果超过 `motionDeadline` 还没收到结束事件
- 就手动调用 `onInternalMotionEnd`
- 并带上 `deadline: true`

这能解决很多实际问题：
- CSS 没有 transition-duration
- 动画被中断
- 某些浏览器没触发 end 事件
- 元素已经被移除，导致事件没机会派发

---

## 10.4 `STEP_PREPARED`：无 motion 时的快速结束

```ts
if (newStep === STEP_PREPARED) {
  updateMotionEndStatus();
}
```

这只会在简化队列下出现。

意思是：
- 如果当前不支持 motion
- 但 prepare 已执行完
- 那就直接把状态重置为 `none`

这是一种“保留 prepare、跳过动画”的设计。

---

## 11. `activeRef` 为什么要单独保存？

在 `src/hooks/useStatus.ts:200-201`：

```ts
const active = isActive(step);
activeRef.current = active;
```

因为 `onInternalMotionEnd` 是事件回调，不一定拿到最新渲染闭包。

所以作者把“当前是否 active”同步写入 ref，方便在 end 事件发生时判断：

- 只有 active 阶段，结束事件才有效

这是一个典型的“避免闭包旧值”的写法。

---

## 12. 当 `visible` 变化时，如何决定 nextStatus

核心逻辑在 `src/hooks/useStatus.ts:207-256`。

这是整个 Hook 的状态入口。

## 12.1 跳过重复 visible

```ts
if (mountedRef.current && visibleRef.current === visible) {
  return;
}
```

这是为了防止：
- Suspense 场景 effect 重跑
- 但 visible 实际没变化
- 导致错误重复触发动画

---

## 12.2 同步 `asyncVisible`

```ts
setAsyncVisible(visible);
```

即使最终会进入动画，也先把目标 visible 记下来。

---

## 12.3 判断当前是不是首次挂载

```ts
const isMounted = mountedRef.current;
mountedRef.current = true;
```

这里的 `isMounted` 其实表示“调用这段 effect 之前是否已经挂载过”。

- `false`：首次进入
- `true`：后续更新

---

## 12.4 计算下一种状态

### appear

```ts
if (!isMounted && visible && motionAppear) {
  nextStatus = STATUS_APPEAR;
}
```

首次挂载、初始可见、允许 appear -> 走 appear。

### enter

```ts
if (isMounted && visible && motionEnter) {
  nextStatus = STATUS_ENTER;
}
```

非首次挂载、切换到可见、允许 enter -> 走 enter。

### leave

```ts
if (
  (isMounted && !visible && motionLeave) ||
  (!isMounted && motionLeaveImmediately && !visible && motionLeave)
) {
  nextStatus = STATUS_LEAVE;
}
```

两种 leave 场景：

1. 正常更新导致隐藏
2. 首次挂载时本来就是隐藏，但要求 `motionLeaveImmediately`

第二种比较特殊，意思是：
- 一上来虽然不可见
- 但也要表现成“离场态”动画或离场过程

---

## 12.5 决定是否真正启动 motion

```ts
const nextEventHandlers = getEventHandlers(nextStatus);

if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
  setStatus(nextStatus);
  startStep();
} else {
  setStatus(STATUS_NONE);
}
```

这一段非常值得注意。

含义是：
- 只要有 `nextStatus`
- 并且满足下面任意一个条件，就会进入 step 队列：
  1. 支持 motion
  2. 虽然不支持 motion，但有 prepare 回调

也就是说，不支持 CSS 动画时，prepare 依然可能被保留执行。

如果两者都不满足：
- 直接回到 `STATUS_NONE`

最后再记录本次 visible：

```ts
visibleRef.current = visible;
```

---

## 13. motion 配置变化时的兜底重置

逻辑在 `src/hooks/useStatus.ts:258-271`。

```ts
if (
  (currentStatus === STATUS_APPEAR && !motionAppear) ||
  (currentStatus === STATUS_ENTER && !motionEnter) ||
  (currentStatus === STATUS_LEAVE && !motionLeave)
) {
  setStatus(STATUS_NONE);
}
```

意思是：
- 如果动画已经在跑
- 但对应开关被动态关掉了
- 就立刻取消当前 motion

这是一个防御性处理，避免状态机继续停留在无效状态。

---

## 14. 卸载时的清理

逻辑在 `src/hooks/useStatus.ts:273-279`：

```ts
useEffect(
  () => () => {
    mountedRef.current = false;
    clearTimeout(deadlineRef.current);
  },
  [],
);
```

清理内容：
- 标记未挂载
- 清除 deadline timer

而 motion 事件监听的清理由 `useDomMotionEvents.ts:35-42` 完成。

---

## 15. `onVisibleChanged` 什么时候触发？

逻辑在 `src/hooks/useStatus.ts:281-296`。

这个 effect 的目标是：
- 只有当最终状态稳定下来时，再通知外部 visible 已真正变化

关键判断：

```ts
if (asyncVisible !== undefined && currentStatus === STATUS_NONE) {
  if (firstMountChangeRef.current || asyncVisible) {
    onVisibleChanged?.(asyncVisible);
  }
  firstMountChangeRef.current = true;
}
```

可以拆成两层理解。

## 15.1 必须等 motion 结束

要求：
- `asyncVisible !== undefined`
- `currentStatus === STATUS_NONE`

也就是：
- 已经有明确 visible 目标
- 当前不在动画中

换句话说，`onVisibleChanged` 不是在刚开始 enter/leave 时触发，而是在“真正稳定了”之后触发。

## 15.2 跳过首次 invisible 的无意义通知

```ts
if (firstMountChangeRef.current || asyncVisible) {
  onVisibleChanged?.(asyncVisible);
}
```

这段是为了避免：
- 首次渲染本来就是 `visible = false`
- 其实并没有发生“变化”
- 却错误触发一次 `onVisibleChanged(false)`

但如果首次是 `visible = true`，则会允许触发。

这是个很细致的语义处理。

---

## 16. `mergedStyle`：为什么在 `prepare -> start` 之间强制 `transition: none`

逻辑在 `src/hooks/useStatus.ts:298-305`：

```ts
let mergedStyle = style[0];
if (eventHandlers[STEP_PREPARE] && step === STEP_START) {
  mergedStyle = {
    transition: 'none',
    ...mergedStyle,
  };
}
```

含义：
- 如果当前状态存在 prepare 阶段
- 并且当前来到 `STEP_START`
- 就临时给样式加上 `transition: none`

目的通常是：
- 让 prepare 阶段计算出来的初始样式先无动画地落到 DOM 上
- 避免浏览器把“初始样式注入”也当成一段动画
- 然后下一帧再进入 active，真正开始 transition

这是 CSS 动画库里很典型的“两帧切换”技巧。

配合 `useNextFrame.ts:14-29` 看更容易理解：
- step 的推进不是同一帧完成的
- 而是跨帧推进
- 这样浏览器能正确识别起始样式和激活样式

---

## 17. 最后的返回值逐个解释

返回位置：`src/hooks/useStatus.ts:309-325`

```ts
return [
  getStatus,
  step,
  mergedStyle,
  asyncVisible ?? visible,
  styleReady,
];
```

## 17.1 第 1 个返回值：`getStatus`
- 不是直接返回 `status`
- 而是返回一个 getter 函数
- 方便调用方在任意时刻拿到最新状态，避免闭包旧值

调用方见 `src/CSSMotion.tsx:149-151`：

```ts
const [getStatus, statusStep, statusStyle, mergedVisible, styleReady] = useStatus(...)
const status = getStatus()
```

---

## 17.2 第 2 个返回值：`step`
- 当前 step 阶段
- 用于拼接 CSS class 后缀

调用方见 `src/CSSMotion.tsx:221-245`：
- `prepare`
- `start`
- `active`

最终会生成诸如：
- `xxx-enter`
- `xxx-enter-start`
- `xxx-enter-active`

---

## 17.3 第 3 个返回值：`mergedStyle`
- 当前步骤计算出来的 style
- 会作为子节点的内联样式传出去

调用方见 `src/CSSMotion.tsx:243`。

---

## 17.4 第 4 个返回值：`asyncVisible ?? visible`
- 给渲染层使用的“合并后 visible”
- 确保离场动画期间仍可继续渲染节点

调用方见 `src/CSSMotion.tsx:203-218`。

---

## 17.5 第 5 个返回值：`styleReady`

这一项最绕，但非常重要。

源码：

```ts
!mountedRef.current &&
currentStatus === STATUS_NONE &&
supportMotion &&
motionAppear
  ? 'NONE'
  : step === STEP_START || step === STEP_ACTIVE
    ? styleStep === step
    : true
```

可以分 3 种情况理解。

### 情况 1：首次挂载前的特殊返回 `'NONE'`

满足：
- 还没 mounted
- 当前 status 是 `none`
- 支持 motion
- `motionAppear` 开启

则返回 `'NONE'`。

作用见 `src/CSSMotion.tsx:193-195`：

```ts
if (styleReady === 'NONE') {
  return null;
}
```

也就是说：
- 首次 appear 场景下，先不要渲染
- 等状态准备好了再渲染

这是为了避免首次渲染时出现错误初始样式或闪烁。

### 情况 2：处于 `start` 或 `active`

要求：

```ts
styleStep === step
```

意思是：
- 只有当前 style 是在当前 step 生成的，才算 ready
- 否则说明 step 已推进，但 style 还没对齐，不应该渲染这一帧结果

这是保证 class / step / style 同步的关键。

### 情况 3：其他阶段

直接返回 `true`。

---

## 18. 它和 `CSSMotion.tsx` 是怎么配合的？

最关键的对接点在 `src/CSSMotion.tsx:149-245`。

`useStatus` 提供：
- 当前 motion 类型：`status`
- 当前步骤：`statusStep`
- 当前样式：`statusStyle`
- 当前是否还应该渲染：`mergedVisible`
- 当前渲染是否安全：`styleReady`

`CSSMotion` 基于这些值做渲染：

### 当 `status === none`
- 说明没有在动画中
- 按稳定态渲染
- 可能渲染正常内容
- 可能渲染 `display: none`
- 可能渲染 `leavedClassName`
- 也可能直接 `null`

见 `src/CSSMotion.tsx:203-219`。

### 当 `status !== none`
- 说明正在动画中
- 根据 `status + step` 生成 className
- 把 `statusStyle` 注入到子元素

见 `src/CSSMotion.tsx:220-246`。

---

## 19. 几个典型时序例子

## 19.1 首次挂载且 `visible = true`

前提：`motionAppear = true`

流程：
1. 初始 `status = none`
2. layout effect 检测到首次挂载且 visible 为真
3. 设置 `nextStatus = appear`
4. `startStep()` 启动队列
5. 进入 `prepare`
6. 下一帧进入 `start`
7. 下一帧进入 `active`
8. 绑定 end 事件 / 启动 deadline
9. 收到 end 事件后进入 `status = none`
10. 触发 `onVisibleChanged(true)`

---

## 19.2 组件已挂载，`visible: false -> true`

前提：`motionEnter = true`

流程：
1. effect 发现是非首次且变成 visible
2. `nextStatus = enter`
3. 执行 `onEnterPrepare`
4. 执行 `onEnterStart`
5. 执行 `onEnterActive`
6. 等结束事件
7. 收尾，回到 `none`
8. 触发 `onVisibleChanged(true)`

---

## 19.3 组件已挂载，`visible: true -> false`

前提：`motionLeave = true`

流程：
1. effect 发现要隐藏
2. `nextStatus = leave`
3. `asyncVisible` 被设置为 `false`
4. 但节点不会立刻消失，因为 motion 还在跑
5. 执行 `prepare -> start -> active`
6. 等 end 事件
7. 收尾后 `status = none`
8. 触发 `onVisibleChanged(false)`
9. 最终由 `CSSMotion` 根据 `removeOnLeave / forceRender / leavedClassName` 决定是否还保留节点

---

## 19.4 不支持 motion，但有 prepare

流程：
1. 进入目标状态，比如 enter
2. `useStepQueue` 走简化队列：`prepare -> prepared`
3. `prepare` 依然执行
4. 到 `prepared` 时直接 `updateMotionEndStatus()`
5. 不会进入真实的 `start/active`

这说明 prepare 的语义不是“动画的一部分”，而更像“动画前的准备工作”。

---

## 20. 这个 Hook 里几个特别巧妙的设计点

## 20.1 用 `useSyncState` + getter 避免闭包旧值
- 解决事件回调、timeout 回调拿旧状态的问题

## 20.2 用 `asyncVisible` 把“逻辑 visible”和“渲染 visible”解耦
- 离场动画期间还能继续渲染节点

## 20.3 用 `styleStep` 校验样式和 step 是否同步
- 避免 step 先推进了，但 style 还没更新
- 减少渲染闪烁和错位

## 20.4 prepare 即使在 motion 关闭时也允许执行
- 保证测量逻辑仍然有机会运行

## 20.5 `motionDeadline` 作为 end event 的兜底
- 提升真实环境稳定性

## 20.6 过滤 `event.target !== element`
- 防止子元素动画结束误伤父元素状态机

---

## 21. 读这份源码时最容易误解的点

## 21.1 `asyncVisible = false` 不代表节点立刻消失
是否立刻不渲染，要看：
- 当前是否还在 motion 中
- `CSSMotion.tsx` 中 `removeOnLeave` / `forceRender` / `leavedClassName` 的逻辑

## 21.2 `styleReady` 不是“动画准备好了”这么简单
它更准确地说是：
- “当前 step 对应的 style 是否已经同步到位，可以安全渲染了”

## 21.3 `STEP_ACTIVATED` 没有直接在 `useStatus.ts` 里特殊处理
它主要由 `useStepQueue.ts` 表示“active 已完成推进”。
真正结束动画还是依赖：
- DOM end event
- 或 deadline
- 或 `STEP_PREPARED` 的快速结束

## 21.4 `onVisibleChanged` 不是 visible 一改就触发
它是在最终稳定态触发，而不是在动画刚开始时触发。

---

## 22. 用一句话总结整个 `useStatus`

`useStatus` 本质上是一个“动效状态机 + 分帧步骤调度器 + DOM 结束事件收尾器”。

它把一个 motion 拆成：
- 该不该动
- 动的是 appear / enter / leave
- 当前在 prepare / start / active 哪一步
- 什么时候算真正结束
- 结束后什么时候通知外部 visible 已稳定变化

---

## 23. 如果你想继续深入，建议下一步看哪些文件

### 第一优先级
- `src/CSSMotion.tsx`
  - 看 `useStatus` 的返回值最终怎么决定渲染

### 第二优先级
- `src/hooks/useStepQueue.ts`
  - 看 step 为什么是跨帧推进的

### 第三优先级
- `src/hooks/useDomMotionEvents.ts`
  - 看 transition/animation 结束事件是怎么绑定和清理的

### 第四优先级
- `src/interface.ts`
  - 看状态常量和类型定义

---

## 24. 最简心智模型

你可以直接记住下面这段：

```text
visible 变化
  -> 计算 nextStatus(appear / enter / leave)
  -> 启动 step 队列
  -> prepare
  -> start
  -> active
  -> 监听 transitionend / animationend
  -> 或 deadline 兜底
  -> 收尾为 status = none
  -> 触发 onVisibleChanged
```

如果你愿意，我下一步还可以继续帮你做两件事之一：

1. 继续把 `useStatus.ts` 画成“状态流转图”补充到这份 md 里
2. 再连同 `CSSMotion.tsx` 一起讲，帮你把整个 motion 渲染链路串起来
