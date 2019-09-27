<template>
    <el-row>
        <el-form ref="form" :rules="rules" :model="form" :label-position="labelPosition" :label-width="labelWidth" :size="size" :disabled="disabled" :inline="true" class="el-form-panel">
            <el-row v-for="(row,rowIndex) in forms" :key="rowIndex">
                <div v-if="rowIndex > 0" class="line" />
                <h2 v-if="row.name" class="title">{{ row.name }}</h2>
                <el-form-item v-for="(col,colIndex) in row.list" v-if="!col.isHidden" :key="colIndex" :label="col.smallName?`${col.name}：${col.smallName}`:`${col.name}：`" :prop="col.basic?col.basicKey? `${col.basicKey}.${col.basic}`: `${col.basic}`:''" :rules="col.rules" :label-width="col.labelWidth" :class="col.className" style="width:100%;">
                    <span v-if="!col.name" slot="label" />
                    <!-- 输入框 -->
                    <el-input v-if="col.type === 'input'" :type="col.inputType?col.inputType:''" :disabled="col.disabled" :placeholder="col.placeholder" v-model="form[col.basic]" :autosize="col.autosize" :maxlength="col.maxlength" />

                    <!-- 日期 -->
                    <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.basic]" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat" />

                    <!-- 选择器 -->
                    <el-select v-else-if="col.type === 'select'" v-model="form[col.basic]" :multiple="col.multiple" placeholder="请选择" @change="col.basic === 'certType'?handleCertChange($event):col.basic === 'title'?handleTitleChange($event):{}">
                        <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value" />
                    </el-select>

                    <!-- 单选框 -->
                    <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.basic]" :label="opt.value" @change="col.basic === 'isQaOnline'?handleRadioChange($event):{}">{{ opt.label }}
                    </el-radio>

                    <!-- 多选框 -->
                    <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.basic]">
                        <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                    </el-checkbox-group>

                    <!-- 开关 -->
                    <el-switch v-else-if="col.type === 'switch'" v-model="form[col.basic]" :active-text="col.activeText" :active-value="col.activeValue" :inactive-value="col.inactiveValue" />

                    <!-- 级联 -->
                    <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.basic]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" filterable />

                    <!-- 上传列表 -->
                    <el-upload-row v-for="(item,index) in col.question" v-else-if="col.type === 'upload'" :key="index" :file="item" :list-type="'picture-card'" :file-list="fileList[item.fileIndex]" :class="{isHidden:tempList1[item.fileIndex].length>=item.limit}" :btn-text="btnText" @uploadSuccess="uploadSuccess" @deleteUpload="deleteUpload" />

                    <!-- 验证码 -->
                    <template v-else-if="col.type === 'userCode'">
                        <el-input :disabled="col.disabled" v-model="form[col.basic]" :placeholder="col.placeholder" :maxlength="col.maxlength" />
                        <img :src="`${authCode}${randomCode}`" class="code" alt="" @click="handleRandom">
                    </template>

                    <!-- 就诊时间 -->
                    <template v-else-if="col.type === 'consultingHour'">
                        <div v-for="(item,itemIndex) in col.list" :key="itemIndex" class="doctor-hour">
                            <span>{{ item.name }}：</span>
                            <el-time-select
                                v-model="form[item.basic][0]"
                                :picker-options="{
                                    start: item.start,
                                    step: item.step,
                                    end: item.end,
                                    maxTime:form[item.basic][1]
                                }"
                                style="width:120px;"
                                placeholder="起始时间"
                            />
                            &ensp;-&ensp;
                            <el-time-select
                                v-model="form[item.basic][1]"
                                :picker-options="{
                                    start: item.start,
                                    step: item.step,
                                    end: item.end,
                                    minTime:form[item.basic][0]
                                }"
                                style="width:120px;"
                                placeholder="结束时间"
                            />
                        </div>
                    </template>

                    <template v-else-if="col.type === 'table'">
                        <div style="margin-bottom:10px;">
                            <span style="color:#616266">(最近累计有效工作时间为3年的经历)</span>
                            <h6 style="display:inline;float:right;font-size:13px">累计{{ monthCount }}月</h6>
                        </div>
                        <el-table-self :columns="col.columns" :table-data="tableData" style="width:900px" />
                    </template>
                </el-form-item>
            </el-row>

        </el-form>
        <el-row v-if="isQaOnline" style="margin-bottom: 10px;margin-left: 200px;">
            <el-checkbox v-model="isTrue" style="color:#FF0000">本人保证以上所填执业信息真实有效，如不真实愿接受主管卫生部门一切处罚，后果自负。</el-checkbox>
        </el-row>
        <el-row v-if="canEdit" style="text-align:center;">
            <el-button v-if="!isQaOnline && type === 'personModify'" type="success" @click="hanldeApply">申请开展互联网诊疗</el-button>
            <el-button v-if="!disabled" :disabled="isDisabled" :size="size" :loading="loading" type="primary" style="padding-left:50px;padding-right:50px;" @click="handleClick">{{ btnText }}</el-button>
            <span v-if="btnText==='立即注册'" class="register">已有账号
                <router-link :to="'login'">登录</router-link>
            </span>
        </el-row>
        <!-- 个人中心显示 -->
        <el-row v-if="isQaOnline && type === 'personModify'" class="internetDiagnosis">

            <el-row v-if="form.onlineCheckStatus === 1">
                <div class="title1">您已开通互联网诊疗！</div>
                <div class="title2">已拥有以下"特殊权限"</div>
                <div class="title3">(请及时更新资质证书与工作经历并发起"特殊权限升级认证"可升级权限)</div>
                <el-button type="primary" plain>已拥有</el-button>
                <el-row v-for="(item,index) in specialColumns" v-if="item.isHave(form)" :key="index" class="btn">
                    <span class="before">{{ item.label }}</span>
                    <el-tooltip :content="item.tips" class="item" effect="dark" placement="right-start">
                        <el-button icon="el-icon-question" type="text" style="font-size:16px" />
                    </el-tooltip>
                </el-row>
                <el-row v-if="haveCount === 0">
                    <span style="margin-top:10px;display:block">（暂未拥有特殊权限）</span>
                </el-row>
                <el-button plain>未拥有</el-button>
                <el-row v-for="(item,index) in specialColumns" v-if="!item.isHave(form)" :key="index" class="btn">
                    <span class="before">{{ item.label }}</span>
                    <el-tooltip :content="item.tips" class="item" effect="dark" placement="right-start">
                        <el-button icon="el-icon-question" type="text" style="font-size:16px" />
                    </el-tooltip>
                </el-row>
                <el-row v-if="notHaveCount ===0">
                    <span style="margin-top:10px;display:block">（暂无未拥有权限）</span>
                </el-row>
                <el-button v-if="disabled && notHaveCount !==0" type="success" style="display:block" @click="handleEmit">特殊权限升级认证</el-button>
            </el-row>
            <el-row v-else>
                <div class="title1">您已申请开通互联网诊疗！</div>
                <div class="title2">{{ `${form.onlineCheckStatus?'审核未通过':'未审核'}` }}</div>
                <div v-if="form.onlineCheckStatus" class="title3">审核备注：{{ form.onlineCheckNote || '无' }}</div>
            </el-row>
        </el-row>

    </el-row>

