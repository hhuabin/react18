import { useState, useEffect, memo, forwardRef, type ForwardedRef, useRef } from 'react'

import CSSMotion from '@/components/CSSMotion'

import './CSSMotion.less'

type MemoProps = {
    className: string;
}

// eslint-disable-next-line prefer-arrow-callback
const ForwardedComponent = forwardRef(function ForwardedComponent(
    { className: motionClassName }: MemoProps,
    ref: React.Ref<HTMLDivElement>,        // 这个 ref 来自父组件或 CSSMotion，用于访问真实 DOM
) {
    // 把 CSSMotion 的 ref 绑定到当前的 HTMLDivElement
    // 这样父组件 / CSSMotion 就能直接访问 DOM 节点，绑定动画事件或操作 DOM
    return (
        <div
            ref={ref}
            className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
        />
    )
})
const MemoComponent = memo(ForwardedComponent)

const CSSMotionComponents: React.FC = () => {

    const [enterVisible, setEnterVisible] = useState(true)
    const [memoVisible, setMemoVisible] = useState(true)

    // 记忆组件

    return (
        <div className={'css-motion' + ' w-full min-h-full'}>
            <div className='w-full p-3'>
                <div className='flex items-center full'>
                    <div className=''>enter（进入）</div>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => { setEnterVisible(!enterVisible) }}
                    >
                        <span>change enter</span>
                    </button>
                </div>
                <div className='w-full h-[150px] mt-2'>
                    <CSSMotion
                        visible={enterVisible}
                        motionName="fade"
                        motionAppear={false}
                        removeOnLeave
                    >
                        {({ className: motionClassName, style: motionStyle }, motionRef) => (
                            <div
                                className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                                style={motionStyle}
                            ></div>
                        )}
                    </CSSMotion>
                </div>
            </div>

            <div className='w-full p-3'>
                <div className='flex items-center full'>
                    <div className=''>Memo记忆组件</div>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => { setMemoVisible(!memoVisible) }}
                    >
                        <span>appear</span>
                    </button>
                </div>
                <div className='w-full h-[150px] mt-2'>
                    <CSSMotion
                        visible={memoVisible}
                        motionName="fade"
                        motionAppear={false}
                        removeOnLeave
                    >
                        {({ className }) => <MemoComponent className={className!} />}
                    </CSSMotion>
                </div>
            </div>
        </div>
    )
}

export default CSSMotionComponents
