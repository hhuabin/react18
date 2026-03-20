rc-motion 本质是一个状态机，根据组件生命周期（appear / enter / leave），在不同阶段给 DOM 添加不同的 CSS class，通过 CSS transition/animation 触发动画，并监听 transitionend/animationend 事件判断动画结束



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

