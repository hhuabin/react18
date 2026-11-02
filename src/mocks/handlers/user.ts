/**
 * @Author: bin
 * @Date: 2026-11-02 15:49:51
 * @LastEditors: bin
 * @LastEditTime: 2026-11-02 17:17:25
 */
import { delay, http, HttpResponse } from 'msw'

import type { GetUserInfoByIdRequest, GetUserInfoByIdResponse, LoginRequest, LoginResponse } from '@/api/types'

export const userHandlers = [
    http.post('/mock/user/auth/login', async ({ request }) => {
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

    http.post('/mock/user/info/getUserInfoById', async ({ request }) => {
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
]
