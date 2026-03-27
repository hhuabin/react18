/**
 * @Author: bin
 * @Date: 2026-02-10 17:03:16
 * @LastEditors: bin
 * @LastEditTime: 2026-03-27 09:39:20
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

/**
 * @description Modal 弹窗组件
 * 把所有的参数透传给 Dialog
 * 1. 新增鼠标位置信息
 * 2. 自定义默认页脚
 */
const Modal: React.FC<ModalProps> = (props) => {

    const {
        open = false,

        // 弹窗属性
        zIndex,
        closable = false,
        mask = true,
        maskClosable = false,
        destroyOnHidden = false,
        forceRender = false,

        // 弹窗内容
        title,
        children,
        footer,
        confirmText = '确定',
        confirmType = 'primary',
        cancelText = '取消',
        cancelColor = '',

        // 弹窗事件
        onConfirm,
        onCancel,
        afterClose,

        // 弹窗样式
        mousePosition: customizeMousePosition,
        motionName,
        width = 520,
        height,
        className = '',
        style = {},
        getContainer,
    } = props

    const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
        onConfirm?.(e)
    }
    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        onCancel?.(e)
    }

    // 自定义页脚
    const dialogFooter = footer !== null
        ?   (<Footer
                {...props}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />)
        :   null

    return (
        <Dialog
            visible={open}
            zIndex={zIndex}
            closable={closable}
            mask={mask}
            maskClosable={maskClosable}
            destroyOnHidden={destroyOnHidden}
            forceRender={forceRender}

            title={title}
            children={children}
            footer={dialogFooter}

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose={handleCancel as any}
            afterClose={afterClose}

            mousePosition={customizeMousePosition ?? mousePosition}
            motionName={motionName}
            width={width}
            height={height}
            className={className}
            style={style}
            getContainer={getContainer}
        ></Dialog>
    )
}

export default Modal
