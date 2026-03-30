/**
 * @Author: bin
 * @Date: 2026-02-10 10:13:42
 * @LastEditors: bin
 * @LastEditTime: 2026-03-30 15:11:39
 */
import { useRef, useEffect, useState } from 'react'

import { renderToContainer } from './utils/renderToContainer'
import Mask from './Mask'
import Content from './Content'
import './style/Dialog.less'

import type { DialogProps } from './interface.d'

/**
 * Portions of this file are derived from rc-motion:
 * https://github.com/react-component/dialog
 *
 * The original work is licensed under the MIT License.
 * Copyright (c) 2019-present afc163
 *
 * This file has been modified for this project.
 */
const RCDialog: React.FC<DialogProps> = (props) => {

    const {
        visible = false,
        closable = false,
        mask = true,
        maskClosable = false,
        destroyOnHidden = false,
        forceRender = false,
        onClose,
        afterClose,

        title,
        children,
        footer,

        mousePosition,
        motionName = 'bin-dialog-zoom',
        width,
        duration,
        zIndex,
        className,
        style = {},
        getContainer,
    } = props

    // 动画状态锁，防止开发环境下的热更新持续触发 afterClose
    const [animatedVisible, setAnimatedVisible] = useState(visible)

    useEffect(() => {
        if (visible) {
            setAnimatedVisible(true)
        }
    }, [visible])

    // 点击遮罩层时触发
    const onMaskClick = (e: React.MouseEvent) => {
        if (maskClosable) {
            onClose?.(e)
        }
    }

    const onDialogVisibleChanged = (dialogVisible: boolean) => {
        if (!dialogVisible) {
            // 保证显示是从 true -> false 才会触发 afterClose
            if (animatedVisible) {
                afterClose?.()
            }
            setAnimatedVisible(false)
        }
    }

    // 动画结束，销毁组件
    if (!forceRender && destroyOnHidden && !animatedVisible) {
        return null
    }

    return renderToContainer(
        // 统一容器
        <div className='bin-dialog-root'>
            {/* 蒙层 */}
            <Mask
                visible={mask && visible}
                duration={duration}
                onMaskClick={onMaskClick}
                style={{
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                    '--animation-duration': (style as Record<string, string>)['--animation-duration'],
                } as React.CSSProperties}
            ></Mask>

            <div
                className='bin-dialog-warp'
                style={{
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                } as React.CSSProperties}
            >
                <Content
                    visible={visible}
                    closable={closable}
                    destroyOnHidden={destroyOnHidden}
                    forceRender={destroyOnHidden}
                    duration={duration}
                    onClose={(e) => onClose?.(e)}
                    onVisibleChanged={onDialogVisibleChanged}

                    title={title}
                    children={children}
                    footer={footer}

                    mousePosition={mousePosition}
                    motionName={motionName}
                    width={width}
                    className={className}
                    style={style}
                ></Content>
            </div>
        </div>,
        getContainer,
    )
}

export default RCDialog
