import {
    GeolocationUnsupportedError,
    geolocationErrorMessage,
    getCurrentCoordinates,
    getCurrentPosition,
    isGeolocationSupported,
    isOutOfChina,
    queryGeolocationPermission,
    wgs84ToGcj02,
    watchPosition,
    type GeolocationError,
} from '@/utils/browserUtils/geolocation'

type SuccessCallback = (position: GeolocationPosition) => void
type ErrorCallback = (error: GeolocationPositionError) => void

/** 构造一个伪 GeolocationPosition */
const createPosition = (coords: Partial<GeolocationCoordinates> = {}): GeolocationPosition => ({
    coords: {
        latitude: 39.90923,
        longitude: 116.397428,
        accuracy: 20,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        ...coords,
    } as GeolocationCoordinates,
    timestamp: 1_700_000_000_000,
})

/** 构造一个伪 GeolocationPositionError */
const createPositionError = (code: number, message = 'error'): GeolocationPositionError => ({
    code,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
})

/** 覆写全局 navigator（node 环境默认没有 navigator.geolocation） */
const setNavigator = (value: unknown) => {
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value,
        writable: true,
    })
}

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

describe('browserUtils/geolocation', () => {
    afterEach(() => {
        jest.restoreAllMocks()
        if (originalNavigator) {
            Object.defineProperty(globalThis, 'navigator', originalNavigator)
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (globalThis as any).navigator
        }
    })

    describe('isGeolocationSupported', () => {
        test('returns false when navigator is unavailable', () => {
            setNavigator(undefined)
            expect(isGeolocationSupported()).toBe(false)
        })

        test('returns false when navigator has no geolocation', () => {
            setNavigator({})
            expect(isGeolocationSupported()).toBe(false)
        })

        test('returns true when navigator.geolocation exists', () => {
            setNavigator({ geolocation: {} })
            expect(isGeolocationSupported()).toBe(true)
        })
    })

    describe('queryGeolocationPermission', () => {
        test('returns permission state from Permissions API', async () => {
            const query = jest.fn().mockResolvedValue({ state: 'granted' })
            setNavigator({ geolocation: {}, permissions: { query } })

            await expect(queryGeolocationPermission()).resolves.toBe('granted')
            expect(query).toHaveBeenCalledWith({ name: 'geolocation' })
        })

        test('returns null when Permissions API is unavailable', async () => {
            setNavigator({ geolocation: {} })
            await expect(queryGeolocationPermission()).resolves.toBeNull()
        })

        test('returns null when the query throws (Safari 不支持查询定位权限)', async () => {
            setNavigator({ geolocation: {}, permissions: { query: jest.fn().mockRejectedValue(new Error('unsupported')) } })
            await expect(queryGeolocationPermission()).resolves.toBeNull()
        })
    })

    describe('getCurrentPosition', () => {
        test('rejects with GeolocationUnsupportedError when API is missing', async () => {
            setNavigator({})

            await expect(getCurrentPosition()).rejects.toBeInstanceOf(GeolocationUnsupportedError)
        })

        test('resolves with the browser position and passes default options', async () => {
            const position = createPosition()
            const getPosition = jest.fn((success: SuccessCallback) => success(position))
            setNavigator({ geolocation: { getCurrentPosition: getPosition } })

            await expect(getCurrentPosition()).resolves.toBe(position)
            expect(getPosition).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function),
                { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
            )
        })

        test('merges custom options over the defaults', async () => {
            const getPosition = jest.fn(
                (success: SuccessCallback, _fail?: ErrorCallback, _options?: PositionOptions) =>
                    success(createPosition()),
            )
            setNavigator({ geolocation: { getCurrentPosition: getPosition } })

            await getCurrentPosition({ enableHighAccuracy: true, timeout: 3_000 })

            expect(getPosition.mock.calls[0][2]).toEqual({
                enableHighAccuracy: true,
                timeout: 3_000,
                maximumAge: 60_000,
            })
        })

        test('rejects with the browser error when定位失败', async () => {
            const error = createPositionError(1)
            const getPosition = jest.fn((_success: SuccessCallback, fail: ErrorCallback) => fail(error))
            setNavigator({ geolocation: { getCurrentPosition: getPosition } })

            await expect(getCurrentPosition()).rejects.toBe(error)
        })
    })

    describe('getCurrentCoordinates', () => {
        test('returns only the coordinates', async () => {
            const position = createPosition({ accuracy: 35 })
            setNavigator({
                geolocation: { getCurrentPosition: (success: SuccessCallback) => success(position) },
            })

            await expect(getCurrentCoordinates()).resolves.toBe(position.coords)
        })

        test('propagates the unsupported error', async () => {
            setNavigator({})
            await expect(getCurrentCoordinates()).rejects.toBeInstanceOf(GeolocationUnsupportedError)
        })
    })

    describe('watchPosition', () => {
        test('returns a stop function that clears the watch', () => {
            const clearWatch = jest.fn()
            const watch = jest.fn(() => 42)
            setNavigator({ geolocation: { watchPosition: watch, clearWatch } })

            const stop = watchPosition(jest.fn(), jest.fn(), { timeout: 5_000 })

            expect(watch).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { timeout: 5_000 })

            stop()
            expect(clearWatch).toHaveBeenCalledWith(42)
        })

        test('throws GeolocationUnsupportedError when API is missing', () => {
            setNavigator({})
            expect(() => watchPosition(jest.fn())).toThrow(GeolocationUnsupportedError)
        })
    })

    describe('geolocationErrorMessage', () => {
        test('maps unsupported error to its own message', () => {
            expect(geolocationErrorMessage(new GeolocationUnsupportedError())).toBe('当前环境不支持浏览器定位')
        })

        test.each([
            [1, '定位权限被拒绝，请在浏览器设置中允许定位'],
            [2, '位置信息不可用，请检查设备定位服务'],
            [3, '定位超时，请重试'],
            [99, '定位失败'],
        ])('maps error code %i to a Chinese message', (code, expected) => {
            expect(geolocationErrorMessage(createPositionError(code))).toBe(expected)
        })

        test('falls back to the original message for a plain Error', () => {
            expect(geolocationErrorMessage(new Error('自定义错误'))).toBe('自定义错误')
            expect(geolocationErrorMessage(new Error(''))).toBe('定位失败')
        })
    })

    describe('wgs84ToGcj02', () => {
        test('converts a Beijing WGS84 point to the expected GCJ02 point', () => {
            const [lng, lat] = wgs84ToGcj02(116.397428, 39.90923)

            expect(lng).toBeCloseTo(116.40367, 4)
            expect(lat).toBeCloseTo(39.91063, 4)
        })

        test('offsets are within the plausible 100m ~ 1km range in China', () => {
            const lng = 114.057868
            const lat = 22.543099
            const [gcjLng, gcjLat] = wgs84ToGcj02(lng, lat)

            expect(gcjLng - lng).toBeGreaterThan(0.001)
            expect(gcjLng - lng).toBeLessThan(0.02)
            expect(gcjLat - lat).toBeGreaterThan(-0.02)
            expect(gcjLat - lat).toBeLessThan(0.001)
        })

        test('returns the original coordinates outside China', () => {
            expect(wgs84ToGcj02(-74.006, 40.7128)).toEqual([-74.006, 40.7128])
        })
    })

    describe('isOutOfChina', () => {
        test.each([
            [116.397428, 39.90923, false],
            [-74.006, 40.7128, true],
            [139.6917, 35.6895, true],
            [71, 30, true],
            [100, 60, true],
        ])('isOutOfChina(%f, %f) === %s', (lng, lat, expected) => {
            expect(isOutOfChina(lng, lat)).toBe(expected)
        })
    })
})

describe('GeolocationUnsupportedError', () => {
    test('carries code 0 and a default message', () => {
        const error: GeolocationError = new GeolocationUnsupportedError()

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('GeolocationUnsupportedError')
        expect(error.code).toBe(0)
        expect(error.message).toBe('当前环境不支持浏览器定位')
    })

    test('accepts a custom message', () => {
        expect(new GeolocationUnsupportedError('自定义').message).toBe('自定义')
    })
})
