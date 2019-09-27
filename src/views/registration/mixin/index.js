import {
    getDepartmentOpts,
    getOrgClinicStaffList
} from '@/api/org'
import {
    getAccrualList
} from '@/api/catalog'
import {
    uploadFile
} from '@/api/upload'
import {
    generateOpNum,
    modifyRegister2,
    selectByName
} from '@/api/arclinic'
// import { getUnchargeList } from '@/api/outpatient'
import moment from 'moment'
import {
    param,
    deepClone,
    param2Obj,
    getBabyAge,
    disabledPickerOpts,
    formatSex,
    formatReverseSex
} from '@/utils'

import {
    remove_ie_header_and_footer
} from '@/utils/print'
import store from '../../../store'
import cityList from '@/common/data/city.js'
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
var dictMap_store = store.getters.dictData
var onOff = false
dictMap_store[20].forEach(item => {
    if (item.label === '无') {
        onOff = true
    }
})
if (!onOff) {
    dictMap_store[20].push({
        label: '无',
        value: ''
    })
}

const defaultForm = {
    idNumType: '1',
    // 'ageDay': 0, // --
    // 'ageMonth': 0, // --
    // 'ageYear': 0, // --
    // appointmentId: 0, // 预约
    // 'areaCode': '', // --
    attachmentList: [], // 头像+附件
    birthDate: '', // 出生日期
    cardNum: '', // 卡号
    cardType: '', // 卡类型
    // 'caseNum': '', // -- 病历号
    // 'chargStatus': '', // -- 收费状态
    // chargItemName: '', // 收费项目名称
    // chargeItemCode: '', // 收费项目code
    chargeItemStr: '', // 收费项目
    chargeAmount: '', // 收费金额
    // commercialInsuranceCode: '',
    // commercialInsuranceType: '',
    commercialInsuranceStr: param({
        commercialInsuranceCode: 99,
        commercialInsuranceType: '自费'
    }), // 用户类型
    contactMan: '', // 联系人姓名
    contactSex: '', // 联系人性别
    // contactTel: '', // 联系人手机号
    // departCode: '',
    // departId: 0,
    // departName: '',
    departStr: '', // 科室
    // doctorCode: '',
    // doctorId: 0,
    // doctorName: '',
    doctorStr: '', // 医生
    familyAddr: '', // 详细地址
    registerId: 0, // 新增登记为0
    idNum: '', // 身份证件
    isFirstClinic: 1, // 是否初次就诊
    matrialStatus: '10', // 婚姻状况
    // medicalInsuranceCode: '',
    // medicalInsuranceType: '',
    medicalInsuranceStr: '', // 医保类型
    patientName: '', // 姓名
    nation: '01', // 民族
    note: '', // 备注
    occupation: '', // 职业
    // 'orgId': 0, // --
    // 'orgName': '', // --
    // outpatientNum: '', // 门诊号
    outpatientType: '门诊', // 就诊方式
    patientSources: '03', // 患者来源
    phone: '', // 手机号
    regType: '', // 登记类型
    region: [], // 三级地址
    // relationName: '',
    contactManRel: '', // 与患者关系
    sex: '', // 性别
    patientId: 0, // 新增患者为0
    // 'userId': 0,
    // 'wechat': '', // -- 微信
    workOrg: '', // 工作单位
    age: '', // --不传入
    ageYear: '',
    ageMonth: '',
    ageDay: ''
}

