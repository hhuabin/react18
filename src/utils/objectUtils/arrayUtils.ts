/* eslint-disable @typescript-eslint/no-explicit-any */

// 准确的数组判断函数（无论对象有没有被篡改过方法）
export const isArray = (val: any) => Array.isArray(val)
