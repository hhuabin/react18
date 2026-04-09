/**
 * @Author: bin
 * @Date: 2026-03-19 10:05:16
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 10:09:49
 */
export const STATUS_ADD = 'add' as const                 // 新增元素，应以 visible = true 进入动画
export const STATUS_KEEP = 'keep' as const               // 列表中存在的元素，继续保留显示
export const STATUS_REMOVE = 'remove' as const           // diff 中将删除的节点状态设置为 STATUS_REMOVE，执行离场动画
export const STATUS_REMOVED = 'removed' as const         // 删除动画已经结束，元素可以从列表中彻底清理

export type DiffStatus =
    | typeof STATUS_ADD              // 新增元素，应以 visible = true 进入动画
    | typeof STATUS_KEEP             // 两轮都存在的元素，继续保留显示
    | typeof STATUS_REMOVE           // 上一轮存在、这一轮不存在的元素，需要执行离场动画
    | typeof STATUS_REMOVED;         // 离场动画已经结束，元素可以从列表中彻底清理

type RawKeyType = string | number;

// 这个结构是 diff 过程里的最小数据单元
export interface KeyObject {
    key: RawKeyType;
    status?: DiffStatus;
}

/**
 * @description 把输入统一包装成对象，并把 `key` 规范成字符串
 */
export const wrapKeyToObject = (key: React.Key | KeyObject) => {
    let keyObj: KeyObject
    if (key && typeof key === 'object' && 'key' in key) {
        keyObj = key
    } else {
        keyObj = { key: key as RawKeyType }
    }
    return {
        ...keyObj,
        key: String(keyObj.key),     // 把 key 统一转成字符串类型 { key: '1' }
    }
}

/**
 * @description 批量调用 wrapKeyToObject，把传入数组统一转换成 KeyObject[]
 */
export const parseKeys = (keys: (React.Key | KeyObject)[] = []) => {
    return keys.map(wrapKeyToObject)
}

/**
 * @description 对比两个数组，返回一个 diff 结果
 * @param prevKeys 旧列表
 * @param currentKeys 新列表
 */
export const diffKeys = (prevKeys: KeyObject[] = [], currentKeys: KeyObject[] = []): KeyObject[] => {
    let list: KeyObject[] = []
    // 新列表 currentKeyObjects 的指针
    let currentIndex = 0
    const currentLen = currentKeys.length

    const prevKeyObjects = parseKeys(prevKeys)
    const currentKeyObjects = parseKeys(currentKeys)

    // 时间复杂度 O(n)
    prevKeyObjects.forEach(keyObj => {
        // 定义命中标志
        let hit = false

        for (let i = currentIndex; i < currentLen; i += 1) {
            const currentKeyObj = currentKeyObjects[i]

            if (currentKeyObj.key === keyObj.key) {
                // ['1','2','3'] -> ['1','0','2','3']。0 需要被添加进去，状态是 add 新增
                if (currentIndex < i) {
                    list = list.concat(
                        currentKeyObjects
                            .slice(currentIndex, i)
                            .map(obj => ({ ...obj, status: STATUS_ADD })),
                    )
                    // 同步 currentIndex
                    currentIndex = i
                }

                // 命中了，状态保持 keep
                list.push({
                    ...currentKeyObj,
                    status: STATUS_KEEP,
                })
                currentIndex += 1
                hit = true
                break
            }
        }
        // 没有命中，说明 key 被删除了，设置状态为 remove，执行退场动画
        if (!hit) {
            list.push({
                ...keyObj,
                status: STATUS_REMOVE,
            })
        }
    })

    // 如：['1','2','3'] -> ['1','2','3','4','5','6']。把 '4','5','6' 加进去
    if (currentIndex < currentLen) {
        list = list.concat(
            currentKeyObjects
                .slice(currentIndex)
                .map(obj => ({ ...obj, status: STATUS_ADD })),
        )
    }

    /**
     * @description 接下来处理重复的 key 并将其状态设置为 keep
     * 现实中 duplicatedKeys 很少，正常业务几乎不会出现
     * ['1', '2'] -> ['2', '1'] 经过上面的代码处理之后将会变成
     * [
     *     { key: '2', status: 'add' },
     *     { key: '1', status: 'keep' },
     *     { key: '2', status: 'remove' },
     * ]
     * 再经过下面的代码处理之后就变成最终的结果
     * [
     *     { key: '2', status: 'keep' },
    *      { key: '1', status: 'keep' },
     * ]
     */
    const keys: Record<RawKeyType, number> = {}
    // 如果没有重复的 key，结果会是 { 'key1': 1, 'key2': 1 }，如果有重读的 key，value 会被多次加 1 -> { 'key1': 1, 'key2': 2 }
    list.forEach(({ key }) => {
        keys[key] = (keys[key] || 0) + 1
    })
    // 找出重复的 key
    const duplicatedKeys = Object.keys(keys).filter(key => keys[key] > 1)

    // 时间复杂度 O(k * n)。如果 duplicatedKeys = [] 可以跳过执行
    duplicatedKeys.forEach(matchKey => {
        list = list.reduce((prev, curr) => {
            if (curr.key === matchKey && curr.status !== STATUS_REMOVE) {
                // 1. status !== STATUS_REMOVE 时，将其状态设置成 keep
                curr.status = STATUS_KEEP
                prev.push(curr)
            } else if (curr.key !== matchKey) {
                // 2. 没有重复 key 时，直接添加进结果中
                prev.push(curr)
            }
            // 3. curr.status === matchKey && curr.status === STATUS_REMOVE 直接删除即可
            return prev
        }, [] as KeyObject[])
    })

    return list
}
