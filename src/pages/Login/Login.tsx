/**
 * @Author: bin
 * @Date: 2025-12-25 15:43:01
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 17:04:09
 */
import { useRef, useEffect } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'

import axios from 'axios'

import message from '@/components/Message'
import useAuth from '@/hooks/authHooks/useAuth'

/**
 * @description 登录页面
 *  需要传入来源路由，方便跳转回去
 */
const Login: React.FC = () => {

    // 可以使用 search 或者 state 接收来源路由路径，这里使用 state
    const [search] = useSearchParams()
    const { state } = useLocation() as { state: { from?: string } }
    const navigate = useNavigate()

    // console.log('Login location', location)

    const { isLogin, login } = useAuth()

    const loading = useRef(false)

    useEffect(() => {
        // 已经登录，直接跳走，但是要注意 token 过期的情况
        // 如果是 token 过期要立马删除才不会导致进不来 login 的 bug
        if (isLogin) {
            goBackOrGoRoot()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const goToLogin = () => {
        if (loading.current) return
        new Promise((resolve) => {
            resolve(true) // 模拟登录请求成功
        })
        .then(() => {
            // 登录
            login({ token: 'bin'  })
            return goBackOrGoRoot()
        })
        .then(() => {
            message.success('登录成功！')
        })
        .finally(() => {
            loading.current = false
        })
    }

    const goBackOrGoRoot = () => {
        let redirectUrl = state?.from || ''
        // 需要等待 axios.get 返回，所以使用 promise。
        return new Promise((resolve) => {
            if (redirectUrl) {
                // 解码路由
                redirectUrl = decodeURIComponent(redirectUrl)
                // 网页存在才能跳转，否则跳转首页
                axios.get(redirectUrl)
                .then(res => {
                    if (res.status === 200) {
                        navigate(redirectUrl, { replace: true })
                    } else {
                        navigate('/', { replace: true })
                    }
                })
                .catch(err => {
                    console.error(err)
                    navigate('/', { replace: true })
                })
                .finally(() => {
                    resolve(true)
                })
            } else {
                // 路由长度小于，返回上一个路由即可，动态调整
                if (window.history.length <= 2) {
                    navigate('/', { replace: true })
                } else {
                    // 没有上一步的路由，直接切首页
                    navigate(-1)
                }
                resolve(true)
            }
        })
    }

    return (
        <div className='flex justify-center items-center w-full h-full p-[12px] box-border text-[var(--color-text)] text-[24px]'>
            <div className='absolute flex flex-col justify-center items-center p-[12px] box-border translate-y-[-100%]'>
                <div className='font-semibold'>欢迎登录 hhuabin 的网站！</div>
                <div className='mt-[10px] text-[#999] text-[12px]'>
                    This is a good website.
                </div>

                <div className='mt-[30px] text-[14px]'>
                    <button
                        type='button'
                        className='px-4 border border-[var(--color-border)] rounded-md text-[1em] bg-[var(--bg-color)] select-none
                        text-[var(--color-text)] leading-8 hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => goToLogin()}
                    >
                        <span>模拟登录</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
