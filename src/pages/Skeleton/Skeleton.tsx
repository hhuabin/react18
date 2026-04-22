/**
 * @Author: bin
 * @Date: 2026-01-21 09:13:45
 * @LastEditors: bin
 * @LastEditTime: 2026-01-21 09:48:58
 */
import { useState, useEffect, useRef } from 'react'

import Skeleton from '@/components/Skeleton'

const SkeletonComponents: React.FC = () => {

    const [loading, setLoading] = useState(true)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 3000)
    }, [])

    const requestLoading = () => {
        setLoading(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            setLoading(false)
        }, 3000)
    }

    const children = () => (
        <div className='flex justify-center items-center w-full h-full'>加载完成了</div>
    )

    return (
        <div className='w-full min-h-full p-6'>
            <div className='w-full'>
                <div className='w-full text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full h-[150px]'>
                    <Skeleton loading={loading}>
                        { children }
                    </Skeleton>
                </div>
            </div>

            <div className='mt-[12px]'>
                <button
                    type='button'
                    className='px-[16px] border border-[var(--border-default)] rounded-md text-[16px] bg-[var(--color-primary)] select-none
                        text-[#FFF] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                    onClick={() => requestLoading()}
                >
                    <span>reload</span>
                </button>
            </div>
        </div>
    )
}

export default SkeletonComponents
