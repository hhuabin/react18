/**
 * @Author: bin
 * @Date: 2026-02-14 10:56:54
 * @LastEditors: bin
 * @LastEditTime: 2026-02-14 10:57:03
 */
export const canUseDom = () => !!(
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.document &&
    window.document.createElement
)

export const canUseDocElement = () => canUseDom() && window.document.documentElement
