/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppBridgeWindow = Window & {
    AppBridge?: Record<string, (...args: any[]) => any>;
    webkit?: {
        messageHandlers?: {
            AppBridge?: {
                postMessage: (params: any) => void;
            };
        };
    };
    __APP_BRIDGE_CALLBACK__?: (response: AppBridgeResponse) => void;
}

export type AppCallParams = {
    action: string;
    data?: any;
    needResult?: boolean;            // 是否等待 App 返回结果，默认 false，设置为 true 时，如果 iOS 不返回结果将会一直等待，解决可以设置超时时间
}

export type PendingRequest = {
    resolve: (data: any) => void;
    reject: (error: Error) => void;
}

export type AppBridgeResponse = {
    promiseId: string;
    data?: any;
    error?: string;
    success?: boolean;
}
