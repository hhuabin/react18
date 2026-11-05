/**
 * @Author: bin
 * @Date: 2026-08-20 10:07:10
 * @LastEditors: bin
 * @LastEditTime: 2026-11-05 14:49:45
 */
/**
 * 1.历史路由带参数：https://example.com?a=1
 * 2.历史路由带参数带哈希：https://example.com?a=1#a
 * 3.哈希路由带参数：https://example.com/#/?a=1
 * 4.哈希路由带参数带哈希：https://example.com/#/?a=1#a
 */
/**
 * @description 获取查询参数名称并进行解码。
 *
 * 参数可以写成 `name` 或 `name=value` 的形式。对名称进行解码后，既可以删除普通名称，
 * 也可以删除经过 URL 编码的名称。百分号编码格式错误时保留原始名称，避免 URL 清理操作直接失败
 *
 * @example getParamName('hello%20world=value') === 'hello world'
 */
const getParamName = (param: string): string => {
    const rawName = param.split('=', 1)[0]
    // + 替换成空格
    const normalizedName = rawName.replace(/\+/g, ' ')

    // 解码
    try {
        return decodeURIComponent(normalizedName)
    } catch {
        return normalizedName
    }
}

/**
 * @description 从 URL 的 # 隔开部分删除匹配的参数
 *
 * @example removeParamsFromPart('/list?code=111&page=1', ['code']) === '/list?page=1'
 */
const removeParamsFromPart = (part: string, names: readonly string[]): string => {
    const queryIndex = part.indexOf('?')

    if (queryIndex === -1) {
        /**
         * 1. url 没有参数直接返回
         * 2. 历史路由的哈希值没有?，直接返回
         * 3. 哈希路由的哈希值携带?，会向下走逻辑，删除names
         */
        return part
    }

    const prefix = part.slice(0, queryIndex)      // /? -> /
    const params = part.slice(queryIndex + 1).split('&')
    const retainedParams = params.filter(param => !names.includes(getParamName(param)))

    // 没有删除参数时直接返回原字符串，保留末尾 `&` 等特殊但有效的格式。
    if (retainedParams.length === params.length) return part

    return retainedParams.some(Boolean)
        ? `${prefix}?${retainedParams.join('&')}`
        : prefix
}

/**
 * @description 从 URL 查询字符串和 hash 查询字符串中删除一个或多个指定参数。
 * @param url 待处理的 URL。
 * @param paramNames 要删除的参数名称或名称数组。
 * @returns 删除指定参数后的 URL。
 *
 * @example
 * removeUrlParams('https://example.com?a=1', 'a') === 'https://example.com'
 * removeUrlParams('https://example.com/#/?a=1', 'a') === 'https://example.com/#/'
 * removeUrlParams('https://example.com?a=1&keep=2#a=1', 'a') === 'https://example.com?keep=2#a=1'
 * removeUrlParams('https://example.com/#/?a=1&keep=2#a=1', 'a') === 'https://example.com/#/?keep=2#a=1'
 * removeUrlParams('https://example.com/#/?a=1#a=1', 'a') === 'https://example.com/#/#a=1'
 */
export const removeUrlParams = (
    url: string,
    paramNames?: string | string[],
): string => {
    // 保留运行时检查，兼容绕过 TypeScript 类型检查的 JavaScript 调用方。
    if (typeof url !== 'string') return url

    const names = (typeof paramNames === 'string' ? [paramNames] : paramNames ?? [])
        .map(name => typeof name === 'string' ? getParamName(name.trim()) : '')

    if (!names.length) return url

    /**
     * 根据所有 # 分隔 URL，各部分独立删除查询参数后再组合。
     * 不含 ? 的普通哈希值会被完整保留。
     */
    return url
        .split('#')
        .map(part => removeParamsFromPart(part, names))
        .join('#')
}

/*********************   举例   *********************
    const removeTokenFromUrl = () => {
        const currentUrl = window.location.href
        const url = removeUrlParams(currentUrl, ['token'])

        if (url === currentUrl) return

        window.history.replaceState(window.history.state, '', url)

        // 保险一点，这里路由还需要做一次 replace
    }
 ****************************************************/
