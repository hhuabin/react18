/**
 * @Author: bin
 * @Date: 2025-04-07 11:28:16
 * @LastEditors: bin
 * @LastEditTime: 2026-04-20 14:25:55
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description 微信 jweixin-1.6.0.js
 * @see {@link /src/assets/js/jweixin-1.6.0.js}
 *  项目需要引入 jweixin-1.6.0.js 才可以使用
 */
export interface WxError {
    errMsg: string;
}
interface WxPubilcOptions {
    success?: () => void;
    fail?: (err: WxError) => void;
    complete?: () => void;
}
interface MiniProgramURLOptions extends WxPubilcOptions {
    url: string;
}
interface MiniProgramBackOptions extends WxPubilcOptions {
    delta?: number;
}
interface MiniProgramMethods {
    postMessage: (options: { data: any }) => void;
    getEnv:(callback: (res: any) => void) => void;
    navigateTo: (options: MiniProgramURLOptions) => void;
    navigateBack: (options?: MiniProgramBackOptions) => void;
    switchTab: (options: MiniProgramURLOptions) => void;
    reLaunch: (options: MiniProgramURLOptions) => void;
    redirectTo: (options: MiniProgramURLOptions) => void;
}
export interface WxConfigOptions {
    debug?: boolean;
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
    jsApiList: string[];
}

/**
 * @description 这里只定义了常用方法，需要其他的方法请自行添加
 * 详情请看官网：https://developers.weixin.qq.com/doc/subscription/guide/h5/jssdk.html
 */
export interface Wx {
    config: (options: WxConfigOptions) => void;
    ready: (callback: () => void) => void;
    error: (callback: (err: WxError) => void) => void;
    miniProgram: MiniProgramMethods;
}
export type WxWindow = Window & {
    wx?: Wx;
    jWeixin?: Wx;
}