</template>

<script>
import { param2Obj, disabledPickerOpts } from '@/utils'
import elUploadRow from '@/components/Upload/index'
import elTableSelf from '@/components/TabComponents/index'

export default {
    components: {
        elUploadRow,
        elTableSelf
    },
    props: {
        size: { type: String, default: 'small' },
        labelPosition: { type: String, default: 'right' },
        labelWidth: { type: String },

        forms: { type: Array },
        rules: { type: Object },
        btnText: { type: String, default: '提交审核' },
        canEdit: { type: Boolean, default: true },
        disabled: { type: Boolean, default: false },
        type: { type: String }
    },
    data() {
        return {
            isDisabled: false,
            authCode: process.env.VUE_APP_API_ROOT + '/upms/code/',
            // authCode: 'http://192.168.1.9:10999/upms/code/',
            randomCode: 0,
            form: {
                morning: ['', ''],
                afternoon: ['', ''],
                night: ['', ''],
                isQaOnline: 0
            },
            loading: false,
            fileList: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: [],
                i10: [],
                i11: [],
                i12: []
            },
            tempList: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: [],
                i10: [],
                i11: [],
                i12: []
            },
            tempList1: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: [],
                i10: [],
                i11: [],
                i12: []
            },
            tableData: [
                {
                    workYears: ''
                }
            ],
            isTrue: '',
            isQaOnline: false,
            expense: {
                type: 'table',
                name: '工作经历',
                basic: 'experienceList',
                columns: [
                    {
                        label: '执业单位',
                        value: 'company',
                        operType: 'input',
                        showInput: true
                    },
                    {
                        label: '执业起止时间',
                        value: 'date',
                        operType: 'date',
                        showDate: true,
                        dateType: 'daterange',
                        width: 280,
                        format: 'yyyy-MM-dd',
                        func: this.changeDate,
                        valueFormat: 'yyyy-MM-dd 00:00:00',
                        options: disabledPickerOpts
                    },
                    {
                        label: '职称',
                        value: 'title',
                        operType: 'input',
                        showInput: true
                    },
                    {
                        label: '是否独立执业',
                        value: 'isIndependentPractice',
                        operType: 'radio',
                        opts: [
                            {
                                label: '否',
                                value: '0'
                            },
                            {
                                label: '是',
                                value: '1'
                            }
                        ],
                        width: 150
                    },
                    {
                        label: '工作年限',
                        value: 'workYears',
                        width: 100,
                        formatter(row) {
                            return row.workYears + '月'
                        }
                    },
                    {
                        label: '操作',
                        operType: 'icon',
                        operations: [
                            {
                                func: this.deleteWorkExpense,
                                iconClass: 'el-icon-remove-outline',
                                style: 'font-size:18px;color:red',
                                isHidden(row, index) {
                                    return !(index !== 0)
                                }
                            },
                            {
                                iconClass: 'el-icon-circle-plus-outline',
                                style: 'font-size:18px;color:red',
                                func: this.addWorkExpense
                            }
                        ]
                    }
                ]
            },
            monthCount: 0,
            specialColumns: [
                {
                    label: '线上诊疗权',
                    value: 'authOnlineOutpatient',
                    tips:
                        '该权限仅分配给取得医师资格证书和执业证书并拥有3年以上临床经验的执业医师',
                    isHave(row) {
                        return row.authOnlineOutpatient === 1
                    }
                },
                {
                    label: '审方发药权',
                    value: 'authOnlineCheckRecipe',
                    tips: '该权限仅分配给取得职业资格证书和执业证书的药师',
                    isHave(row) {
                        return row.authOnlineCheckRecipe === 1
                    }
                },
                {
                    label: '非限制级抗生素处方权',
                    value: 'antibioticLevel',
                    tips: '该权限分配给拥有初级及以上职称的医师',
                    isHave(row) {
                        return (
                            row.antibioticLevel === 2 ||
                            row.antibioticLevel === 3
                        )
                    }
                },
                {
                    label: '限制级抗生素处方权',
                    value: 'antibioticLevel',
                    tips: '该权限分配给拥有中级及以上职称的医师',
                    isHave(row) {
                        return (
                            row.antibioticLevel === 1 ||
                            row.antibioticLevel === 2 ||
                            row.antibioticLevel === 3
                        )
                    }
                },
                {
                    label: '特殊级抗生素处方权',
                    value: 'antibioticLevel',
                    tips: '该权限仅分配给拥有高级职称的医师',
                    isHave(row) {
                        return row.antibioticLevel === 3
                    }
                }
            ],
            haveCount: 0,
            notHaveCount: 0,
            cacheList: []
        }
    },
    watch: {
        forms(newVal) {
            this.formatForm()
        },
        isTrue(newVal, oldVal) {
            if (newVal) {
                this.isDisabled = false
            } else {
                this.isDisabled = true
            }
        }
    },
    mounted() {
        this.formatForm()
    },
    methods: {
        // 改变表单源数据
        formatForm() {
            const form = {}
            if (this.btnText === '立即注册') {
                const randomCode = new Date().getTime()
                this.randomCode = randomCode
                form.randomDTO = {
                    randomCode
                }
            }
            if (this.isQaOnline && this.forms[1].list.length < 4) {
                this.forms[1].list.push(this.expense)
            }
            this.forms.forEach(row => {
                row.list.forEach(col => {
                    if (col.type === 'consultingHour') {
                        col.list.forEach(item => {
                            form[item.basic] = ['', '']
                        })
                    } else {
                        if (col.basic) {
                            if (
                                col.type === 'cascader' ||
                                col.type === 'checkbox'
                            ) {
                                form[col.basic] = []
                            } else {
                                form[col.basic] = ''
                            }
                        }
                    }
                })
            })
            this.form = JSON.parse(JSON.stringify(form))
            this.$nextTick(() => {
                this.$refs.form.resetFields()
            })
        },

        // 表单赋值
        initforms(edit) {
            const form = {}
            if (this.type === 'personModify') {
                this.forms[1].list[0].isHidden = true
            }

            this.forms.forEach(row => {
                row.list.forEach(col => {
                    if (col.type === 'consultingHour') {
                        col.list.forEach(item => {
                            form[item.basic] = ['', '']
                        })
                    } else {
                        if (col.basic) {
                            if (
                                col.type === 'cascader' ||
                                col.type === 'checkbox'
                            ) {
                                form[col.basic] = []
                            } else {
                                form[col.basic] = ''
                            }
                        }
                    }
                })
            })
            if (edit) {
                // 初始化证件验证规则
                this.handleCertChange(edit.data.certType || 1)
                this.form = Object.assign(form, edit.data)
                const list = edit.attachmentList
                const fileList = {
                    i1: [],
                    i2: [],
                    i3: [],
                    i4: [], // 诊所
                    i5: [], // 诊所
                    i6: [], // 诊所
                    i9: [],
                    i10: [],
                    i11: [],
                    i12: []
                }
                if (list && list.length > 0) {
                    list.forEach(item => {
                        const file = {
                            businessId: item.businessId,
                            businessType: item.businessType,
                            name: item.fileName,
                            url:
                                this.$store.getters.basic.filePrifix +
                                item.filePath,
                            fileType: item.fileType,
                            id: item.id
                        }
                        if (
                            item.businessType === 1 ||
                            item.businessType === 20
                        ) {
                            fileList.i1.push(file)
                        } else if (
                            item.businessType === 3 ||
                            item.businessType === 21
                        ) {
                            fileList.i2.push(file)
                        } else if (
                            item.businessType === 4 ||
                            item.businessType === 22
                        ) {
                            fileList.i3.push(file)
                        } else if (item.businessType === 23) {
                            fileList.i4.push(file)
                        } else if (item.businessType === 24) {
                            fileList.i5.push(file)
                        } else if (item.businessType === 28) {
                            fileList.i6.push(file)
                        } else if (item.businessType === 9) {
                            fileList.i9.push(file)
                        } else if (item.businessType === 5) {
                            fileList.i10.push(file)
                        } else if (item.businessType === 6) {
                            fileList.i11.push(file)
                        } else if (item.businessType === 7) {
                            fileList.i12.push(file)
                        }
                    })
                }

                this.fileList = fileList
                this.tempList1 = Object.assign({}, fileList)
                this.tempList = list
                this.cacheList = list
                let haveCount = 0
                if (this.form.authOnlineOutpatient === 1) {
                    haveCount++
                }
                if (this.form.authOnlineCheckRecipe === 1) {
                    haveCount++
                }
                if (
                    this.form.antibioticLevel === 2 ||
                    this.form.antibioticLevel === 3
                ) {
                    haveCount++
                }
                if (
                    this.form.antibioticLevel === 1 ||
                    this.form.antibioticLevel === 2 ||
                    this.form.antibioticLevel === 3
                ) {
                    haveCount++
                }
                if (this.form.antibioticLevel === 3) {
                    haveCount++
                }
                this.notHaveCount = 5 - haveCount
                this.haveCount = haveCount
                this.tableData = []
                if (edit.experienceList && edit.experienceList.length > 0) {
                    edit.experienceList.forEach(item => {
                        this.tableData.push({
                            id: item.id,
                            company: item.company,
                            date: [item.startTime, item.endTime],
                            title: item.title,
                            isIndependentPractice: String(
                                item.isIndependentPractice
                            ),
                            workYears: item.workYears
                        })
                    })
                } else {
                    this.tableData.push({
                        workYears: 0
                    })
                }
                console.log(this.form, '123')
                this.isQaOnline = this.form.isQaOnline
                this.handleRadioChange(this.form.isQaOnline)
                this.handleTitleChange(this.form.title)
                let month = 0
                this.tableData.forEach(item => {
                    month += item.workYears
                })
                this.monthCount = month
            } else {
                this.form = Object.assign({}, form)
            }
        },

        // 重置loading
        resetLoading(boolean = false) {
            this.loading = boolean
        },

        // 证件类型变化
        handleCertChange(val) {
            const validateList = [
                {
                    pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                    message: '请输入正确的身份证号码'
                },
                {
                    pattern: /^[a-zA-Z0-9]{5,21}$/, // /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/,
                    message: '请输入正确的港澳通行证号码'
                },
                {
                    pattern: /^[a-zA-Z0-9]{7,21}$/, // /[\u4e00-\u9fa5](字第){1}(\d{4,8})(号?)$/,
                    message: '请输入正确的军人证号码'
                },
                {
                    pattern: /^1[45][0-9]{7}|([P|p|S|s]\d{7})|([S|s|G|g]\d{8})|([Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8})|([H|h|M|m]\d{8，10})$/,
                    message: '请输入正确的护照号码'
                },
                {
                    pattern: /^[a-zA-Z][0-9]{9}$/,
                    message: '请输入正确的出生证号码'
                }
            ]
            const current =
                val === '7' ? validateList[4] : validateList[val - 1]
            this.forms[0].list.forEach(item => {
                if (item.basic === 'certCode') {
                    item.rules[1].pattern = current.pattern
                    item.rules[1].message = current.message
                }
            })
            // if (val === '1') {
            //     this.forms[0].list[4].rules[1].message = '请输入正确的身份证号码'
            //     this.forms[0].list[4].rules[1].pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
            // } else if (val === '7') {
            //     this.forms[0].list[4].rules[1].message = '请输入正确的出生证号码'
            //     this.forms[0].list[4].rules[1].pattern = /^[a-zA-Z][1-3]{3}[0-9]{6}$/
            // }
        },

        // 切换账号类型
        handleSwitch(index) {
            this.$emit('handleSwitch', index)
        },

        // 获取随机图片
        handleRandom() {
            const randomCode = new Date().getTime()
            this.randomCode = randomCode
            this.form.randomDTO.randomCode = randomCode
        },

        // 下一步、保存
        handleClick() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.loading = true
                    const tpl = this.form
                    if (tpl.morning) {
                        // 诊所
                        if (tpl.subjectList && tpl.subjectList.length === 0) {
                            this.$message.error('请至少选择一项诊疗科目')
                            this.loading = false
                            return false
                        }
                        const subjectList = []
                        tpl.subjectList.forEach(item => {
                            subjectList.push(param2Obj(item))
                        })

                        const params = {
                            attachmentList: tpl.attachmentList || [],
                            subjectList,
                            orgInfo: {},
                            org: {}
                        }

                        params.orgInfo = {
                            address: tpl.address,
                            afternoonOpenTime:
                                tpl.afternoon.join('-') === '-'
                                    ? ''
                                    : tpl.afternoon.join('-'),
                            city: tpl.level3[1] || '',
                            district: tpl.level3[2] || '',
                            id: tpl.orgInfoId || 0,
                            introduction: tpl.introduction,
                            isCommercialInsurance: tpl.isCommercialInsurance,
                            isHolidayOpen: tpl.isHolidayOpen,
                            isMedicalInsurance: tpl.isMedicalInsurance,
                            isSharePatientInfo: tpl.isSharePatientInfo,
                            licenseName: tpl.licenseName,
                            licenseNum: tpl.licenseNum,
                            morningOpenTime:
                                tpl.morning.join('-') === '-'
                                    ? ''
                                    : tpl.morning.join('-'),
                            name: tpl.name,
                            nightOpenTime:
                                tpl.night.join('-') === '-'
                                    ? ''
                                    : tpl.night.join('-'),
                            orgId: tpl.orgId,
                            province: tpl.level3[0] || '',
                            telephone: tpl.telephone,
                            sysOrgId: tpl.sysOrgId || 0
                        }

                        params.org = {
                            code: tpl.code,
                            name: tpl.name,
                            orgLevel: tpl.orgLevel,
                            parentId: tpl.parentId || tpl.orgId,
                            id: tpl.id || 0
                        }
                        this.$emit('handleClick', params)
                    } else if (tpl.realName) {
                        // 医生
                        const params = {
                            attachmentList:
                                tpl.attachmentList || this.cacheList || [],
                            base: {},
                            staff: {}
                        }
                        const experienceList = []
                        if (!this.forms[1].list[2].isHidden) {
                            this.tableData.forEach(item => {
                                if (item.date) {
                                    item.startTime = item.date[0]
                                    item.endTime = item.date[1]
                                    if (
                                        item.company &&
                                        item.startTime &&
                                        item.endTime &&
                                        item.isIndependentPractice &&
                                        item.title &&
                                        item.workYears
                                    ) {
                                        experienceList.push({
                                            company: item.company,
                                            startTime: item.startTime,
                                            endTime: item.endTime,
                                            isIndependentPractice:
                                                item.isIndependentPractice,
                                            title: item.title,
                                            workYears: item.workYears,
                                            id: item.id || 0
                                        })
                                    }
                                }
                            })

                            if (tpl.isQaOnline && experienceList.length <= 0) {
                                this.$message.warning('请至少填一条工作经历')
                                this.loading = false
                                return
                            }
                        }

                        params.staff = {
                            birthday: tpl.birthday,
                            certCode: tpl.certCode,
                            certType: tpl.certType,
                            certificateCode: tpl.certificateCode,
                            depart: tpl.depart,
                            hospital: tpl.hospital,
                            isQaOnline: tpl.isQaOnline,
                            officeTelephone: tpl.officeTelephone,
                            orgId: tpl.orgId,
                            position: tpl.position,
                            practiceCode: tpl.practiceCode,
                            realName: tpl.realName,
                            sex: tpl.sex,
                            specialSkill: tpl.specialSkill,
                            specialtyCode: tpl.specialtyCode,
                            title: tpl.title,
                            titleCertCode: tpl.titleCertCode,
                            workYears: tpl.workYears
                        }
                        params.experienceList = experienceList
                        const notRequired =
                            tpl.title >= 250 || tpl.isQaOnline === 0

                        if (!notRequired) {
                            if (
                                params.attachmentList &&
                                params.attachmentList.length > 0
                            ) {
                                let i10 = 0
                                let i11 = 0
                                let i12 = 0
                                params.attachmentList.forEach(item => {
                                    if (item.businessType === 5) {
                                        i10++
                                    } else if (
                                        item.businessType === 6 ||
                                        item.businessType === 3
                                    ) {
                                        i11++
                                    } else if (
                                        item.businessType === 7 ||
                                        item.businessType === 4
                                    ) {
                                        i12++
                                    }
                                })
                                if (i10 !== 1) {
                                    this.$message.warning(
                                        '请上传医护人员职称证书照片'
                                    )
                                    this.loading = false
                                    return false
                                } else if (i11 !== 2) {
                                    this.$message.warning(
                                        '请上传医护人员资格证书照片'
                                    )
                                    this.loading = false
                                    return false
                                } else if (i12 !== 2) {
                                    this.$message.warning(
                                        '请上传医护人员执业证书照片'
                                    )
                                    this.loading = false
                                    return false
                                }
                            } else {
                                this.$message.warning('请上传证书照片')
                                this.loading = false
                                return false
                            }
                        }

                        this.$emit('handleClick', params)
                    } else {
                        // 账号
                        this.$emit('handleClick', tpl)
                    }
                } else {
                    window.scrollTo(0, 0)
                }
            })
        },

        // 文件上传成功
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
            this.tempList[obj.fileIndex] = result
            this.tempList1[obj.fileIndex] = result

            let attachmentList = []
            for (const key in this.tempList) {
                attachmentList = attachmentList.concat(this.tempList[key])
            }
            this.form.attachmentList = attachmentList
        },

        // 删除图片回调
        deleteUpload(file) {
            let fileIndex = null
            if (file.businessType === 1 || file.businessType === 20) {
                fileIndex = 'i1'
            } else if (file.businessType === 3 || file.businessType === 21) {
                fileIndex = 'i2'
            } else if (file.businessType === 4 || file.businessType === 22) {
                fileIndex = 'i3'
            } else if (file.businessType === 23) {
                fileIndex = 'i4'
            } else if (file.businessType === 24) {
                fileIndex = 'i5'
            } else if (file.businessType === 29) {
                fileIndex = 'i6'
            } else if (file.businessType === 9) {
                fileIndex = 'i9'
            } else if (file.businessType === 5) {
                fileIndex = 'i10'
            } else if (file.businessType === 6) {
                fileIndex = 'i11'
            } else if (file.businessType === 7) {
                fileIndex = 'i12'
            }
            if (!file.id) {
                this.tempList[fileIndex].splice(0, 1)
            }
            this.tempList1[fileIndex].splice(0, 1)
            let attachmentList = []
            for (const key in this.tempList) {
                attachmentList = attachmentList.concat(this.tempList[key])
            }
            this.form.attachmentList = attachmentList
        },

        // 添加工作经历
        addWorkExpense(row, index) {
            if (row.date) {
                row.startTime = row.date[0]
                row.endTime = row.date[1]
            }
            if (
                row.company &&
                row.endTime &&
                row.startTime &&
                row.isIndependentPractice &&
                row.title &&
                row.workYears
            ) {
                this.tableData.push({
                    workYears: 0
                })
            } else {
                this.$message.warning('请先将本条数据填写完整')
            }
            let month = 0
            this.tableData.forEach(item => {
                month += item.workYears
            })
            this.monthCount = month
        },

        deleteWorkExpense(row, index) {
            this.tableData.splice(index, 1)
            let month = 0
            this.tableData.forEach(item => {
                month += item.workYears
            })
            this.monthCount = month
        },

        // 起止时间改变
        changeDate(row, index) {
            row.workYears = row.date
                ? this.commonUtil.getDateMinus(row.date[0], row.date[1])
                : 0
            let month = 0
            this.tableData.forEach(item => {
                month += item.workYears
            })
            this.monthCount = month
        },

        handleEmit() {
            this.$emit('emit')
        },

        // 申请开展互联网诊疗
        hanldeApply() {
            this.form.isQaOnline = 1
            this.$emit('emit')
            this.handleRadioChange(this.form.isQaOnline)
        },

        handleCancel() {
            this.isDisabled = false
            //   this.isQaOnline = false
            this.forms[1].list[2].isHidden = true
            if (this.forms[1].list.length === 4) {
                this.forms[1].list[3].isHidden = true
            }
        },

        // 是否开展互联网诊疗
        handleRadioChange(val) {
            const isOnline = val === 1
            this.isQaOnline = isOnline
            this.isDisabled = isOnline
            if (isOnline) {
                const title = this.form.title // 职称
                if (
                    title === '230' ||
                    title === '231' ||
                    title === '232' ||
                    title === '233' ||
                    title === '234' ||
                    title === '235'
                ) {
                    this.arrangeForms(1)
                } else if (
                    title === '240' ||
                    title === '242' ||
                    title === '243' ||
                    title === '244' ||
                    title === '245'
                ) {
                    this.arrangeForms(2)
                } else {
                    this.arrangeForms(3)
                }
            } else {
                this.arrangeForms(3)
            }
        },

        // 职称改变
        handleTitleChange(val) {
            if (this.form.isQaOnline === 1) {
                if (
                    val === '230' ||
                    val === '231' ||
                    val === '232' ||
                    val === '233' ||
                    val === '234' ||
                    val === '235'
                ) {
                    this.arrangeForms(1)
                } else if (
                    val === '240' ||
                    val === '242' ||
                    val === '243' ||
                    val === '244' ||
                    val === '245'
                ) {
                    this.arrangeForms(2)
                } else {
                    this.arrangeForms(3)
                }
            }
        },

        // 职称或是否开展互联网诊疗改变
        arrangeForms(type) {
            const arr = [11, 12, 15, 16, 17, 18]
            // 是否必填
            const isRequired = type === 1 || type === 2
            for (let i = 0; i < arr.length; i++) {
                this.forms[0].list[arr[i]].rules[0].required = isRequired
            }
            // 是否医师
            this.forms[1].list[2].isHidden = type !== 1
            if (type === 1) {
                // 医师类
                if (this.forms[1].list.length < 4) {
                    this.forms[1].list.push(this.expense)
                }
            } else {
                // 药师类、护士、技师类
                if (this.forms[1].list.length === 4) {
                    this.forms[1].list.splice(3, 1)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.el-form-panel {
    .el-input,
    .el-date-editor.el-input__inner,
    .el-textarea {
        width: 296px;
    }
    .cell {
        .el-input,
        .el-date-editor {
            width: 100%;
        }
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #606266;
    }
    .subject {
        .el-form-item__content {
            width: 675px;
        }
    }
}
.isHidden .el-upload--picture-card {
    display: none;
}
</style>

<style lang="scss" scoped>
.el-form-panel {
    .line {
        width: 100%;
        height: 20px;
        border-top: 1px dashed #ccc;
    }
    h2.title {
        font-size: 18px;
        color: #4a4a4a;
        padding-left: 20px;
        margin-bottom: 10px;
    }
    .register {
        font-size: 14px;
        color: #606265;
        margin-left: 20px;
        a {
            color: #409eff;
            &:hover {
                text-decoration: underline;
            }
        }
    }
    .code {
        width: 96px;
        height: 28px;
        float: right;
        margin-left: 10px;
    }
    .doctor-hour {
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
        > span {
            color: #606266;
        }
    }
}
.internetDiagnosis {
    position: absolute;
    top: 0;
    right: 100px;
    .title1 {
        font-size: 50px;
        color: #0091ff;
        font-weight: bold;
        margin: 25px 0 5px;
    }
    .title2 {
        color: #0091ff;
        font-size: 30px;
    }
    .title3 {
        color: #000;
        font-size: 14px;
        margin-top: 10px;
    }
    .el-button {
        margin-top: 30px;
    }
    .btn {
        .el-button {
            margin: 0;
        }
    }
    span {
        color: #666666;
        font-size: 14px;
        position: relative;
    }
    .before {
        margin-left: 15px;
    }
    .before:before {
        position: absolute;
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #909090;
        top: 5px;
        left: -15px;
    }
}
</style>
