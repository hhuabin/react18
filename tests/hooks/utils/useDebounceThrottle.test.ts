import * as hooksUtils from '@/hooks/utils'
import { useDebounce, useThrottle } from '@/hooks/utils/useDebounceThrottle'

type Cleanup = (() => void) | void

type MockRef<T> = { current: T }

type EffectRecord = {
    deps?: unknown[]
    cleanup?: Exclude<Cleanup, void>
}

type CallbackRecord<T> = {
    deps?: unknown[]
    value: T
}

const mockUseRef = jest.fn()
const mockUseEffect = jest.fn()
const mockUseCallback = jest.fn()

jest.mock('react', () => {
    const actual = jest.requireActual('react')

    return {
        ...actual,
        useRef: (...args: unknown[]) => mockUseRef(...args),
        useEffect: (...args: unknown[]) => mockUseEffect(...args),
        useCallback: (...args: unknown[]) => mockUseCallback(...args),
    }
})

const depsEqual = (prev?: unknown[], next?: unknown[]) => {
    if (prev === next) return true
    if (!prev || !next || prev.length !== next.length) return false

    return prev.every((item, index) => Object.is(item, next[index]))
}

const createHookRuntime = () => {
    const refs: Array<MockRef<unknown>> = []
    const effects: Array<EffectRecord | undefined> = []
    const callbacks: Array<CallbackRecord<unknown> | undefined> = []

    let refCursor = 0
    let effectCursor = 0
    let callbackCursor = 0
    let pendingEffects: Array<() => void> = []

    const prepareRender = () => {
        refCursor = 0
        effectCursor = 0
        callbackCursor = 0
        pendingEffects = []
    }

    const flushEffects = () => {
        const queue = pendingEffects
        pendingEffects = []
        queue.forEach(run => run())
    }

    const useRefMock = <T, >(initialValue: T) => {
        const currentIndex = refCursor++

        if (!refs[currentIndex]) refs[currentIndex] = { current: initialValue }

        return refs[currentIndex] as MockRef<T>
    }

    const useEffectMock = (effect: () => Cleanup, deps?: unknown[]) => {
        const currentIndex = effectCursor++
        const previous = effects[currentIndex]

        if (!previous || !depsEqual(previous.deps, deps)) {
            pendingEffects.push(() => {
                previous?.cleanup?.()

                const cleanup = effect()
                effects[currentIndex] = {
                    deps,
                    cleanup: typeof cleanup === 'function' ? cleanup : undefined,
                }
            })
        }
    }

    const useCallbackMock = <T, >(callback: T, deps?: unknown[]) => {
        const currentIndex = callbackCursor++
        const previous = callbacks[currentIndex]

        if (!previous || !depsEqual(previous.deps, deps)) {
            callbacks[currentIndex] = {
                deps,
                value: callback,
            }
        }

        return callbacks[currentIndex]!.value as T
    }

    const unmount = () => {
        effects.forEach(effect => effect?.cleanup?.())
    }

    return {
        flushEffects,
        prepareRender,
        unmount,
        useCallbackMock,
        useEffectMock,
        useRefMock,
    }
}

const createHookHarness = <TArgs extends unknown[], TResult>(hook: (...args: TArgs) => TResult, ...initialArgs: TArgs) => {
    const runtime = createHookRuntime()
    let latestResult: TResult

    mockUseRef.mockImplementation(runtime.useRefMock)
    mockUseEffect.mockImplementation(runtime.useEffectMock)
    mockUseCallback.mockImplementation(runtime.useCallbackMock)

    const render = (...args: TArgs) => {
        runtime.prepareRender()
        latestResult = hook(...args)
        runtime.flushEffects()

        return latestResult
    }

    render(...initialArgs)

    return {
        get result() {
            return latestResult
        },
        rerender: (...args: TArgs) => render(...args),
        unmount: runtime.unmount,
    }
}

describe('hooks/utils useDebounceThrottle exports', () => {
    test('index re-exports hook utilities', () => {
        expect(hooksUtils.useDebounce).toBe(useDebounce)
        expect(hooksUtils.useThrottle).toBe(useThrottle)
    })
})

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        mockUseRef.mockReset()
        mockUseEffect.mockReset()
        mockUseCallback.mockReset()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    test('invokes only the last call after the delay', () => {
        const callback = jest.fn()
        const harness = createHookHarness(useDebounce, callback, 100, false)
        const [debounce] = harness.result

        debounce('first')
        debounce('second')

        jest.advanceTimersByTime(99)
        expect(callback).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('second')
    })

    test('uses the latest callback after rerender', () => {
        const firstCallback = jest.fn()
        const nextCallback = jest.fn()
        const harness = createHookHarness(useDebounce, firstCallback, 100, false)

        harness.rerender(nextCallback, 100, false)

        const [debounce] = harness.result
        debounce('latest')
        jest.advanceTimersByTime(100)

        expect(firstCallback).not.toHaveBeenCalled()
        expect(nextCallback).toHaveBeenCalledTimes(1)
        expect(nextCallback).toHaveBeenCalledWith('latest')
    })

    test('cancel prevents a pending debounce callback from running', () => {
        const callback = jest.fn()
        const harness = createHookHarness(useDebounce, callback, 100, false)
        const [debounce, cancel] = harness.result

        debounce('value')
        cancel()
        jest.advanceTimersByTime(100)

        expect(callback).not.toHaveBeenCalled()
    })

    test('immediate mode runs once immediately and suppresses calls during the wait window', () => {
        const callback = jest.fn()
        const harness = createHookHarness(useDebounce, callback, 100, true)
        const [debounce] = harness.result

        debounce('first')
        debounce('second')
        jest.advanceTimersByTime(100)
        debounce('third')

        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenNthCalledWith(1, 'first')
        expect(callback).toHaveBeenNthCalledWith(2, 'third')
    })

    test('cleanup clears pending timers on unmount', () => {
        const callback = jest.fn()
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
        const harness = createHookHarness(useDebounce, callback, 100, false)
        const [debounce] = harness.result

        debounce('value')
        harness.unmount()
        jest.advanceTimersByTime(100)

        expect(clearTimeoutSpy).toHaveBeenCalled()
        expect(callback).not.toHaveBeenCalled()
    })
})

describe('useThrottle', () => {
    beforeEach(() => {
        mockUseRef.mockReset()
        mockUseEffect.mockReset()
        mockUseCallback.mockReset()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('calls immediately and ignores calls within the delay window', () => {
        const callback = jest.fn()
        const nowSpy = jest.spyOn(Date, 'now')
        const harness = createHookHarness(useThrottle, callback, 100)
        const throttle = harness.result

        nowSpy.mockReturnValueOnce(1000)
        throttle('first')

        nowSpy.mockReturnValueOnce(1050)
        throttle('second')

        nowSpy.mockReturnValueOnce(1100)
        throttle('third')

        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenNthCalledWith(1, 'first')
        expect(callback).toHaveBeenNthCalledWith(2, 'third')
    })

    test('uses the latest callback after rerender', () => {
        const firstCallback = jest.fn()
        const nextCallback = jest.fn()
        const nowSpy = jest.spyOn(Date, 'now')
        const harness = createHookHarness(useThrottle, firstCallback, 100)

        harness.rerender(nextCallback, 100)

        const throttle = harness.result
        nowSpy.mockReturnValueOnce(1000)
        throttle('latest')

        expect(firstCallback).not.toHaveBeenCalled()
        expect(nextCallback).toHaveBeenCalledTimes(1)
        expect(nextCallback).toHaveBeenCalledWith('latest')
    })
})
