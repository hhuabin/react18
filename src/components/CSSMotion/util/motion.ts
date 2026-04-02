/**
 * @Author: bin
 * @Date: 2026-03-26 10:15:40
 * @LastEditors: bin
 * @LastEditTime: 2026-04-02 10:10:57
 */
// 默认所有浏览器的 animationEndName = 'animationend'
export const animationEndName = 'animationend'
// 默认所有浏览器的 transitionEndName = 'transitionend'
export const transitionEndName = 'transitionend'

// 检测浏览器是否支持 transition，这里不做老版本浏览器的兼容，默认全都支持，IE见鬼去吧
export const supportTransition = !!(
    animationEndName && transitionEndName
)

/**
 * calssName = transitionName + transitionType
 * 会生成类似
 * - fade-appear
 * - fade-appear-start
 * - fade-appear-active
 * - fade-enter
 * - fade-enter-start
 * - fade-enter-active
 * - fade-leave
 * - fade-leave-start
 * - fade-leave-active
 */
export const getTransitionName = (transitionName: string | undefined, transitionType: string): string | null => {
    if (!transitionName) return null

    return `${transitionName}-${transitionType}`
}
