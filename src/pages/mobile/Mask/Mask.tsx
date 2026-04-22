import { useState, useEffect } from 'react'

import Mask from '@/components/mobile/Mask'
import message from '@/components/mobile/Message'

const MaskComponents: React.FC = () => {

    const [visible, setVisible] = useState(false)

    const [styleVisible, setStyleVisible] = useState(false)
    const [closeVisible, setCloseVisible] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    return (
        <>

            <div className='w-full min-h-screen bg-[var(--bg-layout)]'>
                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>基础用法</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => setVisible(true)}
                        >
                            <div className='flex-none min-w-64 mr-10'>显示背景蒙层</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'></div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>

                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>传入配置项</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => setStyleVisible(true)}
                        >
                            <div className='flex-none min-w-64 mr-10'>修改蒙层样式</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'></div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => setCloseVisible(true)}
                        >
                            <div className='flex-none min-w-64 mr-10'>监听蒙层完全关闭事件</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'></div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => setContentVisible(true)}
                        >
                            <div className='flex-none min-w-64 mr-10'>嵌入内容</div>
                            <div className='flex justify-between items-center w-full min-h-10 text-[var(--text-primary)]'
                            >
                                <div className='w-full h-full text-[#999] break-all'></div>
                                <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--fill-default)' strokeWidth='8' strokeLinecap='round'>
                                        </polyline>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </li>
                </ul>
            </div>

            <Mask
                visible={visible}
                onMaskClick={() => {
                    console.log('onMaskClick 蒙层关闭')
                    setVisible(false)
                }}
            ></Mask>

            <Mask
                visible={styleVisible}
                zIndex={1049}
                duration={500}
                bgColor='rgba(255, 255, 255, 0.7)'
                onMaskClick={() => setStyleVisible(false)}
            ></Mask>
            <Mask
                visible={closeVisible}
                onMaskClick={() => setCloseVisible(false)}
                afterClose={() => { message.info('afterClose 蒙层完全关闭') }}
            ></Mask>
            <Mask
                visible={contentVisible}
                onMaskClick={() => setContentVisible(false)}
            >
                <div className='absolute left-1/2 top-0 flex justify-center items-center w-[100px] h-[100px] rounded-[8px] translate-x-[-50%] bg-[#FFF]'>
                    <div className='w-full text-[16px] leading-[24px] text-center'>显示内容</div>
                </div>
                <div className='absolute left-1/2 top-1/2 flex justify-center items-center w-[100px] h-[100px] rounded-[8px] translate-x-[-50%] translate-y-[-50%] bg-[#FFF]'>
                    <div className='w-full text-[16px] leading-[24px] text-center'>显示内容</div>
                </div>
            </Mask>
        </>
    )
}

export default MaskComponents

