<template>
  <el-row>
    <direct-search ref="form" :label-position="'right'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="detailSearchList" @handleSearch="handleSearch" />
    <el-table-self :getSummaries="getSummaries" :columns="detailColumns" :table-data="detailList" :show-summary="true" />
  </el-row>
</template>

<script>
import { chargeList } from '@/api/charge'
import { getOrgClinicPerson } from '@/api/org'

import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { getTabTotalRow } from '@/views/report/common/index'

import { pickerOptions } from '@/utils'
import { getCurrentDay, getSevenDays } from '@/utils/common'

export default {
  components: {
    directSearch,
    elTableSelf
  },
  mixins: [paginationMixin],
  data() {
    // 获取收费人员、
    const chargePerson = []
    const data = { avatarFlag: 0 }
    getOrgClinicPerson(data).then(res => {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        this._.forEach(d, function(item) {
          chargePerson.push({
            value: item.userId,
            label: item.userRealName
          })
        })
      }
    })
    return {
      // 收费流水搜索栏
      detailSearchList: [
        {
          type: 'daterange',
          dateType: 'datetimerange',
          label: '登记日期',
          prop: 'dates',
          options: pickerOptions,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          rules: [{ required: true, message: '登记日期范围必填' }]
        },
        {
          type: 'select',
          label: '收费员',
          prop: 'receiverId',
          opts: chargePerson
        },
        {
          type: 'input',
          label: '',
          prop: 'name',
          placeholder: '患者姓名/手机号',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          }
        }
      ],

      // 收费流水数据
      detailList: [],
      // 收费流水模板
      detailColumns: [
        {
          value: 'name',
          label: '病人姓名'
        },
        {
          value: 'djtype',
          label: '单据类型'
        },
        {
          value: 'charge',
          label: '本次费用',
          count: true
        },
        {
          value: 'receipt',
          label: '实收',
          count: true
        },
        {
          value: 'cashier',
          label: '收费员'
        },
        {
          value: 'chargeTime',
          label: '收费时间'
        },
        {
          value: 'checkoutState',
          label: '交账状态'
        },
        {
          value: 'source',
          label: '来源'
        }
      ],
      chargePerson: [],
      cacheForm: {}
    }
  },
  methods: {
    handleSearch(form) {
      this.cacheForm = {
        beginTime: getSevenDays(getCurrentDay(), true),
        endTime: getCurrentDay(),
        dates: [getSevenDays(getCurrentDay(), true), getCurrentDay()]
      }
      this.cacheForm = this.cacheForm || form
      const params = Object.assign({}, this.cacheForm, form)
      this.$refs.form.initforms(params)
      this.$nextTick(() => {
        params.pageNo = this.pageIndex
        params.pageSize = this.pageSize
        params.beginTime = params.dates[0]
        params.endTime = params.dates[1]
        delete params.dates
        // this.$refs.form.$refs.form.resetFields()
        this.$refs.form.$refs.form.validate(valid => {
          if (valid) {
            chargeList(params).then(res => {
              this.showChargeList(res)
            })
          }
        })
      })
    },
    showChargeList(res) {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        let result = []
        this._.forEach(d, function(item) {
          item.name = item.patientName
          item.charge = item.totalAmt ? item.totalAmt : 0
          item.receipt = item.receivedCash ? item.receivedCash : 0
          item.cashier = item.reciverName ? item.reciverName : ''
          item.chargeTime = item.chargeTime ? item.chargeTime : ''
          item.source = item.chargeSource ? item.chargeSource : ''
          switch (
            item.chargeStatus // 单据类型
          ) {
            case 0:
              item.djtype = '收费单'
              break
            case 1:
              item.djtype = '退费单'
              break
          }
          switch (
            item.refundStatus // 交账状态
          ) {
            case 0:
              item.checkoutState = '已收费'
              break
            case 1:
              item.checkoutState = '已退费'
              break
          }
        })
        result = d
        this.detailList = result
      }
    },
    // 收费流水的合计行
    getSummaries(param) {
      return getTabTotalRow(param, this.detailColumns)
    }
  }
}
</script>
