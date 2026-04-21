import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

import useTouch from './useTouch'
import styles from './SinglePicker.module.less'

import type { PickerProps } from './SinglePicker.d'

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
 *      通过 style 动态改变CSS属性 transform: translateY，实现滚动
 *      实时滚动动画时长为0ms，一般滚动动画时长为 200ms，惯性滚动动画时长为 1000ms
 * 功能：
 * 1. 惯性滚动，inertialScrolling()
 * 2. 滚动在较近的一项，updateValueByIndex()
 */
const SinglePicker: React.FC<PickerProps> = (props) => {

    const {
        visible = true,
        columns = [],
        defaultIndex = 0,
        title = '',
        cancelText = '取消',
        confirmText = '确定',
        primaryColor = '#1989fa',
        visibleOptionNum = 6,
    } = props

    // 第一项居中的基础偏移的距离
    const baseOffset = COLUMN_HEIGHT * (+visibleOptionNum - 1) / 2
    // 默认选中项的偏移距离
    const initOffset = () => (baseOffset - clamp(0, defaultIndex, columns.length - 1) * COLUMN_HEIGHT)

    const [transformY, setTransformY] = useState(initOffset())
    const [transitionDuration, setTransitionDuration] = useState(0)

    const wrapperElementRef = useRef<HTMLUListElement | null>(null)
    const lastIndex = useRef(defaultIndex) // 缓存上一次的选中项
    const startOffset = useRef(0)          // 滑动开始时的 transformY
    const moving = useRef(false)           // 滚动判定，正在滚动时点击无效
    const inertialStartTime = useRef(0)    // 惯性滚动前置时间，用于惯性滚动判定
    const inertialOffset = useRef(0)       // 惯性滚动前置偏移量，用于惯性滚动判定

    const touch = useTouch()

    useEffect(() => {
        setTransitionDuration(0)
        updateValueByIndex(lastIndex.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    /**
     * 获取偏移量对应的索引
     * @param offset 当前偏移距离
     * @returns 索引
     */
    const getIndexByOffset = (offset: number) => {
        // 根据当前偏移距离，计算索引，但是索引可能会超出边界，所以需要处理一下
        const notTrustedIndex = Math.round((-offset + baseOffset) / COLUMN_HEIGHT)
        // 计算正常范围内的索引
        const trustedIndex = clamp(notTrustedIndex, 0, columns.length - 1)
        return trustedIndex
    }

    /**
     * 获取当前滚动的索引
     * @returns 索引
     */
    const currentIndex = () => getIndexByOffset(transformY)

    /**
     * 让滚动定格在某一项
     * 根据索引更新偏移量，也是每个更新最后执行的函数
     * @param index 索引
     */
    const updateValueByIndex = (index: number) => {
        const offset = baseOffset - index * COLUMN_HEIGHT
        /**
         * 这个位置可以增加 onChange 事件，由于用的少，此处不写
         * props.onChange?.()
         */
        setTransformY(offset)
    }

    /**
     * 惯性滚动
     * @param distance 滚动的距离
     * @param duration 持续时间
     */
    const inertialScrolling = (distance: number, duration: number) => {
        const speed = Math.abs(distance / duration)
        // 增加惯性滚动距离
        distance = transformY + speed / 3e-3 * (distance < 0 ? -1 : 1)
        setTransitionDuration(INERTIAL_SLIDE_DURATION)
        const index = getIndexByOffset(distance)
        updateValueByIndex(index)
    }

    const stopInertialScrolling = () => {
        setTransitionDuration(0)
        moving.current = false
    }

    const onClickOption = (index: number) => {
        if (moving.current) return
        setTransitionDuration(DEFAULT_DURATION)
        updateValueByIndex(index)
    }

    /**
     * 1. 记录触摸开始时的偏移量，用于惯性滚动判定
     * 2. 当正处于滚动时，暂停滚动，从新计算滚动距离
     */
    const onTouchStart = (event: React.TouchEvent) => {
        touch.start(event)
        let _transformY = transformY
        if (moving.current) {
            const { transform } = window.getComputedStyle(wrapperElementRef.current as HTMLUListElement)
            _transformY = Number(transform.slice(7, transform.length - 1).split(', ')[5])
            setTransformY(_transformY)
        }
        setTransitionDuration(0)
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
        const maxColumuHeight = columns.length * COLUMN_HEIGHT
        const newOffset = clamp(startOffset.current + touch.deltaY.current, -maxColumuHeight + baseOffset, baseOffset + COLUMN_HEIGHT)
        setTransformY(newOffset)
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
        setTransitionDuration(DEFAULT_DURATION)
        const index = getIndexByOffset(transformY)
        updateValueByIndex(index)
        setTimeout(() => {
            moving.current = false
        }, 0)
    }

    const onClickMask = () => {
        onCancel()
    }

    const onCancel = () => {
        props.onCancel?.()
    }

    const onConfirm = () => {
        const selectIndex = currentIndex()
        const selectOption = columns[currentIndex()]
        const selectValue = typeof selectOption === 'string' ? selectOption.toString() : selectOption.value
        lastIndex.current = selectIndex
        props.onConfirm?.({ selectIndex, selectOption, selectValue })
    }

    return createPortal(
        <>
            <div
                className={styles['picker-popup'] + ' ' + (visible ? '' : styles['picker-popup-hidden'])}
                style={{ '--color-primary': primaryColor } as React.CSSProperties}
            >
                <div role='button' className={styles['overlay'] + ' ' + (visible ? '' : styles['overlay-hidden'])}
                    onClick={() => onClickMask()}
                ></div>

                <div className={styles['popup-body'] + ' ' + (visible ? '' : styles['popup-hidden'])}>
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
                        >
                            <ul
                                ref={wrapperElementRef}
                                className={styles['picker-column-wrapper']}
                                style={{
                                    transform: `translateY(${transformY}px)`,
                                    transitionDuration: `${transitionDuration}ms`,
                                    transitionProperty: transitionDuration ? 'all' : 'none',
                                }}
                                onTransitionEnd={() => stopInertialScrolling()}
                            >
                                {columns.map((item, index) => (
                                    <li
                                        role='button'
                                        tabIndex={index}
                                        className={styles['picker-column-item']}
                                        key={index}
                                        onClick={() => onClickOption(index)}
                                        style={{ color: ((index === currentIndex() && transitionDuration !== 1000) ? 'var(--color-primary)' : '') }}
                                    >
                                        <div className={styles['line-ellipsis']}>
                                            { typeof item === 'string' ? item.toString() : item.label }
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
                </div>
            </div>
        </>,
        document.body,
    )
}

export default SinglePicker
