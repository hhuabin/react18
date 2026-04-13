import { useRef, useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

interface Props {
    include?: string[];
}

type CacheItem = {
    key: string
    node: React.ReactNode
}

const shouldCache = (pathname: string, include: Props['include'] = []) => {
    // 未定义，默认全部缓存
    if (!include.length) return true

    if (include.includes(pathname)) return true

    return false
}

/**
 * 测试阶段，未在生产使用过
 * @description 缓存路由组件，代替 <Outlet/>使用
 *  return (<Outlet />)
 * -> return (<KeepAlive />)
 * 子组件通过 display: block; 显示组件；通过display: none; 隐藏组件
 */
const KeepAliveOutlet: React.FC<Props> = (props) => {
    const location = useLocation()
    const outlet = useOutlet()
    const cacheRef = useRef<Map<string, CacheItem>>(new Map())
    const [, forceUpdate] = useState({})

    const cacheKey = location.pathname

    useEffect(() => {
        if (!cacheRef.current.has(cacheKey)) {
            cacheRef.current.set(cacheKey, {
                key: cacheKey,
                node: outlet,
            })
            forceUpdate({})
        }
    }, [cacheKey, outlet])

    if (!shouldCache(location.pathname, props.include)) {
        return outlet
    }

    return (
        <>
            {[...cacheRef.current.values()].map((item) => (
                <div
                    key={item.key}
                    style={{
                        display: item.key === cacheKey ? 'block' : 'none',
                    }}
                >
                    {item.node}
                </div>
            ))}
        </>
    )
}

export default KeepAliveOutlet
