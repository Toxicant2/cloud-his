import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie
import { setUserClinic } from '@/api/upms'
// NProgress Configuration
NProgress.configure({
    showSpinner: false
})

const whiteList = ['/login', '/register', '/home', '/temperatureData'] // no redirect whitelist

router.beforeEach((to, from, next) => {
    NProgress.start() // start progress bar
    if (getToken()) {
        // determine if there has token
        /* has token*/
        if (to.path === '/login') {
            store.dispatch('LogOut')
            next()
            NProgress.done()
        } else {
            if (store.getters.roles.length === 0) {
                // 判断当前用户是否已拉取完user_info信息
                store
                    .dispatch('GetUserInfo')
                    .then(res => {
                        if (res.STATUS === '8') {
                            Message.error(res.MESSAGE)
                            next({
                                path: '/audit/modify'
                            })
                        } else if (res.STATUS === '99') {
                            Message.error(res.MESSAGE)
                            next({
                                path: '/audit/modify'
                            })
                        } else {
                            if (
                                store.getters.roles &&
                                store.getters.roles.length > 0
                            ) {
                                // 当前有无已登录诊所
                                if (store.getters.clinic.orgId) {
                                    if (store.getters.addRouters.length > 0) {
                                        const routers = store.getters.addRouters
                                        router.addRoutes(routers) // 动态添加可访问路由表
                                        if (from.path === '/login') {
                                            next({
                                                path:
                                                    routers[0].path ||
                                                    routers[0].redirect,
                                                replace: true
                                            })
                                        } else {
                                            next({
                                                ...to,
                                                replace: true
                                            })
                                        }
                                    } else {
                                        store.dispatch('LogOut').then(() => {
                                            Message.error(
                                                '该诊所暂无可选菜单，请联系系统管理员'
                                            )
                                            NProgress.done()
                                        })
                                    }
                                } else {
                                    // 非平台管理员，判断诊所
                                    if (from.path === '/login') {
                                        if (
                                            !store.getters.clinicList ||
                                            store.getters.clinicList.length ===
                                                0
                                        ) {
                                            // 无诊所
                                            store
                                                .dispatch('LogOut')
                                                .then(() => {
                                                    Message.error(
                                                        '暂无诊所可选，请联系系统管理员'
                                                    )
                                                    NProgress.done()
                                                })
                                        } else if (
                                            store.getters.clinicList.length ===
                                            1
                                        ) {
                                            if (
                                                store.getters.addRouters
                                                    .length > 0
                                            ) {
                                                // 一个诊所
                                                setUserClinic(
                                                    store.getters.clinicList[0]
                                                        .id
                                                ).then(res => {
                                                    if (res.STATUS === '1') {
                                                        const d = res.ITEMS
                                                        if (d) {
                                                            store.dispatch(
                                                                'directorLogin',
                                                                d
                                                            )
                                                            const routers =
                                                                store.getters
                                                                    .addRouters

                                                            router.addRoutes(
                                                                routers
                                                            ) // 动态添加可访问路由表
                                                            next({
                                                                path:
                                                                    routers[0]
                                                                        .path ||
                                                                    routers[0]
                                                                        .redirect,
                                                                replace: true
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                store
                                                    .dispatch('LogOut')
                                                    .then(() => {
                                                        Message.error(
                                                            '该诊所暂无可选菜单，请联系系统管理员'
                                                        )
                                                        NProgress.done()
                                                    })
                                            }
                                        } else {
                                            // 多个诊所-进入诊所选择
                                            next({
                                                path: '/clinic'
                                            })
                                        }
                                    } else {
                                        next({
                                            ...to,
                                            replace: true
                                        })
                                        // location.reload()
                                    }
                                }
                            }
                        }
                    })
                    .catch(() => {
                        store.dispatch('LogOut').then(() => {
                            Message.error('验证失败，请重新登录！')
                            next({
                                path: '/login'
                            })
                        })
                    })
            } else {
                next()
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next()
        } else {
            next('/login') // 否则全部重定向到登录页
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done() // finish progress bar
})
