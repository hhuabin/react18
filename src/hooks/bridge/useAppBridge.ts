/**
 * @Author: bin
 * @Date: 2026-08-10 17:03:08
 * @LastEditors: bin
 * @LastEditTime: 2026-08-11 10:43:59
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from 'react'

import { getAppPlatform } from '@/hooks/device/useRuntimeEnv'


type AppCallParams = {
    method: string;        // 调用 App 的方法名
    data?: any;            // 发送给方法的参数
}

/**
 * @description iOS 和 Android 与 WebView 的通信方式不同，该 Hook 旨在提供统一的 H5 与 App 通信方法
 * Android：通过 WebView.addJavascriptInterface(new AppBridge(), "AppBridge") 向 WebView 的 JavaScript 环境注入 AppBridge 对象
 * H5 通过 window.AppBridge 调用 Native 方法
 *
 * iOS：通过 WKUserContentController 注册 AppBridge 消息处理器，
 * H5 通过 window.webkit.messageHandlers.AppBridge.postMessage(...)，向 Native 发送消息。
 *
 * @example
 * const { isAppWebView, safeCallAppBridge } = useAppBridge()
 * safeCallAppBridge({ method: 'methodsName', data: { aaa: 111 } })
 */
export default function useAppBridge(): {
isAppWebView: boolean;
appPlatform: 'ios' | 'android' | null;
safeCallAppBridge: (params: AppCallParams) => void;
} {

    const appPlatform = getAppPlatform()

    const safeCallAppBridge = useCallback((params: AppCallParams) => {
        if (appPlatform === 'android') {
            const { method, data } = params
            // 获取 Android 注入 window 的 AppBridge 对象，该对象中一般含有 App 提供给 Webview 的方法
            const appBridge = (window as any).AppBridge

            if (!appBridge) {
                console.warn('[AppBridge] Android AppBridge 不存在')
                return
            } else if (typeof appBridge[method] !== 'function') {
                console.warn(`[AppBridge] Android 不存在方法：${method}`)
                return
            }

            // 调用方法
            appBridge[method](JSON.stringify(data))
        } else if (appPlatform === 'ios') {
            // 获取 iOS 注册的 AppBridge 消息处理器
            const appBridge = (window as any).webkit?.messageHandlers?.AppBridge

            if (!appBridge) {
                console.warn('[AppBridge] iOS AppBridge 不存在')
                return
            } else if (typeof appBridge['postMessage'] !== 'function') {
                console.warn(`[AppBridge] iOS 不存在方法：${'postMessage'}`)
                return
            }

            // 向 ios 发送消息，提供方法名和参数
            appBridge.postMessage(params)
        } else {
            console.warn('[AppBridge] 当前所处非 App WebView 环境')
        }
    }, [appPlatform])

    return {
        isAppWebView: !!appPlatform,          // 判断当前是不是 App Webview 环境
        appPlatform,                          // 具体的 App
        safeCallAppBridge,                    // 安全调用 App 的方法
    }
}
