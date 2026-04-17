/**
 * @Author: bin
 * @Date: 2025-11-25 16:32:08
 * @LastEditors: bin
 * @LastEditTime: 2025-11-25 17:04:12
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react'

interface Options {
    heartbeatMsg?: string
    heartbeatInterval?: number
    reconnectMaxDelay?: number
}

// 从 chatGPT 中拷贝，参考使用，后续再改
/**
 * @description 封装 WebSocket 的 Hook
 * @param { string } url WebSocket 的连接地址
 * @param { Options } options WebSocket 的配置项
 * @param { string } options.heartbeatMsg 心跳消息，默认为 'ping'
 * @param { number } options.heartbeatInterval 心跳间隔时间，默认为 30000ms
 * @param { number } options.reconnectMaxDelay 最大重连间隔时间，默认为 60000ms
 * @returns { WebSocketHook } 返回对象
 * @returns { number } WebSocketHook.readyState WebSocket 的 readyState 状态
 * @returns { (data: D) => void } WebSocketHook.send 发送消息
 * @returns { R | null } WebSocketHook.lastMessage 最新消息
 */

export default function useWebSocket<D = any, R = any>(url: string, options: Options = {}) {
    const {
        heartbeatMsg = 'ping',                 // 心跳消息
        heartbeatInterval = 30000,             // 心跳间隔
        reconnectMaxDelay = 15000,             // 重连最大间隔
    } = options

    const wsRef = useRef<WebSocket | null>(null)           // WebSocket 实例
    const reconnectTimer = useRef<any>(null)               // 重连定时器
    const heartbeatTimer = useRef<any>(null)               // 心跳定时器
    const reconnectDelay = useRef(1000)                    // 重连延迟
    const messageQueue = useRef<string[]>([])              // 消息队列

    const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
    const [lastMessage, setLastMessage] = useState<R | null>(null)

    /* 建立连接 */
    const connect = useCallback(() => {
        wsRef.current = new WebSocket(url)

        wsRef.current.onopen = () => {
            setReadyState(WebSocket.OPEN)

            reconnectDelay.current = 1000 // reset

            // flush queue
            messageQueue.current.forEach(msg => wsRef.current?.send(msg))
            messageQueue.current = []

            // start heartbeat
            if (heartbeatTimer.current) clearInterval(heartbeatTimer.current)
            heartbeatTimer.current = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(heartbeatMsg)
                }
            }, heartbeatInterval)
        }

        // 收到消息
        wsRef.current.onmessage = (event) => {
            setLastMessage(event.data)
        }

        wsRef.current.onclose = () => {
            setReadyState(WebSocket.CLOSED)

            if (!reconnectTimer.current) {
                reconnectTimer.current = setTimeout(() => {
                    reconnectTimer.current = null
                    reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, reconnectMaxDelay)
                    connect()
                }, reconnectDelay.current)
            }
        }

        wsRef.current.onerror = () => {
            wsRef.current?.close()
        }
    }, [url, heartbeatMsg, heartbeatInterval, reconnectMaxDelay])

    /* 初始连接 */
    useEffect(() => {
        connect()

        return () => {
            wsRef.current?.close()
            clearInterval(heartbeatTimer.current)
            clearTimeout(reconnectTimer.current)
        }
    }, [connect])

    /* 发送 */
    const send = useCallback((data: D) => {
        const msg = typeof data === 'string' ? data : JSON.stringify(data)

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(msg)
        } else {
            messageQueue.current.push(msg)
        }
    }, [])

    return {
        readyState,
        send,
        lastMessage,
    }
}
