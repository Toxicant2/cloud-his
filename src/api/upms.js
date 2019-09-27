import {
    fetch,
    post,
    put,
    deleteHttp
} from './http'
// 获取服务器时间
export const getServerDate = () => {
    return fetch('/upms/index/currentDate')
}
/**
 * 菜单
 */
// 菜单新增
export const addMenu = data => {
    return post('/upms/menu', data)
}

export const testAA = data => {
    return post('/upms/ws', data)
}

// 角色修改
export const updateMenu = data => {
    return put('/upms/menu', data)
}

// 获取角色列表
export const getMenuList = () => {
    return fetch('/upms/menu/list')
}

// 角色删除
export const deleteMenu = menuId => {
    return deleteHttp(`/upms/menu/${menuId}`)
}
/**
 * 角色
 */
// 角色新增
export const addRole = data => {
    return post('/upms/role', data)
}

// 角色修改
export const updateRole = data => {
    return put('/upms/role', data)
}

// 获取角色列表
export const getRoleList = data => {
    return fetch('/upms/role/list', data)
}

// 角色删除
export const deleteRole = roleId => {
    return deleteHttp(`/upms/role/${roleId}`)
}

/**
 * 职工表
 */
// 用户修改
export const updateStaff = data => {
    return put('upms/staff', data)
}

// 用户审核 0-默认未审核 1-审核通过 2-审核驳回
export const auditStaff = data => {
    return post('/upms/staff/check', data)
}

// 完善用户具体信息
// export const regStaff = data => {
//     return post('/upms/staff/detail', data)
// }

// 获取个人详细信息
export const getStaffDetail = id => {
    return fetch(
        `/upms/staff/doctor/detail?staffId=${id}`
    )
}

// 修改用户启用状态
export const updateUserStatus = id => {
    return post(
        `/upms/staff/isuse/switch/${id}`
    )
}

// 获取所有用户列表
export const getStaffList = data => {
    return fetch('/upms/staff/page', data)
}

// 用户注册
export const regStaff = data => {
    return post('upms/staff/register', data)
}

/**
 * 常见问题答疑
 */
// 获取常见问题答疑list
export const getPage = data => {
    return fetch('upms/sysanswerquestions/page', data)
}

// 保存常见问题答疑
export const saveQuestion = data => {
    return post('/upms/sysanswerquestions/save', data)
}

// 保存常见问题类型
export const saveType = data => {
    return post('upms/sysanswerquestions/saveType', data)
}

// 获取常见问题类型list
export const getTypeList = data => {
    return fetch('upms/sysanswerquestions/type', data)
}

/**
 * 用户
 */
// 用户登录
export const userLogin = data => {
    return post(
        `/auth/oauth/token?grant_type=password&scope=server&username=${
            data.username
        }&password=${data.password}`
    )
}

// 解锁用户
export const unlockUser = phone => {
    return put(`/upms/user/${phone}/unlock`)
}

// 检查用户基本信息
export const checkUserBasic = data => {
    return post('/upms/user/basic/check', data)
}

// 获取登录人信息
export const getUser = () => {
    return fetch('/upms/user')
}

// 重置密码
export const resetDptUserPsw = id => {
    return post(`/upms/user/${id}/resetPwd`)
}

// 注册用户基本信息
// export const regUserBasic = data => {
//     return post(`/upms/user/basic`, data)
// }
// 修改手机号
export const updatePhone = (phone, userId) => {
    return put(`/upms/user/phone?phone=${phone}&userId=${userId}`)
}

// 修改密码
export const updatePassword = data => {
    return post(`/upms/user/pwd`, data)
}

/**
 * 系统通知
 */
export const getSysInfosList = data => {
    return fetch(
        '/upms/sysnotification/infos',
        data
    )
}

// 发布通知
export const saveSysnotification = data => {
    return post(
        '/upms/sysnotification/release',
        data
    )
}

// 撤销通知
export const cancleSysnotification = data => {
    return post(
        `/upms/sysnotification/revocation?id=${data.id}`
    )
}

// 点击阅读消息操作
export const clickSysnotification = data => {
    return deleteHttp(
        `/upms/sysnotification/click?infoId=${data.id}`
    )
}

// 设置/切换当前登录人的当前诊所
export const setUserClinic = id => {
    return fetch(`/upms/user/switch/org/${id}`)
}

/**
 * 人员审核记录
 */

//  获取人员审核记录
export const getCheckLog = data => {
    return fetch('/upms/user/check/log/page', data)
}

/**
日志表
 */
// 日志统计
export const getLogCensus = data => {
    return fetch('/upms/sys/log/census', data)
}
//  导出日志
export const exportLog = (data, header) => {
    return post('/upms/sys/log/out/page', data, header)
}

// 日志查询
export const getLogPage = data => {
    return fetch('/upms/sys/log/page', data)
}
