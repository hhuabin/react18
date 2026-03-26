/**
 * @Author: bin
 * @Date: 2026-02-12 09:10:25
 * @LastEditors: bin
 * @LastEditTime: 2026-03-26 17:17:13
 */
import { unstableSetRender, type UnmountType } from './utils/reactRender'

import Modal from './Modal'
import type { ModalFuncProps } from './Modal.d'
import Footer from './Footer/Footer'
import './style/ConfirmContent.less'
import renderIcon from './utils/renderIcon'

let dialogZIndex = 1000

/**
 * @description: 销毁所有 Modal
 * 暴露给 Modal.destroyAll() 使用
 */
export const destroyFns: Array<() => void> = []

// 代替 Dialog 的 content 渲染内容
// eslint-disable-next-line react-refresh/only-export-components
const ConfirmContent: React.FC<ModalFuncProps & {close: () => void}> = (props) => {

    const {
        type,
        title,
        content = null,

        onConfirm,
        onCancel,
        close,
    } = props

    const handleConfirm = () => {
        onConfirm?.()
        close?.()
    }
    const handleCancel = () => {
        onCancel?.(),
        close?.()
    }

    return (
        <div className='bin-modal-confirm-body-wrapper'>
            <div className='bin-modal-confirm-body-has-title'>
                <div className='bin-modal-anticon-info-circle'>
                    {renderIcon(type)}
                </div>

                <div className='bin-modal-confirm-paragraph'>
                    {
                        title && (<div className='bin-modal-confirm-title'>{title}</div>)
                    }
                    <div className='bin-modal-confirm-content'>{content}</div>
                </div>
            </div>
            <div className='bin-modal-confirm-btns'>
                <Footer
                    {...props}
                    showCancelButton={type === 'confirm'}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                ></Footer>
            </div>
        </div>
    )
}


/**
 * @description: 函数式调用 Modal 的方法
 * 函数式即调用才会执行一次，不用考虑 reRender 的问题
 */
export default function confirm(config: ModalFuncProps) {

    // 默认打开
    let currentConfig: ModalFuncProps = { ...config, open: true }

    const mergedZIndex = currentConfig.zIndex ?? dialogZIndex++

    // 每次调用都创建一个空的容器
    const container = document.createDocumentFragment()

    // 卸载函数
    let reactUnmount: UnmountType

    // 该函数中 container 始终是一份，故 render 重复调用触发的是 React 的 diff
    const render = (props: ModalFuncProps) => {
        const reactRender = unstableSetRender()

        reactUnmount = reactRender(
            <Modal
                {...props}
                zIndex={mergedZIndex}
                title={null}
                footer={null}
                onCancel={() => {
                    // 右上角的 关闭按钮 触发的事件
                    props.onCancel?.()
                    close?.()
                }}
            >
                <ConfirmContent {...props} close={close}></ConfirmContent>
            </Modal>,
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
            open: false,
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
    const update = (config: ModalFuncProps) => {
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
