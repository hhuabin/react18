/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2026-01-07 09:11:06
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
import { useReducer, useRef } from 'react'
import useEvent from './useEvent'

type StateAction<T> = T | ((prevState: T) => T);

export type SetStateAction<T> = (stateAction: StateAction<T>) => void

/**
 * @description 自定义 Hook，与 useState 相似
 * 功能：通过 get() 可以随时读取最新状态，不会被闭包影响
 * 适合在事件回调中使用，例如 onTransitionEnd、setTimeout、requestAnimationFrame 等
 * 与 React 内置 useState 的区别:
 * 1. useState 在事件回调中可能获取到旧状态，尤其是 React 批量更新（batching）时
 * 2. useSyncState 通过 useRef + forceUpdate 避免了这个问题
 * @param initialValue 默认值
 * @returns [a, setA]
 * @example const [a, setA] = useSyncState(0)
 * @example a()、setA(a() + 1)
 * 问题1：返回的 getValue 是一个稳定依赖函数，不可以作为依赖项被写入依赖数组
 * - const [imageState, setImageState] = useSyncState({})
 * - useEffect(() => {}, [imageState])      检测不到 imageState 状态更新
 */
function useSyncState<T>(initialValue: T): [() => T, SetStateAction<T>]
function useSyncState<T>(): [() => T | undefined, SetStateAction<T | undefined>]
// eslint-disable-next-line func-style
function useSyncState<T>(initialValue?: T) {
    // 使用 useReducer 来强制组件重新渲染。这里不关心 reducer 的值本身，只是用 forceUpdate() 来触发渲染
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    // 内部状态管理
    const currentValueRef = useRef(initialValue)

    // 获取最新状态
    const getValue = useEvent(() => {
        return currentValueRef.current
    })

    // 更新状态
    const setValue = useEvent((stateAction: StateAction<T>) => {
        currentValueRef.current =
            typeof stateAction === 'function'
                ? (stateAction as (prevState: T | undefined) => T)(currentValueRef.current)
                : stateAction

        forceUpdate()
    })

    return [getValue, setValue]
}

export default useSyncState
