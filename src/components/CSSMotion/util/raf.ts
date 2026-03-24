// SSR 兼容
let raf = (callback: FrameRequestCallback) => +setTimeout(callback, 16)
let caf = (num: number) => clearTimeout(num)

// 浏览器环境下，把 raf 置换成 requestAnimationFrame
if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    raf = (callback: FrameRequestCallback) => window.requestAnimationFrame(callback)

    caf = (handle: number) => window.cancelAnimationFrame(handle)
}

let rafUUID = 0

// 存储创建的 raf 任务 id
const rafIds = new Map<number, number>()

const cleanup = (id: number) => {
    rafIds.delete(id)
}

/**
 * @description 创建一个可跨多帧执行的 raf 任务（支持取消）
 * @param callback 回调函数，会在指定帧数后执行
 * @param times 延迟执行的帧数，times = 1 → callback 会在下一帧执行
 * @returns 返回一个逻辑任务 id，可通过 wrapperRaf.cancel(id) 取消该任务
 */
const wrapperRaf = (callback: () => void, times = 1): number => {
    rafUUID += 1
    const id = rafUUID

    const callRef = (leftTimes: number) => {
        if (leftTimes === 0) {
            // Clean up
            cleanup(id)

            // Trigger
            callback()
        } else {
            // Next raf
            const realId = raf(() => {
                callRef(leftTimes - 1)
            })
            // Bind real raf id
            rafIds.set(id, realId)
        }
    }

    callRef(times)

    return id
}

wrapperRaf.cancel = (id: number) => {
    const realId = rafIds.get(id)
    cleanup(id)
    realId !== undefined && caf(realId)
}

if (process.env.NODE_ENV !== 'production') {
    wrapperRaf.ids = () => rafIds
}

export default wrapperRaf
