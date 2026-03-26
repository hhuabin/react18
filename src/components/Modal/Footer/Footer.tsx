/**
 * @Author: bin
 * @Date: 2026-02-12 09:41:46
 * @LastEditors: bin
 * @LastEditTime: 2026-03-26 17:47:44
 */
import type { ModalProps } from '../Modal.d'
import './Footer.less'

type FooterProps = ModalProps & {
    showCancelButton?: boolean;
}

/**
 * @description TODO：需要兼容开发者传入的 footer
 */
const Footer: React.FC<FooterProps> = (props) => {

    const {
        footer,
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',
        showCancelButton = true,

        onConfirm,
        onCancel,
    } = props

    const handleConfirm = () => {
        onConfirm?.()
    }
    const handleCancel = () => {
        onCancel?.()
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
                    showCancelButton && (
                        <button
                            type='button'
                            className='bin-modal-cancel-btn'
                            onClick={() => handleCancel()}
                        >
                            <span style={{ color: cancelColor }}>{ cancelText }</span>
                        </button>
                    )
                }

                <button
                    type='button'
                    className='bin-modal-confirm-btn'
                    onClick={() => handleConfirm()}
                >
                    <span>{ confirmText }</span>
                </button>
            </>
        )
    }

    return footerNode
}

export default Footer
