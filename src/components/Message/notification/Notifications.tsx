/**
 * @Author: bin
 * @Date: 2026-04-02 11:17:09
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 18:50:19
 */
import { useState, useEffect, forwardRef, useImperativeHandle, type ForwardedRef } from 'react'
import { createPortal } from 'react-dom'

import NoticeList from './NoticeList'
import { type CSSMotionProps } from '@/components/CSSMotion'
import type { Placement, OpenConfig, InnerOpenConfig } from './interface.d'

export interface NotificationsProps {
    prefixCls?: string;                        // 前缀类名
    motion?: CSSMotionProps;                   // CSSMotion 动画配置，相较于 rc-notification 有改动
    container?: HTMLElement | ShadowRoot;      // 容器元素 HTMLElement | DocumentFragment
    maxCount?: number;                         // 最大显示数；超出 maxCount，从提示列表第一个开始移除
    className?: string;                        // 样式类名，相较于 rc-notification 有改动
    style?: React.CSSProperties;               // 样式，相较于 rc-notification 有改动
    onAllRemoved?: VoidFunction;               // 所有通知全部移除时触发
}

export interface NotificationsRef {
    open: (config: OpenConfig) => void;
    close: (key: React.Key) => void;
    destroy: () => void;
}

/**
 * @description Notifications 控制层
 * 1. 维护总列表：收集不同位置（'top' | 'topRight'等）的提示
 *      基于位置分类成不通的列表（此处只考虑 message 也就是 placement = 'top' 的情况，其他的以后再写）
 */
// eslint-disable-next-line prefer-arrow-callback
const Notifications = forwardRef(function Notifications(props: NotificationsProps, ref: ForwardedRef<NotificationsRef>) {
    const {
        prefixCls = 'bin-notification',
        container,
        motion,
        maxCount = 0,
        className,
        style,
        onAllRemoved,
    } = props

    // 总提示列表：包含不同位置（'top' | 'topRight'等）的提示。（此处只考虑 placement = 'top' 的列表）
    const [configList, setConfigList] = useState<OpenConfig[]>([])

    // ======================== Close =========================
    const onNoticeClose = (key: React.Key) => {
        const config = configList.find((item) => item.key === key)
        // 不用等待动画结束，直接调用开发者传入的关闭函数
        config?.onClose?.()

        setConfigList((list) => list.filter((item) => item.key !== key))
    }

    // ========================= Refs =========================
    useImperativeHandle(ref, () => ({
        open: (config: OpenConfig) => {
            setConfigList((list) => {
                // 复制对象，防止相同引用造成更新失败
                let clone = [...list]

                const index = clone.findIndex((item) => item.key === config.key)
                // 复制对象，避免改动开发者的数据
                const innerConfig: InnerOpenConfig = { ...config }
                if (index >= 0) {
                    // 更新提示内容
                    innerConfig.times = ((list[index] as InnerOpenConfig)?.times || 0) + 1
                    clone[index] = innerConfig
                } else {
                    // 新增，times 置 0
                    innerConfig.times = 0
                    clone.push(innerConfig)
                }

                // 超出 最大显示数，移除
                if (maxCount > 0 && clone.length > maxCount) {
                    clone = clone.slice(-maxCount)
                }
                return clone
            })
        },
        close: (key: React.Key) => {
            onNoticeClose(key)
        },
        destroy: () => {
            setConfigList([])
        },
    }))

    // 如果所有通知都消失，请清理容器
    const onAllNoticeRemoved = () => {
        if (!configList.length) {
            onAllRemoved?.()
        }
    }

    // ======================== Render ========================
    if (!container) return null

    return createPortal(
        <NoticeList
            key={'top'}
            configList={configList}
            placement={'top'}
            prefixCls={prefixCls}
            className={className}
            style={style}
            motion={motion}
            onNoticeClose={onNoticeClose}
            onAllNoticeRemoved={onAllNoticeRemoved}
        />,
        container,
    )
})

export default Notifications
