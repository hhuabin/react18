/**
 * @Author: bin
 * @Date: 2026-02-10 17:03:16
 * @LastEditors: bin
 * @LastEditTime: 2026-03-26 11:15:44
 */
import Dialog from './RCDialog/Dialog'
import type { ModalProps, MousePosition } from './Modal.d'
import Footer from './Footer/Footer'
import { canUseDocElement } from './utils/canUseDom'

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

        zIndex,
        closable = false,
        mask = true,
        maskClosable = false,

        onConfirm,
        onCancel,
        afterClose,

        mousePosition: customizeMousePosition,
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

    const dialogFooter = footer !== undefined
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
            afterClose={afterClose}

            mousePosition={customizeMousePosition ?? mousePosition}
            className={className}
            style={style}
            getContainer={getContainer}
        ></Dialog>
    )
}

export default Modal
