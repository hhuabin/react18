/**
 * @Author: bin
 * @Date: 2026-02-10 09:22:14
 * @LastEditors: bin
 * @LastEditTime: 2026-03-30 11:13:55
 */
import confirm, { destroyFns } from './confirm'
import OriginModal from './Modal'
import type { ModalFuncProps, ModalStaticFunctions } from './Modal.d'

type ModalInstance =
    typeof OriginModal &
    ModalStaticFunctions &
    {
        destroyAll: () => void;
    }

const Modal = OriginModal as ModalInstance

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
export * from './Modal.d'
