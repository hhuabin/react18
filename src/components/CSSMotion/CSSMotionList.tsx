/**
 * @Author: bin
 * @Date: 2026-03-30 16:27:00
 * @LastEditors: bin
 * @LastEditTime: 2026-04-09 10:10:47
 */
/**
 * Portions of this file are derived from rc-motion:
 * https://github.com/react-component/motion
 *
 * The original work is licensed under the MIT License.
 * Copyright (c) 2019-present afc163
 *
 * This file has been modified for this project.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useReducer, useEffect, Fragment } from 'react'

import CSSMotion from './CSSMotion'
import {
    parseKeys, diffKeys,
    type KeyObject,
    STATUS_ADD, STATUS_KEEP, STATUS_REMOVE, STATUS_REMOVED,
} from './util/diff'

import { type CSSMotionProps } from './interface'

type MotionListProps = Omit<
    CSSMotionProps,
    'onVisibleChanged' | 'children' | 'forceRender' | 'onEnterPrepare' | 'onLeavePrepare'
>
const MOTION_PROP_NAMES: (keyof MotionListProps)[] = [
    'motionName',
    'visible',

    'removeOnLeave',
    'motionAppear',
    'motionEnter',
    'motionLeave',

    'motionLeaveImmediately',
    'motionDeadline',
    'leavedClassName',
    // 'forceRender',         // forceRender 与列表删除冲突
    'eventProps',

    'onAppearPrepare',
    'onAppearStart',
    'onAppearActive',
    'onAppearEnd',

    // 'onEnterPrepare',      // 暂不支持，prepare 阶段是“单节点级别控制”
    'onEnterStart',
    'onEnterActive',
    'onEnterEnd',

    // 'onLeavePrepare',      // 暂不支持，prepare 阶段是“单节点级别控制”
    'onLeaveStart',
    'onLeaveActive',
    'onLeaveEnd',

    // 'onVisibleChanged',

    // 'children',
]

// CSSMotionList 只暴露“安全且可批量控制”的能力
// 相比于 CSSMotionProps 只多了 keys, component, onAllRemoved 三个参数
export interface CSSMotionListProps extends
    // 更加严格控制 CSSMotionListProps 参数
    Omit<
        CSSMotionProps,
        'onVisibleChanged' | 'children' | 'forceRender' | 'onEnterPrepare' | 'onLeavePrepare'
    >,
    Omit<React.HTMLAttributes<any>, 'children'>
{
    keys: (React.Key | { key: React.Key; [name: string]: any })[];
    // 支持 'div'等字符串（不能传入'aaa'等非标签字符串）、自定义 React 组件函数、false
    component?: string | React.ComponentType | false;
    onVisibleChanged?: (visible: boolean, info: { key: React.Key }) => void;
    onAllRemoved?: () => void;
    children?:(
        props: {
            visible?: boolean;
            className?: string;
            style?: React.CSSProperties;
            index?: number;
            [key: string]: any;
        },
        ref: React.Ref<any>,
    ) => React.ReactElement;
}

type Action =
  | { type: 'diff'; keys: KeyObject[] }
  | { type: 'remove'; key: React.Key }

// 使用 reducer 代替 getDerivedStateFromProps 做状态合并
/* const reducer = (state: KeyObject[], action: Action): KeyObject[] => {
    switch (action.type) {
        case 'diff': {
            const parsedKeyObjects = parseKeys(action.keys as KeyObject[])
            const mixedKeyEntities = diffKeys(state, parsedKeyObjects)

            // 过滤掉“已 removed 还继续 remove”的项
            return mixedKeyEntities.filter(entity => {
                const prevEntity = state.find(({ key }) => entity.key === key)

                // 删除已经被标记为 removed 的项
                if (
                    prevEntity &&
                    prevEntity.status === STATUS_REMOVED &&
                    entity.status === STATUS_REMOVE
                ) {
                    return false
                }
                return true
            })
        }

        // 移除某一项目，将其状态改为 removed，在下一次 diff 中移除
        case 'remove': {
            return state.map(entity => (
                entity.key === action.key
                    ? { ...entity, status: STATUS_REMOVED }
                    : entity
            ))
        }

        default:
            return state
    }
} */

