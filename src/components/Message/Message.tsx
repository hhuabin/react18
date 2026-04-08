/**
 * @Author: bin
 * @Date: 2025-06-10 11:22:20
 * @LastEditors: bin
 * @LastEditTime: 2026-04-08 15:00:35
 */
/**
 * 参考源码：ant-design/components/message/index.tsx
 * 基本理念：创建代理(useInternalMessage)，代理message所有(config、useMessage除外)的方法
 * 1. 函数给 message 注册方法open、info...等方法，方法中将参数视作 task 添加进 taskQueue 中------open() / typeOpen()
 * 2. 执行 flushNotice()，消费 taskQueue，消费成功后删除 taskQueue------执行flushNotice()
 * 3. flushNotice() 的循环中设置代理，open、info...等方法会转成代理的调用------flushNotice => taskQueue.forEach
 */
import {
    useState, forwardRef, useImperativeHandle, useEffect,
    type ForwardedRef,
} from 'react'

import ConfigProvider from '@/components/ConfigProvider/ConfigProvider'

import type {
    NoticeType, ConfigOptions, ArgsProps,
    OpenTask, TypeTask, Task,
    MessageType, TypeOpen,
    BaseMethods, MessageMethods,
    MessageInstance, BaseStaticMethods,
    GlobalMessage,
} from './Message.d'
import useMessage, { useInternalMessage } from './useMessage'
import { unstableSetRender } from './utils/reactRender'
import { wrapPromiseFn } from './utils/wrapPromiseFn'

interface GlobalHolderRef {
    instance: MessageInstance;
    sync: () => void;
}

const DEFAULT_DURATION = 3000

let message: GlobalMessage | null = null

let taskQueue: Task[] = []          // 任务队列，用于接收任务队列，接收成功进行渲染，渲染完成即可删除该任务队列
let defaultGlobalConfig: ConfigOptions = {}       // 全局配置

// 获取全局配置
const getGlobalContext = (): ConfigOptions => {
    // const { getContainer, duration = DEFAULT_DURATION, rtl, maxCount, top } = defaultGlobalConfig
    const { getContainer, duration = DEFAULT_DURATION, prefixCls = 'bin-message' } = defaultGlobalConfig
    const mergedContainer = getContainer?.() || document.body   // 设置默认挂载点是 body
    return { getContainer: () => mergedContainer, duration, prefixCls }
}

// 设置全局配置，此代码中只有 message.config() 使用
const setMessageGlobalConfig = (config: ConfigOptions) => {
    // 自定义全局配置
    defaultGlobalConfig = { ...defaultGlobalConfig, ...config }
    // Trigger sync for it
    message?.sync?.()
}

/**
 * @description 作用：套在全局组件 <ConfigProvider> 壳中，并且方法调用前都执行 sync()
 * 生成 messageInstance 实例，将实例方法暴露出去
 * 并将其包括在全局组件 <ConfigProvider> 中
 */
// eslint-disable-next-line react-refresh/only-export-components, prefer-arrow-callback
const GlobalHolderWrapper = forwardRef(function MessageWrapper(props: unknown, ref: ForwardedRef<GlobalHolderRef>) {
    // useState(getGlobalContext) 惰性初始化
    // React 检测到你传的是一个函数，而不是一个普通值，它会在初始化时执行这个函数一次，把返回值当作初始值
    const [messageConfig, setMessageConfig] = useState<ConfigOptions>(getGlobalContext)

    // 把 messageConfig.getContainer 设置成 document.body
    const sync = () => {
        setMessageConfig(getGlobalContext())
    }

    // 获取 Message 实例，与 message.useMessage 一样，同时注入全局公共配置
    const [messageInstance, holder] = useInternalMessage(messageConfig)

    // const dom = <GlobalHolder ref={ref} sync={sync} messageConfig={messageConfig} />

    // 执行同步函数获取全局配置
    useEffect(sync, [])

    useImperativeHandle(ref, () => {
        const instance: MessageInstance = { ...messageInstance }

        /**
         * 重写 instance 的方法
         * 确保每次调用方法前调用 sync ，获取最新的全局配置
         */
        Object.keys(instance).forEach((method) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            instance[method as keyof MessageInstance] = (...args: any[]) => {
                sync()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (messageInstance as any)[method](...args)
            }
        })

        return {
            instance,
            sync,
        }
    })

    return (
        <ConfigProvider>
            { holder }
        </ConfigProvider>
    )
    // return holder
})

/**
 * 消费消息队列
 * 将消息队列的方法代理到 message 实例中
 */
