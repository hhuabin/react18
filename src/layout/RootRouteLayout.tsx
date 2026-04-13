/**
 * @Author: bin
 * @Date: 2026-04-09 15:24:42
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 18:43:58
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
        document.title = title
    }, [title])

    return (
        <>
            {/* scroll 配置 */}
            <ScrollRestoration
                getKey={(location, matches) => {
                    return location.pathname + location.search
                }}
            />
            <Outlet />
        </>
    )
}

export default RootRouteLayout
