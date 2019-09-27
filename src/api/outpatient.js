import {
    fetch,
    post,
    put,
    deleteHttp
    // put
} from './http'
/**
 * 门诊病历
 */
// 保存门诊病历
export const saveOutPatient = data => {
    return post('/outpatient/opdrcase', data)
}

// 获取病人病历明细和处方明细
export const getOpDetail = caseId => {
    return fetch(`/outpatient/opdrcase/detail/${caseId}`)
}

// 获取病人历史病历
export const getOpHistory = (patientId, data) => {
    return fetch(`/outpatient/opdrcase/page/${patientId}`, data)
}

// 获取病人信息
export const getPatientInfo = data => {
    const temp_data = {
        detailFlag: data.detailFlag
    }
    return fetch(
        `/outpatient/opdrcase/${data.patientId}/${data.registerId}`,
        temp_data
    )
}

// 完善患者个人信息
export const savePatientInfo = data => {
    return post('/outpatient/opdrcase/patient/info', data)
}

// 获取病人诊断
export const getDisagnose = id => {
    return fetch(`/outpatient/opdrcase/type/${id}`)
}

/**
 * 病历模板关联诊断信息
 */
//  根据主键获取一个 病历模板关联诊断信息
export const getCaseDiaTplById = id => {
    return fetch(`/outpatient/casediagnosistemplate/${id}`)
}

/**
 * 病历模板
 */
// 保存(新增 / 修改) 门诊病历模板
export const saveCaseTpl = data => {
    return post('/outpatient/casetemplate', data)
}

// 批量序号更新专用序号
export const updateCaseTplSn = data => {
    return put('/outpatient/casetemplate', data)
}

// 删除一个或多个 病历模板
export const deleteCaseTpl = templateId => {
    return deleteHttp(`/outpatient/casetemplate?templateId=${templateId}`)
}

// 根据主键获取一个 病历模板
export const getCaseTpl = data => {
    return fetch('/outpatient/casetemplate', data)
}

// 获取病历模板 list page
export const getCaseTplList = type => {
    return fetch(`/outpatient/casetemplate/list/${type}`)
}

/**
 * 处方审核
 */
// 处方审核确认
export const recipeCheck = data => {
    return put('/outpatient/recipecheck', data)
}

// // 获取处方详情
// export const getRecipeCheck = id =>{
//     return fetch(`/outpatient/recipecheck/${id}`)
// }

// 处方审核确认
export const getRecipeCheckList = data => {
    return post('/outpatient/recipecheck/page/medicine/2.0', data)
}

// 获取当前诊所的审方人员
export const getCheckUserList = () => {
    return fetch('/outpatient/recipecheck/checked/user')
}

/**
 * 审方明细表
 */

//  根据登记id 审方id 获取明细表
export const getRecipeDetailBycheckId = data => {
    return fetch(
        `/outpatient/recipecheckdetail/checked/${data.registerId}/${data.id}/${data.recipeId}`
    )
}

// 根据登记id  处方id 获取明细表
export const getRecipeDetailByrecipeId = data => {
    return fetch(
        `/outpatient/recipecheckdetail/unchecked/${data.registerId}/${
            data.recipeId
        }`
    )
}

// 根据处方id解锁处方
export const recipeClock = id => {
    return put(`/outpatient/recipecheckdetail/unlock?recipeId=${id}`)
}

/**
 * 门诊处方信息
 */
// 保存（新增/修改）门诊处方信息
export const saveOpdrrecipe = data => {
    return post('/outpatient/opdrrecipe', data)
}

// 处方取消审核
export const cancleOpdrrecipeAudit = id => {
    return put(`/outpatient/opdrrecipe?recipeId=${id}`)
}

// 获取处方信息，包括处方详细
export const getRecipeDetail = id => {
    return fetch(`/outpatient/opdrrecipe/${id}`)
}

// 删除门诊处方
export const deleteOpdrrecipe = id => {
    return deleteHttp(`/outpatient/opdrrecipe/${id}`)
}

// 获取收费项目/材料/非处方药
export const getChargeItem = name => {
    return fetch(`/outpatient/opdrrecipe/charge/item?name=${name}`)
}

// 获取患者未收费项目汇总
export const getUnchargeCount = data => {
    return post('/outpatient/opdrrecipe/charge/list', data)
}

// 获取患者未收费项目list
export const getUnchargeList = (patientId, resgisterId) => {
    return fetch(
        `outpatient/opdrrecipe/charge/list/${patientId}/${resgisterId}`
    )
}

