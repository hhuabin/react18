/**
 * @Author: bin
 * @Date: 2025-04-16 14:12:24
 * @LastEditors: bin
 * @LastEditTime: 2026-02-10 10:18:27
 */
import { redirect, Navigate, type RouteObject } from 'react-router-dom'

import { mobileRoute } from './mobileRoute'

export const routes: RouteObject[] = [
    {
        path: '/',
        lazy: async () => {
            const { default: Home } = await import('@/pages/Home/Home')
            // const RedirectCom = () => (<><Home/><Navigate to='/login' replace /></>)   // 重定向(不可重定向至子路由，子路由使用 index)
            return { Component: Home }
        },
        handle: {
            auth: false,
            name: '/',
        },
        children: [
            {
                index: true,
                element: <Navigate to='introduce' replace />,
            },
            {
                path: 'introduce',
                lazy: async () => {
                    const { default: Login } = await import('@/pages/Introduce/Introduce')
                    return { Component: Login }
                },
                handle: {
                    auth: false,
                },
            },
        ],
    },
    ...mobileRoute,
    {
        path: '/login',
        lazy: async () => {
            const { default: Login } = await import('@/pages/Login/Login')
            return { Component: Login }
        },
        handle: {
            title: 'login',
            auth: false,
        },
    },
    {
        path: '/cssmotion',
        lazy: async () => {
            const { default: CSSMotion } = await import('@/pages/CSSMotion/CSSMotion')
            return { Component: CSSMotion }
        },
        handle: {
            title: 'cssmotion',
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
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
            auth: false,
        },
    },
    {
        path: '*',
        lazy: async () => {
            const { default: NotFound } = await import('@/pages/NotFound/NotFound')
            return { Component: NotFound }
        },
        handle: {
            title: 'notfound',
            auth: false,
        },
    },
]
