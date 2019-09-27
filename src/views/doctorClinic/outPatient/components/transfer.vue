<template>
    <el-row class="page-main referral" v-loading="loading">
        <el-row :gutter="20">
            <el-col :sm="24" :md="24" class="referral_right">
                <el-row>
                    <el-row class="tabs-right" v-if="!disabled">
                        <!-- <el-button :size="size" @click="handleGetRecord()">转诊记录</el-button> -->
                        <el-button :size="size" @click="submitMedcial('save')">保存</el-button>
                        <el-button :size="size" type="primary" :disabled="patient.transferStatus > 1?true:false" @click="submitMedcial('transfer')">转诊</el-button>
                    </el-row>
                    <el-row class="tabs-right" v-else>
                        <el-button :size="size" type="primary"  @click="handlePrintTransfer">转诊单打印</el-button>
                    </el-row>
                </el-row>
                <!-- 门诊病历 -->
                <el-col>
                    <medical-record class="checkAppointment" :patient="patient" :case-id="caseId" ref="medicalRecordForm" :flag="flagDept" @handleConfirmPatient="handleConfirmPatient" @handleConfirmTransfer="handleConfirmTransfer" @handleConfirmCase="handleConfirmCase" :disabled="disabled" @getCacheTransferData = "getCacheTransferData"></medical-record>
                </el-col>

                <!-- <el-button @click="handlePrintStub">打印</el-button> -->
                <!-- <el-button @click="handlePrintTransfer">打印转诊</el-button> -->
            </el-col>
        </el-row>
        <!-- 转诊记录 -->
        <el-dialog title="转诊记录" :visible.sync="transferDialogVisible">
            <el-table-self :table-data="transferData" :columns="transferColumns"></el-table-self>
        </el-dialog>
    </el-row>
</template>

