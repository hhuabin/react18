/**
 * @Author: bin
 * @Date: 2026-04-23 16:54:27
 * @LastEditors: bin
 * @LastEditTime: 2026-04-23 17:49:28
 */
import { clamp } from '@/utils/functionUtils/mathUtils'

describe('mathUtils clamp', () => {
    test('returns the original value when it is within range', () => {
        expect(clamp(5, 0, 10)).toBe(5)
        expect(clamp(0, 0, 10)).toBe(0)
        expect(clamp(10, 0, 10)).toBe(10)
    })

    test('returns min when the value is below range', () => {
        expect(clamp(-1, 0, 10)).toBe(0)
        expect(clamp(-20, -10, 10)).toBe(-10)
    })

    test('returns max when the value is above range', () => {
        expect(clamp(11, 0, 10)).toBe(10)
        expect(clamp(20, -10, 10)).toBe(10)
    })

    test('supports decimal ranges and values', () => {
        expect(clamp(1.5, 0.5, 2.5)).toBe(1.5)
        expect(clamp(0.1, 0.5, 2.5)).toBe(0.5)
        expect(clamp(3.1, 0.5, 2.5)).toBe(2.5)
    })
})
