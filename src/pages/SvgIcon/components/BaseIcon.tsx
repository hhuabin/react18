const BaseIcon: React.FC = () => {

    return (
        <>
            {/* arrow */}
            <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-[8px] gap-y-[16px] p-[8px]'>
                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <defs>
                                <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='100%'>
                                    <stop offset='0%' stopColor='currentColor' stopOpacity='0' />
                                    <stop offset='100%' stopColor='currentColor' stopOpacity='1' />
                                </linearGradient>
                            </defs>
                            <rect x='20' y='30' width='60' height='40' rx='10' ry='10' fill='url(#grad1)' stroke='currentColor' strokeWidth='4'></rect >
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>自定义</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <polyline points='20,35 50,65 80,35' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>down</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <polyline points='20,65 50,35 80,65' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>up</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <polyline points='65,20 35,50 65,80' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>left</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <polyline points='35,20 65,50 35,80' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>right</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='50' y1='20' x2='50' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                            <polyline points='25,50 50,80 75,50' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>arrow-down</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='50' y1='25' x2='50' y2='80' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                            <polyline points='25,50 50,20 75,50' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>arrow-up</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='25' y1='50' x2='80' y2='50' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                            <polyline points='50,25 20,50 50,75' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>arrow-left</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='20' y1='50' x2='75' y2='50' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' />
                            <polyline points='50,25 80,50 50,75' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round'></polyline>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>arrow-right</div>
                </div>
            </div>

            {/*  */}
            <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-[8px] gap-y-[16px] p-[8px]'>
                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 描述了一个勾形的路径，从 (20, 50) 开始，经过 (40, 70)，最终到达 (80, 30) --> */}
                            <path d='M20 50L40 70L80 30' stroke='currentColor' strokeWidth='8' fill='none' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>check</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/*
                                stroke-dasharray='85'设置路径的虚线长度，尽量和真实的path接近，dur才能准确
                                stroke-dasharray太短，会丢失部分路径
                                stroke-dasharray太长，dur比设置的小，如stroke-dasharray='170'此时dur='0.25s'
                            */}
                            <path d='M20 50L40 70L80 30' stroke='currentColor' strokeWidth='8' fill='none' strokeLinecap='round'
                                strokeLinejoin='round' strokeDasharray='85' strokeDashoffset='85'
                            >
                                {/* <animate attributeName='stroke-dashoffset' from='80' to='0' dur='0.5s' fill='remove' /> */}
                                <animate attributeName='stroke-dashoffset' from='85' to='0' dur='0.5s' begin='0.3s' fill='freeze' />
                            </path>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>animate-check</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='25' y1='25' x2='75' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                            <line x1='75' y1='25' x2='25' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>close</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <line x1='50' y1='20' x2='50' y2='80' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                            <line x1='20' y1='50' x2='80' y2='50' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>add</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 感叹号的竖线 --> */}
                            <line x1='50' y1='20' x2='50' y2='60' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                            {/* <!-- 感叹号的圆点 --> */}
                            <circle cx='50' cy='80' r='5' fill='currentColor' />
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>exclamation</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 圆圈，其他icon类似，有需要加上圆圈即可 --> */}
                            <circle cx='50' cy='50' r='45' stroke='currentColor' strokeWidth='8' fill='none' strokeLinecap='round' />
                            {/* <!-- 感叹号的竖线 --> */}
                            <line x1='50' y1='25' x2='50' y2='58' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                            {/* <!-- 感叹号的圆点 --> */}
                            <circle cx='50' cy='75' r='5' fill='currentColor' />
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>circle-exclamation</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            <circle cx='45' cy='45' r='33' fill='none' stroke='currentColor' strokeWidth='8' strokeLinecap='round'></circle>
                            <line x1='70' y1='70' x2='85' y2='85' stroke='currentColor' strokeWidth='8' strokeLinecap='round'></line>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>search</div>
                </div>

                <div className='flex flex-col items-center w-full'>
                    <div className='flex justify-center items-center w-[50px] h-[50px] border border-[var(--border-default)] box-content
                        bg-[var(--bg-container)] [box-shadow:var(--shadow-sm)] hover:bg-[var(--item-hover)]'
                    >
                        <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                            {/* <!-- 第一个圆点 --> */}
                            <circle cx='25' cy='50' r='6' fill='currentColor'></circle>
                            {/* <!-- 第二个圆点 --> */}
                            <circle cx='50' cy='50' r='6' fill='currentColor'></circle>
                            {/* <!-- 第三个圆点 --> */}
                            <circle cx='75' cy='50' r='6' fill='currentColor'></circle>
                        </svg>
                    </div>
                    <div className='w-full mt-[12px] text-center break-all'>ellipsis</div>
                </div>
            </div>
        </>
    )
}

export default BaseIcon

