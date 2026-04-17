import { useState } from 'react'

import { Modal } from 'antd'

import message from '@/components/mobile/Message'
import Upload, { type UploadFile } from '@/components/mobile/Upload'
import BigFileUpload from './components/BigFileUpload'

import { useSyncState } from '@/hooks/core'

const FileUpload: React.FC = () => {

    const [uploadUrl, setUploadUrl] = useState('')

    const [fileList1, setFileList1] = useState<UploadFile[]>([
        {
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            status: 'done',
            message: '',
            percent: 0,
        },
    ])

    const [fileList2, setFileList2] = useState<UploadFile[]>([])

    const beforeRead = (files: File[]) => {
        /* for (const file of files) {
            if (file.size > 1024 * 1024) {
                message.info('请选择小于 1M 的图片')
                return false
            } else if (!['image/jpg', 'image/jpeg'].includes(file.type)) {
                message.info('请上传 jpg 格式图片')
                return false
            }
        }
        return true */
        return new Promise<boolean | File[]>((resolve, reject) => {
            const cloneList = []
            for (const file of files) {
                // 自动忽略大于 1M 的图片和非 jpg 格式图片
                if (file.size > 1024 * 1024) {
                    message.info('请选择小于 1M 的图片')
                } else if (!['image/jpg', 'image/jpeg'].includes(file.type)) {
                    message.info('请上传 jpg 格式图片')
                } else {
                    cloneList.push(file)
                }
            }
            resolve(cloneList)
        })
    }

    const afterRead = (files: UploadFile[], fileList: UploadFile[]) => {
        console.log('afterRead', files, fileList)
        files.forEach((uploadFile, index) => {
            setFileList2((prevList) => {
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

            setTimeout(() => {
                setFileList2((prevList) => {
                    return (prevList || []).map(item => {
                        if (item.key === uploadFile.key) {
                            return {
                                ...item,
                                status: 'done',
                            }
                        }
                        return item
                    })
                })
                message.success({
                    content: 'upload success!',
                })
            }, 3000)
        })
    }

    const beforeDelete = (file: UploadFile, index: number): Promise<boolean> => {
        console.log('beforeDelete', file)

        return new Promise((resolve, reject) => {
            Modal.confirm({
                title: '提示',
                content: `确认删除第${index + 1}个图片吗？`,
                onOk: () => {
                    resolve(true)
                },
            })
        })
    }

    return (
        <div className='w-full min-h-full p-6'>
            <div className='w-full my-8'>
                <div className='w-full text-[16px] leading-[24px]'>非受控模式</div>
                <div className='w-full mt-4'>
                    <Upload></Upload>
                </div>
            </div>

            <div className='w-full my-8'>
                <div className='w-full text-[16px] leading-[24px]'>受控模式</div>
                <div className='w-full mt-4'>
                    <Upload
                        fileList={fileList1}
                        onChange={setFileList1}
                    />
                </div>
            </div>

            <div className='w-full my-8'>
                <div className='w-full text-[16px] leading-[24px]'>允许上传的文件类型（图片） + 文件上传数量限制（3） + 支持多选文件 + 文件大小限制（1M）</div>
                <div className='w-full mt-4'>
                    <Upload
                        accept='image/*'
                        maxCount={3}
                        multiple
                        maxSize={1024 * 1024}
                    />
                </div>
            </div>

            <div className='w-full my-8'>
                <input
                    className='block w-full h-[36px] px-[8px] border border-[#ebedf0] outline-0 bg-[#fff] text-[16px]'
                    type='text'
                    placeholder='请输入你的上传地址'
                    value={uploadUrl}
                    onChange={event => setUploadUrl(event.target.value.trim())}
                />
            </div>

            <div className='w-full my-8'>
                <div className='w-full text-[16px] leading-[24px]'>读取文件前置处理 + 读取文件后置处理 + 删除文件前置处理</div>
                <div className='w-full mt-4'>
                    <Upload
                        fileList={fileList2}
                        onChange={setFileList2}
                        beforeRead={beforeRead}
                        afterRead={afterRead}
                        beforeDelete={beforeDelete}
                    />
                </div>
            </div>

            <div className='w-full my-8'>
                <div className='w-full text-[16px] leading-[24px]'>自动上传</div>
                <div className='w-full mt-4'>
                    <Upload
                        action={{
                            url: uploadUrl,
                        }}
                    />
                </div>
            </div>

            <BigFileUpload uploadUrl={uploadUrl}></BigFileUpload>
        </div>
    )
}

export default FileUpload
