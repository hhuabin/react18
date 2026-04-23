/**
 * @Author: bin
 * @Date: 2026-04-23 16:35:00
 * @LastEditors: bin
 * @LastEditTime: 2026-04-23 16:51:39
 */
import { isArray } from '@/utils/objectUtils/arrayUtils'

describe('arrayUtils', () => {
    test('isArray returns true for arrays', () => {
        expect(isArray([])).toBe(true)
        expect(isArray([1, 2, 3])).toBe(true)
        expect(isArray(new Array(2))).toBe(true)
    })

    test('isArray returns false for array-like and non-array values', () => {
        expect(isArray({ 0: 'a', length: 1 })).toBe(false)
        expect(isArray('[]')).toBe(false)
        expect(isArray(null)).toBe(false)
        expect(isArray(undefined)).toBe(false)
        expect(isArray(new Set())).toBe(false)
    })
})
