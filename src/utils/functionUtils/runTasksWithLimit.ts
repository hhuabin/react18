/* eslint-disable @typescript-eslint/no-explicit-any */

export type TaskFn<T = any> = () => Promise<T>

export type TaskResult<T> =
  | { status: 'fulfilled'; value: T }         // fulfilled：成功返回
  | { status: 'rejected'; reason: any };      // rejected：失败返回

/**
 * @description 并发执行任务
 * 任务数控制在 limit 以内，参考 Promise.all() 使用
 * 泛型 T 定义的是参数 tasks 的类型，因为我们需要从 tasks 的类型推导出结果类型，故而需要定义 tasks 的泛型
 * @param { TaskFn<any>[] } tasks Promise 任务列表
 * @param { number } limit 并发任务数量
 * @param { number } maxRetries 非负整数；任务执行失败后重试次数，默认为 0
 * @returns 全部任务成功时按任务顺序返回所有结果，否则返回第一个失败的错误
 * 该情况 .then() 成功 / 失败状态和 .catch() 都可能会执行
 */
export const runTasksWithLimitFailFast = <T extends (() => Promise<any>)[]>(
    // 保持传入参数的“元组精度”并允许 as const 修饰的只读数组被正确推导，使用 tasks: T 的话，结果会被推导为宽泛数组
    tasks: readonly [...T],
    limit: number,
    maxRetries = 0,
): Promise<{[K in keyof T]: T[K] extends () => Promise<infer R> ? R : never}> => {
    return new Promise((resolve, reject) => {
        // const results = [] as {[K in keyof T]: T[K] extends () => Promise<infer R> ? R : never}
        const results = new Array(tasks.length) as {[K in keyof T]: T[K] extends () => Promise<infer R> ? R : never}
        let currentIndex = 0
        let running = 0
        let finished = 0
        let aborted = false // 控制调度中止

        const retryWrapper = async (task: typeof tasks[number], retries = maxRetries) => {
            let lastError: any
            for (let i = 0; i <= retries; i++) {
                try {
                    return await task()
                } catch (err) {
                    lastError = err
                    if (i >= retries) {
                        throw err
                    }
                }
            }
            throw lastError
        }

        const run = () => {
            if (finished === tasks.length) {
                resolve(results)
                return
            }

            while (running < limit && currentIndex < tasks.length) {
                const i = currentIndex++
                running++

                retryWrapper(tasks[i])
                .then(result => {
                    // 按顺序收集正确结果
                    results[i] = result
                })
                .catch(error => {
                    // 遇到错误则停止执行
                    aborted = true
                    // 收集错误结果
                    // reject(`第${i+1}个任务执行出错，已停止执行，错误信息为：${error}，请检查代码`)
                    reject(error)
                })
                .finally(() => {
                    running--
                    finished++
                    if (!aborted) {
                        run()
                    }
                })
            }
        }

        run()
    })
}

/**
 * @description 并发执行任务
 * 任务数控制在 limit 以内，参考 Promise.allSettled() 使用，每个任务都可以返回失败或者成功
 * 泛型 T 定义的是参数 tasks 的类型，因为我们需要从 tasks 的类型推导出结果类型，故而需要定义 tasks 的泛型
 * @param { TaskFn<any>[] } tasks Promise 任务列表
 * @param { number } limit 并发任务数量
 * @param { number } maxRetries 非负整数；任务执行失败后重试次数，默认为 0
 * @returns 无论成功失败，全部执行完成后按任务顺序返回状态和结果
 * 该情况只有 .then() 成功状态会执行，故而给予了 status 去判断成功 / 失败状态
 */
export const runTasksWithLimitSettled = <T extends (() => Promise<any>)[]>(
    // 保持传入参数的“元组精度”并允许 as const 修饰的只读数组被正确推导，使用 tasks: T 的话，结果会被推导为宽泛数组
    tasks: readonly [...T],
    limit: number,
    maxRetries = 0,
): Promise<{[K in keyof T]: T[K] extends () => Promise<infer R> ? TaskResult<R> : never}> => {
    return new Promise((resolve, reject) => {
        // const results = [] as {[K in keyof T]: T[K] extends () => Promise<infer R> ? TaskResult<R> : never}
        const results = new Array(tasks.length) as {[K in keyof T]: T[K] extends () => Promise<infer R> ? TaskResult<R> : never}
        let currentIndex = 0
        let running = 0
        let finished = 0

        const retryWrapper = async (task: typeof tasks[number], retries = maxRetries) => {
            let lastError: any
            for (let i = 0; i <= retries; i++) {
                try {
                    return await task()
                } catch (err) {
                    lastError = err
                    if (i >= retries) {
                        throw err
                    }
                }
            }
            throw lastError
        }

        const run = () => {
            if (finished === tasks.length) {
                resolve(results)
                return
            }

            while (running < limit && currentIndex < tasks.length) {
                const i = currentIndex++
                running++

                retryWrapper(tasks[i])
                .then(result => {
                    // 按顺序收集正确结果
                    results[i] = {
                        status: 'fulfilled',
                        value: result as keyof T,
                    }
                })
                .catch(error => {
                    // 按顺序收集错误结果
                    results[i] = {
                        status: 'rejected',
                        reason: error,
                    }
                })
                .finally(() => {
                    running--
                    finished++
                    run()
                })
            }
        }

        run()
    })
}

/* const sleep = (id: number, ms: number) => {
    return new Promise<number>((resolve, reject) => {
        setTimeout(() => {
            console.log(`Task ${id} done`)
            resolve(id)
        }, ms)
    })
}

const tasks = [
    () => sleep(1, 1000), () => sleep(2, 500), () => sleep(3, 300),
    () => sleep(4, 700), () => sleep(5, 400),
]

// 不定义泛型也可自行推导 results 类型
runTasksWithLimitFailFast([
    () => new Promise<string>(resolve => resolve('task 0 success')),
    () => new Promise<number>(resolve => resolve(1001)),
], 2)
.then(results => {
    results.forEach(result => {
        console.log(result)
    })
})
.catch(err => console.log(err))

// 也可自定义结果类型
runTasksWithLimitSettled<Array<() => Promise<number>>>(tasks, 2)
.then(results => {
    if (results[0].status === 'fulfilled') {
        results[0].value
    } else if (results[0].status === 'rejected') {
        results[0].reason
    }
}) */
