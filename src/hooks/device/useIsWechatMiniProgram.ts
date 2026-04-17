/**
 * @Author: bin
 * @Date: 2025-12-30 11:48:23
 * @LastEditors: bin
 * @LastEditTime: 2026-01-08 16:56:53
 */
import { useMemo } from 'react'

/**
 * @description 判定网页是否在微信小程序内
 * @returns { boolean } 是否在微信小程序内
 */
export default function useIsWechatMiniProgram(): boolean {
    const isMiniProgram = useMemo(() => {
        return (
            typeof window !== 'undefined' &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__wxjs_environment === 'miniprogram'
        )
    }, [])

    return isMiniProgram
}
