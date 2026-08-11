import useAppBridge from '@/hooks/bridge/useAppBridge'
import type {
    AppBridgeResponse,
    AppBridgeWindow,
} from '@/hooks/bridge/types/appBridge'

const mockUseCallback = jest.fn()
const mockGetAppPlatform = jest.fn()

jest.mock('react', () => {
    const actual = jest.requireActual('react')

    return {
        ...actual,
        useCallback: (...args: unknown[]) => mockUseCallback(...args),
    }
})

jest.mock('@/hooks/device/useRuntimeEnv', () => ({
    getAppPlatform: () => mockGetAppPlatform(),
}))

const setWindow = (value: Partial<AppBridgeWindow>) => {
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value,
        writable: true,
    })
}

describe('useAppBridge', () => {
    beforeEach(() => {
        mockUseCallback.mockImplementation(callback => callback)
        mockGetAppPlatform.mockReset()
        setWindow({})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('rejects outside App WebView', async () => {
        mockGetAppPlatform.mockReturnValue(null)

        const { safeCallAppBridge } = useAppBridge()

        await expect(safeCallAppBridge({ action: 'test' }))
        .rejects.toThrow('当前不是 App WebView 环境')
    })

    test('Android one-way call resolves without returning the Native result', async () => {
        const nativeMethod = jest.fn(() => 'native-result')
        mockGetAppPlatform.mockReturnValue('android')
        setWindow({ AppBridge: { showToast: nativeMethod } })

        const { safeCallAppBridge } = useAppBridge()
        const result = await safeCallAppBridge({
            action: 'showToast',
            data: { message: '保存成功' },
        })

        expect(nativeMethod).toHaveBeenCalledWith(JSON.stringify({ message: '保存成功' }))
        expect(result).toBeUndefined()
    })

    test('Android returns the Native result when needResult is true', async () => {
        const nativeMethod = jest.fn(() => 'token-123')
        mockGetAppPlatform.mockReturnValue('android')
        setWindow({ AppBridge: { getToken: nativeMethod } })

        const { safeCallAppBridge } = useAppBridge()

        await expect(safeCallAppBridge({
            action: 'getToken',
            needResult: true,
        })).resolves.toBe('token-123')
        expect(nativeMethod).toHaveBeenCalledWith()
    })

    test('iOS one-way call resolves immediately without callback fields', async () => {
        const postMessage = jest.fn()
        mockGetAppPlatform.mockReturnValue('ios')
        setWindow({ webkit: { messageHandlers: { AppBridge: { postMessage } } } })

        const { safeCallAppBridge } = useAppBridge()

        await expect(safeCallAppBridge({
            action: 'showToast',
            data: { message: '保存成功' },
        })).resolves.toBeUndefined()
        expect(postMessage).toHaveBeenCalledWith({
            action: 'showToast',
            data: { message: '保存成功' },
        })
    })

    test('iOS resolves the matching Promise through the Native callback', async () => {
        const postMessage = jest.fn()
        mockGetAppPlatform.mockReturnValue('ios')
        setWindow({ webkit: { messageHandlers: { AppBridge: { postMessage } } } })

        const { safeCallAppBridge } = useAppBridge()
        const resultPromise = safeCallAppBridge({
            action: 'getToken',
            data: {},
            needResult: true,
        })
        const message = postMessage.mock.calls[0][0]
        const callback = (window as AppBridgeWindow).__APP_BRIDGE_CALLBACK__

        expect(message.callbackName).toBe('__APP_BRIDGE_CALLBACK__')
        expect(typeof message.promiseId).toBe('string')

        callback?.({
            promiseId: message.promiseId,
            success: true,
            data: 'token-123',
        })

        await expect(resultPromise).resolves.toBe('token-123')
    })

    test('iOS rejects when Native returns an error', async () => {
        const postMessage = jest.fn()
        mockGetAppPlatform.mockReturnValue('ios')
        setWindow({ webkit: { messageHandlers: { AppBridge: { postMessage } } } })

        const { safeCallAppBridge } = useAppBridge()
        const resultPromise = safeCallAppBridge({
            action: 'getToken',
            needResult: true,
        })
        const message = postMessage.mock.calls[0][0]
        const callback = (window as AppBridgeWindow).__APP_BRIDGE_CALLBACK__ as (
            response: AppBridgeResponse,
        ) => void

        callback({
            promiseId: message.promiseId,
            success: false,
            error: '获取 Token 失败',
        })

        await expect(resultPromise).rejects.toThrow('获取 Token 失败')
    })

    test('rejects when the platform Bridge does not exist', async () => {
        mockGetAppPlatform.mockReturnValue('ios')

        const { safeCallAppBridge } = useAppBridge()

        await expect(safeCallAppBridge({ action: 'test' }))
        .rejects.toThrow('iOS AppBridge 不存在')
    })
})
