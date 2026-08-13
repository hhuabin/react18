/**
 * @Author: bin
 * @Date: 2024-12-10 16:04:08
 * @LastEditors: bin
 * @LastEditTime: 2026-08-13 09:26:56
 */
import { useEffect, useRef } from 'react'

interface ProjectVersionInfo {
    version: string;
    buildTime: string;
}

const FIRST_CHECK_DELAY = 3000      // 首次检查时间，加载 3s 后执行，不妨碍主线程渲染
const REFRESH_INTERVAL = 300000     // 5 分钟轮询检查更新一次

/**
 * @description 生成服务器的项目页面地址
 * @param projectLink 项目部署的子路径
 * @returns { string } 服务器的项目页面地址
 */
const getProjectPageUrl = (projectLink: string) => {
    const pageUrl = /^https?:\/\//i.test(projectLink)
        ? new URL(projectLink)
        : new URL(projectLink, window.location.origin)
    pageUrl.searchParams.set('timestamp', String(Date.now()))
    return pageUrl.toString()
}

/**
 * @description 从 HTML 文档中读取项目版本信息
 */
const getVersionInfoFromDocument = (htmlDocument: Document, source: string): ProjectVersionInfo => {
    const version = htmlDocument.querySelector('meta[name="version"]')?.getAttribute('content') || ''
    const buildTime = htmlDocument.querySelector('meta[name="timestamp"]')?.getAttribute('content') || ''

    if (!version || !buildTime) {
        throw new Error(`[useVersionUpdate] ${source}未找到版本信息，请检查 index.html 和 vite.config.ts 配置`)
    }

    return { version, buildTime }
}

/**
 * @description 获取当前页面构建时写入的版本信息
 */
const getCurrentVersionInfo = () => {
    return getVersionInfoFromDocument(document, '当前页面')
}

/**
 * @description 获取服务器最新页面中的版本信息
 */
const getLatestVersionInfo = (projectLink: string): Promise<ProjectVersionInfo> => {
    return fetch(getProjectPageUrl(projectLink), { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`请求远程项目页面失败：${response.status} ${response.statusText}`)
            }
            return response.text()
        })
        .then(html => {
            const htmlDocument = new DOMParser().parseFromString(html, 'text/html')
            return getVersionInfoFromDocument(htmlDocument, '远程页面')
        })
}

const shouldProjectUpdate = (
    current: ProjectVersionInfo,
    latest: ProjectVersionInfo,
    strictUpdate: boolean,
) => {
    const versionChanged = latest.version !== current.version
    const buildTimeChanged = latest.buildTime !== current.buildTime
    if (strictUpdate) {
        if (versionChanged) console.warn('[useVersionUpdate] 检测到 version 变化，但 buildTime 没变')
        if (buildTimeChanged) console.warn('[useVersionUpdate] 检测到 buildTime 变化，但 version 没变')
        return versionChanged && buildTimeChanged
    }
    return versionChanged || buildTimeChanged
}

/**
 * @version index.html 1
 * @description 通过 index.html 中的 version 和 timestamp meta 标签检测项目更新；开发环境下不启用
 * vite.config.ts 需要在构建时向两个 meta 标签分别注入版本号和构建时间
 * 优点：比 useVersionCheck 配置少，无需生成 version.json 文件；缺点：不够规范
 *
 * @param { string } projectLink 项目部署于域名下的路径，默认为域名根路径/；如果项目部署于子路径(window.location.pathname)，则需要填写子路径（子路径需以 / 结束），如 /project/
 * @param { boolean } intervalRefresh 是否定时轮询检查更新，默认为 false，设置为 true 时，需要注意刷新可能导致未提交的表单数据丢失
 * @param { boolean } strictUpdate 是否需要版本号和构建时间都变化才更新，默认为 false；开发环境启动的话，需要设置成 true，不然 buildTime 一直在变化一直触发更新
 */
export default function useVersionUpdate(projectLink = '/', intervalRefresh = false, strictUpdate = false) {

    const currentVersionInfo = useRef<ProjectVersionInfo | null>(null)

    // 首次检查更新的定时器
    const firstCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    // 轮询检查更新的定时器
    const intervalRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null)
    // 当前是否正在请求版本信息，避免轮询请求重叠
    const isChecking = useRef(false)

    useEffect(() => {
        // 开发环境下启用项目更新没有意义
        if (import.meta.env.MODE === 'development') return

        initialize()

        return () => {
            clearRefreshTimers()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const initialize = () => {
        // 当前页没有版本信息则直接跳过版本检测
        try {
            currentVersionInfo.current = getCurrentVersionInfo()
        } catch (error) {
            console.warn(error)
            return
        }

        // 首次更新
        firstCheckTimer.current = setTimeout(() => {
            checkProjectUpdate()
        }, FIRST_CHECK_DELAY)
        // 轮询更新
        if (intervalRefresh) {
            intervalRefreshTimer.current = setInterval(() => {
                checkProjectUpdate()
            }, REFRESH_INTERVAL)
        }
    }

    const checkProjectUpdate = async (link = projectLink) => {
        if (isChecking.current) return

        isChecking.current = true
        try {
            const latestVersionInfo = await getLatestVersionInfo(link)
            if (!currentVersionInfo.current) return

            const shouldUpdate = shouldProjectUpdate(currentVersionInfo.current, latestVersionInfo, strictUpdate)

            if (shouldUpdate) {
                console.warn(`current version: ${currentVersionInfo.current.version}, latest version: ${latestVersionInfo.version}`)
                console.warn(`current buildTime: ${currentVersionInfo.current.buildTime}, latest buildTime: ${latestVersionInfo.buildTime}`)
            }

            // 以本次请求结果作为后续轮询的比较基准，避免多次弹窗
            currentVersionInfo.current = latestVersionInfo
            if (!shouldUpdate) return

            clearRefreshTimers()

            if (window.confirm('检测到更新，是否刷新页面？')) {
                window.location.reload()
            }
        } catch (error) {
            console.warn('[useVersionUpdate] 检测项目更新失败，请稍后重试', error)
        } finally {
            isChecking.current = false
        }
    }

    // 清除定时器
    const clearRefreshTimers = () => {
        if (firstCheckTimer.current) {
            clearTimeout(firstCheckTimer.current)
            firstCheckTimer.current = null
        }
        if (intervalRefreshTimer.current) {
            clearInterval(intervalRefreshTimer.current)
            intervalRefreshTimer.current = null
        }
    }
}
