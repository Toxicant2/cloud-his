<template>
    <div v-loading="loading" class="medical-record">
        <!-- 通用转诊 -->
        <el-collapse v-model="activeNames">
            <el-collapse-item v-for="(item,index) in collapseList" :key="index" :title="item.title" :name="item.name">
                <!-- 转诊信息 -->
                <transfer-info v-if="item.title === '转诊信息'" ref="transfer" :cache-program1="cacheProgram" :transfer-info="transferInfo" :disabled="disabled" @handleConfirm="handleConfirmTransfer"/>

                <!-- 基本信息 -->
                <patient-info v-else-if="item.title === '基本信息'" ref="patientRequire" :patient-info="patientInfo" :disabled="disabled" @handleConfirm="handleConfirmPatient"/>

                <!-- 病历信息 -->
                <template v-else-if="item.title === '病历信息'">
                    <el-button size="small" style="margin-bottom:15px;" :disabled="disabled" @click="handleLeadin">导入历史病历</el-button>
                    <outpatient-form ref="outpatient" :forms="outpatientData" :patient="patient" :label-width="'120px'" :is-show="false" :disabled="disabled" @handleConfirm="handleConfirmCase"/>
                </template>

                <!-- 西药处方 -->
                <western-medicine v-else-if="item.title === '处置'" ref="westernMedicine" :dict-map="dictMap" :disabled="disabled"/>

                <!-- 检查 -->
                <inspection v-else-if="item.title === '检查'" ref="inspection" :disabled="disabled"/>

                <!-- 检验 -->
                <examine v-else-if="item.title === '检验'" ref="examine" :flag="flag" :disabled="disabled"/>

                <!-- 费用 -->
                <cost v-else-if="item.title === '费用'" ref="cost" :disabled="disabled"/>
            </el-collapse-item>
        </el-collapse>
        <!-- 上传 -->
        <upload ref="upload" :patient="patient" :disabled="disabled"/>

        <!-- 导入历史病历 -->
        <el-dialog :visible.sync="historyDialogVisible" title="历史病历">
            <el-table-self :table-data="historyCase" :columns="historyColumns" @cellClick="handleClick"/>
        </el-dialog>
    </div>
</template>

<script>
import { getOrganizationInfo, getTransferInfo } from '@/api/api'
import { getOpdrrecipeListMix, getOpHistory, getOpDetail } from '@/api/outpatient'
import { getChargeList } from '@/api/charge'

// 患者信息
import patientInfo from './medicalRecord/patientInfo'
// 转诊信息
import transferInfo from './medicalRecord/transferInfo'
// // 病历信息
// import diagnosisInfo from "./medicalRecord/diagnosis";
import outpatientForm from '../components/outpatient'
// // 西药处方
import WesternMedicine from './medicalRecord/WesternMedicine'
// // 检查
import inspection from './medicalRecord/inspection'
// // 检验
import examine from './medicalRecord/examine'
// // 费用
import cost from './medicalRecord/cost'

// 上传
import upload from './medicalRecord/components/upload'

