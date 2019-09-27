<template>
  <el-row class="page-main follow">
    <el-dialog title="随访" :visible.sync="centerDialogVisible" width="1000px" center class="chargeDetail" @close="close" :lock-scroll="false">
      <el-row class="dialogHeader">
        <el-col :span="6">
          <img :src="avatar" alt="">
          <div>
            <p>{{patientName}}</p>
            <p><span>{{patientSex}}</span><span>{{patientAge}}</span></p>
          </div>

        </el-col>
        <el-col :span="18">
          <el-button :type="activeName === 'patientInfo'?'primary':'info'" :plain="activeName !== 'patientInfo'" @click="handleSwitch('patientInfo')">患者信息</el-button>
          <el-button :type="activeName === 'clinicRecord'?'primary':'info'" :plain="activeName !== 'clinicRecord'" @click="handleSwitch('clinicRecord')">就诊记录</el-button>
          <el-button :type="activeName === 'chargeRecord'?'primary':'info'" :plain="activeName !== 'chargeRecord'" @click="handleSwitch('chargeRecord')">收费记录</el-button>
          <el-button :type="activeName === 'consultRecord'?'primary':'info'" :plain="activeName !== 'consultRecord'" @click="handleSwitch('consultRecord')">咨询记录</el-button>
        </el-col>
      </el-row>
      <el-row class='tabBody'>
        <el-scrollbar style="height:100%">
          <!-- 患者信息 -->
          <template v-if="activeName === 'patientInfo'">
            <follow-patient ref="followPatient"></follow-patient>
          </template>
          <!-- 就诊记录 -->
          <template v-if="activeName === 'clinicRecord'">
            <history-optree ref="history" :patientId='patientInfos.patientId' :printType="'follow'"></history-optree>
          </template>
          <!-- 收费记录 -->
          <template v-if="activeName === 'chargeRecord'">
            <charges ref="chargesForm" :register-id="patientInfos.registerId"></charges>
          </template>
          <!-- 咨询记录 -->
          <template v-if="activeName === 'consultRecord'">

          </template>
        </el-scrollbar>
      </el-row>

      <div class="publicForm">
        <direct-search ref="form" :label-position="'right'" label-width="100px" :form-style="{'margin-bottom':'5px'}" :forms="followSearchList" @handleSearch="handleFormSearch" :size="'mini'" />
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleNextFollow">下次跟进</el-button>
        <el-button type="primary" @click="handleSaveFollow">完成随访</el-button>
      </span>

    </el-dialog>

  </el-row>
</template>

<script>
import { patientInfo } from '@/api/arclinic'
import { getOrgClinicStaffList } from '@/api/org'
import { getDictById } from '@/api/catalog'
import { saveFollow, getDisagnose } from '@/api/outpatient'

import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'
import followPatient from './followPatient'
import charges from '@/views/patient/detail/components/charges'
import historyOptree from '@/views/patient/detail/components/historyOptree'
import paginationMixin from '@/components/TabComponents/mixin'

import { defaultPickOpts, getBabyAge, formatSex, paramAvatar, param, param2Obj } from '@/utils'

