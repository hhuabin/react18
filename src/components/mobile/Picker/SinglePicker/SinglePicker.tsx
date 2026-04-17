/**
 * @Author: bin
 * @Date: 2025-09-11 15:02:42
 * @LastEditors: bin
 * @LastEditTime: 2025-11-14 10:44:19
 */
/* eslint-disable max-lines */
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useMergedState } from '@/hooks/core'
import useTouch from './useTouch'
import styles from './SinglePicker.module.less'

import type { PickerOption, PickerColumn, PickerConfirmEventParams } from './SinglePicker.d'

type PickerProps<T extends string | number | PickerOption = string | number | PickerOption> = {
    visible?: boolean;                      // 是否显示
    columns?: T[];                          // 配置列的选项
    defaultIndex?: number;                  // 默认选中项
    loading?: boolean;                      // 是否显示加载中
    title?: string;                         // 标题
    cancelText?: string;                    // 取消按钮的文字
    confirmText?: string;                   // 确定按钮的文字
    primaryColor?: string;                  // 主题色
    visibleOptionNum?: number;              // 可见的选项个数
    className?: string;                     // 自定义类名
    style?: React.CSSProperties;            // 自定义样式
    onChangeVisible?: (value: boolean) => void;                   // 显示状态改变时触发函数
    onConfirm?: (params: PickerConfirmEventParams<T>) => void;    // 确认时触发函数
    onCancel?: () => void;                  // 取消时触发函数
}

const DEFAULT_DURATION = 200         // 默认动画时长
const INERTIAL_SLIDE_TIME = 300      // 惯性滚动判定时间，在该时间范围内为惯性滚动
const INERTIAL_SLIDE_DISTANCE = 15   // 惯性滚动判定距离
const INERTIAL_SLIDE_DURATION = 1000 // 惯性滚动动画时长
const COLUMN_HEIGHT = 44             // 列高

// 获取中间的数字
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

/**
 * Picker 选择器
 * 原理：通过 touch 事件，记录触摸点位移，根据位移计算滚动距离
 *      使用 animation 改变CSS属性 transform: translateY，实现滚动
 *      实时滚动动画时长为0ms，一般滚动动画时长为 200ms，惯性滚动动画时长为 1000ms
 *      动画使用 Web Animation API，相对于 style 动态改变样式性能更好
 * 功能：
 * 1. 惯性滚动，inertialScrolling()
 * 2. 滚动在较近的一项，updateValueByIndex()
 */
