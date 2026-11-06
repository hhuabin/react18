/**
 * @jest-environment jsdom
 */
import { act } from 'react'
import { GeolocationUnsupportedError } from '@/utils/browserUtils/geolocation'
import {
    WGS84_BEIJING,
    createPosition,
    createPositionError,
    installGeolocationMock,
    removeGeolocationMock,
    renderUseGeolocation,
    type ErrorCallback,
    type GeolocationMock,
    type SuccessCallback,
} from '../../helpers/geolocationTestUtils'

describe('useGeolocation watch', () => {
    let geo: GeolocationMock

    beforeEach(() => {
        geo = installGeolocationMock()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('starts watching on mount and updates the position from callbacks', () => {
        const harness = renderUseGeolocation({ immediate: true, watch: true })

        expect(geo.watchPosition).toHaveBeenCalledTimes(1)
        expect(harness.result.isWatching).toBe(true)
        expect(harness.result.loading).toBe(true)

        const onSuccess = geo.watchPosition.mock.calls[0][0] as SuccessCallback
        act(() => {
            onSuccess(createPosition({ accuracy: 8 }))
        })

        expect(harness.result.position).toEqual({
            lng: WGS84_BEIJING.longitude,
            lat: WGS84_BEIJING.latitude,
            accuracy: 8,
            coordinateType: 'wgs84',
            raw: { lng: WGS84_BEIJING.longitude, lat: WGS84_BEIJING.latitude },
        })
        expect(harness.result.loading).toBe(false)
    })

    test('passes the position options through to watchPosition', () => {
        renderUseGeolocation({ immediate: true, watch: true, enableHighAccuracy: true, timeout: 4_000 })

        expect(geo.watchPosition.mock.calls[0][2]).toEqual({
            enableHighAccuracy: true,
            timeout: 4_000,
            maximumAge: 0,
        })
    })

    test('converts watch results to GCJ02', () => {
        const harness = renderUseGeolocation({ immediate: true, watch: true, coordinateType: 'gcj02' })

        const onSuccess = geo.watchPosition.mock.calls[0][0] as SuccessCallback
        act(() => {
            onSuccess(createPosition())
        })

        expect(harness.result.position?.coordinateType).toBe('gcj02')
        expect(harness.result.position?.lng).toBeCloseTo(116.40367, 4)
    })

    test('stops watching manually', () => {
        const harness = renderUseGeolocation({ immediate: true, watch: true })

        act(() => {
            harness.result.stopWatch()
        })

        expect(geo.clearWatch).toHaveBeenCalledWith(1)
        expect(harness.result.isWatching).toBe(false)
    })

    test('restarts instead of stacking when startWatch is called twice', () => {
        const harness = renderUseGeolocation()

        act(() => {
            harness.result.startWatch()
            harness.result.startWatch()
        })

        expect(geo.watchPosition).toHaveBeenCalledTimes(2)
        // 第二次 startWatch 会先停掉第一次的监听，不会叠加
        expect(geo.clearWatch).toHaveBeenCalledTimes(1)
        expect(geo.clearWatch).toHaveBeenCalledWith(1)
        expect(harness.result.isWatching).toBe(true)
    })

    test('reports watch errors with a Chinese message', () => {
        const harness = renderUseGeolocation()

        act(() => {
            harness.result.startWatch()
        })
        const onError = geo.watchPosition.mock.calls[0][1] as ErrorCallback
        act(() => {
            onError(createPositionError(2))
        })

        expect(harness.result.errorMessage).toBe('位置信息不可用，请检查设备定位服务')
        expect(harness.result.loading).toBe(false)
    })

    test('throws nothing but reports the error when the API is missing', () => {
        removeGeolocationMock()
        const harness = renderUseGeolocation()

        act(() => {
            harness.result.startWatch()
        })

        expect(harness.result.error).toBeInstanceOf(GeolocationUnsupportedError)
        expect(harness.result.isWatching).toBe(false)
    })

    test('reports the error when watchPosition throws synchronously', () => {
        geo.watchPosition.mockImplementation(() => {
            throw new GeolocationUnsupportedError()
        })
        const harness = renderUseGeolocation()

        act(() => {
            harness.result.startWatch()
        })

        expect(harness.result.error).toBeInstanceOf(GeolocationUnsupportedError)
        expect(harness.result.isWatching).toBe(false)
        expect(harness.result.loading).toBe(false)
    })

    test('ignores watch callbacks after unmount', () => {
        const harness = renderUseGeolocation({ immediate: true, watch: true })
        const onSuccess = geo.watchPosition.mock.calls[0][0] as SuccessCallback
        const onError = geo.watchPosition.mock.calls[0][1] as ErrorCallback

        harness.unmount()

        // 卸载后 Native 仍可能回调，此时不应再 setState 或抛错
        expect(() => {
            onSuccess(createPosition())
            onError(createPositionError(2))
        }).not.toThrow()
        expect(geo.clearWatch).toHaveBeenCalledWith(1)
    })

    test('clears the watch on unmount', () => {
        const harness = renderUseGeolocation({ immediate: true, watch: true })

        harness.unmount()

        expect(geo.clearWatch).toHaveBeenCalledWith(1)
    })
})
