/**
 * @Author: bin
 * @Date: 2025-09-12 15:28:38
 * @LastEditors: bin
 * @LastEditTime: 2026-02-10 15:31:46
 */
/**
 * 参考源码：ant-design/components/message/useMessage.tsx
 * notification/src/Notifications.tsx
 */
import {
    useState, useRef, forwardRef, useImperativeHandle,
    type ForwardedRef,
} from 'react'
import { createPortal } from 'react-dom'

import { wrapPromiseFn } from './utils/utils'
import type {
    NoticeType, ConfigOptions, ArgsProps, MessageConfig,
    OpenTask, MessageType, MessageInstance,
} from './Message.d'

import NoticeList from './NoticeList'

type NotificationsRef = {
    open: (config: ArgsProps) => void;
    close: (key: React.Key) => void;
    destroy: () => void;
}

// const DEFAULT_DURATION = 3000

let keyIndex = 0      // message key

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
const RCNotifications = forwardRef(function RCNotifications(props: ConfigOptions, ref: ForwardedRef<NotificationsRef>) {

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
        <NoticeList
            messageConfigList={messageConfigList}
            onNoticeClose={onNoticeClose}
        ></NoticeList>,
        getContainer(),
    )
})

/**
 * @description 创建 Message 实例，受理 Message 转发过来的方法，将非 open 的打开方法转发给 open 方法
 * @param { HolderProps } messageConfig message 全局配置；默认值：来自 Message.tsx 的 getGlobalContext()
 * @attention message.open() / message.info()... 方法不会给 messageConfig 传值，而是直接调用 useInternalMessage().open()
 * @returns { readonly [MessageInstance, React.ReactElement] }
 */
export const useInternalMessage = (messageConfig?: ConfigOptions): readonly [MessageInstance, React.ReactElement] => {

    const notificationsRef = useRef<NotificationsRef>(null)

    /**
     * Hooks 闭包函数（IIFE）
     * 保持函数引用稳定（性能）
     */
    const wrapAPI = ((): MessageInstance => {

        const close = (key: React.Key) => {
            notificationsRef.current?.close(key)
        }

        /**
         * @description 将 open 函数代理到 notificationsRef.current.open
         * @param { ArgsProps } config 传入 notificationsRef.current.open() 方法的参数
         * info、success...等方法都代理到 open ，故 ArgsProps 是 notificationsRef.current.open() 唯一参数类型
         * @returns { MessageType }
         */
        const open = (config: ArgsProps): MessageType => {
            // Holder 未注册成功时，返回一个空函数
            if (!notificationsRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fakeResult: any = () => {}
                fakeResult.then = () => {}
                return fakeResult
            }

            // 赋上默认的 key 值
            const { key, onClose, ...restConfig } = config
            let mergedKey: React.Key = key!
            if (mergedKey === undefined || mergedKey === null) {
                keyIndex += 1
                mergedKey = `message-${keyIndex}`
            }

            return wrapPromiseFn((resolve: VoidFunction) => {
                notificationsRef.current!.open({
                    ...restConfig,
                    key: mergedKey,
                    onClose: () => {
                        onClose?.()
                        resolve()
                    },
                })

                return () => {
                    close(mergedKey)
                }
            })
        }

        const destroy = (key?: React.Key) => {
            if (key !== undefined) {
                close(key)
            } else {
                notificationsRef.current?.destroy()
            }
        }

        const clone = {
            open,
            destroy,
        } as MessageInstance

        const keys: NoticeType[] = ['info', 'success', 'warning', 'error', 'loading']
        // 将 'info', 'success', 'warning', 'error', 'loading'方法，转接到 open
        keys.forEach((type: NoticeType) => {

            clone[type] = (jointContent, duration?: number | VoidFunction, onClose?: VoidFunction) => {

                let config: OpenTask['config']    // 即 ArgsProps
                // 判断 jointContent 是 React.ReactNode 还是 ArgsProps
                if (jointContent && typeof jointContent === 'object' && 'content' in jointContent) {
                    // jointContent 是 ArgsProps
                    config = jointContent
                } else {
                    config = { content: jointContent }
                }
                // 合并配置
                let mergedDuration: number | undefined
                let mergedOnClose: VoidFunction | undefined
                if (typeof duration === 'function') {
                    mergedOnClose = duration
                } else {
                    mergedDuration = duration
                    mergedOnClose = onClose
                }

                return open({
                    onClose: mergedOnClose,
                    duration: mergedDuration,
                    ...config,        // onClose、duration 以 config 里的为准
                    type,
                })
            }
        })

        return clone
    })()

    return [
        wrapAPI,
        <RCNotifications ref={notificationsRef} {...messageConfig} />,
    ] as const
}

const useMessage = (messageConfig?: ConfigOptions) => {
    return useInternalMessage(messageConfig)
}

export default useMessage
