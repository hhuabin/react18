/**
 * @Author: bin
 * @Date: 2026-03-20 17:08:50
 * @LastEditors: bin
 * @LastEditTime: 2026-03-20 17:09:54
 */

import { isValidElement, version } from 'react'

const isReactElement = (node: React.ReactNode) => {
    return isValidElement(node) && !isFragment(node);
}
export const supportRef = (nodeOrComponent: any): boolean => {
    if (!nodeOrComponent) {
        return false;
    }

    // React 19 no need `forwardRef` anymore. So just pass if is a React element.
    if (isReactElement(nodeOrComponent) && ReactMajorVersion >= 19) {
        return true;
    }

    const type = isMemo(nodeOrComponent)
        ? nodeOrComponent.type.type
        : nodeOrComponent.type;

    // Function component node
    if (
        typeof type === 'function' &&
        !type.prototype?.render &&
        type.$$typeof !== ForwardRef
    ) {
        return false;
    }

    // Class component
    if (
        typeof nodeOrComponent === 'function' &&
        !nodeOrComponent.prototype?.render &&
        nodeOrComponent.$$typeof !== ForwardRef
    ) {
        return false;
    }
    return true;
}

export const supportNodeRef = <T = any>(
    node: React.ReactNode,
): node is React.ReactElement & RefAttributes<T> => {
    return isReactElement(node) && supportRef(node);
}
