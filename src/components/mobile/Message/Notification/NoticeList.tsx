/**
 * @Author: bin
 * @Date: 2026-04-02 11:25:45
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 14:09:44
 */
/**
 * Portions of this file are derived from rc-notification:
 * https://github.com/react-component/notification
 *
 * The original work is licensed under the MIT License.
 * Copyright (c) 2019-present afc163
 *
 * This file has been modified for this project.
 */
import { CSSMotionList, type CSSMotionProps } from '@/components/CSSMotion'
import Notice from './Notice'
import type { Placement, OpenConfig, InnerOpenConfig } from './interface.d'
import { clsx } from './utils/clsx'

export interface NoticeListProps {
    configList?: OpenConfig[];                 // 通知列表
    placement?: Placement;                     // 显示位置，兼容后续开发
    prefixCls?: string;                        // 前缀类名
    motion?: CSSMotionProps;                   // 动画配置

    // Events
    onAllNoticeRemoved?: (placement: Placement) => void;
    onNoticeClose?: (key: React.Key) => void;  // 关闭通知

    // Common
    className?: string;
    style?: React.CSSProperties;
}

/**
 * @description NoticeList 调度 / 动画
 * 1. 接收 configList，渲染通知列表
 * 2. 将 configList 传给 CSSMotionList 控制动画
 * 3. 管理“删除完成”事件
 */
const NoticeList: React.FC<NoticeListProps> = (props) => {

    const {
        configList = [],
        placement = 'top',
        prefixCls = 'bin-notification',
        motion,
        onAllNoticeRemoved,
        onNoticeClose,
        className,
        style,
    } = props

    const keys = configList.map((config) => ({
        config,                      // config 是 InnerOpenConfig 类型，在 Notifications 被强制添加了 times 属性
        key: String(config.key),
    }))

    // 有一个提示禁止背景点击 则 禁止背景点击
    const getForbidClick = configList.some(config => config.forbidClick)

    return (
        <div className={clsx({ [`${prefixCls}-forbid-click`]: getForbidClick }) || undefined}>
            <CSSMotionList
                key={placement}
                component='div'
                className={clsx(prefixCls, `${prefixCls}-${placement}`)}   // 这个 className 会传给 CSSMotionList 作为外层包裹的类名
                keys={keys}
                motionAppear={true}
                {...motion}
                onAllRemoved={() => onAllNoticeRemoved?.(placement)}
            >
                {(
                    { className: motionClassName, style: motionStyle, index: motionIndex, config },
                    motionRef,
                ) => {
                    /**
                     * 1. config 来自于 open 方法的参数
                     * 2. config 在 keys 中，一定会作为 eventProps 传给 CSSMotion 的 children
                     * 3. 解构出 config 之后，在 config 中继续解构 key
                     */
                    const {
                        key,
                        times,
                        ...restConfig
                    } = config as InnerOpenConfig

                    return (
                        <div
                            className={clsx(`${prefixCls}-notice-wrapper`, motionClassName)}
                            style={motionStyle}
                            key={key}
                            ref={motionRef}
                        >
                            <Notice
                                className={className}
                                style={style}
                                {...restConfig}
                                prefixCls={prefixCls}
                                times={times}
                                key={key}
                                eventKey={key}
                                onNoticeClose={onNoticeClose}
                            ></Notice>
                        </div>
                    )
                }}
            </CSSMotionList>
        </div>
    )
}

export default NoticeList
