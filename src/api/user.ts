/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-10-10 15:03:56
 */
import type { AxiosPromise, AxiosRequestConfig } from 'axios'

import AxiosRequest from '@/utils/request/AxiosRequest'
import type {
    PublicRequest, PublicResponse,
    GetUserInfoByIdRequest, GetUserInfoByIdResponse,
} from './types'

const axiosRequest = new AxiosRequest().getAxiosInstance()

export const axiosGetUserInfoById = (data: GetUserInfoByIdRequest, config?: AxiosRequestConfig): AxiosPromise<GetUserInfoByIdResponse> => {
    return axiosRequest({
        url: '/user/getUserInfoById',
        method: 'POST',
        ...config,
        data: {
            ...data,
        },
    })
}
