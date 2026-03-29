/**
 * @Author: bin
 * @Date: 2026-02-10 10:13:42
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 10:55:20
 */
import { useEffect, useState } from 'react'

import Mask from './Mask'
import Content from './Content'

import { renderToContainer } from './utils/renderToContainer'
import { canUseDocElement } from './utils/canUseDom'

import type { DialogProps, MousePosition } from './interface.d'

import './style/Dialog.less'

let mousePosition: MousePosition

const getClickPosition = (e: MouseEvent) => {
    // 获取相对 html 的鼠标点击位置
    mousePosition = {
        x: e.pageX,
        y: e.pageY,
    }

    // 100ms 内发生过点击事件，则从点击位置动画展示
    // 否则直接 zoom 展示
    // 这样可以兼容非点击方式展开
    setTimeout(() => {
        mousePosition = null
    }, 100)
}

// 只有点击事件支持从鼠标位置动画展开
if (canUseDocElement()) {
    document.documentElement.addEventListener('click', getClickPosition, true)
}

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
        showConfirmButton,
        showCancelButton,
        confirmButtonText,
        confirmButtonColor,
        cancelButtonText,
        cancelButtonColor,

        mask = true,
        closeOnMaskClick = false,
        closeOnPopstate = true,
        disableBodyScroll = true,
        destroyOnHidden = false,
        forceRender = false,
        duration,
        zIndex,
        onCancel,
        onConfirm,
        afterClose,

        title,
        children,
        footer,

        mousePosition: customizeMousePosition,
        motionName = 'bin-dialog-zoom',
        width,
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

    /**
     * @description 禁止 body 滚动
     */
    useEffect(() => {
        const origin = document.body.style.overflow
        if (disableBodyScroll && visible) {
            // 禁止 body 滚动
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = origin
        }
    }, [disableBodyScroll, visible])

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (closeOnPopstate) {
                onCancel?.()
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closeOnPopstate])

    // 点击遮罩层时触发
    const onMaskClick = () => {
        if (closeOnMaskClick) {
            onCancel?.()
        }
    }

    // 阻止滑动穿透
    const onTouchMove = (event: React.TouchEvent) => {
        if (disableBodyScroll) event.stopPropagation()
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
                disableBodyScroll={disableBodyScroll}
                style={{
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                } as React.CSSProperties}
            ></Mask>

            <div
                className='bin-dialog-warp'
                style={{
                    '--z-index': zIndex ? zIndex : (style as Record<string, string>)['--z-index'],
                } as React.CSSProperties}
                onTouchMove={onTouchMove}
            >
                <Content
                    visible={visible}
                    showConfirmButton={showConfirmButton}
                    showCancelButton={showCancelButton}
                    confirmButtonText={confirmButtonText}
                    confirmButtonColor={confirmButtonColor}
                    cancelButtonText={cancelButtonText}
                    cancelButtonColor={cancelButtonColor}

                    destroyOnHidden={destroyOnHidden}
                    forceRender={destroyOnHidden}
                    duration={duration}
                    onCancel={() => onCancel?.()}
                    onConfirm={() => onConfirm?.()}
                    onVisibleChanged={onDialogVisibleChanged}

                    title={title}
                    children={children}
                    footer={footer}

                    mousePosition={customizeMousePosition ?? mousePosition}
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
