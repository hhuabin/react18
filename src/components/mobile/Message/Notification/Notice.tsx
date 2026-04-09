/**
 * @Author: bin
 * @Date: 2026-04-02 15:15:48
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 15:30:52
 */
import { useState, useEffect } from 'react'

import type { NoticeConfig } from './interface'
import { clsx } from './utils/clsx'

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
    prefixCls: string;                           // 前缀类名
    eventKey: React.Key;                         // 唯一 key

    onNoticeClose?: (key: React.Key) => void;    // 手动关闭 / 倒计时结束触发

    hovering?: boolean;                          // 列表的鼠标悬停状态；有需要鼠标悬停在列表任意一元素，就停止所有提示的计时，可以开为 true
}

/**
 * @description Notice 提示框
 * 功能点：
 *  1. 手动关闭消息
 *  2. 倒计时结束关闭消息
 *  3. 鼠标移入消息，暂停倒计时
 *  4. 鼠标移出消息，恢复倒计时
 *  5. 管理倒计时 progress
 * @returns  Notice
 */
const Notice: React.FC<NoticeProps & { times?: number }> = (props) => {

    const {
        prefixCls,
        className,
        style,
        duration = 4500,             // 自动关闭的延时，单位毫秒。设为 0 时不自动关闭
        pauseOnHover = true,         // 悬停时是否暂停计时器，默认值为 true
        showProgress = false,        // 是否展示进度条

        eventKey,
        content,
        closable = false,

        onClick,                     // 点击提示时触发
        onNoticeClose,

        times,
        hovering: forcedHovering = false,
    } = props

    // 标记鼠标是否悬停在 notice 提示上
    const [hovering, setHovering] = useState(false)
    // 记录 提示显示 已经“消耗掉”的时间（毫秒）
    const [spentTime, setSpentTime] = useState(0)

    // 进度条百分比
    const [percent, setPercent] = useState(0)

    // 鼠标悬停时，是否暂停倒计时
    const mergedHovering = forcedHovering || hovering
    // 进度条有没有被开启
    const mergedShowProgress = duration > 0 && showProgress

    /**
     * @description 控制自动关闭代码
     * 触发时机：
     *  1. 首次渲染
     *  2. 鼠标移入（清理） / 移出（启动计时）
     *  3. times 变化（times是更新标志。消息的更新不会重置倒计时吗，只会继续剩余时间。也就是说消息的 更新前时间 + 更新后时间 = duration）
     */
    // 控制自动关闭
    useEffect(() => {
        // 只有 duration > 0 才会启动自动关闭
        if (!mergedHovering && duration > 0) {
            const start = Date.now() - spentTime

            const timeout = setTimeout(() => {
                onNoticeClose?.(eventKey)
            }, duration - spentTime)

            return () => {
                if (pauseOnHover) {
                    clearTimeout(timeout)
                }
                setSpentTime(Date.now() - start)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, mergedHovering, times])

    // 控制进度条动画
    useEffect(() => {
        if (!mergedHovering && mergedShowProgress && (pauseOnHover || spentTime === 0)) {
            const start = performance.now()
            let animationFrame: number

            const calculate = () => {
                cancelAnimationFrame(animationFrame)
                animationFrame = requestAnimationFrame((timestamp) => {
                    const runtime = timestamp + spentTime - start
                    const progress = Math.min(runtime / duration, 1)
                    setPercent(progress * 100)
                    if (progress < 1) {
                        calculate()
                    }
                })
            }

            calculate()

            return () => {
                if (pauseOnHover) {
                    cancelAnimationFrame(animationFrame)
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, spentTime, mergedHovering, mergedShowProgress, times])

    // ======================== Progress ========================
    const validPercent = 100 - (!percent || percent < 0 ? 0 : percent > 100 ? 100 : percent)

    return (
        <div
            className={
                clsx(
                    `${prefixCls}-notice`,
                    className,
                    { [`${prefixCls}-notice-closable`]: !!closable },
                )
            }
            style={style}
            onMouseEnter={(e) => {
                setHovering(true)
            }}
            onMouseLeave={(e) => {
                setHovering(false)
            }}
            onClick={onClick}
        >
            {/* 提示内容 */}
            <div className={`${prefixCls}-notice-content`}>{ content }</div>

            {/* 关闭按钮 */}
            {closable && (
                <button
                    className={`${prefixCls}-notice-close`}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onNoticeClose?.(eventKey)
                    }}
                >
                    {
                        (typeof closable === 'object' && closable !== null)
                            ?   (
                                    closable.closeIcon
                                )
                            :   (
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <line x1='25' y1='25' x2='75' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                                        <line x1='75' y1='25' x2='25' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                                    </svg>
                                )
                    }
                </button>
            )}

            {/* 进度条 */}
            {mergedShowProgress && (
                <progress className={`${prefixCls}-notice-progress`} max="100" value={validPercent}>
                    {validPercent + '%'}
                </progress>
            )}
        </div>
    )
}

export default Notice
