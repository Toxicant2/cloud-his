<template>
    <el-row>
        <div class="round-btn-group">
            <el-radio-group v-model="activeName">
                <el-radio-button :label="item.value" v-for="(item,index) in stoageType" :key="index">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i> {{item.name}}
                </el-radio-button>
            </el-radio-group>
        </div>

        <direct-search ref="form" :label-position="'right'" :form-style="{'text-align':'left','margin':'20px 5px'}" :forms="searchList" @handleSearch="handleSearch" />

        <report-header :org-name="orgName" :tab-title="tableTitle" :search-date="searchDate" :edit-able="activeName !== 'drugAdd' && activeName !== 'drugOut'" @print="_handlePrint" @export="handleExportExcel"/>

        <el-table-self v-if="activeName === 'drugAddDetail'||activeName === 'drugOutDetail'||activeName === 'drugDetailOut'" :list-loading="listLoading" :getSummaries="getSummaries" :columns="columns" :table-data="listData" :show-summary="true" :key="activeName" />

        <el-table-self v-else :list-loading="listLoading" :columns="columns" :table-data="listData"  :key="activeName" />
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import {
    getDrugReportList,
    getDrugGetDatas,
    exportInGoods,
    exportOutGoods,
    getDrugOutData,
    exportDrugDetailOut
} from '@/api/statement'
import { getOrgOpts, getDepartmentOpts, getOrgClinicStaffList } from '@/api/org'
import { getOpSkDealerList } from '@/api/pharmacy'

import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'
import elTableSelf from '@/components/TabComponents/index'
import formDialog from '@/components/DialogComponents/Form'
import reportHeader from '../common/ReportHeader'

import { getTotalRow, getTabTotalRow, handlePrint } from '../common/index.js'

import { toFixed } from '@/utils/float'
import { pickerOptions, formatDictMap } from '@/utils'
import { getCurrentDay, getSevenDays } from '@/utils/common'
import { exportExcelCb } from '@/utils/exportExcel'

