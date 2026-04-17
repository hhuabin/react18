/**
 * @Author: bin
 * @Date: 2025-09-22 09:14:25
 * @LastEditors: bin
 * @LastEditTime: 2025-11-13 11:17:07
 */
import { useState, useRef, useEffect, useCallback } from 'react'

type StateAction<T> = T | ((prevState: T) => T);

export type SetStateAction<T> = (
    stateAction: StateAction<T>,
    callback?: (val: T) => void,
) => void;

/**
 * @description 自定义 useState Hook
 * 功能：带回调的 setState。与类组件的 this.setState 使用方法相近，setState接收第一个参数
 * 增加第二个参数，第二个参数为回调函数，会在 setState 之后执行
 * @param initialValue 初始值
 * @example const [a, setA] = useCallbackState(0); setA(1, (val) => console.log(val));
 */
function useCallbackState<T>(initialValue: T | (() => T)): [T, SetStateAction<T>]
function useCallbackState<T>(): [T | undefined, SetStateAction<T | undefined>]
// eslint-disable-next-line func-style
function useCallbackState<T>(
    initialValue?: T | (() => T),
): [T, SetStateAction<T>] {
    const [state, setState] = useState(initialValue)
    const callbackQueue = useRef<((val: T) => void)[]>([])

    const setCallbackState = useCallback((stateAction: StateAction<T>, callback?: (val: T) => void) => {
        if (callback) {
            callbackQueue.current.push(callback)
        }
        setState(stateAction as StateAction<T | undefined>)
    }, [])

    useEffect(() => {
        if (callbackQueue.current.length > 0) {
            callbackQueue.current.forEach(callback => callback(state as T))
            callbackQueue.current = []
        }
    }, [state])

    return [state as T, setCallbackState]
}

export default useCallbackState
