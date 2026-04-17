/**
 * @Author: bin
 * @Date: 2025-11-12 19:20:27
 * @LastEditors: bin
 * @LastEditTime: 2025-11-13 10:04:42
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react'

/**
 * @description React Hooks 版安全防抖函数： 一个需要频繁触发的函数，在规定时间内触发，只让最后一次生效，前面的不生效
 * @param { Function } callback 需要防抖执行的函数
 * @param { number } delay 延迟时间（默认 500ms）
 * @param { boolean } immediate 立即执行
 * @returns 稳定引用的 [debounce, cancel]
 * @example const [debounce, cancel] = useDebounce(() => {})    use this, 跟随所有状态更新执行，避免闭包问题
 * @example const [debounce, cancel] = useDebounce(useCallback(() => {}, []), 1000)
 * @tips 组件有非常多频繁的状态更新（如定时状态更新），可以使用 useCallback 优化，依赖数组必须包含防抖函数中用到的
 * 优点：callback 里的 state 几乎没有闭包问题
 * 缺点：debounce 依赖数组只有 delay 和 immediate 只要这两个不更新，不管组件其他状态如何更新，返回的 debounce 永远都是稳定依赖
 */
export const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay = 500, immediate = false) => {

    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const callbackRef = useRef<T>(callback)

    useEffect(() => {
        // 避免闭包问题，始终引用最新 callback
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        return () => {
            if (timerIdRef) clearTimeout(timerIdRef.current!)
        }
    }, [])

    // 创建防抖函数
    const debounce = useCallback((...args: Parameters<T>) => {
        if (timerIdRef) clearTimeout(timerIdRef.current!)
        if (immediate) {
            const callNow = !timerIdRef
            if (callNow) callbackRef.current(...args)
            timerIdRef.current = setTimeout(() => {
                timerIdRef.current = null
            }, delay)
        } else {
            timerIdRef.current = setTimeout(() => {
                callbackRef.current(...args)
                // 在 React 函数组件中，this 通常没有明确的意义，此处省略处理 this 的逻辑
                // callbackRef.current.call(this, ...args)
                timerIdRef.current = null
            }, delay)
        }
    }, [delay, immediate])

    // 取消防抖执行
    const cancel = useCallback(() => {
        if (timerIdRef.current) {
            clearTimeout(timerIdRef.current)
            timerIdRef.current = null
        }
    }, [])

    return [debounce, cancel]
}

/**
 * @description React Hooks 版安全函数节流：一个函数执行完后只有大于设定时间才会再次执行第二次  (节约浏览器资源)
 * @param { Function } callback 需要节流的函数
 * @param { number } delay 间隔时间（默认 500ms）
 * @returns { Function } throttle节流函数
 * @example const throttle = useThrottle(() => {}, 1000)    use this, 跟随所有状态更新执行，避免闭包问题
 * @example const throttle = useThrottle(useCallback(() => {}, []), 1000)
 * @tips 组件有非常多频繁的状态更新（如定时状态更新），可以使用 useCallback 优化，依赖数组必须包含防抖函数中用到的
 * 优点：callback 里的 state 几乎没有闭包问题
 * 缺点：throttle 依赖数组只有 delay ，只要 delay 不更新，不管组件其他状态如何更新，返回的 throttle 永远都是稳定依赖
 */
export const useThrottle = <T extends (...args: any[]) => void>(callback: T, delay = 200) => {
    const lastExecRef = useRef(0)
    const callbackRef = useRef(callback)

    useEffect(() => {
        // 避免闭包问题，始终引用最新 callback
        callbackRef.current = callback
    }, [callback])

    // 创建节流函数
    const throttle = useCallback((...args: Parameters<T>) => {
        const now = Date.now()
        if (now - lastExecRef.current >= delay) {
            lastExecRef.current = now
            callbackRef.current(...args)
        }
    }, [delay])

    return throttle
}
