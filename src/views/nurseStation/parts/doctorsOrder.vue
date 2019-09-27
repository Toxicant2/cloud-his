<template>
  <el-row class="page-main" v-if="tabType === '门诊收费清单'">
    <patient-detail :title="'基本信息'" :describe-list="describeList" :describe-data="describeData" />
    <div style="margin-bottom:10px">
      <patient-detail style="margin-top:10px" :title="'就诊信息'" :describe-list="medicalList" :describe-data="medicalData" />
    </div>
    <hr>
    <div style="font-size:14px;padding-top:10px;">
      门诊费用清单：
    </div>
    <div style="margin-top:15px">
      <el-table-self :tab-type="'index'" :tab-label="'组号'" :columns="columns" :table-data="dataList" />
    </div>
  </el-row>
</template>

<script>
import patientDetail from '../components/patientDetail'
import elTableSelf from '@/components/TabComponents/index'
import { getNurseStationPatientDetail } from '@/api/outpatient'
import { getCurrentDay } from '@/utils/common'
import { handlePrintDetail } from '@/views/charge/commonPrint.js'
import { formatSex, getBabyAge } from '@/utils'
import { getFloat } from '@/utils/float'
export default {
  components: {
    patientDetail,
    elTableSelf
  },
  data() {
    return {
      describeList: [
        {
          label: '姓名',
          value: 'name'
        },
        {
          label: '性别',
          value: 'sex'
        },
        {
          label: '病历号',
          value: 'outpatientNum'
        },
        {
          label: '年龄',
          value: 'age'
        },
        {
          label: '来源',
          value: 'patientSources'
        },
        {
          label: '联系人',
          value: 'linkman'
        },
        {
          label: '联系电话',
          value: 'tel'
        }
      ],
      chargeNum: {},
      describeData: {},
      medicalList: [
        {
          label: '过敏史',
          value: 'allergyStr'
        },
        {
          label: '既往史',
          value: 'pastHistory'
        },
        {
          label: '就诊次数',
          value: 'visitsNumber'
        },
        {
          label: '最近就诊',
          value: 'nowConsultation'
        },
        {
          label: '本次消费',
          value: 'consumption',
          unit: '元'
        }
      ],
      medicalData: {},
      columns: [
        {
          value: 'accrualCatName',
          label: '项目名称'
        },
        {
          value: 'spec',
          label: '规格'
        },
        {
          value: 'qty',
          label: '总量'
        },
        {
          value: 'unit',
          label: '单位'
        },
        {
          value: 'totalAmt',
          label: '金额'
        },
        {
          value: 'status',
          label: '状态'
        }
      ],
      dataList: []
    }
  },
  props: {
    tabType: {
      type: String
    },
    id: {
      default: ''
    }
  },
  computed: {},
  watch: {
    id: function(val, oldVal) {
      if (val) {
        this.getPatientDetail(val) // 基本信息
      }
    }
  },

  methods: {
    // 查询患者基本详情
    getPatientDetail(id) {
      getNurseStationPatientDetail(id).then(res => {
        if (res.STATUS === '1') {
          if (res.ITEMS) {
            this.describeData = res.ITEMS.orgOutpRegisterDTO
            this.describeData.age = getBabyAge(res.ITEMS.orgOutpRegisterDTO.birthDate)
            this.$store.getters.dictData[30].forEach(item => {
              if (this.describeData.patientSources === item.value) {
                this.describeData.patientSources = item.label
              }
            })
            this.describeData.sex = formatSex(this.describeData.sex)
            this.describeData.outpatientNum = res.ITEMS.orgOutpRegisterDTO.outpatientNum
            if (res.ITEMS.opCeChargeDetailList.length > 0) {
              let list = []
              res.ITEMS.opCeChargeDetailList.forEach(item => {
                list = list.concat(item)
              })
              this.dataList = list
              this.chargeNum = res.ITEMS.opCeChargeValue[0]
              this.dataList.forEach(item => {
                item.name = item.accrualCatName
                item.num = item.qty
                item.status = '已收费'
                item.zongAccount = item.totalAmt
              })
              // 就诊信息
              let allergyStr = ''
              if (res.ITEMS.allergyDTOList && res.ITEMS.allergyDTOList.length > 0) {
                res.ITEMS.allergyDTOList.forEach(item => {
                  allergyStr += item.allergyName + ','
                })
              }
              allergyStr = allergyStr.substring(0, allergyStr.length)
              const objIndo = {}
              objIndo.allergyStr = allergyStr
              objIndo.nowConsultation = res.ITEMS.nowConsultationDTO.nowConsultation
              objIndo.visitsNumber = res.ITEMS.visitsNumDTO.visitsNumber

              objIndo.consumption = res.ITEMS.receivableAmtAndCash.receivableAmt

              objIndo.pastHistory = res.ITEMS.pastHistoryDTO
                ? res.ITEMS.pastHistoryDTO.pastHistory
                : ''
              this.medicalData = objIndo
            } else {
              this.medicalData = {}
              this.chargeNum = {}
              this.dataList = []
            }

            // 应收金额、实收金额
            this.chargeNum.receivableAmt = res.ITEMS.receivableAmtAndCash.receivableAmt
            this.chargeNum.receivedCash = res.ITEMS.receivableAmtAndCash.receivedCash
          } else {
            this.medicalData = {}
            this.describeData = {}
            this.chargeNum = {}
            this.dataList = []
          }
        }
      })
    },
    print() {
      if (this.dataList.length > 0) {
        const chargeInfo = {
          patientInfoName: this.describeData.name,
          clinicTime: this.chargeNum.chargeTime,
          outpatientNumber: this.chargeNum.outpatientNum,
          receivedCash:
            this.chargeNum.itemName &&
            this.chargeNum.itemName.split('，').length === 1 &&
            this.chargeNum.itemName.split('，')[0] === '现金'
              ? getFloat(this.chargeNum.receivedCash, '6')
              : this.chargeNum.receivedCash,
          doctorName: this.chargeNum.doctorName,
          receiverName: this.chargeNum.receiverName,
          chargeAccount: this.chargeNum.receivableAmt,
          otherName: this.chargeNum.itemName,
          currentTime: getCurrentDay()
        }
        handlePrintDetail(this.dataList, chargeInfo)
        window.location.reload()
      } else {
        this.$message.warning('暂无相关数据！')
      }
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
.toolbar {
  line-height: 36px;
}
</style>

<style>
.diagnosis .el-form-item__label {
  width: 125px !important;
}

.diagnosis .el-input-group__prepend div.el-select .el-input__inner {
  padding-left: 55px !important;
}

.diagnosis .el-form-item__content {
  margin-left: 130px !important;
}

.select-doctor .el-dialog__body {
  padding-top: 0;
}
</style>