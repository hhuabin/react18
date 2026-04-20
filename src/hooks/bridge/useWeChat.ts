/**
 * @Author: bin
 * @Date: 2026-04-17 15:20:02
 * @LastEditors: bin
 * @LastEditTime: 2026-04-20 14:35:21
 */
import { useState, useEffect } from 'react'

import type { WxError, WxConfigOptions, Wx, WxWindow } from './types/jweixin'

type UseWxChatOptions = {
    mode?: 'config' | 'miniProgram';
    debug: boolean;
    config?: WxConfigOptions;
    onReady?: (wx: Wx) => void;
    onError?: (error: WxError) => void;
}

const WX_SDK = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'

let scriptLoading: Promise<void> | null = null

const loadScript = (src: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('window is undefined'))

    if ((window as WxWindow).wx || (window as WxWindow).jWeixin) return Promise.resolve()

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
 * @description 微信公众号 SDK
 * 该 hooks 是异步加载，异步有异步的好处，可以捕捉加载错误
 * 而 vite alias + import 是同步加载，在组件执行前就已经准备好
 * @example
 *  const { wx, ready } = useWxChat()
 * @example
 *  const { wx, ready } = useWxChat({ mode: 'config', config })
    useEffect(() => {
        if (!ready) return
    }, [ready])
 */
export default function useWxChat(options?: UseWxChatOptions) {

    const {
        mode = 'miniProgram',
        debug,
        config,
        onReady,
        onError,
    } = options || {}

    const [wx, setWx] = useState<Wx | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let alive = true

        loadScript(WX_SDK)
        .then(() => {
            // 组件被卸载，不用继续执行逻辑
            if (!alive) return

            const wx = (window as WxWindow).wx || (window as WxWindow).jWeixin
            if (!wx) throw new Error('wx is undefined')

            setWx(wx)

            // 场景 1：只用 miniProgram（不需要 config）
            if (mode === 'miniProgram') {
                setReady(true)
                onReady?.(wx)
                return
            }

            // 场景 2：必须 config
            if (mode === 'config' && config) {
                // 👉 注册 error（必须有）
                wx.error((error) => {
                    if (!alive) return
                    console.error('wx.config error:', error?.errMsg)
                    onError?.(error)
                })
                // 👉 config（使用外部传入）
                wx.config({
                    debug: debug ?? false,
                    ...config,
                })
                wx.ready(() => {
                    if (!alive) return

                    setReady(true)
                    onReady?.(wx)
                })
            }
        })
        .catch((error) => {
            if (!alive) return
            console.error('wx sdk load error:', error)
            options?.onError?.(error)
        })

        return () => {
            alive = false
        }
    /**
     * 此处监听了 config 变化，是兼容了通过接口请求 config 的情况；请确保 config 的引用固定
     * onError、onReady 函数没有被监听，会有闭包问题，但是简单反而速度快呢，都监听的话，需要写很多 useCallBack，hooks复杂度较高
     * 有需要请自行添加 onReady 等为依赖，或者使用 useRef 等解决 onReady 函数里的闭包问题
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config])

    return {
        wx,
        ready,
    }
}
