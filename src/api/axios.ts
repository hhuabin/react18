/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-10-12 15:37:09
 */
import type { AxiosPromise, AxiosRequestConfig } from 'axios'

import AxiosRequest from '@/utils/request/AxiosRequest'
import type { PublicRequest, PublicResponse } from './types'

const axiosRequest = new AxiosRequest().getAxiosInstance()

/**
 * 命名规范：
 * 1. axios 请求方法应该统一添加 axios 前缀，如 axiosGetUserInfoById ，后续维护一眼就知道这个是 axios 请求方法
 * 2. POST 请求的参数应该使用 data
 * 3. GET 请求的参数应该使用 params
 */
export const axiosBasePost = (data: PublicRequest, config?: AxiosRequestConfig): AxiosPromise<PublicResponse> => {
    return axiosRequest({
        url: '/user/getUserInfoById',
        method: 'POST',
        ...config,
        data: {
            ...data,
        },
    })
}

export const axiosBaseGet = (params: PublicRequest, config?: AxiosRequestConfig): AxiosPromise<PublicResponse> => {
    return axiosRequest({
        url: '/user/getUserNameById',
        method: 'GET',
        ...config,
        params: {
            ...params,
        },
    })
}

/**
 * @description 大文件上传，监控上传进度
 * @param params 请求参数
 * @param { AxiosRequestConfig } config 请求配置
 * @returns { Promise<AxiosResponse<any, any>> }
 */
export const axioslargeFileUpload = (params: { file: FormData }, config?: AxiosRequestConfig) => {
    return axiosRequest({
        url: 'url',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            // 上传进度监控，此处可移至 config 中，函数调用时在 config 中定义即可
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
            console.log(`Upload Progress: ${progress}%`)
        },
        onDownloadProgress: (progressEvent) => {
            // 下载进度监控，此处可移至 config 中，函数调用时在 config 中定义即可
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
            console.log(`Download Progress: ${progress}%`)
        },
        ...config,
        data: params.file,
    })
}
