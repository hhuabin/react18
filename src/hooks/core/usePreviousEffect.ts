/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:51:13
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
import { useEffect, useRef } from 'react'

/**
 * @description 自定义 useEffect Hook
 * 功能：在依赖项发生变化时，不仅执行回调，还会把“上一次的依赖数组”传给回调
 * @param callback useEffect 回调函数，函数参数携带上一次的依赖数组
 * @param { React.DependencyList } deps useEffect 依赖数组
 * @example usePreviousEffect((prevDeps) => {
 *      console.log(prevDeps)
 * }, [])
 */
export default function usePreviousEffect(
    // callback 不可返回函数用作 cleanup，返回则忽略。React 只会处理 useEffect 的 返回函数
    callback: (prevDeps: React.DependencyList) => void,
    deps: React.DependencyList,
) {
    const prevRef = useRef(deps)
    useEffect(() => {
        if (
            deps.length !== prevRef.current.length ||
            deps.some((dep, index) => dep !== prevRef.current[index])
        ) {
            callback(prevRef.current)
        }
        prevRef.current = deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
