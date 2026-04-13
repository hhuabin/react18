/**
 * @Author: bin
 * @Date: 2025-04-16 14:12:24
 * @LastEditors: bin
 * @LastEditTime: 2026-04-13 16:51:53
 */
import { redirect, Navigate } from 'react-router-dom'
import type { RouteConfig } from './types'

// 根组件，无需懒加载
import RootRouteLayout from '../layout/RootRouteLayout'
// 错误组件，无需懒加载
import ErrorElement from '@/components/ErrorElement/ErrorElement'

import { mobileRoute } from './mobileRoute'

export const routes: RouteConfig[] = [
    {
        path: '/',
        Component: RootRouteLayout,
        errorElement: <ErrorElement />,        // 统一错误处理
        children: [
            {
                lazy: async () => {
                    const { default: Home } = await import('@/pages/Home/Home')
                    // const RedirectCom = () => (<><Home/><Navigate to='/login' replace /></>)   // 重定向(不可重定向至子路由，子路由使用 index)
                    return { Component: Home }
                },
                children: [
                    {
                        index: true,
                        element: <Navigate to='/introduce' replace />,
                    },
                    {
                        path: 'introduce',
                        lazy: async () => {
                            const { default: Introduce } = await import('@/pages/Introduce/Introduce')
                            return { Component: Introduce }
                        },
                        handle: {},
                    },
                ],
            },
            {
                // 切记该路由绝对不能放进 鉴权路由下
                path: '/login',
                lazy: async () => {
                    const { default: Login } = await import('@/pages/Login/Login')
                    return { Component: Login }
                },
                handle: {
                    title: 'login',
                },
            },
            {
                // 需要登录的路由放进鉴权路由下
                lazy: async () => {
                    const { default: AuthGuard } = await import('@/router/guard/AuthGuard')
                    return { Component: AuthGuard }
                },
                children: [
                    ...mobileRoute,
                    {
                        path: '/cssmotion',
                        lazy: async () => {
                            const { default: CSSMotion } = await import('@/pages/CSSMotion/CSSMotion')
                            return { Component: CSSMotion }
                        },
                        handle: {
                            title: 'cssmotion',
                        },
                    },
                    {
                        path: '/message',
                        lazy: async () => {
                            const { default: Message } = await import('@/pages/Message/Message')
                            return { Component: Message }
                        },
                        handle: {
                            title: 'Message',
                        },
                    },
                    {
                        path: '/modal',
                        lazy: async () => {
                            const { default: Modal } = await import('@/pages/Modal/Modal')
                            return { Component: Modal }
                        },
                        handle: {
                            title: 'Modal',
                        },
                    },
                    {
                        path: '/fileupload',
                        lazy: async () => {
                            const { default: FileUpload } = await import('@/pages/FileUpload/FileUpload')
                            return { Component: FileUpload }
                        },
                        handle: {
                            title: 'fileupload',
                        },
                    },
                    {
                        path: '/fetchStream',
                        lazy: async () => {
                            const { default: FetchStreamResponse } = await import('@/pages/FetchStreamResponse/FetchStreamResponse')
                            return { Component: FetchStreamResponse }
                        },
                        handle: {
                            title: 'fetchStream',
                        },
                    },
                    {
                        path: '/timezoneTime',
                        lazy: async () => {
                            const { default: TimezoneTime } = await import('@/pages/TimezoneTime/TimezoneTime')
                            return { Component: TimezoneTime }
                        },
                        handle: {
                            title: 'timezone',
                        },
                    },
                    {
                        path: '/skeleton',
                        lazy: async () => {
                            const { default: Skeleton } = await import('@/pages/Skeleton/Skeleton')
                            return { Component: Skeleton }
                        },
                        handle: {
                            title: 'skeleton',
                        },
                    },
                    {
                        path: '/svgicon',
                        lazy: async () => {
                            const { default: SvgIcon } = await import('@/pages/SvgIcon/SvgIcon')
                            return { Component: SvgIcon }
                        },
                        handle: {
                            title: 'svgicon',
                        },
                    },
                    {
                        path: 'developing',
                        lazy: async () => {
                            const { default: Developing } = await import('@/pages/Developing/Developing')
                            return { Component: Developing }
                        },
                        handle: {
                            title: 'developing',
                        },
                    },
                    {
                        path: 'test',
                        lazy: async () => {
                            const { default: Test } = await import('@/pages/Test/Test')
                            return { Component: Test }
                        },
                        handle: {
                            title: 'test',
                        },
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        lazy: async () => {
            const { default: NotFound } = await import('@/pages/NotFound/NotFound')
            return { Component: NotFound }
        },
        handle: {
            title: 'notfound',
        },
    },
]
