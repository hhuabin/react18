import { useState, memo, forwardRef } from 'react'

import CSSMotion from '@/components/CSSMotion'

import './CSSMotion.less'

type MemoProps = {
    visible?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

// eslint-disable-next-line prefer-arrow-callback
const ForwardedComponent = forwardRef(function ForwardedComponent(
    { className: motionClassName, style: motionStyle }: MemoProps,
    ref: React.Ref<HTMLDivElement>,        // 这个 ref 来自父组件或 CSSMotion，用于访问真实 DOM
) {
    // 把 CSSMotion 的 ref 绑定到当前的 HTMLDivElement
    // 这样父组件 / CSSMotion 就能直接访问 DOM 节点，绑定动画事件或操作 DOM
    return (
        <div
            ref={ref}
            className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
            style={motionStyle}
        />
    )
})
// memo 组件需要配合 forwardRef 组件使用
const MemoComponent = memo(ForwardedComponent)

const CSSMotionComponents: React.FC = () => {

    const [showAppear, setShowAppear] = useState(true)
    const [appearVisible, setAppearVisible] = useState(true)
    const [enterVisible, setEnterVisible] = useState(true)
    const [memoVisible, setMemoVisible] = useState(true)

    const changeShowAppear = () => {
        if (!showAppear) {
            setShowAppear(true)
            setAppearVisible(true)
        } else {
            setAppearVisible(false)
        }
    }
    const onVisibleChanged = (visible: boolean) => {
        setShowAppear(visible)
    }

    return (
        <div className={'css-motion' + ' w-full min-h-full'}>
            <div className='w-full p-3' key={1}>
                <div className='flex items-center full'>
                    <div className=''>appear（首次进入）</div>
                    <button
                        type='button'
                        className='px-[16px] border border-[var(--color-border)] rounded-md m-2 text-[16px] bg-[var(--bg-color)] select-none
                            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
                        onClick={() => { changeShowAppear() }}
                    >
                        <span>change show appear</span>
                    </button>
                </div>
                <div className='w-full h-[150px] mt-2'>
                    {
                        showAppear && (
                            <CSSMotion
                                visible={appearVisible}
                                motionName="fade"
                                motionAppear={true}
                                removeOnLeave={true}
                                onVisibleChanged={onVisibleChanged}
                            >
                                {({ className: motionClassName, style: motionStyle }, motionRef) => (
                                    <div
                                        ref={motionRef}
                                        className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                                        style={motionStyle}
                                    ></div>
                                )}
                            </CSSMotion>
                        )
                    }
                </div>
            </div>

            <div className='w-full p-3' key={2}>
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
                        removeOnLeave={false}
                    >
                        {({ className: motionClassName, style: motionStyle }, motionRef) => (
                            <div
                                ref={motionRef}
                                className={'motion-children' + (motionClassName ? ' ' + motionClassName : '')}
                                style={motionStyle}
                            ></div>
                        )}
                    </CSSMotion>
                </div>
            </div>

            <div className='w-full p-3' key={3}>
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
                        removeOnLeave={false}
                    >
                        {({ className, style }) => <MemoComponent className={className} style={style} />}
                    </CSSMotion>
                </div>
            </div>
        </div>
    )
}

export default CSSMotionComponents
