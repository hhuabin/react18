/**
 * @Author: bin
 * @Date: 2025-10-24 11:46:46
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:50:42
 */
import { useState, useEffect } from 'react'

export type OSType = 'windows' | 'macos' | 'ipados' | 'ios' | 'android' | 'linux' | 'unknown'

interface NavigatorUAData {
    brands: { brand: string; version: string }[];
    mobile: boolean;
    platform: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getHighEntropyValues?: (hints: string[]) => Promise<Record<string, any>>;
}
declare global {
    interface Navigator {
        userAgentData?: NavigatorUAData;
    }
}


interface OSInfo {
    osType: OSType;
    isTouchDevice: boolean;
    isMobile: boolean;
}

/**
 * @description 检测系统类型（SSR 安全）
 */
const detectOS = (): OSInfo => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return { osType: 'unknown', isTouchDevice: false, isMobile: false }
    }

    const userAgentData = window.navigator.userAgentData
    const userAgent = window.navigator.userAgent.toLowerCase()

    // navigator.maxTouchPoints：设备支持的最大触摸点数量
    const maxTouchPoints = typeof window.navigator !== 'undefined' ? window.navigator.maxTouchPoints || 0 : 0
    const isTouchDevice = maxTouchPoints > 0     // 触控屏设备
    const isMobile = userAgentData?.mobile ?? /iphone|ipad|ipod|android/.test(userAgent)

    let osType: OSType = 'unknown'

    // ✅ 优先使用新标准 userAgentData
    if (userAgentData?.platform) {
        const platform = userAgentData.platform.toLowerCase()

        if (platform.includes('win')) osType = 'windows'
        else if (platform.includes('mac')) osType = isTouchDevice ? 'ipados' : 'macos'
        else if (platform.includes('android')) osType = 'android'
        else if (platform.includes('ios')) osType = 'ios'
        else if (platform.includes('linux')) osType = 'linux'
    } else {
        // 回退 UA 判断
        if (/windows/.test(userAgent)) osType = 'windows'
        else if (/ipad/.test(userAgent)) osType = 'ipados'
        else if (/iphone|ipod/.test(userAgent)) osType = 'ios'
        // iPadOS 13+ 把 UA 伪装成 macOS，需要额外判断触屏
        else if (/mac/.test(userAgent)) osType = isTouchDevice ? 'ipados' : 'macos'
        else if (/android/.test(userAgent)) osType = 'android'
        else if (/linux/.test(userAgent)) osType = 'linux'
    }

    return {
        osType,
        isTouchDevice,
        isMobile,
    }
}

/**
 * @description 获取系统信息 Hook
 * @returns { OSInfo }
 */
export default function useOSInfo() {
    const [osInfo, setOsInfo] = useState<OSInfo>(detectOS)

    useEffect(() => {
        // ✅ 触屏设备监听屏幕旋转，非触屏设备不监听
        if (!osInfo.isTouchDevice || typeof window === 'undefined') return

        const handleUpdate = () => setOsInfo(detectOS())

        // 监听屏幕旋转
        window.addEventListener('orientationchange', handleUpdate)

        return () => {
            window.removeEventListener('orientationchange', handleUpdate)
        }
    }, [osInfo.isTouchDevice])

    return osInfo
}
