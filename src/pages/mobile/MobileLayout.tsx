import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useInternalLayoutEffect } from '@/hooks/core/useLayoutUpdateEffect'

const MobileLayout: React.FC = () => {

    const [model, setModel] = useState<'' | 'mobile'>('')

    useInternalLayoutEffect(() => {
        // 结合 src/styles/mobile.css，会导致 html 样式发生改动
        document.documentElement.dataset.model = 'mobile'
        // 保证子组件在 useEffect 中获取的样式正确
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setModel('mobile'))
        })

        return () => {
            document.documentElement.dataset.model = ''
            setModel('')
        }
    }, [])

    return model === 'mobile' ? (<Outlet />) : null
}

export default MobileLayout
