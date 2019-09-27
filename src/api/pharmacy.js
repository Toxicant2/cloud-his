import {
    fetch,
    post,
    put,
    deleteHttp
} from './http'

// 查询发票号
export const getStroageListByInvoice = data => {
    return fetch('/pharmacy/opskinventory/invoice/page', data)
}

// 出库入库列表
export const getStroageList = data => {
    return fetch(
        '/pharmacy/opskinventory/page',
        data
    )
}

// 出库入库详情
export const getStroageDetail = (id, data) => {
    return fetch(
        `/pharmacy/opskinventory/check/${id}`,
        data
    )
}

// 获取经销商list
export const getOpSkDealerList = data => {
    return fetch(
        '/pharmacy/opSkDealer/page',
        data
    )
}

export const getOpSkList = data => {
    return fetch('/pharmacy/opSkBatch/list')
}

// 入库保存修改
export const saveGetStroage = data => {
    return post(
        '/pharmacy/inventory/storage',
        data
    )
}

// 出库保存修改
export const saveOutStroage = data => {
    return post(
        '/pharmacy/inventory/delivery',
        data
    )
}

// 当前库存
export const nowStroage = data => {
    return fetch(
        '/pharmacy/opskinventory/now/page',
        data
    )
}

// 当前库存的合计
export const nowSroageCount = data => {
    return fetch('/pharmacy/opskinventory/count', data)
}

// 发票管理修改发票号
export const saveInventoryNumber = data => {
    return put('/pharmacy/opskinventory/invoice/num', data)
}

// 入库-下拉表格数据
export const getSelectData = data => {
    return fetch(
        '/pharmacy/opskinventory/drag/putStorageQuery',
        data
    )
}

// 出库-下拉表格数据
export const outSelectData = data => {
    return fetch(
        '/pharmacy/opskinventory/drag/OutPage',
        data
    )
}

// 入库、出库审核
export const getStroageAute = data => {
    return put(
        `/pharmacy/inventory/audit/${
            data.changeId
        }`
    )
}

// 入库保存并审核
export const saveAndAute = data => {
    return post(
        '/pharmacy/inventory/storage/audit',
        data
    )
}

// 出库保存并审核
export const saveOutAndAute = data => {
    return post(
        '/pharmacy/inventory/delivery/audit',
        data
    )
}

// 删除
export const deleteStroage = data => {
    return deleteHttp(
        `/pharmacy/opskinventory/delete/${
            data.id
        }`
    )
}

// 取消审核
export const cancleAudit = data => {
    return put(
        `/pharmacy/inventory/revoke/audit/${
            data.id
        }`
    )
}

/**
 * 药品盘点
 */
// 获取库存状态、
export const getStockStatus = () => {
    return fetch(
        '/pharmacy/opskinventory/stock/status'
    )
}

// 锁定库存
export const stockStatusOn = () => {
    return put(
        '/pharmacy/opskinventory/stock/status/on'
    )
}

// 取消锁定库存
export const stockStatusOff = () => {
    return put(
        '/pharmacy/opskinventory/stock/status/off'
    )
}

export const getListByInvoice = data => {
    return fetch('/pharmacy/opskinventory/sum', data)
}

// 盘点列表
export const checkList = data => {
    return fetch(
        '/pharmacy/check/list/page',
        data
    )
}

// 根据盘点表id查看详细列表
export const checkDetail = data => {
    return fetch('/pharmacy/check/detail', data)
}

// 新增盘点的药品列表
export const checkListOfNew = data => {
    return fetch('/pharmacy/check/new', data)
}

// 继续盘点的药品列表
export const checkListOfGo = data => {
    return fetch('/pharmacy/check/go', data)
}
// 保存/修改盘点单
export const saveCheck = data => {
    return post('/pharmacy/check', data)
}

// 删除盘点表
export const delCheck = id => {
    return deleteHttp(`/pharmacy/check/${id}`)
}

// 审核盘点
export const auditCheck = id => {
    return put(`/pharmacy/check/${id}`)
}

/**
 * 门诊发药
 */
// 待发药、已发药列表
export const dispensList = status => {
    return fetch(
        '/pharmacy/opSkDelivery/wait/page',
        status
    )
}

// 已退药列表
export const refundList = data => {
    return fetch(
        '/pharmacy/opSkDelivery/retired/drug/page',
        data
    )
}

// 待发药、已发药详情列表
export const dispensDetail = data => {
    return fetch(
        `/pharmacy/opSkDelivery/complete/page/${
            data.id
        }`
    )
}

// 发药动作
export const sendDispens = data => {
    return post(
        `/pharmacy/opSkDelivery/dispensing/${
            data.id
        }`
    )
}

// 退药动作
export const refundDispens = data => {
    return post('/pharmacy/opSkDelivery/refund', data)
}

/**
 * 经销商
 */

// 获得经销商列表
export const getOpSkDealer = data => {
    return fetch(
        '/pharmacy/opSkDealer/list/page',
        data
    )
}

// 新增经销商
export const addOpSkDealer = data => {
    return post(
        '/pharmacy/opSkDealer/insert',
        data
    )
}

// 删除经销商
export const deleteOpSkDelivery = data => {
    return deleteHttp(
        `/pharmacy/opSkDealer/delete/${data.id}`
    )
}
// 修改经销商
export const updateOpSkDealer = data => {
    return put(
        '/pharmacy/opSkDealer/update',
        data
    )
}
// 启用停用经销商
export const handleOpSkDealer = data => {
    return post(
        `/pharmacy/opSkDealer/isUse/${
            data.id
        }?isUse=${data.isUse}`
    )
}

// 修改库存设置
export const updateSetting = data => {
    return put(
        '/pharmacy/opskinventory/update',
        data
    )
}

// 首页库存预警
export const getWarning = data => {
    return fetch('/pharmacy/opskinventory/warning', data)
}

/**
 * 当前库存下载
 */
// 导出入库详情
export const exportStorageIn = (data, header) => {
    return post(
        `/pharmacy/opSkDownload/check/in`,
        data,
        header
    )
}

// 导出出库详情
export const exportStorageOut = (
    data,
    header
) => {
    return post(
        `/pharmacy/opSkDownload/check/out`,
        data,
        header
    )
}

// 导出当前库存
export const exportNowStorage = (
    data,
    header
) => {
    return post(
        '/pharmacy/opSkDownload/now',
        data,
        header
    )
}
