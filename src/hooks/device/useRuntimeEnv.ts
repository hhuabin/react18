/**
 * @Author: bin
 * @Date: 2026-04-20 11:44:03
 * @LastEditors: bin
 * @LastEditTime: 2026-08-11 10:32:21
 */
import { useMemo } from 'react'

export type AppRuntime = {
    type: 'app'
    platform: 'ios' | 'android'
    version?: string
}

export type RuntimeEnv =
    | 'wechat-miniprogram'
    | 'alipay-miniprogram'
    | 'ios-app'
    | 'android-app'
    | 'browser'

const isWechatMiniProgram = (): boolean => {
    if (typeof window === 'undefined') return false

    // 微信官方注入变量
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__wxjs_environment === 'miniprogram'
}

const isAlipayMiniProgram = (): boolean => {
    if (typeof window === 'undefined') return false

    // 支付宝 web-view 会注入 my
    // 但普通 H5 可能也会有 polyfill，需要进一步判断
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasMy = typeof (window as any).my !== 'undefined'

    // 更严格判断 userAgent
    const ua = navigator.userAgent.toLowerCase()
    const isAlipay = ua.includes('alipayclient')

    return hasMy && isAlipay
}

/* window.__APP_RUNTIME__ = {
    type: 'app',
    platform: 'ios',
    version: '1.0.0'
} */
/**
 * @description 获取 App 的平台类型
 * Android：通过 WebView.addJavascriptInterface() 向 WebView 的 JavaScript 环境注入 __APP_RUNTIME__ 对象
 * iOS：通过 WKUserContentController 配合 WKUserScript 向 WebView 的 JavaScript 环境注入 __APP_RUNTIME__ 对象
 * H5 可通过 window.__APP_RUNTIME__ 判断当前是否运行在 App WebView 中，以及获取 App 平台信息
 * 注意：App 一定要注入对象，不然 window.__APP_RUNTIME__ 将会是 undefined
 */
const getAppRuntime = (): AppRuntime | null => {
    if (typeof window === 'undefined') {
        return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtime = (window as any).__APP_RUNTIME__ as AppRuntime | undefined

    if (
        runtime &&
        runtime.type === 'app' &&
        (runtime.platform === 'ios' || runtime.platform === 'android')
    ) {
        return runtime
    }

    return null
}

export const getAppPlatform = (): 'ios' | 'android' | null => {
    return getAppRuntime()?.platform ?? null
}


/**
 * @description 获取运行环境，也仅仅负责判断运行环境，不负责提供方法
 *  方法可从 @/hooks/bridge 下获取
 * @returns 微信小程序 | 支付宝小程序 | 浏览器
 */
export default function useRuntimeEnv() {
    const env = useMemo<RuntimeEnv>(() => {
        if (isWechatMiniProgram()) {
            return 'wechat-miniprogram'
        }

        if (isAlipayMiniProgram()) {
            return 'alipay-miniprogram'
        }

        const platform = getAppPlatform()
        if (platform) {
            return platform === 'ios' ? 'ios-app' : 'android-app'
        }

        return 'browser'
    }, [])

    return {
        env,
        isWechatMiniProgram: env === 'wechat-miniprogram',
        isAlipayMiniProgram: env === 'alipay-miniprogram',
        isAppWebView: env === 'ios-app' || env === 'android-app',
        isBrowser: env === 'browser',
    }
}
