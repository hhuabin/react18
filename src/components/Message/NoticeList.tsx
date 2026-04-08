/**
 * @Author: bin
 * @Date: 2025-07-11 18:23:24
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 10:17:49
 */
/**
 * 参考源码：notification/src/NoticeList.tsx
 */
import {
    useState, useEffect, useContext,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'
import { createPortal } from 'react-dom'

import { ConfigContext } from '@/components/ConfigProvider/context'
import type { ConfigOptions, ArgsProps, MessageConfig } from './Message.d'
import renderIcon from './utils/renderIcon'
import './style/message.less'
import { diffKeys } from './utils/oldDiff'

type NoticeConfig = MessageConfig & {
    isClose?: boolean;
}

type NoticeListProps = {
    messageConfigList: MessageConfig[];            // 被监控的消息列表
    onNoticeClose?: (key: React.Key) => void;      // 删除消息函数
}
type NoticeProps = {
    notice: NoticeConfig;
    onNoticeClose?: (key: React.Key) => void;      // 隐藏该通知，触发关闭动画
    onNoticeDelete?: (key: React.Key) => void;     // 删除该通知
}

export type NotificationsRef = {
    open: (config: ArgsProps) => void;
    close: (key: React.Key) => void;
    destroy: () => void;
}

const DEFAULT_DURATION = 3000

/**
 * @description 执行关闭动画；倒计时结束关闭消息
 */
const RCNotice: React.FC<NoticeProps> = (props) => {

    const { notice } = props

    useEffect(() => {

        /**
         * @description 从生成开始就倒计时删除该元素
         */
        const { duration } = notice

        let timer: NodeJS.Timeout | null = null
        if (!duration && duration !== 0) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                props.onNoticeClose?.(notice.key)
            }, DEFAULT_DURATION)
        } else if (duration === 0) {
            // 0 表示持久通知
        } else if (duration > 0) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                props.onNoticeClose?.(notice.key)
            }, duration)
        }
        return () => {
            // 销毁时清除定时器
            if (timer) clearTimeout(timer)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 动画执行完毕，删除该元素
    const onAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.animationName === 'message-move-out') {
            props.onNoticeDelete?.(notice.key)
        }
    }

    /**
     * bug：优化处理 message 离开动画稍显卡顿
     */
    return (
        <div
            className={'bin-message-notice-wrapper' + (notice.isClose ? ' bin-message-notice-wrapper-leave' : '')}
            style={{ ...(notice.style ?? {}) }}
            onAnimationEnd={(e) => onAnimationEnd(e)}
        >
            <div className='bin-message-notice'>
                <div className='bin-message-notice-content'>
                    <div className='bin-message-custom-content'>
                        { notice.icon
                            ? notice.icon
                            : (
                                    notice.type && (
                                        <span className='bin-message-icon'>
                                            { renderIcon(notice.type) }
                                        </span>
                                    )
                                )
                        }
                        <span className='bin-message-content'>{notice.content}</span>
                        { notice.showCloseBtn && (
                            <span className='bin-message-close' onClick={() => props.onNoticeClose?.(notice.key)}>
                                <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                    <line x1='25' y1='25' x2='75' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                                    <line x1='75' y1='25' x2='25' y2='75' stroke='currentColor' strokeWidth='8' strokeLinecap='round' />
                                </svg>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * @description 作用：采用 观察者模式 ，监控 props.messageConfigList
 * 当 messageConfigList 变化时，同步改变 noticeList 状态
 * 当 messageConfigList 原来的消息被删除时，noticeList 的对应元素添加 { isClose: true }
 * 当 visible = false 时，<Notice /> 执行关闭动画，动画完成时，删除 noticeList 的对应元素
 */
export const RCNoticeList: React.FC<NoticeListProps> = (props) => {

    const { messageConfigList } = props
    const [noticeList, setNoticeList] = useState<NoticeConfig[]>([])

    // 获取全局配置，修改主题等
    const globalConfig = useContext(ConfigContext)

    useEffect(() => {
        if (!messageConfigList.length) {
            // 当传入值为空，关闭全部通知
            closeAllNotice()
        } else if (!noticeList.length) {
            // 当通知列表为空，直接赋值即可
            setNoticeList(messageConfigList)
        } else {
            /**
             * 当两个列表都有值时，精细对比
             * 该方案为核心 diff 函数
             */
            const resultList = diffKeys(noticeList, messageConfigList)
            setNoticeList(resultList)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.messageConfigList])

    // 直接删除messageConfigList的消息，触发noticeList的关闭函数
    const onNoticeClose = (key: React.Key) => {
        props.onNoticeClose?.(key)
        closeNotice(key)
    }

    // 关闭全部通知，触发关闭动画，关闭动画结束会自动删除全部通知
    const closeAllNotice = () => {
        setNoticeList(noticeList => {
            if (!noticeList.length) return noticeList
            const clone = noticeList.map(item => ({ ...item, isClose: true }))
            return clone
        })
    }

    // 关闭某个通知，触发关闭动画，关闭动画结束会自动删除该通知
    const closeNotice = (key: React.Key) => {
        setNoticeList(noticeList => {
            const index = noticeList.findIndex(item => item.key === key)
            if (index === -1) return noticeList

            const clone = [...noticeList]
            clone[index] = { ...clone[index], isClose: true }
            return clone
        })
    }

    // 删除 noticeList 单个通知
    const deleteNotice = (key: React.Key) => {
        setNoticeList(noticeList => {
            const index = noticeList.findIndex(item => item.key === key)
            if (index === -1) return noticeList

            return noticeList.filter(item => item.key !== key)
        })
    }

    if (!!noticeList.length) {
        return (
            <div
                className='bin-message'
                style={{
                    '--bg-color': globalConfig.theme === 'dark' ? '#1f1f1f' : '',
                    '--color-text': globalConfig.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '',
                    '--content-shadow': globalConfig.theme === 'dark' ? '0 2px 6px rgba(0, 0, 0, 0.6), 0 0 8px rgba(255, 255, 255, 0.08)' : '',
                } as React.CSSProperties}
            >
                {
                    noticeList.map(notice => (
                        <RCNotice
                            key={notice.key}
                            notice={notice}
                            onNoticeClose={onNoticeClose}
                            onNoticeDelete={deleteNotice}
                        ></RCNotice>
                    ))
                }
            </div>
        )
    } else {
        return (<></>)
    }
}

// 合并对象
const mergeConfig = <T extends object>(...objList: Partial<T>[]): T => {
    const clone: T = {} as T

    objList.forEach((obj) => {
        if (obj) {
            (Object.keys(obj) as Array<keyof T>).forEach((key) => {
                const val = obj[key]

                if (val !== undefined) {
                    clone[key] = val as T[keyof T]
                }
            })
        }
    })
    return clone
}

/**
 * @description 作用
 * 1. 维护消息列表 configList
 * 2. 渲染消息列表
 * 3. 消息列表 configList 将会被 <NoticeList /> 监控
 */
// eslint-disable-next-line react-refresh/only-export-components, prefer-arrow-callback
export const RCNotifications = forwardRef(function RCNotifications(props: ConfigOptions, ref: ForwardedRef<NotificationsRef>) {

    const {
        getContainer = () => document.body,
        ...shareConfig
    } = props        // 获取 message.config() 的参数

    const [messageConfigList, setMessageConfigList] = useState<MessageConfig[]>([])

    const onNoticeClose = (key: React.Key) => {
        const config = messageConfigList.find((item) => item.key === key)
        config?.onClose?.()
        setMessageConfigList((list) => list.filter((item) => item.key !== key))
    }

    useImperativeHandle(ref, () => ({
        open: (config: ArgsProps) => {
            // 合并全局 defaultGlobalConfig 与传入的 config
            const mergedConfig = mergeConfig<MessageConfig>(shareConfig, config)

            // 添加 config 进入队列
            setMessageConfigList((messageConfigList) => {
                const clone = [...messageConfigList]

                // Replace if exist
                const configIndex = clone.findIndex((item) => item.key === mergedConfig.key)
                if (configIndex >= 0) {
                    // configList 存在 config.key
                    clone[configIndex] = mergedConfig
                } else {
                    // 添加进入队列
                    clone.push(mergedConfig)
                }

                return clone
            })
        },
        close: (key: React.Key) => {
            onNoticeClose(key)
        },
        destroy: () => {
            setMessageConfigList([])
        },
    }))

    if (!getContainer()) return null

    return createPortal(
        <RCNoticeList
            messageConfigList={messageConfigList}
            onNoticeClose={onNoticeClose}
        ></RCNoticeList>,
        getContainer(),
    )
})
