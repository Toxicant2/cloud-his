import {
    savePatientInfo
} from '@/api/outpatient'
const mixin = {
    data() {
        return {
            diagnosisFormData: [ // 个人信息完善
                {
                    type: 'input',
                    name: '体重(kg)',
                    field: 'weight',
                    rules: [{
                        pattern: /^(([1-9]{1}|[1-9]{1}\d|1\d{2})(\.\d{1,2})?|200)$/,
                        message: '1到200为有效数字，最多可保留2位小数',
                        trigger: 'blur'
                    }],
                    func: this.weightChange
                }, {
                    type: 'input',
                    name: '身高(cm)',
                    field: 'height',
                    rules: [{
                        pattern: /^((3\d{1}|[4-9]\d{1}|[1-2]\d{2})(\.\d{1,2})?|300)$/,
                        message: '30到300为有效数字，最多可保留2位小数',
                        trigger: 'blur'
                    }],
                    func: this.heightChange
                }, {
                    type: 'input',
                    name: 'BMI指数',
                    disabled: true,
                    field: 'bmi'
                }, {
                    type: 'select',
                    name: '血型',
                    field: 'booldType',
                    opts: [],
                    spanCount: 8,
                    placeholder: 'ABO血型'
                }, {
                    type: 'select',
                    field: 'booldTypeRh',
                    opts: [],
                    spanCount: 4,
                    class: 'boold',
                    placeholder: 'RH血型'
                }, {
                    type: 'select-input',
                    name: '体温（℃）',
                    field1: 'bodyTpositionName',
                    field2: 'bodyTemperature',
                    opts: [],
                    style: {
                        height: '33px'
                    }
                }, {
                    type: 'background-input',
                    name: '呼吸（次/分钟）',
                    rules: [{
                        pattern: /^(0|[1-9]{1}|[1-8]\d{1}|90)$/,
                        message: '0到90为有效数字',
                        trigger: 'blur'
                    }],
                    up: 50,
                    down: 12,
                    field: 'respirationRate'
                }, {
                    type: 'input',
                    name: '心率（次/分钟）',
                    rules: [{
                        pattern: /^([3][6-9]{1}|[4-9]\d{1}|([1]([0-4][0-9]{1}|[5][0]{1})))$/,
                        message: '36到150为有效数字',
                        trigger: 'blur'
                    }],
                    field: 'pulse'
                }, {
                    type: 'input-input',
                    name: '血压（mmHg）',
                    field1: 'dbp',
                    field2: 'sbp'
                }
            ],
            bloodOpts: []
        }
    },
    methods: {
        // 完善信息
        perfectOutpatient() {
            this.initSelect() // 初始化下拉框

            if (this.patient.bloodPressure) {
                this.patient.sbp = this.patient.bloodPressure.split('/')[0]
                this.patient.dbp = this.patient.bloodPressure.split('/')[1]
            }
            this.$refs.diagnosisForm.open() // 打开完善信息弹窗
        },

        // 初始化下拉框方法
        initSelect() {
            // 体温
            this.diagnosisFormData[5].opts = this.dictData['142']
            // 血型下拉框选项
            this.diagnosisFormData[3].opts = this.dictData['60']
            this.diagnosisFormData[4].opts = this.dictData['125']
        },

        // 体重改变
        weightChange(value) {
            this.weight = value
            this.height = this.height ? this.height : this.patient.height
            this.$refs.diagnosisForm.initFields({
                'bmi': this.formatterBMI(value, this.height)
            })
        },

        // 身高改变
        heightChange(value) {
            this.height = value
            this.weight = this.weight ? this.weight : this.patient.weight
            this.$refs.diagnosisForm.initFields({
                'bmi': this.formatterBMI(this.weight, value)
            })
        },

        // 计算BMI
        formatterBMI(w, h) {
            if (!w || !h) return ''
            return (Number(w) / (Math.pow(Number(h) / 100, 2))).toFixed(2)
        },

        // 完善信息确认
        handleConfirm(form) {
            form.patientId = this.patient.patientId
            form.registerId = this.patient.regId
            form.caseId = this.patient.id
            // 体温
            if (form.bodyTpositionName && form.bodyTpositionName.value) {
                form.bodyTpositionCode = form.bodyTpositionName.value
                form.bodyTpositionName = form.bodyTpositionName.label
            }
            const tp = form.bodyTemperature
            if (tp) {
                if (!form.bodyTpositionName) {
                    this.$message.error('请选择体温类型')
                    this.$refs.diagnosisForm.loading = false
                    return false
                }
                const reg = /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/
                if (!reg.test(tp)) {
                    this.$message.error('体温有效范围为35.0-42.9')
                    this.$refs.diagnosisForm.loading = false
                    form.bodyTemperature = ''
                    return false
                }
            }
            let flag = true
            const regList = [{
                value: 'bodyTemperature',
                reg: /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/,
                message: '体温有效范围为35.0-42.9'
            }, {
                value: 'respirationRate',
                reg: /^(0|[1-9]{1}|[1-8]\d{1}|90)$/,
                message: '呼吸有效范围为0-90'
            }, {
                value: 'pulse',
                reg: /^(3[6-9]{1}|[4-9]\d{1}|(1([0-4]{1}\d|50)))$/,
                message: '心率有效范围为36-150'
            }, {
                value: 'sbp',
                reg: /^([1-9]\d{0,1}|[1,2]\d{2}|3[0-4]{1}\d|350)$/,
                message: '收缩压有效范围为1-350'
            }, {
                value: 'dbp',
                reg: /^([1-9]\d{0,1}|[1,2]\d{2}|300)$/,
                message: '舒张压有效范围为1-300'
            }]
            regList.forEach((item, index) => {
                if (index > 0) {
                    if (form[item.value] && !item.reg.test(form[item.value])) {
                        this.$message.error(item.message)
                        this.$refs.diagnosisForm.loading = false
                        form[item.value] = ''
                        flag = false
                        return false
                    }
                }
            })
            if (flag) {
                savePatientInfo(form).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        var temp_bloodPressure = ''
                        var str1 = d.sbp ? d.sbp : ''
                        var str2 = d.dbp ? d.dbp : ''
                        if (str1 || str2) {
                            temp_bloodPressure = str1 + '/' + str2
                        }
                        const obj = {
                            id: d.id,
                            height: form.height,
                            weight: form.weight,
                            bmi: form.bmi,
                            bodyTemperature: form.bodyTemperature,
                            bodyTpositionName: form.bodyTpositionName,
                            respirationRate: form.respirationRate,
                            pulse: form.pulse,
                            bloodPressure: temp_bloodPressure,
                            booldType: form.booldType,
                            booldTypeRh: form.booldTypeRh
                        }
                        this.patient = Object.assign(this.patient, obj)
                        this.$message.success('保存成功')
                        this.$refs.diagnosisForm.close()
                        this.$refs.outpatient[0].initFields({
                            bodyTemperature: form.bodyTemperature,
                            pulse: form.pulse,
                            respirationRate: form.respirationRate,
                            sbp: form.sbp,
                            dbp: form.dbp
                        })
                    }
                })
            }
        }
    }
}
export default mixin
