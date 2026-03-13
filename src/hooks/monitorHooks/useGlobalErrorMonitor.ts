/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @Author: bin
 * @Date: 2026-03-13 16:06:36
 * @LastEditors: bin
 * @LastEditTime: 2026-03-13 18:20:38
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

const report = (type: string, data: any) => {
    console.warn('[useGlobalErrorMonitor]', type, data)

    // 真实项目一般会发送到监控平台
    // fetch('/monitor', {
    //   method: 'POST',
    //   body: JSON.stringify({ type, data })
    // })
}

const isChunkLoadError = (error: unknown): boolean => {
    if (!error) return false
    if (error instanceof Error) {
        return error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')
    }
    if (typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        return (error as any).message.includes('Loading chunk') || (error as any).message.includes('ChunkLoadError')
    }
    return false
}

// 判断资源加载错误，并返回资源信息
const isResourceError = (event: ErrorEvent) => {
    // 资源加载错误：target 指向 link/script/img 等}
    const target = event.target as HTMLElement | null
    if (!target) return false

    const resourceTags = ['SCRIPT', 'LINK', 'IMG']
    if (resourceTags.includes(target.tagName)) {
        return {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href || '',
        }
    }

    return false
}

/**
 * @description 错误处理
 * 还未完善，如需使用，请适当完善内容
 */
export default function useGlobalErrorMonitor() {
    if (!isBrowser) return
    if (initialized) return
    initialized = true

    /**
     * @description JS Error / 资源加载错误
     */
    const errorHandler = (event: ErrorEvent) => {
        // console.log('event', event)
        const resource = isResourceError(event)

        if (isChunkLoadError(event.error || event)) {
            // JS 运行时错误
            report('JS_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
            })

            if (window.confirm('加载失败，是否重新加载？')) {
                window.location.reload()
            }
        } else if (resource) {
            // 资源加载错误
            report('RESOURCE_ERROR', resource)
        }
    }

    /**
     * @description Promise 未捕获异常（Promise没有catch）
     */
    const rejectionHandler = (event: PromiseRejectionEvent) => {
        report('PROMISE_ERROR', {
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
