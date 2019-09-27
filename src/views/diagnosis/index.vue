<template>
    <el-row class="page-container">
        <el-row class="page-main diagnosis">
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="tab.key === '0'">
                        <panel-card rowShowType='topBottom' :rowShowNumber='6' :panel-ellist="patientElList" :panel-list="patientList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>
                    <template v-else>
                        <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="patientSearchList" @handleSearch="handleFormSearch" />
                        <panel-card rowShowType='topBottom' :rowShowNumber='6' :panel-ellist="patientElListEd" :panel-list="patientList" :totalCount="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>
                </el-tab-pane>
            </el-tabs>
            <diagnosis-form ref="diagnosis" :countLine='12' width='800px' :title="'个人信息完善'" :form-data="diagnosisFormData" :form-edit="formData" @handleConfirm="handleConfirm" />
            <quick-click ref="quick" :width="'720px'" title="选择医生" :quick-searchlist="quickSearch" :el-list="elList" :get-data="getOrgClinicStaffList" :params="{isUse:1,userType:1,avatarFlag:1}" @quickClick="chooseDoctor" />
        </el-row>
        <transition name="fade" mode="out-in">
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </transition>
    </el-row>
</template>

<script>
import { triageData, saveDocData } from '@/api/arclinic'
import { getPatientInfo, savePatientInfo } from '@/api/outpatient'
import { getOrgClinicStaffList } from '@/api/org'
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import panelCard from '@/components/Panel/PanelCard'
import paginationMixin from '@/components/TabComponents/mixin'
import directSearch from '@/components/FormComponents/directSearch'
import quickClick from '@/components/DialogComponents/QuickClick'
import diagnosisForm from '@/components/DialogComponents/Form'
import { mapGetters } from 'vuex'
import {
    formatSex,
    getBabyAge
} from '@/utils'

