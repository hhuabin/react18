/**
 * @Author: bin
 * @Date: 2024-12-11 17:27:34
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 17:22:48
 */
import { useRef, useEffect } from 'react'

/**
 * @description 性能监控面板，生产环境不生效
 */
export default function usePerformanceMonitor() {

    const isMounted = useRef(false)

    useEffect(() => {
        // 禁止在生产环境中运行，没有意义
        if (import.meta.env.MODE === 'production') return
        if (isMounted.current) return
        isMounted.current = true

        // LCP监听
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lcpEntry = entries[entries.length - 1]
            console.log('LCP: ', lcpEntry.startTime, 'ms')
            console.groupEnd()                           // 结束分组打印
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // Onload Event
        setTimeout(() => {
            const paintEntries = performance.getEntriesByType('paint')
            const navigationEntries = performance.getEntriesByType('navigation')

            console.group('performance-monitor')         // 分组打印
            const navTiming = navigationEntries[0] as PerformanceNavigationTiming      // 通常只有一个导航条目
            console.log(navTiming)
            console.log('DOMContentLoaded: ', navTiming.domContentLoadedEventEnd - navTiming.startTime, 'ms')

            paintEntries.forEach((entry) => {
                if (entry.name === 'first-paint') {
                    console.log('FP: ', entry.startTime, 'ms')
                } else if (entry.name === 'first-contentful-paint') {
                    console.log('FCP: ', entry.startTime, 'ms')
                }
            })
            console.log('OnLoadTime: ', navTiming.loadEventEnd - navTiming.startTime, 'ms')
        }, 200)

        return () => {
            // 移除PerformanceObserver监听
            observer.disconnect()
        }
    }, [])
}
