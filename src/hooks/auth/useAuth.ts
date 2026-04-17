/**
 * @Author: bin
 * @Date: 2025-12-16 10:36:46
 * @LastEditors: bin
 * @LastEditTime: 2026-01-06 15:16:00
 */
import { useDispatch, useSelector } from 'react-redux'

import { saveUserInfo, removeUserInfo } from '@/store/slice/userInfoSlice'
import { type RootState, type AppDispatch } from '@/store/store'
import type { UserInfo } from '@/store/types'

/**
 * @description 登录状态管理 hooks
 * 结合 redux 做登录状态管理
 * React 函数组件中所有与登录相关的修改 userInfoSlice 的操作，只能通过该 hooks 间接修改
 */
export default function useAuth() {

    const dispatch = useDispatch<AppDispatch>()

    const userInfo = useSelector((state: RootState) => state.userInfo.userInfo)

    return {
        userInfo,
        isLogin: !!userInfo.token,
        login: (userInfo: UserInfo) => dispatch(saveUserInfo(userInfo)),
        logout: () => dispatch(removeUserInfo()),
    }
}
