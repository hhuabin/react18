import BaseIcon from './components/BaseIcon'
import LoadingIcon from './components/LoadingIcon'
import UserIcon from './components/UserIcon'

const SvgIcon: React.FC = () => {

    return (
        // {/* 所有svg默认viewBox='0 0 100 100' */}
        <div className='w-full min-h-screen py-8 text-[var(--text-primary)] text-[14px] leading-[24px]'>
            <BaseIcon></BaseIcon>

            <LoadingIcon></LoadingIcon>

            <UserIcon></UserIcon>
        </div>
    )
}

export default SvgIcon
