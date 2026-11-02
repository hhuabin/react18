/**
 * @description 启动 Mock Service Worker
 *  如果首屏加载有请求，需要先启动 Mock Service Worker 再 createRoot
 *  该项目没有首屏加载请求，故 不处理
 */
export const enableMocking = async () => {
    if (import.meta.env.MODE === 'development') {
        const { worker } = await import('./browser')
        return worker.start({
            serviceWorker: {
                url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
            },
            // 没匹配到 handler 的请求正常放行，方便本地同时对接真实后端
            // msw 3.x 起这个选项叫 onUnhandledFrame （2.x 叫 onUnhandledRequest ）
            onUnhandledFrame: 'bypass',
        })
    } else {
        return true
    }
}
