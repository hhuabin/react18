/**
 * @description 自定义hash路由跳转方法
 * @example const router = useHashRouter()
 * @example router.push('/')
 */
export default function useHashRouter() {
    /**
     * @description 创建一个路由对象，并返回给外部使用
     * @tips 使用Hooks 闭包函数（IIFE），每次返回的都是同一个 router 对象
     */
    const router = (() => {
        const push = (path: string, data: Record<string, unknown> | null = null) => {
            if (window.location.hash === path) {
                // TODO 对比参数是否一致，一致则不进行跳转
                // 如若不对比参数，则建议将 data 拼接至 path，本示例仅作简单使用，如有需要请另写
                return
            }

            window.location.hash = '#' + path
        }

        const replace = (path: string, data: Record<string, unknown> | null = null) => {
            if (window.location.hash === path) {
                // TODO 对比参数是否一致，一致则不进行跳转
                // 如若不对比参数，则建议将 data 拼接至 path，本示例仅作简单使用，如有需要请另写
                return
            }

            window.history.replaceState(null, '', `#${path}`)
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

