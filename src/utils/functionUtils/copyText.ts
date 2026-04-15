/**
 * @Author: bin
 * @Date: 2026-04-15 10:28:05
 * @LastEditors: bin
 * @LastEditTime: 2026-04-15 17:34:44
 */
/**
 * @description 复制文本
 * @param text 要复制的文本
 * @returns { Promise<boolean> } 是否复制成功
 */
export const copyText = async (text: string): Promise<boolean> => {
    // 空值直接失败（避免无意义调用）
    if (typeof text !== 'string' || text.length === 0) return false

    // 支持 navigator.clipboard 并且处于安全上下文中
    if (!navigator.clipboard || !window.isSecureContext) {
        return false
    }

    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

/**
 * @description 安全复制文本，支持老版本的的浏览器
 * @param text 要复制的文本
 * @returns { Promise<boolean> } 是否复制成功
 */
export const secureCopyText = async (text: string): Promise<boolean> => {
    // 空值直接失败（避免无意义调用）
    if (typeof text !== 'string' || text.length === 0) return false

    // 优先走现代 API
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch {
            // 不 return，继续走 fallback
        }
    }

    // ===== fallback：execCommand =====
    let textarea: HTMLTextAreaElement | null = null

    try {
        textarea = document.createElement('textarea')
        textarea.value = text

        // 避免页面抖动 & 可选中
        textarea.style.position = 'fixed'
        textarea.style.top = '0'
        textarea.style.left = '0'
        textarea.style.opacity = '0'
        textarea.style.pointerEvents = 'none'

        document.body.appendChild(textarea)

        // iOS 兼容（很关键）
        textarea.setAttribute('readonly', 'true')

        // 选中内容
        textarea.select()
        textarea.setSelectionRange(0, text.length)

        const ok = document.execCommand('copy')
        return ok
    } catch {
        return false
    } finally {
        // 保证一定清理
        if (textarea && textarea.parentNode) {
            textarea.parentNode.removeChild(textarea)
        }
    }
}
