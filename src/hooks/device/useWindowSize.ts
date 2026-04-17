/**
 * @Author: bin
 * @Date: 2025-12-29 17:34:51
 * @LastEditors: bin
 * @LastEditTime: 2025-12-29 17:56:07
 */

import { useState, useEffect } from 'react'

export default function useWindowSize() {

    const [windowSize, setWindowSize] = useState(() => (
        typeof window === 'undefined'
            ?  { width: 0, height: 0 }
            :  {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
    ))

    useEffect(() => {
        let rafId: number | null = null

        const handleResize = () => {
            if (rafId) return
            rafId = requestAnimationFrame(() => {
                rafId = null
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                })
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowSize

}
