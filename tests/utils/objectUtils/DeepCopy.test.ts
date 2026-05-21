import DeepCopy from '@/utils/objectUtils/DeepCopy'

describe('DeepCopy', () => {
    test('deepCopy returns primitives and null as-is', () => {
        expect(DeepCopy.deepCopy(1)).toBe(1)
        expect(DeepCopy.deepCopy('text')).toBe('text')
        expect(DeepCopy.deepCopy(false)).toBe(false)
        expect(DeepCopy.deepCopy(null)).toBeNull()
    })

    test('deepCopy clones nested objects and arrays without sharing references', () => {
        const source = {
            name: 'bin',
            nested: {
                count: 1,
            },
            list: [1, { value: 2 }],
        }

        const copy = DeepCopy.deepCopy(source)

        expect(copy).toEqual(source)
        expect(copy).not.toBe(source)
        expect(copy.nested).not.toBe(source.nested)
        expect(copy.list).not.toBe(source.list)
        expect(copy.list[1]).not.toBe(source.list[1])
    })

    test('deepCopy keeps function references while cloning container objects', () => {
        const fn = () => 'ok'
        const source = {
            fn,
        }

        const copy = DeepCopy.deepCopy(source)

        expect(copy).not.toBe(source)
        expect(copy.fn).toBe(fn)
    })

    test('deepCopyWithJSON clones JSON-safe values without shared references', () => {
        const source = {
            name: 'bin',
            nested: {
                count: 1,
            },
            list: [1, 2, 3],
        }

        const copy = DeepCopy.deepCopyWithJSON(source)

        expect(copy).toEqual(source)
        expect(copy).not.toBe(source)
        expect(copy.nested).not.toBe(source.nested)
        expect(copy.list).not.toBe(source.list)
    })

    test('deepCopyWithJSON drops unsupported JSON values in objects', () => {
        const fn = () => 'ok'
        const date = new Date('2024-01-01T00:00:00.000Z')
        const source = {
            keep: 1,
            skip: undefined as undefined | number,
            fn,
            date,
        }

        const copy = DeepCopy.deepCopyWithJSON(source) as {
            keep: number;
            date: Date;
            skip?: number;
            fn?: () => string;
        }

        expect(copy).toEqual({
            keep: 1,
            date: '2024-01-01T00:00:00.000Z',
        })
        expect('skip' in copy).toBe(false)
        expect('fn' in copy).toBe(false)
    })
})
