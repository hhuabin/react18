/**
 * @Author: bin
 * @Date: 2026-11-02 15:49:51
 * @LastEditors: bin
 * @LastEditTime: 2026-11-05 16:40:03
 */
import { delay, http, HttpResponse } from 'msw'

import type {
    PublicResponse,
    LoginRequest, LoginResponse,
    GetUserInfoByIdRequest, GetUserInfoByIdResponse,
} from '@/api/types'

/** Mock 链接前缀 */
const MOCK_URL: string = import.meta.env.VITE_API_MOCK_URL

export const userHandlers = [
    http.post(MOCK_URL + '/user/auth/login', async ({ request }) => {
        const { userName } = await request.json() as LoginRequest

        return HttpResponse.json<LoginResponse>({
            code: 0,
            message: '登录成功',
            data: {
                accessToken: 'mock-access-token',
                userInfo: {
                    userId: 1,
                    userName,
                    realName: 'Mock 用户',
                    phone: '13800138000',
                    birthday: '1990-01-01',
                    gender: 2,
                    email: 'mock@example.com',
                    address: 'Mock 地址',
                    avatar: '',
                    status: 1,
                },
            },
        })
    }),

    http.post(MOCK_URL + '/user/info/getUserInfoById', async ({ request }) => {
        const { userId } = await request.json() as GetUserInfoByIdRequest

        // 加一点延迟，方便观察 loading 态
        await delay(300)

        return HttpResponse.json<GetUserInfoByIdResponse>({
            code: 0,
            message: '查询成功',
            data: {
                userId: String(userId ?? 1),
                userName: 'mock_user',
                realName: 'Mock 用户',
                phone: '13800138000',
                birthday: '1990-01-01',
                gender: '1',
                email: 'mock@example.com',
                address: 'Mock 地址',
                avatar: '',
                signature: '这是 Mock 用户的个性签名',
                status: 1,
                lastLoginTime: '2026-11-02 17:00:00',
            },
        })
    }),

    http.get(MOCK_URL + '/user/info/getUserNameById', async ({ request }) => {
        // GET 请求的参数在查询字符串中，不在 body
        const userId = new URL(request.url).searchParams.get('userId')

        // 加一点延迟，方便观察 loading 态
        await delay(300)

        return HttpResponse.json<PublicResponse<string>>({
            code: 0,
            message: '查询成功',
            data: `mock_user_${userId ?? '1'}`,
        })
    }),
]
