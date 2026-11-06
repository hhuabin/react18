/**
 * @Author: bin
 * @Date: 2026-11-05 17:55:54
 * @LastEditors: bin
 * @LastEditTime: 2026-11-06 11:14:17
 */

export class GeolocationUnsupportedError extends Error {
    readonly code = 0

    constructor(message = '当前环境不支持浏览器定位') {
        super(message)
        this.name = 'GeolocationUnsupportedError'
    }
}

export type GeolocationError = GeolocationPositionError | GeolocationUnsupportedError

/**
 * 坐标类型：
 * - wgs84：浏览器原始坐标（GPS 标准坐标）
 * - gcj02：火星坐标系，国内地图（高德/腾讯/百度 bmap-wx 的 gcj02ll）使用
 */
export type GeolocationCoordinateType = 'wgs84' | 'gcj02'

export type GeolocationSuccessCallback = (position: GeolocationPosition) => void
export type GeolocationErrorCallback = (error: GeolocationError) => void

/** 当前运行环境是否支持 Geolocation API。 */
export const isGeolocationSupported = () => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

/**
 * @description 查询定位权限状态（Permissions API，部分浏览器不支持，返回 null）
 * @returns 'granted' | 'denied' | 'prompt' | null
 */
export const queryGeolocationPermission = async (): Promise<PermissionState | null> => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) return null
    try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        return status.state
    } catch {
        // Safari 等不支持查询 geolocation 权限
        return null
    }
}

/**
 * @description 获取当前定位（Promise 封装，默认返回 WGS84 坐标）
 * @param options PositionOptions，默认 timeout 10s
 */
export const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!isGeolocationSupported()) {
            reject(new GeolocationUnsupportedError())
            return
        }
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: false,     // true 更精确但更慢、更耗电
                timeout: 10_000,
                maximumAge: 60_000,             // 允许使用 1 分钟内的缓存定位结果
                ...options,
            },
        )
    })
}

/** 只获取当前定位的坐标信息。 */
export const getCurrentCoordinates = async (options?: PositionOptions) => {
    const position = await getCurrentPosition(options)
    return position.coords
}

/**
 * 持续监听位置变化。
 * @returns 停止监听的函数
 */
export const watchPosition = (
    onSuccess: GeolocationSuccessCallback,
    onError?: GeolocationErrorCallback,
    options?: PositionOptions,
) => {
    if (!isGeolocationSupported()) {
        throw new GeolocationUnsupportedError()
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options)

    return () => {
        navigator.geolocation.clearWatch(watchId)
    }
}

/** 定位错误码转中文提示 */
export const geolocationErrorMessage = (error: GeolocationPositionError | Error): string => {
    if (error instanceof GeolocationUnsupportedError) return error.message
    if (!('code' in error)) return error.message || '定位失败'
    switch (error.code) {
        case 1: // PERMISSION_DENIED
            return '定位权限被拒绝，请在浏览器设置中允许定位'
        case 2: // POSITION_UNAVAILABLE
            return '位置信息不可用，请检查设备定位服务'
        case 3: // TIMEOUT
            return '定位超时，请重试'
        default:
            return '定位失败'
    }
}


/* ---------------- WGS84 -> GCJ02 坐标转换 ----------------
 * 浏览器 navigator.geolocation 返回的是 WGS84 坐标，
 * 百度/高德等国内地图使用 GCJ02（火星坐标系），直接展示会有偏移。
 */

const PI = Math.PI
const A = 6378245.0 // 长半轴
const EE = 0.006693421622965943 // 偏心率平方

/**
 * 计算经度方向的坐标偏移量。
 * @param x 经度相对基准点（105°E）的差值
 * @param y 纬度相对基准点（35°N）的差值
 * @returns GCJ02 转换公式中的经度偏移量
 */
const transformLng = (x: number, y: number): number => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0
    ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0
    return ret
}

/**
 * 计算纬度方向的坐标偏移量。
 * @param x 经度相对基准点（105°E）的差值
 * @param y 纬度相对基准点（35°N）的差值
 * @returns GCJ02 转换公式中的纬度偏移量
 */
const transformLat = (x: number, y: number): number => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
    ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0
    ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320.0 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0
    return ret
}

/** 是否在中国大陆范围外（境外不做偏移） */
export const isOutOfChina = (lng: number, lat: number): boolean => {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}


/**
 * @description WGS84 坐标转 GCJ02（火星坐标系）
 * @returns [经度, 纬度]
 */
export const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
    if (isOutOfChina(lng, lat)) return [lng, lat]
    let dLat = transformLat(lng - 105.0, lat - 35.0)
    let dLng = transformLng(lng - 105.0, lat - 35.0)
    const radLat = (lat / 180.0) * PI
    let magic = Math.sin(radLat)
    magic = 1 - EE * magic * magic
    const sqrtMagic = Math.sqrt(magic)
    dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI)
    dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI)
    return [lng + dLng, lat + dLat]
}
