/**
 * @Author: bin
 * @Date: 2026-02-12 09:41:46
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 09:59:04
 */
import type { ModalProps, ModalFuncProps } from '../Modal.d'
import './Footer.less'

/**
 * @description TODO：需要兼容开发者传入的 footer
 */
const Footer: React.FC<ModalProps | ModalFuncProps> = (props) => {

    const {
        footer,
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',

        onConfirm,
        onCancel,
    } = props

    const showCancelButton = () => {
        if ('type' in props) {
            return props.type === 'confirm'
        }
        return true
    }

    const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
        onConfirm?.(e)
    }
    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        onCancel?.(e)
    }

    let footerNode: React.ReactNode

    if (footer) {
        if (typeof footer === 'function') {
            footerNode = footer(handleConfirm, handleCancel)
        } else {
            footerNode = footer
        }
    } else {
        footerNode = (
            <>
                {
                    showCancelButton() && (
                        <button
                            type='button'
                            className='bin-modal-cancel-btn'
                            onClick={(e) => handleCancel(e)}
                        >
                            <span style={{ color: cancelColor }}>{ cancelText }</span>
                        </button>
                    )
                }

                <button
                    type='button'
                    className='bin-modal-confirm-btn'
                    onClick={(e) => handleConfirm(e)}
                >
                    <span>{ confirmText }</span>
                </button>
            </>
        )
    }

    return footerNode
}

export default Footer
