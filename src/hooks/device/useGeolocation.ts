/**
 * @Author: bin
 * @Date: 2026-11-05 17:55:54
 * @LastEditors: bin
 * @LastEditTime: 2026-11-06 11:20:00
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
    GeolocationUnsupportedError,
    getCurrentCoordinates,
    geolocationErrorMessage,
    isGeolocationSupported,
    wgs84ToGcj02,
    watchPosition,
    type GeolocationCoordinateType,
    type GeolocationError,
} from '@/utils/browserUtils/geolocation'

export interface UseGeolocationOptions extends PositionOptions {
    /** 是否在 Hook 挂载后立即获取位置，默认 false。 */
    immediate?: boolean
    /** immediate 为 true 时，是否持续监听位置，默认 false。 */
    watch?: boolean
    /** 返回坐标的类型，默认 WGS84。 */
    coordinateType?: GeolocationCoordinateType
}

export interface GeolocationResult {
    /** 经度 */
    lng: number
    /** 纬度 */
    lat: number
    /** 精度（米） */
    accuracy: number
    /** 当前坐标所属坐标系 */
    coordinateType: GeolocationCoordinateType
    /** 浏览器原始坐标（始终为 WGS84），便于同时需要两种坐标系时使用 */
    raw: { lng: number; lat: number }
}

export interface UseGeolocationReturn {
    /** 最新坐标，未定位成功前为 null */
    position: GeolocationResult | null
    /** 是否正在定位 / 等待首次监听回调 */
    loading: boolean
    /** 原始错误对象 */
    error: GeolocationError | null
    /** 中文错误提示，可直接渲染 */
    errorMessage: string | null
    /** 是否正在持续监听 */
    isWatching: boolean
    /** 当前环境是否支持定位 */
    supported: boolean
    /** 手动定位一次（会触发浏览器授权弹窗） */
    locate: () => Promise<GeolocationResult | null>
    /** 开始持续监听位置变化 */
    startWatch: () => void
    /** 停止持续监听 */
    stopWatch: () => void
}

/**
 * @description 浏览器定位 Hook
 * @example
 * // 点击按钮定位一次，并返回 GCJ02 坐标
 * const { position, loading, errorMessage, locate } = useGeolocation({ coordinateType: 'gcj02' })
 *
 * @example
 * // 挂载后持续监听位置
 * useGeolocation({ immediate: true, watch: true, timeout: 5_000 })
 */
export default function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
    const {
        immediate = false,
        watch = false,
        coordinateType = 'wgs84',
        // navigator.geolocation.getCurrentPosition() 参数
        enableHighAccuracy = false,
        timeout = 10_000,
        maximumAge = 0,
    } = options

    const [position, setPosition] = useState<GeolocationResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<GeolocationError | null>(null)
    const [isWatching, setIsWatching] = useState(false)

    // 组件卸载后不再 setState，避免 React 警告
    const mountedRef = useRef(true)
    // 保存 watchPosition 返回的停止函数，便于手动停止与卸载清理
    const stopWatchRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
            stopWatchRef.current?.()
            stopWatchRef.current = null
        }
    }, [])

    /** 统一坐标系转换，watch 与单次定位共用 */
    const toResult = useCallback((coords: GeolocationCoordinates): GeolocationResult => {
        const { longitude, latitude, accuracy } = coords
        const [lng, lat] = coordinateType === 'gcj02'
            ? wgs84ToGcj02(longitude, latitude)
            : [longitude, latitude]
        return {
            lng,
            lat,
            accuracy,
            coordinateType,
            raw: { lng: longitude, lat: latitude },
        }
    }, [coordinateType])

    /** 停止监听（幂等） */
    const stopWatch = useCallback(() => {
        stopWatchRef.current?.()
        stopWatchRef.current = null
        if (mountedRef.current) setIsWatching(false)
    }, [])

    /** 手动定位一次 */
    const locate = useCallback(async (): Promise<GeolocationResult | null> => {
        if (!isGeolocationSupported()) {
            setError(new GeolocationUnsupportedError())
            return null
        }

        setLoading(true)
        setError(null)
        try {
            const coords = await getCurrentCoordinates({ enableHighAccuracy, timeout, maximumAge })
            const result = toResult(coords)
            if (mountedRef.current) setPosition(result)
            return result
        } catch (e) {
            if (mountedRef.current) setError(e as GeolocationError)
            return null
        } finally {
            if (mountedRef.current) setLoading(false)
        }
    }, [enableHighAccuracy, timeout, maximumAge, toResult])

    /** 开始监听 */
    const startWatch = useCallback(() => {
        // 先停掉上一次监听，避免 StrictMode 下重复监听
        stopWatch()

        if (!isGeolocationSupported()) {
            setError(new GeolocationUnsupportedError())
            return
        }

        setError(null)
        setLoading(true)
        try {
            stopWatchRef.current = watchPosition(
                pos => {
                    if (!mountedRef.current) return
                    setPosition(toResult(pos.coords))
                    setLoading(false)
                },
                err => {
                    if (!mountedRef.current) return
                    setError(err)
                    setLoading(false)
                },
                { enableHighAccuracy, timeout, maximumAge },
            )
            setIsWatching(true)
        } catch (e) {
            // watchPosition 在不支持的环境会直接抛错
            setError(e as GeolocationError)
            setLoading(false)
        }
    }, [enableHighAccuracy, timeout, maximumAge, stopWatch, toResult])

    // immediate：挂载后自动执行；开启 watch 时监听，否则只取一次
    useEffect(() => {
        if (!immediate) return
        if (watch) {
            startWatch()
            return stopWatch
        }
        void locate()
    }, [immediate, watch, locate, startWatch, stopWatch])

    return {
        position,
        loading,
        error,
        errorMessage: error ? geolocationErrorMessage(error) : null,
        isWatching,
        supported: isGeolocationSupported(),
        locate,
        startWatch,
        stopWatch,
    }
}
