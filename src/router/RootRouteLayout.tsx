import { Outlet } from 'react-router-dom'
import { KeepAliveProvider } from '@/components/KeepAlive/KeepAliveProvider'
import KeepAliveOutlet from '@/components/KeepAlive/KeepAliveOutlet'

const RootRouteLayout: React.FC = () => {
    return (
        <KeepAliveProvider>
            <KeepAliveOutlet />
        </KeepAliveProvider>
    )
}

export default RootRouteLayout
