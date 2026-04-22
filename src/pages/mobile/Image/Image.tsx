import { useState } from 'react'

import message from '@/components/mobile/Message'
import Image from '@/components/mobile/Image'

const ImageComponents: React.FC = () => {


    const [random, setRandom] = useState<number>(Date.now())

    return (
        <div className='w-full min-h-full p-6'>
            <div className='w-full'>
                <div className='w-full text-[16px] leading-[24px]'>基础用法，（Image 默认宽高是 auto）</div>
                <div className='w-full mt-4'>
                    <div className='w-[150px] h-[150px]'>
                        <Image
                            src='https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80'
                            width={150}
                            height={150}
                        ></Image>
                    </div>
                </div>
            </div>

            <div className='w-full my-16'>
                <div className='w-full text-[16px] leading-[24px]'>填充模式</div>
                <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] w-full mt-4'>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>contain(默认)</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                                fit='cover'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>cover</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                                fit='fill'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>fill</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                                fit='scale-down'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>scale-down</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                                fit='none'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>none</div>
                    </div>
                </div>
            </div>

            <div className='w-full my-16'>
                <div className='w-full text-[16px] leading-[24px]'>加载中提示</div>
                <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] w-full mt-4'>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src={`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?${random}`}
                                width={100}
                                height={100}
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>默认提示</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src={`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?${random}`}
                                width={100}
                                height={100}
                                loadingIcon={
                                    <Image
                                        src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200'
                                    ></Image>
                                }
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>自定义提示<br />渐进式加载</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                src={`https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?${random}`}
                                width={100}
                                height={100}
                                showLoading={false}
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>禁用加载中提示</div>
                    </div>
                </div>

                <div className='mt-[12px]'>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--border-default)] rounded-md text-[16px] bg-[var(--color-primary)] select-none
                            text-[#FFF] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => setRandom(Date.now())}
                    >
                        <span>reload</span>
                    </button>
                </div>
            </div>

            <div className='w-full my-16'>
                <div className='w-full text-[16px] leading-[24px]'>加载失败提示</div>
                <div className='grid gap-4 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] w-full mt-4'>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                width={100}
                                height={100}
                                src='http'
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>默认提示</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                width={100}
                                height={100}
                                src='http'
                                errorIcon={
                                    <div className='w-full text-[#000] text-[16px] text-center'>加载失败</div>
                                }
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>自定义提示</div>
                    </div>
                    <div className='flex-none w-[100px]'>
                        <div className='w-[100px] h-[100px]'>
                            <Image
                                width={100}
                                height={100}
                                src='http'
                                showError={false}
                            ></Image>
                        </div>
                        <div className='w-full mt-4 text-[14px] leading-[24px] text-center'>禁用加载失败提示</div>
                    </div>
                </div>
            </div>

            <div className='w-full my-16'>
                <div className='w-full text-[16px] leading-[24px]'>禁用懒加载</div>
                <div className='w-full mt-4'>
                    <div className='w-[150px] h-[150px]'>
                        <Image
                            src='https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80'
                            width={150}
                            height={150}
                            lazyLoad={false}
                        ></Image>
                    </div>
                </div>
            </div>

            <div className='w-full my-16'>
                <div className='w-full text-[16px] leading-[24px]'>监听加载成功事件</div>
                <div className='w-full mt-4'>
                    <div className='w-[150px] h-[150px]'>
                        <Image
                            src='https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
                            width={150}
                            height={150}
                            onLoad={() => message.info('图片加载成功')}
                        ></Image>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageComponents
