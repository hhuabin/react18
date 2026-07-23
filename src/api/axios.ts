/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-07-23 14:07:43
 */
import type { AxiosPromise, AxiosRequestConfig } from 'axios'

import AxiosRequest from '@/utils/request/AxiosRequest'
import type { PublicParam, PublicAnswer } from './types'

const axiosRequest = new AxiosRequest().getAxiosInstance()

export const basePost = (data: PublicParam, config?: AxiosRequestConfig): AxiosPromise<PublicAnswer> => {
    return axiosRequest({
        url: '/user/postlist',
        method: 'POST',
        ...config,
        data: {
            ...data,
        },
    })
}

export const baseGet = (params: PublicParam, config?: AxiosRequestConfig): AxiosPromise<PublicAnswer> => {
    return axiosRequest({
        url: '/user/getlist',
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
export const largeFileUpload = (params: { file: FormData }, config?: AxiosRequestConfig) => {
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
