import Vue from 'vue'

// import 'babel-polyfill'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import VCharts from 'v-charts'
import router from './router'
import store from './store'

import commonUtil from './utils/index'
import './icons' // icon
import './permission' // permission control

import * as filters from './filters' // global filterstest
import _ from 'lodash'
Vue.prototype._ = _
Vue.use(ElementUI, {
    size: 'small'
})

Vue.use(VCharts)
Vue.prototype.commonUtil = commonUtil

// register global utility filters.
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
    data: {
        eventHub: new Vue()
    },
    router,
    store,
    render: h => h(App)
}).$mount('#app')
