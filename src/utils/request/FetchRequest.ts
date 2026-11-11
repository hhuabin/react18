/**
 * @Author: bin
 * @Date: 2025-02-26 21:05:44
 * @LastEditors: bin
 * @LastEditTime: 2026-11-11 14:55:44
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
    cause?: Response;     // 保留原始对象，方便调试
}


export default class FetchRequest {

    private baseURL = import.meta.env.VITE_API_BASE_URL
    private controller: AbortController
    private loadingMessage = new Map<symbol, () => void>()

    constructor() {
        this.controller = new AbortController()
    }

    // 更新controller
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
        if (data.cancelLastRequest) {
            delete data.cancelLastRequest
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
                console.warn('请求被取消', error)
                return new Promise(() => { })
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
