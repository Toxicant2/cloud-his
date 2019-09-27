<template>
    <el-row>
        <div class="round-btn-group">
            <el-radio-group v-model="activeName">
                <el-radio-button :label="item.value" v-for="(item,index) in costType" :key="index">
                    {{item.name}}
                </el-radio-button>
            </el-radio-group>
        </div>

        <direct-search ref="form" :label-position="'right'" :form-style="{'text-align':'left','margin':'20px 5px'}" :forms="searchList" @handleSearch="handleSearch" />

        <ve-pie v-if="activeName === 'type' && listData.length>0" :data="chartData" :settings="chartSettings"></ve-pie>

        <report-header :org-name="orgName" :tab-title="tableTitle" :search-date="searchDate" @print="_handlePrint" @export="handleExportExcel"/>

        <template v-if="activeName==='daily'">
            <el-table-self :list-loading="listLoading" :getSummaries="getSummaries" :columns="columns" :table-data="listData" :show-summary="true" :span-method="objectSpanMethod"/>
            <el-table-self :list-loading="listLoading" :getSummaries="getSummariesPay" :columns="columnsPay" :table-data="listPayData" :show-summary="true" :span-method="objectSpanMethodPay"/>
            <!-- <el-table-self :list-loading="listLoading" :getSummaries="getSummariesPay2" :columns="columnsPay2" :table-data="listPayData2" :show-summary="true" :span-method="objectSpanMethodPay2"/> -->
        </template>
        <template v-else-if="activeName === 'tab5'">
            <el-table-self :span-method="objectSpanMethodUser" :list-loading="listLoading" :getSummaries="getSummaries" :columns="columns" :table-data="listData" :show-summary="true" />
        </template>
        <template v-else>
            <el-table-self :list-loading="listLoading" :getSummaries="getSummaries" :columns="columns" :table-data="listData" :show-summary="true" />
        </template>
    </el-row>
</template>

<script>
import { getDaily, getType, getWay, getDetail, exportDownloadDaily, exportChargeDetail, exportChargeWay, exportChargeType, exportUserChargeType, getUserChargeTypeList, getDrugProjectMonthList, exportMonthReport } from '@/api/statement'
import { getOrgOpts, getDepartmentOpts, getOrgClinicStaffList } from '@/api/org'
import { getOpSkDealerList } from '@/api/pharmacy'
import { getDictByIdList } from '@/api/catalog'

import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'
import elTableSelf from '@/components/TabComponents/index'
import formDialog from '@/components/DialogComponents/Form'
import reportHeader from '../common/ReportHeader'

import { getTotalRow, getTabTotalRow, getColSpan, handlePrint } from '../common/index.js'

