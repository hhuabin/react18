import { useState, useRef } from 'react'

import CSSMotion, { type CSSMotionRef } from '@/components/MyCSSMotion'

import styles from './CSSMotion.module.less'

// ─── 通用按钮 ────────────────────────────────────────────────
const Btn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        type='button'
        className='px-[16px] border border-[var(--color-border)] rounded-md text-[16px] bg-[var(--bg-color)] select-none
            text-[var(--color-text)] leading-[32px] hover:border-[var(--color-primary-hover)] hover:text-[var(--color-primary-hover)]'
        onClick={onClick}
    >
        {children}
    </button>
)

// ─── 状态标签 ────────────────────────────────────────────────
const Tag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <span className='inline-flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)]'>
        <span>{label}:</span>
        <code className='px-1 rounded bg-[var(--color-fill-secondary)] text-[var(--color-primary)]'>{value || '—'}</code>
    </span>
)

// ─── Demo 区块 ───────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className='w-full my-6'>
        <div className='w-full text-[16px] leading-[28px] font-medium mb-3'>{title}</div>
        <div className='w-full px-2'>{children}</div>
    </div>
)

// ====================================================================
//  Demo 1  fade（透明度）
// ====================================================================
const FadeDemo: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [log, setLog] = useState<string[]>([])

    const addLog = (msg: string) =>
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 4)])

    return (
        <Section title='1. fade — 淡入淡出'>
            <div className='flex items-center gap-3 mb-4'>
                <Btn onClick={() => setVisible(v => !v)}>
                    {visible ? '隐藏' : '显示'}
                </Btn>
                <Tag label='visible' value={String(visible)} />
            </div>

            {/* 占位容器，防止布局跳动 */}
            <div className='h-[80px]'>
                <CSSMotion
                    visible={visible}
                    motionName='demo-fade'
                    removeOnLeave={false}
                    onVisibleChanged={v => addLog(`onVisibleChanged(${v})`)}
                >
                    {({ className, style }, ref) => (
                        <div
                            className={`${styles.box} ${className ?? ''}`}
                            style={style}
                            ref={ref as React.Ref<HTMLDivElement>}
                        >
                            fade box
                        </div>
                    )}
                </CSSMotion>
            </div>

            {log.length > 0 && (
                <ul className='mt-2 text-[12px] text-[var(--color-text-secondary)] space-y-0.5'>
                    {log.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
            )}
        </Section>
    )
}

// ====================================================================
//  Demo 2  slide（高度展开）
// ====================================================================
const SlideDemo: React.FC = () => {
    const [visible, setVisible] = useState(false)

    return (
        <Section title='2. slide — 滑动展开'>
            <div className='flex items-center gap-3 mb-4'>
                <Btn onClick={() => setVisible(v => !v)}>
                    {visible ? '收起' : '展开'}
                </Btn>
            </div>

            <div className={styles.slideWrap}>
                <CSSMotion visible={visible} motionName='demo-slide' removeOnLeave>
                    {({ className, style }, ref) => (
                        <div
                            className={`${styles.slideBox} ${className ?? ''}`}
                            style={style}
                            ref={ref as React.Ref<HTMLDivElement>}
                        >
                            <p>第一行内容</p>
                            <p>第二行内容</p>
                            <p>第三行内容</p>
                        </div>
                    )}
                </CSSMotion>
            </div>
        </Section>
    )
}

// ====================================================================
//  Demo 3  zoom（缩放）
// ====================================================================
const ZoomDemo: React.FC = () => {
    const [visible, setVisible] = useState(false)

    return (
        <Section title='3. zoom — 缩放'>
            <div className='flex items-center gap-3 mb-4'>
                <Btn onClick={() => setVisible(v => !v)}>
                    {visible ? '缩小' : '放大'}
                </Btn>
            </div>

            <div className='h-[80px]'>
                <CSSMotion visible={visible} motionName='demo-zoom' removeOnLeave>
                    {({ className, style }, ref) => (
                        <div
                            className={`${styles.box} ${className ?? ''}`}
                            style={style}
                            ref={ref as React.Ref<HTMLDivElement>}
                        >
                            zoom box
                        </div>
                    )}
                </CSSMotion>
            </div>
        </Section>
    )
}

// ====================================================================
//  Demo 4  deadline 超时兜底
// ====================================================================
const DeadlineDemo: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [log, setLog] = useState<string[]>([])

    return (
        <Section title='4. motionDeadline — 超时强制结束'>
            <p className='text-[13px] text-[var(--color-text-secondary)] mb-3'>
                该 box 无 CSS transition，依赖 500ms deadline 超时结束动画。
            </p>
            <div className='flex items-center gap-3 mb-4'>
                <Btn onClick={() => setVisible(v => !v)}>
                    {visible ? '隐藏' : '显示'}
                </Btn>
            </div>

            <div className='h-[80px]'>
                <CSSMotion
                    visible={visible}
                    motionName='demo-fade'
                    motionDeadline={500}
                    removeOnLeave
                    onVisibleChanged={v => setLog(prev => [`deadline ended → visible=${v}`, ...prev.slice(0, 3)])}
                >
                    {({ className, style }, ref) => (
                        <div
                            className={`${styles.box} ${styles.noTransition} ${className ?? ''}`}
                            style={style}
                            ref={ref as React.Ref<HTMLDivElement>}
                        >
                            no-transition box
                        </div>
                    )}
                </CSSMotion>
            </div>

            {log.length > 0 && (
                <ul className='mt-2 text-[12px] text-[var(--color-text-secondary)] space-y-0.5'>
                    {log.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
            )}
        </Section>
    )
}

// ====================================================================
//  Demo 5  ref 访问
// ====================================================================
const RefDemo: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const motionRef = useRef<CSSMotionRef>(null)
    const [info, setInfo] = useState('')

    const readRef = () => {
        const r = motionRef.current
        if (!r) return
        setInfo(`inMotion=${r.inMotion()}  enableMotion=${r.enableMotion()}`)
    }

    return (
        <Section title='5. ref — 访问内部状态'>
            <div className='flex items-center gap-3 mb-4 flex-wrap'>
                <Btn onClick={() => setVisible(v => !v)}>
                    {visible ? '隐藏' : '显示'}
                </Btn>
                <Btn onClick={readRef}>读取 ref</Btn>
                {info && <code className='text-[13px] text-[var(--color-primary)]'>{info}</code>}
            </div>

            <div className='h-[80px]'>
                <CSSMotion ref={motionRef} visible={visible} motionName='demo-fade' removeOnLeave>
                    {({ className, style }, ref) => (
                        <div
                            className={`${styles.box} ${className ?? ''}`}
                            style={style}
                            ref={ref as React.Ref<HTMLDivElement>}
                        >
                            ref box
                        </div>
                    )}
                </CSSMotion>
            </div>
        </Section>
    )
}

// ====================================================================
//  Page
// ====================================================================
const CSSMotionDemo: React.FC = () => {
    return (
        <div className='w-full min-h-full p-6'>
            <FadeDemo />
            <SlideDemo />
            <ZoomDemo />
            <DeadlineDemo />
            <RefDemo />
        </div>
    )
}

export default CSSMotionDemo
