import React, { useEffect, useState } from 'react'

import { Dialog } from '@/components/mobile'

const DialogComponent: React.FC = () => {

    const [dialogVisiable, setDialogVisiable] = useState(false)

    useEffect(() => {
        /* AntdDialog.alert({
            title: '标题',
            // content: <div className='w-full h-[40vh]'><img className='block w-full h-full object-contain' src='https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg' alt="" /></div>,
            content: '你好',
        }) */
    }, [])

    return (
        <>
            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>组件式调用</div>
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
                <div className='w-full p-4 text-[16px] leading-[24px]'>基础用法</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.alert({
                            title: '提示',
                            content: 'This is an alert dialog',
                        })}
                    >
                        <span>Dialog.alert</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.show({
                            content: 'This is an show dialog',
                        })}
                    >
                        <span>Dialog.show</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            title: '标题',
                            content: 'This is an confirm dialog',
                        })}
                    >
                        <span>Modal.confirm</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.destroyAll()}
                    >
                        <span>Modal.destroyAll</span>
                    </button>
                </div>
            </div>

            <div className='w-full mb-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>鼠标位置</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.show({
                            content: '禁用鼠标位置',
                            diableMousePosition: true,
                        })}
                    >
                        <span>diableMousePosition</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-5'>
                <div className='w-full p-4 text-[16px] leading-[24px]'>自定义内容</div>
                <div className='w-full px-4'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            content: (
                                <div className='w-full text-[#646566] text-[14px] leading-[20px] text-center pt-[8px] px-[24px] pb-[26px]'>
                                    我是一个弹窗
                                </div>
                            ),
                        })}
                    >
                        <span>自定义内容</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            content: '我是一个弹窗',
                            footer: (onConfirm, onCancel) => (
                                <div className='w-full flex justify-end'>
                                    <button
                                        type='button'
                                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                                        onClick={onConfirm}
                                    >确定</button>
                                    <button
                                        type='button'
                                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                                        onClick={onCancel}
                                    >取消</button>
                                </div>
                            ),
                        })}
                    >
                        <span>自定义页脚</span>
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
                        onClick={() => Dialog.confirm({
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
                        onClick={() => Dialog.confirm({
                            content: '我是一个弹窗',
                            closeOnMaskClick: true,
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
                        onClick={() => Dialog.confirm({
                            width: 250,
                            content: '我是一个弹窗',
                        })}
                    >
                        <span>自定义宽度</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            content: '我是一个弹窗',
                            duration: 3000,
                            /* style: {
                                '--animation-duration': '3s',
                            } as React.CSSProperties, */
                        })}
                    >
                        <span>自定义动画时长</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            content: '我是一个弹窗',
                            style: {
                                '--dialog-radius': '8px',
                                '--dialog-background': '#fff',
                                '--animation-duration': '0.3s',
                                '--dialog-font-size': '16px',
                            } as React.CSSProperties,
                        })}
                    >
                        <span>自定义圆角</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            content: '我是一个弹窗',
                            style: {
                                '--dialog-background': '#d5d5d5',
                            } as React.CSSProperties,
                        })}
                    >
                        <span>自定义背景</span>
                    </button>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => Dialog.confirm({
                            title: '标题',
                            content: '我是一个弹窗',
                            style: {
                                '--dialog-font-size': '20px',
                            } as React.CSSProperties,
                        })}
                    >
                        <span>自定义字体大小</span>
                    </button>
                </div>
            </div>

            <Dialog
                visible={dialogVisiable}
                title={'标题'}
                onCancel={() => setDialogVisiable(false)}
                onConfirm={() => setDialogVisiable(false)}
            >
                我是一个弹窗
            </Dialog>
        </>
    )
}

export default DialogComponent
