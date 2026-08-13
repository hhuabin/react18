import {
    compareTimezoneTime,
    getBeiJingDateString,
    getDateStringByTimeAndCurrentOffset,
    getDateStringByTimeAndOffset,
    getTimestampByTimeAndOffset,
} from '@/utils/stringUtils/dateUtils'

describe('dateUtils', () => {
    const beijingOffset = -480
    const utcOffset = 0

    test('getTimestampByTimeAndOffset converts a timezone-specific string to the correct timestamp', () => {
        expect(getTimestampByTimeAndOffset('2025-07-07T17:00:00', beijingOffset)).toBe(
            Date.UTC(2025, 6, 7, 9, 0, 0),
        )
    })

    test('getTimestampByTimeAndOffset throws for invalid time strings', () => {
        expect(() => getTimestampByTimeAndOffset('invalid date', beijingOffset)).toThrow('Invalid time string')
    })

    test('getDateStringByTimeAndOffset formats a UTC timestamp into the target timezone', () => {
        expect(
            getDateStringByTimeAndOffset(
                Date.UTC(2025, 6, 7, 9, 5, 6, 7),
                utcOffset,
                beijingOffset,
                'YYYY-MM-DD hh:mm:ss mss',
            ),
        ).toBe('2025-07-07 17:05:06 007')
    })

    test('getDateStringByTimeAndOffset converts time strings between timezones', () => {
        expect(getDateStringByTimeAndOffset('2025-07-07 17:00:00', beijingOffset, utcOffset)).toBe(
            '2025-07-07 09:00:00',
        )
    })

    test('getDateStringByTimeAndCurrentOffset formats to the target timezone', () => {
        expect(getDateStringByTimeAndCurrentOffset(Date.UTC(2025, 6, 7, 9, 0, 0), beijingOffset)).toBe(
            '2025-07-07 17:00:00',
        )
    })

    test('getBeiJingDateString formats a timestamp as Beijing time', () => {
        const timestamp = Date.UTC(2025, 6, 7, 9, 5, 6, 7)

        expect(getBeiJingDateString(timestamp)).toBe('2025-07-07 17:05:06')
        expect(getBeiJingDateString(timestamp, 'YYYY/MM/DD hh:mm:ss mss')).toBe(
            '2025/07/07 17:05:06 007',
        )
    })

    test('getDateStringByTimeAndOffset returns the original value when date parsing fails', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(getDateStringByTimeAndOffset('invalid date', utcOffset, beijingOffset)).toBe('invalid date')
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })

    test('getDateStringByTimeAndOffset validates timezone offset ranges', () => {
        const timestamp = Date.UTC(2025, 6, 7, 9, 0, 0)

        expect(() => getDateStringByTimeAndOffset(timestamp, 721, beijingOffset)).toThrow(
            'Invalid currentTimezoneOffset value',
        )
        expect(() => getDateStringByTimeAndOffset(timestamp, utcOffset, -841)).toThrow(
            'Invalid targetTimezoneOffset value',
        )
    })

    test('compareTimezoneTime returns -1, 0, or 1 based on chronological order across timezones', () => {
        expect(compareTimezoneTime('2025-07-07 16:59:59', beijingOffset, '2025-07-07 09:00:00', utcOffset)).toBe(-1)
        expect(compareTimezoneTime('2025-07-07 17:00:00', beijingOffset, '2025-07-07 09:00:00', utcOffset)).toBe(0)
        expect(compareTimezoneTime('2025-07-07 17:00:01', beijingOffset, '2025-07-07 09:00:00', utcOffset)).toBe(1)
    })

    test('compareTimezoneTime validates timezone offset ranges', () => {
        const timestamp = Date.UTC(2025, 6, 7, 9, 0, 0)

        expect(() => compareTimezoneTime(timestamp, 721, timestamp, utcOffset)).toThrow(
            'Invalid currentTimezoneOffset value',
        )
        expect(() => compareTimezoneTime(timestamp, utcOffset, timestamp, 721)).toThrow(
            'Invalid targetTimezoneOffset value',
        )
    })
})
