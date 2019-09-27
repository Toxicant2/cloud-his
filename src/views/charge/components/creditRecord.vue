<template>
  <el-row class="page-main creditRecord">
    <template v-if="isShow === 'list'">
      <el-tabs class="header_tab" v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="(tab,i) in tabColumns" :key="i" :label="tab.label" :name="tab.value">
          <template v-if="tab.value === 'credit'">
            <direct-search ref="form" :label-position="'right'" :label-width="'120px'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="creditSearch" @handleSearch="handleFormSearch" />

            <el-table-self ref="multipleTable" :columns="creditColumns" :table-data="creditList" :tabType="'selection'" :total-count="creditCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :selecTable="selectable" @selectionChange="handleSelectionChange" />
          </template>
          <template v-else>
            <direct-search ref="form" :label-position="'right'" :label-width="'120px'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="settleSearch" @handleSearch="handleFormSearch" />

            <el-table-self :columns="settleColumns" :table-data="settleList" :total-count="settleCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" />
          </template>
        </el-tab-pane>

      </el-tabs>

    </template>

    <!-- 记账详情 -->
    <template v-else-if="isShow === 'creditDetail'">
      <credit-detail ref="credit" @back="back" @open="open"></credit-detail>
    </template>

    <!-- 交账详情 -->
    <template v-else>
      <settle-detail ref="settle" @back="back"></settle-detail>
    </template>

    <!-- 收费弹窗 -->
    <dialogCharge ref="dialog" title="付款" :inputStyle="'width:300px;'" :isCredit="true" @chargeFinish="chargeFinish">
    </dialogCharge>

  </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import creditDetail from './creditDetail'