const flushNotice = () => {
    /**
     * 如果没有 message，创建单例离屏容器 holderFragment
     * 并且添加 GlobalHolderWrapper 实例到 message 变量中
     * 往后的 message.open() 都会直接调用已经创建的 GlobalHolderWrapper 的方法
     */
    if (!message) {
        // 创建空标签，作为一个单例的“离屏容器”
        const holderFragment = document.createDocumentFragment()
        message = {
            fragment: holderFragment,
        }

        // 获取渲染函数
        const reactRender = unstableSetRender()

        // 渲染 GlobalHolderWrapper 组件
        reactRender(<GlobalHolderWrapper ref={(node) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { instance, sync } = node || {}

            // React 18 test env will throw if call immediately in ref
            Promise.resolve().then(() => {
                if (!message!.instance && instance) {
                    message!.instance = instance
                    message!.sync = sync
                    flushNotice()
                }
            })
        }} />, holderFragment)
        return
    }

    if (!message.instance) return

    // 循环队列，渲染提示
    taskQueue.forEach(task => {
        const { type, skipped } = task
        // 当用户不跳过提示时，进行渲染
        if (!skipped) {
            switch (task.type) {
                case 'open': {
                    // 获取关闭函数
                    const closeFn = message!.instance!.open({
                        ...defaultGlobalConfig,
                        ...task.config,
                    })
                    // 链式调用关闭函数，message 实例关闭函数调用后调用用户定义的 .then()
                    closeFn?.then(task.resolve)
                    // 设置 open / typeOpen 的 closeFn 函数赋值，方便外部调用关闭函数
                    task.setCloseFn(closeFn)
                    break
                }
                case 'destroy': {
                    message?.instance!.destroy(task.key)
                    break
                }
                default: {
                    const closeFn = message!.instance![type as NoticeType](...task.args)

                    closeFn?.then(task.resolve)
                    task.setCloseFn(closeFn)
                }
            }
        }
    })

    // Clean up，任务队列渲染完成需要清除，不然会造成重复渲染
    taskQueue = []
}

// message.open
const open = (config: ArgsProps): MessageType => {
    // 创建 closeFn.then() 调用
    const result: MessageType = wrapPromiseFn((resolve: VoidFunction) => {
        let closeFn: VoidFunction

        const task: OpenTask = {
            type: 'open',
            config,
            resolve,      // 将resolve作为参数传递给task，flushNotice 将会使用
            setCloseFn: (fn) => {
                closeFn = fn
            },
        }
        // 添加该该任务进入队列
        taskQueue.push(task)

        // 返回函数用于关闭info
        return () => {
            if (closeFn) {
                // 执行关闭函数
                closeFn()
            } else {
                /**
                 * 没有关闭函数时：message 还没真正挂载完成（比如还在队列中）
                 * 此时在未来跳过其渲染
                 */
                task.skipped = true
            }
        }
    })

    // 刷新队列
    flushNotice()

    return result
}

// message['success', 'info', 'warning', 'error', 'loading'] 的函数
const typeOpen = (type: NoticeType, args: Parameters<TypeOpen>): MessageType => {
    /**
     * @description 将需要执行的代码，放入 Promise 中，同时提供 Promise 的 Fulfilled（成功）状态出口方法 resolve()
     *  1. 只需要调用 resolve() 即可触发 Promise 的 Fulfilled 状态
     *  2. 将 result 的 .then() 方法改写为 Promise 的 .then() 方法
     *  3. 返回的可执行函数中需要包含 resolve() 方法，作为 wrapPromiseFn 的出口函数
     */
    const result: MessageType = wrapPromiseFn((resolve: VoidFunction) => {
        let closeFn: VoidFunction

        const task: TypeTask = {
            type,
            args,
            resolve,
            setCloseFn: (fn) => {
                closeFn = fn
            },
        }
        taskQueue.push(task)

        // 默认 3s 关闭
        /* setTimeout(() => {
            resolve()
        }, 3000) */
        // 返回函数用于关闭info
        return () => {
            if (closeFn) {
                // 执行关闭函数，此处将会是message.instance.open()的关闭函数
                closeFn()
            } else {
                /**
                 * 没有关闭函数时：message 还没真正挂载完成（比如还在队列中）
                 * 此时在未来跳过其渲染
                 */
                task.skipped = true
            }
        }
    })

    // 刷新队列
    flushNotice()

    return result
}

const destroy: BaseMethods['destroy'] = (key) => {
    taskQueue.push({
        type: 'destroy',
        key,
    })
    flushNotice()
}

const baseStaticMethods: BaseMethods = {
    open,
    destroy,
    config: setMessageGlobalConfig,   // 设置全局配置
    useMessage,                       // 获取 Hooks 的 MessageInstance 实例；const [messageApi, contextHolder] = message.useMessage()
}

const methods: (keyof MessageMethods)[] = ['success', 'info', 'warning', 'error', 'loading']

const messageMethods: MessageMethods = methods.reduce((prev, type) => {
    // 给 'success', 'info'... 等键添加 typeOpen 方法
    prev[type] = ((...args: Parameters<TypeOpen>) => typeOpen(type, args)) as TypeOpen
    return prev
}, {} as MessageMethods)

const staticMethods: BaseStaticMethods = { ...baseStaticMethods, ...messageMethods }

export default staticMethods
