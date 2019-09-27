<template>
  <el-row class="page-main">
    <span class='numtitle'>单号{{chargeInfoList.repaymentNum}}结账详情</span>
    <el-button
      class="btn"
      plain
      icon="el-icon-arrow-left"
      @click="back"
    >返回</el-button>
    <div class='person_info'>
      <div class='person_top'>
        <el-row :gutter="20">
          <el-col
            :span="6"
            v-for="(item,index) in chargeElList"
            :key="index"
          >
            <p>{{item.label}}：{{chargeInfoList[item.value]}}</p>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class='charge_select'>
      <el-row :gutter="20">
        <el-table-self
          :columns="chargeColumns"
          :table-data="chargeList"
          :show-summary="true"
          :getSummaries="getSummaries"
        />
      </el-row>
    </div>
  </el-row>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import { add, getFloat, toFixed } from '@/utils/float'
import { repaymentDetail } from '@/api/charge'
export default {
    components: {
        elTableSelf
    },
    data() {
        return {
            // 收费患者基本信息模板
            chargeElList: [
                {
                    label: '姓名',
                    value: 'patientName'
                }, {
                    label: '性别',
                    value: 'sex'
                }, {
                    label: '年龄',
                    value: 'age'
                }, {
                    label: '手机号',
                    value: 'phone'
                }, {
                    label: '单据号',
                    value: 'repaymentNum'
                }, {
                    label: '会员类型',
                    value: 'commercialInsuranceType'

                }
                // , {
                //     label: '发票号',
                //     value: 'invoiceNumber'
                // }, {
                //     label: '年龄',
                //     value: 'age'
                // }
            ],
            // 收费患者基本信息数据
            chargeInfoList: {
                patientName: '',
                phone: '',
                repaymentNum: '',
                sex: '',
                commercialInsuranceType: '',
                age: ''
            },
            // 交账详情表格
            chargeColumns: [
                {
                    value: 'itemName',
                    label: '支付方式'
                }, {
                    value: 'type',
                    label: '用户类型'
                }, {
                    value: 'receiverName',
                    label: '操作员'
                }, {
                    value: 'receiverTime',
                    label: '操作时间'
                }, {
                    value: 'operationType',
                    label: '操作类型'
                }, {
                    value: 'itemAmt',
                    label: '金额',
                    align: 'center'
                }
            ],
            // 交账详情数据
            chargeList: []
        }
    },
    methods: {
        cell() {
            return 'height:25px;padding:0;border:none;'
        },
        headerCell() {
            return 'border-bottom:1px dashed #ebeef5;padding:0;height:40px;margin-bottom:10px;'
        },
        open() {},

        back() {
            this.$emit('back', 'settle')
        },

        // 合计
        getSummaries(param) {
            const { columns } = param
            const sums = []
            if (columns.length > 0) {
                columns.forEach((column, index) => {
                    if (index === 4) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 0 || index === 1 || index === 2 || index === 3) {
                        sums[index] = ''
                        return
                    }
                    const values = this.chargeList.map(item => Number(item[column.property]))
                    if (!values.every(value => isNaN(value))) {
                        sums[index] = toFixed(values.reduce((prev, curr) => {
                            const value = Number(curr)
                            if (!isNaN(value)) {
                                return prev + curr
                            } else {
                                return prev
                            }
                        }, 0), 2)
                    } else {
                        sums[index] = ''
                    }
                })
            }
            return sums
        },

        // 获取明细
        getDetail(row) {
            Object.assign(this.chargeInfoList, row)
            this.chargeInfoList.commercialInsuranceType = row.chargeType
            repaymentDetail(row.id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            result.push({
                                itemName: item.itemName,
                                receiverName: item.receiverName,
                                receiverTime: item.receiverTime,
                                operationType: item.operationType === '0' ? '记账' : '结账',
                                itemAmt: item.itemAmt,
                                type: row.commercialInsuranceType
                            })
                        })
                    }
                    this.chargeList = result
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.numtitle {
  position: absolute;
  left: 10px;
  top: 0;
  font-size: 15px;
  font-weight: bold;
}
.btn {
  position: absolute;
  right: 10px;
  top: -10px;
}

.person_info {
  border: 1px solid #409eff;
  margin-top: 25px;
  .person_top {
    border-bottom: 1px dashed #ddd;
    padding-bottom: 20px;
    p {
      padding: 20px;
      padding-bottom: 0;
      font-size: 14px;
    }
  }
  .person_bottom {
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    span {
      font-size: 14px;
      margin-left: 30px;
    }
    .el-select {
      width: 150px;
    }
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
.charge_select {
  margin-top: 20px;

  .el-table-self {
    margin-right: 0 !important;
    margin-left: 0 !important;
    padding: 0 10px;
  }
}
</style>