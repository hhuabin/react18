import {
    useLocation,
    Navigate,
    Outlet,
} from 'react-router-dom'

import { useAuth } from '@/hooks/authHooks'

/**
 * @description 登录鉴权路由组件，需要登录的路由组件，必须放在 AuthGuard 子路由下
 * {
    lazy: async () => {
        const { default: AuthGuard } = await import('@/router/guard/AuthGuard')
        return { Component: AuthGuard }
    },
    children: [
        // 需要登录的路由
    ]
   }
 */
const AuthGuard: React.FC = () => {

    const location = useLocation()

    const { isLogin } = useAuth()

    if (!isLogin) {
        return <Navigate
            to='/login'
            state={{
                message: 'You must login in first.',
                from: encodeURIComponent(location.pathname + location.search),
            }}
            replace
        />
    }

    return <Outlet />
}

export default AuthGuard