export default {
    components: {
        panelCard,
        quickClick,
        directSearch,
        diagnosisForm
    },
    mixins: [paginationMixin],
    data() {
        return {
            patientId: 0, // 病人id
            registerId: '', // 登记id
            getOrgClinicStaffList, // 医生列表
            formData: null,
            quickSearch: [
                {
                    type: 'input',
                    label: '',
                    prop: 'name',
                    placeholder: '请输入医生姓名',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            elList: {
                spanCol: 6,
                list: [
                    {
                        formatter(row) {
                            return `${row.userRealName}（${row.departName ? row.departName : ''}）`
                        }
                    }, {
                        value: 'mobile'
                    }, {
                        formatter(row) {
                            return formatSex(row.sex)
                        }
                    }
                ]
            },
            total: 0,
            unknownAvatar,
            doctorIndex: true, // 就诊
            temperatureList: [],
            patientSearchList: [
                {
                    type: 'input',
                    label: '',
                    prop: 'condition',
                    placeholder: '输入患者姓名/手机号后四位',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    },
                    showType: '0'
                }
            ],
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
                    style: { height: '33px' }
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
            tabMapOpts: [
                {
                    label: '待分诊',
                    key: '0'
                },
                {
                    label: '已分诊',
                    key: '1'
                }
            ],
            activeName: '0',
            patientElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age'
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    }, {
                        name: '登记科室',
                        value: 'deptNameIsFirstClinic'
                    }, {
                        name: '预约医生',
                        value: 'doctorName'
                    }, {
                        name: '预约时间',
                        value: 'appointmentDate'
                    }, {
                        name: '预约详情',
                        value: 'diseaseDescription'
                    }, {
                        name: '登记时间',
                        value: 'regDate'
                    }
                ],
                btnlist: [
                    {
                        name: '完善信息',
                        label: 'popOver',
                        func: this.clickBtn
                    }, {
                        name: '选择医生',
                        label: 'popOver',
                        func: this.clickSelectDoctorBtn
                    }
                ]
            },
            patientElListEd: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age'
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    }, {
                        name: '登记科室',
                        value: 'deptNameIsFirstClinic'
                    }, {
                        name: '体温',
                        number: 12,
                        value: 'bodyTemperature'
                    }, {
                        name: '血压',
                        number: 12,
                        value: 'bloodPressure'
                    }, {
                        name: '呼吸',
                        number: 12,
                        value: 'respirationRate'
                    }, {
                        name: '身高',
                        number: 12,
                        value: 'height'
                    }, {
                        name: '心率',
                        number: 12,
                        value: 'pulse'
                    }, {
                        name: '体重',
                        number: 12,
                        value: 'weight'
                    }, {
                        name: '登记时间',
                        value: 'regDate'
                    }
                ],
                btnlist: [
                    {
                        name: '完善信息',
                        label: 'popOver',
                        func: this.clickBtn
                    },
                    {
                        formatter(row) {
                            return row.doctorName
                        }
                    }
                ]
            },
            patientList: [],
            caseId: 0,
            weight: 0,
            height: 0,
            bloodOpts: [],
            cacheForm: {}
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    watch: {
        // 切换tab
        activeName: function (val, oldVal) {
            // 初始化表格数据
            this.pageIndex = 1
            this.cacheForm = {}
            this.handleSearch()
            this.$refs.form[0].$refs.form.resetFields()
        }
    },

    methods: {
        // 初始化下拉框方法
        initSelect() {
            // 体温
            this.diagnosisFormData[5].opts = this.dictData['142']
            // 血型下拉框选项
            this.diagnosisFormData[3].opts = this.dictData['60']
            this.diagnosisFormData[4].opts = this.dictData['125']
        },
        weightChange(value) {
            this.weight = value
            this.$refs.diagnosis.initFields({
                'bmi': this.formatterBMI(value, this.height)
            })
        },
        heightChange(value) {
            this.height = value
            this.$refs.diagnosis.initFields({
                'bmi': this.formatterBMI(this.weight, value)
            })
        },
        formatterBMI(w, h) {
            if (w && h) return (Number(w) / (Math.pow(Number(h) / 100, 2))).toFixed(2)
            return ''
        },
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        // 获取患者列表
        handleSearch(form) {
            this.patientList = [] // 初始化数据
            this.cacheForm = form || this.cacheForm
            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            const type = this.activeName
            triageData(params, type).then(res => {
                const result = res.ITEMS
                const that = this
                this._.forEach(result.list, function (item) {
                    item.sex = formatSex(item.sex)
                    item.age = getBabyAge(item.birthDate)
                    item.avatar = item.headImg ? that.$store.getters.basic.filePrifix + item.headImg : unknownAvatar
                    item.regDate = item.regDate ? item.regDate.split(' ')[0] : ''
                    if (item.sbp != null && item.dbp != null) {
                        item.bloodPressure = item.sbp + ' / ' + item.dbp // 血压
                    }
                    const temp_isFirstClinic = item.isFirstClinic === 1 ? '（初诊）' : '（复诊）'
                    item.deptNameIsFirstClinic = (item.deptName?item.deptName:'') + temp_isFirstClinic// 登记科室
                })
                this.patientList = result.list
                this.total = result.totalRecord
            })
        },

        // 点击卡片下的完善信息按钮
        clickBtn(item) {
            this.patientId = item.patientId // 患者id
            this.registerId = item.id // 登记id
            this.initSelect() // 初始化下拉框
            this.getPatientInfo() // 获取患者信息
        },

        // 点击卡片下的选择医生按钮
        clickSelectDoctorBtn(item) {
            this.registerId = item.id
            this.$refs.quick.open()
        },
        // 获取患者信息
        getPatientInfo() {
            const data = {
                'patientId': this.patientId,
                'registerId': this.registerId,
                'detailFlag': 0
            }
            getPatientInfo(data).then(res => {
                const result = res.ITEMS
                if (result != null && result.id != null) {
                    this.caseId = result.id
                } else {
                    this.caseId = 0
                }
                this.formData = result
                if (this.formData != null && this.formData.height != null && this.formData.weight != null) {
                    this.weight = this.formData.weight
                    this.height = this.formData.height
                }
                this.$refs.diagnosis.open() // 打开完善信息弹窗
            })
        },

        // 选择医生
        chooseDoctor(obj) {
            const data = {
                registerId: this.registerId,
                doctorId: obj.userId,
                name: obj.userRealName
            }
            saveDocData(data).then(res => {
                if (res.STATUS === '1') {
                    this.$refs.quick.close()
                    this.$message({
                        message: '成功',
                        type: 'success'
                    })
                    this.handleSearch()
                }
            })
        },

        // 完善信息确认
        handleConfirm(form) {
            form.patientId = this.patientId
            form.registerId = this.registerId
            form.caseId = this.caseId
            // 体温
            if (form.bodyTpositionName && form.bodyTpositionName.value) {
                form.bodyTpositionCode = form.bodyTpositionName.value
                form.bodyTpositionName = form.bodyTpositionName.label
            }
            const tp = form.bodyTemperature
            if (tp) {
                if (!form.bodyTpositionName) {
                    this.$message.error('请选择体温类型')
                    this.$refs.diagnosis.loading = false
                    return false
                }
                const reg = /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/
                // if (tp < 35 || tp > 42) {
                //     this.$message.error('体温有效范围为35-42')
                //     form.bodyTemperature = ''
                //     return false
                // }
                if (!reg.test(tp)) {
                    this.$message.error('体温有效范围为35.0-42.9')
                    form.bodyTemperature = ''
                    this.$refs.diagnosis.loading = false
                    return false
                }
            }

            let flag = true
            const regList = [
                {
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
                }
            ]
            regList.forEach((item, index) => {
                if (index > 0) {
                    if (form[item.value] && !item.reg.test(form[item.value])) {
                        this.$message.error(item.message)
                        this.$refs.diagnosis.loading = false
                        form[item.value] = ''
                        flag = false
                        return false
                    }
                }
            })
            if (flag) {
                savePatientInfo(form).then(res => {
                    if (res.STATUS === '1') {
                        this.$message({
                            message: '保存成功',
                            type: 'success'
                        })
                        this.$refs.diagnosis.close()
                        this.handleSearch()
                    }
                })
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>

<style lang="scss" scoped>
.toolbar {
    line-height: 36px;
}
</style>

<style>
.diagnosis .el-form-item__label {
    width: 125px !important;
}

.diagnosis .el-input-group__prepend div.el-select .el-input__inner {
    padding-left: 55px !important;
}

.diagnosis .el-form-item__content {
    margin-left: 130px !important;
}

.select-doctor .el-dialog__body {
    padding-top: 0;
}
</style>

