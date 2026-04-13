import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {

    const navigate = useNavigate()

    const goToRootPath = () => {
        navigate('/')
    }

    return (
        <div className='flex justify-center items-center w-full h-full p-[12px] box-border text-[var(--color-text)] text-[24px]'>
            <div className='absolute top-[35%] flex flex-col justify-center items-center p-[12px] box-border translate-y-[-50%]'>
                <div className='font-semibold'>你要找的页面不见啦！</div>
                <div className='mt-[10px] text-[#999] text-[12px]'>
                    The page you are looking for is missing
                </div>

                <div className='mt-[30px] text-[14px]'>
                    <button
                        type='button'
                        className='px-4 border border-[var(--color-border)] rounded-md text-[1em] bg-[var(--bg-color)] select-none
                        text-[var(--color-text)] leading-8 hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => goToRootPath()}
                    >
                        <span>返回首页</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
