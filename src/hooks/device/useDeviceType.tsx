/**
 * @Author: bin
 * @Date: 2025-06-05 16:52:51
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:50:54
 */
import { useState, useEffect } from 'react'

type DeviceType = 'mobile' | 'pad' | 'desktop' | 'unknown'

/**
 * @description 获取设备类型
 * @returns { DeviceType } 设备类型
 */
const getDeviceType = (): DeviceType => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown'
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(userAgent)) {
        return 'mobile'
    } else if (/ipad|android(?!.*mobile)|tablet/.test(userAgent)) {
        return 'pad'
    } else if (/mac|windows|linux|x11/.test(userAgent)) {
        return 'desktop'
    }
    return 'unknown'
}

/**
 * @description 获取设备类型，判定是否是移动端
 * @returns { DeviceType, boolean }
 */
export default function useDeviceType() {

    const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType)

    useEffect(() => {
        const handleResize = () => {
            let newDeviceType = getDeviceType()
            // 可选：通过分辨率修正
            if (window.innerWidth < 768 && newDeviceType === 'desktop') {
                newDeviceType = 'mobile'
            }
            setDeviceType(newDeviceType)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return {
        deviceType,
        isMobile: deviceType === 'mobile',
    }
}
