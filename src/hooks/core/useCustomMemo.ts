/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:51:41
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react'

interface Cache<Value, Condition> {
    value?: Value;
    condition?: Condition;
}

/**
 * @description 自定义 useMemo Hook
 * 功能：自定义比较，重新计算由自定义比较函数 shouldUpdate 决定，可灵活运用
 * React 自带的 useMemo 依赖数组判断仅做浅比较（===）。如果 a 是对象或数组，即使内容没变，只要引用不同，useMemo 也会重新计算
 * @param { () => Value } getValue 惰性计算函数（必须具有返回值），只有需要更新时才会执行
 * @param { any[] } condition 外部传入的依赖条件，用于判断是否需要更新，默认是数组，也可用对象等覆盖
 * @param shouldUpdate 自定义比较函数，返回 true 表示需要更新值
 * @returns getValue() 返回值
 * @example const result = useCustomMemo<number, {a: number}>(
 *      () => obj.a * 2,
 *      obj,
 *      (prev, next) => prev.a !== next.a,
 * )
 */
export default function useCustomMemo<Value, Condition = any[]>(
    getValue: () => Value,
    condition: Condition,
    shouldUpdate: (prev: Condition, next: Condition) => boolean,
) {
    const cacheRef = useRef<Cache<Value, Condition>>({})

    // !('value' in cacheRef.current) 第一次执行
    if (
        !('value' in cacheRef.current) ||
        shouldUpdate(cacheRef.current.condition!, condition)
    ) {
        cacheRef.current.value = getValue()
        // 存储依赖条件，下一次更新就是 prev condition 了
        cacheRef.current.condition = condition
    }

    return cacheRef.current.value
}
