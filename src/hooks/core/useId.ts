/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:51:31
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
import * as React from 'react'

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

// React17 没有 useId hooks
const getUseId = () => {
    const fullClone = { ...React }
    return fullClone.useId
}

let uuid = 0

/** @private 仅开发调试时可重置 uuid，生产环境无效 */
export const resetUuid = () => {
    uuid = 0
}

const useOriginId = getUseId()

/**
 * @description 自定义 useId Hook
 * 功能：在不同 React 版本、不同环境下提供一个稳定且兼容的 id 生成方案，主要用于无障碍（accessibility）或组件 id 唯一标识
 * @example const id = useOriginId()
 */
export default useOriginId
    ? // Use React18+ 使用 useId
    function useId(id?: string) {
        const reactId = useOriginId()

        // 优先使用开发者传入的 id
        if (id) return id

        // 测试环境固定 id
        if (getEnv() === 'test') return 'test-id'

        return reactId
    }
    : // // React 17 使用兼容实现
    function useCompatId(id?: string) {
        const [innerId, setInnerId] = React.useState<string>('ssr-id')

        React.useEffect(() => {
            const nextId = uuid
            uuid += 1

            setInnerId(`rc_unique_${nextId}`)
        }, [])

        if (id) return id

        if (getEnv() === 'test') return 'test-id'

        return innerId
    }
