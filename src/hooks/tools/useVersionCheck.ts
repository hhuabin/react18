/**
 * @Author: bin
 * @Date: 2026-08-12 14:09:57
 * @LastEditors: bin
 * @LastEditTime: 2026-08-13 09:53:00
 */
import { useEffect, useRef } from 'react'

interface ProjectVersionInfo {
    version: string;
    buildTime: number;
}

// vite.config.ts 构建时注入的版本和构建时间系统变量
const BUILD_VERSION = __APP_VERSION__ || ''
const BUILD_TIME = __BUILD_TIME__ || 0

const FIRST_CHECK_DELAY = 3000      // 首次检查时间，加载 3s 后，执行，不妨碍主线程渲染
const REFRESH_INTERVAL = 300000     // 5 分钟轮询检查更新一次

/**
 * @description 生成服务器的 version.json 文件地址
 * @param projectLink 项目部署的子路径
 * @returns { string } 服务器的 version.json 文件地址
 */
const getVersionFileUrl = (projectLink: string) => {
    const baseUrl = /^https?:\/\//i.test(projectLink)
        ? new URL(projectLink)
        : new URL(projectLink, window.location.origin)
    const versionFileUrl = new URL('version.json', baseUrl)
    versionFileUrl.searchParams.set('timestamp', String(Date.now()))
    return versionFileUrl.toString()
}

/**
 * @description 判断对象是不是 ProjectVersionInfo 类型
 * @param { unknown } data 对象
 * @returns { boolean }
 */
const isProjectVersionInfo = (data: unknown): data is ProjectVersionInfo => {
    return typeof data === 'object'
        && data !== null
        && typeof (data as ProjectVersionInfo).version === 'string'
        && typeof (data as ProjectVersionInfo).buildTime === 'number'
}

/**
 * @description 获取服务的的 version.json 信息
 */
const getVersionInfo = (projectLink: string): Promise<ProjectVersionInfo> => {
    return fetch(getVersionFileUrl(projectLink), { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`请求远程  version.json 失败：${response.status} ${response.statusText}`)
            }
            return response.json() as Promise<unknown>
        })
        .then(data => {
            if (!isProjectVersionInfo(data)) {
                throw new Error('远程 version.json 格式错误，需要包含 string 类型的 version 和 number 类型的 buildTime')
            } else if (!data.version) {
                throw new Error('远程 version.json 无 version 信息')
            } else if (!data.buildTime) {
                throw new Error('远程 version.json 无 buildTime 信息')
            }
            return data
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
        if (versionChanged) console.warn('[useVersionCheck] 检测到 version 变化，但 buildTime 没变')
        if (buildTimeChanged) console.warn('[useVersionCheck] 检测到 buildTime 变化，但 version 没变')
        return versionChanged && buildTimeChanged
    }
    return versionChanged || buildTimeChanged
}

/**
 * @version version.json 2
 * @description 通过构建产物中的 version.json 检测项目更新；开发环境下不启用
 * vite.config.ts 需要在构建时生成包含 version 和 buildTime 的 version.json
 * 优点：比 useVersionUpdate 规范；缺点：配置较多，需要注入全局变量__APP_VERSION__和__BUILD_TIME__，也生成 version.json 文件在前端服务器
 *
 * @param { string } projectLink 项目部署于域名下的路径，默认为域名根路径/；如果项目部署于子路径(window.location.pathname)，则需要填写子路径（子路径需以 / 结束），如 /project/
 * @param { boolean } intervalRefresh 是否定时轮询检查更新，默认为 false，设置为true时，需要注意是否有表单提交页，用户刷新将会导致表单填写数据丢失
 * @param { boolean } strictUpdate 是否需要版本号和构建时间都变化才更新，默认为 false
 */
export default function useVersionCheck(projectLink = '/', intervalRefresh = false, strictUpdate = false) {

    const currentVersionInfo = useRef<ProjectVersionInfo>({
        version: BUILD_VERSION,
        buildTime: BUILD_TIME,
    })

    // 首次检查更新的定时器
    const firstCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    // 轮询更新的定时器
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
        if (!currentVersionInfo.current.version || !currentVersionInfo.current.buildTime) {
            console.warn('[useVersionCheck] 未找到构建版本信息， 请检查 vite.config.ts 构建信息')
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
            const latestVersionInfo = await getVersionInfo(link)

            const shouldUpdate = shouldProjectUpdate(currentVersionInfo.current, latestVersionInfo, strictUpdate)

            if (shouldUpdate) {
                console.warn(`current version: ${currentVersionInfo.current.version}, latest version: ${latestVersionInfo.version}`)
                console.warn(`current buildTime: ${currentVersionInfo.current.buildTime}, latest buildTime: ${latestVersionInfo.buildTime}`)
            }

            // 以本次请求结果作为后续轮询的比较基准，避免多次弹窗
            currentVersionInfo.current = latestVersionInfo
            if (!shouldUpdate) return

            // 避免多次弹窗更新
            clearRefreshTimers()

            if (window.confirm('检测到更新，是否刷新页面？')) {
                window.location.reload()
            }
        } catch (error) {
            console.warn('[useVersionCheck] 检测项目更新失败，请稍后重试', error)
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
