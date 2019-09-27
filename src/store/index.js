import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import dict from './modules/dict'
import tagsView from './modules/tagsView'
import patient from './modules/patient'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        app,
        user,
        patient,
        tagsView,
        dict
    },
    getters
})

export default store
