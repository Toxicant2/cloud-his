<template>
    <div v-if="tabType === '门诊病历'" class="medicalRecord">
        <patient-detail :describe-list="describeList" :describe-data="describeData" />
    </div>
</template>
<script>
import { getNurseStationMedicalRecordDetail } from '@/api/outpatient'
import patientDetail from '../components/patientDetail'
import { remove_ie_header_and_footer } from '@/utils/print'
import { getBabyAge, formatSex } from '@/utils'

export default {
  components: {
    patientDetail
  },
  props: {
    tabType: {
      type: String
    },
    id: {
      default: ''
    }
  },
  data() {
    return {
      describeList: [
        {
          label: '姓名',
          value: 'name',
          span: 3
        },
        {
          label: '性别',
          value: 'sex',
          span: 3
        },
        {
          label: '年龄',
          value: 'ageYear',
          span: 3
        },
        {
          label: '西医诊断',
          value: 'diagnose',
          span: 8
        },
        {
          label: '过敏史',
          value: 'isAllergies',
          span: 7
        },
        {
          label: '主诉',
          value: 'chiefCompliant',
          span: 24
        },
        {
          label: '现病史',
          value: 'presentIllness',
          span: 24
        },
        {
          label: '既往史',
          value: 'pastHistory',
          span: 24
        },
        {
          label: '手术史',
          value: 'operation',
          span: 24
        },
        {
          label: '输血史',
          value: 'blood',
          span: 24
        },
        {
          label: '出生史',
          value: 'birth',
          span: 24
        },
        {
          label: '喂养史',
          value: 'feed',
          span: 24
        },
        {
          label: '个人史',
          value: 'personalHistory',
          span: 24
        },
        {
          label: '家族史',
          value: 'familyHistory',
          span: 24
        },
        {
          label: '预防接种史',
          value: 'isPlanInoculate',
          span: 24
        },
        {
          label: '过敏史',
          value: 'isAllergies',
          span: 24
        },
        {
          label: '其他体格检查',
          value: 'otherBodyExam',
          span: 24
        },
        {
          label: '辅助检查结果',
          value: 'assistantExamResult',
          span: 24
        },
        {
          label: '西医诊断',
          value: 'diagnose',
          // type: 'tabline',
          span: 24
        },
        {
          label: '中医诊断',
          value: 'tcmDiagnosis',
          // type: 'tabline',
          span: 24
        },
        {
          label: '中医辨证',
          value: 'chinsesMedicineDialectical',
          span: 24
        },
        {
          label: '诊疗意见',
          value: 'treatPlan',
          span: 24
        }
      ],
      describeData: {}
    }
  },
    watch: {
        id: function(val, oldVal) {
            // if (val) {
            //     this.getPatientDetail(val) // 基本信息
            // }
        }
    },
    filters: {
        isEmpty(val) {
            return val || '-'
        }
    },
    methods: {
    // 查询患者基本详情
        getPatientDetail(id) {
            getNurseStationMedicalRecordDetail(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    // // 姓名、性别、年龄
                    const temp_obj = {}
                    temp_obj.name = d.orgOutpRegisterDTO ? d.orgOutpRegisterDTO.name : ''
                    temp_obj.sex = formatSex(d.orgOutpRegisterDTO.sex)
                    temp_obj.ageYear = getBabyAge(d.orgOutpRegisterDTO.birthDate.split(' ')[0])
                    const objInfo = Object.assign({}, d.orgOutpRegisterDTO, d.opDrCaseDTO, temp_obj)
                    if (d.allergyDTOList) {
                        // 处理过敏信息
                        let allergyStr = ''
                        if (d.allergyDTOList.length > 0) {
                            d.allergyDTOList.forEach(item => {
                                allergyStr += item.allergyName + ','
                            })
                            allergyStr = allergyStr.substring(0, allergyStr.length - 1)
                        } else {
                            allergyStr = '无'
                        }
                        objInfo.isAllergies = allergyStr

                        // 处理诊断
                        const newDiagnose = []
                        const diagnosisList = []
                        const tcmDiagnosisList = []
                        let diagnosis = ''
                        let tcmDiagnosis = ''
                        if (d.opDrCaseDiagnosisDTOList.length > 0) {
                            d.opDrCaseDiagnosisDTOList.forEach(item => {
                                if (item.diagnosisType !== '中医诊断') {
                                    diagnosisList.push(item)
                                } else {
                                    tcmDiagnosisList.push(item)
                                }
                                // const str = `${item.diseaseName}`
                                // newDiagnose.push(str)
                                // objInfo.diagnose = newDiagnose
                            })
                        } else {
                            objInfo.diagnose = ''
                        }

                        if (diagnosisList.length > 0) {
                            diagnosisList.forEach((item, index) => {
                                diagnosis += `${index + 1}、${item.diseaseName} `
                            })
                        }
                        if (tcmDiagnosisList.length > 0) {
                            tcmDiagnosisList.forEach((item, index) => {
                                tcmDiagnosis += `${index + 1}、${item.diseaseName} `
                            })
                        }
                        objInfo.diagnose = diagnosis
                        objInfo.tcmDiagnosis = tcmDiagnosis
                        // // 预防接种史
                        objInfo.isPlanInoculate = objInfo.isPlanInoculate ? '有' : '无'
                        this.describeData = objInfo
                    } else {
                        this.describeData = {}
                    }
                }
            })
        },
        print() {
            if (this.describeData.name) {
                // 是否ie
                if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    remove_ie_header_and_footer()
                }
                const form = this.describeData
                let mainStr = ''

                const describeList = [
                    {
                        label: '主诉',
                        value: 'chiefCompliant'
                    },
                    {
                        label: '现病史',
                        value: 'presentIllness'
                    },
                    {
                        label: '既往史',
                        value: 'pastHistory'
                    },
                    {
                        label: '手术史',
                        value: 'operation'
                    },
                    {
                        label: '输血史',
                        value: 'blood'
                    },
                    {
                        label: '出生史',
                        value: 'birth'
                    },
                    {
                        label: '喂养史',
                        value: 'feed'
                    },
                    {
                        label: '个人史',
                        value: 'personalHistory'
                    },
                    {
                        label: '家族史',
                        value: 'familyHistory'
                    },
                    {
                        label: '预防接种史',
                        value: 'isPlanInoculate'
                    },
                    {
                        label: '过敏史',
                        value: 'isAllergies'
                    },
                    {
                        label: '其他体格检查',
                        value: 'otherBodyExam'
                    },
                    {
                        label: '辅助检查结果',
                        value: 'assistantExamResult'
                    },
                    {
                        label: '西医诊断',
                        value: 'diagnose',
                        type: 'tabline'
                    },
                    {
                        label: '中医诊断',
                        value: 'tcmDiagnosis',
                        type: 'tabline'
                    },
                    {
                        label: '诊疗意见',
                        value: 'treatPlan'
                    }
                ]
                describeList.forEach(item => {
                    let temp = ''
                    if (item.isCode && form[item.value]) {
                        temp = `<code class="content"> ${form[item.value] || ''}</code>`
                    } else {
                        temp = `<span class="content"> ${item.content || form[item.value] || ''}</span>`
                    }
                    if (item.isJudge) {
                        if (form[item.value]) {
                            mainStr += `
                                    <div class="item">
                                        <span class="label">${item.label}：</span>${temp}
                                    </div>
                                `
                        }
                    } else {
                        mainStr += `
                                <div class="item">
                                    <span class="label">${item.label}：</span>${temp}
                                </div>
                            `
                    }
                })

                const content = `
                        <div class="print outpatient">
                            <div class="page">
                                <h1>诊疗记录</h1>
                                <div class="header">
                                    <div>
                                        <span class="w50">${form.name || ''}&ensp;${form.sex ||
          ''}</span>
                                        <span class="w24">年龄：${form.ageYear || ''}</span>
                                    </div>
                                    <div>
                                        <span class="w50">医生：${form.doctorName || ''}</span>
                                    </div>
                                </div>
                                <div class="main">
                                    <div class="basic">
                                        <span>是否初诊：${
    form.isFirstClinic === 1 ? '是' : '否'
}</span>
                                        <span>发病时间：${
    form.morbidity ? form.morbidity.split(' ')[0] : ''
}</span>
                                    </div>
                                    ${mainStr || ''}
                                </div>
                                <div class="footer">
                                    <ul>
                                        <li>
                                            <span>看诊医生（签名）</span>
                                            <span class="line"></span>
                                        </li>
                                        <li>
                                            <span>离院日期：${form.clinicCompletedTime || ''}</span>
                                            <span>离院去向：${form.whereabouts || ''}</span>
                                        </li>
                                        <li>
                                            <span>家长（签名）</span>
                                            <span class="line"></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `
                var style = `
                    <style type='text/css'>
                        body{
                            width:100% !important;
                        }
                    </style>`
                const oldContent = document.body.innerHTML
                document.body.innerHTML = content + style

                window.print()
                window.location.reload()
                document.body.innerHTML = oldContent
                return false
            } else {
                this.describeData = {}
                this.$message.warning('暂无相关信息可打印！')
            }
        }
    }
}
</script>

<style scoped>
.medicalRecord {
  font-size: 14px;
}
.content {
  padding-top: 10px;
  padding-left: 40px;
}
.item-content {
  line-height: 30px;
}
</style>
