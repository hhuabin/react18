/**
 * @Author: bin
 * @Date: 2025-08-22 15:46:26
 * @LastEditors: bin
 * @LastEditTime: 2025-11-12 19:53:15
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react'

/**
 * @description 自定义 useCallback Hook 记忆函数
 * 功能：使用与 useCallback 一样，但解决 useCallback 的闭包问题，保持 useCallback 的函数内部逻辑总是使用最新的 state/props
 * 个人觉得该 hook 不应该叫 useEvent（React 官方 RFC 提出的一个想法）
 * 因为它的功能是：稳定引用 + 最新闭包；叫 useStableCallback 可能会更好
 * @param { Function } callback 回调函数
 * @param { React.DependencyList } deps 依赖数组，默认是[]。是否启用依赖数据，取决于 useCallback 的返回值是否需要发生变化
 * 比如当 useEvent() 返回值传递给子组件当参数时，启用 deps 可以让子组件更新
 * @returns { (...args: Parameters<T>) => any } 返回 useCallback 的返回值（即一个新函数（地址））
 * @example const memoFn = useEvent(() => {}, [])
 */
// eslint-disable-next-line space-before-function-paren
export default function useEvent<T extends (...args: any[]) => any>(callback: T, deps?: React.DependencyList) {
    const fnRef = useRef<T>(callback)
    // 最新闭包：重点代码，每次渲染都会执行。重新定义 fnRef.current = callback，即可获取最新闭包值
    fnRef.current = callback

    /**
     * 稳定引用：创建一个 稳定引用 的函数 memoFn，依赖是空数组 []，所以这个 memoFn 在整个生命周期内一直是等于 fnRef.current
     * 问题1：callback 的原型等属性(callback.a???)将会用不了，此处返回的 memoFn 是一个函数 (...args: any) => void，无其他属性（useCallback会直接返回原函数）
     */
    const memoFn = useCallback(
        (...args: Parameters<T>) => fnRef.current?.(...args),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps ?? [],
    )

    return memoFn
}

/**
 * 问题2：memoFn内部的值是 a 的上一个旧值，因为 setState 是异步的
 *  setState(a)
 *  memoFn()
 */
