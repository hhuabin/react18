/* eslint-disable max-lines */
import { useState } from 'react'

import message from '@/components/Message'
import Modal from '@/components/Modal'
import { Modal as AntdModal } from 'antd'

import Dialog from '@/components/Modal/RCDialog'

const ModalComponents: React.FC = () => {

    const [dialogVisiable, setDialogVisiable] = useState(false)

    const [visible, setVisible] = useState(false)
    const [antdVisiable, setAntdVisiable] = useState(false)

    return (
        <>
            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础组件 Dialog 的组件化调用</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => setDialogVisiable(!dialogVisiable)}
                    >
                        <span>open dialog</span>
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

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.info({
                            closable: true,
                            title: '提示',
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
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.destroyAll()}
                    >
                        <span>Modal.destroyAll</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>自定义页脚</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.confirm({
                            content: '自定义页脚',
                            footer: (handleConfirm, handleCancel) => (
                                <>
                                    <button
                                        type='button'
                                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                                        onClick={handleConfirm}
                                    >确定</button>
                                    <button
                                        type='button'
                                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                                        onClick={handleCancel}
                                    >取消</button>
                                </>
                            ),
                        })}
                    >
                        <span>open modal</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>蒙层</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.info({
                            mask: false,
                            content: '我是一个弹窗',
                        })}
                    >
                        <span>不要蒙层</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.info({
                            content: '我是一个弹窗',
                            maskClosable: true,
                        })}
                    >
                        <span>点击蒙层关闭</span>
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
                        onClick={() => Modal.info({
                            width: 400,
                            content: '我是一个弹窗',
                        })}
                    >
                        <span>自定义宽度</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Modal.info({
                            content: '我是一个弹窗',
                            duration: 3000,
                            /* style: {
                                '--animation-duration': '3s',
                            } as React.CSSProperties, */
                        })}
                    >
                        <span>自定义动画时长</span>
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
                            forceRender: true,
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

            <Dialog
                visible={dialogVisiable}
                width={520}
                destroyOnHidden={true}
                closable={true}
                onClose={() => setDialogVisiable(false)}
                afterClose={() => console.log('动画结束')}
                title='标题'
                footer='页脚'
            >我是一个弹窗</Dialog>

            <Modal
                open={visible}
                title='提示'
                onConfirm={() => {
                    message.info('confirm')
                }}
                onCancel={() => setVisible(false)}
            >
                我是一个弹窗
            </Modal>

            <AntdModal
                open={antdVisiable}
                title='提示'
                onOk={() => { message.info('ok') }}
                onCancel={() => setAntdVisiable(false)}
            >
                我是一个弹窗
            </AntdModal>
        </>
    )
}

export default ModalComponents
