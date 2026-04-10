/**
 * @Author: bin
 * @Date: 2026-04-10 09:00:21
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 11:11:24
 */
/**
 * @description 单次任务执行器（在一个时间片（如1000ms）内执行任务）
 * @param shouldContinue 用于判断当前“时间片”是否还能继续执行
 */
export type TaskRunner = (shouldContinue: () => boolean) => void

/**
 * @description 调度器
 * 负责安排 TaskRunner 的执行时机和执行时长
 */
export type TaskScheduler = (runTask: TaskRunner) => void

/**
 * @description 核心函数：分片执行任务队列（避免阻塞主线程）
 * 适用于：
 *  1. 使用空闲时间，执行 低优先级 的异步任务。比如渲染长列表
 *  2. 其实大多数场景都用不到，写来玩玩而已
 * @param taskQueue 待执行的任务列表
 * @param scheduler 调度策略（决定执行时机 & 时间片）
 * @example scheduleChunkedTasks(tasks, idleScheduler)
 */
const scheduleChunkedTasks = (taskQueue: VoidFunction[], scheduler: TaskScheduler) => {
    // 没有任务直接返回
    if (taskQueue.length === 0) return

    // 当前执行到第几个任务
    let currentIndex = 0

    // 该函数将传给 开者的 scheduler 作为参数
    const taskRunner: TaskRunner = (shouldContinue: () => boolean) => {
        /**
         * @description 每次 shouldContinue 执行一个任务
         * shouldContinue() 用来判断是否继续执行任务
         */
        while (currentIndex < taskQueue.length && shouldContinue()) {
            taskQueue[currentIndex++]()
        }
        // shouldContinue = false，继续调度下一轮
        if (currentIndex < taskQueue.length) run()
    }

    const run = () => {
        // 调用开发者传入的 scheduler
        scheduler(taskRunner)
    }

    run()
}

/**
 * @description 利用浏览器空闲时间实现 scheduler 调度器
 */
const scheduleTasksInIdle = (taskQueue: VoidFunction[]) => {
    /**
     * @description 基于 requestIdleCallback 实现的调度器
     *  利用浏览器空闲时间执行任务，避免阻塞主线程
     * @param runTask scheduleChunkedTasks 函数里的 taskRunner
     */
    const idleScheduler: TaskScheduler = (runTask: TaskRunner) => {

        window.requestIdleCallback((idleDeadline: IdleDeadline) => {
            /**
             * timeRemaining() 表示当前帧剩余的空闲时间（毫秒）
             * > 0 表示还能继续执行任务
             * shouldContinue: () => idleDeadline.timeRemaining() > 0
             */
            runTask(() => idleDeadline.timeRemaining() > 0)
        })
    }

    scheduleChunkedTasks(taskQueue, idleScheduler)
}

/**
 * @description 利用 setTimeout 实现 scheduler 调度器
 *  默认每 1000ms 执行 10 个任务
 */
const scheduleTasksInTimeout = (taskQueue: VoidFunction[], interval = 1000, taskCount = 10) => {

    const scheduler = (runTask: TaskRunner) => {
        let count = 0

        setTimeout(() => {
            runTask(() => count++ < taskCount)
        }, interval)
    }

    scheduleChunkedTasks(taskQueue, scheduler)
}

export {
    scheduleChunkedTasks as default,
    scheduleTasksInIdle,
    scheduleTasksInTimeout,
}


/**
 * @example 测试用例
 */
/* const scheduleTasks = () => {

    const taskQueue: VoidFunction[] = Array.from({ length: 10000 }, (_, i) => () => {
        console.log(i)
    })

    scheduleTasksInTimeout(taskQueue)
}
// 也可以使用渲染帧，只要写好调度器就行，任君使用
const rafScheduler: TaskScheduler = (runTask) => {
    requestAnimationFrame(() => {
        const start = performance.now()

        runTask(() => performance.now() - start < 16)
    })
} */
