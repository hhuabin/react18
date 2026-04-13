/**
 * @Author: bin
 * @Date: 2026-04-10 15:53:41
 * @LastEditors: bin
 * @LastEditTime: 2026-04-10 18:54:32
 */
import type { IndexRouteObject, NonIndexRouteObject, RouteObject } from 'react-router-dom'

export type RouteHandle = {
    title?: string;
    keepAlive?: boolean;
}

export type RouteConfig =
    |   Omit<IndexRouteObject, 'handle'> & {
            handle?: RouteHandle;
        }
    |   Omit<NonIndexRouteObject, 'handle'> & {
            handle?: RouteHandle;
            children?: RouteConfig[];
        }
