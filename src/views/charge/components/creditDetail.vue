<template>
  <el-row class="page-main">
    <span class="numtitle">单号{{chargeInfoList.chargeNum}}记账详情</span>
    <el-button class="btn" plain icon="el-icon-arrow-left" @click="back">返回</el-button>
    <div class='person_info'>
      <div class='person_top'>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(item,index) in chargeElList" :key="index">
            <p>{{item.label}}：{{chargeInfoList[item.value]}}</p>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class='charge_select'>
      <el-row :gutter="20">
        <el-col :span="20" class="el-col-left">
          <el-table-self :columns="chargeColumns" :table-data="chargeList" :tab-type="'index'" :tab-label="'组号'" />
        </el-col>
        <el-col :span="4">
          <div class='construction'>
            <el-container>
              <el-header class='title'>收费汇总</el-header>

              <div class="list">
                <p>
                  <!-- <span>#</span> -->
                  <span>项目</span>
                  <span>金额</span>
                </p>
                <p v-for="(c,cIndex) in construtList" :key="cIndex" v-if="c.money > 0">
                  <span>{{c.name}}</span>
                  <span>{{c.money}}</span>
                </p>
              </div>
              <el-footer>
                <p>
                  <span>合计：</span>
                  <span>￥{{quickSum}}</span>
                </p>
                <el-button type="primary" @click="print">打印</el-button>
                <el-button style="background-color:#ff6600;border-color:#ff6600;color:#fff" @click="open">交账</el-button>
              </el-footer>
            </el-container>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import { getChargeDetail } from '@/api/charge'
import { add } from '@/utils/float'
import { handlePrintDetail } from '../commonPrint.js'
import { getCurrentDay } from '@/utils/common'
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
        },
        {
          label: '性别',
          value: 'sex'
        },
        {
          label: '年龄',
          value: 'age'
        },
        {
          label: '手机号',
          value: 'phone'
        },
        {
          label: '单据号',
          value: 'chargeNum'
        },
        {
          label: '科室',
          value: 'doctorDeptName'
        },
        {
          label: '医师',
          value: 'doctorName'
        },
        {
          label: '会员类型',
          value: 'type'
        }
      ],
      // 收费患者基本信息数据
      chargeInfoList: {
        patientName: '',
        chargeNum: '',
        doctorDeptName: '',
        doctorName: '',
        phone: '',
        commercialInsuranceType: '',
        sex: '',
        age: ''
      },
      // 待收费明细表格
      chargeColumns: [
        {
          value: 'accrualCatName',
          label: '项目名称',
          align: 'center'
        },
        {
          value: 'spec',
          label: '规格',
          align: 'center'
        },
        {
          value: 'qty',
          label: '数量',
          align: 'center'
        },
        {
          value: 'unit',
          label: '单位',
          align: 'center'
        },
        {
          value: 'price',
          label: '单价',
          align: 'center'
        },
        {
          value: 'totalAmt',
          label: '金额',
          align: 'center'
        },
        {
          value: 'execDeptName',
          label: '执行科室',
          align: 'center'
        }
      ],
      // 待收费明细数据
      chargeList: [],
      construtList: [
        {
          chara: '10',
          name: '西药费',
          money: 0
        },
        {
          chara: '20',
          name: '中药费',
          money: 0
        },
        {
          chara: '30',
          name: '检验/检查',
          money: 0
        },
        {
          chara: '40',
          name: '治疗费',
          money: 0
        },
        {
          chara: '50',
          name: '其他',
          money: 0
        }
      ],
      quickSum: 0,
      creditDetail: {},
      info: []
    }
  },
  methods: {
    cell() {
      return 'height:25px;padding:0;border:none;'
    },
    headerCell() {
      return 'border-bottom:1px dashed #ebeef5;padding:0;height:40px;margin-bottom:10px;'
    },

    back() {
      this.$emit('back', 'credit')
    },

    open() {
      this.$emit(
        'open',
        this.chargeInfoList,
        {},
        this.quickSum,
        [],
        [
          {
            chargeId: this.chargeInfoList.chargeId,
            money: this.chargeInfoList.onAccountOrg,
            chargeNum: this.chargeInfoList.chargeNum
          }
        ]
      )
    },

    getDetail(row) {
      Object.assign(this.chargeInfoList, row)
      this.chargeInfoList.type = row.chargeType
      this.quickSum = row.onAccountOrg
      getChargeDetail(row.chargeId).then(res => {
        if (res.STATUS === '1') {
          this.creditDetail = res.ITEMS.charge
          const d = res.ITEMS.detailList
          const result = []
          if (d && d.length > 0) {
            d.forEach(item => {
              result.push({
                execDeptName: item.execDeptName,
                accrualCatName: item.accrualCatName,
                spec: item.spec,
                qty: item.qty,
                unit: item.unit,
                price: item.price,
                totalAmt: item.totalAmt
              })
              this.info.push({
                name: item.accrualCatName,
                spec: item.spec,
                unit: item.unit,
                price: item.price,
                zongAccount: item.totalAmt,
                recipeChara: item.recipeChara,
                num: item.qty
              })
              this.construtList.forEach((constr, con) => {
                if (item.recipeChara === constr.chara) {
                  constr.money = add(constr.money, item.totalAmt)
                }
              })
            })
          }

          this.chargeList = result
        }
      })
    },

    // 打印记账清单
    print() {
      const currentTime = getCurrentDay()
      const chargeInfo = {
        patientInfoName: this.chargeInfoList.patientName,
        chargeSource: this.creditDetail.chargeSource || '自费',
        outpatientNumber: this.creditDetail.outpatientNum,
        clinicTime: this.creditDetail.chargeTime,
        chargeAccount: this.creditDetail.totalAmt,
        receivedCash: this.creditDetail.receivedCash,
        otherName: '记账',
        doctorName: this.creditDetail.doctorName,
        receiverName: this.creditDetail.receiverName,
        currentTime: currentTime
      }
      handlePrintDetail(this.info, chargeInfo)
      window.location.reload()
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
  .el-col-left {
    padding-right: 0 !important;
  }
  .el-table-self {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}
.construction {
  width: 100%;
  height: 100%;
  border: 1px solid #ebeef5;
  .title {
    text-align: center;
    padding: 8px 0;
    width: 100%;
    font-size: 15px;
    height: 40px !important;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  .el-main {
    padding: 0 10px;
  }
  .el-footer {
    border-top: 1px dashed #ebeef5;
    height: auto !important;
    text-align: right;
    padding: 0;
    margin: 50px 10px 0;
    p {
      margin-top: 10px;
    }
  }
  .el-button--primary {
    margin: 10px 0;
  }
  .el-table::before {
    height: 0;
  }
  .el-table__fixed-right::before {
    height: 0 !important;
  }
  .el-table__fixed::before {
    height: 0 !important;
    background: none;
  }
}
.list {
  margin: 0 20px;

  p {
    width: 100%;
    font-size: 12px;
    display: block;
    line-height: 20px;
    padding: 0 20px;
    color: #606266;
  }
  p:nth-of-type(1) {
    font-weight: bold;
    color: #909399;
    line-height: 40px;
    height: 40px;
    border-bottom: 1px dashed #ddd;
    margin-bottom: 5px;
  }
  p span {
    display: inline-block;
    width: 50%;
    float: left;
  }
  p span:nth-of-type(1) {
    text-align: left;
  }
  p span:nth-of-type(2) {
    text-align: right;
  }
}
</style>