<script>
import { saveTransferInfo } from '@/api/api'
import { getDictByIdList } from '@/api/catalog'
import medicalRecord from '../transfer/medicalRecord'
import elTableSelf from '@/components/TabComponents/index'
import { deepClone, isNotANumber, param } from '@/utils'
import { handlePrintStub, handlePrintTransfer } from '../print.js'
import { param2Obj } from '../../../../utils'
export default {
    components: {
        medicalRecord,
        elTableSelf
    },
    props: ['patient', 'caseId', 'disabled'],
    data() {
        return {
            flagDept: false,
            size: 'small',
            isAdd: true, // 新增
            routeType: this.$route.params.type,
            status: this.status,
            loading: false,
            saveOrTransfer: false,
            transferDialogVisible: false,
            transferData: [{}],
            transferColumns: [
                {
                    label: '转诊日期',
                    value: 'groupNo',
                    maxLength: 20,
                    width: '150px'
                },
                {
                    label: '转入医院',
                    value: 'groupNo',
                    maxLength: 20,
                    width: '100px'
                },
                {
                    label: '转入科室',
                    value: 'groupNo'
                },
                {
                    label: '转诊原因',
                    value: 'groupNo'
                }
            ]
        }
    },
    methods: {
        // 获取转诊记录
        handleGetRecord() {
            this.transferDialogVisible = true
        },

        // 提交 保存转诊
        submitMedcial(val) {
            // return
            this.saveOrTransfer = val === 'save'
            this.$refs.medicalRecordForm.$refs.transfer[0].validTtransferInfo()
        },

        // 验证转诊信息
        handleConfirmTransfer(flag) {
            if (flag) {
                this.$refs.medicalRecordForm.$refs.patientRequire[0].validPatientInfo()
            } else {
                this.$message.warning('信息有误或者缺少信息！')
            }
        },

        // 验证基本信息
        handleConfirmPatient(flag) {
            if (flag) {
                this.$refs.medicalRecordForm.$refs.outpatient[0].validCaseInfo()
            } else {
                this.$message.warning('信息有误或者缺少信息！')
            }
        },

        // 验证基本信息
        handleConfirmCase(flag) {
            if (flag) {
                this.handleData()
            } else {
                this.$message.warning('信息有误或者缺少信息！')
            }
        },

        // 整理数据
        handleData() {
            this.loading = true
            const saveFlag = true
            const objForm = this.$refs.medicalRecordForm.$refs
            // 病历信息 + 基本信息 + 转诊信息
            const clinicRecord = Object.assign(
                {},
                this.$refs.medicalRecordForm.$refs.patientRequire[0].form,
                this.$refs.medicalRecordForm.$refs.outpatient[0].form,
                this.$refs.medicalRecordForm.$refs.transfer[0].$refs
                    .transferInfo.form
            )

            // 字段名不对应的字段
            clinicRecord.onsetTime = clinicRecord.morbidity
            clinicRecord.patientAddress = clinicRecord.address
            clinicRecord.historyOfPresentIllness = clinicRecord.presentIllness
            clinicRecord.historyOfPersonal = clinicRecord.personalHistory
            clinicRecord.complaint = clinicRecord.chiefCompliant
            clinicRecord.assistantExaminationResult =
                clinicRecord.assistantExamResult
            clinicRecord.historyOfBirth = clinicRecord.birth
            clinicRecord.historyOfTransfusion = clinicRecord.blood
            clinicRecord.temperature = clinicRecord.bodyTemperature
            clinicRecord.systolicPressure = clinicRecord.sbp
            clinicRecord.familyOfIllness = clinicRecord.familyHistory
            // clinicRecord.familyOfIllness = clinicRecord.familyHistory
            clinicRecord.historyOfFeeding = clinicRecord.feed
            clinicRecord.isInoculation = clinicRecord.isPlanInoculate
            clinicRecord.historyOfSurgery = clinicRecord.operation
            clinicRecord.historyOfPastIllness = clinicRecord.pastHistory
            clinicRecord.pulseRate = clinicRecord.pulse
            clinicRecord.breath = clinicRecord.respirationRate
            clinicRecord.suggestion = clinicRecord.treatPlan
            clinicRecord.checkUp = clinicRecord.otherBodyExam
            clinicRecord.diastolicPressure = clinicRecord.dbp
            clinicRecord.hospitalId = param2Obj(clinicRecord.hospitalId).value
            clinicRecord.deptId = param2Obj(clinicRecord.deptId).value

            // 费用
            clinicRecord.isSubsidy =
                objForm.cost[0].$refs.costInfo.form.isSubsidy
            clinicRecord.totalCharge =
                objForm.cost[0].$refs.costInfo.form.totalCharge
            clinicRecord.moneySubsidy =
                objForm.cost[0].$refs.costInfo.form.moneySubsidy

            if (
                (clinicRecord.moneySubsidy &&
                    !isNotANumber(clinicRecord.moneySubsidy)) ||
                (clinicRecord.totalCharge &&
                    !isNotANumber(clinicRecord.totalCharge))
            ) {
                this.$message.warning('总金额或者补贴金额只能为数字！')
                this.loading = false
                return false
            }

            if (
                Number(clinicRecord.moneySubsidy) >
                Number(clinicRecord.totalCharge)
            ) {
                this.$message.warning('补贴金额不能大于总金额！')
                this.loading = false
                return false
            }

            clinicRecord.totalCharge =
                parseFloat(objForm.cost[0].$refs.costInfo.form.totalCharge)

            // 诊断
            let diagnose = ''
            if (
                clinicRecord.diagnosisList &&
                clinicRecord.diagnosisList.length > 0
            ) {
                clinicRecord.diagnosisList.forEach((item, index) => {
                    diagnose += JSON.stringify(item) + ';'
                })
            }

            clinicRecord.diagnose = diagnose

            clinicRecord.transferTimeEnd = clinicRecord.transferTimeArr[1]
            clinicRecord.transferTime = clinicRecord.transferTimeArr[0]

            clinicRecord.appState = this.saveOrTransfer ? 0 : 1

            clinicRecord.transferTemplate = 0
            clinicRecord.transferId = this.patient.transferId || 0
            let allergies = []

            // return
            if (
                clinicRecord.allergytList &&
                clinicRecord.allergytList.length > 0
            ) {
                clinicRecord.allergytList.forEach(item => {
                    if (
                        item.allergyName ||
                        item.degreeName ||
                        item.reactionName
                    ) {
                        item.allergytName = item.allergyName
                        allergies.push(item)
                    }
                })
            } else {
                allergies = clinicRecord.allergytList
            }
            if (allergies.length === 0) {
                clinicRecord.isAllergicHistory = 0
            } else {
                clinicRecord.isAllergicHistory = 1
            }

            let params = {}
            // 处置
            let prescription = deepClone(
                this.$refs.medicalRecordForm.$refs.westernMedicine[0].tabList
            )
            const prescription_arr = []
            if (prescription.length > 0) {
                prescription.forEach((item, index) => {
                    if (item.drugName) {
                        item.orderSubNo = index + 1
                        item.routeCode = item.routeName ? param2Obj(item.routeName).code : ''
                        item.routeName = item.routeName ? param2Obj(item.routeName).name : ''
                        prescription_arr.push(item)
                    }
                })
            }

            prescription = prescription_arr
            // return
            // 检查
            let examInfo = deepClone(
                this.$refs.medicalRecordForm.$refs.inspection[0].tableData
            )

            let temp_arr = []
            if (examInfo.length > 0) {
                examInfo.forEach(item => {
                    if (item.testName) {
                        if (item.testName.split(',').length == 2) {
                            item.testNo = item.testName.split(',')[0]
                            item.testName = item.testName.split(',')[1]
                        }
                        temp_arr.push(item)
                    }
                })
            } else {
                temp_arr = []
            }
            examInfo = temp_arr

            // 检验
            const analysis = deepClone(
                this.$refs.medicalRecordForm.$refs.examine[0].tableData
            )

            const temp_analysis = []
            if (analysis.length > 0) {
                analysis.forEach(item => {
                    const temp_items = []
                    if (item.testName) {
                        if (item.testName.indexOf(',') > -1) {
                            item.testNo = item.testName.split(',')[0]
                            item.testName = item.testName.split(',')[1]
                        } else {
                            item.testNo = ''
                        }
                        temp_items.push(item)
                        temp_analysis.push({
                            inspect: {
                                testName: item.testName,
                                testNo: item.testNo
                            },
                            items: temp_items
                        })
                    }
                })
            }
            params = {
                // 当前登陆人
                userName: this.$store.state.user.user.realName,
                // 附件信息
                attachments: this.$refs.medicalRecordForm.$refs.upload.form
                    .attachment,
                // 处置/处方
                prescriptions: prescription || [],
                // 检查
                examList: examInfo || [],
                // 检验
                analysisList: temp_analysis || [],
                // 费用
                // 'charge':this.$refs.medicalRecordForm.$refs.cost.tableData||[],
                // 过敏
                allergies: allergies
            }
            const dto = Object.assign(params, clinicRecord)
            const data = {
                referralDockingDTO: dto,
                registerId: this.$route.params.regId
            }
            saveTransferInfo(data).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.$emit('transferIdChange', res.ITEMS)
                    if (!this.saveOrTransfer) {
                        this.handlePrintStub()
                        this.handlePrintTransfer()
                    }
                }
            })
        },

        // 打印双向转诊单存根
        handlePrintStub() {
            const clinicRecord = Object.assign(
                {},
                this.$refs.medicalRecordForm.$refs.patientRequire[0].form,
                this.$refs.medicalRecordForm.$refs.outpatient[0].form,
                this.$refs.medicalRecordForm.$refs.transfer[0].$refs
                    .transferInfo.form
            )
            handlePrintStub(clinicRecord)
        },

        handlePrintTransfer() {
            const clinicRecord = Object.assign(
                {},
                this.$refs.medicalRecordForm.$refs.patientRequire[0].form,
                this.$refs.medicalRecordForm.$refs.outpatient[0].form,
                this.$refs.medicalRecordForm.$refs.transfer[0].$refs.transferInfo.form,
                this.$refs.medicalRecordForm.$refs.cost[0].$refs.costInfo.form,
                { prescriptions: this.$refs.medicalRecordForm.$refs.westernMedicine[0].tabList },
                { analysisList: this.$refs.medicalRecordForm.$refs.inspection[0].tableData },
                { examList: this.$refs.medicalRecordForm.$refs.examine[0].tableData }
            )
            const dictData = this.$store.getters.dictData
            const dictMap = {
                139: dictData[139],
                138: dictData[138],
                140: dictData[140]
            }
            handlePrintTransfer(clinicRecord, dictMap)
        },

        getCacheTransferData(){
            this.$emit('getCacheTransferData')
        }
    },
    mounted() {}
}
</script>

