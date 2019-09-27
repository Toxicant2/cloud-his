import {
    post,
    deleteHttp,
    fetch
} from './http'

// 上传文件
export const uploadFile = data => {
    return post('/upload/file/batch/upload', data)
}

// 删除文件
export const deleteAttach = (path, id) => {
    return deleteHttp('/upload/file/del?filePath=' + encodeURIComponent(path) + '&fileId=' + id)
}

// 批量下载文件
export const downloadZip = (ids, header) => {
    return post('/upload/file/download', header, ids)
}

/**
 * 帮助中心
 */
// 获取列表
export const getHelpList = data => {
    return fetch('/upload/help', data)
}

// 保存
export const saveHelp = data => {
    return post('/upload/help', data)
}
