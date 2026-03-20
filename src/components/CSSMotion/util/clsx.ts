/**
 * @Author: bin
 * @Date: 2026-03-16 10:29:01
 * @LastEditors: bin
 * @LastEditTime: 2026-03-20 17:34:51
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description 动态拼接 className，支持字符串 / 数组 / 对象三种写法
 * @param args 
 * @returns { string }
 */
export const clsx = (...args: any[]): string => {
    let result = ''

    for (const arg of args) {
        if (!arg) continue

        if (typeof arg === 'string') {
            result += ' ' + arg
        }

        if (Array.isArray(arg)) {
            result += ' ' + clsx(...arg)
        }
        // 注意：这里拼接的是对象的 key 值 { a: true } -> a
        if (typeof arg === 'object') {
            for (const key in arg) {
                if (arg[key]) result += ' ' + key
            }
        }
    }

    return result.trim()
}
