/**
 * @Author: bin
 * @Date: 2025-12-25 15:32:17
 * @LastEditors: bin
 * @LastEditTime: 2026-04-22 15:29:30
 */
import { useState } from 'react'

import ImagePreview, { showImagePreview } from '@/components/mobile/ImagePreview'

const demoImages = [
    'https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80',
    'https://images.unsplash.com/photo-1601128533718-374ffcca299b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3128&q=80',
    'https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3113&q=80',
    'https://images.unsplash.com/photo-1624993590528-4ee743c9896e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=1000&q=80',
]

const ImagePreviewComponent: React.FC = () => {

    const [visible, setVisible] = useState(false)

    const renderFooter = (index: number) => (
        <div className='absolute bottom-6 left-1/2 px-6 py-3 rounded-[1.5rem]
            bg-[#000]/[0.3] translate-x-[-50%] text-[#FFF] text-[1.5rem] leading-6 cursor-pointer'
        >
            查看原图 { index + 1 }
        </div>
    )

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
                            onClick={() => showImagePreview({ images: demoImages })}
                        >
                            <div className='flex-none min-w-64 mr-10'>预览图片</div>
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
                    <li className='relative w-full bg-[var(--bg-container)] rounded-[1rem] after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem]
                            after:h-px after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => showImagePreview({
                                images: demoImages,
                                doubleScale: false,
                            })}
                        >
                            <div className='flex-none min-w-64 mr-10'>禁用双击缩放</div>
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
                            onClick={() => showImagePreview({
                                images: demoImages,
                                defaultIndex: 100,
                            })}
                        >
                            <div className='flex-none min-w-64 mr-10'>指定初始位置</div>
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
                    <li className='relative w-full bg-[var(--bg-container)] rounded-[1rem] after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem]
                        after:h-px after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => showImagePreview({
                                images: demoImages,
                                showCloseBtn: true,
                            })}
                        >
                            <div className='flex-none min-w-64 mr-10'>展示关闭按钮</div>
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
                    <li className='relative w-full bg-[var(--bg-container)] rounded-[1rem] after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem]
                        after:h-px after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => showImagePreview({
                                images: demoImages,
                                showIndicator: false,
                            })}
                        >
                            <div className='flex-none min-w-64 mr-10'>不显示指示器</div>
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
                    <li className='relative w-full bg-[var(--bg-container)] rounded-[1rem] after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem]
                        after:h-px after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => showImagePreview({
                                images: demoImages,
                                renderFooter: renderFooter,
                            })}
                        >
                            <div className='flex-none min-w-64 mr-10'>自定义页脚</div>
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

                <div className='w-full p-6 text-[var(--text-primary)] text-[16px]'>组件调用</div>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--bg-container)] text-[var(--text-primary)] text-[2rem] leading-10'>
                    <li className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                        after:bg-[var(--border-light)] after:scale-y-50 last:after:hidden hover:bg-[var(--item-hover)]'
                    >
                        <button
                            type='button'
                            className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-active)]'
                            onClick={() => setVisible(true)}
                        >
                            <div className='flex-none min-w-64 mr-10'>组件调用</div>
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

            {/* 预览图片 */}
            <ImagePreview
                visible={visible}
                images={demoImages}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

export default ImagePreviewComponent
