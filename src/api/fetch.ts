/**
 * @Author: bin
 * @Date: 2026-07-22 11:12:55
 * @LastEditors: bin
 * @LastEditTime: 2026-07-23 12:37:33
 */
import FetchRequest from '@/utils/request/FetchRequest'
import type { PublicParam, PublicAnswer } from './types'

const fetchRequest = new FetchRequest()

export const baseFetch = (params: PublicParam, options?: RequestInit): Promise<PublicAnswer> => {
    return fetchRequest.sendRequest(
        '/user/postlist',
        {
            ...params,
        },
        {
            method: 'POST',
            ...options,
        },
    )
}
