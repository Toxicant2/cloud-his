<template>
    <el-row class="page-main chargeDetail">
        <!-- 快速收费 -->
        <form-dialog ref="quickDialog" :form-data="quickFormData" title="快 速 收 费" width="400px" router-name="charge" @handleConfirm="startCharge" />

        <!-- 快速收费项目 -->
        <template v-if="isShow">
            <div v-if="quickChargeType === 1" class="person_info">
                <div class="person_top">
                    <el-row :gutter="20">
                        <el-col v-for="(item,index) in chargeElList" :key="index" :span="6">
                            <p>{{ item.label }}：{{ item.value === 'idNumType'?idNumTypeLabel:chargeInfoList[item.value] }}</p>
                        </el-col>
                    </el-row>
                </div>
            </div>
            <div class="charge_select">
                <el-row :gutter="20">
                    <el-col :span="20" class="el-col-left">
                        <complex-tab :columns="quickchargeColumns" :add-columns="quick_addCoumns" :table-data="quickchargeList" :disabled="false" :params="{style:{width:'880px'},placeholder:'请输入收费项目',pageSize:20}" @addItem="addItem" />
                    </el-col>
                    <el-col :span="4">
                        <div class="construction">
                            <el-container>
                                <el-header class="title">收费汇总</el-header>
                                <div class="list">
                                    <p>
                                        <!-- <span>#</span> -->
                                        <span>项目</span>
                                        <span>金额</span>
                                    </p>
                                    <p v-for="(c,cIndex) in construtList" v-if="c.money>0" :key="cIndex">
                                        <!-- <span>{{cIndex+1}}</span> -->
                                        <span>{{ c.project }}</span>
                                        <span>{{ c.money }}</span>
                                    </p>
                                </div>
                                <el-footer>
                                    <p>
                                        <span>合计：</span>
                                        <span>￥{{ quickSum }}</span>
                                    </p>
                                    <el-button type="primary" @click="quickOpen">收费</el-button>
                                </el-footer>
                            </el-container>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </template>

        <!-- 收费弹窗 -->
        <dialogCharge ref="dialog" :input-style="'width:300px;'" :is-credit="isCredit" title="付款" @activeName="handleActive" @chargeFinish="handleSearch" />
    </el-row>
</template>

<script>
import { getOrgClinicStaffList, getDepartmentOpts } from '@/api/org'
import { getDictByIdList, getBasicSettingNum } from '@/api/catalog'
import { selectByName, modifyRegister2, getLastRecord } from '@/api/arclinic'
import { getUnchargeList, getUnchargeCount } from '@/api/outpatient'

import formDialog from '@/components/DialogComponents/Form'
import complexTab from '@/components/TabComponents/complex'
import dialogCharge from '../components/charge'

