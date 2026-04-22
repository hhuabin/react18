import { useEffect, useState, useRef } from 'react'

import Upload, { type UploadFile } from '@/components/Upload'

import { clamp } from '@/utils/functionUtils/mathUtils'
import {
    multiThreadCreateFileChunks,
    singleThreadCreateFileChunks,
    mergeFileChunks,
    uploadFileChunks,
    type FileChunk,
} from '@/utils/bigFileUploadUtils'

type Props = {
    uploadUrl: string;
}

const BigFileUpload: React.FC<Props> = (props) => {


    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [sliceImgFile, setSliceImgFile] = useState<string>('#')

    const progressList = useRef<number[][]>([])
    const controllerList = useRef<(AbortController | undefined)[]>([])

    // 上传状态处理
    const onProgress = (
        progress: {
            percent: number,
            loaded: number,
            total: number
        },
        uploadFile: UploadFile,
        fileChunk: FileChunk,
    ) => {
        // progress.total 和 fileChunk 的大小并不一定都是一致的，特别是 fileChunk 经过数据编码之后
        setFileList((prevFileList) => (prevFileList || []).map((item, index) => {
            if (item.key === uploadFile.key) {
                if (!progressList.current[index]) progressList.current[index] = []

                progressList.current[index][fileChunk.index] = progress.loaded
                const totalProgress = progressList.current[index].reduce((acc, cur) => acc + cur, 0)

                item.percent = clamp(totalProgress / fileChunk.fileSize * 100, 0, 100)
                item.message = item.percent.toFixed(2) + ' %'
            }
            return item
        }))
    }

    const afterRead = (files: UploadFile[]) => {
        const controllerLength = controllerList.current.length
        const newController = files.map(() => new AbortController())
        controllerList.current = [...controllerList.current, ...newController]

        for (let index = 0; index < files.length; index++) {
            const uploadFile = files[index]
            if (!uploadFile.file) return

            setFileList((prevList) => {
                return (prevList || []).map(item => {
                    if (item.key === uploadFile.key) {
                        return {
                            ...item,
                            status: 'uploading',
                        }
                    }
                    return item
                })
            })

            // 1. 对文件进行分片
            multiThreadCreateFileChunks(uploadFile.file, {
                chunkSize: 1024 * 1024,
            })
            .then(fileChunks => {
                // 2. 上传分片
                const result = mergeFileChunks(fileChunks)
                if (uploadFile.file!.type.includes('image')) {
                    previewSliceImage(result)
                }
                return uploadFileChunks(fileChunks, {
                    url: props.uploadUrl,
                    signal: controllerList.current[controllerLength + index]?.signal,
                    onProgress: (percent, loaded, total, fileChunk) => {
                        onProgress(
                            {
                                percent,
                                loaded,
                                total,
                            },
                            uploadFile,
                            fileChunk,
                        )
                    },
                    onSuccess: (response) => {},
                    onError: (error, fileChunk) => {
                        // console.error(`分片${fileChunk.index + 1}上传失败`)
                    },
                }, 5, 3)
            })
            .then(res => {
                // 3. 单个文件上传成功
                setFileList((prevList) => (prevList || []).map(item => {
                    if (item.key === uploadFile.key) {
                        return {
                            ...item,
                            status: 'done',
                            response: res,
                        }
                    }
                    return item
                }))
            })
            .catch(error => {
                /**
                 * 只要有一个分片上传失败即失败，阻止其余的分片继续上传
                 * 若是不想使用 controller 取消上传，或者需要做 重试请求并且进度不回退
                 * 提供一种想法，使用 Ref 去存储所有的进度，保证进度大于 Ref 的值，再修改。即可保证进度不回退
                 * * 开发中若不想麻烦，直接将 并发任务上传 的请求重试次数设置成 0 即可 *
                 */
                controllerList.current[controllerLength + index]?.abort()
                console.error(error)
                setFileList((prevList) => (prevList || []).map(item => {
                    if (item.key === uploadFile.key) {
                        return {
                            ...item,
                            status: 'failed',
                            message: '上传失败',
                            response: error,
                        }
                    }
                    return item
                }))
            })
        }
    }

    const previewSliceImage = (blob: Blob) => {
        if (!blob) return null
        const reader = new FileReader()

        reader.onload = (e) => {
            setSliceImgFile(e.target?.result as string)
        }

        reader.onerror = () => {
            console.error('图片读取失败')
        }

        reader.readAsDataURL(blob)
    }

    const beforeDelete = (file: UploadFile, index: number) => {
        // 停止上传，删除 controller
        controllerList.current[index]?.abort()
        controllerList.current.splice(index, 1)

        // 删除 progressList
        progressList.current.splice(index, 1)
    }

    return (
        <>
            <div className='flex w-full my-8'>
                <div className=''>
                    <div className='w-full text-[16px] leading-[24px]'>大文件上传</div>
                    <div className='w-full mt-4'>
                        <Upload
                            fileList={fileList}
                            onChange={setFileList}
                            afterRead={afterRead}
                            beforeDelete={beforeDelete}
                        />
                    </div>
                </div>

                <div className='ml-4'>
                    <div className='w-full text-[16px] leading-[24px]'>切片后回显的图片：</div>
                    <div className='w-full mt-4'>
                        <div className='w-[80px] h-[80px] rounded-sm border border-[var(--border-default)] [box-shadow:var(--shadow-sm)]'>
                            <img src={sliceImgFile} className='block w-full h-full object-contain' alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BigFileUpload
