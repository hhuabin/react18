/**
 * @Author: bin
 * @Date: 2026-03-20 17:08:50
 * @LastEditors: bin
 * @LastEditTime: 2026-03-23 16:44:20
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidElement, version } from 'react'

interface RefAttributes<T> extends React.Attributes {
    ref: React.Ref<T>;
}

// @example 18.3.1
const ReactMajorVersion = Number(version.split('.')[0])

// Symbol.for() 从“全局 Symbol 注册表”中获取一个 key 对应的 Symbol
const REACT_ELEMENT_TYPE_18: symbol = Symbol.for('react.element')
const REACT_ELEMENT_TYPE_19: symbol = Symbol.for('react.transitional.element')
const REACT_FRAGMENT_TYPE: symbol = Symbol.for('react.fragment')
const REACT_MEMO_TYPE: symbol = Symbol.for('react.memo')
const REACT_FORWARD_REF_TYPE: symbol = Symbol.for('react.forward_ref')
const REACT_LAZY_TYPE: symbol = Symbol.for('react.lazy')

/**
 * @description ReactDOM 实际对象，以下定义均是获取 $$typeof
    {
        $$typeof: Symbol(react.element),
        type: 'div',
        props: {},
        ref: null,
    }
 */
/**
 * @description 获取 ReactElement 的 $$typeof
 * @param object 节点
 * @returns { symbol | undefined }
 */
const typeOf = (object: any): symbol | undefined => {
    // 过滤非对象，如 string / number / boolean / null / undefined
    if (typeof object !== 'object' || object === null) return undefined

    // 判断是不是 ReactElement
    if (object.$$typeof === REACT_ELEMENT_TYPE_18) {
        const type = object.type

        // 判断是否是“包装组件”
        if (typeof type === 'object' && type !== null) {
            const $$typeofType = type.$$typeof

            if (
                $$typeofType === REACT_FORWARD_REF_TYPE ||
                $$typeofType === REACT_LAZY_TYPE ||
                $$typeofType === REACT_MEMO_TYPE
            ) {
                return $$typeofType
            }
        }

        // 普通 element
        return REACT_ELEMENT_TYPE_18
    }

    return undefined
}

/**
 * @description Compatible with React 18 or 19 to check if node is a Fragment.
 */
const isFragment = (object: any) => {
    return (
        // Base object type
        object &&
        typeof object === 'object' &&
        // React Element type
        (object.$$typeof === REACT_ELEMENT_TYPE_18 ||
            object.$$typeof === REACT_ELEMENT_TYPE_19) &&
        // React Fragment type
        object.type === REACT_FRAGMENT_TYPE
    )
}

/**
 * @description 函数组件是否是 memo 包装组件
 * @param object 节点
 * @returns { boolean } object is memo
 * @example memo 组件在 ReactDom 的实际对象
 * object = {
        $$typeof: Symbol(react.element),
        type: {
            $$typeof: Symbol(react.memo),       // 判定标准
            type: () => {}                      // 原始组件，函数式组件就是组件函数
        }
    }
 */
const isMemo = (object: any): boolean => {
    return typeOf(object) === REACT_MEMO_TYPE
}

/**
 * @description 判断是否是 ReactElement
 * @param node 节点
 * @returns { boolean }
 */
const isReactElement = (node: React.ReactNode): boolean => {
    // Fragment 虽然是 ReactElement，但“不能当普通元素用”
    return isValidElement(node) && !isFragment(node)
}

/**
 * @description 函数组件是否支持 ref 强调的是组件
 * @param nodeOrComponent 节点或者组件
 * @returns { boolean } nodeOrComponent is FunctionComponent
 */
export const supportRef = (nodeOrComponent: any): boolean => {
    if (!nodeOrComponent) return false

    // React19 中函数组件默认就可以接收 ref（不需要 forwardRef）
    if (isReactElement(nodeOrComponent) && ReactMajorVersion >= 19) {
        return true
    }

    // 获取组件函数 / 类组件
    const type = isMemo(nodeOrComponent)
        ? nodeOrComponent.type.type
        : nodeOrComponent.type

    // Function component node
    if (
        typeof type === 'function' &&
        !type.prototype?.render &&
        type.$$typeof !== REACT_FORWARD_REF_TYPE
    ) {
        return false
    }

    // Class component
    if (
        typeof nodeOrComponent === 'function' &&
        !nodeOrComponent.prototype?.render &&
        nodeOrComponent.$$typeof !== REACT_FORWARD_REF_TYPE
    ) {
        return false
    }
    return true
}

/**
 * @description 判断这个 node 是不是一个 “可用 ref 的 ReactElement” 强调的是节点
 * @param node 节点
 * @returns { boolean } node is React.ReactElement & RefAttributes<T> 收窄 node 的类型为 React.ReactElement & RefAttributes<T>（可以安全使用 ref 的 ReactElement）
 */
export const supportNodeRef = <T = any>(node: React.ReactNode): node is React.ReactElement & RefAttributes<T> => {
    return isReactElement(node) && supportRef(node)
}

export const getNodeRef: <T = any>(node: React.ReactNode) => React.Ref<T> | null = node => {
    if (node && isReactElement(node)) {
        const ele = node as any

        // propertyIsEnumerable 属性是否可枚举
        // return ele.props?.propertyIsEnumerable('ref') ? ele.props.ref : ele.ref
        return Object.prototype.propertyIsEnumerable.call(ele.props, 'ref')
            ? ele.props.ref
            : ele.ref
    }
    return null
}
