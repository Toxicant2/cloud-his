<template>
  <el-row class="page-container">
    <el-row class="page-main">
      <el-tabs v-model="activeName" @tab-click="handleSwitch" type="card">
        <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
          <template v-if="tab.key === 'pendingFollow'">
            <direct-search ref="form" :label-position="'right'" :label-width="'120'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-table-self ref="multipleTable" :columns="followColumns" :table-data="followList" :total-count="followCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :spanMethod="arraySpanMethod" />
          </template>
          <template v-if="tab.key === 'followRecord'">
            <direct-search ref="form" :label-position="'right'" :label-width="'120'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-table-self ref="multipleTable" :columns="recordColumns" :table-data="recordList" :total-count="recordCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :spanMethod="arraySpanMethod" />
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-row>

    <!-- 详情 编辑  添加-->
    <mixDialog ref="mixDialog" v-if="mixDialog" @handleSearch="handleFormSearch"></mixDialog>
    <!-- 随访 -->
    <follow-dialog ref="followDialog" v-if="followDialog" @nextFollow="handleNextFollow" @saveFollow="handleSaveFollow"></follow-dialog>
  </el-row>
</template>
<script>
import { getFollowPage, delFollow, exportFollow } from '@/api/outpatient'
import { getOrgClinicStaffList } from '@/api/org'

import mixDialog from './components/index'
import followDialog from './components/follow'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'

