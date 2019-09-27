<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin-bottom:20px"
      @click="handleAddFollow"
      :disabled="!caseId"
      v-if="!disabled"
    >新增计划</el-button>
    <el-table-self
      ref="followTable"
      :columns="followColumns"
      :table-data="followList"
      :list-loading="listLoading"
      style="clear:both"
      :disabled="disabled"
    ></el-table-self>
    <el-button
      type="primary"
      style="float:right;margin-top:20px"
      @click="handleSaveFollow"
      :disabled="!caseId"
      v-if="!disabled"
    >保存</el-button>
  </div>
</template>

<script>
import {
    addFollowPlan,
    getFollowInfoByCaseid,
    delFollow
} from '@/api/outpatient'

import elTableSelf from '@/components/TabComponents/index'
import { disabledPickerOptsAfter } from '@/utils'
export default {
    components: {
        elTableSelf
    },
    props: ['caseId', 'dictMap', 'patient', 'disabled'],
    data() {
        const { dictMap } = this.$props
        return {
            listLoading: false,
            followColumns: [
                {
                    label: '计划日期',
                    value: 'planFuDate',
                    operType: 'date',
                    dateType: 'datetime',
                    width: '210px',
                    showDate: true,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    options: disabledPickerOptsAfter
                },
                {
                    label: '随访类型',
                    value: 'planFuClass',
                    operType: 'select',
                    width: '150px',
                    opts: dictMap[493]
                },
                {
                    label: '随访方式',
                    value: 'planFuType',
                    operType: 'select',
                    width: '150px',
                    opts: dictMap[492]
                },
                {
                    label: '计划随访内容',
                    value: 'fuContent',
                    operType: 'input',
                    showInput: true
                },
                {
                    label: '操作',
                    operType: 'button',
                    operations: [
                        {
                            label: '删除',
                            type: 'text',
                            func: this.handleDelFollow
                        }
                    ],
                    width: '80px'
                }
            ],
            followList: []
        }
    },
    methods: {
    // 获取随访信息
        handleSearchFollow(id) {
            if (id || this.caseId) {
                this.listLoading = true
                getFollowInfoByCaseid(id || this.caseId).then(res => {
                    if (res.STATUS === '1') {
                        this.listLoading = false
                        const d = res.ITEMS
                        this.followList = d
                        this.$emit('getFollowList', this.followList)
                    }
                })
            }
        },

        // 新增随访
        handleAddFollow() {
            this.followList.push({})
        },

        // 删除随访
        handleDelFollow(row, index) {
            if (this.disabled) return
            if (row.id) {
                this.$confirm('确认删除?', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        delFollow([row.id]).then(res => {
                            if (res.STATUS === '1') {
                                this.$message.success(res.MESSAGE)
                                this.handleSearchFollow()
                            }
                        })
                    })
                    .catch(() => {})
            } else {
                this.followList.splice(index, 1)
            }
        },

        // 保存随访
        handleSaveFollow() {
            if (this.followList && this.followList.length > 0) {
                const data = []
                this.followList.forEach(item => {
                    data.push({
                        planFuDate: item.planFuDate,
                        planFuType: item.planFuType,
                        planFuClass: item.planFuClass,
                        fuContent: item.fuContent,
                        registerId: this.patient.regId || item.registerId,
                        patientId: this.patient.patientId || item.patientId,
                        caseId: this.caseId || item.caseId,
                        id: item.id
                    })
                })
                addFollowPlan(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.handleSearchFollow()
                    }
                })
            } else {
                this.$message.error('不可保存空随访')
            }
        }
    }
}
</script>

<style>
</style>
