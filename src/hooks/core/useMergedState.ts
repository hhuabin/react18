/**
 * @Author: bin
 * @Date: 2025-08-25 08:47:22
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:51:20
 */
/* https://github.com/react-component/util/blob/master/src/hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react'
import useEvent from './useEvent'
import useLayoutUpdateEffect from './useLayoutUpdateEffect'
import useSafeState, { type SetStateAction } from './useSafeState'

/** We only think `undefined` is empty */
const hasValue = (value: any) => {
    return value !== undefined
}

/**
 * @description 可受控/非受控状态合并管理 Hook
 * 作用：常用于组件可以通过 value 受控，当不传 value 或 value === undefined 时可以使用内部状态非受控（受控模式（传 value）；非受控模式（没有传 value））
 * 作用2：hooks 内部已经实现函数式更新，即使开发者在父组件不传函数式更新，也可以获取到最新更新值，这对组件开发来说非常友好
 * @param { T | (() => T) } defaultStateValue 非受控状态的默认值（初始化时使用）
 * @param option 可选对象
 * @type T 传入 state 类型
 * @type R 返回 state 类型（可能经过 postState() 处理）
 * @returns { [R, SetStateAction<T>, () => R] } [state 值（和 useState 一样）, 更新状态的函数, 函数(返回闭包最新值)]
 * @example1 const [a, setA, getLatestA] = useMergedState(0) 非受控。与 useSafeState 没有差别
 * @example2 const [a, setA, getLatestA] = useMergedState(0, {
 *      value: props.a,
 * })   完全受控。 a 永远等于 props.a，因为没有配置 onChange，调用 setA 不会改变 a（该方式相当于 props.a 的透传）
 * @example3 const [a, setA, getLatestA] = useMergedState(0, {
 *      defaultValue: 0,
 *      value: props.a,
 *      onChange: props.onChange,
 *      postState: (a) => a >= 0 ? a : 0,     处理 a 只能是大于等于 0 的数
 * })   完全受控。a 由 props.a 控制。 调用 setA(newVal) 会触发 onChange(newVal, prev)，但是 props.a 的变化不会触发 onChange
 *      onChange 不是“自动因为 props.a 变化就触发”，而是因为 内部调用了 setA 触发
 */
export default function useMergedState<T, R = T>(
    defaultStateValue: T | (() => T),
    option?: {
        defaultValue?: T | (() => T);     // 非受控状态的默认值（优先于 defaultStateValue）
        value?: T;                        // 受控值，如果存在则内部状态会被覆盖
        onChange?: (value: T, prevState: T) => void;    // 内部状态变化自动调用，保存前一个值，参数有：最新的状态值、上一次的状态值
        postState?: (value: T) => R;      // 对 最终值 做加工/转换（比如格式化）
    },
): [R, SetStateAction<T>, () => R] {
    const { defaultValue, value, onChange, postState } = option || {}

    // =================== 初始化内部状态 ====================
    const [innerValue, setInnerValue] = useSafeState<T>(() => {
        if (hasValue(value)) {
            return value
        } else if (hasValue(defaultValue)) {
            return typeof defaultValue === 'function'
                ? (defaultValue as any)()
                : defaultValue
        } else {
            return typeof defaultStateValue === 'function'
                ? (defaultStateValue as any)()
                : defaultStateValue
        }
    })

    // 以下两个参数的定义，每次渲染都会执行，故而取的都是最新值
    // 合并状态值；优先取受控 value，否则取内部状态
    const mergedValue = value !== undefined ? value : innerValue
    // 经过 postState 处理后的最终返回值
    const postMergedValue = postState ? postState(mergedValue) : mergedValue

    const onChangeFn = useEvent(onChange ?? (() => {}))

    /**
     * 1. 存储上一次状态，被用于 onChangeFn 的第二个参数，通知外部组件内部状态发生了变化
     * 2. 使用数组包裹 setPrevValue([mergedValue]) 时，数组永远是新创建的，一定会更新成功并且触发 useLayoutEffect 正常执行
     */
    const [prevValue, setPrevValue] = useSafeState<[T]>([mergedValue])

    // 上一个值变化，触发 onChange
    useLayoutUpdateEffect(() => {
        const prev = prevValue[0]
        /**
         * 使用 innerValue 与 prev 对比
         * 使用 mergedValue 与 prev 对比时，当 mergedValue = value 而不是 innerValue 时
         * 父组件的 props 更新将会导致 onChangeFn 执行，若 onChangeFn 中改变了父组件状态则会造成死循环
         */
        if (innerValue !== prev) {
            /**
             * 常见的 onChangeFn 使用场景
             * 1. 组件内部状态变化 → 通知父组件同步
             * 2. 受控 + 非受控切换
             * 3. 状态联动
             * 4. 触发副作用
             * 5. 若新值innerValue不符合需求，重新将值改成 prev
             */
            // onChangeFn 携带了新值与旧值，可以通知外部，hook 内的状态发生了改变
            // （传入的是 innerValue， 而不是 postMergedValue，postState 进行数据处理时，需要注意初始化 key 值自增重复执行导致的跳跃问题）
            onChangeFn(innerValue, prev)
        }
    }, [prevValue])

    // ================== 受控切换回非受控的处理 ==================
    useLayoutUpdateEffect(() => {
        if (!hasValue(value)) {
            setInnerValue(value as T)
        }
    }, [value])

    // ===================== 更新状态的方法 ===================
    /**
     * @description useEvent 保持函数引用稳定，不会每次渲染新建。并且内部依然能拿到最新的 mergedValue
     */
    const triggerChange: SetStateAction<T> = useEvent((state, ignoreDestroy) => {
        // state：传入更新的值，直接改变内部状态
        setInnerValue(state, ignoreDestroy)
        // mergedValue： 当前值，state 更新后便成了旧值，存储
        setPrevValue([mergedValue], ignoreDestroy)
    })

    // 闭包最新值是新加值，原始 useMergedState() 并无该功能
    // 新增 getLatestValue 函数，保证返回最新值
    const getLatestValue = useEvent(() => postMergedValue)

    // postMergedValue 并不是闭包最新值，不能实现 useSyncState 一样的返回最新值，getLatestValue() 可以获取最新值
    return [postMergedValue as unknown as R, triggerChange, getLatestValue as () => R]
}
