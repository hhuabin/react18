/**
 * @Author: bin
 * @Date: 2026-04-17 15:18:35
 * @LastEditors: bin
 * @LastEditTime: 2026-05-21 10:02:39
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

interface NavigateMethodsOptions extends AliBaseOptions {
    url: string;
}

interface NavigateBackOptions extends AliBaseOptions {
    delta?: number;
}

interface ChooseImageOptions extends AliBaseOptions {
    count?: number;
    sizeType?: ('original' | 'compressed')[];
    sourceType?: ('camera' | 'album')[];
    highQuality?: boolean;
    success?: (
        res: {
            apFilePaths: string[];
            tempFilePaths: string[];
            tempFiles: {
                path: string;
                size: number;
            };
        }
    ) => void;
}

interface PreviewImageOptions extends AliBaseOptions {
    enableSavePhoto?: boolean;
    enableShowPhotoDownload?:  boolean;
    urls: string[];
    current?: string;
}

interface GetLocationOptions extends AliBaseOptions {
    cacheTimeout?: number;
    type?: 0 | 1 | 2 | 3;
    adVersion?: string;
    success?: (res: {
        longitude: string;
        latitude: string;
        accuracy: string;
        horizontalAccuracy: string;
        country: string;
        countryCode: string;
        province: string;
        provinceAdcode: string;
        city: string;
        cityAdcode: string;
        district: string;
        districtAdcode: string;
        streetNumber: {
            number: string;
            street: string;
        };
        pois: {
            name: string;
            address: string;
        };
        altitude: string;
        verticalAccuracy: string;
    }) => void;
}

interface OpenLocationOptions extends AliBaseOptions {
    longitude: string;
    latitude: string;
    name: string;
    address: string;
    scale?: string;
}

interface GetNetworkTypeOptions extends AliBaseOptions {
    success?: (res: {
        networkAvailable: boolean;
        networkType: 'UNKNOWN' | 'NOTREACHABLE' | 'WIFI' | '2G' | '3G' | '4G' | '5G' | 'WWAN';
        signalStrength: number;
        hasSystemProxy: boolean;
    }) => void;
}

interface StartShareOptions extends AliBaseOptions {
    title: string;
    desc?: string;
    searchTip?: string;
    content?: string;
    imageUrl?: string;
    bgImgUrl?: string;
    scImgUrl?: string;
    query?: string;
}

interface TradePayOptions extends AliBaseOptions {
    tradeNO?: string;
    orderStr?: string;
    success?: (res: {
        resultCode: string;
    }) => void;
}

export interface MyApi {
    navigateTo(options: NavigateMethodsOptions): void;

    navigateBack(options?: NavigateBackOptions): void;

    switchTab(options?: NavigateMethodsOptions): void;

    reLaunch(options?: NavigateMethodsOptions): void;

    redirectTo(options?: NavigateMethodsOptions): void;

    chooseImage(options?: ChooseImageOptions): void;

    previewImage(options: PreviewImageOptions): void;

    getLocation(options?: GetLocationOptions): void;

    openLocation(options: OpenLocationOptions): void;

    getNetworkType(options?: GetNetworkTypeOptions): void;

    // startShare 功能未测试过，有可能是直接触发小程序 webview 的 onShareAppMessage 方法，故而参数类型不一定是 StartShareOptions，也可能是无参
    startShare(options?: StartShareOptions): void;

    tradePay(options: TradePayOptions): void;

    postMessage: (options: any) => void;

    onMessage: (options: any) => void;

    getEnv(callback: (res: { miniprogram: boolean }) => void): void;
}

export type AlipayWindow = Window & {
    my?: MyApi;
}
