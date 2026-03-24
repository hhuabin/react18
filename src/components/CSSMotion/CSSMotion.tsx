/**
 * @Author: bin
 * @Date: 2026-02-28 09:33:53
 * @LastEditors: bin
 * @LastEditTime: 2026-03-24 15:46:51
 */
// https://github.com/react-component/motion.git
import {
    useRef, useMemo,
    forwardRef, useImperativeHandle, type ForwardedRef,
    isValidElement, cloneElement,
} from 'react'

import useStatus from './hooks/useStatus'
import { isActive } from './hooks/useStepQueue'

import { STATUS_NONE, STEP_PREPARE, STEP_START, type CSSMotionProps } from './interface'
import { getTransitionName, supportTransition } from './util/motion'
import { clsx } from './util/clsx'
import { getDOM } from './util/findDOMNode'
import { supportRef, getNodeRef } from './util/ref'

export interface CSSMotionRef {
    nativeElement: HTMLElement;
    inMotion: () => boolean;          // 当前是否处于动画阶段
    enableMotion: () => boolean;      // 当前是否允许动画
}

// 检测是否支持 transition
const isSupportTransition = (props: CSSMotionProps) => (!!props.motionName && supportTransition)

// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function CSSMotion(props: CSSMotionProps, ref: ForwardedRef<CSSMotionRef>) {
    const {
        motionName,
        visible = true,
        removeOnLeave = true,

        forceRender,           // 强制渲染
        children,              // CSSMotion 的子元素
        leavedClassName,       // 离开时添加的 className
        eventProps,            // 透传给子元素的 props 对象
    } = props

    const supportMotion = isSupportTransition(props)

    // 挂载到子元素身上获取真实 DOM
    const nodeRef = useRef<HTMLDivElement | null>(null)

    const getDomElement = () => getDOM(nodeRef.current) as HTMLElement

    // visible 将会合并到 mergedVisible 中，是否显示由动画决定
    const [getStatus, statusStep, statusStyle, mergedVisible, styleReady] =
        useStatus(supportMotion, visible, getDomElement, props)
    const status = getStatus()

    // 记录内容是否 曾经 被真正渲染过
    // 即使设置了 `removeOnLeave={false}`，对于未渲染的内容，此函数也会返回 null
    const renderedRef = useRef(mergedVisible)
    if (mergedVisible) {
        renderedRef.current = true
    }

    // 解决闭包问题；保证获取最新值
    useImperativeHandle(ref, () => ({
        get nativeElement() {
            return getDomElement()
        },
        inMotion: () => getStatus() !== STATUS_NONE,
        enableMotion: () => supportMotion,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [supportMotion])

    /**
     * @description `styleReady` + `idRef` + `useMemo`：这是渲染稳定性的关键设计
     * 1. styleReady：判定 useStatus 的 style 和 step 同步
     * 2. idRef：`styleReady === false` 时，不递增 `idRef` 避免闪烁、错帧
     * 3. useMemo：idRef 变化时，重新渲染
     */
    const idRef = useRef(0)
    if (styleReady) {
        idRef.current += 1
    }

    return useMemo(() => {
        if (styleReady === 'NONE') return null

        let motionChildren: React.ReactNode

        // 传给 children 的 `visible` 是原始 `visible`，不是 `mergedVisible`
        // `mergedVisible` 表示“当前渲染层是否还要把节点留着”
        const mergedProps = { ...eventProps, visible }

        if (!children) {
            // CSSMotion 没有传入子元素
            motionChildren = null
        } else if (status === STATUS_NONE) {
            // 不在动画时，移除节点 或者 添加 `leavedClassName` 或者 强制渲染
            /**
             * @description 不在动画时，渲染子元素
             * 可见时，直接显示子元素
             * 不可见时，根据 `removeOnLeave` 和 `leavedClassName` 来决定如何渲染子元素
             */
            if (mergedVisible) {
                // 1. 可见时，直接显示子元素；不会额外加 motion class，也不会加 motion style
                // nodeRef 需要被 CSSMotion 拿到用于绑定 transitionend / animationend 事件等
                motionChildren = children({ ...mergedProps }, nodeRef)
            } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
                // 2. 不移除节点，且有 `leavedClassName`
                motionChildren = children(
                    { ...mergedProps, className: leavedClassName },
                    nodeRef,
                )
            } else if (forceRender || (!removeOnLeave && !leavedClassName)) {
                // 3. 强制渲染 或 不移除节点，但没有 `leavedClassName` 的状态，直接设置 display: 'none' 保留元素但不显示
                motionChildren = children(
                    { ...mergedProps, style: { display: 'none' } },
                    nodeRef,
                )
            } else {
                // 4. 移除节点
                motionChildren = null
            }
        } else {
            // 处于动画时 status !== none，拼接 className 和 style
            let statusSuffix: string = ''
            if (statusStep === STEP_PREPARE) {
                statusSuffix = 'prepare'
            } else if (statusStep === STEP_START) {
                statusSuffix = 'start'
            } else if (isActive(statusStep)) {
                // step === STEP_ACTIVE || step === STEP_ACTIVATED 都是添加 active 后缀
                statusSuffix = 'active'
            }
            // fade-enter-active
            const motionCls = getTransitionName(motionName, `${status}-${statusSuffix}`)

            motionChildren = children(
                {
                    ...mergedProps,
                    // fade-enter fade-enter-active fade
                    className: clsx(
                        getTransitionName(motionName, status),                         // fade-enter
                        {
                            [motionCls as string]: motionCls && statusSuffix,          // fade-enter-active
                            [motionName as string]: typeof motionName === 'string',    // fade
                        },
                    ),
                    style: statusStyle || undefined,     // onAppearActive / onEnterActive / onLeaveActive 等方法返回的样式
                },
                nodeRef,
            )
        }

        /**
         * @description 作用：给 motionChildren 挂上 ref 在 CSSMotion/动画组件，让动画逻辑能直接操作真实 DOM
         * ** 这里很重要，无论什么情况，CSSMotion 都必须拿到子元素的真实 DOM 节点，才能驱动动画 **；对于拿不到真实 DOM 的，CSSMotion 将会卡在 active 状态
         * 是 React 元素 并且 支持 ref 进入该条件
         * 只有 DOM 元素、class 组件、forwardRef 才支持 ref
         * 如 <div /> 可以进入该 if，但是 memo 组件（不能挂 ref）不可以进入，memo 组件可以搭配 forwardRef 进入该 if
         */
        if (isValidElement(motionChildren) && supportRef(motionChildren)) {
            // 获取子元素 ref，若有，则该 ref 须是 nodeRef；若没有则给子元素就加上 nodeRef
            const originNodeRef = getNodeRef(motionChildren)

            if (!originNodeRef) {
                // cloneElement 本身只是把 ref “传给组件”，组件内部不挂，ref 无法落地
                motionChildren = cloneElement(
                    motionChildren as React.ReactElement,
                    { ref: nodeRef },
                )
            }
        }

        return motionChildren
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idRef.current])
})
