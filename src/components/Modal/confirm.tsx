/**
 * @Author: bin
 * @Date: 2026-02-12 09:10:25
 * @LastEditors: bin
 * @LastEditTime: 2026-03-26 10:03:32
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
 * 如果以后有 useModal hooks，该对象需要和 useModal 结合使用
 */
export const destroyFns: Array<() => void> = []

// 代替 Dialog 的 content 渲染内容
// eslint-disable-next-line react-refresh/only-export-components
const ConfirmContent: React.FC<ModalFuncProps & {close: () => void}> = (props) => {

    const {
        type,
        title = null,
        content = null,
        footer = null,
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',

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
        <div className='bin-dialog-confirm-body-wrapper'>
            <div className='bin-dialog-confirm-body-has-title'>
                <div className='bin-dialog-anticon-info-circle'>
                    {renderIcon(type)}
                </div>

                <div className='bin-dialog-confirm-paragraph'>
                    {
                        title && (<div className='bin-dialog-confirm-title'>{title}</div>)
                    }
                    <div className='bin-dialog-confirm-content'>{content}</div>
                </div>
            </div>
            <div className='bin-dialog-confirm-btns'>
                <Footer
                    confirmText={confirmText}
                    confirmType={confirmType}
                    cancelText={cancelText}
                    cancelColor={cancelColor}
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

    const render = (props: ModalFuncProps) => {
        const reactRender = unstableSetRender()

        reactUnmount = reactRender(
            <Modal
                {...props}
                zIndex={mergedZIndex}
                title={null}
                footer={null}
                onCancel={() => {
                    close?.()
                }}
            >
                <ConfirmContent {...props} close={close}></ConfirmContent>
            </Modal>,
            container,
        )
    }

    const destroy = () => {
        reactUnmount()
    }

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

    const update = (config: ModalFuncProps) => {

    }

    render(currentConfig)

    return {
        destroy: close,
        update,
    }
}
