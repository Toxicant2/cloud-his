import {
    fetch,
    post,
    put,
    deleteHttp
} from './http'
/*
 * API Shareee Controller
 */
// 获取科普二维码
export const getQrcodes = () => {
    return fetch('/arclinic/api/shareee/qrcodes')
}

/**
 * 患者预约
 */
// 患者预约信息查看接口
export const appointmentInfo = id => {
    return fetch(`/arclinic/appointment/${id}`)
}

// 新增预约
export const addReservate = data => {
    return post('/arclinic/appointment', data)
}

// 2.0 新增或修改患者预约
export const modifyAppointment = data => {
    return post('/arclinic/appointment/2.0', data)
}

// 取消预约
export const cancelAppoint = (appointId, reason) => {
    return deleteHttp(
        `/arclinic/appointment/cancel/${appointId}?reason=${reason}`
    )
}

// 日预约患者分布
export const appointmentDaily = data => {
    return fetch(`/arclinic/appointment/daily`, data)
}

// 今日预约 page
export const getDailyAppointList = data => {
    return fetch('/arclinic/appointment/daily/page', data)
}

// 获得预约患者列表
export const getAppointmentList = data => {
    return fetch(`/arclinic/appointment/list`, data)
}

// 周预约患者分布
export const appointmentWeekLy = data => {
    return fetch(`/arclinic/appointment/weekly`, data)
}

/**
 * 医生排班
 */
// 保存医生排班信息
export const saveWorkplanList = data => {
    return post(
        `/arclinic/workplan?date=${data.date}&departId=${data.departId}`,
        data.plans
    )
}

// 引用上一周
export const quotePreWeek = data => {
    return fetch('/arclinic/workplan/clone', data)
}

// 获得排班计划列表
export const getworkplanList = data => {
    return fetch('/arclinic/workplan/list', data)
}

/**
 * 门诊登记之排队叫号
 */
// 优先就诊
export const earlyQueue = data => {
    return post('/arclinic/register/queue', data)
}

// 重新叫号
export const callSn = id => {
    return post(`/arclinic/register/queue/call/sort?queueId=${id}`)
}

// 下一位
export const getNextSort = () => {
    return fetch('/arclinic/register/queue/finish/sort')
}

// 过号
export const saveMissSort = () => {
    return fetch('/arclinic/register/queue/miss/sort')
}

// 当前呼叫病人的基本信息及统计
export const getNowMessage = () => {
    return fetch('/arclinic/register/queue/now/message')
}

// 接诊时排队状态改为进行中
export const editQueueStatus = id => {
    return post(`/arclinic/register/queue/status/${id}`)
}

//  今日病人page(排队叫号)
export const getQueueList = data => {
    return fetch('/arclinic/register/queue/today/page', data)
}

/**
 * 患者信息维护接口
 */

// 新增患者
export const addPatient = data => {
    return post('arclinic/patient', data)
}

// 患者信息修改
export const updatePatient = data => {
    return put('arclinic/patient', data)
}

// 2.0 新增或修改患者
export const modifyPatient = data => {
    return post('/arclinic/patient/2.0', data)
}

// 患者信息显示
export const patientInfo = id => {
    return fetch(`/arclinic/patient/${id}`)
}

// 获取患者详细信息-NEW
export const getPatientDetail = patientId => {
    return fetch(`/arclinic/patient/detail/${patientId}`)
}

// 根据姓名模糊查询患者信息
export const selectByName = name => {
    return fetch(`/arclinic/patient/fuzzy?name=${name}`)
}
// 患者page
export const patientPage = data => {
    return post('/arclinic/patient/page', data)
}

// 给患者添加亲友
export const addFamily = data => {
    return post('/arclinic/patient/family', data)
}

// 获取患者亲友团
export const getFamilyList = id => {
    return fetch(`/arclinic/patient/${id}/family`)
}

// 删除患者亲友团
export const delFamily = id => {
    return deleteHttp(`/arclinic/patient/family/${id}`)
}

/**
 * 门诊登记接口
 */
// 保存、更新门诊登记信息
export const modifyRegister = data => {
    return post('/arclinic/register', data)
}

// 根据预约Id获取登记信息 -- 预约
export const getPatientByAppointId = appointId => {
    return fetch(`/arclinic/register/${appointId}`)
}

// 2.0 新增修改患者登记
export const modifyRegister2 = data => {
    return post('/arclinic/register/2.0', data)
}

// 取消挂号
export const cancelRegister = regId => {
    return post(`/arclinic/register/cancel/${regId}`)
}

// 作废收费单
export const cancelCharge = data => {
    return put(`/arclinic/register/cancellation/charge/${data.regId}?isCancellationCharge=${data.isCancelCharge}`)
}

// 生成门诊号
export const generateOpNum = () => {
    return fetch('/arclinic/register/generate')
}

// 获取历史记录
export const getHistoryPatient = data => {
    return post('/arclinic/register/history/page', data)
}

// 根据登记Id获取门诊登记信息 -- 登记
export const getPatientByRegId = regId => {
    return fetch(`/arclinic/register/info/${regId}`)
}

