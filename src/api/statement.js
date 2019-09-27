import { fetch, post, deleteHttp } from './http'
/*
 * 费用报表下载
*/
// 4. 导出收费明细统计
export const exportChargeDetail = (data, header) => {
    return post('/statement/download/charge/detail', data, header)
}

// 2. 导出收费分类
export const exportChargeType = (data, header) => {
    return post('/statement/download/charge/type', data, header)
}

// 5. 导出用户类型收费汇总
export const exportUserChargeType = (data, header) => {
    return post('/statement/download/charge/userType', data, header)
}

// 3. 导出收费方式
export const exportChargeWay = (data, header) => {
    return post('/statement/download/charge/way', data, header)
}

// 1. 收费日报
export const exportDownloadDaily = (data, header) => {
    return post('/statement/download/daily', data, header)
}

/**
 * 费用统计报表
*/
// 收费明细统计报表
export const getDetail = data => {
    return fetch('/statement/charge/detail', data)
}

// 收费分类统计报表
export const getType = data => {
    return fetch('/statement/charge/type', data)
}

// 查看收费日统计报表详情
export const getUserDetail = data => {
    return fetch(`/statement/charge/user/detail/${data.chargeId}/${data.patientId}`)
}

// 用户类型收费汇总
export const getUserChargeTypeList = data => {
    return fetch('/statement/charge/userType', data)
}

// 收费方式统计报表
export const getWay = data => {
    return fetch('/statement/charge/way', data)
}

// 收费日统计报表
export const getDaily = data => {
    return fetch('/statement/daily', data)
}

/**
 * 帆软报表管理
 */

//  获取系统报表list
export const getReportList = data => {
    return fetch('/statement/report/page', data)
}

// 保存报表
export const saveReport = data => {
    return post('/statement/report', data)
}

// 获取单个系统报表详情
export const getReportDetail = id => {
    return fetch(`/statement/report/${id}`)
}

// 删除一个系统报表
export const delReport = ids => {
    return deleteHttp('/statement/report', ids)
}

// 启用停用一个系统报表
export const switchReport = id => {
    return post(`/statement/report/${id}`)
}

/**
 * 验证码预览
 */

//  报表预览
export const previewReport = id => {
    return fetch(`/statement/index/${id}`)
}

/*
* 药品耗材出入库、 库存报表
*/

// 1. 药品耗材出入库报表
export const getDrugGetData = data => {
    return fetch('/statement/query/count', data)
}

// 1.0. 药品耗材出入库报表
export const getDrugReportList = data => {
    return fetch('/statement/query/counts', data)
}

// 发药详细报表
export const getDrugOutData = data => {
    return fetch('/statement/query/drug/count', data)
}

// 5.0 药品耗材入库出库详情列表
export const getDrugGetDatas = data => {
    return fetch('/statement/query/change/entry/report', data)
}

// 3.0 库存
export const getDrugProjectList = data => {
    return fetch('/statement/query/drug/project/report', data)
}

// 6.0 库存月结报表
export const getDrugProjectMonthList = data => {
    return fetch('/statement/query/inventory/month/report', data)
}
/*
* 进销存报表下载
*/
// 3. 物资入库
// export const exportInGoods = (data, header) => {
//     return post('/statement/outInDownload/inWu', data, header)
// }

// 3.0. 物资入库
export const exportInGoods = (data, header) => {
    return post('/statement/outInDownload/inWus', data, header)
}

// 1. 药品入库
export const exportInDrug = (data, header) => {
    return post('/statement/outInDownload/inYao', data, header)
}

// 2. 药品出库
export const exportOutDrug = (data, header) => {
    return post('/statement/outInDownload/outYao', data, header)
}

// 4. 物资出库
// export const exportOutGoods = (data, header) => {
//     return post('/statement/outInDownload/outWu', data, header)
// }

// 4.0 . 物资出库
export const exportOutGoods = (data, header) => {
    return post('/statement/outInDownload/outWus', data, header)
}

// 6.0 库存统计
export const exportNowStorage = (data, header) => {
    return post('/statement/outInDownload/query/drug/project/report', data, header)
}

// 7.0 导出库存月结报表
export const exportMonthReport = (data, header) => {
    return post('/statement/outInDownload/query/monthReport', data, header)
}

// 5.0 药品明细
export const exportDrugDetailOut = (data, header) => {
    return post('/statement/outInDownload/queryDrugReport', data, header)
}
