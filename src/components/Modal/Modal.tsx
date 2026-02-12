import Dialog from './RCDialog/Dialog'
import type { ModalProps } from './Modal.d'
import Footer from './Footer/Footer'

const Modal: React.FC<ModalProps> = (props) => {

    const {
        open = false,
        title = null,
        children = null,
        footer = null,
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',

        zIndex = 1000,
        closable = false,
        mask = true,
        maskClosable = false,

        onConfirm,
        onCancel,

        width = 520,
        height,
        className = '',
        style = {},
        getContainer,
    } = props

    const handleConfirm = () => {
        onConfirm?.()
    }
    const handleCancel = () => {
        onCancel?.()
    }

    const dialogFooter = footer
        ?   footer
        :   (<Footer
                confirmText={confirmText}
                confirmType={confirmType}
                cancelText={cancelText}
                cancelColor={cancelColor}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            ></Footer>)

    return (
        <Dialog
            visible={open}
            title={title}
            children={children}
            footer={dialogFooter}

            width={width}
            height={height}
            zIndex={zIndex}
            closable={closable}
            mask={mask}
            maskClosable={maskClosable}

            onClose={onCancel}

            className={className}
            style={style}
            getContainer={getContainer}
        ></Dialog>
    )
}

export default Modal
