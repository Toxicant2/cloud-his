import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/** note: submenu only apppear when children.length>=1
 *   detail see  https://panjiachen.github.io/vue-element-admin-site/#/router-and-nav?id=sidebar
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
    {
        path: '/404',
        component: () => import('@/views/errorPage/404'),
        hidden: true
    },
    {
        path: '/401',
        component: () => import('@/views/errorPage/401'),
        hidden: true
    },
    {
        path: '/temperatureData',
        component: () => import('@/views/temperature/dataStatistics/components/data'),
        hidden: true
    },
    // {
    //     path: '/home',
    //     component: () => import('@/views/home/index'),
    //     hidden: true
    // },
    {
        path: '/login',
        component: () => import('@/views/login/index'),
        hidden: true
    },
    {
        path: '/register',
        component: () => import('@/views/register/index'),
        hidden: true
    },
    {
        path: '/clinic',
        component: () => import('@/views/clinic/index'),
        hidden: true
    },
    {
        // 未审核通过诊所修改
        path: '/audit/modify',
        component: () => import('@/views/systems/modifyInformation'),
        hidden: true
    }
]
console.log(process.env)
export default new Router({
    // mode: 'history', // require service support
    mode: 'history',
    base: process.env.VUE_APP_ENV_CONFIG === 'dev' ? '' : process.env.VUE_APP_BASE_PATH,
    scrollBehavior: () => ({
        y: 0
    }),
    routes: constantRouterMap
})
