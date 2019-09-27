<template>
    <!-- <el-row class="page-container"> -->
    <el-row class="page-main">
        <el-button style="float:right;position:relative;z-index:2" @click="back">返回</el-button>
        <el-row id="printCheck" class="diagnosis">
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <doctors-order v-if="tab.key === 'doctorsOrder'" ref="doctorsOrder" :tab-type="tabType" :name="tabType" :id="id" />
                    <medical-record v-else-if="tab.key === 'medicalRecord'" ref="medicalRecord" :tab-type="tabType" :id="id" />
                    <implement v-else-if="tab.key === 'implement'" ref="implement" :tab-type="tabType" :id="id" />
                    <outpatient-bill v-else ref="outpatientPrescriptions" :tab-type="tabType" :id="id" :name="tabType" :status="execState" />
                </el-tab-pane>

                <!-- <el-checkbox  style="margin:10px;" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox> -->
                <!-- <el-row  style="margin:10px;">
                    <el-checkbox-group v-model="checkedCities" @change="handleCheckedChange">
                        <el-checkbox v-for="print in prints" :label="print" :key="print">{{print}}</el-checkbox>
                    </el-checkbox-group>
                </el-row> -->
                <el-row style="text-align:center;margin:20px 0 10px 0;">
                    <el-button v-if="type === 'noExecute' &&(activeName === 'outpatientPrescriptions' || activeName === 'treatmentSheet' || activeName === 'treatment' || activeName === 'examTest')" type="primary" @click="execute" >执行</el-button>
                    <el-button type="primary" size="small" @click="print">打印</el-button>
                </el-row>
            </el-tabs>
        </el-row>
    </el-row>
    <!-- </el-row> -->
</template>

<script>
import doctorsOrder from './parts/doctorsOrder'
import outpatientBill from './parts/outpatientBill'
import medicalRecord from './parts/medicalRecord'
import implement from './parts/implement'
export default {
    components: {
        doctorsOrder,
        outpatientBill,
        medicalRecord,
        implement
    },
    props: {
    // id: {
    //     default: ''
    // }
    },
    data() {
        const printOptions = [
            '门诊费用',
            '门诊处方',
            '注射单',
            '治疗单',
            '检查检验',
            '门诊病历',
            '执行'
        ]
        return {
            checkedCities: ['门诊费用'],
            tabType: '门诊收费清单',
            checkAll: [],
            prints: printOptions,
            tabMapOpts: [
                {
                    label: '门诊收费清单',
                    key: 'doctorsOrder'
                },
                {
                    label: '门诊处方',
                    key: 'outpatientPrescriptions'
                },
                {
                    label: '注射单',
                    key: 'treatmentSheet'
                },
                {
                    label: '治疗单',
                    key: 'treatment'
                },
                {
                    label: '检查检验',
                    key: 'examTest'
                },
                {
                    label: '门诊病历',
                    key: 'medicalRecord'
                },
                {
                    label: '执行',
                    key: 'implement'
                }
            ],
            activeName: 'doctorsOrder',
            cacheForm: {},
            id: this.$route.params.id,
            type:this.$route.params.type,
            execState:this.$route.params.status,
            index:0
        }
    },
    mounted() {
        this.$refs.doctorsOrder[0].getPatientDetail(this.id)
    // this.$refs.outpatientPrescriptions[0].getData(this.id)
    // this.$refs.medicalRecord[0].getPatientDetail(this.id)
    },

    methods: {
        handleSwitch(val) {
            this.index = val.index
            this.checkedCities = []
            this.tabType = val.label
            if (val.label === '门诊收费清单') {
                this.checkedCities.push('门诊费用')
            } else if (val.label !== '门诊病历') {
                this.checkedCities.push(val.label)
            }
            if (val.label === '门诊病历') {
                this.$refs.medicalRecord[0].getPatientDetail(this.id || 0,this.execState)
            } else if (val.label === '门诊收费清单') {
                this.$refs.doctorsOrder[0].getPatientDetail(this.id || 0)
            } else if (val.label === '执行') {
                this.$refs.implement[0].getData(this.id || 0)
            } else {
                this.$refs.outpatientPrescriptions[Number(val.index) - 1].getData(this.id || 0,this.execState)
            }
        },
        handleCheckAllChange(val) {
            this.checkedCities = val ? this.prints : []
            this.isIndeterminate = false
        },
        handleCheckedChange(value) {},
        print() {
            if (this.tabType === '门诊收费清单') {
                this.$refs.doctorsOrder[0].print()
            } else if (this.tabType === '门诊病历') {
                this.$refs.medicalRecord[0].print()
            } else if (this.tabType === '执行') {
                this.$refs.implement[0].print()
            } else {
                this.$refs.outpatientPrescriptions[this.index - 1].print()
            }
        },

        // 执行
        execute(){
            this.$refs.outpatientPrescriptions[this.index - 1].execute(this.index - 1)
        },

        back() {
            this.$router.push({ name: 'nurseStation' })
        }
    }
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
