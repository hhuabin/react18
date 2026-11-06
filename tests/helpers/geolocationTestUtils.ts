/**
 * useGeolocation 系列测试的公共工具：
 * 伪 GeolocationPosition / 错误构造、navigator.geolocation 注入、Hook 渲染器
 */
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import useGeolocation, {
    type UseGeolocationOptions,
    type UseGeolocationReturn,
} from '@/hooks/device/useGeolocation'

// React 18.3 的 act 需要该标记，否则会输出警告
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

export type SuccessCallback = (position: GeolocationPosition) => void
export type ErrorCallback = (error: GeolocationPositionError) => void

export const WGS84_BEIJING = { longitude: 116.397428, latitude: 39.90923 }

/** 构造伪 GeolocationPosition */
export const createPosition = (coords: Partial<GeolocationCoordinates> = {}): GeolocationPosition => ({
    coords: {
        ...WGS84_BEIJING,
        accuracy: 20,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        ...coords,
    } as GeolocationCoordinates,
    timestamp: 1_700_000_000_000,
})

/** 构造伪 GeolocationPositionError */
export const createPositionError = (code: number, message = 'error'): GeolocationPositionError => ({
    code,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
})

export interface GeolocationMock {
    getCurrentPosition: jest.Mock
    watchPosition: jest.Mock
    clearWatch: jest.Mock
}

/** 注入 navigator.geolocation，返回可断言的 mock 集合 */
export const installGeolocationMock = (): GeolocationMock => {
    const mock: GeolocationMock = {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(() => 1),
        clearWatch: jest.fn(),
    }

    Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: mock,
    })

    return mock
}

/** 移除 navigator.geolocation，模拟不支持定位的环境 */
export const removeGeolocationMock = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).geolocation
}

/** 挂载 Hook，返回最新一次渲染的结果 */
export const renderUseGeolocation = (options?: UseGeolocationOptions) => {
    const container = document.createElement('div')
    const root = createRoot(container)
    let current!: UseGeolocationReturn

    const Test = ({ opts }: { opts?: UseGeolocationOptions }) => {
        current = useGeolocation(opts)
        return null
    }

    act(() => {
        root.render(React.createElement(Test, { opts: options }))
    })

    return {
        get result() {
            return current
        },
        rerender: (opts?: UseGeolocationOptions) => {
            act(() => {
                root.render(React.createElement(Test, { opts }))
            })
        },
        /** 等待异步 setState（locate / watch 回调）落地 */
        flush: () => act(async () => {}),
        unmount: () => {
            act(() => {
                root.unmount()
            })
        },
    }
}