import formDialog from '@/components/FormComponents/transfer'
import elTableSelf from '@/components/TabComponents/index'
import {
    defaultPickOpts,
    defaultPickOptsAfter,
    disabledPickerOpts,
    formatReverseSex,
    uniqueArray,
    getBabyAge,
    param,
    param2Obj
} from '@/utils'
import { getDictByIdList } from '@/api/catalog'
export default {
  components: {
    patientInfo,
    transferInfo,
    // diagnosisInfo,
    WesternMedicine,
    inspection,
    examine,
    cost,
    formDialog,
    upload,
    outpatientForm,
    elTableSelf
  },
  props: {
    flag: { type: Boolean, default: true },
    patient: { type: Object },
    caseId: { type: Number },
    disabled: { type: Boolean },
    transferObj3: { type: Object }
  },

    data() {
        const dictMap = {
            60: [], // 血型
            125: [], // RH血型,
            25: [], // 关系
            137: [], // 主诉
            139: [], // 过敏源
            138: [], // 过敏反应
            140: [], // 过敏程度
            131: [] // 证件类型
            // 144: [], //用法-西药
            // 152: [], //用法-中药
            // 145: [] //频率
        }
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        if (item.dictId === 131) {
                            if (item.code === '1' || item.code === '7') {
                                dictMap[item.dictId].push({
                                    value: item.code,
                                    label: item.name
                                })
                            }
                        } else if (item.dictId === 138 || item.dictId === 139 || item.dictId === 140) {
                            dictMap[item.dictId].push({
                                value: item.name,
                                label: item.name
                            })
                        } else {
                            dictMap[item.dictId].push({
                                value: item.code,
                                label: item.name
                            })
                        }
                    })
                }
            }
        })

        let hospitalList = []

        // 获取转诊医院的医院
        getOrganizationInfo().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                const temp_arr = d.childs.concat(d.parents)
                hospitalList = uniqueArray(temp_arr, 'id')
                hospitalList.forEach(element => {
                    element.value = param({
                        label: element.name,
                        value: element.id
                    })
                    element.label = element.name
                })
                this.cacheProgram = hospitalList
            }
        })
        return {
            collapseList: [
                { title: '转诊信息', name: 'transfer-Info' },
                { title: '基本信息', name: 'patientInfo' },
                { title: '病历信息', name: 'caseInfo' },
                { title: '处置', name: 'medicine-Info' },
                { title: '检查', name: 'inspectionInfo' },
                { title: '检验', name: 'examineInfo' },
                { title: '费用', name: 'costInfo' }
            ],
            activeNames: ['transfer-Info', 'caseInfo'],
            cacheProgram: [],
            recoveryInfo: ['recoveryInfo'],
            treatmentInfo: ['treatmentInfo'],
            flagCommon: true,
            // patientInfo:[],
            // 通用转诊
            // 病人信息
            patientInfo: [
                {
                    type: 'input',
                    field: 'inpNo',
                    name: '住院号/门诊号',
                    maxlength: 20,
                    rules: [
                        {
                            required: true,
                            message: ' 请输入住院号/门诊号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    field: 'patientName',
                    name: '患者姓名',
                    maxlength: 20,
                    rules: [
                        {
                            required: true,
                            message: ' 请输入患儿姓名',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    field: 'patientSex',
                    name: '性别',
                    opts: [
                        {
                            label: '男',
                            value: '1'
                        },
                        {
                            label: '女',
                            value: '2'
                        },
                        {
                            label: '未知',
                            value: '3'
                        }
                    ],
                    rules: [
                        {
                            required: true,
                            message: ' 请输入性别',
                            trigger: 'change'
                        }
                    ]
                },
                {
                    type: 'datePicker',
                    field: 'patientBirth',
                    name: '出生日期',
                    rules: [
                        {
                            required: true,
                            message: ' 请选择出生日期',
                            trigger: 'blur'
                        }
                    ],
                    options: defaultPickOpts.opts,
                    format: defaultPickOpts.format,
                    valueFormat: defaultPickOpts.valueFormat,
                    func: this.handleChangeBirth
                },
                {
                    type: 'input',
                    field: 'patientAge',
                    name: '年龄',
                    disabled: true
                },
                {
                    type: 'input',
                    field: 'patientPhone',
                    maxlength: 11,
                    name: '联系电话',
                    rules: [
                        {
                            required: true,
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'select',
                    field: 'certificateType',
                    name: '证件类型',
                    opts: dictMap[131],
                    func: this.idNumTypeChange
                },
                {
                    type: 'input',
                    field: 'patientIdCard',
                    name: '证件号码',
                    maxlength: 18,
                    rules: [
                        {
                            pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                            message: '请输入正确的身份证号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    field: 'address',
                    name: '家庭住址',
                    spanCount: 12
                }
            ],

            // 转诊信息
            transferInfo: [
                {
                    type: 'select',
                    field: 'hospitalId',
                    name: '转诊医院',
                    rules: [
                        {
                            required: true,
                            message: '请选择转诊医院',
                            trigger: 'change'
                        }
                    ],
                    opts: hospitalList,
                    // opts: [
                    //   {
                    //     label: "XXX医院",
                    //     value: "86456"
                    //   }
                    // ],
                    func: this.changeHospital
                },
                {
                    type: 'select',
                    field: 'deptId',
                    name: '期望科室',
                    opts: []
                },
                {
                    type: 'daterange',
                    // class: 'fixedHeight',
                    field: 'transferTimeArr',
                    name: '期望转诊日期',
                    rules: [
                        {
                            required: true,
                            message: ' 请选择期望转诊日期',
                            trigger: 'blur'
                        }
                    ],
                    options: defaultPickOptsAfter.opts,
                    format: defaultPickOptsAfter.format,
                    valueFormat: defaultPickOptsAfter.valueFormat
                },
                {
                    type: 'input',
                    field: 'cause',
                    maxlength: 500,
                    name: '转诊原因',
                    rules: [
                        {
                            required: true,
                            message: '请输入转诊原因',
                            trigger: 'blur'
                        }
                    ],
                    autosize: true
                },
                {
                    type: 'input',
                    name: '转入医院就诊卡号',
                    field: 'patientCardNo',
                    maxlength: 20,
                    rules: [
                        {
                            pattern: /^[a-zA-Z0-9]{1,20}$/,
                            message: '数字或字母，最多20位',
                            trigger: 'blur'
                        }
                    ]
                }
            ],

            outpatientData: [
                {
                    type: 'date',
                    name: '发病时间',
                    field: 'morbidity',
                    options: disabledPickerOpts,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    spanCount: 6
                },
                {
                    type: 'date',
                    name: '就诊时间',
                    field: 'visitTime',
                    options: disabledPickerOpts,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    spanCount: 6,
                    rules: [
                        {
                            required: true,
                            message: ' 请选择就诊时间',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    name: '接诊医生',
                    field: 'doctorName',
                    spanCount: 6,
                    rules: [
                        {
                            required: true,
                            message: ' 请输入接诊医生',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'textarea-select',
                    name: '主诉',
                    field: 'chiefCompliant',
                    maxlength: 250,
                    resize: 'none',
                    autosize: { minRows: 2, maxRows: 4 },
                    rules: [
                        {
                            required: true,
                            message: '主诉必填',
                            trigger: 'change'
                        }
                    ],
                    opts1: dictMap[137],
                    opts2: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                    opts3: ['早晨', '中午', '晚上', '分钟', '小时', '天', '周', '月', '年']
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '现病史',
                    field: 'presentIllness',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    rules: [
                        {
                            required: true,
                            message: '现病史必填',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '既往史',
                    field: 'pastHistory',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                },
                {
                    type: 'checkbox',
                    name: '',
                    field: 'historyList',
                    opts: [
                        {
                            value: 5,
                            label: '手术史'
                        },
                        {
                            value: 6,
                            label: '输血史'
                        },
                        {
                            value: 7,
                            label: '出生史'
                        },
                        {
                            value: 8,
                            label: '喂养史'
                        },
                        {
                            value: 9,
                            label: '个人史'
                        },
                        {
                            value: 10,
                            label: '家族史'
                        }
                        // {
                        //     value: 11,
                        //     label: '月经史'
                        // }
                    ],
                    border: true,
                    className: 'border-checkbox',
                    func: this.historyChange
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '手术史',
                    field: 'operation',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '输血史',
                    field: 'blood',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '出生史',
                    field: 'birth',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '喂养史',
                    field: 'feed',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '个人史',
                    field: 'personalHistory',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '家族史',
                    field: 'familyHistory',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
                    hidden: true
                },
                // {
                //     type: 'input',
                //     inputType: 'textarea',
                //     name: '月经史',
                //     field: 'menstrualHistory',
                //     maxlength: 250,
                //     autosize: { minRows: 1, maxRows: 4 },
                //     hidden: true
                // },
                // {
                //   type: "checkbox",
                //   name: "",
                //   field: "diaDogInfect",
                //   opts: [
                //     {
                //       value: "腹泻",
                //       label: "腹泻"
                //     },
                //     {
                //       value: "犬伤",
                //       label: "犬伤"
                //     },
                //     {
                //       value: "传染病",
                //       label: "传染病"
                //     }
                //   ]
                // },
                {
                    type: 'radio',
                    name: '过敏史',
                    field: 'isAllergies',
                    opts: [
                        {
                            value: 1,
                            label: '有'
                        },
                        {
                            value: 0,
                            label: '否认'
                        }
                    ],
                    rules: [{ required: true, message: '过敏史必选' }],
                    func: this.allergyChange,
                    spanCount: 14
                },
                {
                    type: 'radio',
                    name: '是否计划接种',
                    field: 'isPlanInoculate',
                    opts: [
                        {
                            value: 1,
                            label: '是'
                        },
                        {
                            value: 0,
                            label: '否'
                        }
                    ],
                    spanCount: 10
                },
                {
                    type: 'mixin-select',
                    name: '',
                    className: 'mixin-select',
                    opts1: dictMap[139],
                    opts2: dictMap[138],
                    opts3: dictMap[140],
                    hidden: true,
                    spanCount: 14
                },
                {
                    type: 'mixin-input',
                    name: '体格检查',
                    className: 'mixin-input',
                    field: 'mixin',
                    list: [
                        {
                            type: 'input',
                            name: '体温',
                            field: 'bodyTemperature',
                            rules: [
                                {
                                    pattern: /^(3[5-9]{1}([.]{1}[0-9])?|4[0-2]{1}([.]{1}[0-9])?)$/,
                                    message: '体温有效范围为35.0-42.9',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '°C'
                        },
                        {
                            type: 'background-input',
                            name: '呼吸',
                            field: 'respirationRate',
                            rules: [
                                {
                                    pattern: /^(0|[1-9]{1}|[1-8]\d{1}|90)$/,
                                    message: '0到90为有效数字',
                                    trigger: 'blur'
                                }
                            ],
                            up: 50,
                            down: 12,
                            suffix: '次/分'
                        },
                        {
                            type: 'input',
                            name: '心率',
                            field: 'pulse',
                            rules: [
                                {
                                    pattern: /^(3[6-9]{1}|[4-9]\d{1}|(1([0-4]{1}\d|50)))$/,
                                    message: '脉搏有效范围为36-150',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '次/分'
                        },
                        {
                            type: 'input',
                            name: '血压',
                            field: 'sbp',
                            placeholder: '收缩压',
                            rules: [
                                {
                                    pattern: /^([1-9]\d{0,1}|[1,2]\d{2}|3[0-4]{1}\d|350)$/,
                                    message: '收缩压有效范围为1-350',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: '/'
                        },
                        {
                            type: 'input',
                            name: '',
                            field: 'dbp',
                            labelWidth: '0',
                            placeholder: '舒张压',
                            rules: [
                                {
                                    pattern: /^([1-9]\d{0,1}|[1,2]\d{2}|300)$/,
                                    message: '舒张压有效范围为1-300',
                                    trigger: 'blur'
                                }
                            ],
                            suffix: 'mmHg'
                        }
                    ]
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '其他体格检查',
                    field: 'otherBodyExam',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '辅助检查结果',
                    field: 'assistantExamResult',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                },
                {
                    type: 'tab-select',
                    name: '西医诊断',
                    field: 'diagnosisList',
                    placeholder: '可搜索查询'
                },
                {
                    type: 'tab-select1',
                    name: '中医诊断',
                    field: 'tcmDiagnosisList',
                    placeholder: '可搜索查询'
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '诊疗意见',
                    field: 'treatPlan',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                }
            ],

            histroyListMaps: {
                5: 'operation',
                6: 'blood',
                7: 'birth',
                8: 'feed',
                9: 'personalHistory',
                10: 'familyHistory',
                11: 'menstrualHistory'
            },

            historyDialogVisible: false,
            historyCase: [
                {
                    groupNo: '111'
                }
            ],
            historyColumns: [
                {
                    label: '就诊时间',
                    value: 'startDate',
                    maxLength: 20,
                    width: '150px'
                },
                {
                    label: '接诊医生',
                    value: 'doctorName',
                    maxLength: 20,
                    width: '100px'
                },
                {
                    label: '西医诊断',
                    value: 'diagnoses'
                }
            ],

            dialogFlag: false,
            dictMap,
            hospitalId: '',
            loading: false
        }
    },
    watch: {
        cacheProgram(val) {
            this.transferInfo[0].opts = val
            if (val.length > 0) {
                // this.changeHospital(this.hospitalId)
                this.getPatientInfo()
            }
        },
        patient(val) {
            this.getPatientInfo()
        }
    // hospitalId(val){
    //     if(this.cacheProgram.length > 0){
    //         this.changeHospital(val)
    //     }
    // }
    },
  mounted() {},
  methods: {
    // 转诊医院----期望科室
    changeHospital(value) {
      this.$refs.transfer[0].$refs.transferInfo.form.deptId = ''
      if (this.cacheProgram && this.cacheProgram.length > 0) {
        this.cacheProgram.forEach(item => {
          if (item.value === value) {
            if (item.depts.length > 0) {
              item.depts.forEach(element => {
                element.label = element.name
                element.value = param({
                  label: element.name,
                  value: element.id
                })
              })
              this.transferInfo[1].opts = item.depts
            } else {
              if (this.$refs.transfer[0].$refs.transferInfo.form.deptId) {
                this.$refs.transfer[0].$refs.transferInfo.form.deptId = ''
              }
              this.transferInfo[1].opts = []
            }
          }
        })
      }
    },

    // 初始化病历信息
    initCaseInfo(obj3) {
      // 过敏史
      const allergyLineCount = 0
      const allergytList = []
      if (obj3.allergytList.length > 0) {
        let temp = null
        obj3.allergytList.forEach(item => {
          temp = {
            allergyName: item.allergytName || item.allergyName || '',
            reactionName: item.reactionName || '',
            degreeName: item.degreeName || ''
          }
          allergytList.push(temp)
        })
        obj3.allergytList = allergytList
        obj3.allergyLineCount = obj3.allergytList.length
        this.outpatientData[15].hidden = false
      }
      // 各种史
      const historyList = []
      for (const key in this.histroyListMaps) {
        if (obj3[this.histroyListMaps[key]]) {
          this.outpatientData[Number(key) + 2].hidden = false
          historyList.push(Number(key))
        }
      }
      obj3.historyList = historyList
      this.$refs.outpatient[0].initforms(obj3)
      // if (!this.patient.transferId) {
      // this.$refs.upload.copyForm3(obj3.attachmentList)
      // }
    },

    // 初始化转诊单信息
    getPatientInfo() {
      if (this.patient.transferId) {
        const transferId = this.patient.transferId
        getTransferInfo(transferId).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS

            this.hospitalId = param({ label: d.hospital, value: d.hospitalId })
            this.changeHospital(this.hospitalId)
            this.$nextTick(() => {
              const transferInfo = {
                hospitalId: this.hospitalId,
                deptId: d.deptId && d.deptName ? param({ label: d.deptName, value: d.deptId }) : '',
                transferTimeArr: [d.transferTime, d.transferTimeEnd],
                cause: d.cause,
                patientCardNo: d.patientCardNo,
                appState: d.appState
              }
              this.$refs.transfer[0].initFields(transferInfo)
            })

            // 基本信息
            const patientInfo = {
              patientName: d.patientName,
              patientSex: d.patientSex,
              patientBirth: d.patientBirth,
              patientAge: getBabyAge(d.patientBirth),
              patientPhone: d.patientPhone,
              patientIdCard: d.patientIdCard,
              certificateType: d.certificateType || '1',
              address: d.patientAddress,
              inpNo: d.inpNo
            }
            this.idNumTypeChange(patientInfo.certificateType)
            this.$refs.patientRequire[0].initFields(patientInfo)
            const diagnosisList = []
            if (d.diagnose) {
              const diagnose = d.diagnose.substring(0, d.diagnose.length - 1)

              for (var i = 0; i < diagnose.split(';').length; i++) {
                diagnosisList.push(JSON.parse(diagnose.split(';')[i]))
              }
            }
            // 病历信息
            const caseInfo = {
              morbidity: d.onsetTime,
              visitTime: d.visitTime,
              doctorName: d.doctorName,
              chiefCompliant: d.complaint,
              presentIllness: d.historyOfPresentIllness,
              pastHistory: d.historyOfPastIllness,
              historyList: d.historyList,
              operation: d.historyOfSurgery,
              blood: d.historyOfTransfusion,
              birth: d.historyOfBirth,
              feed: d.historyOfFeeding,
              personalHistory: d.historyOfPersonal,
              familyHistory: d.familyOfIllness,
              menstrualHistory: d.menstrualHistory,
              isAllergies: d.isAllergicHistory,
              isPlanInoculate: d.isInoculation,
              bodyTemperature: d.temperature,
              respirationRate: d.breath,
              pulse: d.pulseRate,
              sbp: d.systolicPressure,
              dbp: d.diastolicPressure,
              otherBodyExam: d.checkUp,
              assistantExamResult: d.assistantExaminationResult,
              diagnosisList: diagnosisList,
              treatPlan: d.suggestion,
              allergytList: d.allergies
            }
            this.initCaseInfo(caseInfo)

            // 处置
            if (d.prescriptions.length > 0) {
              d.prescriptions.forEach(item => {
                item.routeName =
                  item.routeCode && item.routeName
                    ? param({
                        code: item.routeCode,
                        name: item.routeName
                      })
                    : ''
              })
            }
            this.$refs.westernMedicine[0].initFields(d.prescriptions)
            // 检查检验
            // this.$refs.inspection[0].initFields(d.analysisList)
            // this.$refs.examine[0].initFields(d.examList)
            this.$refs.inspection[0].initFields(d.examList)
            this.$refs.examine[0].initFields(d.analysisList)

            // 费用
            const costInfo = {
              totalCharge: d.totalCharge,
              isSubsidy: d.isSubsidy,
              moneySubsidy: d.moneySubsidy
            }
            this.$refs.cost[0].initFields(costInfo)

            // 文件
            this.$refs.upload.copyForm3(d.attachments)
          }
          this.$nextTick(() => {
            this.loading = false
            this.$emit('getCacheTransferData')
          })
        })
      } else {
        // 转诊信息
        const transferInfo = {
          hospitalId: '',
          deptId: '',
          transferTimeArr: [],
          cause: '',
          patientCardNo: ''
        }
        this.$refs.transfer[0].initFields(transferInfo)
        // 患者信息
        const patientInfo = {
          patientName: this.patient.name,
          patientSex: formatReverseSex(this.patient.sex),
          patientBirth: this.patient.birthDate,
          patientAge: this.patient.age,
          patientPhone: this.patient.phone,
          patientIdCard: this.patient.idNum,
          certificateType: this.patient.idNumType || '1',
          address: this.patient.address,
          inpNo: this.patient.outpatientNum
        }
        this.idNumTypeChange(patientInfo.certificateType)
        this.$refs.patientRequire[0].initFields(patientInfo)
        // 处置
        if (this.caseId > 0) {
          getOpdrrecipeListMix({
            caseId: this.caseId,
            recipeChara: 10
          }).then(res => {
            if (res.STATUS === '1') {
              const d = res.ITEMS
              getOpdrrecipeListMix({
                caseId: this.caseId,
                recipeChara: 20
              }).then(r => {
                if (r.STATUS === '1') {
                  const data = r.ITEMS
                  this.freshData(d, data, '处方')
                }
              })
            }
          })

          // 检查检验
          getOpdrrecipeListMix({
            caseId: this.caseId,
            recipeChara: 30
          }).then(res => {
            if (res.STATUS === '1') {
              this.freshData(res.ITEMS, {}, '检查检验')
            }
          })
        }

        // 费用
        const data = {
          pageNo: 1,
          pageSize: 50,
          patientId: this.$route.params.patientId,
          registerId: this.$route.params.regId
        }
        getChargeList(data).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS.list
            let totalCharge = 0
            if (d && d.length > 0) {
              d.forEach(item => {
                totalCharge += item.totalAmt
              })
            }
            const form = {
              totalCharge,
              isSubsidy: 0,
              moneySubsidy: 0
            }
            this.$refs.cost[0].initFields(form)
          }
          // 文件
        })
        this.$nextTick(() => {
          this.loading = false
          this.$emit('getCacheTransferData')
        })
      }
    },

    // 整理处方检查检验
    freshData(d, d1, type) {
      // 已收费
      let chargeList = d.chargeList || []
      const chargeList1 = d1.chargeList || []
      // 未收费
      let unchargeList = d.unchargeList || []
      const unchargeList1 = d1.unchargeList || []

      const jcDetailList = []
      const jyDetailList = []
      const result = []
      let detailList = []
      if (type === '处方') {
        chargeList = chargeList.concat(chargeList1)
        unchargeList = unchargeList.concat(unchargeList1)
      }
      // 合并已收费未收费
      if (unchargeList.length > 0 || chargeList.length > 0) {
        chargeList.forEach((item, index) => {
          detailList = detailList.concat(item.detailList)
        })
        unchargeList.forEach((item, index) => {
          detailList = detailList.concat(item.detailList)
        })
      }
      detailList.forEach(item => {
        if (item.itemType === '03') {
          jcDetailList.push({
            testName: item.itemName,
            desInfo: item.note
          })
        } else if (item.itemType === '04') {
          jyDetailList.push({
            testName: item.itemName,
            mark: item.note,
            unit: item.unit
          })
        }
        item.drugName = item.itemName
        item.routeName = item.usage
        item.dose = item.dosage
      })
      // 处方
      this.$refs.westernMedicine[0].initFields(detailList)
      // 检查检验
      this.$refs.inspection[0].initFields(jcDetailList)
      this.$refs.examine[0].initField(jyDetailList)
    },

    handleConfirmPatient(flag) {
      this.$emit('handleConfirmPatient', flag)
    },
    handleConfirmTransfer(flag) {
      this.$emit('handleConfirmTransfer', flag)
    },
    handleConfirmCase(flag) {
      this.$emit('handleConfirmCase', flag)
    },

    // 切换显示病史
    historyChange(flag, val) {
      if (!flag) {
        this.$refs.outpatient[0].resetField(this.histroyListMaps[val])
      }
      this.outpatientData[val + 2].hidden = !flag
    },

    // 过敏史改变
    allergyChange(flag) {
      if (flag) {
        this.$refs.outpatient[0].switchAllergy()
      }
      this.outpatientData[15].hidden = !flag
    },

    // 打开历史病例
    handleLeadin() {
      const patientId = this.$route.params.patientId
      const params = {
        pageNo: 1,
        pageSize: 100
      }
      getOpHistory(patientId, params).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS
          const result = []
          if (d && d.totalRecord > 0) {
            d.list.forEach(item => {
              item.diagnoses = ''
              item.id = item.caseId
              if (item.opDrCaseDiagnosisList && item.opDrCaseDiagnosisList.length > 0) {
                item.opDrCaseDiagnosisList.forEach(dia => {
                  item.diagnoses += dia.diseaseName + '; '
                })
              }
            })
          }
          this.historyCase = d.list
          this.historyDialogVisible = true
        }
      })
    },

    // 改变出生日期
    handleChangeBirth(val) {
      this.patient.age = getBabyAge(val)
      const patientInfo = {
        patientBirth: val,
        patientAge: this.patient.age
      }
      this.$refs.patientRequire[0].initFields(patientInfo)
    },

    // 点击历史病历
    handleClick(item) {
      this.loading = true
      getOpDetail(item.id).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS
          if (d) {
            const caseInfo = Object.assign({}, d.opCase)
            caseInfo.visitTime = caseInfo.visitingTime
            caseInfo.diagnosisList = d.diagnosisList
            caseInfo.allergytList = d.allergytList
            this.initCaseInfo(caseInfo)

            const recipeListMap = d.recipeListMap
            let westernMedicine = []
            const examList = []
            const analysisList = []
            for (var key in recipeListMap) {
              if (key === '10' || key === '20') {
                recipeListMap[key].forEach(item => {
                  item.detailList.forEach(items => {
                    items.drugName = items.itemName
                    items.dose = items.dosage
                    items.routeName = items.usage
                    items.groupNo = items.groupSn
                  })
                  westernMedicine = westernMedicine.concat(item.detailList)
                })
              } else if (key === '30') {
                const detailList = recipeListMap[key][0].detailList
                detailList.forEach(item => {
                  if (item.itemType === '03') {
                    analysisList.push({
                      testName: item.itemName,
                      desInfo: item.note
                    })
                  } else if (item.itemType === '04') {
                    examList.push({
                      testName: item.itemName,
                      mark: item.note,
                      unit: item.unit
                    })
                  }
                })
              }
            }
            this.$refs.westernMedicine[0].initFields(westernMedicine)
            // 检查检验
            this.$refs.inspection[0].initFields(analysisList)
            this.$refs.examine[0].initField(examList)
            // 文件
            this.$refs.upload.copyForm3(d.attachmentList)
          }
        }
        this.$nextTick(() => {
          this.historyDialogVisible = false
          this.loading = false
        })
      })
    },

    // 选择证件类型
    idNumTypeChange(val) {
      const idNumType = this.patientInfo[7].rules[0]
      if (val === '1') {
        idNumType.message = '请输入正确的身份证号'
        idNumType.pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      } else {
        idNumType.message = '请输入正确的出生证号'
        idNumType.pattern = /^[a-zA-Z][0-9]{9}$/
      }
    }
  },
}
</script>
<style>
.medical-record .el-form-item {
  margin-bottom: 17px !important;
}
.medical-record .el-collapse-item__header {
  /* height: 40px; */
  font-size: 15px;
  font-weight: 700 !important;
}
.medical-record .el-collapse-item__header,
.medical-record .el-collapse-item__arrow {
  height: 40px;
  line-height: 40px;
}
</style>