import { exportExcelCb } from '@/utils/exportExcel'
import { getCurrentDay, getSevenDays } from '@/utils/common'
export default {
    components: {
        mixDialog,
        directSearch,
        elTableSelf,
        followDialog
    },
    mixins: [paginationMixin],
    data() {
        const doctorList = [
            {
                value: '',
                label: '请选择'
            }
        ]
        getOrgClinicStaffList({ pageNo: 1, pageSize: 100, isUse: 1 }).then(res => {
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
            activeName: 'pendingFollow',
            mixDialog: false,
            followDialog: false,
            tabMapOpts: [
                {
                    label: '待随访',
                    key: 'pendingFollow'
                },
                {
                    label: '随访记录',
                    key: 'followRecord'
                }
            ],
            searchList: [
                {
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '计划日期',
                    prop: 'dates',
                    // options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    label: '计划随访人员',
                    opts: doctorList,
                    prop: 'actualFuUserName'
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'vau',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    },
                    placeholder: '患者姓名/手机号码/病历号'
                },
                {
                    type: 'button',
                    color: 'primary',
                    value: '+ 新增随访计划',
                    func: this.handleAddFollow
                },
                {
                    type: 'button',
                    color: 'primary',
                    value: '导出',
                    hidden: true,
                    icon: 'el-icon-download',
                    func: this.exportExcel
                }
            ],
            followColumns: [
                {
                    label: '计划日期',
                    value: 'planFuDate',
                    width: 150
                },
                {
                    label: '患者姓名',
                    value: 'patientName',
                    width: 200
                },
                {
                    label: '手机号码',
                    value: 'phone',
                    width: 150
                },
                {
                    label: '病历号',
                    value: 'caseNum',
                    width: 150
                },
                {
                    label: '随访内容',
                    value: 'fuContent'
                },
                {
                    label: '随访人员',
                    value: 'planFuUserName',
                    width: 200
                },
                {
                    label: '随访状态',
                    value: 'fuStatus',
                    width: 100
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            label: '编辑',
                            type: 'text',
                            func: this.handleEdit
                        },
                        {
                            label: '随访',
                            type: 'text',
                            func: this.handleFollow
                        },
                        {
                            label: '删除',
                            type: 'text',
                            func: this.handleDelFollow
                        }
                    ]
                }
            ],
            followList: [],
            followCount: 0,
            tempArr: [],
            recordColumns: [
                {
                    label: '姓名',
                    value: 'patientName',
                    width: 150
                },
                {
                    label: '手机号码',
                    value: 'phone',
                    width: 200
                },
                {
                    label: '病历号',
                    value: 'caseNum',
                    width: 150
                },
                {
                    label: '随访结果',
                    value: 'actualFuResult'
                },
                {
                    label: '随访日期',
                    value: 'actualFuDate',
                    width: 200
                },
                {
                    label: '随访人员',
                    value: 'actualFuUserName',
                    width: 100
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        { func: this.handleDetail, label: '详情', type: 'text' },
                        { func: this.handleDelFollow, label: '删除', type: 'text' }
                    ]
                }
            ],
            recordList: [],
            recordCount: 0,
            cacheForm: {},
            exportData: {}
        }
    },
    methods: {
        handleSwitch(tab) {
            if (tab.name === 'pendingFollow') {
                this.searchList[4].hidden = true
                this.searchList[0].label = '计划日期'
                this.searchList[1].label = '计划随访人员'
                this.cacheForm = {}
            } else {
                this.searchList[4].hidden = false
                this.searchList[0].label = '随访日期'
                this.searchList[1].label = '随访人员'
                const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
                this.cacheForm = {
                    dates
                }
            }

            this.handleSearch()
            if (this.$refs.form.length > 0) {
                this.$refs.form.forEach((item, index) => {
                    this.$refs.form[index].$refs.form.resetFields()
                })
            }
        },
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            this.$refs.form[1].initforms(params)
            const data = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize,
                fuStatus: this.activeName === 'pendingFollow' ? 0 : 1
            }
            for (const key in params) {
                if (key === 'dates') {
                    if (params[key] && params[key].length > 0) {
                        data.startPlanTime = params[key][0]
                        data.endPlanTime = params[key][1]
                    }
                    continue
                }
                if (params[key]) {
                    data[key] = params[key]
                }
            }

            if (this.activeName === 'followRecord') {
                this.exportData = data
            }
            getFollowPage(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS.list

                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.fuStatus = item.fuStatus === 0 ? '待随访' : '已随访'
                            item.planFuDate = item.planFuDate ? item.planFuDate.split(' ')[0] : ''
                            item.actualFuDate = item.actualFuDate ? item.actualFuDate.split(' ')[0] : ''
                        })
                    }
                    if (this.activeName === 'pendingFollow') {
                        this.followList = d
                        this.followCount = res.ITEMS.totalRecord
                    } else {
                        this.recordList = d
                        this.recordCount = res.ITEMS.totalRecord
                    }
                }
                this.$nextTick(() => {
                    if (this.activeName === 'pendingFollow') {
                        this.setData()
                    }
                })
            })
        },
        // 整理待随访中相同日期数据
        setData() {
            const obj = {}
            this.tempArr = []
            let k = ''
            this.followList.forEach((item, index) => {
                k = item.planFuDate ? item.planFuDate : ''
                if (obj[k]) {
                    obj[k]++
                } else {
                    obj[k] = 1
                }
            })
            for (var o in obj) {
                for (let i = 0; i < obj[o]; i++) {
                    if (i === 0) {
                        this.tempArr.push(obj[o])
                    } else {
                        this.tempArr.push(0)
                    }
                }
            }
        },
        // 合并同一天的
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            if (this.activeName === 'pendingFollow') {
                if (columnIndex === 0) {
                    if (this.tempArr[rowIndex] > 0) {
                        return {
                            rowspan: this.tempArr[rowIndex],
                            colspan: 1
                        }
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 0
                        }
                    }
                }
            }
        },
        // 详情
        handleDetail(row) {
            this.mixDialog = true
            this.$nextTick(() => {
                this.$refs.mixDialog.open('detail', row)
            })
        },
        // 新增随访
        handleAddFollow() {
            this.mixDialog = true
            this.$nextTick(() => {
                this.$refs.mixDialog.open('add')
            })
        },
        // 编辑
        handleEdit(row) {
            this.mixDialog = true
            this.$nextTick(() => {
                this.$refs.mixDialog.open('edit', row)
            })
        },
        // 随访
        handleFollow(row) {
            this.followDialog = true
            this.$nextTick(() => {
                this.$refs.followDialog.open(row)
            })
        },
        // 删除待随访
        handleDelFollow(row) {
            this.$confirm(`是否确定删除 ${row.planFuDate} ${row.patientName}的随访计划?`, '提示', {
                type: 'warning'
            })
                .then(() => {
                    delFollow([row.id]).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.handleSearch()
                        }
                    })
                })
                .catch(() => {})
        },

        // 下次更进
        handleNextFollow() {
            this.handleAddFollow()
        },
        // 完成随访后
        handleSaveFollow() {
            this.activeName = 'followRecord'
            this.searchList[0].label = '随访日期'
            this.searchList[4].hidden = false
            const dates = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            this.cacheForm = {
                dates
            }
            this.handleFormSearch()
        },
        // 导出表格
        exportExcel() {
            if (this.recordList && this.recordList.length > 0) {
                if (this.exportData.pageNo) {
                    delete this.exportData.pageNo
                    delete this.exportData.pageSize
                }
                const params = Object.assign({}, this.exportData)
                delete params.fuStatus
                delete params.startChangeTime
                delete params.endChangeTime
                exportFollow(params, 'blob').then(res => {
                    exportExcelCb(res, '随访记录.xlsx')
                })
            } else {
                this.$message.error('请导出有数据的内容')
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>
