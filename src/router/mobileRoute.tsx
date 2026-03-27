/**
 * @Author: bin
 * @Date: 2025-06-05 15:41:52
 * @LastEditors: bin
 * @LastEditTime: 2026-01-19 16:02:07
 */
import { Navigate } from 'react-router-dom'

import type { RouteConfig } from './types'

export const mobileRoute: RouteConfig[] = [
    {
        path: '/mobile',
        lazy: async () => {
            const { default: MobileLayout } = await import('@/pages/mobile/MobileLayout')
            return { Component: MobileLayout }
        },
        meta: { auth: false },
        children: [
            {
                index: true,
                element: <Navigate to='guide' replace />,
            },
            {
                path: 'guide',
                lazy: async () => {
                    const { default: Guide } = await import('@/pages/mobile/Guide/Guide')
                    return { Component: Guide }
                },
                meta: {
                    auth: false,
                    title: 'guide',
                },
            },
            {
                path: 'message',
                lazy: async () => {
                    const { default: Message } = await import('@/pages/mobile/Message/Message')
                    return { Component: Message }
                },
                meta: {
                    auth: false,
                    title: 'message',
                },
            },
            {
                path: 'dialog',
                lazy: async () => {
                    const { default: Dialog } = await import('@/pages/mobile/Dialog/Dialog')
                    return { Component: Dialog }
                },
                meta: {
                    auth: false,
                    title: 'dialog',
                },
            },
            {
                path: 'mask',
                lazy: async () => {
                    const { default: Mask } = await import('@/pages/mobile/Mask/Mask')
                    return { Component: Mask }
                },
                meta: {
                    auth: false,
                    title: 'Mask',
                },
            },
            {
                path: 'picker',
                lazy: async () => {
                    const { default: Picker } = await import('@/pages/mobile/Picker/Picker')
                    return { Component: Picker }
                },
                meta: {
                    auth: false,
                    title: 'picker',
                },
            },
            {
                path: 'swiper',
                lazy: async () => {
                    const { default: Swiper } = await import('@/pages/mobile/Swiper/Swiper')
                    return { Component: Swiper }
                },
                meta: {
                    auth: false,
                    title: 'swiper',
                },
            },
            {
                path: 'image',
                lazy: async () => {
                    const { default: Image } = await import('@/pages/mobile/Image/Image')
                    return { Component: Image }
                },
                meta: {
                    auth: false,
                    title: 'ImagePreview',
                },
            },
            {
                path: 'imagePreview',
                lazy: async () => {
                    const { default: ImagePreview } = await import('@/pages/mobile/ImagePreview/ImagePreview')
                    return { Component: ImagePreview }
                },
                meta: {
                    auth: false,
                    title: 'ImagePreview',
                },
            },
            {
                path: 'upload',
                lazy: async () => {
                    const { default: Upload } = await import('@/pages/mobile/FileUpload/FileUpload')
                    return { Component: Upload }
                },
                meta: {
                    auth: false,
                    title: 'Upload',
                },
            },
        ],
    },
]