// 首页的今日统计
export const getNowCount = () => {
    return fetch('/arclinic/register/now/count')
}

// 线下预约用户点击接诊时，需要调用接口通知华西同步数据
export const offlineBespeakHX = regId => {
    return put(`/arclinic/register/offlineBespeakHX/${regId}`)
}

// 首页诊所运营趋势（就诊人数、实收金额、现金收入）
export const getTendency = data => {
    return fetch('/arclinic/register/operation/tendency', data)
}

// 登记记录 list page
export const getRegisterList = data => {
    return fetch('/arclinic/register/page', data)
}

// 根据病人id获取最近一次就诊记录
export const getLastRecord = id => {
    return fetch(`/arclinic/register/patReg/${id}`)
}

// 设置回诊状态
export const setRevisitingStatus = data => {
    return put(
        `/arclinic/register/revisiting/status/${
            data.registerId
        }?revisitingStatus=${data.revisitingStatus}`
    )
}

// 改变患者登记状态
export const updatePatientStatus = data => {
    return put(
        `/arclinic/register/status/${data.registerId}?caseNum=${
            data.caseNum ? data.caseNum : ''
        }&status=${data.status}`
    )
}

// 获取今日病人
export const getTodayPatient = data => {
    return fetch('/arclinic/register/today/page', data)
}

// 根据排队序号获取上一位下一位病人登记信息
export const getNextLastPatient = data => {
    return fetch('/arclinic/register/todaySn', data)
}

// 选择医生
export const saveDocData = data => {
    return put(
        `/arclinic/register/triage/${data.registerId}?doctorId=${
            data.doctorId
        }&name=${data.name}`
    )
}

// 已分诊|未分诊
export const triageData = (data, type) => {
    if (type === '1') {
        // 已分诊
        return fetch('/arclinic/register/triaged/page', data)
    } else {
        // 未分诊
        return fetch('/arclinic/register/untriage/page', data)
    }
}

// 待收费page
export const unCharge = data => {
    return post('/arclinic/register/uncharge', data)
}
// 根据姓名模糊查询患者信息
export const likeNameGetInfo = data => {
    return fetch(`/arclinic/patient/fuzzy?name=${data.name}`)
}

/**
 * 体温监测
 */

// 获取患者测温数据列表
export const getTempinfoList = data => {
    return fetch(`/arclinic/tempinfo/list`, data)
}

// 干预处理
export const tempintervention = data => {
    return post(`/arclinic/api/tempintervention`, data)
}

// 干预记录list
export const tempinterventionList = data => {
    return fetch(`/arclinic/api/tempintervention/page`, data)
}

// 获取实时数据
export const tempinfo = data => {
    return fetch(`/arclinic/tempinfo/info`, data)
}

// 获取温度预警设置
export const tempsettingList = data => {
    return fetch(`/arclinic/tempsetting/list`, data)
}

// 保存温度预警设置
export const saveTempsetting = data => {
    return post(`/arclinic/tempsetting/update`, data)
}

// 获取体温信息
export const getTempinfo = data => {
    return fetch(`/arclinic/tempinfo/${data.id}?effectiveFlag=${data.effectiveFlag}`)
}

// 获取患者测温数据列表
export const reportList = data => {
    return fetch(`/arclinic/tempinfo/report/list/${data.id}`)
}

// 获取患者信息
export const tempPatientInfo = data => {
    return fetch(`/arclinic/patient/temp/user`, data)
}

// 获取体温事件记录
export const getTempevent = data => {
    return fetch(`/arclinic/tempevent/list/${data.id}`)
}

// 获取设备管理list
export const getTemptoolmanageList = data => {
    return fetch(`/arclinic/temptoolmanage/list`, data)
}

// 获取设备统计信息
export const getStatistics = data => {
    return fetch(`/arclinic/temptoolmanage/statistics`, data)
}

// 获取设备详情
export const getTemptoolmanageDetail = data => {
    return fetch(`/arclinic/temptoolmanage/${data.id}`)
}

/**
 * 体温管理-数据统计
 */

// 体温累计数据接口
export const getTempstatisticsTotal = data => {
    return fetch(`/arclinic/tempstatistics/total`)
}

// 测温人数 && 预警数据 接口
export const getTempstatisticsLevel = data => {
    return fetch(`/arclinic/tempstatistics/level`)
}

// 患者数据统计接口
export const getTempstatisticsPatient = data => {
    return fetch(`/arclinic/tempstatistics/patient`)
}

// 监测趋势
export const getTempstatisticsTrend = data => {
    return fetch(`/arclinic/tempstatistics/trend`, data)
}

// 使用频率统计
export const getTempstatisticsFrequency = data => {
    return fetch(`/arclinic/tempstatistics/frequency`, data)
}

// 设备趋势
export const getTempstatisticsTool = data => {
    return fetch(`/arclinic/tempstatistics/tool`, data)
}

// 监测月报
export const getTempstatisticsMonthly = data => {
    return fetch(`/arclinic/tempstatistics/monthly`, data)
}

// 患者类别
export const getTempstatisticsType = data => {
    return fetch(`/arclinic/tempstatistics/type`, data)
}