import { getBabyAge, defaultPickOpts, formatSex, param, param2Obj, formatDictMap } from '@/utils'
import { getFloat, add, multiply, toFixed } from '@/utils/float'
import moment from 'moment'
export default {
    components: {
        formDialog,
        complexTab,
        dialogCharge
    },
    props: ['beChargedType', 'quickChargeType'],
    data() {
        const dictMap = {
            9: [], // 性别
            152: [], // 中药用法
            146: [], // 来源
            131: [] // 证件类型
        }
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
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
                            let obj = {}
                            obj = {
                                value: item.code,
                                label: item.name
                            }
                            dictMap[item.dictId].push(obj)
                        }
                    })
                }
            }
        })
        // 科室
        const departmentList = []
        getDepartmentOpts().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        departmentList.push({
                            value: param({
                                departId: item.id,
                                departCode: item.code,
                                departName: item.name
                            }),
                            label: item.name
                        })
                    })
                }
            }
        })
        // 医师
        const doctorList = [
            {
                value: '',
                label: '请选择'
            }
        ]
        getOrgClinicStaffList({ pageNo: 1, pageSize: 100, userType: 1, isUse: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.totalRecord > 0) {
                    d.list.forEach(item => {
                        doctorList.push({
                            value: param({
                                doctorId: item.userId,
                                doctorCode: '',
                                doctorName: item.userRealName
                            }),
                            label: item.userRealName
                        })
                    })
                }
            }
        })
        // console.log(this.commonUtil.getConfigValue('isPhoneRequired') === '1', '12321')
        return {
            // 收费患者基本信息模板
            chargeElList: [
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '科室',
                    value: 'deptName'
                },
                {
                    label: '医师',
                    value: 'doctorName'
                },
                {
                    label: '证件类型',
                    value: 'idNumType'
                },
                {
                    label: '证件号码',
                    value: 'idNum'
                },
                {
                    label: '单据号',
                    value: 'billNumber'
                },
                {
                    label: '性别',
                    value: 'sex'
                },
                {
                    label: '年龄',
                    value: 'age'
                }
            ],
            // 收费患者基本信息数据
            chargeInfoList: {
                name: '',
                deptName: '',
                doctorName: '',
                idNumType: '',
                idNum: '',
                billNumber: '',
                sex: '',
                invoiceNumber: '',
                age: ''
            },
            // 快速收费项目表格
            quickchargeColumns: [
                {
                    value: 'groupSn',
                    label: '组号',
                    type: 'input',
                    width: 80,
                    func: this.handleEditGroupNum
                },
                {
                    value: 'name',
                    label: '项目名称',
                    width: 200
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'manufacturerName',
                    label: '厂商'
                },
                {
                    value: 'qtyStr',
                    label: '库存'
                },
                // {
                //     value: 'qtySum',
                //     label: '库存'
                // },
                {
                    value: 'specDose',
                    label: '剂量',
                    type: 'input',
                    blurFunc: this.handleBlurDose
                },
                {
                    value: 'days',
                    label: '剂数',
                    type: 'input',
                    blurFunc: this.handleBlurNum
                },
                {
                    value: 'userMethod',
                    label: '中药煎法',
                    type: 'select',
                    opts: dictMap[152]
                },
                // {
                //     value: 'unit',
                //     label: '单位'
                // },
                {
                    value: 'qty',
                    label: '总量',
                    type: 'input',
                    maxlength: 3,
                    minWidth: '200px',
                    appendType: 'select',
                    selectValue: 'isTinyRecipe',
                    selectFunc: this.unitChange,
                    // func: this.handleChangeTotalNum,
                    blurFunc: this.handleBlurChangeTotalNum
                },
                {
                    value: 'price',
                    label: '单价'
                },
                {
                    value: 'amt',
                    label: '金额'
                },
                {
                    value: 'medicineType',
                    label: '药品来源',
                    type: 'select',
                    opts: dictMap[146]
                },
                {
                    value: 'executiveSection',
                    label: '操作',
                    width: 108,
                    fixed: 'right',
                    btnType: 'danger',
                    func: this.delProject,
                    text: '删除',
                    type: 'button'
                }
            ],
            // 快速收费项目数据
            quickchargeList: [],
            // 快速收费添加的表格
            quick_addCoumns: [
                {
                    label: '类型',
                    width: '50',
                    formatter(row) {
                        return row.chara === '10'
                            ? '西药'
                            : row.chara === '20'
                                ? '中药'
                                : row.chara === '30'
                                    ? '检验/检查'
                                    : row.chara === '40'
                                        ? '治疗'
                                        : row.chara === '50'
                                            ? '材料'
                                            : row.chara === '99'
                                                ? '其他'
                                                : ''
                    }
                },
                {
                    value: 'name',
                    label: '名称',
                    width: '250'
                },
                {
                    value: 'spec',
                    label: '规格',
                    width: '100'
                },
                {
                    value: 'price',
                    label: '单价',
                    width: '100'
                },
                {
                    value: 'manufacturerName',
                    label: '厂商',
                    width: '250'
                },
                {
                    value: 'qty',
                    label: '总库存',
                    width: '100'
                }
            ],
            // 快速收费登记form
            quickFormData: [
                {
                    type: 'autoComplete',
                    name: '姓名',
                    field: 'quick_name',
                    rules: [
                        {
                            required: true,
                            message: '姓名不能为空'
                        }
                    ],
                    func: this.querySearchAsync,
                    selectfun: this.handleSelect
                },
                {
                    type: 'select',
                    name: '性别',
                    field: 'quick_sex',
                    opts: dictMap[9],
                    rules: [
                        {
                            required: true,
                            message: '性别不能为空'
                        }
                    ]
                },
                {
                    type: 'date',
                    name: '出生日期',
                    options: defaultPickOpts.opts,
                    format: defaultPickOpts.format,
                    valueFormat: defaultPickOpts.valueFormat,
                    field: 'quick_date',
                    func: this.afterSelect,
                    rules: [
                        {
                            required: true,
                            message: '出生日期不能为空'
                        }
                    ]
                },
                {
                    type: 'mixin-input',
                    name: '年龄',
                    field: 'age',
                    placeholder: '年龄',
                    className: 'mixin-input',
                    list: [
                        {
                            type: 'input',
                            field: 'ageYear',
                            rules: [
                                {
                                    pattern: /\d/,
                                    message: '只能输入数字',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '岁',
                            func: this.formatBirthday
                        },
                        {
                            type: 'input',
                            field: 'ageMonth',
                            rules: [
                                {
                                    pattern: /\d/,
                                    message: '只能输入数字',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '月',
                            func: this.formatBirthday
                        },
                        {
                            type: 'input',
                            field: 'ageDay',
                            rules: [
                                {
                                    pattern: /\d/,
                                    message: '只能输入数字',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '天',
                            func: this.formatBirthday
                        }
                    ]
                    // disabled: true
                },
                {
                    type: 'input',
                    name: '手机号',
                    field: 'quick_phone',
                    maxlength: 11,
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        },
                        {
                            required: this.commonUtil.getConfigValue('isPhoneRequired') === '1',
                            message: '请输入手机号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    name: '证件类型',
                    field: 'idNumType',
                    opts: dictMap[131],
                    func: this.idNumTypeChange
                },
                {
                    type: 'input',
                    name: '证件号码',
                    field: 'idNum',
                    maxlength: 18,
                    rules: [
                        {
                            pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                            message: '请输入正确的身份证号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    name: '就诊科室',
                    field: 'departStr',
                    opts: departmentList,
                    rules: [
                        {
                            required: true,
                            message: '请选择就诊科室',
                            trigger: 'change'
                        }
                    ]
                },
                {
                    type: 'select',
                    name: '就诊医生',
                    field: 'doctorStr',
                    opts: doctorList,
                    rules: [
                        {
                            required: true,
                            message: '请选择就诊科室',
                            trigger: 'change'
                        }
                    ]
                }
            ],

            // 传到收费弹窗的各种金额数据
            chargeData: {},
            insurance: {},
            /** 收费     */
            chargeType: 'index',
            chargeLabel: '组号',
            // 收费汇总的标题
            construtColumns: [
                {
                    value: 'project',
                    label: '项目'
                },
                {
                    value: 'money',
                    label: '金额'
                }
            ],
            // 收费汇总
            construtList: [
                {
                    chara: '10',
                    money: 0,
                    project: '西药'
                },
                {
                    chara: '20',
                    money: 0,
                    project: '中药'
                },
                {
                    chara: '30',
                    money: 0,
                    project: '检验/检查'
                },
                {
                    chara: '40',
                    money: 0,
                    project: '治疗'
                },
                {
                    chara: '50',
                    money: 0,
                    project: '材料'
                },
                {
                    chara: '99',
                    money: 0,
                    project: '其他'
                }
            ],
            quickSum: 0, // 收费明细总计金额
            isCredit: false,
            isShow: false,
            cacheForm: {}
        }
    },
    computed: {
        idNumTypeLabel() {
            return formatDictMap(this.$store.getters.dictData[131], this.chargeInfoList.idNumType)
        }
    },
    watch: {
        beChargedType(val, old) {
            this.isShow = val === 3
        }
    },
    methods: {
        init() {
            this.quickchargeList = []
            this.quickSum = 0
            this.construtList.map(item => {
                item.money = 0
            })
        },
        open() {
            this.$refs.quickDialog.open()
        },
        // 快速添加项目
        startCharge(form) {
            this.quickSum = 0
            // this.construtList = [{
            //     chara: '10',
            //     money: 0,
            //     project: '西药'
            // }, {
            //     chara: '20',
            //     money: 0,
            //     project: '中药'
            // }, {
            //     chara: '30',
            //     money: 0,
            //     project: '检验/检查'
            // }, {
            //     chara: '40',
            //     money: 0,
            //     project: '治疗'
            // }, {
            //     chara: '50',
            //     money: 0,
            //     project: '材料'
            // },{
            //     chara:'99',
            //     money:0,
            //     project:'其他'
            // }]
            const departmentObj = param2Obj(form.departStr) // 科室
            const doctorObj = param2Obj(form.doctorStr) // 医生
            const tempForm = {
                patientName: form.quick_name,
                sex: form.quick_sex,
                phone: form.quick_phone,
                idNum: form.idNum,
                idNumType: form.idNumType,
                birthDate: form.quick_date,
                patientSources: '99',
                patientId: form.id,
                medicalInsuranceType: '自费',
                medicalInsuranceCode: '3',
                commercialInsuranceType: '自费',
                commercialInsuranceCode: '99',
                outpatientType: '门诊',
                isFirstClinic: 0,
                ageYear: form.ageYear,
                ageMonth: form.ageMonth,
                ageDay: form.ageDay
            }
            const params = Object.assign({}, tempForm, departmentObj, doctorObj)
            modifyRegister2(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        getBasicSettingNum('outpatientChargeNum').then(res => {
                            if (res.STATUS === '1') {
                                d.billNumber = res.ITEMS
                            }
                            this.$nextTick(() => {
                                this.$emit('showQuickCharge')
                                this.chargeInfoList = Object.assign({}, form, d)
                                this.chargeInfoList.sex = formatSex(d.sex)
                                this.chargeInfoList.age = getBabyAge(d.birthDate)
                                this.quickchargeList = []
                                this.$refs.quickDialog.close()
                            })
                        })
                    }
                })
                .catch(() => {
                    this.$refs.quickDialog.loading = false
                })
        },

        // 快速收费的删除
        delProject(row, index) {
            this.quickchargeList.splice(index, 1)
            this.freshGroupNum()

            this.frashAmt(row, index)
        },

        // 快速收费的年龄换算
        afterSelect(val, form) {
            var temp = getBabyAge(val)
            // this.quickFormData[3].placeholder = '年龄：' + birth
            const month = temp.indexOf('岁') > -1 ? temp.split('岁')[1] : temp
            const day = month.indexOf('月') > -1 ? month.split('月')[1] : month
            const ageYear = temp.indexOf('岁') > -1 ? temp.split('岁')[0] : ''
            const ageMonth = month.indexOf('月') > -1 ? month.split('月')[0] : ''
            const ageDay = day.indexOf('天') > -1 ? day.split('天')[0] : ''
            const formEdit = Object.assign(this.cacheForm, form, {
                quick_date: val,
                ageYear,
                ageMonth,
                ageDay
            })
            this.$refs.quickDialog.initforms(formEdit)
            return {
                ageYear,
                ageMonth,
                ageDay
            }
        },

        // 转换生日
        formatBirthday(val) {
            const form = val
            const ageYear = form.ageYear ? form.ageYear : ''
            const ageMonth = form.ageMonth ? form.ageMonth : ''
            const ageDay = form.ageDay ? form.ageDay : ''
            const quick_date = moment()
                .subtract(ageYear, 'y')
                .subtract(ageMonth, 'months')
                .subtract(ageDay, 'd')
                .format('YYYY-MM-DD 00:00:00')

            const formEdit = Object.assign(this.cacheForm, form, {
                quick_date,
                ageYear,
                ageMonth,
                ageDay
            })
            this.$refs.quickDialog.initforms(formEdit)
        },

        // 快速收费的组号更新
        freshGroupNum() {
            this.quickchargeList.forEach((item, index) => {
                item.groupSn = index + 1
            })
        },

        // 快速收费姓名的模糊查询
        querySearchAsync(queryString, cb) {
            if (queryString) {
                let nameResults = []
                selectByName(queryString).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d && d.length > 0) {
                            nameResults = Object.assign(d)
                            d.forEach((item, index) => {
                                nameResults[index].value = item.name
                            })
                        }
                        cb(nameResults)
                    }
                })
            } else {
                cb([])
            }
        },

        // 快速收费选择姓名
        handleSelect(item) {
            getLastRecord(item.id).then(res => {
                if (res.STATUS === '1') {
                    const d = Object.assign(item, res.ITEMS)
                    const departStr =
            d.deptId || d.deptCode || d.deptName
                ? param({
                    departId: d.deptId,
                    departCode: d.deptCode,
                    departName: d.deptName
                })
                : ''
                    const doctorStr =
            d.doctorId || d.doctorName
                ? param({
                    doctorId: d.doctorId,
                    doctorCode: '',
                    doctorName: d.doctorName
                })
                : ''
                    const ageObj = this.afterSelect(d.birthDate)
                    const formEdit = {
                        quick_name: d.name,
                        quick_sex: d.sex,
                        quick_phone: d.phone,
                        quick_date: d.birthDate,
                        age: getBabyAge(d.birthDate || ''),
                        departStr: departStr || this.quickFormData[7].opts[0].value,
                        doctorStr: doctorStr || this.quickFormData[8].opts[1].value,
                        idNum: d.idNum,
                        idNumType: d.idNumType || '1',
                        id: d.sysPatientId,
                        orgId: d.orgId,
                        ageYear: ageObj.ageYear,
                        ageMonth: ageObj.ageMonth,
                        ageDay: ageObj.ageDay
                    }

                    this.cacheForm = Object.assign({}, formEdit)
                    this.$refs.quickDialog.initforms(formEdit)
                    this.idNumTypeChange(formEdit.idNumType)
                }
            })
        },

        // 快速收费添加收费项目
        addItem(row) {
            // return 要趁早
            let flag = false
            if (this.quickchargeList.length > 0) {
                this.quickchargeList.forEach(item => {
                    if (item.id === row.id) {
                        flag = true
                    }
                })
            }
            if (flag) {
                this.$message.error('已存在的项目，无需重复添加')
                return
            }

            let specDose = ''
            let days = '' // 剂数
            let userMethod = ''
            let qty = ''
            const isWestM = row.chara !== '20'
            const _price = row.isTiny === 1 ? row.tinyPrice : row.price

            userMethod = isWestM ? 'null' : row.userMethod || '152'
            specDose = isWestM ? 'null' : row.specDose || 100
            days = isWestM ? 'null' : 1
            qty = isWestM ? 1 : days * specDose

            const pro = Object.assign({}, row)
            pro.isInput = !isWestM
            pro.qtySum = row.qty
            if (
                row.chara === '10' ||
        row.chara === '20' ||
        row.chara === '50' ||
        (row.chara === '99' && row.typeCode === '990202')
            ) {
                if (row.isTiny === 1) {
                    pro.qtyStr =
            (row.superQty > 0 ? `${row.superQty}${row.specUnit}` : '') +
            (row.tinyQty > 0 ? `${row.tinyQty}${row.specUseUnit}` : '')
                } else {
                    pro.qtyStr = row.superQty + row.specUnit
                }
            } else {
                pro.qtyStr = ''
            }

            // pro.qtyStr = row.isTiny?`${Math.floor(row.qty/row.specDispUseRatio)}${row.specUnit}${row.qty%row.specDispUseRatio}${row.specUseUnit}`:`${row.qty}${row.specUnit}`

            pro.specDose = specDose
            pro.days = days
            pro.qty = qty
            pro.amt = getFloat(_price * qty, 4)
            pro.groupSn = this.quickchargeList.length + 1
            pro.medicineType = '01'
            pro.userMethod = userMethod
            pro.frequency = row.useFrequency

            // 2019-07-30 by-ssj
            const unitOpts = [
                {
                    value: 0,
                    label: row.chara !== '30' && row.chara !== '40' ? row.specUnit : row.unit
                }
            ]
            if (row.isTiny === 1) {
                unitOpts.push({
                    value: 1,
                    label: row.specUseUnit
                })
            }
            pro.opts = unitOpts // 单位
            pro.isTinyRecipe = isWestM ? (row.isTiny === 1 ? 1 : 0) : 1
            pro.price = _price
            pro.oldPrice = row.price // 原销售价
            pro.tinyPrice = row.tinyPrice // 拆零零售价

            this.quickchargeList.push(pro)
            // 收费汇总
            this.quickSum = 0
            this.construtList.forEach(constr => {
                if (pro.chara === constr.chara) {
                    constr.money = add(constr.money, pro.amt)
                }
                this.quickSum = add(this.quickSum, constr.money)
            })
        },

        // 单位变化
        unitChange(val, row, index) {
            row.price = val === 1 ? row.tinyPrice : row.oldPrice
            const temp = row.amt
            row.amt = toFixed(row.price * row.qty, 4)
            this.quickSum = add(this.quickSum, row.amt - temp)
            this.frashAmt(row, index)
        },

        // 修改快速收费的项目总量 计算金额（blur）
        handleBlurChangeTotalNum(val, row, index) {
            row.qty = row.qtySum
                ? isNaN(val) || val <= 0
                    ? 1
                    : val > row.qtySum
                        ? row.qtySum
                        : val
                : isNaN(val) || val <= 0
                    ? 1
                    : val
            this.frashAmt(row, index)
        },
        // 修改快速收费的项目总量 计算金额(input)
        // handleChangeTotalNum(val, row, index) {
        //     this.frashAmt(row, index)
        // },

        // 修改组号
        handleEditGroupNum(val) {
            if (isNaN(val)) {
                this.$message.error('请输入数字')
            }
        },

        // 快速收费第一步收费
        quickOpen() {
            if (this.quickSum >= 0) {
                const detailList = []
                if (this.quickchargeList && this.quickchargeList.length > 0) {
                    this.quickchargeList.forEach(item => {
                        detailList.push({
                            isParent: item.isParent,
                            isStock: item.isStock,
                            itemId: item.id,
                            itemCode: item.code,
                            price: item.price,
                            invoiceItemCode: item.invoiceItemCode,
                            invoiceItemName: item.invoiceItemName,
                            accountItemCode: item.accountItemCode,
                            accountItemName: item.accountItemName,
                            // batchNum: item.batchNum, // ...
                            groupSn: item.groupSn,
                            chara: item.chara,
                            qty: item.qty,
                            itemName: item.name,
                            unit: item.unit,
                            dosage: item.specDose,
                            usage: item.userMethod,
                            spec: item.spec,
                            frequency: item.frequency,
                            isTiny: item.isTiny,
                            isTinyRecipe: item.isTinyRecipe
                        })
                    })
                }

                const data = {
                    detailList,
                    totalAmount: this.quickSum
                }
                if (this.quickChargeType === 1) {
                    data.patientId = this.chargeInfoList.sysPatientId
                    data.registerId = this.chargeInfoList.id
                }
                getUnchargeCount(data).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.chargeAmt = getFloat(d.total, 4)
                        this.insurance = d.insurance

                        this.$nextTick(() => {
                            this.$refs.dialog.open(
                                this.chargeInfoList,
                                this.insurance,
                                this.chargeAmt,
                                detailList,
                                [],
                                this.quickChargeType === 1 ? 'quick' : 'quickSell'
                            )
                        })
                    }
                })
            } else {
                this.$message.warning('合计金额不可以小于0')
            }
        },

        // 剂量变化
        handleBlurDose(val, row, index) {
            row.specDose = isNaN(val) || val <= 0 ? 1 : val // 剂量
            row.qty = row.qtySum
                ? row.specDose * row.days > row.qtySum
                    ? row.qtySum
                    : row.specDose * row.days
                : row.specDose * row.days
            row.days = row.qty / row.specDose // 剂数
            this.frashAmt(row, index)
        },

        // 剂数变化
        handleBlurNum(val, row, index) {
            row.days = isNaN(val) || val <= 0 ? 1 : val // 剂量
            row.qty = row.qtySum
                ? row.specDose * row.days > row.qtySum
                    ? row.qtySum
                    : row.specDose * row.days
                : row.specDose * row.days
            row.specDose = row.qty / row.days // 剂数
            this.frashAmt(row, index)
        },

        // 更新收费汇总等金额
        frashAmt(row, index) {
            let charaAmt = 0
            let total = 0
            this.quickchargeList.forEach((item, i) => {
                if (i === index) {
                    item.amt = multiply(item.price, item.qty)
                }
                if (row.chara === item.chara) {
                    charaAmt = add(charaAmt, item.amt)
                }
            })
            this.construtList.forEach(obj => {
                if (row.chara === obj.chara) {
                    obj.money = charaAmt
                }
                total = add(total, obj.money)
            })
            this.quickSum = total
        },

        handleActive() {
            this.$emit('activeName', 'charge')
        },
        handleSearch() {
            this.$emit('chargeFinish')
        },

        // 选择证件类型
        idNumTypeChange(val) {
            const idNumType = this.quickFormData[6].rules[0]
            if (val === '1') {
                idNumType.message = '请输入正确的身份证号'
                idNumType.pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
            } else {
                idNumType.message = '请输入正确的出生证号'
                idNumType.pattern = /^[a-zA-Z][0-9]{9}$/
            }
        }
    }
}
</script>
<style lang='scss'>
.chargeDetail {
  .mixin-input {
    margin-bottom: 0px;
    .el-form-item__content {
      height: 51px;
      .el-input {
        width: 60px;
      }
      .suffix {
        display: inline-block;
        color: #606266;
        &:not(:last-child) {
          margin-right: 0;
        }
        label {
          font-size: 12px;
          padding-right: 0;
        }

        span {
          font-size: 12px;
        }
      }
    }
  }
}
</style>

