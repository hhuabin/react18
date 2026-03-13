/**
 * @Author: bin
 * @Date: 2025-06-04 11:42:38
 * @LastEditors: bin
 * @LastEditTime: 2026-03-02 14:16:19
 */
import { useNavigate } from 'react-router-dom'

import { Modal } from 'antd'

import useDeviceType from '@/hooks/deviceHooks/useDeviceType'

const routeList = [
    {
        label: '文件上传',
        path: '/fileupload',
    },
    {
        label: 'CSSMotion（开发中）',
        path: '/cssmotion',
    },
    {
        label: 'Modal',
        path: '/modal',
    },
    {
        label: 'fetch流式数据获取',
        path: '/fetchStream',
    },
    {
        label: 'Skeleton骨架屏',
        path: '/skeleton',
    },
    {
        label: 'TimezoneTime',
        path: '/timezoneTime',
    },
    {
        label: 'svg',
        path: '/svgicon',
    },
    {
        label: 'Developing',
        path: '/developing',
    },
]

const Introduce: React.FC = () => {

    const navigate = useNavigate()

    const { isMobile } = useDeviceType()

    const goToMobileGuide = () => {
        if (!isMobile) {
            Modal.warning({
                closable: true,
                title: '提示',
                content: (<div>若您处于PC端<br/>请从<span className='text-[#1677ff]'>浏览器开发者工具</span>进入移动端<br/>以完善体验</div>),
                onOk: () => {
                    navigate('/mobile')
                },
            })
            return
        }
        navigate('/mobile')
    }

    return (
        <div className='w-full'>
            <h1 className='w-full py-16 text-[4rem] text-center font-bold'>Welcome</h1>

            <div className='flex justify-center w-full'>
                <ul role='list' className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 max-w-full px-10 py-6 text-[2rem] text-center'>
                    <li className='h-[200px] p-4 rounded-[8px] [box-shadow:var(--box-shadow)] hover:bg-[var(--item-bg-hover)] break-all cursor-pointer'>
                        <button type='button' className='w-full h-full' onClick={() => goToMobileGuide()}>移动端工具</button>
                    </li>
                    {
                        routeList.map((item, index) => (
                            <li
                                className='h-[200px] p-4 rounded-[8px] [box-shadow:var(--box-shadow)] hover:bg-[var(--item-bg-hover)] break-all cursor-pointer'
                                key={index}
                            >
                                <button type='button' className='w-full h-full' onClick={() => navigate(item.path)}>{ item.label }</button>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default Introduce
