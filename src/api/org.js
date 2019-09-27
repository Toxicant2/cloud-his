import {
    fetch,
    post,
    put,
    deleteHttp
} from './http'
/**
 * 诊所
 */
// 更新诊所
export const updateClinic = data => {
    return put('/org/orgclinic', data)
}

// 审核诊所
export const auditClinic = data => {
    return post('/org/orgclinic/check', data)
}

// 获取诊所详细信息
export const getNowClinicDetail = () => {
    return fetch('/org/orgclinic/detail')
}

// 切换诊所启用状态
export const updateClinicStatus = clinicId => {
    return post(
        `/org/orgclinic/isuse/switch/${clinicId}`
    )
}

// 注册诊所
export const regClinic = data => {
    return post('/org/orgclinic/register', data)
}

// // 获取诊所list page
export const getClinicList = data => {
    return fetch('/org/orgclinic/page', data)
}

/**
 * 诊所科室表
 */
// 删除一个诊所科室
export const deleteDepartment = data => {
    return deleteHttp(
        '/org/orgclinicdepart',
        data
    )
}

// 新增一个诊所科室
export const addDepartment = data => {
    return post('/org/orgclinicdepart', data)
}

// 修改一个诊所科室
export const updateDepartment = data => {
    return put('/org/orgclinicdepart', data)
}

// 获取当前诊所科室 list options
export const getDepartmentOpts = data => {
    return fetch(
        '/org/orgclinicdepart/option',
        data
    )
}

// 获取当前诊所科室 list page
export const getDepartmentList = data => {
    return fetch(
        '/org/orgclinicdepart/page',
        data
    )
}

// 修改科室状态
export const updateDepartmentStatus = id => {
    return put(
        `/org/orgclinicdepart/switch/${id}`
    )
}

/**
 * 诊所科室人员表
 */
// 新增一个诊所科室人员
export const addDepartmentUser = data => {
    return post(
        '/org/orgreldeparttoclinicstaff',
        data
    )
}

// 修改一个诊所科室人员
export const updateDepartmentUser = data => {
    return put(
        '/org/orgreldeparttoclinicstaff',
        data
    )
}

// 删除一个诊所科室人员
export const deleteDepartmentUser = data => {
    return deleteHttp(
        '/org/orgreldeparttoclinicstaff',
        data
    )
}

// 切换诊所部门人员的启用状态
export const updateDepartmentUserStatus = id => {
    return post(
        `/org/orgreldeparttoclinicstaff/isuse/switch/${id}`
    )
}

// 获取当前诊所科室人员 list page
export const getOrgClinicStaffList = data => {
    return fetch(
        '/org/orgreldeparttoclinicstaff/page',
        data
    )
}

// 获取当前诊所科室医生
export const getOrgClinicPerson = data => {
    return fetch(
        '/org/orgreldeparttoclinicstaff/option',
        data
    )
}

/**
 * 机构维护
 */

//  新增/注册
export const addOrg = data => {
    return post('/org/org/register', data)
}

//  修改
export const editOrg = data => {
    return put('/org/org', data)
}

// 清空诊所缓存
export const clearOrgCache = orgId => {
    return put(`/org/org/${orgId}/cache/clear`)
}

// 机构基本信息
export const getOrgInfo = id => {
    return fetch(`/org/org/${id}`)
}

// 运营中心list
export const getAreaOrgOpts = () => {
    return fetch('/org/org/area/option/list')
}

// 审核
export const checkOrg = data => {
    return put('/org/org/check', data)
}

// 获取当前登录人的可选诊所
export const getUserClinic = () => {
    return fetch('/org/org/enable/list')
}

// 配置诊所工作时间
export const setOpenTime = data => {
    return put('/org/org/opentime', data)
}

// 机构list(下拉框使用)
export const getOrgOpts = data => {
    return fetch('/org/org/option/list', data)
}

// 设置/切换当前登录人的当前诊所
export const setUserClinic = id => {
    return put(`/org/org/switch?clinicId=${id}`)
}

// 启用停用
export const switchOrg = id => {
    return put(`/org/org/switch/status/${id}`)
}

// 机构list(左边的书，只能获取本级及其子级)
export const getOrgTreeList = () => {
    return fetch('/org/org/tree')
}

// 第三方机构代码维护
export const updateThird = data => {
    return put(`/org/org/${data.orgId}/field?field=${data.field}&value=${data.value}`)
}
