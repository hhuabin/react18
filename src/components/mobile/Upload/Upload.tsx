/**
 * @Author: bin
 * @Date: 2025-08-13 11:52:25
 * @LastEditors: bin
 * @LastEditTime: 2026-04-17 11:12:35
 */
/* eslint-disable max-lines */
import {
    forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState,
    type ForwardedRef,
} from 'react'
import { flushSync } from 'react-dom'

import Image from '@/components/mobile/Image'
import { showImagePreview } from '@/components/mobile/ImagePreview'
import { useMergedState } from '@/hooks/core'
import { isImageFile, readFileContent, updateFileList } from './utils'
import { xhrRequest } from './xhrRequest'
import { runTasksWithLimitSettled } from '@/utils/functionUtils/runTasksWithLimit'
import type { UploadFile, RequestOptions, UploaderBeforeRead, UploaderAfterRead, UploaderBeforeDelete } from './Upload.d'

import './Upload.less'

let uploadKeyIndex = 0

type UploadProps = {
    fileList?: UploadFile[];                    // 已上传的文件列表
    accept?: string;                            // 允许上传的文件类型，默认值 image/*
    maxCount?: number;                          // 文件上传数量限制，向前截断
    multiple?: boolean;                         // 是否支持多选文件
    maxSize?: number;                           // 文件大小限制，单位为 byte
    preview?: boolean;                         // 是否允许图片预览，默认值为 true
    fit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';    // 图片填充模式，详见 Image
    drag?: boolean;                             // 是否开启拖拽上传
    capture?: boolean | 'environment' | 'user'; // 拍照方式（移动端生效）
    disabled?: boolean;                         // 是否禁用文件上传
    action?: RequestOptions;                    // 上传的请求配置
    className?: string;                         // 自定义类名
    style?: React.CSSProperties;                // 自定义样式
    children?: React.ReactNode;                 // 自定义 Upload children
    isImageUrl?: (file: UploadFile) => boolean; // 用户自定义判断该文件是否为图片的方法
    onChange?: (info: UploadFile[]) => void;    // 上传文件改变时的回调，上传每个阶段都会触发该事件
    beforeRead?: UploaderBeforeRead;            // 读取文件之前的回调，返回 false | resolve(false) | reject()，则停止上传；切忌不可返回 pedding 状态的 Promise
    afterRead?: UploaderAfterRead;              // 文件读取完成后的回调
    beforeDelete?: UploaderBeforeDelete;        // 删除文件之前的回调，返回 false | resolve(false) | reject()，则停止上传
}

export type UploadRef = {
    chooseFile: VoidFunction;
}

// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function Upload(props: UploadProps, ref: ForwardedRef<UploadRef>) {
    const {
        fileList,
        accept = 'image/*',
        maxCount = Number.MAX_VALUE,
        multiple = false,
        maxSize = Number.MAX_VALUE,
        preview = true,
        fit = 'contain',
        drag = true,
        disabled = false,
        action = {} as RequestOptions,
        className = '',
        style = {},
        children,
        isImageUrl = isImageFile,
        beforeRead,
        afterRead,
        beforeDelete,
    } = props

    const [mergedFileList, setMergedFileList, getLatestFileList] = useMergedState<UploadFile[]>(fileList || [], {
        value: fileList,
        onChange: (value) => {
            // 修改父组件的 fileList
            props.onChange?.(value)
        },
        postState: value => value ?? [],
    })

    const [dragActive, setDragActive] = useState(false)   // 拖拽状态，是否进入了 input
    const inputRef = useRef<HTMLInputElement>(null)
    const controller = useRef<Map<React.Key, AbortController>>(new Map())

    useEffect(() => {
        // 禁止页面的拖拽事件
        const onDragEvents = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.type === 'dragover') {
                e.dataTransfer && (e.dataTransfer.dropEffect = 'none')
            }
        }

        document.addEventListener('dragover', onDragEvents)
        document.addEventListener('drop', onDragEvents)

        return () => {
            document.removeEventListener('dragover', onDragEvents)
            document.removeEventListener('drop', onDragEvents)
        }
    }, [])

    // 受控模式下，若没有提供 key，将会自动为文件填充 key 值
    useMemo(() => {
        (fileList || [])
            .slice(0, maxCount)
            .forEach(uploadFile => {
                if (!uploadFile.key) {
                    uploadFile.key = `upload-${Date.now()}-${uploadKeyIndex++}`
                }
            })
    }, [fileList, maxCount])

    /**
     * @description 文件列表改变后更新状态函数
     * @param { UploadFile[] } files 文件改变后的列表
     */
    const changeMergeFile = (state: UploadFile[] | ((prevState: UploadFile[]) => UploadFile[])) => {
        setMergedFileList(state)
    }

    // ✅ 清空 input 的 value，防止相同文件不触发 onChange
    const resetInput = () => {
        inputRef.current && (inputRef.current.value = '')
    }

    // 上传状态处理
    const onProgress = (uploadFile: UploadFile, percent: number, loaded: number, total: number) => {
        // 此处闭包，获得的 mergedFileList 是旧值，因此使用了函数式更新
        /* changeMergeFile(prevList => {
            const targetItem = prevList.find((item => item.key === uploadFile.key))
            if (!targetItem) return prevList

            targetItem.percent = percent
            const newFileList = updateFileList(targetItem, prevList)
            return newFileList
        }) */
        changeMergeFile(prevList => (prevList || []).map(item => {
            if (item.key === uploadFile.key) {
                item.percent = percent
                item.message = `${percent.toFixed(2) + ' '}%`
            }
            return item
        }))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSuccess = (response: any, uploadFile: UploadFile) => {
        // 此处闭包，获得的 mergedFileList 是旧值，因此使用了函数式更新
        changeMergeFile(prevList => (prevList || []).map(item => {
            if (item.key === uploadFile.key) {
                item.response = response
                item.status = ''
                item.message = ''
                // item.deletable = true
            }
            return item
        }))
    }
    const onError = (uploadFile: UploadFile) => {
        // 此处闭包，获得的 mergedFileList 是旧值，因此使用了函数式更新
        changeMergeFile(prevList => (prevList || []).map(item => {
            if (item.key === uploadFile.key) {
                item.status = 'failed'
                item.message = '上传失败'
                // item.deletable = true
            }
            return item
        }))
    }

    /**
     * @description 上传单个文件
     * @param { UploadFile } uploadFile 上传文件
     * @param { RequestOptions } action xhr请求配置
     */
    const xhrUploadFile = (uploadFile: UploadFile, action: RequestOptions) => {
        const formData = new FormData()
        formData.append('file', uploadFile.file!)
        // 接收自定义参数
        if (action.data) {
            Object.keys(action.data).forEach((key) => {
                formData.append(key, action.data![key])
            })
        }
        // 创建取消请求的 controller
        const newController = new AbortController()
        controller.current.set(uploadFile.key!, newController)

        return xhrRequest({
            url: action.url,
            headers: action.headers || {},
            method: action.method || 'POST',
            signal: newController.signal,
            body: formData,
            responseType: action.responseType || 'text',
            onUploadProgress: (percent: number, loaded: number, total: number) => {
                onProgress(uploadFile, percent, loaded, total)
            },
        })
        .then((response) => onSuccess(response, uploadFile))
        .catch((error) => {
            console.error(error)
            onError(uploadFile)
        })
        .finally(() => {
            // 删除该 controller
            controller.current.delete(uploadFile.key!)
        })
    }

    /**
     * @description 并发上传文件列表
     * @param { UploadFile[] } uploadFileList 文件列表
     */
    const requestUploadingFileList = (uploadFileList: UploadFile[]) => {
        // 创建任务队列
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasks: (() => Promise<any>)[] = []
        uploadFileList.forEach((uploadFile, index) => {
            uploadFile.percent = 0
            uploadFile.status = 'uploading'
            uploadFile.message = '上传中...'
            uploadFile.deletable = true

            tasks.push(() => xhrUploadFile(uploadFile, action))
        })
        // 更新文件的状态为上传中...
        changeMergeFile([...mergedFileList, ...uploadFileList])
        // 并发上传所有文件
        runTasksWithLimitSettled(tasks, action.maxConcurrent || 5)
    }

    /**
     * @description 读取文件列表
     * @param { File[] } files 文件列表
     */
    const readFiles = (files: File[]) => {
        // 过滤大小超过限制的文件
        files = files.filter(items => (items.size <= maxSize))
        // 获取最大可上传数量
        const restLength = maxCount - mergedFileList.length

        if (restLength === 0) {
            files = files.slice(0, maxCount)
        } else if (files.length > restLength) {
            files = files.slice(0, restLength)
        }
        Promise.all(
            files.map((file) => readFileContent(file)),
        )
        .then((tempUrls) => {
            // 生成 uploadFile 列表
            const uploadFiles = files.map((file, index) => {
                return {
                    key: `upload-${Date.now()}-${uploadKeyIndex++}`,
                    tempUrl: tempUrls[index],
                    status: '',
                    name: file.name,
                    file,
                } as UploadFile
            }, [] as UploadFile[])
            // flushSync：防止React18自动批处理，因为输入[上传]触发过程同时进行
            flushSync(() => {
                const targetFileList = [...mergedFileList, ...uploadFiles].slice(-maxCount)
                changeMergeFile(targetFileList)
                // 此处不可使用函数式更新，prev 是 flushSync 取的闭包值
                /* changeMergeFile((prevList) => {
                    // prev 始终是[进入 flushSync 前的旧值]
                    console.log('flushSync', prevList)
                    const targetFileList = [...prevList, ...uploadFiles].slice(-maxCount)
                    return targetFileList
                }) */
            })
            resetInput()
            // 执行自定义传入的读取完成后方法
            afterRead?.(uploadFiles, getLatestFileList())
            // afterRead?.(uploadFiles, [...mergedFileList, ...uploadFiles])

            // 若开发者传入了 url，则直接上传文件列表
            if (Object.prototype.hasOwnProperty.call(action, 'url')) {
                requestUploadingFileList(uploadFiles)
            }
        })
        .catch(console.warn)
        .finally(resetInput)
    }

    /**
     * @description 文件发生变化时执行该函数
     */
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target
        if (!files || !files.length) return

        let cloneFileList = Array.from(files)

        /**
         * @description 用户定义了前置函数，需要处理；返回 false 或 reject 状态的 Promise，则取消本次读取
         */
        if (beforeRead) {
            const response = beforeRead(cloneFileList)
            if (response === false) {
                resetInput()
                return
            } else if (
                response !== null &&
                typeof response === 'object' &&
                typeof response.then === 'function' &&
                typeof response.catch === 'function'
            ) {
                response.then(result => {
                    if (typeof result === 'boolean') {
                        if (result === false) return Promise.reject(false)
                    } else {
                        cloneFileList = result
                    }
                    readFiles(cloneFileList)
                })
                .catch(resetInput)
                // 此处必须返回，避免下面的 readFiles 重复读取
                return
            }
        }

        readFiles(cloneFileList)
    }

    /**
     * @description 拖拽事件处理函数
     * @param { React.DragEvent<HTMLInputElement> } event 事件对象
     */
    const onFileDrag = (event: React.DragEvent<HTMLInputElement>) => {
        if (!drag) return
        event.preventDefault()     // 阻止事件的默认行为
        event.stopPropagation()    // 防止事件冒泡到可能包含的其他拖拽监听器
        if (event.type === 'dragenter' || event.type === 'dragover') {
            event.dataTransfer.dropEffect = 'copy'
            setDragActive(true)
        } else if (event.type === 'dragleave') {
            setDragActive(false)
        }
    }

    /**
     * @description 拖拽事件处理函数
     * @param { React.DragEvent<HTMLInputElement> } event 事件对象
     */
    const onFileDrop = (event: React.DragEvent<HTMLInputElement>) => {
        event.preventDefault()
        setDragActive(false)
        const { files } = event.dataTransfer
        if (!files.length) return

        let cloneFileList = Array.from(files)

        /**
         * @description 用户定义了前置函数，需要处理；返回 false 或 reject 状态的 Promise，则取消本次读取
         */
        if (beforeRead) {
            const response = beforeRead(cloneFileList)
            if (response === false) {
                resetInput()
                return
            } else if (
                response !== null &&
                typeof response === 'object' &&
                typeof response.then === 'function' &&
                typeof response.catch === 'function'
            ) {
                response.then(result => {
                    if (typeof result === 'boolean') {
                        if (result === false) return Promise.reject(false)
                    } else {
                        cloneFileList = result
                    }
                    readFiles(cloneFileList)
                })
                .catch(resetInput)
                // 此处必须返回，避免下面的 readFiles 重复读取
                return
            }
        }

        readFiles(cloneFileList)
    }

    const previewImage = (uploadFile: UploadFile, uploadFileIndex: number) => {
        if (!preview) return
        const previewImagesSrc: string[] = []
        let defaultIndex = 0
        mergedFileList.forEach((item, index) => {
            const isImage = isImageUrl(item)
            // 过滤掉非图片的 src，避免图片显示错误
            if (isImage) {
                previewImagesSrc.push((item.url || item.tempUrl) as string)
                if (index === uploadFileIndex) {
                    defaultIndex = previewImagesSrc.length - 1
                }
            }
        })
        showImagePreview({
            images: previewImagesSrc,
            defaultIndex,
        })
    }

    /**
     * @description 删除文件
     * @param { UploadFile } uploadFile 文件对象
     */
    const onDelete = async (uploadFile: UploadFile, index: number) => {
        try {
            const result = await beforeDelete?.(uploadFile, index)
            if (result === false) return
            const _fileList = mergedFileList.filter(item => item.key !== uploadFile.key)
            // 释放临时 url
            if (uploadFile.tempUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(uploadFile.tempUrl)
            }
            controller.current.get(uploadFile.key!)?.abort()
            changeMergeFile(_fileList)
        } catch (error) {
            console.warn(error)
        }
    }

    /**
     * @description 手动触发选择文件
     */
    const handleChooseFile = () => {
        if (disabled) return
        inputRef.current?.click()
    }

    useImperativeHandle(ref, () => ({
        chooseFile: handleChooseFile,
    }))

    return (
        <div className={`bin-upload-wrapper${className ? ' ' + className : ''}`}>
            {mergedFileList.map((uploadFile, index) => (
                <div
                    key={uploadFile.key}
                    className='bin-upload'
                    style={style}
                >
                    {
                        isImageUrl(uploadFile) ? (
                            // 图片显示、图片预览
                            <div className='bin-upload-image' onClick={() => previewImage(uploadFile, index)}>
                                <Image src={uploadFile.url || uploadFile.tempUrl || ''} fit={fit} ></Image>
                            </div>
                        ) : (
                            // 文件显示
                            <div className='bin-upload-file'>
                                <div className='bin-upload-file-icon'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M80 35L55 35L55 10L80 35L80 90L20 90L20 10L55 10' stroke='#b5b7ba' strokeWidth='4'
                                            fill='none' strokeLinecap='round' strokeLinejoin='round' />
                                    </svg>
                                </div>
                                <div className='bin-upload-file-name'>{ uploadFile.name || uploadFile.url || uploadFile.tempUrl || '' }</div>
                            </div>
                        )
                    }

                    {
                        // 上传失败
                        uploadFile.status === 'failed' && (
                            <div className='bin-upload-error'>
                                <div className='bin-upload-error-icon'>
                                    <svg width='100%' height='100%' viewBox='0 0 100 75' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M3 60L3 3L97 3L97 72L3 72L3 57L20 40L45 60L75 30L97 60' stroke='white' strokeWidth='6'
                                            fill='none' strokeLinecap='round' strokeLinejoin='round' />
                                        <circle cx='25' cy='20' r='6' stroke='white' strokeWidth='5' fill='none' strokeLinecap='round' />
                                    </svg>
                                </div>
                                <div className='bin-upload-message'>{ uploadFile.message }</div>
                            </div>
                        )
                    }
                    {
                        // 上传中
                        uploadFile.status === 'uploading' && (
                            <div className='bin-upload-loading'>
                                {
                                    !uploadFile.percent && (
                                        <div className='bin-upload-loading-icon'>
                                            <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                                <defs>
                                                    <linearGradient id='blackGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                                                        <stop offset='0%' stopColor='white' stopOpacity='1' />
                                                        <stop offset='100%' stopColor='white' stopOpacity='0' />
                                                    </linearGradient>
                                                </defs>
                                                <circle className='bin-svg-rotate-spinner' cx='50' cy='50' r='36' stroke='url(#blackGradient)'
                                                    strokeWidth='8' fill='none' strokeDasharray='141.5 141.5' strokeLinecap='round' />
                                            </svg>
                                        </div>
                                    )
                                }
                                <div className='bin-upload-message'>{ uploadFile.message }</div>
                                {
                                    !!uploadFile.percent && (
                                        <div className='bin-upload-progress-wrapper'>
                                            <div className='bin-upload-progress' style={{ transform: `translateX(${Math.min(Math.max(Number(uploadFile.percent) - 100, -100), 0)}%)` }}></div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {/* 删除按钮（非上传状态或者显示设置为 true 时显示） */}
                    {
                        (() => {
                            // 默认展示删除按钮
                            let showDeleteButton = true
                            if (uploadFile.deletable === false) {
                                // 显式显示设置为 false，则不显示
                                showDeleteButton = false
                            } else if (uploadFile.status === 'uploading' && uploadFile.deletable !== true) {
                                // 正在上传时，需要显示设置删除按钮为 true 才显示
                                showDeleteButton = false
                            }
                            if (!showDeleteButton) return null
                            return (
                                <button
                                    className='bin-upload-delete-icon'
                                    onClick={() => onDelete(uploadFile, index)}
                                >
                                    <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                        <line x1='40' y1='30' x2='70' y2='60' stroke='white' strokeWidth='6' strokeLinecap='round' />
                                        <line x1='70' y1='30' x2='40' y2='60' stroke='white' strokeWidth='6' strokeLinecap='round' />
                                    </svg>
                                </button>
                            )
                        })()
                    }
                </div>
            ))}
            <div
                className='bin-upload'
                style={{ ...style, display: (mergedFileList.length >= maxCount ? 'none' : '') }}
            >
                {
                    children || (
                        <div
                            className='bin-upload-add-icon'
                            style={{ backgroundColor: dragActive ? '#e6f2ff' : '' }}
                        >
                            <svg width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                                <line x1='50' y1='35' x2='50' y2='65' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                                <line x1='35' y1='50' x2='65' y2='50' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                            </svg>
                        </div>
                    )
                }
                <input
                    ref={inputRef}
                    className='bin-upload-input'
                    type='file'
                    disabled={disabled}
                    accept={accept}
                    { ...((Object.prototype.hasOwnProperty.call(props, 'capture')) ? { capture: props.capture } : {}) }
                    { ...(multiple ? { multiple } : {}) }
                    onChange={(event) => onFileChange(event)}
                    onDragEnter={(event) => onFileDrag(event)}
                    onDragLeave={(event) => onFileDrag(event)}
                    onDragOver={(event) => onFileDrag(event)}
                    onDrop={(event) => onFileDrop(event)}
                ></input>
                {/*
                    onDragEnter: 拖拽进入
                    onDragLeave: 拖拽离开
                    onDragOver: 拖拽悬停时 不断 触发，必须阻止默认行为才能让drop事件生效
                    onDrop: 放置时触发，必须阻止默认行为才能阻止文件打开
                */}
            </div>
        </div>
    )
})
