import {
    fetch,
    post,
    deleteHttp
} from './http'
/*
 * API Shareee Controller
 */
// 获取病人保险信息
export const getInsuranceInfo = (data) => {
    return fetch('/api/index/insurance', data)
}

// 获取转诊对接机构列表及相应机构下的科室列表
export const getOrganizationInfo = () => {
    return fetch('/api/opdrtransfer/referral/organization')
}

// 保存或更新转诊信息
export const saveTransferInfo = data => {
    return post('/api/opdrtransfer/transfer/save', data)
}

// 根据转诊id获取转诊记录详情
export const getTransferInfo = id => {
    return fetch(`/api/opdrtransfer/transfer/detail?id=${id}`)
}

// 转诊文件上传
export const uploadFile = data => {
    return post('/api/opdrtransfer/batch/upload', data)
}

// 获取文件域名前缀
export const getFilePrifix = () => {
    return fetch('/api/opdrtransfer/transfer/getFilePrifix')
}

// 转诊删除文件
export const delFile = (path, id) => {
    return deleteHttp('/api/opdrtransfer/del?filePath=' + encodeURIComponent(path) + '&fileId=' + id)
}

