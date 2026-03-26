/**
 * @Author: bin
 * @Date: 2026-02-10 10:13:42
 * @LastEditors: bin
 * @LastEditTime: 2026-03-26 11:04:55
 */
import { useRef, useEffect } from 'react'

import { renderToContainer } from './utils/renderToContainer'
import Mask from './Mask'
import Content from './Content'
import './style/Dialog.less'

import type { RCDialogProps } from './interface.d'

/**
 * Portions of this file are derived from rc-motion:
 * https://github.com/react-component/dialog
 *
 * The original work is licensed under the MIT License.
 * Copyright (c) 2019-present afc163
 *
 * This file has been modified for this project.
 */
const RCDialog: React.FC<RCDialogProps> = (props) => {

    const {
        visible = false,
        closable = false,
        mask = true,
        destroyOnHidden = false,
        maskClosable = false,
        duration,
        zIndex = 999,
        onClose,
        afterClose,

        title,
        children,
        footer,

        mousePosition,
        motionName = 'bin-dialog-zoom',
        width,
        height,
        className,
        style = {},
        getContainer,
    } = props

    // 动画状态锁，防止开发环境下的热更新持续触发 afterClose
    const animatedVisibleRef = useRef(visible)

    useEffect(() => {
        if (visible) {
            animatedVisibleRef.current = true
        }
    }, [visible])

    // 点击遮罩层时触发
    const onMaskClick = () => {
        if (maskClosable) {
            onClose?.()
        }
    }

    const onDialogVisibleChanged = (dialogVisible: boolean) => {
        if (!dialogVisible) {
            // 保证显示是从 true -> false 才会触发 afterClose
            if (animatedVisibleRef.current) {
                afterClose?.()
            }
            animatedVisibleRef.current = false
        }
    }

    return renderToContainer(
        // 统一容器
        <div className='bin-dialog-root'>
            {/* 蒙层 */}
            <Mask
                visible={mask && visible}
                duration={duration}
                zIndex={zIndex}
                onMaskClick={onMaskClick}
            ></Mask>

            <div
                className={'bin-dialog-warp' + (className ? ' ' + className : '')}
                style={{
                    ...style,
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                } as React.CSSProperties}
            >
                <Content
                    visible={visible}
                    closable={closable}
                    destroyOnHidden={destroyOnHidden}
                    forceRender={destroyOnHidden}
                    duration={duration}
                    onClose={() => onClose?.()}
                    onVisibleChanged={onDialogVisibleChanged}

                    title={title}
                    children={children}
                    footer={footer}

                    mousePosition={mousePosition}
                    motionName={motionName}
                    width={width}
                    height={height}
                    className={className}
                    style={style}
                ></Content>
            </div>
        </div>,
        getContainer,
    )
}

export default RCDialog
