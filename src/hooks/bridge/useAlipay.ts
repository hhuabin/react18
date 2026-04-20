/**
 * @Author: bin
 * @Date: 2026-04-17 11:22:55
 * @LastEditors: bin
 * @LastEditTime: 2026-04-20 14:35:00
 */
import { useState, useEffect } from 'react'

import type { MyApi, AlipayWindow } from './types/alimy'

const AlI_SCRIPT_SRC = 'https://appx/web-view.min.js'

let scriptLoading: Promise<void> | null = null

const loadScript = (src: string): Promise<void> => {
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

export default function useAlipayJSAPI() {
    const [my, setMy] = useState<MyApi | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [isAlipayMiniProgram, setIsAlipayMiniProgram] = useState(false)

    useEffect(() => {
        let mounted = true

        loadScript(AlI_SCRIPT_SRC)
        .then(() => {
            // 组件被卸载，不用继续执行逻辑
            if (!mounted) return

            const { my } = window as AlipayWindow
            if (!my) return

            setMy(my)
            my.getEnv(({ miniprogram }) => {
                if (!mounted) return

                setIsAlipayMiniProgram(miniprogram)
                setIsReady(true)
            })
        })
        .catch((error) => {
            if (!mounted) return
            setIsReady(false)
            console.error('Alipay Js load error:', error)
        })

        // 组件卸载
        return () => {
            mounted = false
        }
    }, [])

    return {
        my,
        isReady,
        isAlipayMiniProgram,
    }
}
