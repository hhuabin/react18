/**
 * @Author: bin
 * @Date: 2026-02-12 09:41:46
 * @LastEditors: bin
 * @LastEditTime: 2026-02-12 11:17:58
 */
import type { ModalProps } from '../Modal.d'
import './Footer.less'

type FooterProps = {
    onConfirm?: () => void;
    onCancel?: () => void;
} & Pick<ModalProps, 'confirmText' | 'confirmType' | 'cancelText' | 'cancelColor'>

const Footer: React.FC<FooterProps> = (props) => {

    const {
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',

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
            <button
                type='button'
                className='bin-modal-cancel-btn'
                onClick={() => handleCancel()}
            >
                <span style={{ color: cancelColor }}>{ cancelText }</span>
            </button>

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
