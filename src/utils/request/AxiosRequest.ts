/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @Author: bin
 * @Date: 2025-02-26 21:05:44
 * @LastEditors: bin
 * @LastEditTime: 2026-01-23 10:25:13
 */
import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
} from 'axios'
import message from '@/components/Message'

import { version as packageVersion } from '@/../package.json'

// import { navigate } from '@/hooks/useRouter'
import authStore from '@/store/slice/auth.store'
import { getDateStrByTimeAndCurrentOffset } from '@/utils/stringUtils/dateUtils'
import HTTP_STATUS_CODES from './httpStatusCodes'

/**
 * @description AxiosRequest
 * 1. cancelLastRequest：取消上一个携带 cancelLastRequest 的请求，适合用在请求数据接口，不适合在提交数据接口使用，以避免重复提交
 * 2. showLoading：可使用showLoading开启请求loading
 * 3. refreshToken：配置 token 过期的 result_code，配置新 token 请求的 url
 * 4. requestRetry 存在第一次请求结束便会清除 loading 的问题。（该问题已在 requestRetry 中解决）
 * 5. 一个请求对应一个 loading ，两个请求就有两个 loading，若不需要，不设置 showLoading 参数即可
 */

type PublicParams = {
    version: string;
    charset: string;
    req_source: string;
    system: string;
    requestSerial?: string;
    timestamp: string | Date | number;
    token?: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    loadingSymbol?: symbol;                    // loading 的取消函数标识
    timerId?: ReturnType<typeof setTimeout>;   // loading 的定时器Id
    maxRequestRetryNumber?: number;            // 最大请求失败重试次数
    requestRetryNumber?: number;               // 请求失败重试次数
}