const mixin = {
    data() {
        const isTriage = this.commonUtil.getConfigValue('isTriage') // 是否分诊
        const firstReviewOffer = this.commonUtil.getConfigValue(
            'firstReviewOffer'
        ) // 是否初复诊优惠

        const isRequirePhone = this.commonUtil.getConfigValue('isRequirePhone') // 手机号是否必填
        const defaultRegDepartment = this.commonUtil.getConfigValue(
            'defaultRegDepartment'
        ) // 登记默认科室
        const defaultRegType = this.commonUtil.getConfigValue('defaultRegType') // 默认登记类型

        const cloneForm = deepClone(defaultForm)
        if (defaultRegDepartment) {
            cloneForm.departStr = defaultRegDepartment
        }
        if (defaultRegType) {
            cloneForm.regType = defaultRegType
        }
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
        const doctorList = [{
            value: '',
            label: '请选择'
        }]
        getOrgClinicStaffList({
            pageNo: 1,
            pageSize: 100,
            userType: 1,
            isUse: 1
        }).then(res => {
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
        // 收费项目
        const accrualList = [{
            value: '',
            price: '',
            label: '请选择'
        }]
        const cacheAccrualList = [{
            value: '',
            price: '',
            label: '请选择'
        }]
        getAccrualList().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        if (item.name.indexOf('推广') <= -1) {
                            cacheAccrualList.push({
                                value: param({
                                    chargeItemCode: item.code,
                                    chargeItemName: item.name
                                }),
                                price: item.price,
                                label: item.name
                            })
                        }

                        if (firstReviewOffer === '1') {
                            if (item.name.indexOf('初诊') > -1) {
                                accrualList.push({
                                    value: param({
                                        chargeItemCode: item.code,
                                        chargeItemName: item.name
                                    }),
                                    price: item.price,
                                    label: item.name
                                })
                            }
                        } else {
                            if (
                                item.name.indexOf('诊疗') > -1 &&
                                item.name.indexOf('普通') > -1
                            ) {
                                accrualList.push({
                                    value: param({
                                        chargeItemCode: item.code,
                                        chargeItemName: item.name
                                    }),
                                    price: item.price,
                                    label: item.name
                                })
                            }
                        }
                    })
                }
            }
        })

        return {
            isPrint: this.commonUtil.getConfigValue('isPrintRegistrationForm ') === '1',
            allLoading: false,
            accrualList,
            cacheAccrualList,
            loading: false,
            unknownAvatar,
            avatar: '',
            fileList: [],
            patientCard: '', // 患者卡号
            showMore: false, // 更多
            wechatImg: '', // 微信二维码
            outpatientNum: this._generateOpNum(),
            form: cloneForm,
            always: cloneForm,
            formDoms: [{
                name: '患者信息',
                items: [{
                    type: 'text',
                    name: '门诊号',
                    lg: 24,
                    sm: 24
                },
                {
                    type: 'autoComplete',
                    name: '姓名',
                    field: 'patientName',
                    rules: [{
                        required: true,
                        message: '患者姓名必填',
                        trigger: 'blur'
                    }],
                    disabled: false,
                    func: this.querySearchAsync,
                    selectfun: this.handleSelect
                    // slot: {
                    //     slot: 'append',
                    //     type: 'button',
                    //     icon: 'el-icon-search',
                    //     func: this.searchPatient
                    // }
                },
                {
                    type: 'select',
                    name: '性别',
                    field: 'sex',
                    opts: dictMap_store[9],
                    rules: [{
                        required: true,
                        message: '性别必填',
                        trigger: 'blur'
                    }]
                },
                {
                    type: 'date',
                    name: '出生日期',
                    field: 'birthDate',
                    options: disabledPickerOpts,
                    rules: [{
                        required: true,
                        message: '请选择出生日期',
                        trigger: 'blur'
                    }],
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    func: this.formatAge
                },
                {
                    type: 'input',
                    name: '手机号',
                    field: 'phone',
                    maxlength: 11,
                    rules: [{
                        pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                        message: '请输入正确的手机号',
                        trigger: 'blur'
                    },
                    {
                        required: isRequirePhone === '1',
                        message: '手机号必填',
                        trigger: 'blur'
                    }
                    ]
                },
                {
                    type: 'select',
                    field: 'idNumType',
                    name: '证件类型',
                    placeholder: '请选择证件类型',
                    opts: dictMap_store[131],
                    func: this.idNumTypeChange
                },
                {
                    type: 'input',
                    name: '证件号码',
                    field: 'idNum',
                    rules: [{
                        pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                        // pattern: /^[a-zA-Z][1-3]{3}[0-9]{6}$/,
                        message: '请输入正确的身份证号',
                        trigger: 'blur'
                    }]
                },
                {
                    type: 'mixin-input',
                    name: '年龄',
                    className: 'mixin-input',
                    field: 'age',
                    list: [{
                        type: 'input',
                        field: 'ageYear',
                        rules: [{
                            pattern: /\d/,
                            message: '只能输入数字',
                            trigger: 'blur'
                        }],
                        suffix: '岁',
                        func: this.formatBirthday
                    },
                    {
                        type: 'input',
                        field: 'ageMonth',
                        rules: [{
                            pattern: /\d/,
                            message: '只能输入数字',
                            trigger: 'blur'
                        }],
                        suffix: '月',
                        func: this.formatBirthday
                    },
                    {
                        type: 'input',
                        field: 'ageDay',
                        rules: [{
                            pattern: /\d/,
                            message: '只能输入数字',
                            trigger: 'blur'
                        }],
                        suffix: '天',
                        func: this.formatBirthday
                    }
                    ],
                    rules: [{
                        // pattern: /^[1-9]{1}\d{0,1}(岁)?$/,
                        pattern: /^(([1-9]{1}\d{0,1})(年|岁)?)?(([1-9]{1}|1[0-2]{1})(月)?)?(([1-9]{1}|[1-2]{1}\d|3[0-1]{1})(天|日)?)?(([1-9]{1}|[1-6]{1}\d|7[0-2]{1})(小时)?)?$/,
                        message: '请输入正确的年龄',
                        trigger: 'blur'
                    }]
                    // disabled: true,
                    // func: this.formatBirthday
                },
                {
                    type: 'cascader',
                    name: '地址',
                    field: 'region',
                    changeOnSelect: false, // 是否允许选择任意一级的选
                    list: cityList
                },
                {
                    type: 'select',
                    name: '医保类型',
                    field: 'medicalInsuranceStr',
                    opts: dictMap_store[78]
                },
                {
                    type: 'input',
                    name: '详细地址',
                    field: 'familyAddr',
                    lg: 16
                }
                    // {
                    //     type: 'wechat'
                    // }
                ]
            },
            {
                name: '',
                hidden: true,
                items: [{
                    type: 'select',
                    name: '民族',
                    field: 'nation',
                    opts: dictMap_store[29]
                },
                {
                    type: 'select',
                    name: '患者来源',
                    field: 'patientSources',
                    opts: dictMap_store[30],
                    disabled: false
                },
                {
                    type: 'select',
                    name: '卡类型',
                    field: 'cardType',
                    opts: dictMap_store[6]
                },
                {
                    type: 'input',
                    name: '卡号',
                    field: 'cardNum'
                },
                {
                    type: 'select',
                    name: '用户类型',
                    field: 'commercialInsuranceStr',
                    opts: dictMap_store[79],
                    disabled: false,
                    rules: [{
                        required: true,
                        message: '用户类型必填',
                        trigger: 'change'
                    }]
                },
                {
                    type: 'input',
                    name: '联系人姓名',
                    field: 'contactMan'
                },
                {
                    type: 'select',
                    name: '联系人性别',
                    field: 'contactSex',
                    opts: dictMap_store[9]
                },
                {
                    type: 'select',
                    name: '与患者关系',
                    field: 'contactManRel',
                    opts: dictMap_store[25]
                },
                {
                    type: 'select',
                    name: '婚姻状况',
                    field: 'matrialStatus',
                    opts: dictMap_store[107]
                },
                {
                    type: 'select',
                    name: '职业',
                    field: 'occupation',
                    opts: dictMap_store[20]
                },
                {
                    type: 'input',
                    name: '工作单位',
                    field: 'workOrg'
                },
                {
                    type: 'input',
                    name: '备注',
                    field: 'note',
                    lg: 16
                }
                ]
            },
            {
                name: '挂号信息',
                items: [{
                    type: 'select',
                    name: '科室',
                    field: 'departStr',
                    rules: [{
                        required: true,
                        message: '科室必选',
                        trigger: 'blur'
                    }],
                    opts: departmentList
                },
                {
                    type: 'select',
                    name: '医师',
                    field: 'doctorStr',
                    opts: doctorList,
                    rules: [{
                        required: isTriage !== '1',
                        message: '医师必填',
                        trigger: 'change'
                    }]
                },
                {
                    type: 'select',
                    name: '就诊方式',
                    field: 'outpatientType',
                    rules: [{
                        required: true,
                        message: '就诊方式必选',
                        trigger: 'blur'
                    }],
                    opts: dictMap_store[70]
                },
                {
                    type: 'select',
                    name: '登记类型',
                    field: 'regType',
                    rules: [{
                        required: true,
                        message: '登记类型必选',
                        trigger: 'blur'
                    }],
                    opts: dictMap_store[41],
                    func: this.handleChangeRegtype
                },
                {
                    type: 'radio',
                    name: '是否初诊',
                    field: 'isFirstClinic',
                    opts: [{
                        value: 1,
                        label: '是'
                    },
                    {
                        value: 0,
                        label: '否'
                    }
                    ],
                    func: this.handleChangeIsFirstclinic
                }
                ]
            },
            {
                name: '收费信息',
                items: [{
                    type: 'select',
                    name: '收费项目',
                    field: 'chargeItemStr',
                    opts: accrualList,
                    func: this.chargeItemChange,
                    disabled: false
                },
                {
                    type: 'number',
                    name: '收费金额',
                    min: 0,
                    precision: 2,
                    field: 'chargeAmount',
                    disabled: false
                }
                ]
            },
            {
                name: '上传附件',
                items: [{
                    type: 'upload',
                    accept: 'image/jpeg,image/png,application/pdf,application/msword,application/vnd.ms-excel',
                    file: {
                        tip: '只能上传图片、pdf和文档文件，且不超过5MB',
                        limit: 5,
                        size: 5242880,
                        sizeLimitTip: '文件大小不可超过5MB',
                        fileType: 42
                    },
                    xs: 12,
                    sm: 12,
                    lg: 12
                }]
            }
            ],
            params: [],
            dom: null,
            type: '',
            firstReviewOffer,
            patientInfo: {}
        }
    },
    watch: {
        cacheAccrualList(newVal, oldVal) {
            if (newVal.length > 1) {
                const defaultRegType = this.commonUtil.getConfigValue(
                    'defaultRegType'
                ) // 默认登记类型
                if (this.form.commercialInsuranceCode !== '12') {
                    this.handleChangeRegtype(
                        this.patientInfo.regType || defaultRegType
                    )
                } else {
                    this.chargeItemsOpts()
                }
            }
        }
    },
    methods: {
        // 改变收费项目-影响收费金额
        chargeItemChange(val) {
            if (this.accrualList.length > 0) {
                this.accrualList.forEach(item => {
                    if (item.value === val) {
                        this.form.chargeAmount = item.price
                    }
                })
            }
        },

        // 生成系统门诊号
        _generateOpNum() {
            generateOpNum().then(res => {
                if (res.STATUS === '1') {
                    let number = ''
                    const d = res.ITEMS
                    if (d.number) {
                        number = d.number
                    }
                    this.outpatientNum = number
                }
            })
        },

        // 切换更多信息
        handleShowMore() {
            this.showMore = !this.showMore
            this.formDoms[1].hidden = !this.showMore
        },

        // 转换年纪
        formatAge(val) {
            this.form.age = val ? getBabyAge(val) : ''
            if (val) {
                const temp = getBabyAge(val)
                const month = temp.indexOf('岁') > -1 ? temp.split('岁')[1] : temp
                const day = month.indexOf('月') > -1 ? month.split('月')[1] : month
                this.form.ageYear = temp.indexOf('岁') > -1 ? temp.split('岁')[0] : ''
                this.form.ageMonth = month.indexOf('月') > -1 ? month.split('月')[0] : ''
                this.form.ageDay = day.indexOf('天') > -1 ? day.split('天')[0] : ''
            }
        },

        // 转换生日
        // formatBirthday(val) {
        //     if (val) {
        //         if (isNaN(val)) {
        //             const temp = val.replace(/岁|年/, '|')
        //             if (temp.indexOf('|') > -1) {
        //                 const distance = temp.split('|')[0]
        //                 this.form.birthDate = moment()
        //                     .subtract(distance, 'y')
        //                     .format('YYYY-MM-DD 00:00:00')
        //             }
        //         } else {
        //             this.form.birthDate = moment()
        //                 .subtract(val, 'y')
        //                 .format('YYYY-MM-DD 00:00:00')
        //         }
        //     }
        // },

        // 转换生日
        formatBirthday() {
            const years = this.form.ageYear ? this.form.ageYear : 0
            const months = this.form.ageMonth ? this.form.ageMonth : 0
            const days = this.form.ageDay ? this.form.ageDay : 0
            this.form.birthDate = moment()
                .subtract(years, 'y').subtract(months, 'months').subtract(days, 'd').format('YYYY-MM-DD 00:00:00')
        },

        // 点击上传
        uploadAvatar() {
            const dom =
                this.$refs.fileInput.constructor === Array
                ? this.$refs.fileInput[0]
                : this.$refs.fileInput
            dom.click()
        },

        // 上传头像
        fileChange(e) {
            var files = e.target.files
            var formData = new FormData()
            formData.append('fileType', 40)
            formData.append('file', files[0])

            if (files[0]) {
                uploadFile(formData).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.avatar =
                            this.$store.getters.basic.filePrifix + d[0].filePath
                        const attachmentList = this.form.attachmentList.filter(
                            item => item.businessType === 42
                        )
                        this.form.attachmentList = attachmentList.concat(d)
                        this.$message.success('上传成功')
                    }
                })
            }
        },

        // 上传成功
        uploadSuccess(fileList, obj) {
            const result = []
            // 只处理本次上传
            fileList.forEach(item => {
                if (item.response) {
                    const col = item.response.ITEMS[0]
                    result.push({
                        businessType: col.businessType,
                        fileName: col.fileName,
                        fileNote: '',
                        filePath: col.filePath,
                        fileSize: col.fileSize,
                        fileType: obj.fileType
                    })
                }
            })
            const attachmentList = this.form.attachmentList.filter(
                item => item.businessType === 40
            )
            this.form.attachmentList = attachmentList.concat(result)
        },

        // 删除
        handleRemove(file) {
            if (
                this.form.attachmentList &&
                this.form.attachmentList.length > 0
            ) {
                this.form.attachmentList.forEach((item, index) => {
                    if (file.filePath === item.filePath) {
                        this.form.attachmentList.splice(index, 1)
                    }
                })
            }
        },

        // 完成登记
        handleConfirm(type) {
            // 缓存表单数据变量
            const temp_form = this.form
            if (!temp_form.idNum && !temp_form.phone) {
                this.$message.warning('登记时手机号或证件号码必填')
                return false
            }
            if (temp_form.idNum && !temp_form.idNumType) {
                this.$message.warning('请选择证件类型！')
                return false
            }
            if (
                ((temp_form.chargeAmount || temp_form.chargeAmount === 0) &&
                    temp_form.chargeItemStr) ||
                (!temp_form.chargeAmount && !temp_form.chargeItemStr)
            ) {
                const dom =
                    this.$refs.form.constructor === Array
                    ? this.$refs.form[0]
                    : this.$refs.form
                dom.validate(valid => {
                    if (valid) {
                        this.loading = true
                        const form = deepClone(temp_form)
                        form.outpatientNum = this.outpatientNum
                        const departmentObj = param2Obj(form.departStr) // 科室
                        const doctorObj = param2Obj(form.doctorStr) // 医生
                        const chargeObj = param2Obj(form.chargeItemStr) // 收费项目
                        const medicalInsuranceObj = param2Obj(
                            form.medicalInsuranceStr
                        ) // 医保类型
                        const commercialInsuranceObj = param2Obj(
                            form.commercialInsuranceStr
                        ) // 用户类型
                        const params = Object.assign(
                            departmentObj,
                            doctorObj,
                            chargeObj,
                            medicalInsuranceObj,
                            commercialInsuranceObj,
                            form
                        )
                        delete params.age
                        delete params.departStr
                        delete params.doctorStr
                        delete params.chargeItemStr
                        delete params.medicalInsuranceStr
                        delete params.commercialInsuranceStr
                        // return
                        if (type === 'charge') {
                            this.$confirm('是否使用优惠券收挂号费?', '提示', {
                                confirmButtonText: '不使用',
                                cancelButtonText: '使用',
                                closeOnClickModal: false,
                                type: 'warning'
                            })
                                .then(() => {
                                    this.handleCharge(params, dom, type)
                                })
                                .catch(() => {
                                    this.handleRegister(params, dom, 'toCharge')
                                })
                        } else {
                            this.handleRegister(params, dom, type)
                        }
                    } else {
                        this.$message.error('检测到有必填项为空')
                        window.scrollTo(0, 0)
                    }
                })
            } else {
                this.$message.warning('收费项目和收费金额必须同时存在')
            }
        },

        // 完成登记、
        handleRegister(params, dom, type) {
            modifyRegister2(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (type === 'charge') {
                            this.$refs.chargeDialog.handleRegisterChange(d)
                        } else if (type === 'toCharge') {
                            this.$router.push({
                                name: 'charge'
                            })
                        }
                        if (this.$route.name === 'registration') {
                            dom.resetFields()
                            this.form = this.always
                            this.handleChangeRegtype(this.form.regType)
                            this.avatar = ''
                            this.fileList = []
                            this.form.attachmentList = []
                            this.outpatientNum = this._generateOpNum()
                        }
                        if (this.$route.name === 'regDetail') {
                            this.form.patientId = d.sysPatientId
                            this.form.registerId = d.id
                        }
                        this.$message.success('登记成功')
                        this.$nextTick(() => {
                            // 打印登记
                            if (this.isPrint && type !== 'charge') {
                                this.handlePrint(res.ITEMS)
                            }
                            this.isPrint = this.commonUtil.getConfigValue('isPrintRegistrationForm ') === '1'
                            // if (this.$route.params.type) {
                            //     this.isPrint = false
                            // } else {
                            //     this.isPrint = true
                            // }
                        })

                        window.scrollTo(0, 0)
                        this.loading = false
                    }
                })
                .catch(() => {
                    this.loading = false
                })
        },

        // 完成登记并收费
        handleCharge(params, dom, type) {
            this.loading = false
            if (params.chargeAmount > 0) {
                this.$refs.chargeDialog.open({}, {},
                    params.chargeAmount,
                    [],
                    [],
                    'register',
                    this.isPrint
                )
            } else {
                this.$message.error('收费金额必须大于0')
            }
            this.params = params
            this.dom = dom
            this.type = type
        },

        // 打印挂号单
        handlePrint(item) {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const orgName = this.$store.getters.clinic.orgName
            const date = item.regDate ? item.regDate.split(' ')[0] : ''
            const doctorName =
                item.patientStatus === 0 ? '未分诊' : item.doctorName || ''
            const chargeAmount =
                item.chargeAmount || item.chargeAmount === 0
                ? `￥${item.chargeAmount}`
                : ''
            const content = `
                <div class="print patientRes">
                    <div class="page">
                        <h2>${orgName}</h2>
                        <h3>登记单</h3>
                        <div class="main">
                            <div class="content">
                                <div class="item">
                                    <label>科室：<span> ${
    item.deptName
}</span></label>
                                </div>
                                <div class="item">
                                    <label>医生姓名： <span>${doctorName}</span></label>
                                </div>
                                <div class="item">
                                    <label>挂号时间：<span>${date}</span></label>
                                </div>
                                <div class="item">
                                    <label>排队序号：<span>${item.sn ||
                                        ''}</span></label>
                                </div>
                            </div>
                            <div class="content">
                                <div class="item">
                                    <label>患者姓名：<span>${
    item.name
}</span></label>
                                </div>
                                <div class="item">
                                    <label>诊金：<span>${chargeAmount}</span></label>
                                </div>
                            </div>
                            <div class="content">
                                <div class="item">
                                    <label class="beizhu">注：挂号当日有效，过期作废！</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            const newContent = content
            const oldContent = document.body.innerHTML
            document.body.innerHTML = newContent

            window.print()
            window.location.reload()
            document.body.innerHTML = oldContent
            return false
        },

        // 绑定微信弹窗--测试
        // wechat() {
        //     this.wechatImg =
        //         `${process.env.VUE_APP_API_ROOT}his-download/qrcode/qrcode.jpg`
        //     const dom =
        //         this.$refs.wechat.constructor === Array
        //             ? this.$refs.wechat[0]
        //             : this.$refs.wechat
        //     dom.open()
        // },

        startCharge() {
            this.handleRegister(this.params, this.dom, this.type)
        },

        // 姓名的模糊查询
        querySearchAsync(queryString, cb) {
            if (queryString) {
                let nameResults = []
                selectByName(queryString).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d && d.length > 0) {
                            nameResults = Object.assign(d)
                            d.forEach((item, index) => {
                                nameResults[index].sex = formatSex(item.sex)
                            })
                        }
                        cb(nameResults)
                    }
                })
            } else {
                cb([])
            }
        },

        // 选择姓名
        handleSelect(item) {
            const d = Object.assign({}, item)
            const tempForm = {
                ageYear: '',
                ageMonth: '',
                ageDay: '',
                patientName: d.name,
                age: getBabyAge(d.birthDate),
                sex: formatReverseSex(d.sex),
                // doctorStr: '',
                regType: this.always.regType,
                departStr: this.always.departStr,
                outpatientType: '门诊',
                isFirstClinic: 0,
                chargeItemStr: '',
                chargeAmount: '',
                // patientSources: d.patientSources !== '01' ? d.patientSources : '03',
                patientSources: '03',
                commercialInsuranceStr: d.commercialInsuranceCode &&
                    d.commercialInsuranceType &&
                    (d.commercialInsuranceCode !== '3' ||
                        d.commercialInsuranceType !== '宝无忧')
                    ? param({
                        commercialInsuranceCode: d.commercialInsuranceCode,
                        commercialInsuranceType: d.commercialInsuranceType
                    }) : param({
                        commercialInsuranceCode: 99,
                        commercialInsuranceType: '自费'
                    }),
                contactManRel: d.contactManRelation,
                medicalInsuranceStr: d.medicalInsuranceCode && d.medicalInsuranceType
                    ? param({
                        medicalInsuranceCode: d.medicalInsuranceCode,
                        medicalInsuranceType: d.medicalInsuranceType
                    }) : ''
            }
            this.form = Object.assign(d, tempForm)
            this.avatar = d.headImg
                ? this.$store.getters.basic.filePrifix + d.headImg
                : this.unknownAvatar

            const dom =
                this.$refs.form.constructor === Array
                ? this.$refs.form[0]
                : this.$refs.form
            dom.resetFields()
            this.formatAge(d.birthDate)
            this.idNumTypeChange(d.idNumType)
            if (this.cacheAccrualList.length > 1) {
                this.handleChangeRegtype(d.regType)
            }
        },
        // 选择证件类型
        idNumTypeChange(val) {
            const idNumType = this.formDoms[0].items[6].rules[0]
            if (val === '1') {
                idNumType.message = '请输入正确的身份证号'
                idNumType.pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
            } else {
                idNumType.message = '请输入正确的出生证号'
                idNumType.pattern = /^[a-zA-Z][0-9]{9}$/
            }
        },

        // 登记类型改变
        handleChangeRegtype(val) {
            this.allLoading = false
            if (!val) return false
            if (val === '1') {
                if (this.firstReviewOffer === '1') {
                    if (this.form.isFirstClinic !== null && this.form.isFirstClinic !== undefined) {
                        if (this.form.isFirstClinic === 1) {
                            this.chargeItemsOpts('初诊')
                        } else {
                            this.chargeItemsOpts('复诊')
                        }
                    } else {
                        this.chargeItemsOpts()
                    }
                } else {
                    this.chargeItemsOpts('诊疗', '普通')
                }
            } else if (val === '2') {
                this.chargeItemsOpts('专家')
            } else {
                this.chargeItemsOpts('诊疗')
            }
        },

        // 是否初诊改变
        handleChangeIsFirstclinic(val) {
            if (this.firstReviewOffer === '1') {
                if (this.form.regType && val !== null) {
                    if (this.form.regType === '1') {
                        if (val === 1) {
                            this.chargeItemsOpts('初诊')
                        } else {
                            this.chargeItemsOpts('复诊')
                        }
                    } else if (this.form.regType === '2') {
                        this.chargeItemsOpts('专家')
                    } else {
                        this.chargeItemsOpts('诊疗')
                    }
                } else {
                    if (!val) {
                        this.chargeItemsOpts()
                    }
                }
            }
        },

        // 收费项目下拉选项
        chargeItemsOpts() {
            this.accrualList = []
            this.cacheAccrualList.forEach(item => {
                if (arguments.length > 1) {
                    if (item.label.indexOf(arguments[0]) > -1 &&
                        item.label.indexOf(arguments[1]) > -1) {
                        this.accrualList.push(item)
                    }
                } else if (arguments.length > 0) {
                    if (item.label.indexOf(arguments[0]) > -1) {
                        this.accrualList.push(item)
                    }
                } else {
                    this.accrualList.push(item)
                }
            })
            this.$nextTick(() => {
                this.formDoms[3].items[0].opts = this.accrualList
                if (this.form.commercialInsuranceCode !== '12') {
                    this.form.chargeItemStr =
                        this.accrualList.length === 1 ? this.accrualList[0].value
                        : ''
                    this.form.chargeAmount =
                        this.accrualList.length === 1
                        ? this.accrualList[0].price
                        : 0.0
                }
            })
        }
    }
}
export default mixin
