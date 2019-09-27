<template>
    <div>
        <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
        <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :current-page="pageIndex" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
        <!-- 审核/详情 -->
        <audit-detail ref="detailDialog" @handleSuccess="handleFormSearch" @nextAudit="handleNextAudit"></audit-detail>
    </div>
</template>

<script>
import { getDictByIdList, getCheckListById, getCheckList } from '@/api/catalog'
import { getRecipeCheckList, exportAudit, getCheckUserList } from '@/api/outpatient'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import auditDetail from './detail'
import paginationMixin from '@/components/TabComponents/mixin'
import { param, param2Obj, pickerOptions, formatDictMap } from '@/utils'
import { getCurrentDay, getSevenDays } from '@/utils/common'

import { exportExcelCb } from '@/utils/exportExcel'
export default {
    name: 'auditRecipe',
    components: {
        directSearch,
        elTableSelf,
        auditDetail
    },
    mixins: [paginationMixin],
    watch: {
        activeName(newVal) {
            const isTab1 = newVal === 'tab1'
            this.searchList[1].hidden =
                this.$store.getters.clinic.isAdministrator && this.$store.getters.clinic.isClinicCenter
                    ? isTab1
                    : true
            this.searchList[3].hidden = !isTab1
            this.searchList[4].hidden = isTab1
            this.searchList[0].hidden = isTab1
            this.searchList[6].hidden = isTab1
            this.tabColumns = isTab1
                ? this.columns1.concat(this.operationColumns)
                : this.columns1.concat(this.columns2)
        }
    },
    data() {
        const dictMap = {
            484: [], // 西药/中成药处方类别
            485: [], // 中药处方类别
            recipeClass: [{ value: '', label: '全部' }]
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
                        if (item.dictId === 484 || item.dictId === 485) {
                            dictMap['recipeClass'].push({
                                value: param({
                                    chara: item.dictId === 484 ? '10' : '20',
                                    recipeClass: item.code
                                }),
                                label: item.name
                            })
                        }
                    })
                }
            }
        })

        // 管辖诊所
        const checkList = []
        const orgIds = []
        // 审核人员
        const checkUserList = [{ label: '全部', value: '' }]
        getCheckListById(this.$store.getters.user.id).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        checkList.push({
                            label: item.checkedOrgName,
                            value: item.checkedOrgId
                        })
                        orgIds.push(item.checkedOrgId)
                    })
                }

                getCheckList(orgIds.join(',')).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d && d.length > 0) {
                            d.forEach(item => {
                                checkUserList.push({ label: item, value: item })
                            })
                        }
                    }
                })
            }
        })

        return {
            activeName: '',
            listLoading: false,
            tabData: [],
            tabColumns: [],
            columns1: [
                {
                    value: 'orgName',
                    label: '诊所名称'
                },
                {
                    value: 'doctorName',
                    label: '诊所医生'
                },
                {
                    value: 'patientName',
                    label: '患者名称'
                },
                {
                    value: 'mainDiseaseName',
                    label: '临床诊断'
                },
                {
                    value: 'tcmDiagnosis',
                    label: '中医诊断'
                },
                {
                    value: 'allergyName',
                    label: '过敏史'
                },
                {
                    label: '处方类别',
                    formatter(row) {
                        return formatDictMap(
                            dictMap['recipeClass'],
                            param({ chara: row.chara, recipeClass: row.recipeClass })
                        )
                    }
                },
                {
                    value: 'prescribingTime',
                    label: '提交时间',
                    width: '150'
                }
            ],
            columns2: [
                {
                    value: 'checkedTime',
                    label: '审核时间',
                    width: '150'
                },
                {
                    value: 'checkedUserName',
                    label: '审核人员'
                },
                {
                    label: '审核结果',
                    formatter(row) {
                        return row.checkedStatus === 1 ? '已通过' : '未通过'
                    }
                },
                {
                    value: 'checkedNote',
                    label: '审核备注'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    width: 100,
                    operType: 'button',
                    operations: [
                        {
                            label: '详情',
                            type: 'primary',
                            func: this.handleDetail
                        }
                    ]
                }
            ],
            operationColumns: [
                {
                    label: '操作',
                    fixed: 'right',
                    width: 100,
                    operType: 'button',
                    operations: [
                        {
                            label: '审核',
                            type: 'primary',
                            func: this.handleAudit
                        }
                    ]
                }
            ],
            searchList: [
                {
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '审核时间',
                    prop: 'dates',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    label: '审核人员',
                    prop: 'checkedUserName',
                    opts: checkUserList
                },
                {
                    type: 'select',
                    label: '处方类别',
                    prop: 'recipeClass',
                    opts: dictMap['recipeClass']
                },
                {
                    type: 'select',
                    label: '管辖诊所',
                    prop: 'orgIds',
                    opts: checkList,
                    multiple: true
                },
                {
                    type: 'select',
                    label: '审核状态',
                    prop: 'checkStatus',
                    opts: [
                        {
                            value: '',
                            label: '全部'
                        },
                        {
                            value: '1',
                            label: '已通过'
                        },
                        {
                            value: '2',
                            label: '未通过'
                        }
                    ],
                    hidden: true
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'name',
                    placeholder: '诊所名称、医生姓名、患者姓名',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                },
                {
                    type: 'button',
                    color: 'primary',
                    value: '导出',
                    hidden: true,
                    icon: 'el-icon-download',
                    func: this.exportExcel,
                    labelWidth: '0'
                }
            ],
            cacheForm: {},
            getNext: false,
            dictMap
        }
    },
    methods: {
        // 切换初始化
        initCp(activeName) {
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.cacheForm = {
                dates
            }
            this.activeName = activeName
            this.handleFormSearch()
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            this.$refs.form.initforms(params)
            const recipeObj =
                this.cacheForm && this.cacheForm.recipeClass
                    ? param2Obj(this.cacheForm.recipeClass)
                    : { chara: '', recipeClass: '' }
            const data = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize,
                checkStatus: this.activeName === 'tab1' ? '0' : params.checkStatus || '1,2',
                chara: recipeObj.chara,
                recipeClass: recipeObj.recipeClass,
                isChecked: this.activeName !== 'tab1'
            }
            for (const key in params) {
                if (key === 'dates') {
                    if (params[key] && params[key].length > 0) {
                        data.startDate = params[key][0]
                        data.endDate = params[key][1]
                    }
                    continue
                }
                if (key === 'orgIds') {
                    data[key] = params[key].join(',')
                    continue
                }
                if (key === 'recipeClass') {
                    continue
                }
                if (params[key]) {
                    data[key] = params[key]
                }
            }

            if (this.activeName === 'tab1') {
                delete data.startDate
                delete data.endDate
            }
            getRecipeCheckList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tabData = d.list
                    this.total = d.totalRecord
                    if (this.getNext) {
                        this.$nextTick(() => {
                            if (this.tabData && this.tabData.length > 0) {
                                this.handleAudit(this.tabData[0])
                            }
                            this.getNext = false
                        })
                    }
                }
            })
        },

        // 审核
        handleAudit(row) {
            row.className = formatDictMap(
                this.dictMap['recipeClass'],
                param({ chara: row.chara, recipeClass: row.recipeClass })
            )
            this.$refs.detailDialog.open(row, 'audit', this.tabData.length)
        },

        // 详情
        handleDetail(row) {
            this.$refs.detailDialog.open(row, 'detail')
        },

        handleNextAudit() {
            this.getNext = true
            this.handleSearch()
        },

        exportExcel() {
            if (this.tabData && this.tabData.length > 0) {
                if (this.cacheForm.pageNo) {
                    delete this.cacheForm.pageNo
                    delete this.cacheForm.pageSize
                }
                const recipeObj =
                    this.cacheForm && this.cacheForm.recipeClass
                        ? param2Obj(this.cacheForm.recipeClass)
                        : { chara: '', recipeClass: '' }
                const params = Object.assign({}, this.cacheForm, recipeObj)
                params.startDate = params.dates ? params.dates[0] : ''
                params.endDate = params.dates ? params.dates[1] : ''
                delete params.dates
                exportAudit(params, 'blob').then(res => {
                    exportExcelCb(res, '已审方.xlsx')
                })
            } else {
                this.$message.error('无数据可导出')
                return false
            }
        }
    }
}
</script>

<style>
</style>
