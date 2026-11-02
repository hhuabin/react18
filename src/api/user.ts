/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-11-02 15:13:31
 */
import type { AxiosPromise, AxiosRequestConfig } from 'axios'

import AxiosRequest from '@/utils/request/AxiosRequest'
import type {
    PublicRequest, PublicResponse,
    LoginRequest, LoginResponse,
    GetUserInfoByIdRequest, GetUserInfoByIdResponse,
} from './types'

const axiosRequest = new AxiosRequest().getAxiosInstance()

// 登录接口
export const axiosLogin = (data: LoginRequest, config?: AxiosRequestConfig): AxiosPromise<LoginResponse> => {
    return axiosRequest({
        url: '/user/auth/login',
        method: 'POST',
        ...config,
        data: {
            ...data,
        },
    })
}

export const axiosGetUserInfoById = (data: GetUserInfoByIdRequest, config?: AxiosRequestConfig): AxiosPromise<GetUserInfoByIdResponse> => {
    return axiosRequest({
        url: '/user/info/getUserInfoById',
        method: 'POST',
        ...config,
        data: {
            ...data,
        },
    })
}
