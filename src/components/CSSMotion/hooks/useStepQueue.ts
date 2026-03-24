/**
 * @Author: bin
 * @Date: 2026-03-16 14:49:24
 * @LastEditors: bin
 * @LastEditTime: 2026-03-24 11:23:17
 */
import { useState, useEffect } from 'react'

import {
    STEP_NONE, STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED, STEP_PREPARED,
    type MotionStatus, type StepStatus,
} from '../interface'

import useNextFrame from './useNextFrame'
// 使用安全的 useLayoutEffect
import { useInternalLayoutEffect } from '@/hooks/reactHooks/useLayoutUpdateEffect'

// 完整流程（有动画）
const FULL_STEP_QUEUE: StepStatus[] = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED]
// 精简流程（无动画）
const SIMPLE_STEP_QUEUE: StepStatus[] = [STEP_PREPARE, STEP_PREPARED]

/** 跳过当前步骤，直接推进到下一步 */
export const SkipStep = false as const
/** 正常推进到下一步 */
export const DoStep = true as const

export const isActive = (step: StepStatus): boolean => {
    return step === STEP_ACTIVE || step === STEP_ACTIVATED
}

/**
 * 步骤队列状态机。
 * 每次调用 startStep()（或 status 变化触发重新开始），都会启动一个新的动画流程
 * step 会按照 STEP_QUEUE 逐步推进，直到到达终止状态（STEP_ACTIVATED 或 STEP_PREPARED）
 *
 * 完整流程（有动画）：prepare → start → active → end
 * 精简流程（无动画）：prepare → prepared
 *
 * @param status       当前动画状态（appear/enter/leave），status 变化会重置步骤
 * @param prepareOnly  true 时走精简流程（跳过 start/active），比如对于 不支持动画的浏览器 可以走精简流程
 * @param callback     每个步骤触发时调用：
 *                     - 返回 SkipStep → 立刻跳到下一步
 *                     - 返回 DoStep(true)   → 等待下一帧再推进
 *                     - 返回 Promise  → 等 Promise resolve 后推进（仅 prepare 步骤）
 */
export default function useStepQueue(
    status: MotionStatus,
    prepareOnly: boolean,
    callback: (step: StepStatus) => Promise<void> | void | typeof SkipStep | typeof DoStep,
): [startStep: () => void, step: StepStatus] {

    const [step, setStep] = useState<StepStatus>(STEP_NONE)
    const [nextFrame, cancelNextFrame] = useNextFrame()
    const STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE

    const startStep = () => {
        setStep(STEP_PREPARE)
    }

    useInternalLayoutEffect(() => {
        if (step === STEP_NONE || step === STEP_ACTIVATED) return

        const index = STEP_QUEUE.indexOf(step)
        const nextStep = STEP_QUEUE[index + 1]
        // 获取结果
        const result = callback(step)

        // result === false
        if (result === SkipStep) {
            // 直接跳到下一步（同步）
            setStep(nextStep)
        } else if (nextStep) {
            // result = Promise<void> | void | true
            // 等待下一帧再推进，确保浏览器已应用样式
            nextFrame(({ isCanceled }) => {
                const doNext = () => {
                    if (isCanceled()) return
                    setStep(nextStep)
                }
                if (result === DoStep) {
                    doNext()
                } else {
                    // Promise（异步 prepare 回调）
                    Promise.resolve(result).then(doNext)
                }
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, step])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => cancelNextFrame, [])

    return [startStep, step]
}
