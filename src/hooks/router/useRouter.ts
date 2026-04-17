/**
 * @Author: bin
 * @Date: 2025-03-07 20:08:55
 * @LastEditors: bin
 * @LastEditTime: 2025-12-24 10:20:26
 */
import { useNavigate, type NavigateFunction } from 'react-router-dom'

/**
 * @description react-router-dom路由跳转封装，供组件外路由跳转使用
 * 使用 navigator 前请务必先初始化
 * 1. useRouter()
 * 2. navigate('/')
 */

let navigator: NavigateFunction

export const setNavigator = (nav: NavigateFunction) => {
    navigator = nav
}

export const navigate = (to: string) => {
    if (navigator) {
        navigator(to)
    } else {
        console.warn('Navigator not initialized!')
    }
}

export default function useRouter() {

    const navigate = useNavigate()

    setNavigator(navigate)

}
