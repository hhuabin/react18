/**
 * new Date()：不同时区的同一时刻 new Date() 是不一样，比如中国是 08:00，日本是 09:00
 *  不同时区 new Date('2025/07/07').getTime() 的值是并不一样，并非某一固定时刻
 * Date.now()：不同时区的同一时刻 Date.now() 是一样的（比如中国的 08:00 和日本的 09:00时，Date.now() 是一样的）
 *  Date.now() 是一个固定的时刻
 */

/**
 * @description 通过 某时区某时间 获取该时刻的 时间戳
 * @example getTimestampByTimeAndOffset(new Date(), -480) 获取北京时间2025-07-07 17:00:00的时间戳
 * @param { string | Date } date 指定时间，默认值：new Date()
 * @param { number } timezoneOffset 指定时区相对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：东八区（北京） -480
 * @returns { number } 时间戳
 */
export const getTimestampByTimeAndOffset = (
    date: string | Date = new Date(),
    timezoneOffset: number = -480,
): number => {

    if (typeof date === 'string' && date.constructor === String) {
        // ios 不支持 - 连接故而需要使用 /
        date = new Date(date.replace(/T/g, ' ').replace(/-/g, '/'))
    }

    // 获取当前时区该时间的时间戳
    const localTimestamp = (date as Date).getTime()
    if (isNaN(localTimestamp)) {
        throw new Error('Invalid time string')
    }
    // 计算当前时区与目标时区“反向”偏移值差
    const calcOffset = new Date().getTimezoneOffset() - timezoneOffset

    return localTimestamp - calcOffset * 60 * 1000
}

/**
 * @description 通过 当前时区时间 获取 目标时区时间字符串
 * @param { string | Date | number } date 日期，默认值：当前时区该时刻
 * @param { number } timezoneOffset 指定时区相对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：当前时区 new Date().getTimezoneOffset()
 * @param { string } fmt 日期格式，默认值：YYYY-MM-DD hh:mm:ss
 * @returns { string } 日期字符串
 *
 * @example getDateStringByTimeAndCurrentOffset(new Date(), new Date().getTimezoneOffset()) 获取当前时区的此刻的时间字符串
 * @example getDateStringByTimeAndCurrentOffset(new Date(), -480) 获取当前时区的此刻的北京时间字符串
 * @introduction 是 getDateStringByTimeAndOffset 的一个用法，固定是当前时区
 */
export const getDateStringByTimeAndCurrentOffset = (
    date: string | Date | number = new Date(),
    timezoneOffset: number = new Date().getTimezoneOffset(),
    fmt = 'YYYY-MM-DD hh:mm:ss',
): string => {
    // 可以直接调用以下函数
    return getDateStringByTimeAndOffset(date, new Date().getTimezoneOffset(), timezoneOffset, fmt)
    /* try {
        if (typeof date === 'string' && date.constructor === String) {
            // ios 不支持 - 连接故而需要使用 /
            date = new Date(date.replace(/T/g, ' ').replace(/-/g, '/'))
        } else if (typeof date === 'number' && date.constructor === Number) {
            date = new Date(date)
        } else if (date instanceof Object && date.constructor === Date) {
            // do nothing
        } else {
            throw new Error('Invalid date value')
        }
        if (isNaN(date.getTime())) throw new Error('Invalid date value')
    } catch (error) {
        console.error(error)
        return date.toString()
    }

    if (timezoneOffset < -840 || timezoneOffset > 720) {
        throw new Error('Invalid timezoneOffset value')
    }

    // 1. 转换为其他时区时间
    const targetTime = new Date(date.getTime() - timezoneOffset * 60 * 1000)

    // 2. 格式化为 YYYY-MM-DD hh:mm:ss
    const dateFmtObj: Record<string, string> = {
        'Y+': String(targetTime.getUTCFullYear()),
        'M+': String(targetTime.getUTCMonth() + 1),
        'D+': String(targetTime.getUTCDate()),
        'h+': String(targetTime.getUTCHours()),
        'm+': String(targetTime.getUTCMinutes()),
        's+': String(targetTime.getUTCSeconds()),
        'mss': String(targetTime.getUTCMilliseconds()),
    }
    for (const key in dateFmtObj) {
        const regex = new RegExp(`(${key})`)
        if (regex.test(fmt)) {
            let dateValue = dateFmtObj[key]       // 获取对应的值
            const fmtStrLength = (fmt.match(regex) as RegExpMatchArray)[0].length         // 获取匹配的字符串的长度
            dateValue = dateValue.padStart(fmtStrLength, '0').slice(-fmtStrLength)      // 填充字符串
            fmt = fmt.replace(regex, dateValue)
        }
    }
    return fmt */
}

