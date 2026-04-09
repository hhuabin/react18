/**
 * @Author: bin
 * @Date: 2026-04-07 16:40:37
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 14:53:07
 */
import { useState, useRef, useEffect, useMemo } from 'react'

import { type CSSMotionProps } from '@/components/CSSMotion'
import Notifications, { type NotificationsRef } from '../Notifications'
import type { OpenConfig } from '../interface'

import { useEvent } from '@/hooks/reactHooks'

const defaultGetContainer = () => document.body

type OptionalConfig = Partial<OpenConfig>

export interface NotificationConfig {
    prefixCls?: string;                        // 前缀类名
    // 自定义容器。它会重复调用，这意味着你应该返回相同的容器元素
    getContainer?: () => HTMLElement | ShadowRoot;       // 容器元素
    motion?: CSSMotionProps;                   // CSSMotion 动画配置，相较于 rc-notification 有改动
    maxCount?: number;                         // 最大显示数；超出 maxCount，从提示列表第一个开始移除
    className?: string;                        // 样式类名，相较于 rc-notification 有改动
    style?: React.CSSProperties;               // 样式，相较于 rc-notification 有改动
    onAllRemoved?: VoidFunction;               // 所有通知全部移除时触发

    // useNotification 给单个消息的默认配置。下面四个属性将会作为 open 方法的默认参数
    duration?: number;
    pauseOnHover?: boolean;
    showProgress?: boolean;
    closable?: boolean | ({ closeIcon?: React.ReactNode } & React.AriaAttributes);
}

export interface NotificationAPI {
    open: (config: OptionalConfig) => void;       // 这里会默认赋上 key 值，所以 key 值也是可选的
    close: (key: React.Key) => void;
    destroy: () => void;
}

interface OpenTask {
    type: 'open';
    config: OpenConfig;
}

  interface CloseTask {
    type: 'close';
    key: React.Key;
}

  interface DestroyTask {
    type: 'destroy';
}

type Task = OpenTask | CloseTask | DestroyTask

let uniqueKey = 0

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
 * @description 创建一个通知组件
 * @param rootConfig 注册配置
 * @returns [NotificationAPI, React.ReactElement]
 */
export default function useNotification(
    rootConfig: NotificationConfig = {},
): [NotificationAPI, React.ReactElement] {

    const {
        getContainer = defaultGetContainer,
        motion,
        prefixCls,
        maxCount,
        className,
        style,
        onAllRemoved,
        ...defaultNoticeConfig
    } = rootConfig

    const [container, setContainer] = useState<HTMLElement | ShadowRoot>()

    const notificationsRef = useRef<NotificationsRef | null>(null)

    const contextHolder = (
        <Notifications
            container={container}
            ref={notificationsRef}
            prefixCls={prefixCls}
            motion={motion}
            maxCount={maxCount}
            className={className}
            style={style}
            onAllRemoved={onAllRemoved}
        />
    )

    const [taskQueue, setTaskQueue] = useState<Task[]>([])

    // 保证函数稳定，并且避免闭包
    const open = useEvent<NotificationAPI['open']>((config) => {
        const mergedConfig = mergeConfig(defaultNoticeConfig, config)

        // 添加默认 key 值
        if (mergedConfig.key === null || mergedConfig.key === undefined) {
            mergedConfig.key = `bin-notification-${uniqueKey}`
            uniqueKey += 1
        }

        setTaskQueue((queue) => [...queue, { type: 'open', config: mergedConfig }])
    })

    const api = useMemo<NotificationAPI>(() => ({
        open: open,
        close: (key) => {
            setTaskQueue((queue) => [...queue, { type: 'close', key }])
        },
        destroy: () => {
            setTaskQueue((queue) => [...queue, { type: 'destroy' }])
        },
    }), [open])

    /**
     * React 18 应该会在每次渲染时都检查容器
     * 只要 getContainer() 返回值稳定，是不会触发重新渲染的
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setContainer(getContainer())
    })

    /**
     * @description 批量处理任务
     * taskQueue 变化触发
     */
    useEffect(() => {
        if (notificationsRef.current && taskQueue.length) {
            taskQueue.forEach((task) => {
                switch (task.type) {
                    case 'open':
                        notificationsRef.current!.open(task.config)
                        break
                    case 'close':
                        notificationsRef.current!.close(task.key)
                        break

                    case 'destroy':
                        notificationsRef.current!.destroy()
                        break
                }
            })

            // ============= 删除“已经被处理过的任务对象” =============
            // 删除“已经被处理过的任务对象”

            // React 18 中一次 useEffect 可能有多次 setState
            let originTaskQueue: Task[]
            let targetTaskQueue: Task[]
            setTaskQueue((oriQueue) => {
                // 只有第一次 setState 执行，其他 setState 直接复用第一次的结果即可
                if (originTaskQueue !== oriQueue || !targetTaskQueue) {
                    originTaskQueue = oriQueue
                    // taskQueue 是闭包值，删除 taskQueue 中已经处理的任务对象
                    targetTaskQueue = oriQueue.filter((task) => !taskQueue.includes(task))
                }

                return targetTaskQueue
            })
        }
    }, [taskQueue])

    return [api, contextHolder]
}