import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        panelCard,
        elTableSelf,
        formDialog,
        reportHeader
    },
    data() {
        const dictMap = {
            141: [{ value: '99', label: '门诊出库' }], // 出入库方式
            '141_in': [{ value: '', label: '全部' }],
            '141_out': [{ value: '', label: '全部' }, { value: '99', label: '门诊出库' }],
            489: [{ value: '', label: '全部' }] // 收费项目类型
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
                        obj = {
                            value: item.code,
                            label: item.name
                        }
                        if (item.dictId === 141) {
                            if (item.note === '1') {
                                dictMap['141_in'].push(obj)
                            } else if (item.note === '2') {
                                dictMap['141_out'].push(obj)
                            }
                        }
                        dictMap[item.dictId].push(obj)
                    })
                }
            }
        })
        // 机构
        const orgOptList = []
        getOrgOpts({ type: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    orgOptList.push({
                        value: item.id,
                        label: item.name
                    })
                })
            }
        })

        // 科室
        const departmentOptsData = [{ 'label': '全部', 'value': '' }]
        getDepartmentOpts().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    departmentOptsData.push({
                        value: item.name,
                        label: item.name
                    })
                })
            }
        })

        // 供应商
        const data = { 'dealerType': 'a' }
        const dealerList = [{ 'label': '全部', 'value': '' }]
        getOpSkDealerList(data).then(res => {
            if (res.ITEMS && res.ITEMS.length > 0) {
                res.ITEMS.forEach((item, index) => {
                    dealerList[index + 1] = { 'label': item.dealerName, 'value': item.dealerName }
                })
            }
        })

        // 医师
        const doctorList = [{
            value: '',
            label: '全部'
        }]
        getOrgClinicStaffList({ pageNo: 1, pageSize: 100, userType: 1, isUse: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.totalRecord > 0) {
                    d.list.forEach(item => {
                        doctorList.push({
                            value: item.userRealName,
                            label: item.userRealName
                        })
                    })
                }
            }
        })

        return {
            listLoading: false,
            // 诊所名称
            orgName: '',
            dictMap,
            orgOptList,
            cacheForm: {},
            // 查询日期
            searchDate: '',
            activeName: 'drugAdd',
            stoageType: [
                {
                    name: '入库统计',
                    value: 'drugAdd'
                }, {
                    name: '出库统计',
                    value: 'drugOut'
                }, {
                    name: '入库明细统计',
                    value: 'drugAddDetail'
                }, {
                    name: '出库明细统计',
                    value: 'drugOutDetail'
                }, {
                    name: '发药明细统计',
                    value: 'drugDetailOut'
                }
            ],
            // 对应关系地图
            tabMaps: {
                drugAdd: {
                    name: '入库统计报表',
                    changeType: 0,
                    fetchUrl: getDrugGetDatas,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            hidden: true,
                            prop: 'orgId',
                            placeholder: '请选择',
                            opts: orgOptList
                        }, {
                            type: 'daterange',
                            dateType: 'datetimerange',
                            label: '',
                            labelWidth: '0',
                            prop: 'dates',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd HH:mm:ss',
                            valueFormat: 'yyyy-MM-dd HH:mm:ss'
                        }, {
                            type: 'select',
                            prop: 'changeMode',
                            label: '入库方式',
                            placeholder: '请选择',
                            fixed: 'left',
                            opts: dictMap['141_in']
                        }, {
                            type: 'select',
                            prop: 'dealerName',
                            label: '供应商',
                            hidden: true,
                            placeholder: '供应商',
                            opts: dealerList
                        }, {
                            type: 'input',
                            label: '',
                            prop: 'changeNum',
                            placeholder: '入库单号',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            label: '',
                            prop: 'createUserName',
                            placeholder: '制单人',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'changeNum',
                            label: '入库单号',
                            align: 'center',
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleDetail
                                }
                            ]
                        }, {
                            value: 'changeTime',
                            label: '入库时间',
                            align: 'center'
                        }, {
                            value: 'changeMode',
                            label: '入库方式',
                            align: 'center'
                        }, {
                            value: 'dealerName',
                            label: '供应商',
                            align: 'center'
                        }, {
                            value: 'createUserName',
                            label: '制单人',
                            align: 'center'
                        }
                    ]
                },
                drugOut: {
                    name: '出库统计报表',
                    changeType: 1,
                    fetchUrl: getDrugGetDatas,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            hidden: true,
                            prop: 'orgId',
                            placeholder: '请选择',
                            opts: orgOptList
                        }, {
                            type: 'daterange',
                            dateType: 'datetimerange',
                            label: '',
                            labelWidth: '0',
                            prop: 'dates',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd HH:mm:ss',
                            valueFormat: 'yyyy-MM-dd HH:mm:ss'
                        }, {
                            type: 'select',
                            label: '出库方式',
                            prop: 'changeMode',
                            placeholder: '请选择',
                            opts: dictMap['141_out']
                        }, {
                            type: 'select',
                            label: '领用科室',
                            prop: 'deptName',
                            hidden: true,
                            placeholder: '请选择',
                            opts: departmentOptsData
                        }, {
                            type: 'select',
                            label: '供应商',
                            hidden: true,
                            prop: 'dealerName',
                            placeholder: '请选择',
                            opts: dealerList
                        }, {
                            type: 'input',
                            label: '',
                            prop: 'userName',
                            placeholder: '出库人',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            label: '',
                            prop: 'changeNum',
                            placeholder: '出库单号',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'changeNum',
                            label: '出库单号',
                            align: 'center',
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleDetail
                                }
                            ]
                        }, {
                            value: 'changeTime',
                            label: '出库时间',
                            align: 'center'
                        }, {
                            value: 'changeMode',
                            label: '出库方式',
                            align: 'center'
                        }, {
                            value: 'dealerName',
                            label: '供应商',
                            align: 'center',
                            hidden: false
                        }, {
                            value: 'deptName',
                            label: '领用科室',
                            align: 'center',
                            hidden: false
                        }, {
                            value: 'userName',
                            label: '领用人员',
                            align: 'center'
                        }, {
                            value: 'createUserName',
                            label: '出库人员',
                            align: 'center'
                        }
                    ]
                },
                drugAddDetail: {
                    name: '入库明细统计报表',
                    changeType: 0,
                    fetchUrl: getDrugReportList,
                    exportDownLoadUrl: exportInGoods,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            hidden: true,
                            prop: 'orgId',
                            placeholder: '请选择',
                            opts: orgOptList
                        }, {
                            type: 'daterange',
                            dateType: 'datetimerange',
                            label: '',
                            labelWidth: '0',
                            prop: 'dates',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd HH:mm:ss',
                            valueFormat: 'yyyy-MM-dd HH:mm:ss'
                        }, {
                            type: 'select',
                            label: '入库方式',
                            prop: 'changeMode',
                            placeholder: '请选择',
                            opts: dictMap['141_in']
                        }, {
                            type: 'select',
                            label: '供应商',
                            prop: 'dealerName',
                            placeholder: '请选择',
                            opts: dealerList
                        }, {
                            type: 'input',
                            label: '收费项目名称',
                            placeholder: '收费项目名称',
                            prop: 'catName',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'select',
                            prop: 'catType',
                            label: '收费项目类型',
                            placeholder: '收费项目类型',
                            opts: dictMap[489]
                        }
                    ],
                    columns: [
                        {
                            value: 'changeTime',
                            label: '入库日期',
                            width: 160
                        }, {
                            value: 'changeNum',
                            label: '入库单号',
                            width: 160,
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleDetail
                                }
                            ]
                        }, {
                            value: 'changeMode',
                            label: '入库方式'
                        }, {
                            value: 'dealerName',
                            label: '供应商'
                        }, {
                            value: 'createUserName',
                            label: '入库人员'
                        }, {
                            value: 'catCode',
                            label: '收费项目编码',
                            width: 100
                        }, {
                            value: 'catName',
                            label: '收费项目名称',
                            width: 100
                        }, {
                            value: 'catType',
                            label: '类别',
                            width: 80
                        }, {
                            value: 'spec',
                            label: '规格',
                            width: 120
                        }, {
                            value: 'manufacturerName',
                            label: '生产厂商'
                        }, {
                            value: 'storageNum',
                            label: '数量'
                        }, {
                            value: 'dispUnit',
                            label: '单位',
                            width: 80
                        }, {
                            value: 'retailPrice',
                            label: '零售价'
                        }, {
                            value: 'purchasePrice',
                            label: '成本价'
                        }, {
                            value: 'purchasePriceAmt',
                            label: '成本合计',
                            count: true
                        }, {
                            value: 'batch',
                            label: '批号'
                        }, {
                            value: 'expiryDate',
                            label: '有效期',
                            formatter(item) {
                                return item.expiryDate ? item.expiryDate.split(' ')[0] : ''
                            }
                        }
                    ]
                },
                drugOutDetail: {
                    name: '出库明细统计报表',
                    changeType: 1,
                    fetchUrl: getDrugReportList,
                    exportDownLoadUrl: exportOutGoods,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            hidden: true,
                            prop: 'orgId',
                            placeholder: '请选择',
                            opts: orgOptList
                        }, {
                            type: 'daterange',
                            dateType: 'datetimerange',
                            label: '',
                            labelWidth: '0',
                            prop: 'dates',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd HH:mm:ss',
                            valueFormat: 'yyyy-MM-dd HH:mm:ss'
                        }, {
                            type: 'select',
                            label: '出库方式',
                            prop: 'changeMode',
                            placeholder: '请选择',
                            opts: dictMap['141_out']
                        }, {
                            type: 'select',
                            prop: 'dealerName',
                            label: '供应商',
                            placeholder: '供应商',
                            opts: dealerList
                        }, {
                            type: 'select',
                            prop: 'depName',
                            labelWidth: '82px',
                            label: '科室',
                            placeholder: '科室',
                            opts: departmentOptsData
                        }, {
                            type: 'input',
                            label: '收费项目名称',
                            placeholder: '收费项目名称',
                            prop: 'catName',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'select',
                            prop: 'catType',
                            label: '收费项目类型',
                            placeholder: '收费项目类型',
                            opts: dictMap[489]
                        }
                    ],
                    columns: [
                        {
                            value: 'changeTime',
                            label: '出库日期',
                            width: 160
                        }, {
                            value: 'changeNum',
                            label: '出库单号',
                            width: 160,
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleDetail
                                }
                            ]
                        }, {
                            value: 'changeMode',
                            label: '出库方式'
                        }, {
                            value: 'dealerName',
                            label: '供应商'
                        }, {
                            value: 'deptName',
                            label: '领用科室'
                        }, {
                            value: 'userName',
                            label: '领用人员'
                        }, {
                            value: 'createUserName',
                            label: '出库人员'
                        }, {
                            value: 'catCode',
                            label: '收费项目编码',
                            width: 100
                        }, {
                            value: 'catName',
                            label: '收费项目名称',
                            width: 100
                        }, {
                            value: 'catType',
                            label: '类别',
                            width: 80
                        }, {
                            value: 'spec',
                            label: '规格',
                            width: 120
                        }, {
                            value: 'manufacturerName',
                            label: '生产厂商'
                        }, {
                            value: 'storageNum',
                            label: '数量'
                        }, {
                            value: 'dispUnit',
                            label: '单位',
                            width: 80
                        }, {
                            value: 'retailPrice',
                            label: '零售价'
                        }, {
                            value: 'purchasePrice',
                            label: '成本价'
                        }, {
                            value: 'purchasePriceAmt',
                            label: '成本合计',
                            count: true
                        }, {
                            value: 'batch',
                            label: '批号'
                        }, {
                            value: 'expiryDate',
                            label: '有效期',
                            formatter(item) {
                                return item.expiryDate ? item.expiryDate.split(' ')[0] : ''
                            }
                        }
                    ]
                },
                drugDetailOut: {
                    name: '发药明细统计报表',
                    changeType: 1,
                    fetchUrl: getDrugOutData,
                    exportDownLoadUrl: exportDrugDetailOut,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            hidden: true,
                            prop: 'orgId',
                            placeholder: '请选择',
                            opts: orgOptList
                        }, {
                            type: 'daterange',
                            dateType: 'datetimerange',
                            label: '',
                            labelWidth: '0',
                            prop: 'dates',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd HH:mm:ss',
                            valueFormat: 'yyyy-MM-dd HH:mm:ss'
                        }, {
                            type: 'select',
                            prop: 'depName',
                            label: '开方科室',
                            placeholder: '开方科室',
                            opts: departmentOptsData
                        }, {
                            type: 'select',
                            prop: 'recipeDoctor',
                            label: '开方医师',
                            placeholder: '开方医师',
                            opts: doctorList
                        }, {
                            type: 'input',
                            label: '收费项目名称',
                            prop: 'catName',
                            hiddenItem: true,
                            placeholder: '收费项目名称',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'select',
                            label: '收费项目类型',
                            prop: 'catType',
                            hiddenItem: true,
                            placeholder: '收费项目类型',
                            opts: dictMap[489]
                        }, {
                            type: 'input',
                            labelWidth: '82px',
                            label: '处方号',
                            hiddenItem: true,
                            prop: 'recipeNum',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            labelWidth: '82px',
                            label: '病人姓名',
                            hiddenItem: true,
                            prop: 'patientName',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'button',
                            color: 'primary',
                            labelWidth: '0px',
                            value: '更多选择',
                            prop: 'catName',
                            func: this.changeHiddenForm
                        }
                    ],
                    columns: [
                        {
                            value: 'changeTime',
                            label: '日期',
                            width: 150
                        }, {
                            value: 'patientName',
                            label: '病人姓名',
                            width: 120
                        }, {
                            value: 'recipeNum',
                            label: '处方号'
                        }, {
                            value: 'recipeDoctor',
                            label: '开方医师',
                            width: 80
                        }, {
                            value: 'disBillNum',
                            label: '发药单号'
                        }, {
                            value: 'catName',
                            label: '收费项目名称'
                        }, {
                            value: 'spec',
                            label: '规格'
                        }, {
                            value: 'dispUnit',
                            label: '单位',
                            width: 50
                        }, {
                            value: 'catType',
                            label: '类别',
                            width: 80
                        }, {
                            value: 'depName',
                            label: '开方科室',
                            width: 80
                        }, {
                            value: 'disUserName',
                            label: '发药人',
                            width: 80
                        }, {
                            value: 'batch',
                            label: '批次',
                            width: 80
                        }, {
                            value: 'storageNum',
                            label: '数量',
                            count: true,
                            width: 80
                        }, {
                            value: 'purchasePrice',
                            label: '进价',
                            width: 80
                        }, {
                            value: 'retailPrice',
                            label: '售价',
                            width: 80
                        }, {
                            value: 'purchasePriceAmt',
                            label: '进价金额',
                            count: true,
                            width: 80
                        }, {
                            value: 'retailPriceAmt',
                            label: '售价金额',
                            count: true,
                            width: 70
                        }, {
                            value: 'chajiajiner',
                            label: '零售差额',
                            count: true,
                            width: 70
                        }
                    ]
                }
            },
            // 二级标题
            tableTitle: '',
            //  查询条件
            searchList: [],
            // 普通表格列数据
            columns: [],
            // 普通表格数据
            listData: [],
            total: [],
            HiddenFormActive: false
        }
    },
    computed: {
        ...mapGetters(['clinic'])
    },
    watch: {
        activeName() {
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.cacheForm = {
                dates
            }
            this.HiddenFormActive = false
            this.handleSearch()
        },
        HiddenFormActive() {
            this.$refs.form.changeHiddenForm(this.HiddenFormActive)
        }
    },
    methods: {
        // 初始化组件
        handleInitCp() {
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.activeName = 'drugAdd'
            this.cacheForm = {
                dates
            }
            this.handleSearch()
        },

        // 路由跳转详情
        handleDetail(row) {
            const type = this.activeName === 'drugAdd' || this.activeName === 'drugAddDetail' ? 'add' : 'out'
            this.$router.push({
                name: 'inventoryDetail',
                params: {
                    id: row.id,
                    orgId: this.cacheForm.orgId || 0,
                    changeType: type
                }
            })
        },

        // 导出
        handleExportExcel() {
            if (!this.cacheForm.dates) {
                this.$message.warning('请选择具体时间段')
            } else {
                const form = this.cacheForm
                const data = {}
                for (const key in form) {
                    if (key === 'dates') {
                        data.startDate = form[key][0]
                        data.endDate = form[key][1]
                        continue
                    }
                    if (form[key]) {
                        data[key] = form[key]
                    }
                }
                const maps = this.tabMaps
                const activeName = this.activeName
                // 出入库
                data.changeType = maps[activeName].changeType
                maps[activeName].exportDownLoadUrl(data, 'blob').then(res => {
                    exportExcelCb(res, this.tableTitle + '.xlsx')
                })
            }
        },

        // 更多条件
        changeHiddenForm() {
            this.HiddenFormActive = !this.HiddenFormActive
        },

        // 获得数据
        handleSearch(form) {
            this.listLoading = true

            const maps = this.tabMaps
            const activeName = this.activeName
            const clinic = this.clinic

            this.searchList = maps[activeName].searchList
            this.columns = maps[activeName].columns
            this.tableTitle = maps[activeName].name

            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)

            this.$refs.form.initforms(params)

            this.searchDate = params.dates ? params.dates[0] + '-' + params.dates[1] : ''
            const data = {}
            for (const key in params) {
                if (key === 'dates') {
                    if (params[key].length > 0) {
                        data.startDate = params[key][0]
                        data.endDate = params[key][1]
                    }
                    continue
                }
                if (params[key]) {
                    data[key] = params[key]
                }
            }
            // 判断是否运营中心-显示隐藏诊所
            if (clinic.isClinicCenter) {
                this.searchList[0].hidden = false
            }

            // 获取诊所名称
            if (form && form.orgId) {
                const list = this.orgOptList
                list.forEach(org => {
                    if (org.value === form.orgId) {
                        this.orgName = org.label
                    }
                })
            } else {
                this.orgName = clinic.orgName
            }

            // 根据出入库方式显示隐藏部分查询
            if (data.changeMode) {
                const mode = data.changeMode
                if (activeName === 'drugAdd') {
                    const flag = mode !== '2'
                    this.searchList[4].hidden = flag
                    if (flag) delete data.dealerName
                } else if (activeName === 'drugOut') {
                    const flag1 = mode !== '4'
                    const flag2 = mode !== '3'
                    // 领用科室
                    this.searchList[4].hidden = flag1
                    this.columns[4].hidden = flag1
                    // 供应商
                    this.searchList[5].hidden = flag2
                    this.columns[3].hidden = flag2
                    if (!flag1 || !flag2) delete data.deptName
                }
            } else {
                if (activeName === 'drugAdd') {
                    this.searchList[4].hidden = true
                }
            }

            // 查询类型
            if (activeName === 'drugAdd' || activeName === 'drugOut') {
                data.catType = '01,02,09'
            }
            // 出入库
            data.changeType = maps[activeName].changeType
            this._getData(data)
        },

        // 获取数据（5个）
        _getData(form) {
            const maps = this.tabMaps
            const activeName = this.activeName
            maps[activeName].fetchUrl(form).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS || []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            if (activeName === 'drugDetailOut') {
                                item.chajiajiner = toFixed(item.retailPriceAmt - item.purchasePriceAmt, 2)
                            } else {
                                // 出入库方式
                                item.changeMode = formatDictMap(this.dictMap[141], item.changeMode)
                            }

                            item.catType = formatDictMap(this.dictMap[489], item.catType)
                        })
                    }
                    this.listData = d
                    this.listLoading = false
                    if (activeName === 'drugAdd' || activeName === 'drugOut') {
                        this.total = {}
                        return false
                    }
                    this.total = getTotalRow(maps[activeName].columns, d)
                }
            })
        },

        // 合计行
        getSummaries(param) {
            return getTabTotalRow(param, this.columns)
        },

        // 打印
        _handlePrint() {
            const maps = this.tabMaps
            const activeName = this.activeName
            const currentTab = maps[activeName]
            handlePrint({
                columns: currentTab.columns,
                data: this.listData,
                total: this.total,
                orgName: this.orgName,
                title: currentTab.name
            })
        }
    },
    mounted() {
        this.handleInitCp()
    }
}
</script>

