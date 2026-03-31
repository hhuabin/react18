/**
 * @Author: bin
 * @Date: 2026-03-31 15:46:48
 * @LastEditors: bin
 * @LastEditTime: 2026-03-31 16:16:10
 */
import type { MessageConfig } from '../Message.d'

type NoticeConfig = MessageConfig & {
    isClose?: boolean;
}

/**
 * @deprecated
 * @description 对比合并提示消息列表
 * @param { NoticeConfig[] } prevNoticeList 旧消息列表
 * @param { MessageConfig[] } newMessageConfigList 新消息列表
 * @returns { MessageConfig[] } 新的消息列表
 * bug: 优化对比函数，该函数太慢了
 */
export const diffKeys = (
    prevNoticeList: NoticeConfig[],
    newMessageConfigList: MessageConfig[],
): NoticeConfig[] => {
    const resultList: NoticeConfig[] = []      // 存放返回结果
    const usedKeys = new Set()                 // 存储已经被添加到 resultList 的 key

    const newConfigMap = new Map(newMessageConfigList.map(item => [item.key, item]))
    const prevNoticeMap = new Map(prevNoticeList.map(item => [item.key, item]))
    const newConfigKeys = newMessageConfigList.map(item => item.key)
    const prevNoticeKeys = prevNoticeList.map(item => item.key)
    const newConfigListLengtgh = newConfigKeys.length
    const prevNoticeListLength = prevNoticeKeys.length

    /**
     * @description 添加 prevNoticeList 到 resultList 中
     * 新的数组中必须保留全部 prevNoticeKeys
     * 遍历 prevNoticeKeys ，将 resultList 中不存在的元素加上 isClose: true
     */
    const newConfigKeySet = new Set(newConfigKeys)
    for (let i = 0; i < prevNoticeListLength; i++) {
        if (newConfigKeySet.has(prevNoticeKeys[i])) {
            // 新的数组中存在，取新数组的值
            resultList.push(newConfigMap.get(prevNoticeKeys[i])!)
        } else {
            // 新数组中不存在，关闭
            resultList.push({ ...prevNoticeMap.get(prevNoticeKeys[i])!, isClose: true })
        }
        usedKeys.add(prevNoticeKeys[i])
    }

    /**
     * @description 遍历 configList，将新出现的 config 添加进 resultList 对应位置
     */
    let configListHead = 0        // newMessageConfigList 的头指针
    let insertStartIndex = 0      // 记录在 resultList 中查找 config 的开始索引，加速 resultList 的查找速度
    for (let configIndex = 0; configIndex <= newConfigListLengtgh; configIndex++) {
        /**
         * @description 将处于中间的新的 config 添加到 resultList 的对应位置
         * 具体规则：将新出现的 config 添加到 下一个 存在的 config 对应的索引位置前
         */
        if (usedKeys.has(newConfigKeys[configIndex])) {
            // 若头指针与检查元素下表不相等，则存在新元素需要添加
            if (configListHead < configIndex) {
                // 获取新元素
                const newConfig = newMessageConfigList.slice(configListHead, configIndex)
                // 从开始查找下标开始查找，将 newConfig 插入到 resultList 中
                for (let j = insertStartIndex; j <= resultList.length; j++) {
                    // eslint-disable-next-line max-depth
                    if (resultList[j]!.key === newConfigKeys[configIndex]) {
                        resultList.splice(j, 0, ...newConfig)
                        insertStartIndex = j + 1
                        break
                    }
                    // eslint-disable-next-line max-depth
                    if (j === resultList.length) {
                        resultList.push(...newConfig)
                        insertStartIndex = j
                    }
                }
                configListHead = configIndex + 1
            } else {
                // 没有新元素需要添加，移动 newMessageConfigList 头指针
                configListHead++
            }
        }
        // 将处于 newMessageConfigList 末尾的新元素全部添加到 resultList 中
        if (configIndex === newConfigListLengtgh && configListHead < configIndex) {
            resultList.push(...newMessageConfigList.slice(configListHead))
        }
    }

    return resultList
}
