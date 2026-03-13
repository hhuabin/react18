/**
 * @Author: bin
 * @Date: 2026-02-27 10:32:02
 * @LastEditors: bin
 * @LastEditTime: 2026-02-27 10:56:51
 */
// ============================================================
// CSS transition / animation 事件名称检测（兼容浏览器前缀）
// ============================================================

// eslint-disable-next-line func-style
function makePrefixMap(styleProp: string, eventName: string): Record<string, string> {
    const prefixes: Record<string, string> = {}
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase()
    prefixes[`Webkit${styleProp}`] = `webkit${eventName}`
    prefixes[`Moz${styleProp}`] = `moz${eventName}`
    prefixes[`ms${styleProp}`] = `MS${eventName}`
    prefixes[`O${styleProp}`] = `o${eventName.toLowerCase()}`
    return prefixes
}

// eslint-disable-next-line func-style
function getVendorPrefixes(domSupport: boolean, win: Window | Record<string, unknown>) {
    const prefixes = {
        animationend: makePrefixMap('Animation', 'AnimationEnd'),
        transitionend: makePrefixMap('Transition', 'TransitionEnd'),
    }
    if (domSupport) {
        if (!('AnimationEvent' in win)) {
            delete prefixes.animationend.animation
        }
        if (!('TransitionEvent' in win)) {
            delete prefixes.transitionend.transition
        }
    }
    return prefixes
}

const canUseDom = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
)

const vendorPrefixes = getVendorPrefixes(
    canUseDom,
    typeof window !== 'undefined' ? window : {},
)

const divStyle: CSSStyleDeclaration = canUseDom
    ? document.createElement('div').style
    : ({} as CSSStyleDeclaration)

const prefixedEventNames: Record<string, string> = {}

// eslint-disable-next-line func-style
function getVendorPrefixedEventName(eventName: 'animationend' | 'transitionend'): string {
    if (prefixedEventNames[eventName]) return prefixedEventNames[eventName]
    const prefixMap = vendorPrefixes[eventName]
    if (prefixMap) {
        for (const styleProp of Object.keys(prefixMap)) {
            if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in divStyle) {
                prefixedEventNames[eventName] = prefixMap[styleProp]
                return prefixedEventNames[eventName]
            }
        }
    }
    return ''
}

const internalAnimationEndName = getVendorPrefixedEventName('animationend')
const internalTransitionEndName = getVendorPrefixedEventName('transitionend')

/** 当前浏览器是否支持 CSS transition/animation */
export const supportTransition = !!(internalAnimationEndName && internalTransitionEndName)
export const animationEndName = internalAnimationEndName || 'animationend'
export const transitionEndName = internalTransitionEndName || 'transitionend'

/**
 * 根据 motionName 和阶段类型拼接完整 className。
 * - string: `fade` + `appear-active` → `fade-appear-active`
 * - object: 取对应驼峰 key 的值，如 `{ appearActive: 'custom-cls' }`
 */
export const getTransitionName = (
    transitionName: string | Partial<Record<string, string>> | undefined,
    transitionType: string,
): string | undefined => {
    if (!transitionName) return undefined
    if (typeof transitionName === 'object') {
        // 将 "appear-active" 转为 "appearActive" 再查 key
        const type = transitionType.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
        return transitionName[type]
    }
    return `${transitionName}-${transitionType}`
}
