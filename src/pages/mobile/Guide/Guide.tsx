/**
 * @Author: bin
 * @Date: 2025-06-05 15:29:04
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 16:32:57
 */
import { useNavigate } from 'react-router-dom'

const guideList = [
    {
        label: 'Message',
        path: '/mobile/message',
        explanation: '消息提示',
    },
    {
        label: 'Dialog',
        path: '/mobile/dialog',
        explanation: 'Dialog对话框',
    },
    {
        label: 'Mask',
        path: '/mobile/mask',
        explanation: 'Mask背景蒙层',
    },
    {
        label: 'Picker',
        path: '/mobile/picker',
        explanation: 'Picker选择器',
    },
    {
        label: 'Swiper',
        path: '/mobile/swiper',
        explanation: 'Swiper轮播图',
    },
    {
        label: 'Image',
        path: '/mobile/image',
        explanation: 'Image图片',
    },
    {
        label: 'ImagePreview',
        path: '/mobile/imagePreview',
        explanation: '图片预览',
    },
    {
        label: 'Upload',
        path: '/mobile/upload',
        explanation: 'Upload文件上传',
    },
]

const Guide: React.FC = () => {

    const navigate = useNavigate()

    return (
        <div className='w-full min-h-screen bg-[var(--color-bg-layout)]'>
            <div className='w-full py-6'>
                <ul role='list' className='w-[43.875rem] mx-auto rounded-[1rem] bg-[var(--color-bg-container)] text-[var(--color-text)] text-[2rem] leading-10'>
                    {
                        guideList.map((item, index) => (
                            <li
                                className='relative w-full after:content-[""] after:absolute after:right-0 after:bottom-0 after:w-[42rem] after:h-px
                                    after:bg-[var(--color-border-bg)] after:scale-y-50 last:after:hidden hover:bg-[var(--color-container-hover)]'
                                key={index}
                            >
                                <button
                                    type='button'
                                    className='flex justify-between w-full min-h-[5.5rem] py-6 px-unit30 box-border text-left overflow-hidden active:bg-[var(--item-bg-active)]'
                                    onClick={() => navigate(item.path)}
                                >
                                    <div className='flex-none min-w-64 mr-10'>{ item.label }</div>
                                    <div className='flex justify-between items-center w-full min-h-10 text-[var(--color-text)]'
                                    >
                                        <div className='w-full h-full text-[#999] break-all'>{ item.explanation }</div>
                                        <div className='flex-none w-8 h-8 ml-[0.75rem]'>
                                            <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                                <polyline points='35,20 65,50 35,80' fill='none' stroke='var(--color-fill)' strokeWidth='8' strokeLinecap='round'>
                                                </polyline>
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default Guide
