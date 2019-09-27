<template>
    <el-row class="page-container">
        <el-row v-if="libIndex" class="page-main">
            <template v-if="isAdd === 0">
                <el-row class="mt5">
                    <el-col :span="12" class="text-left">
                        <el-button type="primary" icon="el-icon-plus" @click="isAdd = 1;">新增患者</el-button>
                    </el-col>
                    <el-col :span="12" class="text-right">
                        <el-radio-group v-model="listType">
                            <el-radio-button label="0">
                                <i class="el-icon-tickets" />&ensp;列表
                            </el-radio-button>
                            <el-radio-button label="1">
                                <i class="el-icon-picture" />&ensp;卡片
                            </el-radio-button>
                        </el-radio-group>
                    </el-col>
                </el-row>
                <el-row class="toolbar tb-border">
                    <el-col :xs="24" :md="8" :lg="6" class="text-left">
                        <el-radio-group v-model="searchType" @change="searchTypeChange">
                            <el-radio label="1">按患者信息查询</el-radio>
                            <el-radio label="2">按就诊信息查询</el-radio>
                        </el-radio-group>
                    </el-col>
                    <el-col :xs="24" :md="16" :lg="18" class="text-right">
                        <direct-search ref="form" :label-position="'right'" :label-width="'120px'" :form-style="{'text-align':'right'}" :forms="patientSearchList" @handleSearch="handleFormSearch" />
                    </el-col>
                </el-row>
                <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="patientElList" :panel-list="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                <el-table-self v-else :columns="patientColumns" :table-data="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
            </template>
            <template v-else>
                <add-patient @handleCallBack="handleCallBack" />
            </template>
        </el-row>
        <transition name="fade" mode="out-in">
            <keep-alive>
                <router-view />
            </keep-alive>
        </transition>
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { patientPage } from '@/api/arclinic'
import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { defaultPickOpts, formatSex, getBabyAge, paramAvatar } from '@/utils'
import addPatient from './detail/components/addPatient'

