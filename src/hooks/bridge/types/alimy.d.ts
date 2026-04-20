/**
 * @Author: bin
 * @Date: 2026-04-17 15:18:35
 * @LastEditors: bin
 * @LastEditTime: 2026-04-17 15:18:49
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface AliError {
    error?: number;
    errorMessage?: string;
}
interface AliBaseOptions {
    success?: (res?: any) => void;
    fail?: (err: AliError) => void;
    complete?: () => void;
}
interface AliURLOptions extends AliBaseOptions {
    url: string;
}
interface AliMethodsBackOptions extends AliBaseOptions {
    delta?: number;
}

export interface MyApi {
    // 向小程序 发送消息
    postMessage: (options: { data: any }) => void;
    getEnv(callback: (res: { miniprogram: boolean }) => void): void;

    navigateTo(options: AliURLOptions): void;
    navigateBack(options?: AliMethodsBackOptions): void;
}

export type AlipayWindow = Window & {
    my?: MyApi;
}
