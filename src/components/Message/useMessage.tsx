/**
 * @Author: bin
 * @Date: 2025-06-30 15:24:14
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 15:18:38
 */
/**
 * 参考源码：ant-design/components/message/useMessage.tsx
 */
import {
    useRef,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'

import { useNotification, type NotificationAPI } from './notification'

import { wrapPromiseFn } from './utils/wrapPromiseFn'
import type {
    NoticeType, ConfigOptions, ArgsProps,
    OpenTask, MessageType, MessageInstance,
} from './Message.d'
import PureContent from './PureContent'

type HolderProps = ConfigOptions & {
    onAllRemoved?: VoidFunction;
}
interface HolderRef extends NotificationAPI {
    prefixCls: string;
    className?: string;
    style?: React.CSSProperties;
}

const DEFAULT_DURATION = 3000

let keyIndex = 0      // message key

/**
 * @description 代理 notification 组件
 * 使用 useNotification 注册 notification
 */
// eslint-disable-next-line react-refresh/only-export-components, prefer-arrow-callback
const NotificationHolder = forwardRef(function NotificationHolder(props: HolderProps, ref: ForwardedRef<HolderRef>) {

    const {
        prefixCls = 'bin-message',
        getContainer = () => document.body,
        maxCount,
        className,         // useInternalMessage 截走，不用传给 useNotification 使用
        style,             // useInternalMessage 截走，不用传给 useNotification 使用
        transitionName = 'move-up',
        onAllRemoved,

        duration = DEFAULT_DURATION,
        pauseOnHover,
    } = props

    const [api, holder] = useNotification({
        prefixCls,
        getContainer,
        motion: {
            motionName: `${prefixCls}-${transitionName}`,
        },
        maxCount,
        onAllRemoved,

        duration,
        pauseOnHover,
        // showProgress: false,
        // closable: false,
    })

    useImperativeHandle(ref, () => ({
        ...api,
        // 以下属性倒传给 useInternalMessage 使用
        // 因为 useInternalMessage 的 messageConfig 可能是 undefined，倒传可以避免 messageConfig 解构
        // 但是也可以使用 messageConfig?.className 表示，prefixCls 这里赋了默认值，所以一定要倒传
        prefixCls,
        className,
        style,
    }))

    return holder
})

/**
 * @description 创建 Message 实例，将非 open 的打开方法转发给 open 方法
 * @param { HolderProps } messageConfig message 注册配置
 * @attention message.open() / message.info()... 方法不会给 messageConfig 传值，而是直接调用 useInternalMessage().open()
 * @returns { readonly [MessageInstance, React.ReactElement] }
 */
export const useInternalMessage = (messageConfig?: HolderProps): readonly [MessageInstance, React.ReactElement] => {

    const notificationsRef = useRef<HolderRef | null>(null)

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

            const { open: originOpen, prefixCls, className, style } = notificationsRef.current!

            // 把需要改造的属性结构出来
            const {
                content,
                type,
                icon,
                showCloseBtn,

                key,
                onClose,
                ...restConfig
            } = config

            let mergedKey: React.Key = key!
            if (mergedKey === undefined || mergedKey === null) {
                keyIndex += 1
                mergedKey = `message-${keyIndex}`
            }

            // resolve() 将会调用 wrapPromiseFn 的 .then() 方法
            return wrapPromiseFn((resolve: VoidFunction) => {
                originOpen({
                    ...restConfig,
                    key: mergedKey,
                    // 自定义内容
                    content: (
                        <PureContent
                            prefixCls={prefixCls}
                            className={className}
                            style={style}

                            type={type}
                            icon={icon}
                            showCloseBtn={showCloseBtn}
                            onClose={() => {
                                // 调用关闭函数
                                close(mergedKey)
                            }}
                        >
                            { content }
                        </PureContent>
                    ),
                    placement: 'top',
                    closable: false,       // 使用自定义关闭按钮
                    onClose: () => {
                        onClose?.()
                        resolve()    // wrapPromiseFn.then
                    },
                })
                // 返回关闭函数
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
                // 合并 显示时长 和 关闭后执行的函数
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
        <NotificationHolder ref={notificationsRef} {...messageConfig} />,
    ] as const
}

const useMessage = (messageConfig?: ConfigOptions) => {
    return useInternalMessage(messageConfig)
}

export default useMessage
