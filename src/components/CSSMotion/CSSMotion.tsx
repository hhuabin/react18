import {
    useState, useRef, useEffect,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'

export type MotionStatus =
    | 'none'
    | 'appear'
    | 'enter'
    | 'leave'

export type StepStatus =
  | 'none'
  | 'prepare'
  | 'start'
  | 'active'
  | 'end'
  // Skip motion only
  | 'prepared'

type CSSMotionProps = {
    visible?: boolean;
    motionName?: string;
    removeOnLeave?: boolean;
    children?: React.ReactNode;
}
export interface CSSMotionRef {
    nativeElement: HTMLElement;
    inMotion: () => boolean;          // 当前是否处于动画阶段
    enableMotion: () => boolean;      // 当前是否允许动画
}
// 参考开发中，未投入使用
// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function CSSMotion(props: CSSMotionProps, ref: ForwardedRef<CSSMotionRef>) {
    const {
        visible = false,
        motionName,
    } = props

    const [status, setStatus] = useState<MotionStatus>('none')
    const nodeRef = useRef<HTMLDivElement | null>(null)

    // 监听 visible 变化
    useEffect(() => {}, [visible])

    useImperativeHandle(ref, () => ({
        nativeElement: nodeRef.current!,
        inMotion: () => status !== 'none',
        enableMotion: () => !!motionName,
    }), [status, motionName])

    return (
        <div
            ref={nodeRef}
        >


        </div>
    )
})
