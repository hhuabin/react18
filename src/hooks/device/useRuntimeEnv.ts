/**
 * @Author: bin
 * @Date: 2026-04-20 11:44:03
 * @LastEditors: bin
 * @LastEditTime: 2026-08-10 16:42:01
 */
import { useMemo } from 'react'

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

const getAppPlatform = (): 'ios' | 'android' | null => {
    if (typeof window === 'undefined') {
        return null
    }

    // 注意：这里需要 App 注入变量才可以，和 App 配合使用，不然是没用的！！！
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const platform = (window as any).__APP_WEBVIEW__

    if (platform === 'ios' || platform === 'android') {
        return platform
    }

    return null
}


/**
 * @description 获取运行环境
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
