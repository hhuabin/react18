/**
 * @Author: bin
 * @Date: 2025-08-07 09:16:04
 * @LastEditors: bin
 * @LastEditTime: 2025-12-29 09:53:02
 */
import { useState, useEffect } from 'react'

/**
 * @description 简单的hash路由
 * @example const [route, routeData] = useHashRoute()
 */
export default function useHashRoute() {

    const [route, setRoute] = useState<string>('/')
    const [routeData, setRouteData] = useState<object | null>(null)

    useEffect(() => {
        const getHashRoute = () => window.location.hash.replace(/^#/, '').split('?')[0] || '/'

        const handleHashChange = (event?: HashChangeEvent) => {
            setRoute(getHashRoute())
        }

        handleHashChange()

        window.addEventListener('hashchange', handleHashChange)

        return () => {
            window.removeEventListener('hashchange', handleHashChange)
        }
    }, [])

    return [route, routeData] as const
}