/**
 * @description 获取 当前时区目标时间 的 北京时间
 * @param date 目标时间
 * @param fmt 日期格式，默认值：YYYY-MM-DD hh:mm:ss
 * @returns { string } 北京时间日期字符串
 */
export const getBeiJingDateString = (
    date: string | Date | number = new Date(),
    fmt = 'YYYY-MM-DD hh:mm:ss',
): string => {
    return getDateStringByTimeAndOffset(date, new Date().getTimezoneOffset(), -480, fmt)
}

/**
 * @description 通过 任意时区时间 获取 目标时区时间字符串；
 *  主要用于：调用该函数，可以确认传给后端的字符串时间都是北京时间，若后端服务器分布在多个时区，则应该改为传时间戳
 * @example getDateStringByTimeAndOffset(new Date(), new Date().getTimezoneOffset(), -480, 'YYYY-MM-DD hh:mm:ss') 获取当前时区的此刻的北京时间
 * @param { string | Date | number } currentDate 任意时区时间，默认值：new Date()
 * @param { number } currentTimezoneOffset 任意时区对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：new Date ().getTimezoneOffset()
 * @param { number } targetTimezoneOffset 目标时区对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：东八区（北京） -480
 * @param fmt 日期格式，默认值：YYYY-MM-DD hh:mm:ss
 * @returns { string } 日期字符串
 */
export const getDateStringByTimeAndOffset = (
    date: string | Date | number = new Date(),
    currentTimezoneOffset: number = new Date().getTimezoneOffset(),
    targetTimezoneOffset: number = -480,
    fmt = 'YYYY-MM-DD hh:mm:ss',
): string => {
    // 定义给定时区时间的时间戳
    let dateUTCTimestamp: number
    try {
        if (typeof date === 'string' && date.constructor === String) {
            // 根据给定时区时间 获取该时间的时间戳
            dateUTCTimestamp = getTimestampByTimeAndOffset(date, currentTimezoneOffset)
        } else if (typeof date === 'number' && date.constructor === Number) {
            dateUTCTimestamp = date
        } else if (date instanceof Object && date.constructor === Date) {
            dateUTCTimestamp = getTimestampByTimeAndOffset(date, currentTimezoneOffset)
        } else {
            throw new Error('Invalid date value')
        }
    } catch (error) {
        console.error(error)
        return date.toString()
    }

    if (currentTimezoneOffset < -840 || currentTimezoneOffset > 720) {
        throw new Error('Invalid currentTimezoneOffset value')
    } else if (targetTimezoneOffset < -840 || targetTimezoneOffset > 720) {
        throw new Error('Invalid targetTimezoneOffset value')
    }

    // 1. 通过中时区时间，转换为目标时区时间
    const targetTime = new Date(dateUTCTimestamp - targetTimezoneOffset * 60 * 1000)

    // 2. 格式化为 YYYY-MM-DD hh:mm:ss:mss
    const dateFmtObj: Record<string, string> = {
        'Y+': String(targetTime.getUTCFullYear()),
        'M+': String(targetTime.getUTCMonth() + 1),
        'D+': String(targetTime.getUTCDate()),
        'h+': String(targetTime.getUTCHours()),
        'm+': String(targetTime.getUTCMinutes()),
        's+': String(targetTime.getUTCSeconds()),
        'mss': String(targetTime.getUTCMilliseconds()),
    }
    for (const key in dateFmtObj) {
        const regex = new RegExp(`(${key})`)
        if (regex.test(fmt)) {
            let dateValue = dateFmtObj[key]       // 获取对应的值
            const fmtStrLength = (fmt.match(regex) as RegExpMatchArray)[0].length         // 获取匹配的字符串的长度
            dateValue = dateValue.padStart(fmtStrLength, '0').slice(-fmtStrLength)      // 填充字符串
            fmt = fmt.replace(regex, dateValue)
        }
    }
    return fmt
}

