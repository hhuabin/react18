const LoadingIcon: React.FC = () => {

    return (
        <>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-[8px] gap-y-[16px] p-[8px]'>
                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 第一个圆点 --> */}
                            <circle cx='25' cy='50' r='4' fill='currentColor'>
                                <animate attributeName='r' values='4;7;4' dur='1s' repeatCount='indefinite' begin='0s' />
                            </circle>
                            {/* <!-- 第二个圆点 --> */}
                            <circle cx='50' cy='50' r='4' fill='currentColor'>
                                <animate attributeName='r' values='4;7;4' dur='1s' repeatCount='indefinite' begin='0.2s' />
                            </circle>
                            {/* <!-- 第三个圆点 --> */}
                            <circle cx='75' cy='50' r='4' fill='currentColor'>
                                <animate attributeName='r' values='4;7;4' dur='1s' repeatCount='indefinite' begin='0.4s' />
                            </circle>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>dot-loading</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 第一个圆点 --> */}
                            <circle cx='25' cy='50' r='6' fill='#999'>
                                <animate attributeName='cx' values='25;50;25' dur='1s' repeatCount='indefinite' begin='0s' />
                                <animate attributeName='fill' values='#999;currentColor;#999' dur='1s' repeatCount='indefinite' begin='0s' />
                            </circle>
                            {/* <!-- 第二个圆点 --> */}
                            <circle cx='50' cy='50' r='6' fill='#999'>
                                <animate attributeName='r' values='6;9;6' dur='1s' repeatCount='indefinite' begin='0s' />
                                <animate attributeName='fill' values='#999;currentColor;#999' dur='1s' repeatCount='indefinite' begin='0s' />
                            </circle>
                            {/* <!-- 第三个圆点 --> */}
                            <circle cx='75' cy='50' r='6' fill='#999'>
                                <animate attributeName='cx' values='75;50;75' dur='1s' repeatCount='indefinite' begin='0s' />
                                <animate attributeName='fill' values='#999;currentColor;#999' dur='1s' repeatCount='indefinite' begin='0s' />
                            </circle>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>loading</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 白色色背景圆圈 --> */}
                            <circle cx='50' cy='50' r='36' stroke='var(--bg-container)' strokeWidth='10' fill='none' strokeLinecap='round' />
                            {/* <!-- 黑色动态圆圈，半径是36，周长为226.2 弧度是 5/16(88.5) 圆 --> */}
                            <circle cx='50' cy='50' r='36' stroke='currentColor' strokeWidth='10' fill='none' strokeDasharray='70.5 155.7' strokeLinecap='round'>
                                {/* <!-- 旋转动画 --> */}
                                <animateTransform attributeName='transform' type='rotate' from='0 50 50' to='360 50 50' dur='1.5s' repeatCount='indefinite' />
                            </circle>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>loading-rotate</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <defs>
                                {/* <!-- 定义透明度渐变 --> */}
                                <linearGradient id='blackGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                                    {/* <!-- 起始点：完全不透明 --> */}
                                    <stop offset='0%' stopColor='currentColor' stopOpacity='1' />
                                    {/* <!-- 结束点：完全透明 --> */}
                                    <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
                                </linearGradient>
                            </defs>

                            {/* <!-- 动态圆圈，半径是36，弧度是 1/2(141.5) 圆 --> */}
                            <circle cx='50' cy='50' r='36' stroke='url(#blackGradient)' strokeWidth='10' fill='none' strokeDasharray='141.5 141.5' strokeLinecap='round'>
                                {/* <!-- 旋转动画 --> */}
                                <animateTransform attributeName='transform' type='rotate' from='0 50 50' to='360 50 50' dur='1.5s' repeatCount='indefinite' />
                            </circle>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>loading-gradient-rotate</div>
                </div>
            </div>
        </>
    )
}

export default LoadingIcon

