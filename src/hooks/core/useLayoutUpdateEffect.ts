/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:51:29
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
import { useEffect, useLayoutEffect, useRef } from 'react'

const canUseDom = () => !!(
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.document &&
    window.document.createElement
)

// 统一环境变量获取
const getEnv = () => {
    // Vite 环境
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.MODE
    }
    // Webpack/Node 环境
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
        return process.env.NODE_ENV
    }
    return 'development'
}

/**
 * @description 避免警告：在测试环境中（如 Jest）使用 useEffect 代替 useLayoutEffect
 * React 在测试环境中使用 useLayoutEffect 会发出警告，因为 jsdom 没有布局（layout）能力
 * 在日常开发中，特别是 SSR 应用 / 组件库开发中，应该使用 useInternalLayoutEffect 替换 useLayoutEffect
 */
export const useInternalLayoutEffect = (canUseDom() && getEnv() !== 'test') ? useLayoutEffect : useEffect

/**
 * @description 允许 callback 知道是否是首次挂载
 * @param callback 挂载时和卸载时执行的回调
 * @param deps 监听的依赖项
 */
export const useIsMountedLayoutEffect = (
    callback: (mount: boolean) => void | VoidFunction,
    deps?: React.DependencyList,
) => {
    // 记录是否首次挂载
    const firstMountRef = useRef(true)

    useInternalLayoutEffect(() => {
        return callback(firstMountRef.current)
    }, deps)

    useInternalLayoutEffect(() => {
        // 挂载完成改成 false，后续一直都会是 false
        firstMountRef.current = false
        return () => {
            firstMountRef.current = true
        }
    }, [])
}

/**
 * @description 自定义 useEffect Hook
 * 只在 组件更新 时执行 callback，首次挂载不执行
 * @param { React.EffectCallback } callback 挂载时和卸载时执行的回调
 * @param { React.DependencyList | undefined } deps useEffect 依赖数组
 */
export const useLayoutUpdateEffect: typeof useEffect = (
    callback,
    deps,
) => {
    useIsMountedLayoutEffect(firstMount => {
        if (!firstMount) {
            return callback()
        }
    }, deps)
}

export default useLayoutUpdateEffect
