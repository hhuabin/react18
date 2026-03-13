import React, { useState, useLayoutEffect, useEffect } from 'react'
import {
    STEP_NONE, STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED, STEP_PREPARED,
    type MotionStatus, type MotionStep,
} from '../interface'
import useNextFrame from './useNextFrame'

const FULL_STEP_QUEUE: MotionStep[] = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED]
const SIMPLE_STEP_QUEUE: MotionStep[] = [STEP_PREPARE, STEP_PREPARED]

/** 跳过当前步骤，直接推进到下一步 */
export const SkipStep = false as const
/** 正常推进到下一步 */
export const DoStep = true as const

export function isActive(step: MotionStep): boolean {
    return step === STEP_ACTIVE || step === STEP_ACTIVATED
}

/**
 * 步骤队列状态机。
 *
 * 完整流程（有动画）：prepare → start → active → end
 * 精简流程（无动画）：prepare → prepared
 *
 * @param status       当前动画状态（appear/enter/leave），status 变化会重置步骤
 * @param prepareOnly  true 时走精简流程（跳过 start/active）
 * @param callback     每个步骤触发时调用：
 *                     - 返回 SkipStep → 立刻跳到下一步
 *                     - 返回 DoStep   → 等待下一帧再推进
 *                     - 返回 Promise  → 等 Promise resolve 后推进（仅 prepare 步骤）
 */
export default function useStepQueue(
    status: MotionStatus,
    prepareOnly: boolean,
    callback: (step: MotionStep) => typeof SkipStep | typeof DoStep | React.CSSProperties | void | Promise<void>,
): [startStep: () => void, step: MotionStep] {
    const [step, setStep] = useState<MotionStep>(STEP_NONE)
    const [nextFrame, cancelNextFrame] = useNextFrame()
    const STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE

    function startStep() {
        setStep(STEP_PREPARE)
    }

    useLayoutEffect(() => {
        if (step === STEP_NONE || step === STEP_ACTIVATED) return

        const index = STEP_QUEUE.indexOf(step)
        const nextStep = STEP_QUEUE[index + 1]
        const result = callback(step)

        if (result === SkipStep) {
            // 直接跳到下一步（同步）
            setStep(nextStep)
        } else if (nextStep) {
            // 等待下一帧再推进，确保浏览器已应用样式
            nextFrame(({ isCanceled }) => {
                function doNext() {
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

    useEffect(() => cancelNextFrame, [cancelNextFrame])

    return [startStep, step]
}
