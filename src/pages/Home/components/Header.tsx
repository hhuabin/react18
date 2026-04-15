import { useState, useLayoutEffect, useEffect, useRef } from 'react'

import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { Popover } from 'antd'

import message, { type NoticeType } from '@/components/Message'
import { randomIntInRange } from '@/utils/functionUtils/mathUtils'

type Theme = 'light' | 'dark'

const Header: React.FC = () => {

    const [theme, setTheme] = useState<Theme>('light')
    const isFirstRender = useRef(true)

    useLayoutEffect(() => {
        /**
         * 在useLayoutEffect中修改主题，将不会有动画
         * 因为在App.tsx中已经修改成了黑色主题，故没有动画也没有了类似闪屏的问题
         * 若App.tsx没有修改主题，建议useEffect中修改主题，保持与html主题保持同步变化
         */
        const currentTheme = localStorage.getItem('local-theme') || getOSTheme()
        if (currentTheme === 'dark') {
            changeTheme('dark')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // 首次加载不执行
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        document.documentElement.dataset.theme = theme
        localStorage.setItem('local-theme', theme)
    }, [theme])

    useEffect(() => {
        // 监听浏览器主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleColorSchemeChange = (event: MediaQueryListEvent) => {
            // 此处禁止调用changeTheme()，否则造成闭包陷阱，changeTheme()读取theme错误
            setTheme(event.matches ? 'dark' : 'light')
        }
        mediaQuery.addEventListener('change', handleColorSchemeChange)

        return () => {
            mediaQuery.removeEventListener('change', handleColorSchemeChange)
        }
    }, [])

    /**
     * 获取浏览器颜色主题
     * @returns Theme
     */
    const getOSTheme = (): Theme => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

    /**
     * 切换主题，默认为当前主题的反向
     * 切换方式：
     * 1. 点击按钮手动切换
     * 2. 监听浏览器切换主题时一同切换
     * @param target 目标主题
     */
    const changeTheme = (_theme?: Theme) => {
        if  (_theme === theme) return
        setTheme(_theme || theme === 'light' ? 'dark' : 'light')
    }

    const handleClickName = () => {
        const messageType = ['info', 'success', 'error', 'warning', 'loading']
        const randonNumber = randomIntInRange(0, messageType.length - 1)
        message.open({
            type: messageType[randonNumber] as NoticeType,
            content: '死鬼！不要点我',
            showCloseBtn: true,
        })
    }

    return (
        <header className='fixed top-0 left-0 flex justify-between w-full h-[64px] bg-[var(--bg-color)] overflow-hidden
            [box-shadow:var(--box-bottom-shadow)] transition-all ease-[ease] duration-[var(--theme-duration)] z-[1000]'
        >
            <div className='flex items-center px-8 text-[2rem] text-[var(--color-text)] font-bold cursor-pointer select-none' onClick={() => handleClickName()}>H H U A B I N</div>

            <div className='hidden md:flex items-center flex-nowrap gap-2 h-full pr-8 box-border'>
                {/* <button className='inline-flex justify-center items-center w-8 h-8 rounded-md bg-[transparent] hover:bg-[var(--item-bg-hover)]'>
                    <div className='inline-flex justify-center items-center w-4 h-4'>
                        <svg width='100%' height='100%' viewBox='0 0 24 24' fill='var(--color-text)' xmlns='http://www.w3.org/2000/svg'>
                            <g fill-rule='evenodd'>
                                <g fill-rule='nonzero'>
                                    <path d='M7.02 3.635l12.518 12.518a1.863 1.863 0 010 2.635l-1.317 1.318a1.863 1.863 0 01-2.635 0
                                        L3.068 7.588A2.795 2.795 0 117.02 3.635zm2.09 14.428a.932.932 0 110 1.864.932.932 0 010-1.864z
                                        m-.043-9.747L7.75 9.635l9.154 9.153 1.318-1.317-9.154-9.155zM3.52 12.473c.514 0 .931.417.931.931
                                        v.932h.932a.932.932 0 110 1.864h-.932v.931a.932.932 0 01-1.863 0l-.001-.931h-.93a.932.932 0 010-1.864
                                        h.93v-.932c0-.514.418-.931.933-.931zm15.374-3.727a1.398 1.398 0 110 2.795 1.398 1.398 0 010-2.795z
                                        M4.385 4.953a.932.932 0 000 1.317l2.046 2.047L7.75 7 5.703 4.953a.932.932 0 00-1.318 0zM14.701.36
                                        a.932.932 0 01.931.932v.931h.932a.932.932 0 010 1.864h-.933l.001.932a.932.932 0 11-1.863 0l-.001-.932
                                        h-.93a.932.932 0 110-1.864h.93v-.931a.932.932 0 01.933-.932z'
                                    >
                                    </path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </button> */}
                <button
                    className='inline-flex justify-center items-center w-8 h-8 rounded-md bg-[transparent] hover:bg-[var(--item-bg-hover)]'
                    onClick={() => changeTheme()}
                >
                    <div className='inline-flex justify-center items-center w-4 h-4'>
                        {
                            theme === 'light' ? (
                                <SunOutlined style={{ fontSize: '16px', color: 'var(--color-text)' }} />
                            ) : (
                                <MoonOutlined style={{ fontSize: '16px', color: 'var(--color-text)' }} />
                            )
                        }
                    </div>
                </button>

                <Popover content='Github'>
                    <a href='https://github.com/hhuabin/react18' target='_blank' rel='noreferrer'>
                        <button className='inline-flex justify-center items-center w-8 h-8 rounded-md bg-[transparent] hover:bg-[var(--item-bg-hover)]'>
                            <div className='flex justify-center items-center w-4 h-4'>
                                <svg width='100%' height='100%' viewBox='0 0 1024 1024' fill='var(--color-text)' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2
                                        v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703
                                        c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5
                                        16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2
                                        4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59
                                        188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1
                                        0-247.2-200.4-447.3-447.5-447.3z'
                                    >
                                    </path>
                                </svg>
                            </div>
                        </button>
                    </a>
                </Popover>
            </div>
        </header>
    )
}

export default Header
