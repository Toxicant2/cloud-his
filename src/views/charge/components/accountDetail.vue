<template>
  <el-row class="daily-account">
    <el-row v-show="!isShowDetail">
      <direct-search ref="form" :label-position="'left'" :form-style="{'text-align':'left','margin-bottom':'10px'}" :forms="detailSearchList" @handleSearch="handleSearch" />
      <el-table-self :getSummaries="getSummaries" :columns="columns" :table-data="dataList" :show-summary="true" :current-page="pageIndex" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
    </el-row>
    <el-row v-show="isShowDetail">
      <span class="title">
        交账详情
        <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="backList()">返回</el-button>
      </span>
      <el-row class="detail-info">
        <span>
          交账单号：{{objDetail.accountNum}}
        </span>
        <span>
          总单数：{{detailList.length}}
        </span>
        <span>
          应收金额：{{objDetail.receivableAmount}}
        </span>
        <span :class="objDetail.receivableAmount!=objDetail.totalAmount?'diffenert-account':''">
          交账金额：{{objDetail.totalAmount}}
        </span>
      </el-row>

      <el-table-self :columns="detailColumns" :table-data="detailList" />
    </el-row>

    <diagnosis-form ref="diagnosis" :countLine='12' width='800px' :title="'待交账信息'" :form-data="diagnosisFormData" :form-edit="formData" :describe="describe" :columns="diagnosisColumns" :table-data="detailList" />

  </el-row>
</template>

<script>
import { accountList, chargePeopleList, chargeListPage, saveAccount } from '@/api/charge'
import diagnosisForm from '@/components/DialogComponents/Table'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { getTabTotalRow } from '@/views/report/common/index'

import { pickerOptions } from '@/utils'
import { getCurrentDay, getSevenDays } from '@/utils/common'

