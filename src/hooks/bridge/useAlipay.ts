/**
 * @Author: bin
 * @Date: 2026-04-17 11:22:55
 * @LastEditors: bin
 * @LastEditTime: 2026-04-21 11:07:12
 */
import { useState, useEffect } from 'react'

import { useSyncState } from '@/hooks/core'
import { getEnv } from '@/hooks/core/useLayoutUpdateEffect'
import type { MyApi, AlipayWindow } from './types/alimy'

// 该链接只有在支付宝小程序中才能加载成功；在收集全局资源加载错误时，需要注意该资源错误的报告
const AlI_SCRIPT_SRC = 'https://appx/web-view.min.js'

let scriptLoading: Promise<void> | null = null

export const loadScript = (src = AlI_SCRIPT_SRC): Promise<void> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('window is undefined'))

    if ((window as AlipayWindow).my) return Promise.resolve()

    // 已在加载 / 正在加载中，直接返回
    if (scriptLoading) return scriptLoading

    scriptLoading = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true

        script.onload = () => resolve()
        script.onerror = () => {
            reject(new Error(`Failed to load ${src}`))
        }

        document.head.appendChild(script)
    })

    return scriptLoading
}

/**
 * @description 异步加载支付宝小程序的API
 */
export default function useAlipayJSAPI(): {
my: MyApi | null;
ready: boolean;
isAlipayMiniProgram: boolean;
safeCallMy: (callback: (my: MyApi) => void) => void;
} {
    const [my, setMy] = useSyncState<MyApi | null>(null)
    const [ready, setReady] = useSyncState(false)
    const [isAlipayMiniProgram, setIsAlipayMiniProgram] = useState(false)

    useEffect(() => {
        let alive = true

        loadScript(AlI_SCRIPT_SRC)
        .then(() => {
            // 组件被卸载，不用继续执行逻辑
            if (!alive) return

            const { my } = window as AlipayWindow
            if (!my) return

            setMy(my)
            my.getEnv(({ miniprogram }) => {
                if (!alive) return

                setIsAlipayMiniProgram(miniprogram)
                setReady(true)
            })
        })
        .catch((error) => {
            // 此处为 loadScript 失败，会被全局错误捕获到 资源加载错误
            if (!alive) return
            setReady(false)
            console.error('Alipay Js load error:', error)
        })

        // 组件卸载
        return () => {
            alive = false
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const safeCallMy = (callback: (my: MyApi) => void) => {
        const syncMy = my()
        const syncReady = ready()

        if (!syncReady || !syncMy) {
            if (getEnv() === 'development') {
                console.warn('[AlipaySDK] wx not ready')
            }

            return
        }

        callback(syncMy)
    }

    return {
        my: my(),
        ready: ready(),
        isAlipayMiniProgram,
        safeCallMy,
    }
}