export default {
    components: {
        directSearch,
        panelCard,
        elTableSelf,
        addPatient
    },
    mixins: [paginationMixin],
    data() {
        const dictMap = {
            9: [], // 性别
            107: [], // 婚姻状况
            78: [], // 医保类型
            79: [{ value: '', label: '全部' }], // 用户类型
            20: [], // 职业
            25: [], // 与患者关系
            29: [], // 民族
            30: [], // 患者来源
            6: [], // 卡类型
            60: [], // ABO血型
            125: [], // RH血型
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
                        let obj = {}
                        if (item.dictId === 79) {
                            obj = {
                                value: item.name,
                                label: item.name
                            }
                        } else {
                            obj = {
                                value: item.code,
                                label: item.name
                            }
                        }
                        if (item.dictId === 131) {
                            if (item.code === '1' || item.code === '7') {
                                dictMap[item.dictId].push({
                                    value: item.code,
                                    label: item.name
                                })
                            }
                        } else {
                            dictMap[item.dictId].push(obj)
                        }
                    })
                }
            }
        })
        const defaultShowType = this.commonUtil.getConfigValue('defaultShowType') // 列表展示样式
        return {
            libIndex: true, // 病人库
            listType: defaultShowType,
            searchType: '1',
            // 患者档案
            patientSearchList: [
                {
                    type: 'input',
                    label: '',
                    prop: 'condition',
                    placeholder: '输入患者姓名/手机号/健康档案号',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    },
                    showType: '1'
                },
                {
                    type: 'select',
                    label: '',
                    prop: 'insuranceType',
                    placeholder: '用户类型',
                    labelWidth: '0',
                    opts: dictMap[79],
                    showType: '1'
                },
                {
                    type: 'daterange',
                    label: '就诊时间',
                    prop: 'visitingTime',
                    options: defaultPickOpts.opts2,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    hidden: true,
                    showType: '2'
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'diseaseName',
                    placeholder: '西医诊断',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    },
                    hidden: true,
                    showType: '2'
                }
            ],
            // 切换成表格后的列表
            patientColumns: [
                {
                    value: 'name',
                    label: '姓名',
                    operType: 'button',
                    operations: [
                        {
                            type: 'text',
                            func: this.handleToPatient
                        }
                    ]
                },
                {
                    value: 'commercialInsuranceType',
                    label: '用户类型'
                },
                {
                    value: 'opCaseNum',
                    label: '健康档案号'
                },
                {
                    value: 'phone',
                    label: '手机号'
                },
                {
                    value: 'age',
                    label: '年龄'
                },
                {
                    value: 'sex',
                    label: '性别'
                },
                {
                    value: 'regDate',
                    label: '登记时间'
                },
                {
                    value: 'diseaseName',
                    label: '西医诊断'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 250,
                    operType: 'button',
                    operations: [
                        {
                            label: '方便就诊',
                            func: this.handleToRegister
                        },
                        {
                            label: '预约',
                            func: this.handleToAppointment
                        }
                    ]
                }
            ],
            // 卡片列表
            patientElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age',
                    func: this.handleToPatient
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    },
                    {
                        name: '健康档案号',
                        value: 'opCaseNum'
                    },
                    {
                        name: '手机号',
                        value: 'phone'
                    },
                    {
                        name: '登记时间',
                        value: 'regDate'
                    },
                    {
                        name: '西医诊断',
                        value: 'diseaseName'
                    }
                ],
                btnlist: [
                    {
                        name: '方便就诊',
                        func: this.handleToRegister
                    },
                    {
                        name: '预约',
                        func: this.handleToAppointment
                    }
                ]
            },
            dataList: [], // 患者列表
            condition: '',
            diseaseName: '',
            insuranceType: '',
            visitingTime: [],
            isAdd: 0, // 是否是新增患者
            cacheForm: {}
        }
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    mounted() {
        this.routerChange()
    },
    methods: {
        // 路由切换 模块隐藏
        routerChange() {
            this.libIndex = this.$route.name === 'patient'
            if (this.libIndex) {
                this.handleSearch()
            }
        },

        // 切换查询类型
        searchTypeChange(val) {
            this.patientSearchList.map(v => {
                v.hidden = v.showType !== val
            })
            this.pageIndex = 1
            this.condition = ''
            this.insuranceType = ''
            this.diseaseName = ''
            this.visitingTime = []
            this.$refs.form.forms.forEach((item, index) => {
                // 清除form表单内容
                if (this.$refs.form.form[item.prop]) {
                    if (item.prop === 'daterange') {
                        this.$refs.form.form[item.prop] = []
                    } else {
                        this.$refs.form.form[item.prop] = ''
                    }
                }
            })
            this.cacheForm = {}
            this.handleSearch()
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        //  查询患者档案
        handleSearch(form) {
            this.cacheForm = form || this.cacheForm
            const d = Object.assign(this.cacheForm, form)
            if (d) {
                this.condition = d.condition ? d.condition : ''
                this.insuranceType = d.insuranceType ? d.insuranceType : ''
                this.diseaseName = d.diseaseName ? d.diseaseName : ''
                this.visitingTime = d.visitingTime ? d.visitingTime : []
            }
            const params = {
                condition: this.condition,
                diseaseName: this.diseaseName,
                insuranceType: this.insuranceType,
                pageNo: this.pageIndex,
                pageSize: this.pageSize,
                searchType: this.searchType,
                visitingTime: this.visitingTime
            }
            patientPage(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let result = []
                    let total = 0
                    if (d.totalRecord > 0) {
                        d.list.forEach(item => {
                            item.avatar = item.headImg
                                ? this.$store.getters.basic.filePrifix + item.headImg
                                : paramAvatar(item.sex, item.birthDate)
                            item.sex = formatSex(String(item.sex))
                            item.age = item.birthDate
                                ? getBabyAge(String(item.birthDate))
                                : ''
                            item.visitingTime = item.visitingTime
                                ? item.visitingTime.split('.')[0]
                                : ''
                            item.regDate = item.regDate ? item.regDate.split(' ')[0] : ''
                        })
                        result = d.list
                        total = d.totalRecord
                    }
                    this.dataList = result
                    this.total = total
                }
            })
        },

        // 跳转到患者信息
        handleToPatient(item) {
            this.$router.push({
                name: 'patientDetail',
                params: {
                    id: item.id,
                    registerId: item.registerId || 0
                }
            })
        },

        // 跳转预约
        handleToAppointment(item) {
            this.$router.push({
                name: 'detail',
                params: {
                    id: 0,
                    patientId: item.id
                }
            })
        },

        // 跳转登记
        handleToRegister(item) {
            this.$router.push({
                name: 'regDetail',
                params: {
                    type: 'patient',
                    id: item.id
                }
            })
        },

        // 保存成功以及返回回调
        handleCallBack(type) {
            this.isAdd = 0
            if (type === 1) {
                const form = {
                    condition: '',
                    insuranceType: ''
                }
                this.handleFormSearch(form)
            } else {
                this.$nextTick(() => {
                    this.$refs.form.initforms(this.cacheForm)
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.toolbar {
    line-height: 36px;
}
.tb-border {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 20px 0;
}
.form-container {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
    .header-line {
        line-height: 36px;
        .header {
            margin-left: 10px;
            h3 {
                display: inline-block;
                font-size: 14px;
                color: #666;
            }
        }
        .line {
            display: block;
            border-bottom: 1px dashed #ccc;
            margin: 10px 0;
            margin-top: 0;
        }
    }
    .crop-avatar {
        margin-top: 36px;
        margin-left: 20px;
        .image-select {
            border: 1px solid #ddd;
            text-align: center;
            background: #fff;
            padding: 10px;
            cursor: pointer;
            .image-preview {
                width: auto;
                overflow: hidden;
                text-align: center;
                img {
                    display: block;
                    max-width: 100%;
                    height: auto;
                    margin: 0 auto;
                }
            }
            .image-upload {
                margin-top: 10px;
                .el-button {
                    width: 100%;
                }
            }
        }
    }
    .more {
        margin-top: -15px;
        text-align: center;
    }
}
.el-radio {
    margin-right: 10px !important;
}
</style>

