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

describe('useGeolocation', () => {
    let geo: GeolocationMock

    beforeEach(() => {
        geo = installGeolocationMock()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('环境不支持', () => {
        test('marks unsupported and resolves locate with null', async () => {
            removeGeolocationMock()
            const harness = renderUseGeolocation()

            expect(harness.result.supported).toBe(false)

            let located: unknown
            await act(async () => {
                located = await harness.result.locate()
            })

            expect(located).toBeNull()
            expect(harness.result.error).toBeInstanceOf(GeolocationUnsupportedError)
            expect(harness.result.errorMessage).toBe('当前环境不支持浏览器定位')
            expect(harness.result.loading).toBe(false)
        })

        test('startWatch reports the unsupported error instead of throwing', () => {
            removeGeolocationMock()
            const harness = renderUseGeolocation()

            act(() => {
                harness.result.startWatch()
            })

            expect(harness.result.error).toBeInstanceOf(GeolocationUnsupportedError)
            expect(harness.result.isWatching).toBe(false)
        })
    })

    describe('locate', () => {
        test('resolves the raw WGS84 coordinate by default', async () => {
            geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation()

            let located: unknown
            await act(async () => {
                located = await harness.result.locate()
            })

            expect(located).toEqual({
                lng: WGS84_BEIJING.longitude,
                lat: WGS84_BEIJING.latitude,
                accuracy: 20,
                coordinateType: 'wgs84',
                raw: { lng: WGS84_BEIJING.longitude, lat: WGS84_BEIJING.latitude },
            })
            expect(harness.result.position).toEqual(located)
            expect(harness.result.error).toBeNull()
            expect(harness.result.loading).toBe(false)
        })

        test('converts to GCJ02 when coordinateType is gcj02', async () => {
            geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation({ coordinateType: 'gcj02' })

            await act(async () => {
                await harness.result.locate()
            })

            expect(harness.result.position?.coordinateType).toBe('gcj02')
            expect(harness.result.position?.lng).toBeCloseTo(116.40367, 4)
            expect(harness.result.position?.lat).toBeCloseTo(39.91063, 4)
            // 原始 WGS84 仍然保留，便于需要同时使用两种坐标系
            expect(harness.result.position?.raw).toEqual({
                lng: WGS84_BEIJING.longitude,
                lat: WGS84_BEIJING.latitude,
            })
        })

        test('passes the option values through to the browser API', async () => {
            geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation({
                enableHighAccuracy: true,
                timeout: 3_000,
                maximumAge: 1_000,
            })

            await act(async () => {
                await harness.result.locate()
            })

            expect(geo.getCurrentPosition.mock.calls[0][2]).toEqual({
                enableHighAccuracy: true,
                timeout: 3_000,
                maximumAge: 1_000,
            })
        })

        test('uses the hook defaults when no position options are given', async () => {
            geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation()

            await act(async () => {
                await harness.result.locate()
            })

            expect(geo.getCurrentPosition.mock.calls[0][2]).toEqual({
                enableHighAccuracy: false,
                timeout: 10_000,
                maximumAge: 0,
            })
        })

        test('exposes a Chinese error message when permission is denied', async () => {
            geo.getCurrentPosition.mockImplementation((_success: SuccessCallback, fail: ErrorCallback) =>
                fail(createPositionError(1, 'User denied Geolocation')),
            )
            const harness = renderUseGeolocation()

            await act(async () => {
                await harness.result.locate()
            })

            expect(harness.result.position).toBeNull()
            expect(harness.result.error?.code).toBe(1)
            expect(harness.result.errorMessage).toBe('定位权限被拒绝，请在浏览器设置中允许定位')
            expect(harness.result.loading).toBe(false)
        })

        test('clears a previous error on the next successful locate', async () => {
            geo.getCurrentPosition
                .mockImplementationOnce((_success: SuccessCallback, fail: ErrorCallback) =>
                    fail(createPositionError(3)),
                )
                .mockImplementationOnce((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation()

            await act(async () => {
                await harness.result.locate()
            })
            expect(harness.result.error?.code).toBe(3)

            await act(async () => {
                await harness.result.locate()
            })
            expect(harness.result.error).toBeNull()
            expect(harness.result.position).not.toBeNull()
        })
    })

    describe('immediate', () => {
        test('does not locate on mount by default', async () => {
            const harness = renderUseGeolocation()

            await harness.flush()

            expect(geo.getCurrentPosition).not.toHaveBeenCalled()
            expect(harness.result.loading).toBe(false)
        })

        test('locates once on mount when immediate is true', async () => {
            geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => success(createPosition()))
            const harness = renderUseGeolocation({ immediate: true })

            await harness.flush()

            expect(geo.getCurrentPosition).toHaveBeenCalledTimes(1)
            expect(harness.result.position?.lng).toBeCloseTo(WGS84_BEIJING.longitude, 6)
        })
    })

    test('does not update state when locate fails after unmount', async () => {
        let fail: ErrorCallback = () => {}
        geo.getCurrentPosition.mockImplementation((_success: SuccessCallback, error: ErrorCallback) => {
            fail = error
        })
        const harness = renderUseGeolocation()

        let pending: Promise<unknown>
        await act(async () => {
            pending = harness.result.locate()
        })

        harness.unmount()

        await act(async () => {
            fail(createPositionError(1))
            await expect(pending).resolves.toBeNull()
        })
    })

    test('does not update state after unmount', async () => {
        let finish: (position: GeolocationPosition) => void = () => {}
        geo.getCurrentPosition.mockImplementation((success: SuccessCallback) => {
            finish = success
        })
        const harness = renderUseGeolocation()

        let pending: Promise<unknown>
        await act(async () => {
            pending = harness.result.locate()
        })

        harness.unmount()

        // 卸载后回调触发：不应抛错，也不应再 setState
        await act(async () => {
            finish(createPosition())
            await pending
        })
    })
})
