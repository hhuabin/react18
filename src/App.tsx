/**
 * @Author: bin
 * @Date: 2024-05-29 22:12:59
 * @LastEditors: bin
 * @LastEditTime: 2026-08-14 10:07:22
 */
import { useLayoutEffect, useEffect } from 'react'

import AppRouter from '@/router'

import LocalStorageUtil from '@/utils/storageUtils/LocalStorageUtil'

import {
    useGlobalErrorMonitor,
    usePerformanceMonitor,
    useVersionCheck,
    useVersionUpdate,
    useAuth,
} from '@/hooks'

import './App.less'

type Theme = 'light' | 'dark'

// window.matchMedia 获取浏览器当前主题的色彩模式
const getOSTheme = (): Theme => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getLocalTheme = (): 'light' | 'dark' | null => {
    const theme = LocalStorageUtil.getItem('local_theme', null)

    if (theme === 'dark' || theme === null) {
        return theme
    }

    return 'light'
}

const App: React.FC = () => {

    // 全局错误监控
    useGlobalErrorMonitor()
    // 性能监控
    usePerformanceMonitor()
    // 项目自动检测更新
    useVersionCheck(window.location.pathname, true)
    // useVersionUpdate('/react18/', true, true)

    // App.tsx 不做登录状态管理，但是对于简单的，没有登陆页的项目可以在这里做一下
    const { isLogin, login } = useAuth()

    useLayoutEffect(() => {
        // 只有当前是深色主题才需要改动整体样式
        const currentTheme = getLocalTheme() || getOSTheme()
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
