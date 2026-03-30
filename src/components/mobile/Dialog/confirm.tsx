/**
 * @Author: bin
 * @Date: 2026-02-12 09:10:25
 * @LastEditors: bin
 * @LastEditTime: 2026-03-30 11:46:24
 */
import { unstableSetRender, type UnmountType } from './utils/reactRender'

import Dialog from './Dialog'
import type { DialogOptions } from './interface.d'

let dialogZIndex = 1000

/**
 * @description: 销毁所有 Modal
 * 暴露给 Modal.destroyAll() 使用
 */
export const destroyFns: Array<() => void> = []

/**
 * @description: 函数式调用 Modal 的方法
 * 函数式即调用才会执行一次，不用考虑 reRender 的问题
 */
export default function confirm(config: DialogOptions) {
    // 默认打开
    let currentConfig: DialogOptions = { ...config, visible: true }

    const mergedZIndex = currentConfig.zIndex ?? dialogZIndex++

    // 每次调用都创建一个空的容器
    const container = document.createDocumentFragment()

    // 卸载函数
    let reactUnmount: UnmountType

    // 该函数中 container 始终是一份，故 render 重复调用触发的是 React 的 diff
    const render = (props: DialogOptions) => {
        const {
            type,
            content,
            showCancelButton,
            confirmButtonText,
            onConfirm,
            onCancel,
        } = props

        const customShowCancelButton = typeof showCancelButton !== 'undefined'
            ? showCancelButton
            : type === 'confirm'
        const customConfirmButtonText = typeof confirmButtonText !== 'undefined'
            ? confirmButtonText
            : type === 'alert'
                ? '我知道了'
                : undefined

        // 改写确认和取消按钮的点击事件，添加上关闭操作
        const handleConfirm = () => {
            onConfirm?.()
            close?.()
        }
        const handleCancel = () => {
            onCancel?.(),
            close?.()
        }
        const reactRender = unstableSetRender()

        reactUnmount = reactRender(
            <Dialog
                {...props}
                showCancelButton={customShowCancelButton}
                confirmButtonText={customConfirmButtonText}
                zIndex={mergedZIndex}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
            >
                { content }
            </Dialog>,
            container,
        )
    }

    const destroy = () => {
        for (let i = 0; i < destroyFns.length; i++) {
            const fn = destroyFns[i]
            if (fn === close) {
                destroyFns.splice(i, 1)
                break
            }
        }
        reactUnmount()
    }

    /**
     * @description: 等待动画执行完毕，关闭弹窗
     */
    const close = () => {
        currentConfig = {
            ...config,
            visible: false,
            afterClose: () => {
                if (typeof config.afterClose === 'function') {
                    config.afterClose()
                }
                // 卸载
                destroy()
            },
        }
        render(currentConfig)
    }

    // 传入参数，直接更新即可
    const update = (config: DialogOptions) => {
        currentConfig = { ...currentConfig, ...config }
        render(currentConfig)
    }

    render(currentConfig)

    destroyFns.push(close)

    return {
        destroy: close,
        update,
    }
}
