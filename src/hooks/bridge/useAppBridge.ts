import { useCallback } from 'react'

import type {
    AppBridgeWindow,
    AppCallParams,
    PendingRequest,
    AppBridgeResponse,
} from './types/appBridge'

import { getAppPlatform } from '@/hooks/device/useRuntimeEnv'

// 挂载到 window 的方法名，定义静态的即可；window.__APP_BRIDGE_CALLBACK__ = handleAppBridgeResponse
const CALLBACK_NAME = '__APP_BRIDGE_CALLBACK__'

const pendingRequests = new Map<string, PendingRequest>()

let requestId = 0

// 创建 PromiseId
export const createPromiseId = () => {
    requestId += 1
    return `app_bridge_${Date.now()}_${requestId}`
}

/** Native 完成调用后，通过这个公共函数把结果传回 H5。 */
const handleAppBridgeResponse = (response: AppBridgeResponse) => {
    const request = pendingRequests.get(response?.promiseId)
    if (!request) return

    pendingRequests.delete(response.promiseId)

    if (response.success === false || response.error) {
        request.reject(new Error(response.error || 'AppBridge 调用失败'))
        return
    }

    request.resolve(response.data)
}

/**
 * @description iOS 和 Android 与 WebView 的通信方式不同，该 Hook 旨在提供统一调用 iOS 和 Android App WebView 的方法
 * Android：通过 WebView.addJavascriptInterface(new AppBridge(), "AppBridge") 向 WebView 的 JavaScript 环境注入 AppBridge 对象
 * H5 通过 window.AppBridge 调用 Native 方法
 * 返回值：Android 的方法直接挂在 window 上，所以可以同步获取其返回值
 *
 * iOS：通过 WKUserContentController 注册 AppBridge 消息处理器，
 * H5 通过 window.webkit.messageHandlers.AppBridge.postMessage(...)，向 Native 发送消息
 * 返回值：由于是通过 postMessage 方法单向发送消息，所以获取 ios 执行的返回值，需要让 ios 执行 H5 挂在 window 的方法，在 window 方法中获取 ios 返回值
 * @example
 * const result = await safeCallAppBridge({
 *     action: 'getToken',
 *     data: {},
 *     needResult: true,
 * })
 */
export default function useAppBridge(): {
isAppWebView: boolean;
appPlatform: 'ios' | 'android' | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
safeCallAppBridge: (params: AppCallParams) => Promise<any>;
} {
    const appPlatform = getAppPlatform()

    const safeCallAppBridge = useCallback((params: AppCallParams) => {
        if (typeof window === 'undefined' || !appPlatform) {
            return Promise.reject(new Error('[AppBridge]  当前不是 App WebView 环境'))
        }

        return new Promise((resolve, reject) => {
            const {
                action,
                data,
                needResult = false,
            } = params

            try {
                if (appPlatform === 'android') {
                    // 获取 Android 注入 window 的 AppBridge 对象，该对象中一般含有 App 提供给 Webview 的方法
                    const appBridge = (window as AppBridgeWindow).AppBridge

                    if (!appBridge) {
                        throw new Error('[AppBridge] Android AppBridge 不存在')
                    } else if (typeof appBridge[action] !== 'function') {
                        throw new Error(`[AppBridge] Android 不存在方法：${action}`)
                    }

                    // 不需要结果时忽略 Native 返回值，只表示本次调用成功
                    const result = data === undefined
                        ? appBridge[action]()
                        : appBridge[action](JSON.stringify(data))

                    resolve(needResult ? result : undefined)
                } else if (appPlatform === 'ios') {
                    // 获取 iOS 注册的 AppBridge 消息处理器
                    const appBridge = (window as AppBridgeWindow).webkit?.messageHandlers?.AppBridge

                    if (!appBridge) {
                        throw new Error('[AppBridge] iOS AppBridge 不存在')
                    } else if (typeof appBridge['postMessage'] !== 'function') {
                        throw new Error('[AppBridge] iOS 不存在 postMessage 方法')
                    }

                    // 单向调用发送成功后直接结束，不等待 Native 回调
                    if (!needResult) {
                        appBridge.postMessage({ action, data })
                        resolve(undefined)
                        return
                    }

                    // ios 需要通过 window 的方法获取返回值
                    const promiseId = createPromiseId()
                    // 把 handleAppBridgeResponse 方法挂在 window 上
                    ;(window as AppBridgeWindow)[CALLBACK_NAME] = handleAppBridgeResponse

                    // 把 resolve/reject 放在 pendingRequests 中，用完就删
                    pendingRequests.set(promiseId, { resolve, reject })

                    try {
                        appBridge.postMessage({
                            action,
                            data,
                            promiseId,
                            // 定义了 callbackName，需要和 App 的开发者同步，ios 是需要调用 window[callbackName] 方法的
                            callbackName: CALLBACK_NAME,
                        })
                    } catch (error) {
                        pendingRequests.delete(promiseId)
                        throw error
                    }
                } else {
                    throw new Error('[AppBridge] 未知系统')
                }
            } catch (error) {
                reject(error)
            }
        })
    }, [appPlatform])

    return {
        isAppWebView: !!appPlatform,          // 判断当前是不是 App Webview 环境
        appPlatform,                          // 具体的 App
        safeCallAppBridge,                    // 安全调用 App 的方法
    }
}
