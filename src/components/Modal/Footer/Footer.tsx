/**
 * @Author: bin
 * @Date: 2026-02-12 09:41:46
 * @LastEditors: bin
 * @LastEditTime: 2026-02-14 10:38:02
 */
import type { ModalProps } from '../Modal.d'
import './Footer.less'

type FooterProps = {
    showCancelButton?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
} & Pick<ModalProps, 'confirmText' | 'confirmType' | 'cancelText' | 'cancelColor'>

const Footer: React.FC<FooterProps> = (props) => {

    const {
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

    return (
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

export default Footer
