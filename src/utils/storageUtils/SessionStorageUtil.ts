/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * SessionStorageUtil 兼容 sessionStorage 的所有 API
 * 但是会进行序列化与反序列化，方便存储复杂对象
 * 同时为了方便使用，使用 try...catch 来捕获可能的错误
 * PS：SessionStorageUtil 与 LocalStorageUtil 完全一样，将 sessionStorage 改为 sessionStorage 即可
 * tips：存储容量约 5MB
 */
export default class SessionStorageUtil {

    // 公共前缀。可以为项目存储的 key 添加公共前缀，避免与系统冲突
    public static STORAGE_PREFIX = ''

    /**
     * @description 对 value 进行序列化，并保存到 sessionStorage
     * @param { string } key sessionStorage 的键
     * @param { any } value 需要存储的值，此处不需要调用stringify序列化对象
     * @param { boolean } prefixFlag 是否添加公共前缀，默认为 true
     */
    public static setItem = (key: string, value: any, prefixFlag = true) => {
        const _key = prefixFlag ? SessionStorageUtil.STORAGE_PREFIX + key : key

        try {
            const serializedValue = JSON.stringify(value)
            sessionStorage.setItem(_key, serializedValue)
        } catch (error) {
            console.error(`Error setting sessionStorage key '${_key}':`, error)
        }
    }

    /**
     * @description 获取 sessionStorage 中存储的值，并反序列化
     * @param { string } key sessionStorage 的键
     * @param { any } defaultValue 默认返回值，默认为null
     * @param { boolean } prefixFlag 是否添加公共前缀，默认为 true
     * @returns { T | null } 本地缓存的值或 defaultValue 默认返回值
     *
     * @example SessionStorageUtil.getItem<User>('', '')
     */
    public static getItem: {
        <T = any>(key: string, defaultValue?: null, prefixFlag?: boolean): T | null;
        <T = any>(key: string, defaultValue: T, prefixFlag?: boolean): T;
    } = <T = any>(
        key: string,
        defaultValue?: T | null,
        prefixFlag = true,
    ): T | null => {
        const _key = prefixFlag ? SessionStorageUtil.STORAGE_PREFIX + key : key
        const _defaultValue = defaultValue ?? null

        try {
            const serializedValue = sessionStorage.getItem(_key)
            if (serializedValue === null) {
                return _defaultValue
            }
            const parsed = JSON.parse(serializedValue)
            if (defaultValue !== null && typeof defaultValue !== 'undefined' && typeof parsed !== typeof defaultValue) {
                console.warn(`Type mismatch for key ${_key}`)
                return _defaultValue
            }
            return parsed as T
        } catch (error) {
            console.error(`Error getting sessionStorage key '${_key}':`, error)
            return _defaultValue
        }
    }

    /**
     * @description 获取 sessionStorage 中存储的对象属性值
     * @param { string } key sessionStorage 的键
     * @param { string } property 对象的属性名
     * @param { T } defaultValue 如果属性不存在时的默认返回值
     * @param { boolean } prefixFlag 是否添加公共前缀，默认为 true
     * @returns { T } 属性值或 defaultValue 默认返回值
     */
    public static getProperty = <T = any>(
        key: string,
        property: string,
        defaultValue: T,
        prefixFlag = true,
    ): T => {
        const value = SessionStorageUtil.getItem(key, null, prefixFlag)

        return value && value[property] !== undefined ? value[property] : defaultValue
    }

    /**
     * @description 删除 sessionStorage 中存储的值
     * @param { string } key sessionStorage 的键
     * @param { boolean } prefixFlag 是否添加公共前缀，默认为 true
     */
    public static removeItem = (key: string, prefixFlag = true) => {
        const _key = prefixFlag ? SessionStorageUtil.STORAGE_PREFIX + key : key

        try {
            sessionStorage.removeItem(_key)
        } catch (error) {
            console.error(`Error removing sessionStorage key '${_key}':`, error)
        }
    }

    public static clear = () => {
        try {
            sessionStorage.clear()
        } catch (error) {
            console.error('Error clearing sessionStorage:', error)
        }
    }
}

