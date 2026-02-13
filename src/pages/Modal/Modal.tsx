import { useState } from 'react'

import message from '@/components/Message'
import Modal from '@/components/Modal'
import { Modal as AntdModal } from 'antd'

const ModalComponents: React.FC = () => {

    const [visible, setVisible] = useState(false)
    const [antdVisiable, setAntdVisiable] = useState(false)

    return (
        <>
            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.info({
                            closable: true,
                            content: 'This is an info message',
                        })}
                    >
                        <span>Modal.info</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.success({
                            content: 'This is an success message',
                        })}
                    >
                        <span>Modal.success</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.error({
                            content: 'This is an error message',
                        })}
                    >
                        <span>Modal.error</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.warning({
                            content: 'This is an warning message',
                        })}
                    >
                        <span>Modal.warning</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.confirm({
                            content: 'This is an confirm message',
                        })}
                    >
                        <span>Modal.confirm</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>Antd Modal</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.info({
                            title: '提示',
                            content: 'This is an info message',
                        })}
                    >
                        <span>AntdModal.info</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.success({
                            content: 'This is an success message',
                        })}
                    >
                        <span>AntdModal.success</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.error({
                            content: 'This is an error message',
                        })}
                    >
                        <span>AntdModal.error</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.warn({
                            content: 'This is an warn message',
                        })}
                    >
                        <span>AntdModal.warn</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.warning({
                            content: 'This is an warning message',
                        })}
                    >
                        <span>AntdModal.warning</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => AntdModal.confirm({
                            content: 'This is an confirm message',
                        })}
                    >
                        <span>AntdModal.confirm</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>组件化调用</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => setVisible(!visible)}
                    >
                        <span>open modal</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => setAntdVisiable(!antdVisiable)}
                    >
                        <span>open antd modal</span>
                    </button>
                </div>
            </div>

            <Modal
                open={visible}
                mask={true}
                title='提示'
                closable={true}
                onConfirm={() => {
                    message.info('confirm')
                }}
                onCancel={() => setVisible(false)}
            >
                我是一个弹窗
            </Modal>

            <AntdModal
                open={antdVisiable}
                onOk={() => { message.info('ok') }}
                onCancel={() => setAntdVisiable(false)}
            >
                我是一个弹窗
            </AntdModal>
        </>
    )
}

export default ModalComponents
