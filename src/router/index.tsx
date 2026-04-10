/**
 * @Author: bin
 * @Date: 2025-04-16 14:12:24
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 14:03:35
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createHashRouter,
    redirect,
    RouterProvider,
    type RouteObject,
    type LoaderFunction,
    type LazyRouteFunction,
    type NonIndexRouteObject,
    type LoaderFunctionArgs,
} from 'react-router-dom'

import RootRouteLayout from './RootRouteLayout'
import authStore from '@/store/slice/auth.store'
import { routes } from './mainRoutes'

import Loading from '@/components/Loading/Loading'

// 检查是否是空对象 {}
const isEmptyObject = (obj: any) =>
    obj !== null &&
    typeof obj === 'object' &&
    Object.getPrototypeOf(obj) === Object.prototype &&
    Object.keys(obj).length === 0

/**
 * @description 创建公共 loader 函数
 * @param route 路由配置对象
 * @returns { LoaderFunction }
 */
const createPublicLoader = (route: RouteObject): LoaderFunction => (loaderFunctionArgs: LoaderFunctionArgs<any>) => {
    // 登录路由守卫
    const { isLogin } = authStore.getAuthState()
    if (!isLogin && route.handle?.auth) {
        const url = new URL(loaderFunctionArgs.request.url)
        const redirectTo = url.pathname + url.search
        // 跳转到登录页面，并携带当前页面链接
        throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    }
    document.title = (route.handle?.title as string) || 'react'
    // 功能正常返回 null
    return null
}

const createPublicLazy = (route: RouteObject): LazyRouteFunction<RouteObject> => async () => {
    const lazy: RouteObject = await route.lazy?.() ?? {}
    const lazyOrRouteLoader = lazy.loader ?? route.loader    // lazy.loader 优先级更高
    // 获取公共loader
    const publicLoader = createPublicLoader(route)

    /**
     * @description 合并 公共 loader 与自定义 loader
     */
    const loader: LoaderFunction = lazyOrRouteLoader ? async (args: LoaderFunctionArgs<any>) => {
        // 当 lazy.loader ?? route.loader 有值，也要执行 publicLoader 的逻辑
        const publicDataFunctionValue = await publicLoader(args)

        // 默认公共 loader 优先级高，因为公共 loader 可能处理未登录重定向的问题，有需要可自行修改
        if (publicDataFunctionValue && !isEmptyObject(publicDataFunctionValue)) {
            // 当 publicLoader 不返回 null | {} 时执行，兼容未登录重定向等返回
            return publicDataFunctionValue
        } else {
            if (lazyOrRouteLoader === true) return lazyOrRouteLoader
            const loaderDataFunctionValue = await lazyOrRouteLoader(args)
            return loaderDataFunctionValue
        }
    } : publicLoader

    return {
        ...lazy,
        loader,
    }
}

const createRoutes = (routes: RouteObject[]): RouteObject[] => routes.map((route): RouteObject => ({
    path: route.path ?? undefined,
    id: route.id ?? undefined,
    index: (route.index as NonIndexRouteObject['index']) ?? undefined,
    element: route.element ?? undefined,
    loader: route.loader ?? undefined,
    lazy: createPublicLazy(route),
    handle: route.handle ?? undefined,
    errorElement: route.errorElement ?? undefined,
    children: route.children ? createRoutes(route.children) : undefined,
}))

// 一定要这个赋值步骤，避免重复创建 Router 实例
const router = createHashRouter(createRoutes(routes))

/* const router = createHashRouter([
    {
        id: 'root',
        element: <RootRouteLayout />,
        children: [
            ...createRoutes(routes),
        ],
    },
]) */

/**
 * 禁止使用<RouterProvider router={createHashRouter(createRoutes(routes))}></RouterProvider>写法
 * AppRouter渲染时都会调用 createHashRouter(createRoutes(routes))，创建一个新的 Router 实例
 * 导致 React Router 的内部状态（如导航历史、加载状态等）被重置，进而引发页面闪烁、导航失败等问题
 */
const AppRouter: React.FC = () => (<RouterProvider router={router} fallbackElement={<Loading />} />)

export default AppRouter
