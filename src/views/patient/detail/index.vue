<template>
    <el-row class="page-main">
        <el-row :gutter="20">
            <el-col :sm="24" :md="4">
                <patient-card :patient="patient" :panel-ellist="patientElList" />
            </el-col>
            <el-col :sm="24" :md="20">
                <el-row class="tabs-right">
                    <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
                </el-row>
                <el-tabs v-model="activeName" type="card">
                    <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                        <template v-if="tab.key === 'tab1'">
                            <form-boxcard ref="patient" :forms="formsData" :form-edit="patientList" :label-width="'120px'" @handleSave="handleSave" />
                        </template>
                        <template v-else-if="tab.key === 'tab2'">
                            <div v-if="insurance" class="insurance" :class="insurance.className">
                                <h2>已办理服务包</h2>
                                <p>【{{
                                    insurance.userType == 1?'单次用户':insurance.userType == 2?'超级宝宝': insurance.userType == 3?'宝无忧': ''
                                }}】</p>
                                <p>当前状态：{{ insurance.status == 1?'签约已生效':insurance.status == 2?'签约未生效或未签约':'' }}</p>
                                <p>有效期：{{ insurance.effectiveTime }}-{{ insurance.expirationTime }}</p>
                                <p>余额：￥{{ insurance.balance }}</p>
                            </div>
                            <div v-else class="insurance">
                                <h2>未办理</h2>
                            </div>
                        </template>
                        <template v-else-if="tab.key === 'tab3'">
                            <history-optree ref="history" :patient="patient" />
                        </template>
                        <template v-else-if="tab.key === 'tab5'">
                            <charges ref="charges" :patient-id="patientId" :register-id="registerId" />
                        </template>
                        <template v-else-if="tab.key === 'tab6'">
                            <thermometry ref="thermometry" :patient-id="patientId" />
                        </template>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import patientCard from '@/components/Panel/PatientCard'
import formBoxcard from './components/formBoxcard'
import historyOptree from './components/historyOptree'
import thermometry from './components/thermometry'

import charges from './components/charges'
import cityList from '@/common/data/city.js'

