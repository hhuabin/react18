import confirm, { destroyFns } from './confirm'
import OriginModal from './Modal'
import type { ModalFuncProps, ModalStaticFunctions } from './Modal.d'

type ModalType =
    typeof OriginModal &
    ModalStaticFunctions &
    {
        destroyAll: () => void;
    }

const Modal = OriginModal as ModalType

const StaticType: NonNullable<ModalFuncProps['type']>[] = ['info', 'success', 'error', 'warning', 'confirm'] as const
// 定义静态方法
StaticType.forEach((type) => {
    Modal[type] = (props) => confirm({
        ...props,
        type,
    })
})

/**
 * @description 销毁所有弹窗
 */
Modal.destroyAll = () => {
    while (destroyFns.length) {
        const close = destroyFns.pop()
        close?.()
    }
}

export default Modal