export default {
    components: {
        elTableSelf,
        directSearch,
        followPatient,
        historyOptree,
        charges
    },
    mixins: [paginationMixin],
    data() {
        const doctorList = [
            //   {
            //     value: "",
            //     label: "请选择"
            //   }
        ]
        getOrgClinicStaffList({ pageNo: 1, pageSize: 100, isUse: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.totalRecord > 0) {
                    d.list.forEach(item => {
                        doctorList.push({
                            value: item.userRealName,
                            label: item.userRealName
                        })
                    })
                }
            }
        })
        const dictMap = []
        getDictById({ dictId: 492 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS.records
                if (d && d.length > 0) {
                    d.forEach(item => {
                        dictMap.push({
                            label: item.name,
                            value: item.name
                        })
                    })
                }
            }
        })
        return {
            centerDialogVisible: false,
            activeName: 'patientInfo',
            followSearchList: [
                {
                    type: 'date',
                    label: '随访日期',
                    prop: 'actualFuDate',
                    options: defaultPickOpts,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    style: 'width:150px;margin-right:10px',
                    rules: [{ required: true, message: '随访结果必填', trigger: 'blur' }]
                },
                {
                    type: 'select',
                    label: '随访方式',
                    prop: 'patientTag',
                    opts: dictMap,
                    style: 'width:120px;margin-right:10px'
                },
                {
                    type: 'select',
                    label: '随访人员',
                    prop: 'actualFuUser',
                    opts: doctorList,
                    style: 'width:120px'
                },
                {
                    type: 'input',
                    label: '随访结果',
                    prop: 'actualFuResult',
                    style: 'width:700px',
                    rules: [{ required: true, message: '随访结果必填', trigger: 'blur' }]
                },
                {
                    type: 'tab-select',
                    label: '西医诊断',
                    prop: 'diagnosisList',
                    placeholder: '可搜索查询',
                    style: 'width:700px',
                    rules: [{ required: true, message: '诊断必填', trigger: 'blur' }]
                }
            ],
            patientInfos: {},
            chargeRecordColumns: [
                {
                    label: '病人姓名',
                    value: 'patientName'
                },
                {
                    label: '单据类型',
                    value: 'name'
                },
                {
                    label: '本次费用',
                    value: 'totalAmt'
                },
                {
                    label: '实收金额',
                    value: 'receivedCash'
                },
                {
                    label: '退费金额',
                    value: 'name'
                },
                {
                    label: '支付方式',
                    value: 'chargeTypeName'
                },
                {
                    label: '收费时间',
                    value: 'chargeTime'
                },
                {
                    label: '结账状态',
                    value: 'chargeStatus'
                },
                {
                    label: '来源',
                    value: 'chargeSource'
                }
            ],
            chargeRecordData: [],
            chargeRecordCount: 1,
            patientFollowInfo: {},
            avatar: '',
            patientName: '',
            patientSex: '',
            patientAge: '',
            followData: {},
            registerId: ''
        }
    },
    methods: {
        open(row) {
            this.activeName = 'patientInfo'
            this.centerDialogVisible = true
            this.patientInfos = row
            let diagnosisList = []
            getDisagnose(row.caseId).then(res => {
                if (res.STATUS === '1') {
                    diagnosisList = res.ITEMS
                }
                this.$nextTick(() => {
                    const params = {
                        actualFuDate: row.planFuDate ? row.planFuDate + ' 00:00:00' : '',
                        actualFuUser: this.$store.getters.user.realName,
                        diagnosisList
                    }
                    this.$nextTick(() => {
                        this.$refs.form.initforms(params, 'follow')
                    })
                })
            })

            this.getPatient()
        },
        close() {
            this.centerDialogVisible = false
        },

        // 切换
        handleSwitch(name) {
            this.activeName = name
            if (name === 'patientInfo') {
                this.getPatient()
            } else if (name === 'chargeRecord') {
                this.$nextTick(() => {
                    this.$refs.chargesForm.handleSearch()
                })
            }
        },

        handleFormSearch(form) {
            this.followData = form
        },

        getPatient() {
            patientInfo(this.patientInfos.patientId).then(res => {
                if (res.STATUS === '1') {
                    this.avatar = res.ITEMS.headImg
                        ? this.$store.getters.basic.filePrifix + res.ITEMS.headImg
                        : paramAvatar(res.ITEMS.patient.sex, res.ITEMS.patient.birthDate)
                    res.ITEMS.patient.sex = formatSex(res.ITEMS.patient.sex)
                    res.ITEMS.patient.age = getBabyAge(res.ITEMS.patient.birthDate)
                    this.patientFollowInfo = res.ITEMS
                    this.patientName = this.patientFollowInfo.patient.name
                    this.patientSex = this.patientFollowInfo.patient.sex
                    this.patientAge = this.patientFollowInfo.patient.age
                    this.$refs.followPatient.initInfo(this.patientFollowInfo)
                    this.$store.dispatch('setPatient', {
                        name: res.ITEMS.patient.name || '',
                        sex: res.ITEMS.patient.sex,
                        age: res.ITEMS.patient.age
                    })
                }
            })
        },

        // 下次更近
        handleNextFollow() {
            this.handleSaveFollow(false)
        },

        // 完成随访
        handleSaveFollow(flag = true) {
            this.$refs.form.$refs.form.validate(valid => {
                if (valid) {
                    const data = Object.assign({}, this.patientInfos, this.followData)
                    data.actualFuUserName = data.actualFuUser
                    let diagnosis = ''
                    if (data.diagnosisList && data.diagnosisList.length > 0) {
                        data.diagnosisList.forEach(item => {
                            diagnosis += item.diseaseName + ','
                        })
                    }
                    const params = {
                        actualFuDate: data.actualFuDate,
                        actualFuResult: data.actualFuResult,
                        actualFuUserId: data.actualFuUserId,
                        actualFuUserName: data.actualFuUserName,
                        patientTag: data.patientTag,
                        caseId: data.caseId,
                        registerId: data.registerId,
                        patientId: data.patientId,
                        id: data.id,
                        diagnosis: diagnosis.slice(0, diagnosis.length - 1)
                    }
                    saveFollow(params).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.centerDialogVisible = false
                            this.$emit('saveFollow')
                            if (!flag) {
                                this.centerDialogVisible = false
                                this.$emit('nextFollow')
                            }
                        }
                    })
                }
            })
        }
    },
    mounted() {}
}
</script>

<style lang="scss" scoped>
.chargeDetail {
  .el-dialog__header {
    background: #0097ff;

    .el-dialog__title {
      color: #fff;
      text-align: center;
      display: inline-block;
      width: 100%;
    }
    .el-dialog__headerbtn .el-dialog__close {
      color: #fff;
    }
  }
}

.el-dialog__body {
  .dialogHeader {
    background: #fff;
    border-bottom: 1px solid #ddd;
    padding: 5px 0;
    .el-col-6 {
      img {
        display: block;
        float: left;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        margin: 0 15px 0 30px;
      }
      div {
        float: left;
        p {
          margin-top: 5px;
          span {
            font-size: 12px;
            margin-right: 10px;
          }
        }
      }
    }
    .el-col-18 {
      padding-left: 30px;
      button {
        margin-top: 7px;
      }
    }
  }
}
.tabBody {
  background: #eef7ff;
  padding: 15px 20px;
  width: 100%;
  height: 460px;
}
.publicForm {
  background: #fff;
  width: 100%;
  padding: 10px 30px 0;
}
</style>
<style>
.follow .el-dialog--center .el-dialog__body {
  padding: 0;
}
</style>