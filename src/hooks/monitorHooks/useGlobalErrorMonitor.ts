/**
 * @Author: bin
 * @Date: 2026-03-13 16:06:36
 * @LastEditors: bin
 * @LastEditTime: 2026-03-13 17:42:40
 */
// 初始化判断
let initialized = false

const isBrowser = typeof window !== 'undefined'

const canUseDom = () => !!(
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.document &&
    window.document.createElement
)


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const report = (type: string, data: any) => {
    console.warn('[useGlobalErrorMonitor]', type, data)

    // 真实项目一般会发送到监控平台
    // fetch('/monitor', {
    //   method: 'POST',
    //   body: JSON.stringify({ type, data })
    // })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isChunkLoadError = (error: any) => {
    const msg = error?.message || ''
    return msg.includes('Loading chunk') || msg.includes('ChunkLoadError')
}

export default function useGlobalErrorMonitor() {
    if (!isBrowser) return
    if (initialized) return
    initialized = true

    /**
     * @description JS Error / 资源加载错误
     */
    const errorHandler = (event: ErrorEvent) => {
        // JS 运行时错误
        report('js_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        })

        if (isChunkLoadError(event.error || event)) {
            console.warn('chunk load failed, reload')
            if (window.confirm('加载失败，是否重新加载？')) {
                window.location.reload()
            }
        }
    }

    /**
     * @description Promise 未捕获异常（Promise没有catch）
     */
    const rejectionHandler = (event: PromiseRejectionEvent) => {
        report('promise_error', {
            reason: event.reason,
        })

        if (isChunkLoadError(event.reason)) {
            console.warn('chunk load failed, reload')
            if (window.confirm('加载失败，是否重新加载？')) {
                window.location.reload()
            }
        }
    }

    window.addEventListener('error', errorHandler, true)
    window.addEventListener('unhandledrejection', rejectionHandler)

    /**
     * @description 白屏检测：判断有没有root元素，且root元素下没有子元素
     */
    const checkWhiteScreen = () => {
        if (!canUseDom()) return
        const root = document.getElementById('root')

        if (!root || root.children.length === 0) {
            report('white_screen', {
                url: window.location.href,
                userAgent: window.navigator.userAgent,
            })
        }
    }

    // 白屏判定时间 10s
    const whiteScreenTimer = setTimeout(checkWhiteScreen, 10000)

    const removeAll = () => {
        window.removeEventListener('error', errorHandler, true)
        window.removeEventListener('unhandledrejection', rejectionHandler)
        clearTimeout(whiteScreenTimer)
        initialized = false
    }

    // 返回清理函数（可选）
    return removeAll
}
