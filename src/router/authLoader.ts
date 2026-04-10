/**
 * @Author: bin
 * @Date: 2025-12-16 11:03:18
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 17:28:40
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, type RouteObject, type LoaderFunctionArgs } from 'react-router-dom'

import { getAuthState } from '@/store/slice/auth.store'

// 如果公共Loader内容比较多，可以把登录逻辑抽离成单独的文件
export const authLoader = (route: RouteObject, loaderFunctionArgs: LoaderFunctionArgs<any>) => {
    const { isLogin } = getAuthState()
    if (!isLogin && route.handle?.auth) {
        const url = new URL(loaderFunctionArgs.request.url)
        const redirectTo = url.pathname + url.search
        // 跳转到登录页面，并携带当前页面链接
        throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    }
    return null
}
