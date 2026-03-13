/**
 * @Author: bin
 * @Date: 2024-12-10 16:04:08
 * @LastEditors: bin
 * @LastEditTime: 2026-01-06 15:40:08
 */
import { useRef, useEffect } from 'react'

/**
 * 用于检测项目是否和线上最新版本相同，是否需要更新，仅生产环境生效
 * 当项目的 package.json 版本号和构建打包时间都不同，则需要更新
 * index.html需要增加 version 和 timestamp 的 meta 标签
 * vite.config.ts 需要配置自动修改 version meta 标签值为 package.json 的 version
 * vite.config.ts 需要配置自动修改 timestamp meta 标签值为当前时间戳
 * @param { string } projectLink 项目部署于域名下的路径，默认为域名根路径/；如果项目部署于子路径，则需要填写子路径（子路径需以 / 结束），如 /project/
 * @param { boolean } intervalRefresh 是否定时轮询检查更新，默认为 false，设置为true时，需要注意是否有表单提交页，用户刷新将会导致表单填写数据丢失
 */
export default function useProjectAutoUpdate(projectLink = '/', intervalRefresh = false) {

    // <meta name="version" content="__VERSION__" />
    const versionAndtimestampRegex = /<meta\s+name="(version|timestamp)"\s+content="([^"]+)"\s*\/?>/gi
    const projectVersion = useRef('')
    const projectBuildTime = useRef('')
    const intervalRefreshTimer = useRef<NodeJS.Timeout | null>(null)
    const REFRESH_INTERVAL = 60000      // 一分钟轮询检查更新一次

    useEffect(() => {
        // if (import.meta.env.MODE !== 'production') return
        getVersionAndTimeFromLocalHtmlMetaAndStartRefresh()

        return () => {
            clearTntervalRefreshTimer()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * 获取当前（包括本地存储）页面的版本号和编译时间
     */
    const getVersionAndTimeFromLocalHtmlMetaAndStartRefresh = () => {
        const versionMeta = document.querySelector('meta[name="version"]')
        const buildTimeMeta = document.querySelector('meta[name="timestamp"]')
        projectVersion.current = versionMeta?.getAttribute('content') || ''
        projectBuildTime.current = buildTimeMeta?.getAttribute('content') || ''
        if (!projectVersion.current || !projectBuildTime.current) {
            console.warn('useProjectAutoUpdate：当前页面未找到版本信息，请检查是否已配置版本信息；检测项目更新失败，请稍后重试')
            return
        }
        startCheckRefresh()
    }

    /**
     * 提取链接（项目部署地址）中的版本号和构建打包时间
     * @param { string } link 项目部署于域名下的路径
     * @returns { Promise<[string, string]> } [版本号, 时间戳]
     */
    const extractMetaFromLink = (link = projectLink): Promise<[string, string]> => {
        // fetch('/?timestamp='+Date.now()).then(resp=>resp.text()).then(res=>console.log(res))
        return fetch(link + '?timestamp=' + Date.now())
            .then(response => response.text())
            .then(htmlString => {
                const result: [string, string] = ['', '']
                let match: RegExpExecArray | null
                versionAndtimestampRegex.lastIndex = 0
                while ((match = versionAndtimestampRegex.exec(htmlString)) !== null) {
                    const name = match[1]
                    if (name === 'version') {
                        result[0] = match[2]
                    } else if (name === 'timestamp') {
                        result[1] = match[2]
                    }
                }
                if (result[0] && result[1]) {
                    return Promise.resolve(result)
                } else {
                    return Promise.reject('useProjectAutoUpdate：远程页面未找到版本信息，请检查是否已配置版本信息；检测项目更新失败，请稍后重试')
                }
            })
            .catch(error => {
                console.warn(error)
                return Promise.reject(error)
            })
    }

    // 检测项目是否需要更新
    const checkProjectUpdate = async () => {
        const [version, buildTime] = await extractMetaFromLink(projectLink)
        let isNeedUpdate = false
        /**
         * 更新判定标准，可根据需要修改
         * 版本号和构建打包时间都不同，则需要更新
         */
        if (version !== projectVersion.current && buildTime !== projectBuildTime.current) {
            isNeedUpdate = true
            console.warn(`current version: ${projectVersion.current}, Latest version: ${version}`)
            console.warn(`current timestamp: ${projectBuildTime.current}, Latest timestamp: ${buildTime}`)
        }
        // 避免多次弹窗更新
        projectVersion.current = version
        projectBuildTime.current = buildTime
        if (isNeedUpdate) {
            // 避免多次弹窗更新
            clearTntervalRefreshTimer()
            // 弹出用户更新的弹窗
            if (window.confirm('检测到更新，是否刷新页面？')) {
                // 相当于 F5，仍然有可能命中强缓存
                window.location.reload()

                // 保险措施：绕过缓存
                // const url = new URL(location.href)
                // url.searchParams.set('v', version)
                // location.replace(url.toString())
            }
        }
    }

    // 初始和轮询检查项目更新
    const startCheckRefresh = () => {
        // 初始化 3s 后检查一次更新，给用户反应时间
        setTimeout(() => {
            checkProjectUpdate()
        }, 3000)

        // 循环检查更新
        if (intervalRefresh) {
            clearTntervalRefreshTimer()
            intervalRefreshTimer.current = setInterval(() => {
                checkProjectUpdate()
            }, REFRESH_INTERVAL)
        }
    }

    // 清除循环检查更新定时器
    const clearTntervalRefreshTimer = () => {
        if (intervalRefreshTimer.current) {
            clearInterval(intervalRefreshTimer.current)
            intervalRefreshTimer.current = null
        }
    }
}
