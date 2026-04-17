/**
 * @Author: bin
 * @Date: 2025-08-07 09:16:05
 * @LastEditors: bin
 * @LastEditTime: 2025-11-13 14:24:47
 */
/**
 * @description 自定义history路由跳转方法
 * @example const router = useHistoryRouter()
 * @example router.push('/')
 */
export default function useHistoryRouter() {
    /**
     * @description 创建一个路由对象，并返回给外部使用
     * @tips 使用Hooks 闭包函数（IIFE），每次返回的都是同一个 router 对象
     * @extra 如需继续完善，建议增加useSreach()、useParams()等方法
     */
    const router = (() => {
        const push = (path: string, data: Record<string, unknown> | null = null) => {
            if (window.location.pathname === path) {
                // TODO 对比参数是否一致，一致则不进行跳转
                // 如若不对比参数，则建议将 data 拼接至 path，本示例仅作简单使用，如有需要请另写
                return
            }

            window.history.pushState(data, '', path)
            const popStateEvent = new PopStateEvent('popstate', { state: { path, data } })
            window.dispatchEvent(popStateEvent)
        }

        const replace = (path: string, data: Record<string, unknown> | null = null) => {
            if (window.location.pathname === path) {
                // TODO 对比参数是否一致，一致则不进行跳转
                // 如若不对比参数，则建议将 data 拼接至 path，本示例仅作简单使用，如有需要请另写
                return
            }

            window.history.replaceState(data, '', path)
            const popStateEvent = new PopStateEvent('popstate', { state: { path, data } })
            window.dispatchEvent(popStateEvent)
        }

        const go = (delta: number = 1) => {
            window.history.go(delta)
        }

        const forward = () => {
            go()
        }

        const back = () => {
            window.history.back()
        }

        return {
            push,
            replace,
            go,
            forward,
            back,
        }
    })()

    return router
}
