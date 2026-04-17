/**
 * @Author: bin
 * @Date: 2025-08-07 09:16:05
 * @LastEditors: bin
 * @LastEditTime: 2025-12-26 16:26:26
 */
import { useState, useEffect } from 'react'

/**
 * @description 简单的history路由
 * @example const [route, routeData] = useHistoryRoute()
 */
export default function useHistoryRoute() {

    const [route, setRoute] = useState<string>('/')
    const [routeData, setRouteData] = useState<object | null>(null)

    useEffect(() => {
        const getHistoryRoute = () => window.location.pathname || '/'

        const handlePopState = (event: PopStateEvent) => {
            setRoute(event.state?.path ?? getHistoryRoute())
            setRouteData(event.state?.data ?? null)
        }

        // 初始化（与 popstate 使用同一逻辑）
        handlePopState({ state: history.state } as PopStateEvent)

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [])

    return [route, routeData] as const
}
