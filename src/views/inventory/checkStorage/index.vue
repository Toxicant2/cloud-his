<template>
  <el-row class="page-main">
    <div style="clear:both;overflow:hidden">
      <direct-search
        ref="form"
        :label-position="'center'"
        :label-width="'100px'"
        :form-style="{'text-align':'left','float':'left', 'margin':'10px 0px 20px 0'}"
        :forms="searchList"
        @handleSearch="handleFormSearch"
      />
      <el-button
        type="primary"
        class="btn"
        @click="handleAddCheck"
      ><span v-if="!stockStatus">+新增盘点</span><span v-else>继续盘点</span></el-button>
      <span
        class="clock"
        v-if="stockStatus"
      >当前库房已被锁定</span>
    </div>

    <el-table-self
      name="nowStorage"
      :current-page="pageIndex"
      :list-loading="listLoading"
      :table-data="tabData"
      :columns="tabColumns"
      :total-count="totalCount"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      @pageSizeChange="handleSizeChange"
      @currentPageChange="handleCurrentChange"
      @handleSearch="handleFormSearch"
    />

  </el-row>
</template>

<script>
  import directSearch from '@/components/FormComponents/directSearch'
  import elTableSelf from '@/components/TabComponents/index'
  import { checkList, getStockStatus, delCheck } from '@/api/pharmacy'

  import { defaultPickOpts } from '@/utils'
  import paginationMixin from '@/components/TabComponents/mixin'
  export default {
      components: {
          directSearch,
          elTableSelf
      },
      mixins: [paginationMixin],
      data() {
          var btnList = [{ func: this.handleDetail, label: '查看详情', type: 'primary' }]
          var btnMoreList = [{ func: this.handleUpdate, label: '修改', type: 'primary' }, { func: this.handleAute, label: '审核', type: 'success' }, { func: this.handleDelete, label: '删除', type: 'danger' }]
          return {
              listLoading: false,
              stockStatus: false,
              totalCount: 1,
              defaultPickOpts,
              searchList: [
                  {
                      type: 'date',
                      label: '盘点日期',
                      placeholder: '起始时间',
                      prop: 'startDate',
                      dateType: 'datetime',
                      valueFormat: 'yyyy-MM-dd HH:mm:ss',
                      options: defaultPickOpts.opts
                  }, {
                      type: 'date',
                      labelSpecial: '-',
                      labelWidth: '0px',
                      placeholder: '结束时间',
                      color: 'red',
                      prop: 'endDate',
                      dateType: 'datetime',
                      valueFormat: 'yyyy-MM-dd HH:mm:ss',
                      options: defaultPickOpts.opts
                  },
                  {
                      type: 'input',
                      label: '',
                      prop: 'checkNum',
                      placeholder: '盘点单号',
                      slot: {
                          slot: 'append',
                          type: 'button',
                          icon: 'el-icon-search'
                      },
                      labelWidth: 'auto'
                  }

              ],

              tabColumns: [
                  {
                      label: '盘点单号',
                      value: 'checkNum'
                  },
                  {
                      label: '盘点日期',
                      value: 'checkTime'
                  },
                  {
                      label: '记录数',
                      value: 'detailCount'
                  },
                  {
                      label: '零售盈亏合计（元）',
                      value: 'retailPl'
                  },
                  {
                      label: '进货盈亏合计（元）',
                      value: 'purchasePl'
                  },
                  {
                      label: '制单人',
                      value: 'createUserName'
                  },
                  {
                      label: '状态',
                      value: 'status',
                      formatter(row) {
                          if (row.status === 0) {
                              return '待审核'
                          } else {
                              return '已审核'
                          }
                      }
                  },
                  {
                      label: '操作',
                      fixed: 'right',
                      align: 'center',
                      width: 280,
                      operType: 'button',
                      operations: {
                          formatter(row) {
                              return row.status === 1 ? btnList : btnMoreList
                          }
                      }
                  }
              ],

              tabData: [],
              cacheForm: {},
              id: ''
          }
      },
      watch: {
          $route(to, from) {
              if (to.name === 'storage') {
                  this.getStatus()
                  this.handleSearch()
              }
          }
      },
      methods: {
          // 查看详情
          handleDetail(row) {
              this.$router.push({ name: 'checkDetail', params: { id: row.id, checkType: 'detail' }})
          },
          // 修改
          handleUpdate(row) {
              this.$router.push({ name: 'checkDetail', params: { id: row.id, checkType: 'edit' }})
          },
          // 审核
          handleAute(row) {
              this.$router.push({ name: 'checkDetail', params: { id: row.id, checkType: 'audit' }})
          },
          // 删除
          handleDelete(row, index) {
              this.$confirm('确认删除？', '提示', {
                  type: 'warning'
              }).then(() => {
                  delCheck(row.id).then(res => {
                      if (res.STATUS === '1') {
                          this.tabData.splice(index, 1)
                          this.$message.success('删除成功！')
                          this.stockStatus = false
                      } else {
                          this.$message.error('删除失败！')
                      }
                  })
              }).catch(() => {

              })
          },
          // 新增盘点
          handleAddCheck() {
              if (this.stockStatus) {
                  this.$router.push({ name: 'checkDetail', params: { id: this.id, checkType: 'addGo' }})
              } else {
                  this.$confirm('盘点开始后系统将锁定相关库房操作，是否开始盘点', '提示', {
                      type: 'warning'
                  }).then(() => {
                      this.$router.push({ name: 'checkDetail', params: { id: 0, checkType: 'addNew' }})
                  }).catch(() => {})
              }
          },

          handleFormSearch(form) {
              this.pageIndex = 1
              this.handleSearch(form)
          },
          handleSearch(form) {
              this.cacheForm = this.cacheForm || form
              const params = Object.assign(this.cacheForm, form)
              params.pageNo = this.pageIndex
              params.pageSize = this.pageSize
              checkList(params).then(res => {
                  if (res.STATUS === '1') {
                      const d = res.ITEMS
                      const result = []
                      if (d && d.length > 0) {
                          d.forEach(item => {
                              result.push({
                                  checkNum: item.checkNum,
                                  checkTime: item.checkTime,
                                  detailCount: item.detailCount,
                                  retailPl: item.retailPl,
                                  purchasePl: item.purchasePl,
                                  createUserName: item.createUserName,
                                  status: item.status,
                                  id: item.id
                              })
                          })
                      }
                      this.tabData = result
                      this.totalCount = result.length
                  }
              })
          },

          //   获取锁定库存状态
          getStatus() {
              getStockStatus().then(res => {
                  if (res.STATUS === '1') {
                      if (res.ITEMS && res.ITEMS.check) {
                          this.id = res.ITEMS.check.id
                          this.stockStatus = true
                      } else {
                          this.stockStatus = false
                      }
                  }
              })
          }

      },
      mounted() {
          this.handleSearch()
          this.getStatus()
      }

  }
</script>
<style lang="scss" scoped>
.btn {
  float: left;
  margin: 10px 20px;
}
.clock {
  float: left;
  font-size: 13px;
  color: red;
  display: block;
  height: 47px;
  line-height: 55px;
}
</style>