import { useRef, useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

/**
 * KeepAliveOutlet - 缓存路由组件，替代 React Router 的 `<Outlet />` 使用
 *
 * @description
 * 通过保留 DOM 节点并切换 `display` 来维持组件状态（滚动位置、表单输入、请求缓存等）。
 * 路由切换时不销毁组件，返回该路由时恢复到离开前的状态。
 *
 * ---
 *
 * ## 基本用法
 *
 * 在布局组件中将 `<Outlet />` 替换为 `<KeepAliveOutlet />`:
 * ```tsx
 * // layouts/MainLayout.tsx
 * import KeepAliveOutlet from '@/components/KeepAlive/KeepAliveOutlet'
 *
 * export default function MainLayout() {
 *   return (
 *     <div>
 *       <Nav />
 *       <KeepAliveOutlet />  {/* 替换原来的 <Outlet /> *\/}
 *     </div>
 *   )
 * }
 * ```
 *
 * ---
 *
 * ## Props
 *
 * ### `include?: (string | RegExp)[]`
 * 只缓存匹配的路径，不传时默认缓存所有路由。
 * 字符串为精确匹配，RegExp 为正则匹配。
 * ```tsx
 * // 只缓存 /list 和所有 /detail/* 路由
 * <KeepAliveOutlet include={['/list', /^\/detail/]} />
 * ```
 *
 * ### `exclude?: (string | RegExp)[]`
 * 不缓存匹配的路径，优先级高于 `include`。
 * ```tsx
 * // 不缓存登录页和注册页，其他全部缓存
 * <KeepAliveOutlet exclude={['/login', '/register']} />
 * ```
 *
 * ### `max?: number`
 * 最大缓存条目数，超出时按 LRU 策略移除最久未访问的缓存。
 * 不传时不限制缓存数量。
 * ```tsx
 * // 最多缓存 10 个路由
 * <KeepAliveOutlet max={10} />
 * ```
 *
 * ---
 *
 * ## 注意事项
 * - 仅适用于路由级别缓存，需配合 React Router v6+ 使用
 * - 路由参数不同视为不同缓存（/user/1 和 /user/2 各自独立缓存）
 * - 缓存的组件仍会响应 React Context 的变化
 * - 如需命令式清除缓存，可在此基础上结合 Context 封装 `clearCache(key)` 能力
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface KeepAliveOutletProps {
    /** 缓存白名单，精确字符串或正则，不传则缓存所有路由 */
    include?: (string | RegExp)[]
    /** 缓存黑名单，精确字符串或正则，优先级高于 include */
    exclude?: (string | RegExp)[]
    /** 最大缓存条目数，超出时 LRU 淘汰，默认不限制 */
    max?: number
}

type CacheItem = {
    key: string
    node: React.ReactNode
    /** 最近访问时间戳，用于 LRU 淘汰 */
    lastVisited: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 判断 pathname 是否命中规则列表中的任意一条 */
const matchesRules = (pathname: string, rules: (string | RegExp)[]): boolean =>
    rules.some((rule) =>
        typeof rule === 'string' ? rule === pathname : rule.test(pathname),
    )

/** 根据 include / exclude 判断该路由是否应被缓存 */
const shouldCache = (
    pathname: string,
    include?: (string | RegExp)[],
    exclude?: (string | RegExp)[],
): boolean => {
    if (exclude?.length && matchesRules(pathname, exclude)) return false
    if (!include?.length) return true
    return matchesRules(pathname, include)
}

// ─── Component ────────────────────────────────────────────────────────────────

const KeepAliveOutlet: React.FC<KeepAliveOutletProps> = ({ include, exclude, max }) => {
    const location = useLocation()
    const outlet = useOutlet()
    const cacheRef = useRef<Map<string, CacheItem>>(new Map())
    const [, forceUpdate] = useState({})

    const cacheKey = location.pathname

    useEffect(() => {
        // 已缓存：仅更新访问时间（用于 LRU）
        const existing = cacheRef.current.get(cacheKey)
        if (existing) {
            existing.lastVisited = Date.now()
            return
        }

        // LRU 淘汰：超出最大缓存数时移除最久未访问的条目
        if (max && cacheRef.current.size >= max) {
            let oldestKey = ''
            let oldestTime = Infinity
            cacheRef.current.forEach((item) => {
                if (item.lastVisited < oldestTime) {
                    oldestTime = item.lastVisited
                    oldestKey = item.key
                }
            })
            if (oldestKey) cacheRef.current.delete(oldestKey)
        }

        // 写入新缓存并触发重渲染
        cacheRef.current.set(cacheKey, {
            key: cacheKey,
            node: outlet,
            lastVisited: Date.now(),
        })
        forceUpdate({})
    }, [cacheKey, outlet, max])

    // 当前路由不在缓存范围内，直接渲染（不保留状态）
    if (!shouldCache(cacheKey, include, exclude)) {
        return outlet
    }

    return (
        <>
            {[...cacheRef.current.values()].map((item) => (
                <div
                    key={item.key}
                    style={{ display: item.key === cacheKey ? 'block' : 'none' }}
                >
                    {item.node}
                </div>
            ))}
        </>
    )
}

export default KeepAliveOutlet