import { getPatientDetail, modifyPatient } from '@/api/arclinic'
import { getPatientInfo } from '@/api/outpatient'
import { getDictByIdList } from '@/api/catalog'
import { disabledPickerOpts, getBabyAge, paramAvatar, formatSex } from '@/utils'
import moment from 'moment'
export default {
    components: {
        patientCard,
        formBoxcard,
        historyOptree,
        charges,
        thermometry
    },
    data() {
        const dictMap = {
            9: [], // 性别
            29: [], // 民族
            107: [], // 婚姻状况
            20: [], // 职业
            131: [] // 证件类型
        }
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        var onOff = false
        dictMap[20].forEach(item => {
            if (item.label === '无') {
                onOff = true
            }
        })
        if (!onOff) {
            dictMap[20].push({
                label: '无',
                value: ''
            })
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        if (item.dictId === 131) {
                            if (item.code === '1' || item.code === '7') {
                                dictMap[item.dictId].push({
                                    value: item.code,
                                    label: item.name
                                })
                            }
                        } else {
                            dictMap[item.dictId].push({
                                value: item.code,
                                label: item.name
                            })
                        }
                    })
                }
            }
        })
        return {
            activeName: 'tab1',
            tabMapOpts: [
                {
                    label: '基本信息',
                    key: 'tab1'
                },
                {
                    label: '会员信息',
                    key: 'tab2'
                },
                {
                    label: '历史病历',
                    key: 'tab3'
                },
                //  {
                //     label: '预约信息',
                //     key: 'tab4'
                // },
                {
                    label: '收费信息',
                    key: 'tab5'
                },
                {
                    label: '测温报告',
                    key: 'tab6'
                }
            ],

            patientElList: {
                liList: [
                    {
                        name: '身高',
                        value: 'height',
                        unit: 'cm'
                    },
                    {
                        name: '体重',
                        value: 'weight',
                        unit: 'kg'
                    },
                    {
                        name: 'BMI指数',
                        value: 'bmi'
                    },
                    {
                        name: '体温',
                        value: 'bodyTemperature',
                        unit: '°C'
                    },
                    {
                        name: '呼吸',
                        value: 'respirationRate',
                        unit: '次/分'
                    },
                    {
                        name: '心率',
                        value: 'pulse',
                        unit: '次/分'
                    },
                    {
                        name: '血压',
                        value: 'bloodPressure',
                        unit: 'mmHg'
                    }
                ]
            },
            patientList: {},
            formsData: [
                {
                    type: 'input',
                    name: '姓名',
                    field: 'patientName'
                },
                {
                    type: 'select',
                    name: '性别',
                    field: 'sex',
                    opts: dictMap[9],
                    rules: [{ required: true, message: '性别必填' }]
                },
                {
                    type: 'date',
                    name: '出生日期',
                    field: 'birthDate',
                    options: disabledPickerOpts,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    func: this.handleAgeChange
                },
                {
                    type: 'input',
                    name: '年龄',
                    field: 'age',
                    disabled: true
                },
                {
                    type: 'input',
                    name: '手机号',
                    field: 'phone',
                    maxlength: 11,
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    field: 'idNumType',
                    name: '证件类型',
                    placeholder: '请选择证件类型',
                    opts: dictMap[131],
                    func: this.idNumTypeChange
                },
                {
                    type: 'input',
                    name: '证件号码',
                    field: 'idNum',
                    rules: [
                        {
                            pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                            // pattern: /^[a-zA-Z][1-3]{3}[0-9]{6}$/,
                            message: '请输入正确的身份证号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    name: '婚姻状况',
                    field: 'matrialStatus',
                    opts: dictMap[107]
                },
                {
                    type: 'select',
                    name: '民族',
                    field: 'nation',
                    opts: dictMap[29]
                },
                {
                    type: 'select',
                    name: '职业',
                    field: 'occupation',
                    opts: dictMap[20]
                },
                {
                    type: 'input',
                    name: '工作单位',
                    field: 'workOrg'
                },
                {
                    type: 'input',
                    name: '健康档案号',
                    field: 'opCaseNum',
                    disabled: true
                },
                {
                    type: 'cascader',
                    name: '地址',
                    field: 'region',
                    changeOnSelect: false, // 是否允许选择任意一级的选
                    list: cityList
                },
                {
                    type: 'input',
                    name: '详细地址',
                    field: 'familyAddr',
                    span: 24
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '备注',
                    field: 'note',
                    span: 24,
                    style: { height: 'auto' }
                },
                {
                    type: 'upload',
                    name: '',
                    accept:
            'image/jpeg,image/png,application/pdf,application/msword,application/vnd.ms-excel',
                    file: {
                        tip: '只能上传图片、pdf和文档文件，且不超过5MB',
                        limit: 5,
                        size: 5242880,
                        sizeLimitTip: '文件大小不可超过5MB',
                        fileType: 42
                    },
                    span: 18
                }
            ],
            // 个人病历信息
            patient: {
                // attachmentList: [],
                patientName: '',
                phone: '',
                avatar: '',
                sex: '',
                age: '',
                height: '',
                weight: '',
                bmi: '',
                bodyTemperature: '',
                bodyTpositionName: '',
                respirationRate: '',
                pulse: '',
                bloodPressure: '',
                firstDiagnosis: '',
                note: '',
                address3level: [],
                address: '',
                booldTemp: '',
                RHbooldTemp: ''
            },
            insurance: null,
            patientId: '',
            registerId: ''
        }
    },
    watch: {
        $route(val) {
            if (val.name === 'patientDetail') {
                this.activeName = 'tab1'
                this.getPatientInfo()
                this.getPatientRecord()
            }
        },
        activeName(newVal) {
            if (newVal === 'tab5') {
                this.$refs.charges[0].handleSearch()
            }
            if (newVal === 'tab6') {
                this.$refs.thermometry[0].handleSearch()
            }
        }
    },
    created() {
        this.getPatientInfo()
        this.getPatientRecord()
    },
    methods: {
    // 返回
        back() {
            window.history.go(-1)
        },

        // 计算年龄
        handleAgeChange(val) {
            const age = val ? getBabyAge(val) : ''
            this.$refs.patient[0].initFields({ age })
        },

        // 获取患者基本信息
        getPatientInfo() {
            const id = this.$route.params.id
            getPatientDetail(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const patient = d.patient
                    const attachmentList = []
                    if (d.attachmentList && d.attachmentList.length > 0) {
                        d.attachmentList.forEach(item => {
                            attachmentList.push({
                                businessId: item.businessId,
                                businessType: item.businessType,
                                name: item.fileName,
                                url: this.$store.getters.basic.filePrifix + item.filePath,
                                fileType: item.fileType,
                                id: item.id
                            })
                        })
                    }

                    // 会员信息
                    const insurance = d.insurance
                    if (insurance) {
                        const isBetween = moment(new Date()).isBetween(
                            insurance.effectiveTime,
                            insurance.expirationTime
                        )
                        insurance.className = isBetween ? '' : 'out'
                    }
                    this.insurance = insurance
                    const obj = {
                        patientName: patient.name || '',
                        sex: patient.sex,
                        age: patient.birthDate ? getBabyAge(patient.birthDate) : '',
                        phone: patient.phone,
                        patientId: patient.id,
                        birthDate: patient.birthDate,
                        idNum: patient.idNum,
                        idNumType: patient.idNumType,
                        matrialStatus: patient.matrialStatus,
                        nation: patient.nation,
                        occupation: patient.occupation,
                        workOrg: patient.workOrg,
                        region: patient.region,
                        opCaseNum: patient.opCaseNum,
                        familyAddr: patient.familyAddr,
                        note: patient.note,
                        attachmentList
                    }
                    this.$refs.patient[0].initForm(obj)

                    const avatar = patient.headImg
                        ? this.$store.getters.basic.filePrifix + patient.headImg
                        : paramAvatar(patient.sex, patient.birthDate)
                    this.$set(this.patient, 'avatar', avatar)
                    this.$set(this.patient, 'name', patient.name || '')
                    this.$store.dispatch('setPatient', {
                        name: patient.name || '',
                        sex: formatSex(patient.sex),
                        age: patient.birthDate ? getBabyAge(patient.birthDate) : ''
                    })

                    this.idNumTypeChange(obj.idNumType)
                }
            })
        },

        // 修改基本信息
        handleSave(data) {
            modifyPatient(data).then(res => {
                if (res.STATUS === '1') {
                    this.$refs['patient'][0].handleClose()
                    this.$message.success('修改成功')
                    this.getPatientInfo()
                }
            })
        },

        // 获取患者病历信息
        getPatientRecord() {
            const patientId = this.$route.params.id
            const registerId = this.$route.params.registerId
            this.patientId = patientId
            this.registerId = registerId
            if (registerId === '0' || registerId === 0) {
                this.patient = {
                    height: '',
                    weight: '',
                    bmi: '',
                    pulse: '',
                    respirationRate: '',
                    bodyTemperature: '',
                    bloodPressure: ''
                }
            } else {
                const data = { patientId, registerId, detailFlag: 0 }
                getPatientInfo(data).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        let obj = {}
                        if (d) {
                            var temp_bloodPressure = ''
                            var str1 = d.sbp || ''
                            var str2 = d.dbp || ''
                            if (str1 || str2) {
                                temp_bloodPressure = str1 + '/' + str2
                            }
                            obj = {
                                height: d.height,
                                weight: d.weight,
                                bmi: d.bmi,
                                pulse: d.pulse,
                                respirationRate: d.respirationRate,
                                bodyTemperature: d.bodyTemperature,
                                bloodPressure: temp_bloodPressure
                            }
                        }
                        this.patient = obj
                    }
                })
            }
        },

        // 选择证件类型
        idNumTypeChange(val) {
            const idNumType = this.formsData[6].rules[0]
            if (val === '1') {
                idNumType.message = '请输入正确的身份证号'
                idNumType.pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
            } else {
                idNumType.message = '请输入正确的出生证号'
                idNumType.pattern = /^[a-zA-Z][0-9]{9}$/
            }
        },
        changeActiveName() {
            this.activeName = 'tab6'
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (from.name == 'temperature') {
                vm.changeActiveName()
            }
        })
    }
}
</script>

<style lang="scss" scoped>
.insurance {
  width: 100%;
  padding-left: 10px;
  &.out {
    color: gray;
  }
  h2 {
    font-size: 16px;
    padding: 5px 0;
  }
  p {
    font-size: 14px;
    line-height: 32px;
  }
}
</style>

