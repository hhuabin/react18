/**
 * @Author: bin
 * @Date: 2025-06-04 11:01:56
 * @LastEditors: bin
 * @LastEditTime: 2026-11-11 15:03:28
 */
import message from '@/components/Message'

import authStore from '@/store/slice/auth.store'
import HTTP_STATUS_CODES from './httpStatusCodes'

export interface HttpError {
    status: number;
    statusText: string;
    url: string;
    message: string;      // HTTP 错误码文字描述
    data?: unknown;       // 解析成功时的 JSON
    /** fetch 错误原始对象 */
    cause?: Response;     // 保留原始对象，方便调试
}

export default class MobileFetchRequest {

    private baseURL = import.meta.env.VITE_API_BASE_URL
    private controller: AbortController

    constructor() {
        this.controller = new AbortController()
    }

    private updateController = () => {
        this.controller = new AbortController()
    }

    // eslint-disable-next-line
    public sendRequest = <T = any>(url: string, data: any = {}, options?: RequestInit): Promise<T> => {
        const body = data ? JSON.stringify({
            ...data,
        }) : undefined

        if (!url.startsWith('http')) {
            url = this.baseURL + url
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }
        const { token } = authStore.getAuthState().userInfo
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        /**
         * 是否取消上次请求，适合用在请求数据接口，不适合在提交数据接口使用，以避免重复提交
         * 只有携带了 cancelLastRequest 参数的请求才允许被取消，避免取消必要的请求
         * attention：禁止多个并行请求（如Promise.all中）同时携带 cancelLastRequest 参数，会造成只有最后一个请求生效
         */
        if (data.cancelLastFetch) {
            delete data.cancelLastFetch
            this.cancelFetch(this.controller)
            this.updateController()
        }

        // 处理 loading 逻辑
        let closeLoadingMessage = () => {}
        let timerId: ReturnType<typeof setTimeout>
        if (data.showLoading) {
            delete data.showLoading
            timerId = setTimeout(() => {
                closeLoadingMessage = message.loading('loading...', 0)
            }, 1000)
        }

        return fetch(url, {
            signal: this.controller.signal,
            headers,
            ...options,
            body,
        })
        .then(async (response: Response) => {
            if (!response.ok) {
                const error: HttpError = {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    cause: response,
                    message: HTTP_STATUS_CODES[response.status] || '请求错误，请稍后再试',
                }

                try {
                    const text = await response.text()
                    const data = JSON.parse(text)
                    error.data = data
                } catch { /* 不是 JSON，保留原始 text 即可 */ }

                return Promise.reject(error)
            }

            // 状态码为 200～299
            return response.json()
        })
        .then(data => {
            if (data.code === 0) {
                clearTimeout(timerId)
                closeLoadingMessage()
                return data
            }
            return Promise.reject(data)
        })
        .catch(error => {
            clearTimeout(timerId)
            closeLoadingMessage()

            if (error.name === 'AbortError') {
                console.log('请求被取消')
                /**
                 * 在返回 pendding 状态的时候，要确保请求函数的.catch没有什么必须要处理的逻辑
                 * 比如清除组件的loading状态、以及函数防抖等
                 * 若有此类逻辑，该接口不能使用取消请求功能，或者此处返回一个失败状态的 Promise
                 */
                return new Promise(() => {})
            } else {
                return Promise.reject(error)
            }
        })
    }

    // 取消请求
    public cancelFetch = (controller: AbortController) => {
        controller.abort()
    }

    public getFetchInstance = () => {
        return this.sendRequest
    }
}
