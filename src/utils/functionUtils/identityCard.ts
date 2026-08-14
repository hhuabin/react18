/**
 * @Author: bin
 * @Date: 2025-08-04 14:37:21
 * @LastEditors: bin
 * @LastEditTime: 2026-08-14 10:44:52
 */

const FIRST_IDNO_PATTERN = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|1[0-2])(([0-2][1-9])|10|20|30|31)\d{3}/
const SECOND_IDNO_PATTERN = /^([1-6][1-9]|50)\d{4}(19|20)\d{2}((0[1-9])|1[0-2])(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

/**
 * @description 辅助函数：验证日期有效性，判断是不是有效的日期
 * @example isValidDate('2026', '02', '31') = false
 * @returns { boolean }
 */
const isValidDate = (year: string, month: string, day: string): boolean => {
    const y = parseInt(year, 10)
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)

    // 参数必须是有效数字
    if ([y, m, d].some(Number.isNaN)) return false

    // 基本范围检查
    if (m < 1 || m > 12) return false
    if (d < 1 || d > 31) return false

    // 创建Date对象验证
    const date = new Date(y, m - 1, d)
    // NaN === NaN 是 false，所以 y, m, d 不用校验 NaN
    return date.getFullYear() === y &&
           date.getMonth() + 1 === m &&
           date.getDate() === d
}

// 验证生日日期的有效性
const isValidBirthdayDate = (year: string, month: string, day: string): boolean => {
    // 先验证日期是否合法
    if (!isValidDate(year, month, day)) return false

    const y = parseInt(year, 10)
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)

    // 生日年份不能早于 1900 年
    if (y < 1900) return false

    // 生日不能是未来日期
    const birthDate = new Date(y, m - 1, d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return birthDate <= today
}

/**
 * @description 居民身份证号码格式校验，默认使用第二代身份证校验
 * @param { string } idCardNumber 身份证号码
 * @param { boolean } enableFirst 是否开启第一代身份证校验
 * @returns { boolean } true 通过校验；false 校验失败
 * @example validateIdentityCard('111111111111111111', true)
 */
const validateIdentityCard = (idCardNumber: string, enableFirst = false): boolean => {
    if (typeof idCardNumber !== 'string') return false

    if (enableFirst && idCardNumber.length === 15) {
        // 15位身份证开启第一代身份证检验
        return validateFirstIdCard(idCardNumber)
    }
    return validateSecondIdCard(idCardNumber)
}

/**
 * @description 第一代居民身份证号码格式校验
 * @rule 1999年之前发放：6位地区码 + 6位出生日期（YYMMDD） + 3位顺序码（无校验码，15位是性别），共15位
 * @param { string } idCardNumber 15位身份证号码
 * @returns { boolean } true 通过校验；false 校验失败
 * @example validateFirstIdCard('111111111111111')
 */
const validateFirstIdCard = (idCardNumber: string): boolean => {
    if (typeof idCardNumber !== 'string') return false

    if (!FIRST_IDNO_PATTERN.test(idCardNumber)) return false

    // 补全年份为19xx
    const [year, month, day] = [+('19' + idCardNumber.substring(6, 8)), +idCardNumber.substring(8, 10), +idCardNumber.substring(10, 12)]
    const date = new Date(year, month - 1, day)
    if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
    ) return false

    return true
}

/**
 * @description 第二代居民身份证号码格式校验
 * @rule 6位地区码 + 8位出生日期（YYYYMMDD） + 3位顺序码（17位是性别） + 1位校验码，共18位
 * @param { string } idCardNumber 18位身份证号码
 * @returns { boolean } true 通过校验；false 校验失败
 * @example validateSecondIdCard('111111111111111111')
 */
const validateSecondIdCard = (idCardNumber: string): boolean => {
    if (typeof idCardNumber !== 'string') return false

    // 计算支持年份，从二十世纪至今
    let supportYear = '19'
    const maxSupportYear = Math.floor(new Date().getFullYear() / 100)
    for (let year = 20; year <= maxSupportYear; year++) {
        supportYear += `|${year}`
    }
    const pattern = `^([1-6][1-9]|50)\\d{4}(${supportYear})\\d{2}((0[1-9])|1[0-2])(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$`
    const regex = new RegExp(pattern)
    if (!regex.test(idCardNumber)) return false

    // 验证日期
    const [year, month, day] = [+idCardNumber.substring(6, 10), +idCardNumber.substring(10, 12), +idCardNumber.substring(12, 14)]
    const date = new Date(year, month - 1, day)
    if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
    ) return false

    // 校验位权重
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    // 校验码对应值
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

    // 计算校验码
    const sum = weights.reduce((prev, current, index) => prev + current * +idCardNumber.charAt(index), 0)
    const checkCode = checkCodes[sum % 11]

    // 验证校验码
    return checkCode === idCardNumber.charAt(17).toUpperCase()
}

/**
 * @description 根据身份证号获取性别
 * @param { string } idCardNumber 身份证号码
 * @param { boolean } enableFirst 是否开启第一代身份证校验
 * @returns { -1 | 0 | 1 } -1 未知 | 0女 | 1 男
 */
const getGenderFromId = (idCardNumber: string, enableFirst = false): -1 | 0 | 1 => {
    let genderDigit: number = -1
    if (enableFirst && idCardNumber.length === 15 && validateFirstIdCard(idCardNumber)) {
        // 第一代身份证
        genderDigit = parseInt(idCardNumber.charAt(14))
    } else if (idCardNumber.length === 18 && validateSecondIdCard(idCardNumber)) {
        // 第二代身份证
        genderDigit = parseInt(idCardNumber.charAt(16))
    } else {
        return -1
    }
    if (isNaN(genderDigit)) return -1
    // 获取性别
    return (genderDigit % 2) as 0 | 1
}

/**
 * @description 根据身份证号获取生日（YYYYMMDD格式）
 * @param { string } idCardNumber 身份证号码
 * @param { boolean } enableFirst 是否开启第一代身份证校验
 * @returns { string } 生日
 */
const getBirthdayFromId = (idCardNumber: string, enableFirst = false): string => {
    let birthday: string = ''
    if (enableFirst && idCardNumber.length === 15 && validateFirstIdCard(idCardNumber)) {
        // 第一代身份证
        birthday = '19' + idCardNumber.substring(6, 12)   // YY → 19YY
    } else if (idCardNumber.length === 18 && validateSecondIdCard(idCardNumber)) {
        // 第二代身份证
        birthday = idCardNumber.substring(6, 14)
    }
    // 由于 validateFirstIdCard、validateSecondIdCard 做了 isValidDate 校验，所以这里不用再做 isValidDate 校验
    return birthday
}

export {
    FIRST_IDNO_PATTERN,
    SECOND_IDNO_PATTERN,
    validateIdentityCard,
    validateFirstIdCard,
    validateSecondIdCard,
    getGenderFromId,
    getBirthdayFromId,
}
export default validateIdentityCard
