/**
 * @Author: bin
 * @Date: 2026-02-12 09:10:25
 * @LastEditors: bin
 * @LastEditTime: 2026-02-12 14:22:15
 */
import { unstableSetRender, type UnmountType } from './utils/reactRender'

import Modal from './Modal'
import type { ModalFuncProps } from './Modal.d'

/**
 * @description: 销毁所有 Modal
 * 如果以后有 useModal hooks，该对象需要和 useModal 结合使用
 */
export const destroyFns: Array<() => void> = []

/**
 * @description: 函数式调用 Modal 的方法
 * @param {ModalFuncProps} config
 * @return {*}
 */
export default function confirm(config: ModalFuncProps) {

    // 每次调用都创建一个空的容器
    const container = document.createDocumentFragment()

    // 卸载函数
    let reactUnmount: UnmountType

    const render = () => {
        const reactRender = unstableSetRender()

        reactUnmount = reactRender(
            <Modal
                {...config}
            ></Modal>,
            container,
        )
    }

    const destroy = () => {

    }

    const update = (config: ModalFuncProps) => {

    }

    return {
        destroy,
        update,
    }
}
