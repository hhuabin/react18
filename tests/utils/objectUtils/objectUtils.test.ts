/**
 * @Author: bin
 * @Date: 2026-04-23 16:18:35
 * @LastEditors: bin
 * @LastEditTime: 2026-04-23 16:19:51
 */
import { isEmptyObject } from '@/utils/objectUtils/objectUtils'

describe('objectUtils', () => {
    test('isEmptyObject returns true for an empty plain object', () => {
        expect(isEmptyObject({})).toBe(true)
    })

    test('isEmptyObject returns false for plain objects with enumerable keys', () => {
        expect(isEmptyObject({ a: 1 })).toBe(false)
        expect(isEmptyObject({ nested: {} })).toBe(false)
    })

    test('isEmptyObject returns false for null and primitive values', () => {
        expect(isEmptyObject(null)).toBe(false)
        expect(isEmptyObject(undefined)).toBe(false)
        expect(isEmptyObject('')).toBe(false)
        expect(isEmptyObject(0)).toBe(false)
        expect(isEmptyObject(false)).toBe(false)
    })

    test('isEmptyObject returns false for non-plain objects', () => {
        expect(isEmptyObject([])).toBe(false)
        expect(isEmptyObject(new Date())).toBe(false)
        expect(isEmptyObject(Object.create(null))).toBe(false)
        expect(isEmptyObject(new Map())).toBe(false)
    })
})
