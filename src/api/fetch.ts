/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-11-02 16:56:59
 */
import FetchRequest from '@/utils/request/FetchRequest'
import type { PublicRequest, PublicResponse } from './types'

const fetchRequest = new FetchRequest()

/**
 * 命名规范：
 * 1. fetch 请求方法应该统一添加 fetch 前缀，如 fetchGetUserInfoById ，后续维护一眼就知道这个是 fetch 请求方法
 * 2. POST 请求的参数应该使用 data
 * 3. GET 请求的参数应该使用 params
 */
export const fetchBasePost = (data: PublicRequest, options?: RequestInit): Promise<PublicResponse> => {
    return fetchRequest.sendRequest(
        '/user/info/getUserInfoById',
        {
            ...data,
        },
        {
            method: 'POST',
            ...options,
        },
    )
}
