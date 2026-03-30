/**
 * @Author: bin
 * @Date: 2026-03-27 16:17:35
 * @LastEditors: bin
 * @LastEditTime: 2026-03-30 11:11:32
 */
import confirm, { destroyFns } from './confirm'
import OriginDialog from './Dialog'
import type { DialogOptions, DialogStaticFunctions } from './interface'

type DialogInstance =
    typeof OriginDialog &
    DialogStaticFunctions &
    {
        destroyAll: () => void;
    }

const Dialog = OriginDialog as DialogInstance

const StaticType: NonNullable<DialogOptions['type']>[] = ['alert', 'show', 'confirm'] as const
// 定义静态方法
StaticType.forEach((type) => {
    Dialog[type] = (props) => confirm({
        ...props,
        type,
    })
})

/**
 * @description 销毁所有弹窗
 */
Dialog.destroyAll = () => {
    while (destroyFns.length) {
        const close = destroyFns.pop()
        close?.()
    }
}

export default Dialog
export * from './interface.d'
