/**
 * @Author: bin
 * @Date: 2025-06-04 11:01:56
 * @LastEditors: bin
 * @LastEditTime: 2025-11-14 10:52:54
 */
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

        const body = data ? JSON.stringify({
            ...data,
        }) : undefined

        if (!url.startsWith('http')) {
            url = this.baseURL + url
        }

        return fetch(url, {
            signal: this.controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
            body,
        })
        .then((response: Response) => {
            if (!response.ok) return Promise.reject(response)
            return response.json()
        })
        .then(data => {
            if (data.code === 0) {
                return data
            }
            return Promise.reject(data)
        })
        .catch(error => {
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
