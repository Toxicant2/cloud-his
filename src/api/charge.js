import { post, fetch } from './http'

/**
 * 收费管理
 */
// 获取收费单及收费明细、
export const getChargeDetail = chargeId => {
    return fetch(`/charge/charge/detail/${chargeId}`)
}
// 收费流水list
export const chargeList = data => {
    return fetch('/charge/charge/list', data)
}
// 收费
export const charge = data => {
    return post('/charge/charge/payment', data)
}

// 医保收费
export const chargeInsurance = data => {
    return post('/charge/charge/insurance/payment', data)
}

// 已收费page、已退费page
export const getChargeList = data => {
    return fetch('/charge/charge/payment/page', data)
}

// 快速收费|快速售药
export const chargeQuickPayment = data => {
    return post('/charge/charge/quick/payment', data)
}

// 退费
export const refundCost = data => {
    return post('/charge/charge/refund/2.0', data)
}

// 还账
export const repay = data => {
    return post('/charge/charge/repay', data)
}

/**
 * 还款记录表
 */

//  获取还款记录表
export const repayList = data => {
    return fetch('/charge/repayment/page', data)
}

// 获取还款明细
export const repaymentDetail = id => {
    return fetch(`/charge/repaymentDetail/repayment/${id}`)
}

/**
 * 交账
 */

// 交账记录列表
export const accountList = data => {
    return fetch('/charge/op/ce/account/page', data)
}

// 交账员列表
export const chargePeopleList = data => {
    return fetch('/charge/op/ce/account/charge/people', data)
}

// 交账详情
export const chargeListPage = data => {
    return fetch('/charge/op/ce/account/charge/page', data)
}

// 保存
export const saveAccount = data => {
    return post(
        `/charge/op/ce/account?startTime=${data.startTime}&endTime=${
            data.endTime
        }&totalAmount=${data.totalAmount}`
    )
}
