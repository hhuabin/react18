import { useEffect, useRef } from 'react'

import message, { type MessageType } from '@/components/Message'
import { useNotification } from '@/components/Message/notification'

const MessageComponent: React.FC = () => {

    const [messageApi, contextHolder] = message.useMessage()

    const messageRef = useRef<MessageType | null>(null)
    const [notificationApi, notificatioHolder] = useNotification({
        prefixCls: 'bin-message',
        motion: {
            motionName: 'bin-message-move-up',
        },
        onAllRemoved: () => console.log('all removed'),
    })

    const getCloseFunc = () => {
        if (messageRef.current) return
        messageRef.current = message.info('This is a message', 0)
        messageRef.current.then(() => {
            console.log('getCloseFunc 消息已关闭')
        })

        setTimeout(() => {
            messageRef.current?.()
            messageRef.current = null
        }, 3000)
    }

    const open = () => {
        messageApi.info({
            content: 'this is message hooks',
        })
    }

    const destroy = () => {
        messageApi.destroy()
    }

    const updateMessage = () => {
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

    return (
        <>
            { notificatioHolder }

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础组件 notification 的 hooks 调用</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => {
                            notificationApi.open({
                                content: 'This is a notification',
                            })
                        }}
                    >
                        <span>notificationApi.open</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => notificationApi.close('notification')}
                    >
                        <span>notificationApi.close</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => notificationApi.destroy()}
                    >
                        <span>notificationApi.destroy</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.info({
                            content: 'This is an info message',
                        })}
                    >
                        <span>message.info</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.success({
                            content: 'This is an success message',
                        })}
                    >
                        <span>message.success</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.error({
                            content: 'This is an error message',
                        })}
                    >
                        <span>message.error</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.warning({
                            content: 'This is an warning message',
                        })}
                    >
                        <span>message.warning</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.loading({
                            content: 'This is an loading message',
                        })}
                    >
                        <span>message.loading</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => message.destroy()}
                    >
                        <span>message.destroy</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>关闭函数</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => {
                            message.info({
                                content: 'This is an info message',
                                onClose: () => {
                                    console.log('消息已关闭1')
                                },
                            })
                            .then(() => {
                                console.log('消息已关闭2')
                            })
                        }}
                    >
                        <span>onClose</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => getCloseFunc()}
                    >
                        <span>getCloseFunc</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>实例化 Hooks</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => open()}
                    >
                        <span>open</span>
                    </button>

                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => destroy()}
                    >
                        <span>destroy</span>
                    </button>
                </div>
            </div>

            { contextHolder }

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
                        <span>showCloseBtn</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>通过唯一 key 更新消息内容</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => updateMessage()}
                    >
                        <span>update by key</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default MessageComponent
