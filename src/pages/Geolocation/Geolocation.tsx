/**
 * @Author: bin
 * @Date: 2026-11-06 11:35:00
 * @Description: 浏览器定位调试页，用于验证 useGeolocation / WGS84 与 GCJ02 坐标差异
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import useGeolocation, { type GeolocationResult } from '@/hooks/device/useGeolocation'
import {
    isGeolocationSupported,
    queryGeolocationPermission,
    wgs84ToGcj02,
    type GeolocationCoordinateType,
} from '@/utils/browserUtils/geolocation'

interface LogItem {
    id: string
    time: string
    text: string
}

const PERMISSION_TEXT: Record<string, string> = {
    granted: '已授权',
    denied: '已拒绝（需到浏览器站点设置里重新允许）',
    prompt: '未询问（首次定位会弹窗）',
}

const formatTime = (date = new Date()) => date.toLocaleTimeString('zh-CN', { hour12: false })

const cardClass = 'p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)]'

const GeolocationPage: React.FC = () => {
    const [coordinateType, setCoordinateType] = useState<GeolocationCoordinateType>('gcj02')
    const [highAccuracy, setHighAccuracy] = useState(false)
    // undefined：查询中；null：浏览器不支持查询
    const [permission, setPermission] = useState<PermissionState | null | undefined>(undefined)
    const [logs, setLogs] = useState<LogItem[]>([])

    const { position, loading, error, errorMessage, isWatching, locate, startWatch, stopWatch } =
        useGeolocation({
            coordinateType,
            enableHighAccuracy: highAccuracy,
            timeout: 10_000,
            maximumAge: 10_000,
        })

    const appendLog = useCallback((text: string) => {
        setLogs(prev => [
            { id: `${Date.now()}-${prev.length}`, time: formatTime(), text },
            ...prev,
        ].slice(0, 12))
    }, [])

    const refreshPermission = useCallback(async () => {
        setPermission(await queryGeolocationPermission())
    }, [])

    useEffect(() => {
        void refreshPermission()
    }, [refreshPermission])

    // 坐标变化（含 watch 持续更新）写日志
    useEffect(() => {
        if (!position) return
        appendLog(
            `定位成功 ${position.lng.toFixed(6)}, ${position.lat.toFixed(6)}` +
            `（${position.coordinateType.toUpperCase()}）精度 ${Math.round(position.accuracy)}m`,
        )
    }, [position, appendLog])

    useEffect(() => {
        if (!errorMessage) return
        appendLog(`定位失败：${errorMessage}`)
    }, [errorMessage, appendLog])

    const handleLocate = async () => {
        await locate()
        void refreshPermission()
    }

    const handleToggleWatch = () => {
        if (isWatching) {
            stopWatch()
            appendLog('已停止监听')
            return
        }
        startWatch()
        appendLog('开始持续监听')
    }

    /** 用 GCJ02 坐标生成高德地图标记链接（WGS84 会先转换） */
    const mapLink = useMemo(() => {
        if (!position) return null
        const [lng, lat] = position.coordinateType === 'gcj02'
            ? [position.lng, position.lat]
            : wgs84ToGcj02(position.lng, position.lat)
        return `https://uri.amap.com/marker?position=${lng.toFixed(6)},${lat.toFixed(6)}&name=我的位置&coordinate=gaode&callnative=1`
    }, [position])

    /** 同时展示两种坐标系，直观看到偏移量 */
    const compare = useMemo(() => {
        if (!position) return null
        const [gcjLng, gcjLat] = position.coordinateType === 'gcj02'
            ? [position.lng, position.lat]
            : wgs84ToGcj02(position.lng, position.lat)
        return {
            wgs: [position.raw.lng, position.raw.lat] as [number, number],
            gcj: [gcjLng, gcjLat] as [number, number],
            offset: [gcjLng - position.raw.lng, gcjLat - position.raw.lat] as [number, number],
        }
    }, [position])

    const supported = isGeolocationSupported()
    const permissionText = permission === undefined
        ? '查询中…'
        : permission === null
            ? '该浏览器不支持查询（不影响定位）'
            : PERMISSION_TEXT[permission]

    return (
        <div className='w-full min-h-full p-6 text-[var(--text-primary)] text-[16px] leading-[24px]'>
            <h1 className='text-[20px] leading-[28px]'>浏览器定位调试</h1>
            <p className='mt-1 opacity-70'>
                每次定位都是浏览器真实调用，需要 HTTPS 或 localhost 环境。国内地图展示请用 GCJ02 坐标。
            </p>

            <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div className={cardClass}>
                    <div className='mb-2 opacity-60'>环境</div>
                    <div className='flex justify-between'><span>Geolocation</span><span className={supported ? 'text-emerald-600' : 'text-red-500'}>{supported ? '支持' : '不支持'}</span></div>
                    <div className='flex justify-between'><span>安全上下文</span><span className={window.isSecureContext ? 'text-emerald-600' : 'text-red-500'}>{window.isSecureContext ? '是' : '否（http 下定位会失败）'}</span></div>
                    <div className='flex justify-between'><span>权限状态</span><span className={permission === 'denied' ? 'text-red-500' : ''}>{permissionText}</span></div>
                    <button
                        type='button'
                        className='mt-2 px-3 border border-[var(--border-default)] rounded-md hover:text-[var(--color-primary-hover)] leading-[30px]'
                        onClick={() => void refreshPermission()}
                    >
                        刷新权限状态
                    </button>
                </div>

                <div className={cardClass}>
                    <div className='mb-2 opacity-60'>参数</div>
                    <div className='flex items-center gap-2'>
                        <span>坐标类型</span>
                        {(['wgs84', 'gcj02'] as GeolocationCoordinateType[]).map(type => (
                            <button
                                key={type}
                                type='button'
                                className={`px-3 leading-[28px] rounded-md border ${coordinateType === type
                                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'border-[var(--border-default)]'}`}
                                onClick={() => setCoordinateType(type)}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <label className='mt-2 flex items-center gap-2 select-none'>
                        <input type='checkbox' checked={highAccuracy} onChange={e => setHighAccuracy(e.target.checked)} />
                        <span>高精度（enableHighAccuracy）</span>
                    </label>
                    <div className='mt-1 opacity-60 text-[14px] leading-[20px]'>定位超时 10s，缓存有效期 10s</div>
                </div>

                <div className={cardClass}>
                    <div className='mb-2 opacity-60'>操作</div>
                    <div className='flex flex-wrap gap-2'>
                        <button
                            type='button'
                            className='px-4 rounded-md text-[#FFF] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] leading-[34px] disabled:opacity-50'
                            disabled={loading || !supported}
                            onClick={() => void handleLocate()}
                        >
                            {loading ? '定位中…' : '定位一次'}
                        </button>
                        <button
                            type='button'
                            className='px-4 rounded-md border border-[var(--border-default)] hover:text-[var(--color-primary-hover)] leading-[32px] disabled:opacity-50'
                            disabled={!supported}
                            onClick={handleToggleWatch}
                        >
                            {isWatching ? '停止监听' : '持续监听'}
                        </button>
                        {isWatching && <span className='text-[14px] leading-[34px] text-emerald-600'>监听中…</span>}
                    </div>
                    {errorMessage && <div className='mt-2 text-[14px] leading-[20px] text-red-500'>{errorMessage}{error?.code !== undefined ? `（code ${error.code}）` : ''}</div>}
                </div>
            </div>

            <div className='mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3'>
                <ResultCard position={position} />
                <div className={cardClass}>
                    <div className='mb-2 opacity-60'>坐标系对比</div>
                    {compare ? (
                        <div className='font-mono text-[14px] leading-[24px]'>
                            <div className='opacity-70'>WGS84：{compare.wgs[0].toFixed(6)}, {compare.wgs[1].toFixed(6)}</div>
                            <div>GCJ02：{compare.gcj[0].toFixed(6)}, {compare.gcj[1].toFixed(6)}</div>
                            <div className='opacity-70'>
                                偏移：{compare.offset[0].toFixed(6)}, {compare.offset[1].toFixed(6)}
                                （约 {Math.round(Math.hypot(compare.offset[0] * 85_000, compare.offset[1] * 111_000))} 米）
                            </div>
                        </div>
                    ) : <div className='opacity-60'>先定位一次</div>}
                    {mapLink && (
                        <a
                            className='inline-block mt-3 px-3 rounded-md border border-[var(--border-default)] hover:text-[var(--color-primary-hover)] leading-[30px]'
                            href={mapLink}
                            target='_blank'
                            rel='noreferrer'
                        >
                            在高德地图打开（GCJ02）
                        </a>
                    )}
                </div>
            </div>

            <div className={`mt-3 ${cardClass}`}>
                <div className='mb-2 flex items-center justify-between'>
                    <span className='opacity-60'>事件日志</span>
                    <button type='button' className='text-[14px] opacity-60 hover:opacity-100' onClick={() => setLogs([])}>清空</button>
                </div>
                {logs.length === 0 ? (
                    <div className='opacity-60'>暂无记录</div>
                ) : (
                    <ul className='font-mono text-[14px] leading-[24px]'>
                        {logs.map(item => (
                            <li key={item.id} className='flex gap-3'>
                                <span className='opacity-50'>{item.time}</span>
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

const ResultCard: React.FC<{ position: GeolocationResult | null }> = ({ position }) => (
    <div className={cardClass}>
        <div className='mb-2 flex items-center justify-between'>
            <span className='opacity-60'>定位结果</span>
            {position && (
                <span className='px-2 rounded text-[12px] leading-[20px] bg-[var(--fill-default)]'>
                    {position.coordinateType.toUpperCase()}
                </span>
            )}
        </div>
        {position ? (
            <>
                <div className='font-mono text-[24px] leading-[34px]'>{position.lng.toFixed(6)}</div>
                <div className='font-mono text-[24px] leading-[34px]'>{position.lat.toFixed(6)}</div>
                <div className='mt-1 opacity-70 text-[14px]'>精度约 {Math.round(position.accuracy)} 米</div>
            </>
        ) : <div className='opacity-60'>暂无坐标，点击「定位一次」</div>}
    </div>
)

export default GeolocationPage
