import type { PublicRequest, PublicResponse } from './public'

/**
 * 登录请求参数
 */
export interface LoginRequest extends PublicRequest {
    /** 用户名 */
    readonly userName: string

    /** 登录密码 */
    readonly password: string

    /** 是否记住登录状态 */
    readonly rememberMe?: boolean
}

/**
 * 登录用户信息
 */
export interface LoginUserInfo {
    readonly userId: number;
    readonly userName: string;
    readonly realName: string;
    readonly phone: string;
    readonly birthday: string;
    /** 状态 0: 女 1: 男 2: 未知 */
    readonly gender: 0 | 1 | 2;
    readonly email: string;
    readonly address: string;
    readonly avatar: string;
    /** 状态 0: 禁用 1: 正常 2: 封禁 */
    readonly status: 0 | 1 | 2;
}
export interface LoginData {
    /** 访问令牌 */
    readonly accessToken: string;

    /** 当前登录用户信息 */
    readonly userInfo: LoginUserInfo;
}
export type LoginResponse = PublicResponse<LoginData>


/**
 * 模拟请求
 */
export interface GetUserInfoByIdRequest extends PublicRequest {
    readonly userId: number;
}

export interface GetUserInfoByIdData {
    /** 后端 userId 是 Long 类型，前端接收不了 Long，让后端转成 string */
    readonly userId: string;
    readonly userName: string;
    readonly realName: string;
    readonly phone: string;
    readonly birthday: string;
    readonly gender: '0' | '1' | '2';
    readonly email: string;
    readonly address: string;
    readonly avatar: string;
    readonly signature: string;
    readonly status: 0 | 1 | 2;
    readonly lastLoginTime: string;
}
/** null 不是必须加的，主要看后端给不给力 */
export type GetUserInfoByIdResponse = PublicResponse<GetUserInfoByIdData | null>
