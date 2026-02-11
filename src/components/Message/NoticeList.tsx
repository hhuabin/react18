/**
 * @Author: bin
 * @Date: 2025-07-11 18:23:24
 * @LastEditors: bin
 * @LastEditTime: 2026-02-10 14:40:06
 */
/**
 * 参考源码：notification/src/NoticeList.tsx
 */
import { useState, useEffect, useContext } from 'react'

import { ConfigContext } from '@/components/ConfigProvider/context'
import type { MessageConfig } from './Message.d'
import renderIcon from './utils/renderIcon'
import './style/message.less'

type NoticeConfig = MessageConfig & {
    isClose?: boolean;
}

type NoticeListProps = {
    messageConfigList: MessageConfig[];           // 被监控的消息列表
    onNoticeClose?: (key: React.Key) => void;     // 删除消息函数
}

type NoticeProps = {
    notice: NoticeConfig;
    onNoticeClose?: (key: React.Key) => void;       // 隐藏该通知，触发关闭动画
    onNoticeDelete?: (key: React.Key) => void;      // 删除该通知
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
const RCNoticeList: React.FC<NoticeListProps> = (props) => {

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
            const resultList = compareConfigListAndNoticeList(messageConfigList, noticeList)
            setNoticeList(resultList)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.messageConfigList])

    /**
     * @description 对比合并提示消息列表
     * @param { MessageConfig[] } messageConfigList 新消息列表
     * @param { MessageConfig[] } noticeList 旧消息列表
     * @returns { MessageConfig[] } 新的消息列表
     * bug: 优化对比函数，该函数太慢了
     */
    const compareConfigListAndNoticeList = (
        messageConfigList: MessageConfig[],
        noticeList: NoticeConfig[],
    ): NoticeConfig[] => {
        const resultList: NoticeConfig[] = []              // 存放返回结果
        const usedKeys = new Set()         // 存储已经被添加到 resultList 的 key

        const configMap = new Map(messageConfigList.map(item => [item.key, item]))
        const noticeMap = new Map(noticeList.map(item => [item.key, item]))
        const configKeys = messageConfigList.map(item => item.key)
        const noticeKeys = noticeList.map(item => item.key)
        const configListLengtgh = configKeys.length
        const noticeListLength = noticeKeys.length

        /**
         * @description 添加 noticeList 到 resultList 中
         * 新的数组中必须保留全部 noticeKeys
         * 遍历 noticeKeys ，将 resultList 中不存在的元素加上 isClose: true
         */
        const configKeySet = new Set(configKeys)
        for (let i = 0; i < noticeListLength; i++) {
            if (configKeySet.has(noticeKeys[i])) {
                // 新的数组中存在，取新数组的值
                resultList.push(configMap.get(noticeKeys[i])!)
            } else {
                // 新数组中不存在，关闭
                resultList.push({ ...noticeMap.get(noticeKeys[i])!, isClose: true })
            }
            usedKeys.add(noticeKeys[i])
        }

        /**
         * @description 遍历 configList，将新出现的 config 添加进 resultList 对应位置
         */
        let configListHead = 0        // messageConfigList 的头指针
        let insertStartIndex = 0      // 记录在 resultList 中查找 config 的开始索引，加速 resultList 的查找速度
        for (let configIndex = 0; configIndex <= configListLengtgh; configIndex++) {
            /**
             * @description 将处于中间的新的 config 添加到 resultList 的对应位置
             * 具体规则：将新出现的 config 添加到 下一个 存在的 config 对应的索引位置前
             */
            if (usedKeys.has(configKeys[configIndex])) {
                // 若头指针与检查元素下表不相等，则存在新元素需要添加
                if (configListHead < configIndex) {
                    // 获取新元素
                    const newConfig = messageConfigList.slice(configListHead, configIndex)
                    // 从开始查找下标开始查找，将 newConfig 插入到 resultList 中
                    for (let j = insertStartIndex; j <= resultList.length; j++) {
                        // eslint-disable-next-line max-depth
                        if (resultList[j]!.key === configKeys[configIndex]) {
                            resultList.splice(j, 0, ...newConfig)
                            insertStartIndex = j + 1
                            break
                        }
                        // eslint-disable-next-line max-depth
                        if (j === resultList.length) {
                            resultList.push(...newConfig)
                            insertStartIndex = j
                        }
                    }
                    configListHead = configIndex + 1
                } else {
                    // 没有新元素需要添加，移动 messageConfigList 头指针
                    configListHead++
                }
            }
            // 将处于 messageConfigList 末尾的新元素全部添加到 resultList 中
            if (configIndex === configListLengtgh && configListHead < configIndex) {
                resultList.push(...messageConfigList.slice(configListHead))
            }
        }

        return resultList
    }

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

export default RCNoticeList