import { pickerOptions, deepClone, formatDictMap } from '@/utils'
import { toFixed } from '@/utils/float'
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
        this.chartSettings = {
            limitShowNum: 15,
            legend: {
                orient: 'vertical'
            }
        }
        const dictMap = {
            36: [{ value: '', label: '全部' }], // 收费方式
            79: [{ value: '', label: '全部' }], // 患者类型
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
                        if (item.dictId === 36) {
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
                        value: item.id,
                        label: item.name
                    })
                })
            }
        })

        // 供应商
        const dealerList = []
        getOpSkDealerList({ dealerType: 'a' }).then(res => {
            if (res.ITEMS && res.ITEMS.length > 0) {
                res.ITEMS.forEach((item, index) => {
                    dealerList[index] = { 'label': item.dealerName, 'value': item.dealerName }
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
                            value: item.userId,
                            label: item.userRealName
                        })
                    })
                }
            }
        })
        return {
            dictMap,
            listLoading: false,
            // 诊所名称
            orgName: '',
            orgOptList,
            departmentOptsData,
            cacheForm: {},
            spanArr: [],
            spanArrPay: [],
            // 查询日期
            searchDate: '',
            activeName: 'daily',
            // 按钮
            costType: [
                {
                    name: '收费日报',
                    value: 'daily'
                },
                // {
                //     name: '收费分类',
                //     value: 'type'
                // }, {
                //     name: '收费方式',
                //     value: 'way'
                // },
                {
                    name: '收费明细',
                    value: 'detail'
                }, {
                    name: '用户类型收费汇总',
                    value: 'tab5'
                }, {
                    name: '库存月结表',
                    value: 'tab6'
                }
            ],
            // 对应关系地图
            tabMaps: {
                daily: {
                    name: '收费科室费用类型',
                    exportDownLoadUrl: exportDownloadDaily,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
                            opts: orgOptList,
                            func: this.handleOrgChange
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
                            label: '科室',
                            prop: 'deptId',
                            placeholder: '请选择',
                            opts: departmentOptsData
                        }
                    ],
                    columns: [
                        {
                            value: 'doctorDeptName',
                            label: '科室',
                            width: 150
                        }, {
                            value: 'doctorName',
                            label: '医生',
                            width: 150
                        }, {
                            value: 'chinesePatentMedicine',
                            label: '中成药费',
                            count: true,
                            width: 120
                        }, {
                            value: 'herbalMedicine',
                            label: '中药费',
                            count: true,
                            width: 120
                        }, {
                            value: 'therapy',
                            label: '治疗费',
                            count: true,
                            width: 120
                        }, {
                            value: 'westernMedicine',
                            label: '西药费',
                            count: true,
                            width: 120
                        }, {
                            value: 'precisionAdjust',
                            label: '精度调整',
                            count: true,
                            width: 120
                        }, {
                            value: 'registration',
                            label: '挂号费',
                            count: true,
                            width: 120
                        }, {
                            value: 'assay',
                            label: '检验费',
                            count: true,
                            width: 120
                        }, {
                            value: 'examine',
                            label: '检查费',
                            count: true,
                            width: 120
                        }, {
                            value: 'materials',
                            label: '材料费',
                            count: true,
                            width: 120
                        }, {
                            value: 'totalAmt',
                            label: '合计',
                            count: true
                        }
                    ]
                },
                type: {
                    name: '收费分类报表',
                    fetchUrl: getType,
                    exportDownLoadUrl: exportChargeType,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
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
                        }
                    ],
                    columns: [
                        {
                            value: 'clinicTime',
                            label: '日期'
                        }, {
                            value: 'westernMedicine',
                            label: '西药',
                            count: true
                        }, {
                            value: 'chinesePatentMedicine',
                            label: '中成药',
                            count: true
                        }, {
                            value: 'herbalMedicine',
                            label: '中草药',
                            count: true
                        }, {
                            value: 'materials',
                            label: '材料',
                            count: true
                        }, {
                            value: 'therapy',
                            label: '治疗',
                            count: true
                        }, {
                            value: 'assay',
                            label: '化验',
                            count: true
                        }, {
                            value: 'examine',
                            label: '检查',
                            count: true
                        }, {
                            value: 'examination',
                            label: '诊查',
                            count: true
                        }, {
                            value: 'transfuse',
                            label: '输液',
                            count: true
                        }, {
                            value: 'registration',
                            label: '挂号',
                            count: true
                        }, {
                            value: 'injection',
                            label: '注射',
                            count: true
                        }, {
                            value: 'physicalExam',
                            label: '查体',
                            count: true
                        }, {
                            value: 'vaccine',
                            label: '疫苗',
                            count: true
                        }, {
                            value: 'others',
                            label: '其他',
                            count: true
                        }
                    ]
                },
                way: {
                    name: '收费方式报表',
                    fetchUrl: getWay,
                    exportDownLoadUrl: exportChargeWay,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
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
                        }
                    ],
                    columns: [
                        {
                            value: 'deptName',
                            label: '科室'
                        }, {
                            value: 'chargeDate',
                            label: '收费日期'
                        }, {
                            value: 'receiverName',
                            label: '收款员'
                        }, {
                            value: 'cash',
                            label: '现金',
                            count: true
                        }, {
                            value: 'unionpay',
                            label: '银联',
                            count: true
                        }, {
                            value: 'alipay',
                            label: '支付宝',
                            count: true
                        }, {
                            value: 'wechatPay',
                            label: '微信',
                            count: true
                        }, {
                            value: 'medicalInsurance',
                            label: '医保支付',
                            count: true
                        }, {
                            value: 'commercialInsurance',
                            label: '商保支付',
                            count: true
                        }
                    ]
                },
                detail: {
                    name: '收费明细报表',
                    fetchUrl: getDetail,
                    exportDownLoadUrl: exportChargeDetail,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
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
                            type: 'input',
                            label: '单据号',
                            labelWidth: '82px',
                            prop: 'chargeNum',
                            // hiddenItem: true,
                            placeholder: '请输入单据号',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            label: '病人姓名',
                            prop: 'patientName',
                            hiddenItem: true,
                            placeholder: '请输入病人姓名',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            labelWidth: '82px',
                            label: '收款员',
                            prop: 'receiverName',
                            hiddenItem: true,
                            placeholder: '请输入收款员',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'select',
                            label: '付费方式',
                            prop: 'chargeType',
                            hiddenItem: true,
                            opts: dictMap[36]
                        }, {
                            type: 'input',
                            label: '发票项目',
                            prop: 'invoiceItemName',
                            hiddenItem: true,
                            placeholder: '请输入发票项目名称',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'select',
                            label: '开方科室',
                            prop: 'deptId',
                            hiddenItem: true,
                            placeholder: '请选择开方科室',
                            opts: departmentOptsData
                        }, {
                            type: 'select',
                            label: '开方医生',
                            prop: 'doctorId',
                            hiddenItem: true,
                            placeholder: '请输入开方医生',
                            opts: doctorList
                        }, {
                            type: 'select',
                            label: '患者类型',
                            prop: 'commercialInsuranceCode',
                            hiddenItem: true,
                            opts: dictMap[79]
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
                            value: 'chargeNum',
                            label: '单据号'
                        }, {
                            value: 'chargeTime',
                            label: '收费时间'
                        }, {
                            value: 'patientName',
                            label: '姓名'
                        }, {
                            value: 'commercialInsuranceName',
                            label: '患者类型'
                        }, {
                            value: 'receiverName',
                            label: '收款员'
                        }, {
                            value: 'chargeTypeName',
                            label: '付费方式'
                        }, {
                            value: 'invoiceItemName',
                            label: '发票项目'
                        }, {
                            value: 'catName',
                            label: '名称'
                        }, {
                            value: 'qty',
                            label: '数量'
                        }, {
                            value: 'price',
                            label: '单价'
                        }, {
                            value: 'totalAmt',
                            label: '金额',
                            count: true
                        }, {
                            value: 'deptName',
                            label: '科室'
                        }, {
                            value: 'doctorName',
                            label: '医生'
                        }
                    ]
                },
                tab5: {
                    name: '用户类型收费汇总',
                    fetchUrl: getUserChargeTypeList,
                    exportDownLoadUrl: exportUserChargeType,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
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
                        }
                    ],
                    columns: [
                        {
                            value: 'deptName',
                            label: '科室'
                        }, {
                            value: 'userType',
                            label: '用户类型'
                        }, {
                            value: 'amt',
                            label: '合计',
                            count: true
                        }
                    ]
                },
                tab6: {
                    name: '库存月结表',
                    fetchUrl: getDrugProjectMonthList,
                    exportDownLoadUrl: exportMonthReport,
                    searchList: [
                        {
                            type: 'select',
                            label: '运营机构',
                            prop: 'orgId',
                            hidden: true,
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
                            label: '类型',
                            prop: 'catType',
                            placeholder: '类型',
                            opts: dictMap[489]
                        }, {
                            type: 'input',
                            label: '生产厂商',
                            prop: 'manufacturerName',
                            placeholder: '请输入生产厂商名称',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }, {
                            type: 'input',
                            label: '药品名称',
                            prop: 'catName',
                            placeholder: '请输入药品名称',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'catName',
                            label: '药品名称'
                        }, {
                            value: 'manufacturerName',
                            label: '生产厂商'
                        }, {
                            value: 'spec',
                            label: '规格'
                        }, {
                            value: 'catType',
                            label: '类型'
                        }, {
                            complex: true,
                            label: '期初库存',
                            list: [
                                {
                                    value: 'initialQty',
                                    label: '数量',
                                    count: true
                                }, {
                                    value: 'initialPpAmt',
                                    label: '进价金额',
                                    count: true
                                }
                            ]
                        }, {
                            complex: true,
                            label: '本期入库',
                            list: [
                                {
                                    value: 'receiptQty',
                                    label: '数量',
                                    count: true
                                }, {
                                    value: 'receiptPpAmt',
                                    label: '进价金额',
                                    count: true
                                }
                            ]
                        }, {
                            complex: true,
                            label: '本期出库',
                            list: [
                                {
                                    value: 'deliveryQty',
                                    label: '数量',
                                    count: true
                                }, {
                                    value: 'deliveryPpAmt',
                                    label: '进价金额',
                                    count: true
                                }
                            ]
                        }, {
                            complex: true,
                            label: '期末库存',
                            list: [
                                {
                                    value: 'finalQty',
                                    label: '数量',
                                    count: true
                                }, {
                                    value: 'finalPpAmt',
                                    label: '进价金额',
                                    count: true
                                }
                            ]
                        }
                    ]
                }
            },
            // 收费分类饼图数据
            chartData: {
                columns: ['name', 'value'],
                rows: []
            },
            // 二级标题
            tableTitle: '',
            // 查询条件
            searchList: [],
            // 普通表格列数据
            columns: [],
            // 普通表格数据
            listData: [],
            // 合计
            total: {},
            // 2. 收费日报支付分类费用
            listPayData: [],
            columnsPay: [
                {
                    value: 'doctorDeptName',
                    label: '科室',
                    width: 150
                }, {
                    value: 'receiverName',
                    label: '收款员',
                    width: 150
                }, {
                    value: 'alipay',
                    label: '支付宝',
                    count: true,
                    width: 150
                }, {
                    value: 'cash',
                    label: '现金',
                    count: true,
                    width: 150
                }, {
                    value: 'wechatPay',
                    label: '微信',
                    count: true,
                    width: 150
                }, {
                    value: 'unionpay',
                    label: '银联',
                    count: true,
                    width: 150
                }, {
                    value: 'unpay',
                    label: '记账',
                    count: true,
                    width: 150
                }, {
                    value: 'medicalInsurance',
                    label: '医保支付',
                    count: true,
                    width: 150
                }, {
                    value: 'commercialInsurance',
                    label: '商保支付',
                    count: true,
                    width: 150
                }, {
                    value: 'totalAmt',
                    count: true,
                    label: '合计'
                }
            ],
            totalPay: {},
            // 3. 记账
            listPayData2: [],
            columnsPay2: [
                {
                    value: 'doctorDeptName',
                    label: '科室',
                    width: 150
                }, {
                    value: 'receiverName',
                    label: '收款员',
                    width: 150
                }, {
                    value: 'unPayAmtOld',
                    label: '上期记账结余',
                    count: true
                }, {
                    value: 'newUnPayAmt',
                    label: '新增记账',
                    count: true
                }, {
                    value: 'repayAmt',
                    label: '本期结账',
                    count: true
                }, {
                    value: 'theUnPayAmt',
                    label: '本期记账结余',
                    count: true
                }
            ],
            totalPay2: {},
            hiddenFormActive: false
        }
    },
    watch: {
        activeName(newVal) {
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.cacheForm = {
                dates
            }
            this.hiddenFormActive = false
            this.handleSearch()
        },
        hiddenFormActive() {
            this.$refs.form.changeHiddenForm(this.hiddenFormActive)
        }
    },
    computed: {
        ...mapGetters(['clinic'])
    },
    methods: {
        // 初始化组件
        handleInitCp() {
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.activeName = 'daily'
            this.cacheForm = {
                dates
            }
            this.handleSearch()
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
                maps[activeName].exportDownLoadUrl(data, 'blob').then(res => {
                    exportExcelCb(res, this.tableTitle + '.xlsx')
                })
            }
        },

        // 获取当前时间
        getCurrentDay() {
            return getCurrentDay()
        },

        // 更多条件
        changeHiddenForm() {
            this.hiddenFormActive = !this.hiddenFormActive
        },

        // 获得数据
        handleSearch(form) {
            this.listLoading = true

            const maps = this.tabMaps
            const activeName = this.activeName
            const clinic = this.clinic

            this.searchList = maps[activeName].searchList
            this.columns = deepClone(maps[activeName].columns)
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
                this.orgName = this.clinic.orgName
            }

            if (activeName === 'daily') {
                this._getDaily(data)
            } else if (activeName === 'type' || activeName === 'way' || activeName === 'detail' || activeName === 'tab6') {
                this._getDetail(data)
            } else {
                this._getUserChargeTypeList(data)
            }
        },

        // 运营机构变化
        handleOrgChange(val) {
            this._getDepartmentOpts(val)
        },

        // 获取诊所科室
        _getDepartmentOpts(id) {
            const departmentOptsData = [{ 'label': '全部', 'value': '' }]
            let params = {}
            if (id) {
                params = { orgId: id }
            }
            getDepartmentOpts(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    d.forEach(item => {
                        departmentOptsData.push({
                            value: item.id,
                            label: item.name
                        })
                    })
                    this.searchList[2].opts = departmentOptsData
                    this.$refs.form.initFieldsObj({
                        orgId: id,
                        deptId: ''
                    })
                    this.handleSearch({
                        orgId: id,
                        deptId: ''
                    })
                }
            })
        },

        // 收费日报
        _getDaily(form) {
            this.spanArr = []
            this.spanArrPay = []
            getDaily(form).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    // 医生
                    this.listData = d.accountSum || []
                    // 收款员
                    this.listPayData = d.paymentSum || []
                    // 记账
                    if (d.onAccountOrgSum && d.onAccountOrgSum.length > 0) {
                        d.onAccountOrgSum.forEach(item => {
                            item.doctorDeptName = '收银'
                        })
                    }
                    this.listPayData2 = d.onAccountOrgSum || []
                    const temp_deptArr = []
                    if (this.departmentOptsData.length > 0) {
                        this.departmentOptsData.forEach((item, index) => {
                            if (index !== 0) {
                                temp_deptArr.push(item.label)
                            }
                        })
                    }

                    // 数组排序
                    this.listData.sort(function(a, b) {
                        return temp_deptArr.indexOf(a.doctorDeptName) - temp_deptArr.indexOf(b.doctorDeptName)
                    })
                    this.listPayData.sort(function(a, b) {
                        return temp_deptArr.indexOf(a.doctorDeptName) - temp_deptArr.indexOf(b.doctorDeptName)
                    })

                    var count = 0
                    for (let i = 0; i < this.listData.length; i++) {
                        if (i === 0) {
                            this.spanArr.push(1)
                            count = 0
                        } else {
                            if (this.listData[i].doctorDeptName === this.listData[i - 1].doctorDeptName) {
                                this.spanArr[count] += 1
                                this.spanArr.push(0)
                            } else {
                                this.spanArr.push(1)
                                count = i
                            }
                        }
                    }

                    var countPay = 0
                    for (let i = 0; i < this.listPayData.length; i++) {
                        if (i === 0) {
                            this.spanArrPay.push(1)
                            countPay = 0
                        } else {
                            if (this.listPayData[i].doctorDeptName === this.listPayData[i - 1].doctorDeptName) {
                                this.spanArrPay[countPay] += 1
                                this.spanArrPay.push(0)
                            } else {
                                this.spanArrPay.push(1)
                                countPay = i
                            }
                        }
                    }

                    this.listLoading = false
                    this.total = getTotalRow(this.columns, this.listData)
                    this.totalPay = getTotalRow(this.columnsPay, this.listPayData)
                    this.totalPay2 = getTotalRow(this.columnsPay2, this.listPayData2)
                }
            })
        },

        // 收费分类/收费方式/收费明细/月结
        _getDetail(form) {
            const maps = this.tabMaps
            const activeName = this.activeName
            maps[activeName].fetchUrl(form).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (activeName !== 'detail') {
                        d.forEach(item => {
                            item.clinicTime = item.clinicTime ? item.clinicTime.split(' ')[0] : ''
                            item.chargeDate = item.chargeDate ? item.chargeDate.split(' ')[0] : ''

                            item.catType = formatDictMap(this.dictMap[489], item.catType)
                        })
                    }
                    this.listData = d
                    this.listLoading = false

                    let currentColumns = maps[activeName].columns
                    if (this.activeName === 'tab6') {
                        const columns = []
                        currentColumns.forEach(item => {
                            if (item.complex && item.list && item.list.length > 0) {
                                item.list.forEach(c2 => {
                                    columns.push({
                                        value: c2.value,
                                        label: c2.label,
                                        count: c2.count || false
                                    })
                                })
                                return false
                            }
                            columns.push({
                                value: item.value,
                                label: item.label,
                                count: item.count || false
                            })
                        })
                        currentColumns = columns
                    }
                    this.total = getTotalRow(currentColumns, d)
                }
            })
        },

        // 用户类型收费汇总
        _getUserChargeTypeList(form) {
            getUserChargeTypeList(form).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (JSON.stringify(d) !== '{}') {
                        const colsName = []
                        for (const key in d) {
                            let amt = 0
                            const obj = {
                                deptName: '收银'
                            }
                            if (d[key].length > 0) {
                                d[key].forEach(item => {
                                    const code = item.itemCode
                                    amt += item.itemAmt
                                    obj['amt'] = toFixed(amt)
                                    obj['userType'] = item.typeName
                                    obj[code] = item.itemAmt
                                    if (colsName.indexOf(code) > -1) return false
                                    colsName.push(code)

                                    this.columns.splice(-1, 0, {
                                        value: code,
                                        label: item.itemName,
                                        count: true
                                    })
                                })
                            }
                            result.push(obj)
                        }
                    }

                    this.listData = result
                    this.listLoading = false
                    this.total = getTotalRow(this.columns, result)
                }
            })
        },

        // 合并列
        objectSpanMethod(param) {
            return getColSpan(param, this.spanArr)
        },

        // 合并列（收款员）
        objectSpanMethodPay(param) {
            return getColSpan(param, this.spanArrPay)
        },

        // 合并列（用户类型）
        objectSpanMethodUser(param) {
            return getColSpan(param, [this.listData.length, 0])
        },

        // 合并列 （记账）
        objectSpanMethodPay2(param) {
            return getColSpan(param, [this.listPayData2.length, 0])
        },

        // 合计行
        getSummaries(param) {
            let currentColumns = this.columns
            let result = []
            // 月结表复杂表头
            if (this.activeName === 'tab6') {
                const columns = []
                currentColumns.forEach(item => {
                    if (item.complex && item.list && item.list.length > 0) {
                        item.list.forEach(c2 => {
                            columns.push({
                                value: c2.value,
                                label: c2.label,
                                count: c2.count || false
                            })
                        })
                        return false
                    }
                    columns.push({
                        value: item.value,
                        label: item.label,
                        count: item.count || false
                    })
                })
                currentColumns = columns
            }
            if (param.columns.length === currentColumns.length) {
                result = getTabTotalRow(param, currentColumns)
            }
            // 收费类型-图表
            if (this.activeName === 'type') {
                const temp_rows = []
                const { columns } = param
                if (columns && columns.length > 0) {
                    columns.forEach((column, index) => {
                        if (index > 0) {
                            temp_rows[index - 1] = {
                                name: currentColumns[index].label,
                                value: result[index]
                            }
                        }
                    })
                }
                this.chartData = {
                    columns: ['name', 'value'],
                    rows: temp_rows
                }
            }
            return result
        },

        // 合计行（收款员）
        getSummariesPay(param) {
            return getTabTotalRow(param, this.columnsPay)
        },

        // 合计行（记账）
        getSummariesPay2(param) {
            return getTabTotalRow(param, this.columnsPay2)
        },

        // 打印
        _handlePrint() {
            let list = null
            if (this.activeName === 'daily') {
                list = [{
                    columns: this.columns,
                    data: this.listData,
                    total: this.total
                }, {
                    columns: this.columnsPay,
                    data: this.listPayData,
                    total: this.totalPay
                }, {
                    columns: this.columnsPay2,
                    data: this.listPayData2,
                    total: this.totalPay2
                }]
            }
            handlePrint({
                list,
                columns: this.columns,
                data: this.listData,
                total: this.total,
                orgName: this.orgName,
                title: this.tableTitle
            }, this.activeName === 'tab6')
        }
    },
    mounted() {
        this.handleInitCp()
    }
}
</script>

