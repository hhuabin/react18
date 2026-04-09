/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MessageType } from '../Message.d'

/**
 * @description 创建一个处于 Pending 状态的 Promise 的可执行函数
 * 1.为高阶函数提供Promise出口参数
 * 2.将高阶函数放入Promise中执行
 * 3.设置函数返回值为高阶函数返回值
 * 4.将函数返回值中的then()改写Promise的then()
 * @param { Function } openFn 高阶函数：高阶函数在 wrapPromiseFn 的 Promise 中被同步执行
 *  - resolve：即() => { resolve(true) }；在wrapPromiseFn中被定义为将 wrapPromiseFn 函数的 Pending 状态改为 Fulfilled(Resolved)状态的函数
 *  - resolve() 调用，wrapPromiseFn 的 Promise 将进入 Fulfilled（成功）状态，并返回一个值(true)，此时result.then()也会被链式调用
 *  - attention: resolve() 是 wrapPromiseFn 的唯一出口
 * @returns { MessageType } result 返回一个带有then()属性的可执行函数；该可执行函数为 openFn() 高阶函数的返回值
 *  - 在 openFn() 高阶函数的返回值 VoidFunction 中一般包含 resolve() ，作为 wrapPromiseFn 的出口被调用
 *  - attention: 为该可执行函数附加的 then()方法 ，都将被改写为其内部 Promise 的 Promise.then()
 */
export const wrapPromiseFn = (openFn: (resolve: VoidFunction) => VoidFunction): MessageType => {
    /**
     * closeFn 是 openFn 高阶函数的返回值，是() => { resolve() }的扩展形式
     * 故而只要调用 closeFn 函数，就会执行 resolve() ，wrapPromiseFn 进入Fulfilled（成功）状态
     */
    let closeFn: VoidFunction

    /**
     * 若closeFn()不被调用，该Promise会一直处于Pending状态
     */
    const closePromise = new Promise((resolve) => {
        /**
         * @description 1.为高阶函数提供Promise出口参数
         * @description 2.将高阶函数放入Promise中执行
         * openFn的参数 resolve 被赋值为() => { resolve(true) }
         * closeFn()被调用（执行openFn的返回值）时，即执行() => { resolve(true) }，即执行resolve(true)
         */
        closeFn = openFn(() => {
            resolve(true)
        })
    })

    /**
     * @description 3.设置函数返回值为高阶函数返回值
     */
    const result: MessageType = () => {
        // 调用closeFn，返回Fulfilled(Resolved)状态的Promise
        // (closeFn === null || closeFn === void 0) ? void 0 : closeFn()
        closeFn?.()
    }

    /**
     * @description 4.将函数返回值中的then()改写Promise的then()
     * 改写result.then()；将其改为closePromise().then()；函数在closePromise()返回时，才会执行
     * @param onfulfilled result.then()的resolve
     * @param onrejected result.then()的reject
     * @returns closePromise.then()
     */
    result.then = (onfulfilled, onrejected) => {
        // @ts-expect-error (resolve, reject)
        return closePromise.then(onfulfilled, onrejected)
    }
    ;(result as any).promise = closePromise
    return result
}