<style  lang="scss">
.tabs-right {
    position: absolute !important;
    right: 14px;
    z-index: 9;
}
.printStub {
    width: 100%;
    padding: 0 20px;

    .title {
        width: 100%;
        height: 80px;
        line-height: 80px;
        border-bottom: 1px solid #333;
        text-align: center;
        font-size: 23px;
    }

    .subTitle {
        width: 100%;
        text-align: center;
        margin-top: 20px;
        font-size: 23px;
    }

    .content {
        width: 100%;
        margin-top: 50px;

        p {
            span {
                margin-bottom: 40px;
                margin-top: 0;
                margin-left: 3.5%;

                em {
                    float: left;
                }
            }

            small {
                overflow: hidden;
                display: block;
                padding: 0 5px;
            }
        }

        em {
            font-style: normal;
        }

        span {
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
        }

        small {
            font-size: 16px;
            border-bottom: 1px solid #333;
            height: 20px;
            display: inline-block;
            margin-bottom: 20px;
            padding: 0 15px;
            margin: 0 5px;
            line-height: 20px;
        }
    }

    .footer {
        margin-top: 50px;

        p {
            margin-top: 20px;
            text-align: right;
            margin-right: 100px;
        }

        p:nth-of-type(2) {
            letter-spacing: 50px;
            margin-right: 0;
        }
    }
}

.printTransfer {
    width: 100%;
    padding: 0 25px;
    font-size: 10px;
    .inline {
        margin-right: 10px;
        display: inline-block !important;
        margin-top: 0 !important;
    }
    .page {
        overflow: hidden;
    }
    h1 {
        font-weight: 700;
        margin-top: 20px;
        text-align: center;
        color: #000;
    }
    .content {
        margin-top: 15px;
        .title {
            color: #000;
            font-weight: 600;
            font-size: 17px;
            margin-bottom: 5px;
        }
        div {
            color: #000;
            span {
                margin-bottom: 2px;
                margin-top: 10px;
                display: inline-block;
                span {
                    display: block;
                }
                &.w100 {
                    width: 100%;
                }
                &.w50 {
                    width: 50%;
                }
                &.w48 {
                    width: 48%;
                }
                &.w24 {
                    width: 24%;
                }
            }
        }
    }
}
</style>
<style>
.referral .el-table--small td {
    padding: 8px 5px !important;
}
.referral .el-table td div {
    width: 100%;
}
.checkAppointment {
    margin-top: 45px;
}
</style>