import settleDetail from './settleDetail'
import { defaultPickOpts, getBabyAge, formatSex, deepClone } from '@/utils'
import paginationMixin from '@/components/TabComponents/mixin'
import dialogCharge from './charge'
import { getChargeList, repayList } from '@/api/charge'
import { getDictByIdList } from '@/api/catalog'
import { add } from '@/utils/float'
import { getOrgClinicStaffList } from '@/api/org'
export default {
  components: {
    directSearch,
    elTableSelf,
    creditDetail,
    settleDetail,
    dialogCharge
  },
  mixins: [paginationMixin],

  data() {
    const dictMap = {
      79: [
        {
          value: '',
          label: '请选择'
        }
      ] // 用户类型
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
            dictMap[item.dictId].push(obj)
          })
        }
      }
    })

    // 医师
    const doctorList = [
      {
        value: '',
        label: '请选择'
      }
    ]
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
      isShow: 'list',
      activeName: 'credit',
      tabColumns: [
        {
          label: '记账管理',
          value: 'credit'
        },
        {
          label: '结账管理',
          value: 'settle'
        }
      ],

      creditSearch: [
        // {
        //     type: 'select',
        //     label: '用户类型',
        //     prop: 'type',
        //     opts: dictMap[79]
        // },
        {
          type: 'input',
          label: '',
          prop: 'name',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          },
          placeholder: '患者姓名/手机号/单据号/病历号',
          labelWidth: '0'
        },
        {
          type: 'button',
          value: '取消记账',
          color: 'danger',
          labelWidth: '0',
          func: this.cancelCredit
        },
        {
          type: 'button',
          value: '结账',
          color: 'warning',
          labelWidth: '0',
          func: this.repayMoney
        }
      ],

      creditColumns: [
        {
          value: 'chargeNum',
          label: '单据号',
          operType: 'button',
          operations: [
            {
              type: 'text',
              func: this.handleCredit
            }
          ]
        },
        {
          value: 'patientName',
          label: '姓名'
        },
        {
          value: 'sex',
          label: '性别'
        },
        {
          value: 'age',
          label: '年龄'
        },
        {
          value: 'phone',
          label: '手机号'
        },
        {
          value: 'commercialInsuranceType',
          label: '用户类型'
        },
        {
          value: 'chargeType',
          label: '收费策略'
        },
        {
          value: 'onAccountOrg',
          label: '记账金额'
        },
        {
          value: 'doctorDeptName',
          label: '开单科室'
        },
        {
          value: 'doctorName',
          label: '开单人'
        },
        {
          value: 'reciverName',
          label: '操作员'
        },
        {
          value: 'chargeTime',
          label: '操作时间'
        }
      ],
      settleSearch: [
        {
          type: 'date',
          label: '结账时间',
          placeholder: '起始时间',
          prop: 'beginTime',
          dateType: 'datetime',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          type: 'date',
          labelSpecial: '-',
          labelWidth: '0px',
          placeholder: '结束时间',
          color: 'red',
          prop: 'endTime',
          dateType: 'datetime',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          type: 'select',
          label: '用户类型',
          prop: 'userType',
          opts: dictMap[79],
          labelWidth: '120px'
        },
        {
          type: 'select',
          label: '操作员',
          prop: 'reciverId',
          opts: doctorList,
          labelWidth: '120px'
        },
        {
          type: 'input',
          label: '',
          prop: 'name',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          },
          placeholder: '患者姓名/手机号/单据号',
          labelWidth: '0'
        }
      ],
      settleColumns: [
        {
          value: 'repaymentNum',
          label: '单据号',
          operType: 'button',
          operations: [
            {
              type: 'text',
              func: this.handleSettle
            }
          ]
        },
        {
          value: 'patientName',
          label: '姓名'
        },
        {
          value: 'sex',
          label: '性别'
        },
        {
          value: 'age',
          label: '年龄'
        },
        {
          value: 'phone',
          label: '手机号'
        },
        {
          value: 'commercialInsuranceType',
          label: '用户类型'
        },
        {
          value: 'startTime',
          label: '开始日期'
        },
        {
          value: 'endTime',
          label: '结束日期'
        },
        {
          value: 'repaymentType',
          label: '支付方式'
        },
        {
          value: 'totalAmt',
          label: '结账金额'
        },
        {
          value: 'repayTime',
          label: '结账时间'
        },
        {
          value: 'reciverName',
          label: '操作员'
        }
      ],

      creditList: [],
      settleList: [],
      creditCount: 0,
      settleCount: 0,
      cacheForm: {},
      checkId: '',
      multipleSelection: [],
      selectData: [], // 多选框改变时本页选中的数据
      allSelected: [], // 所有选中的数据
      tempData: []
    }
  },
  methods: {
    // 切换pane
    handleClick() {
      this.cacheForm = {}
      this.pageIndex = 1
      this.checkId = ''
      this.selectData = []
      this.allSelected = []
      if (this.activeName === 'credit') {
        this.handleSearch()
      } else {
        this.handleSearch()
      }
      if (this.$refs.form.length > 0) {
        this.$refs.form.forEach((item, index) => {
          this.$refs.form[index].$refs.form.resetFields()
          this.$refs.form[index].initforms()
        })
      }
    },

    handleFormSearch(form) {
      this.pageIndex = 1
      this.handleSearch(form)
    },
    handleSearch(form) {
      this.cacheForm = form || this.cacheForm
      const params = Object.assign({}, this.cacheForm, form)
      params.pageNo = this.pageIndex
      params.pageSize = this.pageSize

      if (this.activeName === 'credit') {
        params.onAccountOrg = 0
        this.getCreditList(params)
      } else {
        this.getSettleList(params)
      }
    },

    // 记账管理
    getCreditList(params) {
      getChargeList(params).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS.list
          const result = []
          if (d && d.length > 0) {
            d.forEach((item, index) => {
              result.push({
                patientName: item.patientName,
                sex: formatSex(String(item.sex)),
                age: getBabyAge(item.birthDate),
                commercialInsuranceType: item.commercialInsuranceType,
                onAccountOrg: item.onAccountOrg,
                reciverName: item.reciverName,
                chargeTime: item.chargeTime,
                chargeType:
                  item.commercialInsuranceCode === '1' || item.commercialInsuranceCode === '3'
                    ? '会员'
                    : '普通',
                chargeNum: item.chargeNum,
                phone: item.phone,
                doctorDeptName: item.doctorDeptName,
                doctorName: item.doctorName,
                patientId: item.patientId,
                registerId: item.registerId,
                chargeId: item.chargeId,
                index: index,
                clinicTime: item.clinicTime
              })
            })
          }
          this.creditCount = res.ITEMS.totalRecord
          this.creditList = result
          this.$nextTick(() => {
            this.toggleSelection(this.allSelected)
          })
        }
      })
    },

    // 还款记录
    getSettleList(params) {
      repayList(params).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS.list
          const result = []
          if (d && d.length > 0) {
            d.forEach(item => {
              result.push({
                patientName: item.patientName,
                sex: formatSex(String(item.sex)),
                age: getBabyAge(item.birthDate),
                commercialInsuranceType: item.commercialInsuranceType,
                chargeType:
                  item.commercialInsuranceCode === '1' || item.commercialInsuranceCode === '3'
                    ? '会员'
                    : '普通',
                totalAmt: item.totalAmt,
                reciverName: item.reciverName,
                endTime: item.endTime,
                startTime: item.startTime,
                repaymentType: item.repaymentType,
                phone: item.phone,
                repaymentNum: item.repaymentNum,
                repayTime: item.repayTime,
                id: item.id
              })
            })
          }
          this.settleCount = res.ITEMS.totalRecord
          this.settleList = result
        }
      })
    },
    handleCredit(row) {
      this.isShow = 'creditDetail'
      this.$nextTick(() => {
        this.$refs.credit.getDetail(row)
      })
    },
    handleSettle(row) {
      this.isShow = 'settleDetail'
      this.$nextTick(() => {
        this.$refs.settle.getDetail(row)
      })
    },
    back(name) {
      this.isShow = 'list'
      this.activeName = name || 'credit'
      this.checkId = ''
    },

    open(patientInfo, insurance, chargeAmt, detailList, chargeIds) {
      this.$refs.dialog.open(patientInfo, insurance, chargeAmt, detailList, chargeIds)
    },

    // 设置某些行不可选
    selectable(row) {
      if (!this.checkId || row.patientId === this.checkId) {
        return true
      } else {
        return false
      }
    },

    // 获取选中的选项
    handleSelectionChange(val) {
      this.selectData[this.pageIndex] = val
      this.tempData = []
      if (this.selectData.length >= 1) {
        this.selectData.forEach(data => {
          if (data && data.length > 0) {
            data.forEach(item => {
              this.tempData.push(item.patientId)
            })
          }
        })
      }
      if (this.tempData.length > 0) {
        this.checkId = this.tempData[0]
      } else {
        this.checkId = ''
      }
    },

    // 交账
    repayMoney() {
      this.allSelected = deepClone(this.selectData)
      if (this.tempData.length === 0) {
        this.$message.error('请选择患者')
      } else {
        const chargeIds = []
        let repayAccount = 0

        let patientInfo = {}
        this.allSelected.forEach(all => {
          if (all && all.length > 0) {
            all.forEach(item => {
              chargeIds.push({
                chargeId: item.chargeId,
                money: item.onAccountOrg,
                chargeNum: item.chargeNum
              })
              repayAccount = add(repayAccount, item.onAccountOrg)
            })
            patientInfo = all[0]
          }
        })
        this.$refs.dialog.open(patientInfo, {}, repayAccount, [], chargeIds)
      }
    },

    chargeFinish() {
      this.isShow = 'list'
      this.activeName = 'settle'
      this.handleSearch()
    },

    // 跨页选择的勾选
    toggleSelection(rows) {
      if (rows) {
        if (rows[this.pageIndex] && rows[this.pageIndex].length > 0) {
          rows[this.pageIndex].forEach(item => {
            this.$refs.multipleTable[0].$refs.selftab.toggleRowSelection(
              this.creditList[item.index]
            )
          })
        }
      }
    },

    // 重写跳转页码
    handleCurrentChange(val) {
      this.allSelected = deepClone(this.selectData)
      this.pageIndex = val
      this.handleSearch()
    },

    // 取消记账
    cancelCredit() {
      this.allSelected = deepClone(this.selectData)
      if (this.tempData.length === 0) {
        this.$message.error('请选择患者')
      } else if (this.tempData.length > 1) {
        this.$message.error('请单笔取消记账')
      } else {
        this.allSelected.forEach(all => {
          if (all && all.length > 0) {
            all.forEach(item => {
              this.$router.push({
                name: 'chargeDetail',
                params: {
                  chargeId: item.chargeId,
                  patientId: item.patientId,
                  time: item.clinicTime ? item.clinicTime : 's',
                  type: 'cancelCredit'
                }
              })
            })
          }
        })
      }
    }
  },
  mounted() {}
}
</script>

<style lang="scss">
.creditRecord {
  .header_tab {
    .el-tabs__header {
      border: none;
    }
    .el-tabs__nav {
      float: none;
      border: none !important;
    }
    .el-tabs__nav-scroll {
      text-align: center;
    }
    .el-tabs__item {
      border: 1px solid #e4e7ed !important;
      border-radius: 20px;
      padding: 0 15px 0 35px !important;
    }
    .el-tabs__item:first-child {
      padding: 0 35px 0 15px !important;
    }
    .el-tabs__item.is-active {
      color: #fff;
      background: #409eff;
      padding: 0 20px !important;
      z-index: 9;
    }
    .el-tabs__item.is-active:last-child {
      margin-left: -30px;
    }
    .el-tabs__item.is-active:first-child {
      margin-right: -30px;
    }
    .el-tabs__nav-wrap {
      border-bottom: 1px dashed #e4e7ed;
      padding-bottom: 20px;
    }
  }

  .default {
    th:nth-of-type(1) {
      .el-checkbox {
        display: none;
      }
    }
  }
}
</style>