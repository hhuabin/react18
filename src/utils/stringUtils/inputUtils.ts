/**
 * @Author: bin
 * @Date: 2025-12-01 16:09:10
 * @LastEditors: bin
 * @LastEditTime: 2026-11-05 14:51:28
 */

// 需要被转义的字符组成的对象 &<>"'`=/
const safeEscapeChar: Record<string, string> = {
    // 支持 HTML 文本节点
    '&': '&amp;',            // 防止 &lt; 等还原成 <，注意 `&amp;` 可能会被转义成 `&amp;amp;`，所以不能重复调用
    '<': '&lt;',             // 阻止标签注入
    '>': '&gt;',             // 结束标签
    '"': '&quot;',           // 阻止属性注入
    '\'': '&#039;',          // 阻止属性注入

    // 支持 HTML 属性、URL、JS 字符串、CSS 字符串
    '`': '&#x60;',           // 防止模板字符串注入
    '=': '&#x3D;',           // 防止属性注入和结束标签
    '/': '&#x2F;',           // 防止属性注入和结束标签
}

/**
 * @description 安全 HTML 字符串过滤，转义 & 但过滤特殊 &** 字符    use this
 * @param { string } str 待过滤的字符串
 * @returns { string } 过滤后的字符串
 *
 * @example const str = safeEscapeHTML(str.trim())
 */
export const safeEscapeHTML = (str: string): string => {
    let exceptAmpRegex = ''

    // 剔除 safeEscapeChar 中包含 & 的转义
    const escapeCharValues = Object.values(safeEscapeChar)
    for (const value of escapeCharValues) {
        if (value.startsWith('&')) {
            exceptAmpRegex += `|${value.slice(1)}`
        }
    }
    exceptAmpRegex = exceptAmpRegex.slice(1)

    // /&(?!amp;|lt;|gt;|quot;|#039;|#x60;|#x3D;|#x2F;)|[<>"'`=/]/g
    const regex = new RegExp(`&(?!${exceptAmpRegex})|[<>"'\`=/]`, 'g')
    return str.replace(regex, char => (safeEscapeChar[char] || char))
}


// 需要被转义的字符组成的对象 <>"'`=/，不包含 & 防止重复转义
const escapeChar: Record<string, string> = {
    // 支持 HTML 文本节点
    // '&': '&amp;',            // 防止 &lt; 等还原成 <，注意 `&amp;` 可能会被转义成 `&amp;amp;`，所以不能重复调用
    '<': '&lt;',             // 阻止标签注入
    '>': '&gt;',             // 结束标签
    '"': '&quot;',           // 阻止属性注入
    '\'': '&#039;',          // 阻止属性注入

    // 支持 HTML 属性、URL、JS 字符串、CSS 字符串
    '`': '&#x60;',           // 防止模板字符串注入
    '=': '&#x3D;',           // 防止属性注入和结束标签
    '/': '&#x2F;',           // 防止属性注入和结束标签
}
/**
 * @description HTML 字符串过滤，不转义 &
 * @param { string } str 待过滤的字符串
 * @returns { string } 过滤后的字符串
 *
 * @example @example const str = escapeHTML(str.trim())
 */
export const escapeHTML = (str: string): string => str.replace(/[<>"'`=/]/g, char => (escapeChar[char] || char))
