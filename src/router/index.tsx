/**
 * @Author: bin
 * @Date: 2025-04-16 14:12:24
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 17:12:41
 */
import {
    createHashRouter,
    RouterProvider,
} from 'react-router-dom'

import { routes } from './mainRoutes'

import Loading from '@/components/Loading/Loading'

// 一定要这个赋值步骤，避免重复创建 Router 实例
const router = createHashRouter(
    routes,
    {
        basename: '/',
    },
)

/**
 * 禁止使用<RouterProvider router={createHashRouter(routes)}></RouterProvider>写法
 * AppRouter渲染时都会调用 createHashRouter(routes)，创建一个新的 Router 实例
 * 导致 React Router 的内部状态（如导航历史、加载状态等）被重置，进而引发页面闪烁、导航失败等问题
 */
const AppRouter: React.FC = () => (<RouterProvider router={router} fallbackElement={<Loading />} />)

export default AppRouter
