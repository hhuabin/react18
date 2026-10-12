import type { PublicRequest, PublicResponse } from './public'

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
