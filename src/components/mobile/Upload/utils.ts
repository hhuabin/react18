/**
 * @Author: bin
 * @Date: 2025-08-19 17:20:05
 * @LastEditors: bin
 * @LastEditTime: 2025-10-29 09:47:46
 */
import type { UploadFile } from './Upload.d'

/**
 * @description 根根据文件判定是不是图片文件
 * @param { UploadFile } uploadFile
 * @returns { boolean }
 */
export const isImageFile = (uploadFile: UploadFile): boolean => {
    const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg|avif)/i
    if (uploadFile.file?.type) {
        return uploadFile.file.type.indexOf('image/') === 0
    }

    const url = uploadFile.url || uploadFile.tempUrl || ''
    const base64 = url.indexOf('data:image') === 0
    const isImageUrl = IMAGE_REGEXP.test(url)
    return base64 || isImageUrl
}

/**
 * @description 当文件是图片时，返回图片的 base64，非图片返回预览地址
 * @param { File } file 文件对象
 * @returns { string }
 */
export const readFileContent = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        if (file.type.indexOf('image/') === 0) {
            // 图片类型读取文件
            const reader = new FileReader()
            reader.onload = (event) => {
                resolve((event.target as FileReader).result as string)
            }
            reader.readAsDataURL(file)
        } else {
            // 非图片类型，创建临时 URL，需要使用URL.revokeObjectURL(url)去释放
            resolve(URL.createObjectURL(file))
        }
    })
}

/**
 * @description 文件列表更新函数
 * @param uploadFiles 文件
 * @param fileList 文件列表
 * @returns 更新后的文件列表
 */
export const updateFileList = (uploadFiles: UploadFile | UploadFile[], fileList: UploadFile[]) => {
    const nextFileList = [...fileList]

    const updateSingleFile = (uploadFile: UploadFile) => {
        const fileIndex = nextFileList.findIndex(({ key }) => key === uploadFile.key)
        if (fileIndex === -1) {
            nextFileList.push(uploadFile)
        } else {
            nextFileList[fileIndex] = uploadFile
        }
    }

    if (Array.isArray(uploadFiles)) {
        uploadFiles.forEach(updateSingleFile)
    } else {
        updateSingleFile(uploadFiles)
    }

    return nextFileList

}
