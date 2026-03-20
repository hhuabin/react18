# `useStatus` 工作流程

1. 首次挂载且 `visible = true` -> `motionAppear ` 执行 `status = 'appear'` 的 `step` 生命周期
2. 组件已挂载，`visible: false -> true` -> `motionEnter ` 执行 `status = 'enter'` 的 `step` 生命周期
3. 组件已挂载，`visible: true -> false` -> `motionLeave` 执行 `status = 'leave'` 的 `step` 生命周期
4. 不支持 motion，但有 prepare



## 首次挂载且 `visible = true`

前提：`motionAppear = true`

流程：

1. 初始 `status = none`
2. `layout effect` 检测到首次挂载且 `visible` 为真
3. 设置 `nextStatus = appear`
4. `startStep()` 启动队列
5. 进入 `prepare`
6. 下一帧进入 `start`
7. 下一帧进入 `active`（`step === STEP_ACTIVE || step === STEP_ACTIVATED` 的 `className` 都是添加 `'active'` 后缀）
8. 绑定 `transitionend / animationend` 事件 / 启动 `deadline`
9. 收到 `transitionend / animationend` 事件后进入 `status = none`
10. 触发 `onVisibleChanged(true)`



## 组件已挂载，`visible: false -> true`

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



## 组件已挂载，`visible: true -> false`

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



## 不支持 motion，但有 prepare

流程：

1. 进入目标状态，比如 enter
2. `useStepQueue` 走简化队列：`prepare -> prepared`
3. `prepare` 依然执行
4. 到 `prepared` 时直接 `updateMotionEndStatus()`
5. 不会进入真实的 `start/active`

这说明 prepare 的语义不是“动画的一部分”，而更像“动画前的准备工作”。