export default {
  components: {
    directSearch,
    elTableSelf,
    diagnosisForm
  },
  mixins: [paginationMixin],
  data() {
    // 获取收费人员、
    const chargePerson = [{ value: '', label: '全部' }]
    const data = { avatarFlag: 0 }
    chargePeopleList(data).then(res => {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        this._.forEach(d, function(item) {
          chargePerson.push({
            value: item.accountName,
            label: item.accountName
          })
        })
      }
    })
    return {
      describe: {
        label: '应收金额',
        value: 0,
        form: {},
        formData: [
          {
            type: 'number',
            labelWidth: '80px',
            spanCount: 8,
            min: 0.01,
            name: '实收金额',
            precision: 2,
            field: 'totalAmount',
            rules: [{ required: true, message: '应收总金额必填' }]
          }
        ],
        funcName: '交账',
        func: this.saveAccount,
        des: '温馨提示：每日交账是对当前登录用户未交账数据进行交账处理且不可逆！'
      },
      total: 0,
      // 交账详情
      objDetail: {},
      isShowDetail: false,
      // 搜索栏
      detailSearchList: [
        {
          type: 'daterange',
          dateType: 'datetimerange',
          label: '交账日期',
          prop: 'dates',
          options: pickerOptions,
          format: 'yyyy-MM-dd',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          type: 'select',
          label: '交账员',
          prop: 'accountName',
          opts: chargePerson
        },
        {
          type: 'input',
          label: '交账单号',
          prop: 'accountNum',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          }
        },
        {
          type: 'button',
          value: '每日交账',
          color: 'primary',
          func: this.dailyAccount
        }
      ],
      // 数据
      dataList: [],
      // 模板
      columns: [
        {
          value: 'accountNum',
          label: '交账单号',
          width: 160
        },
        {
          value: 'accountName',
          label: '交账员'
        },
        {
          value: 'accountTime',
          label: '交账时间',
          width: 160
        },
        {
          value: 'cash',
          label: '现金',
          count: true
        },
        {
          value: 'unionPay',
          label: '银联卡',
          count: true
        },
        {
          value: 'medicalInsurance',
          label: '医保卡',
          count: true
        },
        {
          value: 'wechatPay',
          label: '微信',
          count: true
        },
        {
          value: 'aliPay',
          label: '支付宝',
          count: true
        },
        {
          value: 'commercialInsurance',
          label: '会员卡',
          count: true
        },
        {
          value: 'totalAmount',
          label: '实收总金额',
          count: true
        },
        {
          value: 'receivableAmount',
          label: '应收总金额',
          count: true
        },
        {
          value: 'hangupAmount',
          label: '记账金额',
          count: true
        },
        {
          value: 'reductionAmount',
          label: '优惠合计',
          count: true
        },
        {
          value: 'hangupAmount',
          label: '欠费金额',
          count: true
        },
        {
          label: '操作',
          operType: 'button',
          width: 100,
          operations: [
            // {
            //     func: this.refundStatus,
            //     label: '打印',
            //     type: 'primary'
            // },
            {
              func: this.handDetail,
              label: '详情',
              type: 'primary'
            }
          ]
        }
      ],
      // 详情列表
      detailColumns: [
        {
          value: 'patientName',
          label: '病人姓名'
        },
        {
          value: 'phone',
          label: '手机号码'
        },
        {
          value: 'itemName',
          label: '支付方式'
        },
        {
          value: 'receiverName',
          label: '收银员'
        },
        {
          value: 'chargeTime',
          label: '收费时间'
        },
        {
          label: '收费状态',
          formatter(row) {
            return row.itemCode != '05' ? '已收费' : '未收费'
          }
        },
        {
          value: 'chargeSource',
          label: '来源'
        },
        {
          label: '单据类型',
          formatter(row) {
            return row.chargeSource === '医生处方' ||
              row.chargeSource === '快速收费' ||
              row.chargeSource === '退费后新订单' ||
              row.chargeSource === '还账'
              ? '收费'
              : '退费'
          }
        },
        {
          value: 'totalAmt',
          label: '金额'
        }
      ],
      // 每日交账
      diagnosisColumns: [
        {
          value: 'patientName',
          label: '病人姓名'
        },
        {
          value: 'phone',
          label: '手机号码',
          width: 100
        },
        {
          value: 'itemName',
          label: '支付方式',
          width: 80
        },
        {
          value: 'receiverName',
          label: '收银员',
          width: 90
        },
        {
          value: 'chargeTime',
          label: '收费时间'
        },
        {
          label: '单据类型',
          formatter(row) {
            return row.chargeSource === '医生处方' ||
              row.chargeSource === '快速收费' ||
              row.chargeSource === '退费后新订单' ||
              row.chargeSource === '还账'
              ? '收费'
              : '退费'
          },
          width: 80
        },
        {
          value: 'totalAmt',
          label: '金额',
          width: 100
        }
      ],
      // 详情数据
      detailList: [],
      chargePerson: [],
      cacheForm: {},
      // 项目类别
      palTypeList: [
        { label: 'cash', value: '01' },
        { label: 'aliPay', value: '02' },
        { label: 'wechatPay', value: '03' },
        { label: 'unionPay', value: '04' },
        { label: 'unPay', value: '05' },
        { label: 'medicalInsurance', value: '11' },
        { label: 'commercialInsurance', value: '21' }
      ],
      diagnosisFormData: [
        {
          type: 'span',
          name: '上次交账时间',
          spanCount: 18,
          field: 'datesRanger'
        }
      ],
      formData: {
        datesRanger: '',
        strArr: []
      }
    }
  },
  methods: {
    // 返回
    backList() {
      this.isShowDetail = false
      this.handleSearch()
    },

    // 查询数据
    handleSearch(form) {
      this.cacheForm = {
        startTime: getSevenDays(getCurrentDay(), true),
        endTime: getCurrentDay(),
        dates: [getSevenDays(getCurrentDay(), true), getCurrentDay()]
      }
      this.cacheForm = this.cacheForm || form
      const params = Object.assign({}, this.cacheForm, form)
      this.$refs.form.initforms(params)
      this.$nextTick(() => {
        params.pageNo = this.pageIndex
        params.pageSize = this.pageSize
        params.startTime = params.dates[0]
        params.endTime = params.dates[1]
        delete params.dates
        // this.$refs.form.$refs.form.resetFields()
        this.$refs.form.$refs.form.validate(valid => {
          if (valid) {
            accountList(params).then(res => {
              this.showChargeList(res)
            })
          }
        })
      })
    },

    showChargeList(res) {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        const result = d.list
        const that = this
        this._.forEach(result, function(item) {
          for (var key in item.itemType) {
            for (let index = 0; index < that.palTypeList.length; index++) {
              if (key == that.palTypeList[index].value) {
                item[that.palTypeList[index].label] = item.itemType[key]
                break
              } else {
                if (item[that.palTypeList[index].label] == '') {
                  item[that.palTypeList[index].label] = 0
                }
              }
            }
          }
        })
        this.total = d.totalRecord
        this.dataList = result
      }
    },

    // 收费流水的合计行
    getSummaries(param) {
      return getTabTotalRow(param, this.columns)
    },

    // 查看详情
    handDetail(obj) {
      this.isShowDetail = true
      this.objDetail = obj
      this.chargeListPage(obj)
    },

    // 交账详情
    chargeListPage(obj, flag = true) {
      this.describe.value = 0
      const data = { startTime: obj.startTime, endTime: obj.endTime }
      chargeListPage(data).then(res => {
        if (res.STATUS == '1') {
          this.detailList = res.ITEMS
          if (!flag) {
            if (this.detailList.length == 0) {
              this.$message.warning('暂无可交账的订单！')
            } else {
              this.$refs.diagnosis.open()
            }
          }
          const that = this
          this._.forEach(res.ITEMS, function(item) {
            if (item.chargeSource != '还账') {
              that.describe.value += item.totalAmt
            }
          })
          that.describe.value = that.describe.value.toFixed(2)
          that.describe.form.totalAmount = that.describe.value
        }
      })
    },

    // 每日交账
    dailyAccount(obj) {
      const timeStr = getCurrentDay()
      this.formData.strArr = [timeStr.split(' ')[0] + ' 00:00:00', timeStr]
      this.formData.datesRanger = timeStr.split(' ')[0] + ' 00:00:00' + ' - ' + timeStr
      this.$refs.diagnosis.initforms(this.formData)
      obj.startTime = this.formData.strArr[0]
      obj.endTime = this.formData.strArr[1]
      this.chargeListPage(obj, false)
    },

    // 交账
    saveAccount() {
      if (!this.describe.form.totalAmount || this.describe.form.totalAmount <= 0) {
        this.$message.warning('实收金额必填')
        return
      }

      if (this.describe.form.totalAmount != this.describe.value) {
        this.$confirm(`实收金额和应收金额不一致，是否继续交账?`, '提示', {
          type: 'warning'
        })
          .then(() => {
            const data = {
              startTime: this.formData.strArr[0],
              endTime: this.formData.strArr[1],
              totalAmount: this.describe.form.totalAmount.toFixed(2)
            }
            saveAccount(data).then(res => {
              if (res.STATUS == '1') {
                this.$message.success(res.MESSAGE)
                this.$refs.diagnosis.close()
                this.handleSearch()
              }
            })
          })
          .catch(() => {})
      } else {
        const data = {
          startTime: this.formData.strArr[0],
          endTime: this.formData.strArr[1],
          totalAmount: this.describe.form.totalAmount.toFixed(2)
        }
        saveAccount(data).then(res => {
          if (res.STATUS == '1') {
            this.$message.success(res.MESSAGE)
            this.$refs.diagnosis.close()
            this.handleSearch()
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  margin-bottom: 20px;
  line-height: 50px;
}
.detail-info {
  margin-bottom: 10px;
  span {
    font-size: 14px;
    font-weight: bold;
    margin-left: 15px;
    &:first-child {
      margin-left: 0;
    }
  }
  .diffenert-account {
    color: #e5510f;
  }
}
</style>

<style lang="scss">
.daily-account {
  .el-dialog__wrapper {
    .el-dialog {
      .el-dialog__header {
        height: 50px;
        background-color: #0097ff !important;
      }
      .el-dialog__title {
        font-size: 16px;
        line-height: 20px;
        color: white !important;
      }
      .el-dialog__headerbtn .el-dialog__close {
        color: white;
      }
      .el-table {
        max-height: 402px;
        overflow-y: scroll;
      }
    }
  }
}
</style>

