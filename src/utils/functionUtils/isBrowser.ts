/**
 * @Author: bin
 * @Date: 2026-03-13 17:18:13
 * @LastEditors: bin
 * @LastEditTime: 2026-03-16 10:34:24
 */
// SSR、RSC 安全
export const isBrowser = typeof window !== 'undefined'

export const canUseDom = () => !!(
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.document &&
    window.document.createElement
)

export const canUseDocElement = () => canUseDom() && window.document.documentElement