/**
 * @description CSSMotionList 状态机列表组件
 * @param props CSSMotionList 组件参数
 * @returns ReactElement
 * @example key={key} key 值必须显示接收，否则 React 会报错（key 不能放进 props 对象传递）
 * <CSSMotionList
 *      component={false}
 *      keys={['1']}
 *      motionName='fade'
 *      motionAppear={true}
 * >
 *      {({ className: motionClassName, style: motionStyle, key }, motionRef) => (
 *          <div
 *              ref={motionRef}
 *              key={key}
 *              className={motionClassName}
 *              style={{ ...motionStyle, width: 200, height: 200, background: 'red' }}
 *           />
 *      )}
 * </CSSMotionList>
 */
const CSSMotionList: React.FC<CSSMotionListProps> = (props) => {
    const {
        keys,
        component = 'div',
        onVisibleChanged,
        onAllRemoved,
        children,
        ...restProps
    } = props

    const [keyEntities, setKeyEntities] = useState<KeyObject[]>([])

    // keys 变化，同步修改 keyEntities
    useEffect(() => {
        setKeyEntities((prevKeyEntities) => {
            const parsedKeyObjects = parseKeys(keys as KeyObject[])
            const mixedKeyEntities = diffKeys(prevKeyEntities, parsedKeyObjects)

            // 过滤掉“已 removed 还继续 remove”的项
            return mixedKeyEntities.filter(entity => {
                const prevEntity = prevKeyEntities.find(({ key }) => entity.key === key)

                // 删除已经被标记为 removed 的项
                if (
                    prevEntity &&
                    prevEntity.status === STATUS_REMOVED &&
                    entity.status === STATUS_REMOVE
                ) {
                    return false     // 真正删除
                }
                return true
            })
        })
    }, [keys])

    const removeKey = (removeKey: React.Key) => {
        setKeyEntities((prevKeyEntities) => {
            /**
             * 这里只是把 key 状态改为 removed，没有删除 keyEntities 的项，将会在下一次 render 中删除
             * 我感觉这并不是一个很好的点
             * 在类式组件中，state 的变化立刻会触发 getDerivedStateFromProps 的执行，所以删除的项会立即消失
             * 可以使用 const nextKeyEntities = prevKeyEntities.filter(entity => entity.key !== removeKey) 修改，但是我决定保留这个问题
             */
            let nextKeyEntities = prevKeyEntities.map(entity => (
                entity.key === removeKey
                    ? { ...entity, status: STATUS_REMOVED }
                    : entity
            ))
            // const nextKeyEntities = prevKeyEntities.filter(entity => entity.key !== removeKey)
            // 如果 keys 被删干净，触发 onAllRemoved
            const restKeysCount = nextKeyEntities.filter(({ status }) => status !== STATUS_REMOVED).length
            if (restKeysCount === 0) {
                onAllRemoved?.()
                // 所有项都删除完毕，清空 keyEntities，对没有及时删除的补救措施之一
                nextKeyEntities = []
            }

            return nextKeyEntities
        })
    }

    // ======================== Render 渲染 ========================
    const Component = component || Fragment

    const motionProps: CSSMotionProps = {}

    /**
     * @description 分离参数
     * 1. 拷贝后的 motionProps 给 CSSMotion
     * 2. restProps 留下 HTMLAttributes 属性，这些参数会传给 Component。（CSSMotionList 允许使用 HTMLAttributes）
     */
    MOTION_PROP_NAMES.forEach(prop => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        motionProps[prop] = restProps[prop]
        delete restProps[prop]
    })
    /**
     * 修复 component === false 但是传了 className、style 等标签属性的 bug
     * PS: Fragment只支持 children 和 key；children 被占了，key 不能作为 props 传参
     */
    const mergedProps = Component === Fragment ? {} : restProps
    return (
        <Component {...mergedProps}>
            {keyEntities.map(({ status, ...eventProps }, index) => {
                const visible = (status === STATUS_ADD || status === STATUS_KEEP)
                return (
                    <CSSMotion
                        {...motionProps}
                        key={eventProps.key}       // key 是 React 的保留字段，不会作为 props 传给组件
                        visible={visible}
                        eventProps={eventProps}    // 当 keyEntity 是对象时，将 status 外的参数（包含 key）透传给 children 的 props
                        onVisibleChanged={changedVisible => {
                            onVisibleChanged?.(changedVisible, { key: eventProps.key })
                            // 动画执行完成，删除该项
                            if (!changedVisible) {
                                removeKey(eventProps.key)
                            }
                        }}
                    >
                        {children && ((props, ref) => children({ ...props, index }, ref))}
                    </CSSMotion>
                )
            })}
        </Component>
    )
}

export default CSSMotionList
