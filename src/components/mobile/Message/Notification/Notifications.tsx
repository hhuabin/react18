/**
 * @Author: bin
 * @Date: 2026-04-02 11:17:09
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 15:00:55
 */
import {
    useState, useRef, useEffect,
    forwardRef, useImperativeHandle, type ForwardedRef,
} from 'react'
import { createPortal } from 'react-dom'

import NoticeList from './NoticeList'
import { type CSSMotionProps } from '@/components/CSSMotion'
import type { Placement, OpenConfig, InnerOpenConfig, Placements } from './interface.d'

import '../style/message.less'

export interface NotificationsProps {
    prefixCls?: string;                        // 前缀类名
    container?: HTMLElement | ShadowRoot;      // 容器元素 HTMLElement | DocumentFragment
    motion?: CSSMotionProps;                   // CSSMotion 动画配置，相较于 rc-notification 有改动
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
 * @description Notifications 总控制层；（核心功能）对提示的 增、删、改(open)、全部销毁 操作都要通过该组件
 * 1. 维护总列表：收集不同位置（'top' | 'topRight'等）的提示。并把列表按照 位置 分组到 placements 中
 * 2. placements 按照位置生成不同位置的 NoticeList
 * 3. 该组件接收 NotificationsProps 确定 prefixCls、motion 等样式相关的东西
 * 4. 通过 NotificationsRef.open() 添加 configList 打开提示，configList 接收的是 OpenConfig 参数，OpenConfig 会通过 NoticeList 组件传给 Notice
 * @example
 * <Notifications
        ref={notificationsRef}
        prefixCls='bin-message'
        container={document.body}
        motion={{
            motionName: 'bin-message-move-up',
        }}
        onAllRemoved={() => console.log('all removed')}
    ></Notifications>
 */
// eslint-disable-next-line prefer-arrow-callback
const Notifications = forwardRef(function Notifications(props: NotificationsProps, ref: ForwardedRef<NotificationsRef>) {
    const {
        prefixCls = 'bin-notification',        // 透传
        container,
        motion,            // 透传
        maxCount = 0,
        className,         // 透传
        style,             // 透传
        onAllRemoved,
    } = props

    // 总提示列表（核心列表）：包含不同位置（'top' | 'topRight'等）的提示。（此处只考虑 placement = 'top' 的列表）
    const [configList, setConfigList] = useState<OpenConfig[]>([])

    // ====================== Placements ======================
    // 把所有通知按“位置（placement）分组，并作为渲染和生命周期的真实数据源”
    const [placements, setPlacements] = useState<Placements>({})

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

    useEffect(() => {
        const nextPlacements: Placements = {}

        configList.forEach((config) => {
            // 默认给 placement = 'top' 新增数据
            const { placement = 'top' } = config

            if (placement) {
                if (!nextPlacements[placement]) nextPlacements[placement] = []
                // nextPlacements[placement] = nextPlacements[placement] || []
                nextPlacements[placement]!.push(config)
            }
        })

        // 避免动画没执行结束就清理了 NoticeList
        Object.keys(placements).forEach((placement) => {
            nextPlacements[placement as keyof Placements] ??= []
            // nextPlacements[placement] = nextPlacements[placement] || []
        })

        setPlacements(nextPlacements)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configList])

    /**
     * @description 删除 placement 位置的所有通知
     */
    const onAllNoticeRemoved = (placement: Placement) => {
        setPlacements((originPlacements) => {
            const clone = {
                ...originPlacements,
            }

            if (!clone[placement]?.length) {
                delete clone[placement]
            }

            return clone
        })
    }

    // Effect tell that placements is empty now
    const emptyRef = useRef(false)
    useEffect(() => {
        if (Object.keys(placements).length > 0) {
            emptyRef.current = true
        } else if (emptyRef.current) {
            // Trigger only when from exist to empty
            onAllRemoved?.()
            emptyRef.current = false
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placements])

    // ======================== Render ========================
    if (!container) return null

    const placementList = Object.keys(placements) as Placement[]

    return createPortal(
        <>
            {placementList.map((placement) => {
                const placementConfigList = placements[placement]

                return (
                    <NoticeList
                        key={placement}
                        configList={placementConfigList}
                        placement={placement}
                        prefixCls={prefixCls}
                        className={className}
                        style={style}
                        motion={motion}
                        onNoticeClose={onNoticeClose}
                        onAllNoticeRemoved={onAllNoticeRemoved}
                    />
                )
            })}
        </>,
        container,
    )
})

export default Notifications
