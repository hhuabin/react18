import message from '@/components/mobile/Message'

const Message: React.FC = () => {

    const [messageApi, contextHolder] = message.useMessage()

    const openMessage = () => {
        message.open({
            key: 'updatable',
            type: 'loading',
            content: 'Loading...',
        })
        setTimeout(() => {
            message.open({
                key: 'updatable',
                type: 'success',
                content: 'Loaded',
            })
        }, 2000)
    }

    const openCustomMessage = () => {
        message.open({
            content: <div className='text-[24px] text-[#f00]'>This is a custom message</div>,
        })
    }

    return (
        <>
            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.info('This is an info message')}
                    >
                        <span>Info</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.success('This is a success message')}
                    >
                        <span>Success</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.error('This is an error message')}
                    >
                        <span>Error</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.warning('This is a warning message')}
                    >
                        <span>Warning</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.loading('This is a loading message')}
                    >
                        <span>Loading</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.destroy()}
                    >
                        <span>Destroy</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>可以通过唯一的 key 来更新内容</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => openMessage()}
                    >
                        <span>Open the message box</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>手动关闭</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.open({
                            content: 'This is a message',
                            duration: 0,
                            showCloseBtn: true,
                        })}
                    >
                        <span>Open the message box</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>自定义样式</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => openCustomMessage()}
                    >
                        <span>openCustomMessage</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Message
