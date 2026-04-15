/**
 * @Author: bin
 * @Date: 2026-04-13 16:05:14
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 10:52:30
 */
import React from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

/**
 * @description 路由错误 → 用 ErrorElement
 *  1. loader 报错
 *  2. action 报错
 *  3. 路由组件 render 报错
 */
const ErrorElement: React.FC = () => {
    const error = useRouteError()

    let title = '出错了'
    let message = '发生未知错误'

    if (isRouteErrorResponse(error)) {
        // 例如 loader / action 抛出的 Response
        title = `${error.status} ${error.statusText}`

        if (error.status === 404) {
            message = '页面不存在'
        } else if (error.status === 401) {
            message = '未授权，请登录'
        } else if (error.status === 500) {
            message = '服务暂时不可用，请稍后重试'
        } else {
            message = error.data || message
        }
    } else if (error instanceof Error) {
        // JS runtime error
        message = error.message
    }

    return (
        <>
            <div className='flex justify-center items-center w-full h-full p-[12px] box-border text-[var(--color-text)] text-[24px]'>
                <div className='absolute top-[35%] flex flex-col justify-center items-center p-[12px] box-border translate-y-[-50%]'>
                    <div className='font-semibold'>{ title }</div>
                    <div className='mt-[10px] text-[#999] text-[12px]'>
                        { message }
                    </div>

                    <div className='mt-[30px] text-[14px]'>
                        <button
                            type='button'
                            className='px-[16px] border border-[var(--color-border)] rounded-md mx-4 text-[1em] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                            onClick={() => window.location.reload()}
                        >
                            <span>刷新</span>
                        </button>

                        <button
                            type='button'
                            className='px-[16px] border border-[var(--color-border)] rounded-md mx-4 text-[1em] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                            onClick={() => (window.location.href = '/')}
                        >
                            <span>返回首页</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ErrorElement
