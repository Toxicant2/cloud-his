<template>
  <el-row class="page-main">
    <el-row :gutter="20" class="drugDetail" v-loading="loading">
      <el-col :sm="24" :md="4">
        <patient-card :patient="patient" :panel-ellist="patientElList"></patient-card>
      </el-col>
      <el-col :sm="24" :md="20">
        <el-button class="recipePrint" type="primary" @click="handleRecipeList" v-if="type === '0' || type === '1'">处方打印</el-button>
        <div class='title'>
          <span>{{`${type !== 'applyRefund' || type !== 'isApplyRefund'?'发药':'退药'}`}}</span>
          <el-row class='infos'>
            <el-col :span="8">开单医生：{{doctorName}}</el-col>
            <el-col :span="8">开单时间：{{time}}</el-col>
            <el-col :span="8">所属诊室：{{deptName}}</el-col>
          </el-row>
          <div class='note'>过敏史：
            <p v-if="noteList && noteList.length > 0">
              <small v-for="(item,index) in noteList" :key="index">{{item.allergyName}}
                <small v-if="item.reactionName && item.degreeName">( {{item.reactionName}} {{item.degreeName}} )</small> ；</small>
            </p>
            <p v-else> 否认</p>

          </div>
        </div>
        <el-table-self :tableData="tableData" :columns="columns" :tab-type="isSelection" ref="multipleTable" @blurCell="changeNum" type="number" @selectChange="handleSelectChange" :selecTable="handleSelecTable" @selectAll="handleSelectAll"></el-table-self>
        <diagnosis-form ref="diagnosis" :countLine='12' width='800px' :title="'个人信息完善'" :form-data="diagnosisFormData" :form-edit="patient" @handleConfirm="handleConfirm" />

        <div class='counts'>
          <el-button @click="back">返回</el-button>
          <template v-if="type == 0">
            <el-button type="primary" @click="printPrescription">打印</el-button>
            <el-button type="primary" @click='sendDispens'>发药</el-button>
          </template>
          <template v-if="type == 1">
            <el-button type="primary" @click="printPrescription">打印</el-button>
          </template>
          <template v-if="type==='applyRefund'">
            <el-button type="primary" @click="printPrescription">打印</el-button>
            <el-button type="primary" @click="refundDispens">确认退药</el-button>
          </template>
          <template v-if="type==='isApplyRefund'">
            <el-button type="primary" @click="printPrescription">打印</el-button>
            <el-button type="primary" @click="applyRefundDispens">申请退药</el-button>
          </template>
        </div>

        <div v-show="showPrint" class="printPrescription" id="printPrescription">
          <div class="top-content">
            <h2>{{tableData[0].orgName}}</h2>
            <div>发药单</div>
            <div class="patient-name">姓名：{{patient.name}}</div>
          </div>
          <div class="prescription-info">
            <div class="prescription-item" v-for="(item,index) in tableData" :key="index">
              <div>{{item.catName}}&nbsp;&nbsp;&nbsp;{{item.spec}}&nbsp;&nbsp;&nbsp;{{item.qty}}{{item.unit}}</div>
              <div>用法：{{item.usage}}&nbsp;&nbsp;&nbsp;{{item.dosage}}&nbsp;&nbsp;&nbsp;{{item.frequency}}</div>
            </div>
          </div>
          <div class="prescription-time">{{tableData[0].createTime}}</div>
        </div>
      </el-col>
    </el-row>

    <el-dialog center title="处方列表" :visible.sync="visible" :width="'1000'" class="drugDetail">
      <el-tabs v-model="activeName2" type="card" @tab-click="handleClick">
        <el-tab-pane :label="item.name" :name="item.name" v-for="(item,index) in recipeList" :key="index">
          <el-table-self :tableData="recipeDetail.detailList" :columns="recipeDetail.chara === '10'?westernColumns:recipeDetail.chara === '20'?medicalColumns:westernColumns" ref="multipleTable"></el-table-self>
        </el-tab-pane>
      </el-tabs>
      <el-button type="primary" style="margin-top:20px;float:right" @click="handleRecipePrint">打印</el-button>
    </el-dialog>
  </el-row>
