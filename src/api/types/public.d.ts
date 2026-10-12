/**
 * @Author: bin
 * @Date: 2024-12-16 09:17:45
 * @LastEditors: bin
 * @LastEditTime: 2026-10-10 17:06:15
 */
/** 公共请求参数 */
export interface PublicRequest {
    readonly userId?: string;
    readonly showLoading?: boolean;             // 是否显示 loading
    readonly maxRequestRetryNumber?: number;    // 请求失败重试次数
    readonly cancelLastRequest?: boolean;       // 是否取消上一个携带 cancelLastRequest 的请求
}
/**
 * 约定：
 * - 所有接口响应统一为 { code, message, data }
 * - 业务数据一律放在 data 中，不散落在顶层
 */
export interface PublicResponse<T = null> {
    readonly code: number;
    readonly message: string;
    /** 需要和后端统一，数据统一放在 data 中 */
    readonly data: T;
}