// 删除门诊处方详细
export const deleteOpdrrecipeDetail = id => {
    return deleteHttp(`/outpatient/opdrrecipe/detail/${id}`)
}

// 获取门诊处方信息list
export const getOpdrrecipeList = data => {
    return fetch('outpatient/opdrrecipe/list', data)
}

// 获取门诊处方信息list（包含已退费处方）
export const getOpdrrecipeListMix = data => {
    return fetch('outpatient/opdrrecipe/list/mix', data)
}

// 设置药品自备
export const saveDrugProvide = data => {
    return post(`/outpatient/opdrrecipe/medicineType/${data.patientId}/${data.registerId}`, data.recipeDetailIds)
}

// 门诊处方申请退费
export const refundDrug = data => {
    return post('/outpatient/opdrrecipe/refund', data)
}

/**
 * 处方模板
 */
// 3.保存（新增/修改）处方模板&处方模板明细
export const saveOpdrrecipeTpl = data => {
    return post('/outpatient/opDrRecipeTemplate', data)
}

// 4.修改 处方模板（不修改处方模板明细）
export const modifyOpdrrecipeTpl = data => {
    return put('/outpatient/opDrRecipeTemplate', data)
}

// 2.根据主键获取一个 处方模板
export const getOpdrrecipeTpl = id => {
    return fetch(`/outpatient/opDrRecipeTemplate/${id}`)
}

// 5.删除一个 处方模板
export const deleteOpdrrecipeTpl = id => {
    return deleteHttp(`/outpatient/opDrRecipeTemplate/${id}`)
}

// 1. 获取处方模板 list page
export const getOpdrrecipeTplList = data => {
    return fetch('/outpatient/opDrRecipeTemplate/list', data)
}

// 7.从患者的历史用药中选择一条
export const medicalDetail = id => {
    return fetch(`/outpatient/opDrRecipeTemplate/recipeDetail/${id}`)
}

// 6.患者的历史用药
export const medicalHistory = data => {
    return fetch('/outpatient/opDrRecipeTemplate/recipeList', data)
}

/**
 * 随访信息
 */
// 获取随访列表page
export const getFollowPage = data => {
    return fetch('/outpatient/opfollowup/page', data)
}

// 获取患者（随访使用）
export const getPatientList = data => {
    return fetch('/outpatient/opfollowup/patient/page', data)
}

// 新增随访计划
export const addFollowPlan = data => {
    return post('/outpatient/opfollowup', data)
}

// 根据随访id获取随访信息
export const getFollowInfo = id => {
    return fetch(`/outpatient/opfollowup/${id}`)
}

// 删除随访信息
export const delFollow = id => {
    return deleteHttp('/outpatient/opfollowup', id)
}

// 根据病历id获取随访信息（医生门诊用）
export const getFollowInfoByCaseid = id => {
    return fetch(`/outpatient/opfollowup/caseId/${id}`)
}

// 完成随访
export const saveFollow = data => {
    return put('/outpatient/opfollowup', data)
}

// 随访导出
export const exportFollow = (data, header) => {
    return post('/outpatient/followupDownload/followup', data, header)
}

// 审方导出
export const exportAudit = (data, header) => {
    return post('/outpatient/recipeCheckDownload/medicine/2.0', data, header)
}

/**
 * 护士站
 */

// 病人列表
export const getNurseStationPatientList = data => {
    return fetch('/outpatient/nurse/station/patient/page', data)
}

export const getNewNurseStationPatientList = data => {
    return fetch('/outpatient/nurse/station/patient/new/page', data)
}

// 病人详情
export const getNurseStationPatientDetail = id => {
    return fetch(`/outpatient/nurse/station/inventory/${id}`)
}

// 04 门诊处方(10 / 20) / 治疗单（ 40） / 检查检验（ 30） page
export const getNurseStationthreeDetail = (id,status) => {
    return fetch(`/outpatient/nurse/station/three/function?execState=${status}&id=${id}`)
}

export const getNurseStationMedicalRecordDetail = id => {
    return fetch(`/outpatient/nurse/station/record/${id}`)
}

// 执行打印
export const getNurseStationMedicalRecordPrint = id => {
    return fetch(`/outpatient/nurse/station/three/print/${id}`)
}

// 确认执行
export const nurseStationExecute = data =>{
    return post('/outpatient/nurse/station/three/execute',data)
} 