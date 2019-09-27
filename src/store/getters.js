import { Local } from '@/utils/storage'

const getters = {
    sidebar: state => state.app.sidebar,
    language: state => state.app.language,
    device: state => state.app.device,

    visitedViews: state =>
        state.tagsView.visitedViews,

    cachedViews: state =>
        state.tagsView.cachedViews,

    user: state => state.user.user,
    token: state => state.user.token,
    // avatar: state => state.user.avatar,
    roles: state => state.user.roles,
    basic: state => state.user.basic,
    clinic: state => {
        return state.user.clinic
            ? state.user.clinic
            : Local.get('clinic')
    },

    clinicList: state => state.user.clinicList,
    // roleList: state => state.user.roleList,
    permission_routers: state =>
        state.user.routers,
    addRouters: state => state.user.addRouters,

    /* 数据字典*/
    dictData: state => {
        return Local.get('dictMap') ? Local.get('dictMap') : state.dict.dictMap
    },

    // 当前患者信息（使用前需更新患者信息）
    patient: state => state.patient.patient,
    attachmentList: state =>
        state.patient.attachmentList,
    register: state => state.patient.register,
    appointment: state =>
        state.patient.appointment
}

export default getters