</template>

<script>
import { patientInfo, getPatientByRegId } from '@/api/arclinic'
import { getPatientInfo, savePatientInfo, getRecipeDetail } from '@/api/outpatient'
import { dispensDetail, sendDispens, refundDispens } from '@/api/pharmacy'

import diagnosisForm from '@/components/DialogComponents/Form'
import patientCard from '@/components/Panel/PatientCard'
import tabTable from '@/components/TabComponents/index'
import elTableSelf from '@/components/TabComponents/index'

import { mapGetters } from 'vuex'
import { paramAvatar, getBabyAge, formatSex, disabledPickerOpts, formatDictMap } from '@/utils'
import count from '../mixin/count'
import print from '../mixin/print'
export default {
  components: {
    patientCard,
    tabTable,
    diagnosisForm,
    elTableSelf
  },
  data() {
    return {
      loading: false,
      visible: false,
      type: -1, // 0 表示待发药 1 表示已发药
      showPrint: false,
      disabledPickerOpts,
      // 个人信息
      patient: {
        name: '',
        phone: '',
        avatar: '',
        sex: '',
        age: '',
        height: '',
        weight: '',
        bmi: '',
        bodyTemperature: '',
        bodyTpositionName: '',
        respirationRate: '',
        pulse: '',
        bloodPressure: '',
        firstDiagnosis: '',
        note: '',
        address3level: [],
        address: ''
      },
      doctorName: '',
      time: '',
      id: '',
      patientId: '',
      bloodOpts: [],
      registerId: '',
      caseId: '',
      formData: null,
      deptName: '',
      noteList: [],
      // 个人信息模板
      patientElList: {
        // btnList: [
        //     {
        //         name: '历史病例'
        //     }, {
        //         name: '完善信息',
        //         func: this.perfectInformation
        //     }
        // ],
        liList: [
          {
            name: '电话',
            value: 'phone'
          },
          {
            name: '性别',
            value: 'sex'
          },
          {
            name: '年龄',
            value: 'age'
          },
          {
            name: '身高',
            value: 'height',
            unit: 'cm',
            func: this.heightChange
          },
          {
            name: '体重',
            value: 'weight',
            unit: 'kg',
            func: this.weightChange
          },
          {
            name: 'BMI指数',
            value: 'bmi'
          },
          {
            name: '体温',
            value: 'bodyTemperature',
            unit: '°C'
          },
          {
            name: '呼吸',
            value: 'respirationRate',
            unit: '次/分'
          },
          {
            name: '心率',
            value: 'pulse',
            unit: '次/分'
          },
          {
            name: '血压',
            value: 'bloodPressure',
            unit: 'mmHg'
          }
        ]
      },
      tableData: [
        {
          drugsName: '紫叶苏',
          Manufacturer: '',
          dose: '1g',
          unitUsage: '后下',
          unitPrice: '0.5元',
          total: '1g',
          state: '未发药',
          source: '本院',
          spanStyle: 'display:none',
          lotNumber: '1'
        }
      ],
      columns: [
        {
          value: 'catName',
          label: '药品名称',
          align: 'center'
        },
        {
          value: 'manufacturerName',
          label: '生产厂商',
          width: 220,
          align: 'center'
        },
        {
          value: 'spec',
          label: '规格',
          align: 'center'
        },
        {
          value: 'batchNum',
          label: '批号',
          width: 120,
          align: 'center'
        },
        {
          value: 'validDate',
          label: '效期',
          align: 'center'
        },
        {
          value: 'dosage',
          label: '（次）剂量',
          align: 'center'
        },
        {
          value: 'usage',
          label: '用法',
          align: 'center'
        },
        {
          value: 'frequency',
          label: '频率',
          align: 'center'
        },
        {
          value: 'unit',
          label: '单位',
          width: 80,
          align: 'center'
        },
        {
          value: 'price',
          label: '单价',
          width: 80,
          align: 'center'
        },
        {
          value: 'qty',
          label: '总量',
          width: 80,
          align: 'center'
        },
        {
          value: 'returnQty',
          label: '申请退药数量',
          width: 100,
          align: 'center',
          formatter(row) {
            return row.returnQty || 0
          },
          isHidden: this.$route.params.type !== 'applyRefund'
        },
        {
          value: 'refundNum',
          label: '退药数量',
          align: 'center',
          operType: 'input',
          type: 'refund',
          disabled: false,
          isHidden: this.$route.params.type !== 'isApplyRefund'
        }
      ],
      diagnosisFormData: [
        // 个人信息完善
        {
          type: 'input',
          name: '体重(kg)',
          field: 'weight',
          rules: [
            {
              pattern: /^(([1-9]{1}|[1-9]{1}\d|1\d{2})(\.\d{1,2})?|200)$/,
              message: '1到200为有效数字，最多可保留2位小数',
              trigger: 'blur'
            }
          ],
          func: this.weightChange
        },
        {
          type: 'input',
          name: '身高(cm)',
          field: 'height',
          rules: [
            {
              pattern: /^((3\d{1}|[4-9]\d{1}|[1-2]\d{2})(\.\d{1,2})?|300)$/,
              message: '30到300为有效数字，最多可保留2位小数',
              trigger: 'blur'
            }
          ],
          func: this.heightChange
        },
        {
          type: 'input',
          name: 'BMI指数',
          disabled: true,
          field: 'bmi'
        },
        {
          type: 'select',
          name: '血型',
          field: 'booldType',
          opts: [],
          spanCount: 8,
          placeholder: 'ABO血型'
        },
        {
          type: 'select',
          field: 'booldTypeRh',
          opts: [],
          spanCount: 4,
          class: 'boold',
          placeholder: 'RH血型'
        },
        {
          type: 'select-input',
          name: '体温（℃）',
          field1: 'bodyTpositionName',
          field2: 'bodyTemperature',
          opts: [],
          style: { height: '33px' }
        },
        {
          type: 'background-input',
          name: '呼吸（次/分钟）',
          rules: [
            {
              pattern: /^(0|[1-9]{1}|[1-8]\d{1}|90)$/,
              message: '0到90为有效数字',
              trigger: 'blur'
            }
          ],
          up: 50,
          down: 12,
          field: 'respirationRate'
        },
        {
          type: 'input',
          name: '心率（次/分钟）',
          rules: [
            {
              pattern: /^([3][6-9]{1}|[4-9]\d{1}|([1]([0-4][0-9]{1}|[5][0]{1})))$/,
              message: '36到150为有效数字',
              trigger: 'blur'
            }
          ],
          field: 'pulse'
        },
        {
          type: 'input-input',
          name: '血压（mmHg）',
          field1: 'sbp',
          field2: 'dbp'
        }
      ],
      patientInfo: {},
      recipeList: [],
      activeName2: '',
      recipeDetail: {},
      westernColumns: [
        {
          value: 'itemName',
          label: '药品名称',
          width: '200px'
        },
        {
          value: 'spec',
          label: '规格'
        },
        {
          value: 'usage',
          label: '用法'
        },
        {
          value: 'frequency',
          label: '频率'
        },
        {
          value: 'days',
          label: '天数'
        },
        {
          value: 'qty',
          label: '总量'
        }
      ],
      medicalColumns: [
        {
          value: 'itemName',
          label: '药品名称',
          width: '200px'
        },
        {
          value: 'dosage',
          label: '剂量'
        },
        {
          value: 'dosageUnit',
          label: '单位'
        },
        {
          value: 'note',
          label: '特殊要求'
        }
      ],
      opCase: {},
      activeName: '',
      dispensData: {}
    }
  },
  computed: {
    ...mapGetters(['basic', 'dictData', 'user']),
    isSelection() {
      return this.type === 'isApplyRefund' ? 'selection' : ''
    }
  },
  mixins: [count, print],
  methods: {
    // 返回
    back() {
      this.$router.push({
        name: 'dispens'
      })
    },

    printPrescription() {
      const Print = document.getElementById('printPrescription')
      const newContent = Print.innerHTML
      const oldContent = document.body.innerHTML
      this.showPrint = true
      document.body.innerHTML = newContent

      window.print()
      window.location.reload()
      document.body.innerHTML = oldContent
      return false
    },
    // 初始化下拉框方法
    initSelect() {
      // 体温
      this.diagnosisFormData[5].opts = this.dictData['142']
      // 血型下拉框选项
      this.diagnosisFormData[3].opts = this.dictData['60']
      this.diagnosisFormData[4].opts = this.dictData['125']
    },
    // 获取患者基本信息
    getPatientInfo() {
      if (this.patientId !== '0' && this.patientId !== null && this.patientId !== 0) {
        patientInfo(this.patientId).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS.patient
            if (d) {
              this.patient.avatar = d.headImg
                ? this.basic.filePrifix + d.headImg
                : paramAvatar(d.sex, d.birthDate)
              this.patient.name = d.name ? d.name : ''
              this.patient.phone = d.phone ? d.phone : ''
              this.patient.sex = d.sex ? formatSex(d.sex) : ''
              this.patient.age = d.birthDate ? getBabyAge(d.birthDate) : ''
            } else {
              this.patient.avatar = paramAvatar('', '')
            }
          }
        })
        const data = { patientId: this.patientId, registerId: this.registerId, detailFlag: 1 }
        getPatientInfo(data).then(res => {
          if (res.STATUS === '1') {
            const data = res.ITEMS
            const d = data.opCase
            this.opCase = data
            const routerData = JSON.parse(this.$route.params.data)
            if (d) {
              var str1 = d.sbp ? d.sbp : ''
              var str2 = d.dbp ? d.dbp : ''
              this.caseId = d.id ? d.id : 0
              this.patient.height = d.height ? d.height : ''
              this.patient.weight = d.weight ? d.weight : ''
              this.patient.bmi = d.bmi ? d.bmi : ''
              this.patient.pulse = d.pulse ? d.pulse : ''
              this.patient.booldType = d.booldType ? d.booldType : ''
              this.patient.booldTypeRh = d.booldTypeRh ? d.booldTypeRh : ''
              this.patient.respirationRate = d.respirationRate ? d.respirationRate : ''
              this.patient.bodyTemperature = d.bodyTemperature ? d.bodyTemperature : ''
              this.patient.bodyTpositionName = d.bodyTpositionName ? d.bodyTpositionName : ''
              if (str1 || str2) {
                this.patient.bloodPressure = str1 + '/' + str2
              } else {
                this.patient.bloodPressure = ''
              }
              this.deptName = d && d.deptName ? d.deptName : '*'
              this.doctorName = d && d.doctorName ? d.doctorName : '*'

              this.noteList = res.ITEMS.allergytList ? res.ITEMS.allergytList : []
              if (this.patient.bodyTpositionName) {
                this.patientElList.liList[6].name = this.patient.bodyTpositionName
              }
            } else {
              this.deptName = routerData && routerData.depName ? routerData.depName : '*'
              this.doctorName =
                routerData && routerData.createUserName ? routerData.createUserName : '*'
              // this.time = d && d.createTime ? d.createTime : '*'
            }
            this.time =
              routerData && routerData.prescribingTime
                ? routerData.prescribingTime.split('.')[0]
                : '*'
          }
        })
      } else {
        this.patient.avatar = paramAvatar('', '')
        this.patient.name = '快速收费'
        this.patient.phone = '-'
        this.patient.sex = '-'
        this.patient.age = '-'
      }

      const params = { id: this.id }
      this.loading = true
      dispensDetail(params).then(res => {
        this.loading = false
        const d = res.ITEMS
        if (d) {
          if (d.length > 0) {
            d.forEach(item => {
              item.refundNum = 0
              const list = this.dictData[144].concat(this.dictData[152])
              list.forEach(element => {
                if (item.usage === 'null') {
                  item.usage = ''
                }
                if (item.usage === element.value) {
                  item.usage = element.label
                }
              })
              item.validDate = item.validDate.split(' ')[0]
              this.dictData[145].forEach(element => {
                if (item.frequency === element.value) {
                  item.frequency = element.label
                }
              })
              if (item.dosage && item.dosageUnit) {
                item.dosage = item.dosage + item.dosageUnit
              }
            })
          }
          this.tableData = d
        }
      })
    },
    weightChange(value) {
      this.weight = value
      this.$refs.diagnosis.initFields({
        bmi: this.formatterBMI(value, this.height)
      })
    },
    heightChange(value) {
      this.height = value
      this.$refs.diagnosis.initFields({
        bmi: this.formatterBMI(this.weight, value)
      })
    },
    formatterBMI(w, h) {
      if (!w || !h) return ''
      return (Number(w) / Math.pow(Number(h) / 100, 2)).toFixed(2)
    },
    // 打开完善信息窗口
    perfectInformation() {
      this.initSelect() // 初始化下拉框

      if (this.patient.bloodPressure) {
        this.patient.sbp = this.patient.bloodPressure.split('/')[0]
        this.patient.dbp = this.patient.bloodPressure.split('/')[1]
      }
      this.$refs.diagnosis.open() // 打开完善信息弹窗
    },

    handleConfirm(form) {
      let flag = true
      form.patientId = this.patientId
      form.registerId = this.registerId
      form.caseId = this.caseId
      // 体温
      if (form.bodyTpositionName && form.bodyTpositionName.value) {
        form.bodyTpositionCode = form.bodyTpositionName.value
        form.bodyTpositionName = form.bodyTpositionName.label
      }
      const tp = form.bodyTemperature
      if (tp) {
        if (!form.bodyTpositionName) {
          this.$message.warning('请选择体温类型')
          flag = false
        }
        const reg = /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/
        // if (tp < 35 || tp > 42) {
        //     this.$message.error('体温有效范围为35-42')
        //     form.bodyTemperature = ''
        //     return false
        // }
        if (!reg.test(tp)) {
          this.$message.error('体温有效范围为35.0-42.9')
          form.bodyTemperature = ''
          return false
        }
      }

      const regList = [
        {
          value: 'bodyTemperature',
          reg: /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/,
          message: '体温有效范围为35.0-42.9'
        },
        {
          value: 'respirationRate',
          reg: /^(0|[1-9]{1}|[1-8]\d{1}|90)$/,
          message: '呼吸有效范围为0-90'
        },
        {
          value: 'pulse',
          reg: /^(3[6-9]{1}|[4-9]\d{1}|(1([0-4]{1}\d|50)))$/,
          message: '心率有效范围为36-150'
        },
        {
          value: 'sbp',
          reg: /^([1-9]\d{0,1}|[1,2]\d{2}|3[0-4]{1}\d|350)$/,
          message: '收缩压有效范围为1-350'
        },
        {
          value: 'dbp',
          reg: /^([1-9]\d{0,1}|[1,2]\d{2}|300)$/,
          message: '舒张压有效范围为1-300'
        }
      ]
      regList.forEach((item, index) => {
        if (index > 0) {
          if (form[item.value] && !item.reg.test(form[item.value])) {
            this.$message.error(item.message)
            form[item.value] = ''
            flag = false
            return false
          }
        }
      })
      if (flag) {
        savePatientInfo(form).then(res => {
          if (res.STATUS === '1') {
            this.$message({
              message: '保存成功',
              type: 'success'
            })
            this.getPatientInfo()
            this.$refs.diagnosis.close()
          }
        })
      }
    },

    // 确认发药
    sendDispens() {
      const data = { id: this.id }
      sendDispens(data).then(res => {
        if (res.STATUS === '1') {
          this.$message.success('发药成功！')
          this.$router.push({ name: 'dispens' })
        }
      })
    },

    // 申请退药   确认退药
    refundDispens() {
      const detailList = []
      if (this.tableData && this.tableData.length > 0) {
        this.tableData.forEach(item => {
          detailList.push({
            count: item.returnQty,
            detailId: item.id
          })
        })
        const data = {
          deliveryId: this.tableData[0].deliveryId,
          detailList
        }
        refundDispens(data).then(res => {
          if (res.STATUS === '1') {
            this.$message.success(res.MESSAGE)
            this.$router.push({ name: 'dispens' })
          }
        })
      }
    },
    // 申请退药
    applyRefundDispens() {
      if (this.tableData && this.tableData.length > 0) {
        const detailList = []
        this.tableData.forEach(item => {
          detailList.push({
            count: item.refundNum,
            detailId: item.id
          })
        })
        const data = {
          deliveryId: this.tableData[0].deliveryId,
          detailList
        }
        refundDispens(data).then(res => {
          if (res.STATUS === '1') {
            this.$message.success('申请成功')
            this.$router.push({ name: 'dispens' })
          }
        })
      } else {
        this.$message.warning('请先选择药品')
      }
    },

    // 处方打印
    handleRecipeList() {
      const tableData = this.tableData
      this.recipeList = []
      const map = {}
      if (this.opCase.opCase) {
        getPatientByRegId(this.registerId).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS
            this.opCase.opCase.outpatientNum = d.outpatientNum
            this.opCase.opCase.outpatientType = d.outpatientType
          }
        })
        if (tableData && tableData.length > 0) {
          let num = 0
          tableData.forEach((item, index) => {
            if (item.recipeChara === '10' || item.recipeChara === '20') {
              if (!map[item.recipeId]) {
                num++
                this.recipeList.push({
                  id: item.recipeId,
                  name: `处方${num}`
                })
                map[item.recipeId] = item
              }
            }
          })
        }
        if (this.recipeList && this.recipeList.length > 0) {
          this.activeName2 = this.recipeList[0].name
          if (this.recipeList[0].id) {
            this.handleSearchRecipeDetail(this.recipeList[0].id)
          }
          this.$nextTick(() => {
            this.visible = true
          })
        } else {
          this.$message.warning('空处方')
        }
      } else {
        this.$message.warning('空病历')
      }
    },

    // 根据处方id查询处方信息
    handleSearchRecipeDetail(id) {
      const dictMap = this.dictData
      getRecipeDetail(id).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS
          const detailList = []
          if (d.detailList && d.detailList.length > 0) {
            d.detailList.forEach(detail => {
              detailList.push({
                amt: detail.amt,
                itemName: detail.itemName,
                spec: detail.spec,
                unit: detail.unit,
                usage: formatDictMap(dictMap[d.recipe.chara === '10' ? 144 : 152], detail.usage),
                frequency: formatDictMap(dictMap[145], detail.frequency),
                days: detail.days,
                qty: detail.qty,
                dosage: detail.dosage,
                dosageUnit: detail.dosageUnit,
                dose: detail.dose,
                doseUnit: formatDictMap(dictMap[483], detail.doseUnit),
                note: detail.note,
                itemType: detail.itemType,
                medicineType: detail.medicineType,
                // recipeClass: recipe.recipeClass, // 处方类型
                medicineNote:
                  d.recipe.chara === '20'
                    ? `${formatDictMap(dictMap[152], detail.usage)}，${formatDictMap(
                        dictMap[145],
                        detail.frequency
                      )}，
                                            每次${detail.dose || ''}${formatDictMap(
                        dictMap[483],
                        detail.doseUnit
                      )}，共${detail.days}剂`
                    : ''
              })
            })
          }
          this.recipeDetail = {
            chara: d.recipe.chara,
            detailList: detailList,
            recipeClass: d.recipe.recipeClass
          }
          this.activeName = this.recipeDetail.chara
        }
      })
    },

    handleClick(tab) {
      if (this.recipeList[tab.index].id) {
        this.handleSearchRecipeDetail(this.recipeList[tab.index].id)
      }
    },

    // 打印处方
    handleRecipePrint() {
      this.handlePrint()
    }
  },
  mounted() {
    this.id = this.$route.params.id
    this.patientId = this.$route.params.patientId
    this.registerId = this.$route.params.registerId
    this.type = this.$route.params.type
    this.getPatientInfo()
  }
}
</script>