export default class AxiosRequest {
    private instance: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 60000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <token>',
        },
    })

    private controller: AbortController | null = null              // 存储一个取消请求的 controller
    private loadingMessage = new Map<symbol, () => void>()         // 使用 Map 存储多个关闭消息函数 message.destroy(id)
    private refreshTokenPromise: Promise<void> | null = null       // 存储刷新 token 的 promise 对象，防止刷新 token 接口重复请求

    private publicParams: PublicParams = {
        version: packageVersion,
        charset: 'UTF-8',
        req_source: 'PROJECT',
        system: 'H5',
        timestamp: '',
    }

    constructor() {
        this.init()
    }

    private init = () => {
        this.instance.interceptors.request.use((config: CustomAxiosRequestConfig) => {
            const { data = {} } = config

            /**
             * 是否取消上一个携带 cancelLastRequest 的请求，适合用在请求数据接口，不适合在提交数据接口使用，以避免重复提交
             * 只有携带了 cancelLastRequest 参数的请求才允许被取消，避免取消必要的请求
             * attention：禁止多个并行请求（如Promise.all中）同时携带 cancelLastRequest 参数，会造成只有最后一个请求生效
             */
            if (data.cancelLastRequest) {
                delete data.cancelLastRequest
                this.cancelRequest(this.controller)
                this.updateController()
                config.signal ??= (this.controller as AbortController).signal
            }

            // 默认 loading
            if (data.showLoading) {
                delete data.showLoading
                const loadingSymbol = Symbol('loading')
                let loadingHandler: () => void
                const timerId = setTimeout(() => {
                    loadingHandler = message.loading('loading...', 0)
                    this.loadingMessage.set(loadingSymbol, loadingHandler)
                }, 1000)
                // 存储至请求中，用于取消 loading
                config.loadingSymbol = loadingSymbol
                config.timerId = timerId
            }

            // 记录请求重试次数，当请求失败才会发起 请求重试
            if (data.maxRequestRetryNumber) {
                config.maxRequestRetryNumber = data.maxRequestRetryNumber
                delete data.maxRequestRetryNumber
            }

            // 深拷贝数据，令对象不被改变
            const publicParams = { ...this.publicParams }
            // requestSerial 请求序列号
            let requestSerial: string = new Date().getTime().toString()
            for (let i = 0; i < 6; i++) {
                requestSerial += Math.floor(Math.random() * 10)
            }
            publicParams.requestSerial = requestSerial
            // timestamp 请求时间
            const timestamp: string = getDateStrByTimeAndCurrentOffset()
            publicParams.timestamp = timestamp

            publicParams.token = authStore.getAuthState().userInfo.token
            config.data = { ...publicParams, ...data }
            // 默认使用POST方法
            config.method = config.method || 'POST'
            return config
        }, this.handleRequestError)

        this.instance.interceptors.response.use(async (response: AxiosResponse) => {
            const config: CustomAxiosRequestConfig = response.config
            const maxRequestRetryNumber = Number(config.maxRequestRetryNumber) || 0

            // response.status === 200
            if (response.data.result_code === '0') {
                // 成功返回，清除定时器并且关闭 loading（有返回就关闭请求 loading，没有返回可以一直沿用本 loading）
                this.clearTimeoutTimer(config)
                return response
            } else if (response.data.result_code === '-1' && response.config.url !== '/user/refreshtoken') {
                // 无感刷新 token ，进入此逻辑的请求链接不能是无感刷新的 url ，避免逻辑死循环
                console.error(response)
                try {
                    await this.refreshToken() // 刷新 token，继续使用 config 的 loading
                    // 重新发送原来的请求，如果此时接口还是报token过期，则会继续请求
                    return this.requestRetry(
                        config,
                        { token: authStore.getAuthState().userInfo.token },
                        response,
                    )
                } catch (error) {
                    this.clearTimeoutTimer(config)       // 失败返回，清除定时器并且关闭 loading
                    // 刷新 token 接口失败
                    console.error('refresh-token-error', error)
                    // 需返回原来接口的报错
                    return Promise.reject(response)
                }
            } else if (maxRequestRetryNumber) {
                // 进入请求重试，可以不关闭原来的 loading，继续使用，只有给接口返回值才需要清除 loading
                return this.requestRetry(
                    config,
                    {},
                    response,
                    maxRequestRetryNumber,
                )
            } else {
                console.error(response)
                this.clearTimeoutTimer(config)       // 失败返回，清除定时器并且关闭 loading
                return Promise.reject(response)
            }
            // 诸如没网络，500等报错，应该不用进行请求重试，有时候网络超时可能也需要重试，参考上面的做法也可以实现
        }, this.handleRequestError)
    }

    // 更新controller
    private updateController = () => {
        this.controller = new AbortController()
    }

    /**
     * 清除 loading 定时器
     */
    private clearTimeoutTimer = (config: CustomAxiosRequestConfig) => {
        clearTimeout(config.timerId)
        if (config.loadingSymbol) {
            const loadingHandler = this.loadingMessage.get(config.loadingSymbol)
            loadingHandler && loadingHandler()
            this.loadingMessage.delete(config.loadingSymbol)
        }
    }

    /**
     * 取消请求
     * @param controller AbortController
     * @returns void
     */
    private cancelRequest = (controller: AbortController | null) => {
        if (!controller) {
            console.warn('controller is null')
            return
        }
        /**
         * 取消请求是异步的，比较慢，会造成一些问题
         * 比如新的 request 中的 timerId 会被 handleRequestError() 清除掉，造成没有loading
         */
        controller.abort()
    }

    /**
     * 请求重发
     * 基于 response.cnofig === request 的 config
     * @param { CustomAxiosRequestConfig } config InternalAxiosRequestConfig 无需解压 config.data，可以从 response 直接解构
     * @param { Record<any, any> } mergeData 需要增加到 config.data 的新参数
     * @param { AxiosResponse } response AxiosResponse 错误响应
     * @param { number } maxRetries 最大重试次数， 默认值为 3
     * @param { number } retryDelay  重试延迟时间， 默认值为 0
     * @returns Promise<AxiosResponse<any, any>>
     */
    private requestRetry = (
        config: CustomAxiosRequestConfig,
        mergeData: Record<any, any>,
        response: AxiosResponse,
        maxRetries = 3,
        retryDelay = 0,
    ): Promise<AxiosResponse<unknown>> => {
        return new Promise((resolve, reject) => {
            // 确保最大重试次数在 0 到 10 之间，避免傻逼开发者赋值到 10000 甚至更多
            maxRetries = Math.min(Math.max(maxRetries, 0), 10)
            const requestRetryNumber = (config.requestRetryNumber || 0)
            if (+requestRetryNumber >= maxRetries) {
                // 请求重发次数达到限制次数，返回失败结果，删除 loading
                this.clearTimeoutTimer(config)
                console.error(`请求重发次数达到限制次数${maxRetries}`, response)
                reject(response)
                return
            }
            // 每个data都需要解压
            config.data = {
                ...JSON.parse(response.config.data),
                ...mergeData,
            }
            // 给 config 添加 requestRetryNumber 记录
            config.requestRetryNumber = requestRetryNumber + 1

            setTimeout(() => {
                // 间隔 retryDelay 重新请求
                resolve(this.instance(config))
            }, retryDelay)
        })
    }

    /**
     * 无感刷新 token 函数
     * @returns Promise<void>
     */
    private refreshToken = (): Promise<void> => {

        // 当多个并发请求同时触发时 refreshToken时，只会发起一次请求
        if (this.refreshTokenPromise) return this.refreshTokenPromise

        console.log('start-refresh-token')
        authStore.logout()
        // 开发者自行修改
        const refreshToken = 'refreshToken'

        this.refreshTokenPromise = new Promise<void>((resolve, reject) => {
            // 发起刷新token请求
            this.instance({
                url: '/user/refreshtoken',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            })
            .then((res) => {
                const newToken = res.data.token
                if (newToken) {
                    // 存储新的 token 到 store 中
                    authStore.login({ token: newToken })
                    resolve()
                }
                return Promise.reject(res)
            })
            .catch((error) => {
                // 此处可做跳转至登录页
                // navigate('login')
                reject(error)
            })
            .finally(() => {
                this.refreshTokenPromise = null
            })
        })

        return this.refreshTokenPromise
    }

    // 异常拦截处理器
    private handleRequestError = (error: unknown): Promise<AxiosError> => {
        const config = (error as AxiosError).config as CustomAxiosRequestConfig
        this.clearTimeoutTimer(config)

        let errorMessage = '请求失败，请稍后再试'
        if (axios.isCancel(error)) {
            console.warn('请求被取消', error.message)
            /**
             * 在返回 pendding 状态的时候，要确保请求函数的.catch没有什么必须要处理的逻辑
             * 比如清除组件的loading状态、以及函数防抖等
             * 若有此类逻辑，该接口不能使用取消请求功能，或者此处返回一个失败状态的 Promise
             */
            return new Promise(() => { })
        } else if (axios.isAxiosError(error)) {
            const status = error.response?.status || error.code || ''
            if (error.code === 'ERR_NETWORK' && !window.navigator.onLine) {
                errorMessage = '网络已断开'
            } else {
                errorMessage = HTTP_STATUS_CODES[status] || '请求错误，请稍后再试'
            }
            console.error(`Request Error: ${status} ${errorMessage}`)
        }
        console.error(error)
        // err_msg 字段需要根据src/api/types/public.d 的 PublicAnswer进行自定义，供请求失败提示使用
        return Promise.reject({ ...(error as AxiosError), data: { err_msg: errorMessage } })
        // message.error(error.data.err_msg || '未知错误')
    }

    // 暴露实例
    public getAxiosInstance = () => {
        return this.instance
    }
}
