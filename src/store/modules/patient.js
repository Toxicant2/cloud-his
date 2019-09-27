const patient = {
    state: {
        patient: {}, // 基本信息
        attachmentList: [], // 附件
        register: {}, // 登记信息
        appointment: {} // 预约信息
    },
    mutations: {
        SET_PATIENT: (state, patient) => {
            state.patient = patient
        },
        SET_ATTACHMENT: (state, attachmentList) => {
            state.attachmentList = attachmentList
        },
        SET_REGISTER: (state, register) => {
            state.register = register
        },
        SET_APPOINTMENT: (state, appointment) => {
            state.appointment = appointment
        }
    },
    actions: {
        setPatient({ commit }, patient) {
            commit('SET_PATIENT', patient)
        },
        setPtAttactment({ commit }, attachmentList) {
            commit('SET_ATTACHMENT', attachmentList)
        },
        setPtRegister({ commit }, register) {
            commit('SET_REGISTER', register)
        },
        setPtAppointment({ commit }, appointment) {
            commit('SET_APPOINTMENT', appointment)
        }
    }
}

export default patient