<style scoped lang='scss'>
.title {
  border-bottom: 1px solid #e1e1e1;
  padding-bottom: 20px;
  margin-bottom: 20px;
  span {
    font-size: 18px;
    font-weight: bold;
    height: 50px;
    line-height: 50px;
  }
  .infos {
    font-size: 14px;
  }
  .note {
    padding: 8px 10px;
    font-size: 15px;
    border: 1px solid #6bc3ff;
    margin-top: 15px;
    color: #333;
    line-height: 24px;
    small {
      font-size: 15px;
      color: #333;
    }
    p {
      display: inline-block;
    }
  }
}
.recipePrint {
  position: absolute;
  right: 20px;
  top: 20px;
}
.counts {
  text-align: right;
  margin-top: 20px;
}
.patientInfo {
  border: 1px solid #6bc3ff;
  padding: 10px 20px;
  p {
    font-size: 18px;
    color: #000;
    font-weight: bold;
  }
  .el-row {
    margin-top: 5px;
    font-size: 15px;
    div {
      margin-top: 10px;
    }
  }
}
.prescription {
  margin-top: 20px;
  .small_title {
    font-size: 15px;
    color: #000;
    margin-bottom: 15px;
    span:nth-of-type(1) {
      color: #0099ff;
      margin-right: 10px;
    }
    span:nth-of-type(2) {
      color: #ff6600;
      margin-left: 20px;
    }
  }
  .cf_summary {
    border-left: 1px solid #ebeef5;
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
    p {
      padding: 20px 40px 20px 15px;
      font-size: 14px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
    }
    .counts {
      padding: 8px 15px;
      font-size: 14px;
      .el-col {
        margin-top: 13px;
      }
      .el-col:nth-of-type(3) {
        margin-top: 0;
        text-align: right;
      }
      button {
        background: #0097ff;
        color: #fff;
        border-color: #0097ff;
      }
    }
  }
}
.el-table-self {
  margin: 0 !important;
}
</style>
<style>
.drugDetail .el-form-item__label {
  width: 125px !important;
}
.drugDetail .el-input-group__prepend div.el-select .el-input__inner {
  padding-left: 55px !important;
}
.drugDetail .el-form-item__content {
  margin-left: 130px !important;
}
@media print {
  body {
    width: 6.5cm;
    padding: 20px;
    line-height: 16px;
    font-size: 12px;
  }
  .top-content div,
  .top-content h2 {
    text-align: center;
    margin-bottom: 10px;
    font-size: 14px;
  }
  .top-content h2 {
    font-size: 16px;
  }
  .top-content .patient-name {
    font-size: 12px;
    text-align: left;
  }
  .prescription-info {
    border-bottom: 1px solid #000;
    border-top: 1px solid #000;
    font-size: 12px;
    padding: 15px 0 5px 0;
  }
  .prescription-item {
    padding-bottom: 10px;
  }
  .prescription-item div {
    padding: 5px 0;
  }

  .prescription-time {
    padding-top: 10px;
    text-align: right;
  }
}
.drugDetail .el-dialog--center .el-dialog__body {
  overflow: hidden;
}
</style>



