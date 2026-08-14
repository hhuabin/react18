/* eslint-disable max-lines */
import type { PickerColumn as SinglePickerColumn } from '@/components/mobile/Picker/SinglePicker'
import type { PickerColumn } from '@/components/mobile/Picker'

export const singlePickerColumns1: SinglePickerColumn = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const singlePickerColumns2: SinglePickerColumn = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
]

export const pickerColumns11: PickerColumn = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
]
export const pickerColumns12: PickerColumn = [
    { label: '11', value: 11 },
    { label: '21', value: 21 },
    { label: '31', value: 31 },
    { label: '41', value: 41 },
    { label: '51', value: 51 },
    { label: '61', value: 61 },
    { label: '71', value: 71 },
    { label: '81', value: 81 },
    { label: '91', value: 91 },
    { label: '101', value: 101 },
]
export const pickerColumns21: PickerColumn[] = [
    // 第一列
    [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
        { label: '8', value: 8 },
        { label: '9', value: 9 },
        { label: '10', value: 10 },
    ],
    // 第二列
    [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
        { label: '8', value: 8 },
        { label: '9', value: 9 },
        { label: '10', value: 10 },
    ],
]
export const pickerColumns22: PickerColumn[] = [
    // 第一列
    [
        { label: '11', value: 11 },
        { label: '21', value: 21 },
        { label: '31', value: 31 },
        { label: '41', value: 41 },
        { label: '51', value: 51 },
        { label: '61', value: 61 },
        { label: '71', value: 71 },
        { label: '81', value: 81 },
        { label: '91', value: 91 },
        { label: '101', value: 101 },
    ],
    // 第二列
    [
        { label: '11', value: 11 },
        { label: '21', value: 21 },
        { label: '31', value: 31 },
        { label: '41', value: 41 },
        { label: '51', value: 51 },
        { label: '61', value: 61 },
        { label: '71', value: 71 },
        { label: '81', value: 81 },
        { label: '91', value: 91 },
        { label: '101', value: 101 },
    ],
]
export const pickerColumns31: PickerColumn = [
    {
        cityName: '广东',
        value: 'guangdong',
        children: [
            {
                cityName: '广州',
                value: 'guangzhou',
                children: [
                    { cityName: '越秀', value: 'yuexiu' },
                    { cityName: '海珠', value: 'haizhu' },
                    { cityName: '荔湾', value: 'liwan' },
                    { cityName: '天河', value: 'tianhe' },
                    { cityName: '番禺', value: 'panyu' },
                    { cityName: '花都', value: 'huadu' },
                    { cityName: '南沙', value: 'nansha' },
                    { cityName: '增城', value: 'zengcheng' },
                    { cityName: '从化', value: 'conghua' },
                ],
            },
            {
                cityName: '深圳',
                value: 'shenzhen',
                children: [
                    { cityName: '福田', value: 'futian' },
                    { cityName: '南山', value: 'nanshan' },
                    { cityName: '罗湖', value: 'luohu' },
                    { cityName: '宝安', value: 'baoan' },
                    { cityName: '龙岗', value: 'longgang' },
                    { cityName: '龙华', value: 'longhua' },
                ],
            },
            {
                cityName: '茂名',
                value: 'maoming',
                children: [
                    { cityName: '茂南', value: 'maonan' },
                    { cityName: '电白', value: 'dianbai' },
                    { cityName: '茂港', value: 'maogang' },
                    { cityName: '高州', value: 'gaozhou' },
                    { cityName: '化州', value: 'huazhou' },
                    { cityName: '信宜', value: 'xinyi' },
                ],
            },
            {
                cityName: '惠州',
                value: 'huizhou',
                children: [
                    { cityName: '惠城', value: 'huicheng' },
                    { cityName: '惠阳', value: 'huiyang' },
                    { cityName: '博罗', value: 'boluo' },
                    { cityName: '惠东', value: 'huidong' },
                    { cityName: '龙门', value: 'longmen' },
                ],
            },
        ],
    },
    {
        cityName: '北京',
        value: 'beijing',
        children: [
            { cityName: '东城', value: 'dongcheng' },
            { cityName: '西城', value: 'xicheng' },
            { cityName: '朝阳', value: 'chaoyang' },
            { cityName: '丰台', value: 'fengtai' },
            { cityName: '石景山', value: 'shijingshan' },
            { cityName: '海淀', value: 'haidian' },
        ],
    },
    {
        cityName: '上海',
        value: 'shanghai',
        children: [
            { cityName: '黄浦', value: 'huangpu' },
            { cityName: '徐汇', value: 'xuhui' },
            { cityName: '长宁', value: 'changning' },
            { cityName: '静安', value: 'jingan' },
            { cityName: '普陀', value: 'putuo' },
            { cityName: '闸北', value: 'zhabei' },
        ],
    },
    {
        cityName: '浙江',
        value: 'zhejiang',
        children: [
            {
                cityName: '杭州',
                value: 'hangzhou',
                children: [
                    { cityName: '上城', value: 'shangcheng' },
                    { cityName: '下城', value: 'xiacheng' },
                    { cityName: '拱墅', value: 'gongshu' },
                    { cityName: '西湖', value: 'xihu' },
                    { cityName: '滨江', value: 'binjiang' },
                    { cityName: '萧山', value: 'xiaoshan' },
                ],
            },
            {
                cityName: '宁波',
                value: 'ningbo',
                children: [
                    { cityName: '海曙', value: 'haishu' },
                    { cityName: '江北', value: 'jiangbei' },
                    { cityName: '北仑', value: 'beilun' },
                    { cityName: '镇海', value: 'zhenhai' },
                    { cityName: '鄞州', value: 'yinzhou' },
                ],
            },
            {
                cityName: '温州',
                value: 'wenzhou',
                children: [
                    { cityName: '鹿城', value: 'lucheng' },
                    { cityName: '龙湾', value: 'longwan' },
                    { cityName: '瓯海', value: 'ouhai' },
                    { cityName: '洞头', value: 'dongtou' },
                    { cityName: '永嘉', value: 'yongjia' },
                ],
            },
        ],
    },
]
export const pickerColumns32: PickerColumn = [
    {
        cityName: '上海',
        value: 'shanghai',
        children: [
            { cityName: '黄浦', value: 'huangpu' },
            { cityName: '徐汇', value: 'xuhui' },
            { cityName: '长宁', value: 'changning' },
            { cityName: '静安', value: 'jingan' },
            { cityName: '普陀', value: 'putuo' },
            { cityName: '闸北', value: 'zhabei' },
        ],
    },
    {
        cityName: '浙江',
        value: 'zhejiang',
        children: [
            {
                cityName: '杭州',
                value: 'hangzhou',
                children: [
                    { cityName: '上城', value: 'shangcheng' },
                    { cityName: '下城', value: 'xiacheng' },
                    { cityName: '拱墅', value: 'gongshu' },
                    { cityName: '西湖', value: 'xihu' },
                    { cityName: '滨江', value: 'binjiang' },
                    { cityName: '萧山', value: 'xiaoshan' },
                ],
            },
            {
                cityName: '宁波',
                value: 'ningbo',
                children: [
                    { cityName: '海曙', value: 'haishu' },
                    { cityName: '江北', value: 'jiangbei' },
                    { cityName: '北仑', value: 'beilun' },
                    { cityName: '镇海', value: 'zhenhai' },
                    { cityName: '鄞州', value: 'yinzhou' },
                ],
            },
            {
                cityName: '温州',
                value: 'wenzhou',
                children: [
                    { cityName: '鹿城', value: 'lucheng' },
                    { cityName: '龙湾', value: 'longwan' },
                    { cityName: '瓯海', value: 'ouhai' },
                    { cityName: '洞头', value: 'dongtou' },
                    { cityName: '永嘉', value: 'yongjia' },
                ],
            },
        ],
    },
    {
        cityName: '北京',
        value: 'beijing',
        children: [
            { cityName: '东城', value: 'dongcheng' },
            { cityName: '西城', value: 'xicheng' },
            { cityName: '朝阳', value: 'chaoyang' },
            { cityName: '丰台', value: 'fengtai' },
            { cityName: '石景山', value: 'shijingshan' },
            { cityName: '海淀', value: 'haidian' },
        ],
    },
    {
        cityName: '广东',
        value: 'guangdong',
        children: [
            {
                cityName: '广州',
                value: 'guangzhou',
                children: [
                    { cityName: '越秀', value: 'yuexiu' },
                    { cityName: '海珠', value: 'haizhu' },
                    { cityName: '荔湾', value: 'liwan' },
                    { cityName: '天河', value: 'tianhe' },
                    { cityName: '番禺', value: 'panyu' },
                    { cityName: '花都', value: 'huadu' },
                    { cityName: '南沙', value: 'nansha' },
                    { cityName: '增城', value: 'zengcheng' },
                    { cityName: '从化', value: 'conghua' },
                ],
            },
            {
                cityName: '深圳',
                value: 'shenzhen',
                children: [
                    { cityName: '福田', value: 'futian' },
                    { cityName: '南山', value: 'nanshan' },
                    { cityName: '罗湖', value: 'luohu' },
                    { cityName: '宝安', value: 'baoan' },
                    { cityName: '龙岗', value: 'longgang' },
                    { cityName: '龙华', value: 'longhua' },
                ],
            },
            {
                cityName: '茂名',
                value: 'maoming',
                children: [
                    { cityName: '茂南', value: 'maonan' },
                    { cityName: '电白', value: 'dianbai' },
                    { cityName: '茂港', value: 'maogang' },
                    { cityName: '高州', value: 'gaozhou' },
                    { cityName: '化州', value: 'huazhou' },
                    { cityName: '信宜', value: 'xinyi' },
                ],
            },
            {
                cityName: '惠州',
                value: 'huizhou',
                children: [
                    { cityName: '惠城', value: 'huicheng' },
                    { cityName: '惠阳', value: 'huiyang' },
                    { cityName: '博罗', value: 'boluo' },
                    { cityName: '惠东', value: 'huidong' },
                    { cityName: '龙门', value: 'longmen' },
                ],
            },
        ],
    },
]
