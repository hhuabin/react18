/**
 * @Author: bin
 * @Date: 2026-04-02 11:25:45
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 18:36:24
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
import type { Placement, NoticeConfig, OpenConfig } from './interface.d'
import { clsx } from './utils/clsx'

export interface NoticeListProps {
    configList?: OpenConfig[];                 // 通知列表
    placement?: Placement;                     // 显示位置，兼容后续开发
    prefixCls?: string;                        // 前缀类名
    motion?: CSSMotionProps;                   // 动画配置

    // Events
    onAllNoticeRemoved?: () => void;
    onNoticeClose?: (key: React.Key) => void;  // 关闭通知

    // Common
    className?: string;
    style?: React.CSSProperties;
}

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
        config,
        key: String(config.key),
    }))

    return (
        <CSSMotionList
            key={placement}
            keys={keys}
            onAllRemoved={() => onAllNoticeRemoved?.()}
        >
            {({ className: motionClassName, style: motionStyle, index: motionIndex, key, ...config }, motionRef) => {
                return (
                    <div
                        className={clsx(`${prefixCls}-notice-wrapper`, motionClassName)}
                        style={motionStyle}
                        key={key}
                        ref={motionRef}
                    >
                        <Notice
                            prefixCls={prefixCls}
                            className={className}
                            style={style}
                            key={key}
                            eventKey={key}
                            onNoticeClose={onNoticeClose}
                        ></Notice>
                    </div>
                )
            }}
        </CSSMotionList>
    )
}

export default NoticeList
