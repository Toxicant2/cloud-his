<template>
  <el-row class="page-main download">
    <el-form
      :inline="true"
      :model="form"
      class=""
      label-width="100px"
    >
      <el-form-item label="分类查询：">
        <el-cascader
          v-model="form.type"
          :options="options"
          style="width:300px"
          :change-on-select="true"
          :show-all-levels="false"
          @change="handleSearch"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model="form.content"
          style="width:300px"
        >
          <template slot="append">
            <el-button
              @click="handleSearch"
              icon="el-icon-search"
            >
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <span>搜索结果：{{totalCount}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;已选：{{selectedResult}}</span>
      </el-form-item>
      <el-form-item style="float:right">
        <el-button
          type="primary"
          @click="handleDownload"
          style="width:100px"
        >下载</el-button>
      </el-form-item>
    </el-form>

    <el-table-self
      ref="multipleTable"
      :table-data="tableData"
      :columns="columns"
      :tabType="'selection'"
      :selecTable="checkboxT"
      @selectionChange="handleSelectionChange"
      :total-count="totalCount"
      :page-sizes="pageSizes"
      :current-page="pageIndex"
      :page-size="pageSize"
      @pageSizeChange="handleSizeChange"
      @currentPageChange="handleCurrentChange"
      @handleSearch="handleFormSearch"
    />

  </el-row>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { getDiseaseList, downloadDisease } from '@/api/catalog'
import { deepClone } from '@/utils'
export default {
    components: {
        elTableSelf,
        paginationMixin
    },
    mixins: [paginationMixin],
    props: ['options'],
    data() {
        return {
            headerClass: 'default',
            form: {
                type: [],
                content: ''
            },
            columns: [
                {
                    label: '主要编码',
                    value: 'code'
                },
                {
                    label: '疾病名称',
                    value: 'name'
                },
                {
                    label: '拼音码',
                    value: 'pyCode'
                },
                {
                    label: '说明',
                    value: 'note'
                },
                {
                    label: '下载状态',
                    value: 'status',
                    width: 100
                }
            ],
            tableData: [],
            selectedResult: 0,
            loading: false,
            downLoadList: [],
            totalCount: 0,
            selectData: [], // 多选框改变时本页选中的数据
            allSelected: [] // 所有选中的数据
        }
    },
    methods: {
        // 确认下载提示
        handleDownload() {
            this.allSelected = deepClone(this.selectData)
            let arr = []
            if (this.allSelected && this.allSelected.length > 0) {
                this.allSelected.forEach(item => {
                    if (item && item.length > 0) {
                        arr = arr.concat(item)
                    }
                })
            }
            this.downLoadList = arr // 要下载的疾病列表
            if (this.downLoadList.length > 0) {
                this.$confirm(`是否确认下载？`,
                    '下载提示', {
                        type: 'warning',
                        beforeClose: (action, instance, done) => {
                            if (action === 'confirm') {
                                instance.confirmButtonLoading = true
                                const d = this.downLoadList
                                const param = []
                                if (d && d.length > 0) {
                                    d.forEach(item => {
                                        param.push({
                                            classCode: item.classCode,
                                            classValue: item.classValue,
                                            code: item.code,
                                            name: item.name,
                                            sort: item.sort,
                                            spellCode: item.pyCode,
                                            sysDiseaseId: item.sysDiseaseId,
                                            isUse: item.isUse,
                                            note: item.note
                                        })
                                    })
                                }
                                downloadDisease(param).then(res => {
                                    if (res.STATUS === '1') {
                                        this.handleSearch()
                                        instance.confirmButtonLoading = false
                                        done()
                                    }
                                })
                            } else {
                                instance.confirmButtonLoading = false
                                done()
                            }
                        }
                    }).then(() => {
                    this.$message.success('下载成功')
                }).catch(() => {})
            } else {
                this.$message.error('请选择下载的疾病')
            }
        },

        // 获取选中的复选框
        handleSelectionChange(val) {
            if (val) {
                this.selectData[this.pageIndex] = val
                this.selectedResult = 0
                this.selectData.forEach(item => {
                    this.selectedResult += item.length
                })
            }
        },

        handleFormSearch() {
            this.pageIndex = 1
            this.handleSearch()
        },
        //   搜索
        handleSearch() {
            this.loading = true
            this.tableData = []
            const form = this.form
            let params = {}
            if (form) {
                params = {
                    code: form.type ? form.type[form.type.length - 1] : '',
                    name: form.content ? form.content : ''
                }
            }
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize

            getDiseaseList(params).then(res => {
                if (res.STATUS === '1') {
                    this.loading = false
                    const d = res.ITEMS
                    let total = 0
                    const result = d.list
                    if (result && result.length > 0) {
                        result.forEach((item, index) => {
                            this.tableData.push({
                                code: item.code,
                                name: item.name,
                                pyCode: item.spellCode,
                                note: item.note,
                                status: item.notNull ? '已下载' : '未下载',
                                classValue: item.classValue,
                                classCode: item.classCode,
                                sort: item.sort,
                                sysDiseaseId: item.id,
                                isUse: item.isUse,
                                index: index
                            })
                        })
                        total = d.totalRecord
                    }
                    this.totalCount = total
                    // this.selectData = []
                    // this.allSelected = []
                    this.$nextTick(() => {
                        this.toggleSelection(this.allSelected)
                    })
                }
            })
        },

        // 禁止选择已下载的
        checkboxT(row, index) {
            if (row.status === '已下载') {
                return false
            } else {
                return true
            }
        },

        // 跨页选择的勾选
        toggleSelection(rows) {
            if (rows) {
                if (rows[this.pageIndex] && rows[this.pageIndex].length > 0) {
                    rows[this.pageIndex].forEach(item => {
                        this.$refs.multipleTable.$refs.selftab.toggleRowSelection(this.tableData[item.index])
                    })
                }
            }
        },

        // 重写改变页码
        handleCurrentChange(val) {
            this.allSelected = deepClone(this.selectData)
            this.pageIndex = val
            this.handleSearch()
        }

    },
    mounted() {
        this.handleSearch()
    }
}
</script>


<style scoped lang='scss'>
.default {
  th {
    background-color: #eef5fd;
    color: #586276;
  }
}
</style>

<style>
.download .el-table .cell,
.download .el-table th div,
.download .el-table--border td:first-child .cell,
.download .el-table--border th:first-child .cell {
  padding-left: 14px;
}
</style>