/**
 * @description 对比两个时区的时间先后
 * @example compareTimezoneTime(new Date(), new Date().getTimezoneOffset(), '2025-07-07 17:00:00', -480) 判断当前时区此刻是否早于北京时间的2025-07-07 17:00:00
 * @param { string | Date | number } currentDate 当前时区时间，默认值：new Date()
 * @param { number } currentTimezoneOffset 当前时区对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：new Date ().getTimezoneOffset()
 * @param { string | Date | number } targetDate 目标时区时间，默认值：new Date()
 * @attention targetDate 建议传 string 类型的参数，因为 new Date()、Date.now() 都是相对于当前时区获得，该情况下 targetTimezoneOffset 只能指定为当前时区
 * @param { number } targetTimezoneOffset 目标时区对于 UTC 的“反向”偏移值[ -840, +720 ]；默认值：东八区（北京） -480
 * @returns { -1 | 0 | 1 } -1 早于目标时间，0 等于目标时间，1 晚于或等于目标时间
 */
export const compareTimezoneTime = (
    currentDate: string | Date | number = new Date(),
    currentTimezoneOffset: number = new Date().getTimezoneOffset(),
    targetDate: string | Date | number = new Date(),
    targetTimezoneOffset: number = -480,
): -1 | 0 | 1 => {

    if (currentTimezoneOffset < -840 || currentTimezoneOffset > 720) {
        throw new Error('Invalid currentTimezoneOffset value')
    } else if (targetTimezoneOffset < -840 || targetTimezoneOffset > 720) {
        throw new Error('Invalid targetTimezoneOffset value')
    }

    // 定义时间戳
    let currentUTCTimestamp, targetUTCTimestamp

    if (typeof currentDate === 'string' && currentDate.constructor === String) {
        // 获取该时区时间的时间戳
        currentUTCTimestamp = getTimestampByTimeAndOffset(currentDate, currentTimezoneOffset)
    } else if (typeof currentDate === 'number' && currentDate.constructor === Number) {
        currentUTCTimestamp = currentDate
    } else if (currentDate instanceof Object && currentDate.constructor === Date) {
        currentUTCTimestamp = getTimestampByTimeAndOffset(currentDate, currentTimezoneOffset)
    } else {
        throw new Error('Invalid currentDate value')
    }

    if (typeof targetDate === 'string' && targetDate.constructor === String) {
        targetUTCTimestamp = getTimestampByTimeAndOffset(targetDate, targetTimezoneOffset)
    } else if (typeof targetDate === 'number' && targetDate.constructor === Number) {
        targetUTCTimestamp = targetDate
    } else if (targetDate instanceof Object && targetDate.constructor === Date) {
        targetUTCTimestamp = getTimestampByTimeAndOffset(targetDate, targetTimezoneOffset)
    } else {
        throw new Error('Invalid targetDate value')
    }

    // 对比时间戳 即可得出先后时间
    if (currentUTCTimestamp - targetUTCTimestamp < 0) {
        // 早于目标时间
        return -1
    } else if (currentUTCTimestamp - targetUTCTimestamp === 0) {
        // 等于目标时间
        return 0
    } else {
        // 晚于目标时间
        return 1
    }
}
