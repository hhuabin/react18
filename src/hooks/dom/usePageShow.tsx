/**
 * @Author: bin
 * @Date: 2025-10-29 11:31:10
 * @LastEditors: bin
 * @LastEditTime: 2025-11-13 10:07:07
 */
import { useEffect } from 'react'

/**
 * @description 监听页面显示隐藏
 * @param onShow 页面显示执行函数
 * @param onHide 页面隐藏执行函数
 */
export default function usePageShow(onShow: () => void, onHide?: () => void) {
    useEffect(() => {
        const handleVisibility = () => {
            // console.log('document.hidden', document.hidden)

            if (document.visibilityState === 'visible') onShow()
            else if (document.visibilityState === 'hidden') onHide?.()
            else if (document.visibilityState === 'prerender') { /* */ }
        }
        const handleFocus = () => onShow()
        const handleBlur = () => onHide?.()

        document.addEventListener('visibilitychange', handleVisibility)
        // window.addEventListener('focus', handleFocus)
        // window.addEventListener('blur', handleBlur)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
            // window.removeEventListener('focus', handleFocus)
            // window.removeEventListener('blur', handleBlur)
        }
    }, [onShow, onHide])
}
