import { getToken, setToken, removeToken } from '@/utils/auth'
import { Local } from '@/utils/storage'
import router from '@/router'
import { userLogin, getUser } from '@/api/upms'

import { constantRouterMap } from '@/router'

import { formatRouter, formatClinic } from '@/utils'

const user = {
    state: {
        routers: constantRouterMap,
        addRouters: [],
        user: {},
        clinic: {},
        clinicList: [],
        token: getToken(),
        roles: [],
        // roleList: [],
        basic: {}
    },

    mutations: {
        SET_ROUTERS: (state, routers) => {
            state.addRouters = routers
            state.routers = constantRouterMap.concat(routers)
        },
        SET_CLINICLIST: (state, clinicList) => {
            state.clinicList = clinicList
        },
        SET_USER: (state, user) => {
            state.user = user
        },
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
        },
        SET_BASIC: (state, basic) => {
            state.basic = basic
        },
        SET_CLINIC: (state, clinic) => {
            Local.set('clinic', clinic)
            state.clinic = clinic
        },
        UPDATE_CLINIC: (state, list) => {
            state.clinic = formatClinic(state.clinic, list)
        }
        // SET_ROLELIST: (state, roleList) => {
        //     state.roleList = roleList
        // }
    },

    actions: {
        // 用户名登录
        LoginByUsername({ commit }, userInfo) {
            return new Promise((resolve, reject) => {
                userLogin(userInfo)
                    .then(res => {
                        if (res.access_token) {
                            commit('SET_TOKEN', res.access_token)
                            setToken(res.access_token)
                            resolve()
                        }
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },

        // 获取用户信息
        GetUserInfo({ commit }) {
            return new Promise((resolve, reject) => {
                getUser()
                    .then(res => {
                        // QR1992dtkssj@!
                        // QWer1234_
                        if (res.STATUS === '1' || res.STATUS === '8' || res.STATUS === '99') {
                            const data = res.ITEMS
                            const asyncRouterMap = formatRouter(data.menuList)
                            commit('SET_USER', data.userDetail)
                            window.sessionStorage.setItem(
                                'user',
                                JSON.stringify(data.userDetail)
                            )
                            commit('SET_ROLES', ['admin'])
                            commit('SET_BASIC', data.appBasicInfo)
                            commit('SET_CLINIC', formatClinic(data.clinic))
                            // commit('SET_ROLELIST', data.roleList)
                            commit('SET_ROUTERS', asyncRouterMap)
                            resolve(res)
                        }
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },

        // 选择诊所后直接登录
        directorLogin({ commit }, data) {
            return new Promise(resolve => {
                const asyncRouterMap = formatRouter(data.menuList)
                commit('SET_USER', data.userDetail)
                window.sessionStorage.setItem(
                    'user',
                    JSON.stringify(data.userDetail)
                )
                commit('SET_BASIC', data.appBasicInfo)
                commit('SET_ROLES', ['admin'])
                commit('SET_CLINIC', formatClinic(data.clinic))
                commit('SET_ROUTERS', asyncRouterMap)

                // 刷新页面，重置路由
                router.addRoutes(asyncRouterMap)
                resolve(asyncRouterMap[0])
            })
        },

        // 获取用户可选诊所
        GetUserClinic({ commit }, params) {
            return new Promise(resolve => {
                commit('SET_CLINICLIST', params)
                resolve()
            })
        },

        // 设置诊所参数
        updateClinic({ commit }, list) {
            commit('UPDATE_CLINIC', list)
        },

        // 前端 退出
        LogOut({ commit }) {
            return new Promise(resolve => {
                commit('SET_TOKEN', '')
                commit('SET_ROLES', [])
                commit('SET_CLINICLIST', [])
                removeToken()
                resolve()
            })
        }
    }
}

export default user