const SinglePicker: React.FC<PickerProps> = (props) => {

    const {
        visible,
        columns,
        defaultIndex = 0,
        loading = false,
        title = '',
        cancelText = '取消',
        confirmText = '确定',
        primaryColor = '#1989fa',
        visibleOptionNum = 6,
        className = '',
        style = {},
    } = props

    const [mergeColumns, setMergeColumns] = useMergedState([], {
        value: columns,
    })

    const [mergeVisible, setMergeVisible] = useMergedState(true, {
        value: visible,
        onChange: (value) => {
            props.onChangeVisible?.(value)
        },
    })

    // 第一项居中的基础偏移的距离
    const baseOffset = COLUMN_HEIGHT * (+visibleOptionNum - 1) / 2

    const [transformY, setTransformY] = useState(0)                         // 当前偏移量
    const [isInertialScrolling, setIsInertialScrolling] = useState(false)   // 是否正在惯性滚动

    const wrapperElementRef = useRef<HTMLUListElement | null>(null)
    const lastIndex = useRef(+defaultIndex || 0)    // 缓存上一次的选中项

    const startOffset = useRef(0)              // 滑动开始时的 transformY
    const moving = useRef(false)               // 滚动判定，正在滚动时点击无效
    const inertialStartTime = useRef(0)        // 惯性滚动前置时间，用于惯性滚动判定
    const inertialOffset = useRef(0)           // 惯性滚动前置偏移量，用于惯性滚动判定

    const touch = useTouch()

    useEffect(() => {
        // columns 更新，重置选中项目为默认选中项
        setIsInertialScrolling(false)
        updateValueByIndex(+defaultIndex || 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns])

    useEffect(() => {
        setIsInertialScrolling(false)
        updateValueByIndex(lastIndex.current, 0)

        const origin = document.body.style.overflow
        if (mergeVisible) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = origin
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mergeVisible])

    /**
     * @description 根据偏移量获取对应的索引
     * @param offset 当前偏移距离
     * @returns mergeColumns 下标索引
     */
    const getIndexByOffset = (offset: number) => {
        // 根据当前偏移距离，计算索引，但是索引可能会超出边界，所以需要处理一下
        const notTrustedIndex = Math.round((-offset + baseOffset) / COLUMN_HEIGHT)
        // 计算正常范围内的索引
        const trustedIndex = clamp(notTrustedIndex, 0, mergeColumns.length - 1)
        return trustedIndex
    }

    /**
     * @description 获取当前滚动的索引
     * @returns mergeColumns 下标索引
     */
    const getCurrentIndex = () => getIndexByOffset(transformY)

    /**
     *@description 让滚动定格在某一项
     * 根据索引更新偏移量，也是每个更新最后执行的函数
     * @param index mergeColumns 索引
     * @param duration 动画时长
     */
    const updateValueByIndex = (columnsIndex: number, duration: number) => {
        const offset = baseOffset - clamp(columnsIndex, 0, mergeColumns.length - 1) * COLUMN_HEIGHT
        /**
         * 这个位置可以增加 onChange 事件，由于用的少，此处不写
         * props.onChange?.()
         */
        updateAnimate(offset, duration)
    }

    /**
     * @description 惯性滚动
     * @param distance 滚动的距离
     * @param duration 持续时间
     */
    const inertialScrolling = (distance: number, duration: number) => {
        const speed = Math.abs(distance / duration)
        // 增加惯性滚动距离
        distance = transformY + speed / 3e-3 * (distance < 0 ? -1 : 1)
        const index = getIndexByOffset(distance)
        setIsInertialScrolling(true)
        updateValueByIndex(index, INERTIAL_SLIDE_DURATION)
    }

    // 停止惯性滚动
    const stopInertialScrolling = () => {
        setIsInertialScrolling(false)
        moving.current = false
    }

    const onClickOption = (index: number) => {
        if (moving.current) return
        setIsInertialScrolling(false)
        updateValueByIndex(index, DEFAULT_DURATION)
    }

    /**
     * 1. 记录触摸开始时的偏移量，用于惯性滚动判定
     * 2. 当正处于滚动时，暂停滚动，从新计算滚动距离
     */
    const onTouchStart = (event: React.TouchEvent) => {
        touch.start(event)
        setIsInertialScrolling(false)
        let _transformY = transformY
        if (moving.current) {
            const { transform } = window.getComputedStyle(wrapperElementRef.current as HTMLUListElement)
            _transformY = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform).m42
            updateAnimate(_transformY, 0)
        }
        startOffset.current = _transformY        // 定义滑动开始前的位置
        inertialOffset.current = _transformY     // 记录惯性滚动偏移前位置
        inertialStartTime.current = Date.now()   // 记录惯性滚动开始时间
    }
    /**
     * 1. 计算可以滑动的最大距离和最小距离
     * 2. 实时更新动画
     * 3. 重新定义惯性滚动的起始偏移量
     */
    const onTouchMove = (event: React.TouchEvent) => {
        touch.move(event)
        event.stopPropagation()     // 停止传播
        if (touch.isVertical()) moving.current = true
        // 计算可以滑动的最大距离和最小距离
        const maxColumuHeight = mergeColumns.length * COLUMN_HEIGHT
        const newOffset = clamp(startOffset.current + touch.deltaY.current, -maxColumuHeight + baseOffset, baseOffset + COLUMN_HEIGHT)
        updateAnimate(newOffset, 0)
        const now = Date.now()
        // 超过触发惯性滚动的时间，重新定义惯性滚动的偏移量
        if (now - inertialStartTime.current > INERTIAL_SLIDE_TIME) {
            inertialStartTime.current = now
            inertialOffset.current = newOffset
        }
    }
    /**
     * 1. 惯性滚动判定
     * 2. 定格在某一项
     */
    const onTouchEnd = (event: React.TouchEvent) => {
        // 判定是否属于惯性滚动
        const distance = transformY - inertialOffset.current
        const duration = Date.now() - inertialStartTime.current
        if (Math.abs(distance) > INERTIAL_SLIDE_DISTANCE && duration < INERTIAL_SLIDE_TIME) {
            inertialScrolling(distance, duration)
            return
        }
        // 非惯性滚动需要定格在某一项
        const index = getIndexByOffset(transformY)
        updateValueByIndex(index, DEFAULT_DURATION)
        setTimeout(() => {
            moving.current = false
        }, 0)
    }

    /**
     * @description 更新动画
     * @param endTransformY 动画结束的偏移量
     * @param transitionDuration 动画时间
     */
    const updateAnimate = (endTransformY: number, transitionDuration = 0) => {
        if (endTransformY === transformY) return
        // 记录当前偏移量
        setTransformY(endTransformY)
        // 获取动画当前的偏移量
        const { transform } = window.getComputedStyle(wrapperElementRef.current as HTMLUListElement)
        const currentTransformY = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform).m42
        const keyframes: Keyframe[] = [
            { transform: `translateY(${currentTransformY}px)` },
            { transform: `translateY(${endTransformY}px)` },
        ]
        const options: KeyframeAnimationOptions = {
            duration: transitionDuration,
            fill: 'forwards',
            easing: 'cubic-bezier(.23, 1, .68, 1)',
        }
        // 取消之前的动画
        wrapperElementRef.current?.getAnimations().forEach(animation => animation.cancel())
        const animation = wrapperElementRef.current?.animate(keyframes, options)
        if (transitionDuration === INERTIAL_SLIDE_DURATION) {
            animation?.finished.then(() => {
                // 惯性滚动结束触发
                stopInertialScrolling()
            }, () => {})
        }
    }

    const onClickMask = () => {
        onCancel()
    }

    const onCancel = () => {
        setMergeVisible(false)
        props.onCancel?.()
    }

    const onConfirm = () => {
        setMergeVisible(false)
        const selectIndex = getCurrentIndex()
        const selectOption = mergeColumns[getCurrentIndex()]
        const selectValue = ['string', 'number'].includes(typeof selectOption)
            ? (selectOption as unknown as string | number) : (selectOption as PickerOption).value
        lastIndex.current = selectIndex
        props.onConfirm?.({ selectIndex, selectOption, selectValue })
    }

    return createPortal(
        <>
            <div
                className={styles['picker-popup'] + `${className ? ' ' + className : ''}` + ' ' + (mergeVisible ? '' : styles['picker-popup-hidden'])}
                style={{ ...style, '--primary-color': primaryColor || (style as Record<string, string>)['--primary-color'] } as React.CSSProperties }
            >
                <div role='button' className={styles['overlay'] + ' ' + (mergeVisible ? '' : styles['overlay-hidden'])}
                    onClick={() => onClickMask()}
                ></div>

                <div className={styles['popup-body'] + ' ' + (mergeVisible ? '' : styles['popup-hidden'])}>
                    <div className={styles['picker-header']}>
                        <button
                            type='button'
                            className={styles['picker-header-cancel-button']}
                            onClick={() => onCancel()}
                        >
                            { cancelText || '取消' }
                        </button>
                        <div className={styles['picker-header-title']}>{ title || '' }</div>
                        <button
                            type='button'
                            className={styles['picker-header-confirm-button']}
                            onClick={() => onConfirm()}
                        >
                            { confirmText || '确定' }
                        </button>
                    </div>
                    <div
                        className={styles['picker-body']}
                        style={{ height: (+visibleOptionNum * COLUMN_HEIGHT) + 'px' }}
                    >
                        <div
                            className={styles['picker-column']}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onTouchCancel={onTouchEnd}
                        >
                            <ul
                                ref={wrapperElementRef}
                                className={styles['picker-column-wrapper']}
                            >
                                {mergeColumns.map((item, index) => (
                                    <li
                                        role='button'
                                        tabIndex={index}
                                        className={styles['picker-column-item']}
                                        key={index}
                                        onClick={() => onClickOption(index)}
                                        style={{ color: ((index === getCurrentIndex() && !isInertialScrolling) ? 'var(--primary-color)' : '') }}
                                    >
                                        <div className={styles['line-ellipsis']}>
                                            { ['string', 'number'].includes(typeof item) ? item.toString() : (item as PickerOption).label }
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div
                            className={styles['picker-mask']}
                            style={{ backgroundSize: '100% ' + ((+visibleOptionNum - 1) * COLUMN_HEIGHT / 2) + 'px' }}
                        ></div>
                        <div className={styles['picker-frame']}></div>
                    </div>

                    {loading && (
                        <div className={styles['picker-loading']}>
                            <svg width='50px' height='50px' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                <circle cx='25' cy='50' r='6' fill={`${primaryColor}`}>
                                    <animate attributeName='cx' values='25;50;25' dur='1s' repeatCount='indefinite' begin='0s' />
                                    <animate attributeName='fill' values={`${primaryColor}bf;${primaryColor};${primaryColor}bf`} dur='1s' repeatCount='indefinite' begin='0s' />
                                </circle>
                                <circle cx='50' cy='50' r='6' fill={`${primaryColor}`}>
                                    <animate attributeName='r' values='6;9;6' dur='1s' repeatCount='indefinite' begin='0s' />
                                    <animate attributeName='fill' values={`${primaryColor}bf;${primaryColor};${primaryColor}bf`} dur='1s' repeatCount='indefinite' begin='0s' />
                                </circle>
                                <circle cx='75' cy='50' r='6' fill={`${primaryColor}`}>
                                    <animate attributeName='cx' values='75;50;75' dur='1s' repeatCount='indefinite' begin='0s' />
                                    <animate attributeName='fill' values={`${primaryColor}bf;${primaryColor};${primaryColor}bf`} dur='1s' repeatCount='indefinite' begin='0s' />
                                </circle>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body,
    )
}

export default SinglePicker
