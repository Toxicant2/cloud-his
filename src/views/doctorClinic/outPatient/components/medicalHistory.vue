<template>
  <el-dialog center :visible.sync="visible" title="历史用药" width="600px" @close="close">
    <el-scrollbar style="height:480px;">
      <el-table-self
        :tab-type="'selection'"
        :table-data="tableData"
        :columns="columns"
        @selectionChange="selectionChange"
      ></el-table-self>
    </el-scrollbar>
    <div class="med">
      <el-checkbox v-model="isSingle" @change="getMedicalHistory">药品去重</el-checkbox>
      <el-button @click="close">取消</el-button>
      <el-button @click="handleUseMedical">引用</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import { medicalHistory, medicalDetail } from '@/api/outpatient'
export default {
    components: {
        elTableSelf
    },
    data() {
        return {
            visible: false,
            isSingle: true,
            tableData: [],
            columns: [
                {
                    label: '就诊日期',
                    value: 'prescribingTime',
                    formatter(row) {
                        return row.prescribingTime ? row.prescribingTime.split(' ')[0] : ''
                    },
                    width: 100
                },
                {
                    label: '主诊断',
                    value: 'mainDiseaseName'
                },
                {
                    label: '药品名称',
                    value: 'itemName'
                }
            ],
            selections: [],
            medicalList: [],
            onOff: true,
            type: ''
        }
    },
    methods: {
        close() {
            this.visible = false
            this.selections = []
        },
        open(type, onOff) {
            this.type = type
            this.isSingle = true
            this.visible = true
            this.onOff = onOff
            this.getMedicalHistory()
        },

        // 获取历史用药列表
        getMedicalHistory() {
            const data = {
                patientId: this.$route.params.patientId,
                recipeChara: this.type,
                distinct: this.isSingle ? 1 : 0
            }
            medicalHistory(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tableData = d
                }
            })
        },

        selectionChange(selections) {
            this.selections = selections
        },

        // 获取历史用药详情
        getMedicalDetail(id) {
            medicalDetail(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const medicalList = {
                        name: d.itemName,
                        price: d.price,
                        specDose: d.dosage,
                        specDoseUnit: d.dosageUnit,
                        id: d.itemId,
                        spec: d.spec,
                        unit: d.unit,
                        dose: d.dose,
                        retailPrice: d.retailPrice,
                        isStock: d.isStock
                        // doseUnit:d.dosageUnit
                    }
                    this.$nextTick(() => {
                        this.$emit('medReference', medicalList, 'history')
                    })
                }
            })
        },

        // 引用
        handleUseMedical() {
            if (this.onOff) {
                this.medicalList = []
                if (this.selections && this.selections.length > 0) {
                    this.selections.forEach(item => {
                        this.getMedicalDetail(item.id)
                    })
                } else {
                    this.$message.warning('请选择药品')
                }
            } else {
                this.$message.warning('收费处方或作废处方或审核中处方不能修改，请添加新处方')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.med {
  margin-top: 30px;
  text-align: right;
  button {
    margin-left: 10px;
  }
}
</style>