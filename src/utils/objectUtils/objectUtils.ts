/**
 * @Author: bin
 * @Date: 2026-04-10 15:43:38
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 15:43:50
 */
// 检查是否是空对象 {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEmptyObject = (obj: any) =>
    obj !== null &&
    typeof obj === 'object' &&
    Object.getPrototypeOf(obj) === Object.prototype &&
    Object.keys(obj).length === 0
