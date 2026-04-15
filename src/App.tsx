/**
 * @Author: bin
 * @Date: 2024-05-29 22:12:59
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 17:43:01
 */
import { useLayoutEffect, useEffect } from 'react'

import AppRouter from '@/router'

import {
    useGlobalErrorMonitor,
    usePerformanceMonitor,
    useProjectAutoUpdate,
    useAuth,
} from '@/hooks'

import './App.less'

const App: React.FC = () => {

    // 全局错误监控
    useGlobalErrorMonitor()
    // 性能监控
    usePerformanceMonitor()
    // 项目自动检测更新
    useProjectAutoUpdate()

    // App.tsx 不做登录状态管理，但是对于简单的，没有登陆页的项目可以在这里做一下
    const { isLogin, login } = useAuth()

    useLayoutEffect(() => {
        // window.matchMedia 获取浏览器当前主题的色彩模式
        const currentTheme = localStorage.getItem('local-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        if (currentTheme === 'dark') {
            document.documentElement.dataset.theme = 'dark'
        }
    }, [])

    // 注意：在动态渲染的路由/组件中，App.tsx的useEffect钩子函数是最先执行
    useEffect(() => {
        console.log('import.meta.env', import.meta.env)
        /* login({ token: 'token' }) */
    }, [])

    return (<AppRouter></AppRouter>)
}

export default App
