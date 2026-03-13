import { useNavigation, Outlet } from 'react-router-dom'

import Loading from '@/components/Loading/Loading'
import Header from './components/Header'

const Home: React.FC = () => {

    const navigation = useNavigation()

    return (
        <>
            <div className='w-full h-full pt-[64px] box-border'>
                <Header></Header>

                <div className='w-full h-full'>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Home
