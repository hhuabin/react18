/**
 * @Author: bin
 * @Date: 2026-04-09 15:24:42
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 17:56:18
 */
import { Outlet, useMatches, ScrollRestoration, type UIMatch } from 'react-router-dom'
import { useEffect } from 'react'

import type { RouteHandle } from '@/router/types'

/**
 * @description 根路由布局组件
 * 功能：
 *  1. 配置 title
 *  2. 配置 scroll
 */
const RootRouteLayout: React.FC = () => {

    const matches = useMatches() as (UIMatch & {
        handle?: RouteHandle
    })[]

    const lastMatch = matches[matches.length - 1]
    const title = lastMatch.handle?.title || 'react'

    useEffect(() => {
        // ✅ title
        // document.title = title
    }, [title])

    return (
        <>
            {/* scroll 滚动条配置 */}
            {/*
              * 注意：ScrollRestoration 组件会触发一次 render，如果加载完成触发了两次 render，原因在这里
             */}
            <ScrollRestoration
                getKey={(location, matches) => {
                    // return location.key        // 默认值
                    return location.pathname + location.search
                }}
            />
            <Outlet />
        </>
    )
}

export default RootRouteLayout
