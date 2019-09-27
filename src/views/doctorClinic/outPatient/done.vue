<template>
    <el-row class="page-main">
        <el-row :gutter="20">
            <el-col :sm="24" :md="4" class="drugDetail">
                <patient-card :patient="patient" :panel-ellist="patientElList" />
            </el-col>
            <el-col :sm="24" :md="20">
                <el-tabs v-model="activeName" type="border-card" @tab-click="handleSwitch">
                    <el-tab-pane v-for="(tab,index) in tabMapOpts" v-if="!tab.isHidden && (tab.key !== 'tab7' || (tab.key === 'tab7'&& caseId && opType === 'mmt'))" :key="index" :name="tab.key" :label="tab.label">
                        <template v-if="tab.key === 'tab1'">
                            <iframe v-if="opType !== 'his'" :src="outPatientUrl" width="100%" height="850px" frameborder="0" scrolling="auto" />
                            <el-row v-else :gutter="20">
                                <outpatient-form ref="outpatient" :forms="outpatientData" :patient="patient" :label-width="'120px'" :disabled="true" />
                            </el-row>
                        </template>
                        <template v-else-if="tab.key === 'tab7'">
                            <iframe :src="transferUrl" width="100%" height="850px" frameborder="0" scrolling="auto" />
                        </template>
                        <template v-else-if="tab.key === 'tab8'">
                            <follow ref="follow" :case-id="caseId" :dict-map="dictMap" :patient="patient" :disabled="true" />
                        </template>
                        <template v-else-if="tab.key === 'tab9'">
                            <transfer v-if="activeName === 'tab9'" ref="transfer" :patient="patient" :case-id="caseId" :disabled="true" />
                        </template>
                        <template v-else>
                            <el-row v-loading="panelLoading">
                                <template v-if="activeName=== 'tab2' || activeName=== 'tab3'">
                                    <el-row class="common-title">
                                        <!-- <el-button :disabled="!caseId" icon="el-icon-plus" type="primary" @click="addTab">新增处方</el-button> -->
                                        <h2>过敏史：
                                            <template v-if="patient.isAllergies === 1">
                                                <span v-for="(a,aI) in patient.allergytList" :key="aI">{{ a.allergyName||'' }}
                                                    {{ a.reactionName?`（${a.reactionName}`:'（' }}{{ a.degreeName?`${a.degreeName}）`:'）' }}</span>
                                            </template>
                                            <span v-else>否认</span>
                                        </h2>

                                        <!-- <el-button :disabled="!caseId" @click="handleChooseTpl" class="fr">选择模板</el-button>
                    <el-button :disabled="!caseId" @click="handleChooseDrug" class="fr" style="margin-right:10px;">选择药品</el-button>-->
                                    </el-row>
                                    <el-row class="tabs-right">
                                        <el-select v-model="recipeClass" placeholder="请选择处方类型" disabled>
                                            <el-option v-for="(opt,optIndex) in recipeClassList[activeName]" :key="optIndex" :label="opt.label" :value="opt.value">
                                                <span style="float: left">{{ opt.label }}</span>
                                                <span style="float: right; color: #8492a6; font-size: 10px">{{
                                                opt.description }}</span>
                                            </el-option>
                                        </el-select>
                                    </el-row>
                                    <el-tabs v-model="tab2Active" type="card" @tab-click="handleTab2Switch">
                                        <el-tab-pane v-for="(item, index) in tab2List" :disabled="!caseId" :key="index" :label="`${!item.isRefund?'':'【作废】'}处方${index+1}`" :name="item.name">
                                            <complex-tab 
:key="`${activeName}_tab`" 
:columns="tab2Map[activeName].columns" :add-columns="tab2Map[activeName].addColumns" :table-data="item.detailList" :params="{
                                                chara:tab2Map[activeName].chara,
                                                placeholder:tab2Map[activeName].placeholder ,
                                                style:{width:'580px'}
                                            }" :disabled="true" :is-show="false" />
                                        </el-tab-pane>
                                    </el-tabs>
                                    <el-form v-if="activeName=== 'tab3'" v-model="tab3Form" inline label-width="95px" disabled>
                                        <el-row class="tab3-form">
                                            <template v-for="(item,index) in tab3FormData" v-if="!item.hidden">
                                                <el-col :span="item.spanCount?item.spanCount:8" :key="item.field">
                                                    <el-form-item :key="index" :label="`${item.name}：`" :label-width="item.labelWidth" :prop="item.field" :class="item.className" :rules="item.rules" style="height:33px;">
                                                        <span v-if="!item.name" slot="label" />
                                                        <!-- 输入框 -->
                                                        <el-input v-if="item.type === 'input'" :type="item.inputType?item.inputType:''" v-model="tab3Form[item.field]" :placeholder="item.placeholder" :resize="item.resize" :maxlength="item.maxlength" @input="item.func?item.func($event):{}">
                                                            <span v-if="item.unit" :slot="item.slot?item.slot:'append'">{{ item.unit }}</span>
                                                        </el-input>

                                                        <!-- 数字输入 -->
                                                        <el-input-number v-if="item.type === 'number'" v-model="tab3Form[item.field]" :controls="false" :precision="item.precision" :min="item.min" :max="item.max" @change="item.func?item.func($event):{}" />

                                                        <!-- 选择器 -->
                                                        <el-select v-else-if="item.type === 'select'" v-model="tab3Form[item.field]" placeholder="请选择" @change="item.func?item.func($event):{}">
                                                            <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                                                <span style="float: left">{{ opt.label }}</span>
                                                                <span style="float: right; color: #8492a6; font-size: 10px">{{
                                                                opt.description }}</span>
                                                            </el-option>
                                                        </el-select>

                                                        <!-- 输入+选择 -->
                                                        <el-input v-else-if="item.type === 'input-select'" v-model="tab3Form[item.field]" placeholder="请输入" class="input-with-select">
                                                            <el-select slot="append" v-model="tab3Form[item.field2]" placeholder="请选择">
                                                                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                                                    <span style="float: left">{{ opt.label }}</span>
                                                                    <span style="float: right; color: #8492a6; font-size: 10px">{{
                                                                    opt.description }}</span>
                                                                </el-option>
                                                            </el-select>
                                                        </el-input>
                                                    </el-form-item>
                                                </el-col>
                                            </template>
                                        </el-row>
                                    </el-form>
                                </template>
                                <template v-else>
                                    <complex-tab 
:key="`${activeName}_tab`" 
:columns="tab2Map[activeName].columns" :add-columns="tab2Map[activeName].addColumns" :table-data="tab4Obj.detailList" :params="{
                                        chara:tab2Map[activeName].chara,
                                        placeholder:tab2Map[activeName].placeholder ,
                                        style:{width:'530px'}
                                    }" :disabled="true" :is-show="false" />
                                </template>
                                <el-row v-if="activeName!=='tab7'" class="footer">
                                    <p>
                                        <span>合计总金额：</span>
                                        ￥{{ totalPrice }}
                                    </p>
                                    <!-- <el-button :disabled="!caseId" @click="handleSaveTpl">存储为模板</el-button> -->
                                    <el-button v-if="activeName === 'tab2' || activeName === 'tab3'" :disabled="!caseId" type="primary" @click="handlePrint">打印</el-button>
                                    <!-- <el-button :disabled="!caseId" @click="handleSave" type="primary">保存</el-button> -->
                                </el-row>
                            </el-row>
                        </template>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { getPatientByRegId } from '@/api/arclinic'
import { getPatientInfo, getOpdrrecipeList } from '@/api/outpatient'

import patientCard from '@/components/Panel/PatientCard'
import complexTab from '@/components/TabComponents/complex'
import outpatientForm from './components/outpatient'
import diagnosis from './components/diagnosis'
import follow from './components/follow'
import elTableSelf from '@/components/TabComponents/index'
import transfer from './components/transfer'
import { mapGetters } from 'vuex'
import MD5 from '@/utils/MD5'

import {
    getBabyAge,
    formatSex,
    disabledPickerOpts,
    paramAvatar,
    formatDate,
    formatRegion,
    formatDictMap
} from '@/utils'
import { getDrugUrl } from '@/api/catalog'
import { toFixed } from '@/utils/float'
import { remove_ie_header_and_footer } from '@/utils/print'
export default {
    components: {
        patientCard,
        outpatientForm,
        diagnosis,
        complexTab,
        elTableSelf,
        follow,
        transfer
    // diagnosisForm
    },
    data() {
    // const dictData = this.$store.getters.dictData
        const dictMap = {
            20: [], // 职业
            29: [], // 民族
            107: [], // 婚姻状况
            137: [], // 常见症状
            138: [], // 过敏反应
            139: [], // 过敏源
            140: [], // 过敏程度
            144: [], // 用法-西药
            152: [], // 用法-中药
            145: [], // 给药频次
            146: [], // 取药方式,
            483: [], // 每日剂量单位
            484: [], // 西药/中成药处方类型
            485: [], // 中药处方类型
            490: [], // 离院去向
            492: [], // 随访方式
            493: [] // 随访类型
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
                        if ((item.dictId > 137 && item.dictId < 141) || item.dictId === 490) {
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
        return {
            listLoading: false,
            opType: 'mmt',
            outPatientUrl: '',
            transferUrl: '',
            dictMap,
            // dictData,
            caseId: 0,
            totalPrice: 0,
            panelLoading: false,
            activeName: 'tab1',
            tabMapOpts: [
                {
                    label: '门诊病历',
                    key: 'tab1'
                },
                {
                    label: '西/成药处方',
                    key: 'tab2'
                },
                {
                    label: '中药处方',
                    key: 'tab3'
                },
                {
                    label: '检验检查',
                    key: 'tab4'
                },
                {
                    label: '治疗',
                    key: 'tab5'
                },
                {
                    label: '材料',
                    key: 'tab10'
                },
                {
                    label: '其他',
                    key: 'tab6'
                },
                {
                    label: '转诊信息',
                    key: 'tab7'
                },
                {
                    label: '随访',
                    key: 'tab8'
                },
                {
                    label: '转诊单',
                    key: 'tab9'
                }
            ],
            tab2Active: 'recipe1',
            tab2Map: {
                tab1: {
                    chara: 0,
                    placeholder: '',
                    columns: []
                },
                // 西药
                tab2: {
                    chara: 10,
                    placeholder: '新增西药',
                    columns: [
                        {
                            type: 'input',
                            value: 'groupSn',
                            label: '组号',
                            maxlength: 2,
                            width: '65px'
                        },
                        {
                            type: 'spans',
                            label: '药品名称',
                            minWidth: '250px',
                            formatter(row) {
                                return `${row.itemName}${row.spec ? `（${row.spec}）` : ''}`
                            },
                            style: { color: '#409EFF', cursor: 'pointer' },
                            func: this.handleDrugDetail
                        },
                        {
                            type: 'input',
                            value: 'dosage',
                            label: '单次剂量',
                            minWidth: '180px',
                            unit: 'dosageUnit',
                            func: this.dosageUnitChangeNew
                        },
                        {
                            type: 'select',
                            value: 'usage',
                            label: '用法',
                            opts: dictMap[144],
                            width: '120px'
                        },
                        {
                            type: 'select',
                            value: 'frequency',
                            label: '频率',
                            opts: dictMap[145],
                            width: '120px',
                            func: this.frequencyChangeNew
                        },
                        {
                            type: 'number',
                            value: 'days',
                            label: '天数',
                            min: 1,
                            precision: 0,
                            width: '120px',
                            func: this.daysChangeNew
                        },
                        {
                            type: 'input',
                            value: 'qty',
                            label: '总量',
                            maxlength: 3,
                            minWidth: '180px',
                            unit: 'unit',
                            func: this.totalCountChange
                        },
                        {
                            value: 'price',
                            label: '单价',
                            width: '80px'
                        },
                        {
                            value: 'amt',
                            label: '金额',
                            width: '80px'
                        },
                        {
                            type: 'select',
                            value: 'medicineType',
                            label: '取药方式',
                            opts: dictMap[146],
                            width: '100px'
                        },
                        {
                            type: 'input',
                            value: 'note',
                            label: '特殊用药备注',
                            width: '200px'
                        }
                        // {
                        //     type: 'button',
                        //     label: '操作',
                        //     width: '135px',
                        //     func: this.deleteRow,
                        //     btnType: 'danger',
                        //     icon: 'el-icon-delete',
                        //     text: '删除',
                        //     fixed: 'right'
                        // }
                    ],
                    addColumns: [
                        {
                            value: 'name',
                            label: '药品名称',
                            width: '200'
                        },
                        {
                            value: 'spec',
                            label: '规格',
                            width: '100'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '50'
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            width: '150'
                        },
                        {
                            value: 'qty',
                            label: '库存',
                            width: '50'
                        }
                    ]
                },
                // 中药
                tab3: {
                    chara: 20,
                    placeholder: '新增中药',
                    columns: [
                        {
                            type: 'spans',
                            label: '药品名称',
                            minWidth: '250px',
                            formatter(row) {
                                return `${row.itemName}${row.spec ? `（${row.spec}）` : ''}`
                            },
                            style: { color: '#409EFF', cursor: 'pointer' },
                            func: this.handleDrugDetail
                        },
                        {
                            type: 'input',
                            value: 'dosage',
                            label: '剂量',
                            minWidth: '120px',
                            unit: 'dosageUnit',
                            func: this.doseInputChange
                        },
                        {
                            value: 'qty',
                            label: '总量',
                            width: '80px'
                        },
                        {
                            value: 'amt',
                            label: '总价',
                            width: '100px'
                        },
                        {
                            type: 'input',
                            value: 'note',
                            label: '特殊要求',
                            minWidth: '200px'
                        }
                        // {
                        //     type: 'button',
                        //     label: '操作',
                        //     width: '135px',
                        //     func: this.deleteRow,
                        //     btnType: 'danger',
                        //     icon: 'el-icon-delete',
                        //     text: '删除',
                        //     fixed: 'right'
                        // }
                    ],
                    addColumns: [
                        {
                            value: 'name',
                            label: '药品名称',
                            width: '200'
                        },
                        {
                            value: 'spec',
                            label: '规格',
                            width: '100'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '50'
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            width: '150'
                        },
                        {
                            value: 'qty',
                            label: '库存',
                            width: '50'
                        }
                    ]
                },
                // 检验检查
                tab4: {
                    chara: 30,
                    placeholder: '新增检验检查',
                    columns: [
                        {
                            value: 'itemName',
                            label: '名称',
                            minWidth: '150px'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '100px'
                        },
                        {
                            value: 'qty',
                            label: '数量',
                            width: '150px'
                        },
                        {
                            type: 'input',
                            value: 'note',
                            label: '说明',
                            minWidth: '150px'
                        },
                        {
                            value: 'price',
                            label: '单价',
                            width: '100px'
                        }
                        // {
                        //     type: 'button',
                        //     label: '操作',
                        //     width: '135px',
                        //     func: this.deleteRow,
                        //     btnType: 'danger',
                        //     icon: 'el-icon-delete',
                        //     text: '删除',
                        //     fixed: 'right'
                        // }
                    ],
                    addColumns: [
                        {
                            value: 'name',
                            label: '项目名称',
                            width: '300'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '200'
                        }
                    ]
                },
                // 治疗
                tab5: {
                    chara: 40,
                    placeholder: '新增治疗',
                    columns: [
                        {
                            value: 'itemName',
                            label: '名称',
                            minWidth: '150px'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '100px'
                        },
                        {
                            type: 'number',
                            value: 'qty',
                            min: 1,
                            precision: 0,
                            label: '数量',
                            width: '150px',
                            func: this.totalCountChange
                        },
                        {
                            type: 'input',
                            value: 'note',
                            label: '说明',
                            minWidth: '150px'
                        },
                        {
                            value: 'price',
                            label: '单价',
                            width: '100px'
                        }
                        // {
                        //     type: 'button',
                        //     label: '操作',
                        //     width: '135px',
                        //     func: this.deleteRow,
                        //     btnType: 'danger',
                        //     icon: 'el-icon-delete',
                        //     text: '删除',
                        //     fixed: 'right'
                        // }
                    ],
                    addColumns: [
                        {
                            value: 'name',
                            label: '名称',
                            width: '300'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '200'
                        }
                    ]
                },
                tab10: {
                    chara: 0,
                    placeholder: '',
                    columns: []
                },
                // 其他
                tab6: {
                    chara: 99,
                    placeholder: '新增其他',
                    columns: [
                        {
                            value: 'itemName',
                            label: '名称',
                            minWidth: '150px'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '100px'
                        },
                        {
                            type: 'number',
                            value: 'qty',
                            min: 1,
                            precision: 0,
                            label: '数量',
                            width: '150px',
                            func: this.totalCountChange
                        },
                        {
                            type: 'input',
                            value: 'note',
                            label: '说明',
                            minWidth: '150px'
                        },
                        {
                            value: 'price',
                            label: '单价',
                            width: '100px'
                        }
                        // {
                        //     type: 'button',
                        //     label: '操作',
                        //     width: '135px',
                        //     func: this.deleteRow,
                        //     btnType: 'danger',
                        //     icon: 'el-icon-delete',
                        //     text: '删除',
                        //     fixed: 'right'
                        // }
                    ],
                    addColumns: [
                        {
                            value: 'name',
                            label: '名称',
                            width: '200'
                        },
                        {
                            value: 'unit',
                            label: '单位',
                            width: '200'
                        },
                        {
                            value: 'qty',
                            label: '库存',
                            width: '100'
                        }
                    ]
                },
                tab8: {
                    chara: 0,
                    placeholder: '',
                    columns: []
                },
                tab9: {
                    chara: 0,
                    placeholder: '',
                    columns: []
                }
            },
            tab2List: [],
            tab4Obj: {},
            tab3Form: {
                usage: '152',
                days: 1,
                dose: 1,
                doseUnit: '01',
                frequency: '',
                medicineType: '01',
                footNote: ''
            },
            tab3FormData: [
                {
                    type: 'select',
                    field: 'usage',
                    name: '用法',
                    opts: dictMap[152]
                },
                {
                    type: 'input-select',
                    name: '每日剂量',
                    field: 'dose',
                    field2: 'doseUnit',
                    opts: dictMap[483]
                },
                {
                    type: 'number',
                    field: 'days',
                    min: 1,
                    max: 100,
                    name: '总剂数',
                    // func: this.daysInputChange,
                    precision: 0
                },
                {
                    type: 'select',
                    field: 'frequency',
                    name: '频次',
                    opts: dictMap[145]
                },
                {
                    type: 'select',
                    field: 'medicineType',
                    name: '取药地点',
                    opts: dictMap[146]
                },
                {
                    type: 'input',
                    field: 'footNote',
                    name: '服药要求'
                }
            ],
            patient: {},
            patientElList: {
                // btnList: [
                //     {
                //         name: '历史病例',
                //         func: this.historyOutPatient
                //     },
                //     {
                //         name: '完善信息',
                //         func: this.perfectOutpatient
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
                        unit: 'cm'
                    },
                    {
                        name: '体重',
                        value: 'weight',
                        unit: 'kg'
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
            histroyListMaps: {
                5: 'operation',
                6: 'blood',
                7: 'birth',
                8: 'feed',
                9: 'personalHistory',
                10: 'familyHistory'
            },
            outpatientData: [
                {
                    type: 'date',
                    name: '发病时间',
                    field: 'morbidity',
                    options: disabledPickerOpts,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    spanCount: 12
                },
                {
                    type: 'textarea-select',
                    name: '主诉',
                    field: 'chiefCompliant',
                    maxlength: 250,
                    resize: 'none',
                    autosize: {
                        minRows: 2,
                        maxRows: 4
                    },
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
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '既往史',
                    field: 'pastHistory',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
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
                        },
                        {
                            value: 11,
                            label: '月经史'
                        }
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
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '输血史',
                    field: 'blood',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '出生史',
                    field: 'birth',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '喂养史',
                    field: 'feed',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '个人史',
                    field: 'personalHistory',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '家族史',
                    field: 'familyHistory',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '月经史',
                    field: 'menstrualHistory',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    },
                    hidden: true
                },
                {
                    type: 'checkbox',
                    name: '',
                    field: 'diaDogInfect',
                    opts: [
                        {
                            value: '腹泻',
                            label: '腹泻'
                        },
                        {
                            value: '犬伤',
                            label: '犬伤'
                        },
                        {
                            value: '传染病',
                            label: '传染病'
                        }
                    ]
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
                    ]
                },
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
                    rules: [
                        {
                            required: true,
                            message: '过敏史必选'
                        }
                    ],
                    func: this.allergyChange
                },
                {
                    type: 'mixin-select',
                    name: '',
                    className: 'mixin-select',
                    opts1: dictMap[139],
                    opts2: dictMap[138],
                    opts3: dictMap[140],
                    hidden: true
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
                            type: 'input',
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
                                    pattern: /^(\d{1,2}|[1,2]\d{2}|3[0-4]{1}\d|350)$$/,
                                    message: '收缩压有效范围为0-350',
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
                                    pattern: /^(\d{1,2}|[1,2]\d{2}|300)$/,
                                    message: '舒张压有效范围为0-300',
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
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '辅助检查结果',
                    field: 'assistantExamResult',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
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
                    placeholder: '请输入中医诊断'
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '用药史',
                    field: 'medicine',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '健康教育',
                    field: 'healthEducation',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '诊疗意见',
                    field: 'treatPlan',
                    maxlength: 250,
                    autosize: {
                        minRows: 1,
                        maxRows: 4
                    }
                },
                {
                    type: 'select',
                    name: '离院去向',
                    field: 'whereabouts',
                    opts: dictMap[490]
                },
                {
                    type: 'upload',
                    name: '文件'
                }
            ],
            recipeClass: '',
            recipeClassList: {
                tab2: dictMap[484],
                tab3: dictMap[485]
            },
            detailTableData: [],
            detailInfoData: [],
            transferObj3: {},
            showPrescriptionAmount: this.commonUtil.getConfigValue('showPrescriptionAmount')
        }
    },
    watch: {
        $route() {
            if (this.$route.name === 'outpatientDone') {
                this._getPatientInfo()
            }
        }
    },
    computed: {
        ...mapGetters(['dictData', 'clinic', 'basic', 'user'])
    },
    mounted() {
        this.opType = this.$route.params.type
        const transferType = this.commonUtil.getConfigValue('transferType')
        if (transferType === '0') {
            this.tabMapOpts[9].isHidden = false
        } else {
            this.tabMapOpts[9].isHidden = true
        }
        this._getPatientInfo()
    },
    methods: {
    // 切换一级pane
        handleSwitch(tab) {
            if (this.activeName === 'tab1' || this.activeName === 'tab7') return
            if (this.activeName === 'tab9') {
                this.$nextTick(() => {
                    if (!this.patient.transferId) {
                        this.$refs.transfer[0].$refs.medicalRecordForm.initCaseInfo(this.transferObj3) // 转诊单病历信息
                    }
                })
            }
            if (!this.caseId) {
                if (this.activeName === 'tab2' || this.activeName === 'tab3') {
                    this.tab2List = [
                        {
                            name: 'recipe1',
                            recipe: {
                                id: 0
                            },
                            detailList: []
                        }
                    ]
                } else {
                    this.tab4Obj = {
                        recipe: {
                            id: 0
                        },
                        detailList: []
                    }
                }
                return
            }
            const params = {
                caseId: this.caseId,
                detailFlag: 1,
                chargeStatus: '',
                recipeChara: this.tab2Map[this.activeName].chara
            }
            this.panelLoading = true
            getOpdrrecipeList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let result = []
                    let total = 0
                    if (this.activeName === 'tab2' || this.activeName === 'tab3') {
                        this.tab2Active = 'recipe1'
                        if (d && d.length > 0) {
                            d.forEach((item, index) => {
                                const recipe = item.recipe
                                const detailList = item.detailList
                                result.push({
                                    name: `recipe${index + 1}`,
                                    recipe: {
                                        recipeClass: recipe.recipeClass || '01',
                                        id: recipe.id
                                    },
                                    isRefund: recipe.refundStatus === 1,
                                    detailList
                                })
                                if (index === 0 && detailList.length > 0) {
                                    detailList.forEach(de => {
                                        // total += Number(de.amt ? de.amt : 0)
                                        total = toFixed(Number(total) + Number(de.amt ? de.amt : 0), 2)
                                    })
                                    this.recipeClass = recipe.recipeClass || '01'
                                }
                            })
                            if (this.activeName === 'tab3') {
                                const data = result[0].detailList
                                if (data.length > 0) {
                                    this.tab3Form = {
                                        usage: data[0].usage,
                                        days: data[0].days,
                                        dose: data[0].dose,
                                        doseUnit: data[0].doseUnit,
                                        frequency: data[0].frequency,
                                        medicineType: data[0].medicineType,
                                        footNote: data[0].footNote || ''
                                    }
                                }
                            }
                        } else {
                            result.push({
                                name: 'recipe1',
                                recipe: {
                                    id: 0
                                },
                                detailList: []
                            })
                            this.recipeClass = '01'
                        }
                        this.tab2List = result
                    } else {
                        if (d && d.length > 0) {
                            const detailList = d[0].detailList
                            result = {
                                recipe: {
                                    id: d[0].recipe.id
                                },
                                detailList
                            }
                            if (detailList.length > 0) {
                                detailList.forEach(de => {
                                    // total += Number(de.amt ? de.amt : 0)
                                    total = toFixed(Number(total) + Number(de.amt ? de.amt : 0), 2)
                                })
                            }
                        } else {
                            result = {
                                recipe: {
                                    id: 0
                                },
                                detailList: []
                            }
                        }
                        this.tab4Obj = result
                    }
                    this.panelLoading = false
                    this.totalPrice = toFixed(total, 2)
                }
            })
        },

        // 切换二级pane
        handleTab2Switch(tab) {
            let total = 0
            this.tab2List.forEach(item => {
                if (item.name === this.tab2Active) {
                    const detailList = item.detailList
                    const recipe = item.recipe
                    let data = null
                    if (detailList.length > 0) {
                        detailList.forEach(de => {
                            // total += Number(de.amt ? de.amt : 0)
                            total = toFixed(Number(total) + Number(de.amt ? de.amt : 0), 2)
                        })
                        data = detailList[0]
                    }
                    if (this.activeName === 'tab3') {
                        if (data) {
                            this.tab3Form = {
                                usage: data.usage,
                                days: data.days,
                                dose: data.dose,
                                doseUnit: data.doseUnit,
                                frequency: data.frequency,
                                medicineType: data.medicineType,
                                footNote: data.footNote || ''
                            }
                        } else {
                            this.tab3Form = {
                                usage: '152',
                                days: 1,
                                dose: 1,
                                doseUnit: '01',
                                frequency: '200001',
                                medicineType: '01',
                                footNote: ''
                            }
                        }
                    }
                    this.recipeClass = recipe ? recipe.recipeClass : ''
                }
            })
            this.totalPrice = toFixed(total, 2)
        },
        // 处方打印
        handlePrint() {
            let list = []
            let createTime = ''
            const diagnosisList = []
            const tcmDiagnosisList = []
            let diagnosis = ''
            let tcmDiagnosis = ''
            if (this.patient.diagnosisList.length > 0) {
                this.patient.diagnosisList.forEach((item, index) => {
                    if (item.diagnosisType !== '中医诊断') {
                        diagnosisList.push(item)
                    } else {
                        tcmDiagnosisList.push(item)
                    }
                })
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
            this.tab2List.forEach(item => {
                if (item.name === this.tab2Active) {
                    list = item.detailList
                    const recipe = item.recipe
                    createTime = recipe && recipe.createTime ? recipe.createTime.split(' ')[0] : formatDate()
                }
            })
            const that = this
            if (that.activeName === 'tab2') {
                const westList = []
                const chineseWestList = []
                list.forEach(item => {
                    if (item.itemType === '1001') {
                        westList.push(item)
                    } else {
                        chineseWestList.push(item)
                    }
                })
                var timer = 0
                var num = 0
                if (that.commonUtil.getConfigValue('isSeparateCWRecipe') === '1') {
                    if (westList && westList.length > 0) {
                        // this.handleRecipePrint(westList, diagnosis, '西药')
                        // timer += 100
                        let result = []
                        for (var i = 0; i < westList.length; i += 5) {
                            result = westList.slice(i, i + 5)
                            that.handleRecipePrint(result, diagnosis, '西药')
                            timer += 100
                        }
                    }
                    if (chineseWestList && chineseWestList.length > 0) {
                        num = 1
                        setTimeout(() => {
                            // this.handleRecipePrint(chineseWestList, tcmDiagnosis, '中成药')
                            // setTimeout(() => {
                            //     window.location.reload()
                            // }, 100)

                            let result = []
                            for (var i = 0; i < chineseWestList.length; i += 5) {
                                result = chineseWestList.slice(i, i + 5)
                                that.handleRecipePrint(result, tcmDiagnosis, '中成药')
                                setTimeout(() => {
                                    window.location.reload()
                                }, 100)
                            }
                        }, timer)
                    }
                    if (num === 0) {
                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }
                } else {
                    // this.handleRecipePrint(list, diagnosis, '西药')
                    // setTimeout(() => {
                    //     window.location.reload()
                    // }, 100)
                    let result = []
                    for (var i = 0; i < list.length; i += 5) {
                        result = list.slice(i, i + 5)
                        that.handleRecipePrint(result, diagnosis, '西药')
                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }
                }
            } else {
                this.handleRecipePrint(list, tcmDiagnosis, '中药')
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            }
        },

        // 处方打印
        handleRecipePrint(list, diagnosis, title) {
            const isShow = this.showPrescriptionAmount == 1
            let totalPrice = 0
            const sign = this.user.electronicSignature
            let signUrl = ''
            if (sign && sign.length > 0) {
                signUrl = this.basic.filePrifix + sign[0].filePath
            }
            // 是否ie
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const dictMap = this.dictMap
            const activeName = this.activeName
            const patient = this.patient
            patient.updateTime = patient.updateTime
                ? patient.updateTime.split(' ')[0]
                : patient.createTime.split(' ')[0]

            let recipes = ''
            let dailySetting = ''
            if (activeName === 'tab2') {
                if (list.length > 0) {
                    recipes += '<ul class="western-medicine">'
                    list.forEach((item, index) => {
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
                        }
                        item.className = item.medicineType === '09' ? 'isLine' : ''
                        var note = ''
                        if (item.note) {
                            note = `<div class="clearfix" style="color:red;text-indent:1em"><span>备注：${
                                item.note
                            }</span></div>`
                        }
                        recipes += `
                        <li>
                            <div class="clearfix">
                                <span style="width:4%;" class="${item.className}">${index +
              1}.</span>
                                <span style="width:94%;" class="${item.className}">${
    item.itemName
}【${item.spec}】 ${item.qty}${item.unit}</span>
                            </div>
                            <div class="clearfix">
                                <span style="width:15%;text-align:center;" class="${
    item.className
}">Sig.</span>
                                <span style="width:83%;" class="${item.className}">每次${
    item.dosage
}${item.dosageUnit}，${formatDictMap(
    dictMap[activeName === 'tab2' ? 144 : 152],
    item.usage
)} ${formatDictMap(dictMap[145], item.frequency)}</span>
                            </div>
                            <div class="${item.className}">${note}</div>
                        </li>
                    `
                    })
                    recipes += '</ul>'
                    recipes += '<div class="slash"></div>'
                }
            } else {
                const tab3Form = this.tab3Form
                if (list.length > 0) {
                    recipes += '<ul class="chinese-medicine">'
                    list.forEach((item, index) => {
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
                        }
                        item.className = item.medicineType === '09' ? 'isLine' : ''
                        recipes += `
                        <li class="${item.className}">
                           <label> ${item.itemName}</label>  &ensp;&ensp;${item.dosage}${
    item.dosageUnit
}
                        </li>
                    `
                    })

                    recipes += '</ul>'
                    recipes += '<div class="slash"></div>'
                    dailySetting = `
                        <div class="daily-setting">
                            <div>剂数：  一剂 </div>
                            <div style="margin-top:10px;">
                                用法用量：
                                配${tab3Form.days}副
                                ${formatDictMap(dictMap[145], tab3Form.frequency)}
                                每次${tab3Form.dose}${formatDictMap(
    dictMap[483],
    tab3Form.doseUnit
)}
                                ${formatDictMap(dictMap[152], tab3Form.usage)}
                            </div>
                        </div>
                    `
                }
            }

            const recipeClass = formatDictMap(
                dictMap[activeName === 'tab2' ? 484 : 485],
                this.recipeClass
            )
            const content = `
                <div class="print recipe">
                    <div class="page">
                        <div class="recipe-class">
                            <span>${recipeClass}</span>
                        </div>
                        <h1>${this.$store.getters.clinic.orgName}</h1>
                        <h2>${title}处方笺</h2>
                        <div class="main">
                            <div class="item info">
                                <div class="w3">
                                    <span><label>门诊/住院号：</label>${
    patient.outpatientNum
}</span>
                                    <span><label>科室/病区：</label>${patient.deptName}</span>
                                    <span><label>就诊类型：</label>${patient.outpatientType}</span>
                                </div>

                                <div class="w3">
                                    <span><label>姓名：</label>${patient.name}</span>
                                    <span><label>性别：</label>${patient.sex}</span>
                                    <span><label>年龄：</label>${patient.age}</span>
                                </div>

                                <div class="w2">
                                    <span><label>开具时间：</label>${patient.updateTime}</span>
                                </div>
                                <div class="w1">
                                    <span><label>临床诊断：</label>${diagnosis}</span>
                                </div>

                            </div>
                            <div class="item list">
                                <h2 class="rp">RP:</h2>${recipes}
                            </div>
                        </div>

                        <div class="footer">${dailySetting}
                            <div class="item info">
                                <div class="w2">
                                    <span><label style="${
    signUrl ? `float:left` : `float:none`
}">医师：</label>${
    signUrl
        ? `<img src="${signUrl}" style="height:45px;width:auto;display:inline-block;float:left;">`
        : patient.doctorName
}</span>
                                    <span style="${
    !isShow ? 'display:none' : 'display:block'
}"><label>金额：</label>${totalPrice}</span>
                                </div>

                                 <div class="w2">
                                    <span><label>药师（审核、核对、发药）：</label>_______________</span>
                                    <span><label>药师/士（调配）：</label>_______________</span>
                                </div>
                            </div>
                            <div style="font-size:14px;margin-top:10px;">
                                <div style="float:left;">
                                    <div style="float:left;width:7%;">特别提示：</div>
                                    <ul style="float:left;width:93%;">
                                        <li style="float:left;width:100%;"> <span>1、</span><span>本处方2日内有效</span></li>
                                        <li style="width:1200px;float:left;padding-top:5px;line-height:22px;">
                                            <span  style="float:left;">2、</span>
                                            <span style="float:left; width:1000px;"> 根据卫生部国家中医药管理局【2011】11号文件规定，除药品质量原因外，药品一经发出，概不退换</span></li>
                                        <li style="float:left;width:100%;padding-top:5px;"> <span> 3、</span>取药时请您当面核对药品名称、规格、数量</li>
                                        <li style="float:left;width:100%;padding-top:5px;"> <span>4、</span>延长处方用量时间原因：慢性病  老年病  外地  其他</li>
                                    </ul>
                                </div>
                            </div>
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
            //   setTimeout(() => {
            window.print()
            // window.location.reload()
            document.body.innerHTML = oldContent
            return false
            //   }, 100)
        },

        // 获取患者信息
        _getPatientInfo() {
            this.getPatientBasic().then(obj => {
                if (this.opType === 'his') {
                    getPatientInfo({
                        patientId: obj.patientId,
                        registerId: obj.regId,
                        detailFlag: 1
                    }).then(res => {
                        if (res.STATUS === '1') {
                            // 路由跳转进入门诊病历
                            this.activeName = 'tab1'
                            const d = res.ITEMS
                            let obj2 = {}
                            let obj3 = {}
                            // let chiefCompliant = ''
                            this.caseId = 0
                            if (d && d.opCase) {
                                const opCase = d.opCase
                                // 病例ID
                                if (d.diagnosisList.length > 0) {
                                    this.caseId = opCase.id
                                    this.$refs.follow[0].handleSearchFollow(this.caseId)
                                }
                                // 主诉
                                // chiefCompliant = opCase.chiefCompliant || ''

                                var temp_bloodPressure = ''
                                var str1 = opCase.sbp ? opCase.sbp : ''
                                var str2 = opCase.dbp ? opCase.dbp : ''
                                if (str1 || str2) {
                                    temp_bloodPressure = str1 + '/' + str2
                                }
                                // 患者信息
                                obj2 = {
                                    id: opCase.id,
                                    caseNum: opCase.caseNum || '',
                                    height: opCase.height,
                                    weight: opCase.weight,
                                    bmi: opCase.bmi,
                                    bodyTemperature: opCase.bodyTemperature,
                                    bodyTpositionName: opCase.bodyTpositionName,
                                    respirationRate: opCase.respirationRate,
                                    pulse: opCase.pulse || '',
                                    isAllergies: opCase.isAllergies || 0,
                                    bloodPressure: temp_bloodPressure,
                                    allergytList: d.allergytList || [],
                                    diagnosisList: d.diagnosisList || [],
                                    createTime: opCase.createTime || '',
                                    booldType: opCase.booldType || '',
                                    booldTypeRh: opCase.booldTypeRh || '',
                                    tcmDiagnosis: opCase.tcmDiagnosis || '' // 中成药诊断
                                }

                                // 过敏史
                                let allergyLineCount = 0
                                const allergytList = []
                                if (d.allergytList.length > 0) {
                                    let temp = null
                                    d.allergytList.forEach(item => {
                                        temp = {
                                            allergyName: item.allergyName || '',
                                            reactionName: item.reactionName || '',
                                            degreeName: item.degreeName || ''
                                        }
                                        allergytList.push(temp)
                                    })
                                    allergyLineCount = d.allergytList.length
                                    this.outpatientData[15].hidden = false
                                }

                                // 中医诊断信息
                                const tcmDiagnosisList = []
                                // 诊断信息
                                const diagnosisList = []
                                if (d.diagnosisList.length > 0) {
                                    d.diagnosisList.forEach(item => {
                                        if (item.diagnosisType !== '中医诊断') {
                                            diagnosisList.push({
                                                diagnosisType: item.diagnosisType,
                                                diseaseCode: item.diseaseCode,
                                                diseaseName: item.diseaseName
                                            })
                                        } else {
                                            tcmDiagnosisList.push({
                                                diagnosisType: item.diagnosisType,
                                                diseaseCode: item.diseaseCode,
                                                diseaseName: item.diseaseName
                                            })
                                        }
                                    })
                                }

                                // 各种史
                                const historyList = []
                                for (const key in this.histroyListMaps) {
                                    if (opCase[this.histroyListMaps[key]]) {
                                        historyList.push(Number(key))
                                        this.outpatientData[Number(key)].hidden = false
                                    }
                                }
                                obj3 = {
                                    allergyLineCount,
                                    allergytList,
                                    attachmentList: d.attachmentList,
                                    diagnosisList,
                                    assistantExamResult: opCase.assistantExamResult,
                                    birth: opCase.birth,
                                    blood: opCase.blood,
                                    bodyTemperature: opCase.bodyTemperature,
                                    bodyTpositionName: opCase.bodyTpositionName,
                                    chiefCompliant: opCase.chiefCompliant || '',
                                    dbp: opCase.dbp,
                                    familyHistory: opCase.familyHistory,
                                    feed: opCase.feed,
                                    historyList,
                                    isAllergies: opCase.isAllergies || 0,
                                    isPlanInoculate: opCase.isPlanInoculate || 1,
                                    morbidity: opCase.morbidity,
                                    operation: opCase.operation,
                                    otherBodyExam: opCase.otherBodyExam,
                                    pastHistory: opCase.pastHistory,
                                    personalHistory: opCase.personalHistory,
                                    presentIllness: opCase.presentIllness,
                                    pulse: opCase.pulse,
                                    respirationRate: opCase.respirationRate,
                                    sbp: opCase.sbp,
                                    treatPlan: opCase.treatPlan,
                                    whereabouts: opCase.whereabouts,
                                    menstrualHistory: opCase.menstrualHistory, // 月经史
                                    diaDogInfect: opCase.diaDogInfect ? opCase.diaDogInfect.split(',') : [], // 传染病。。
                                    medicine: opCase.medicine, // 用药史
                                    healthEducation: opCase.healthEducation, // 健康教育
                                    doctorName: opCase.doctorName,
                                    tcmDiagnosisList
                                }
                            } else {
                                obj2 = {
                                    id: 0,
                                    caseNum: '',
                                    height: '',
                                    weight: '',
                                    bmi: '',
                                    bodyTemperature: '',
                                    bodyTpositionName: '',
                                    respirationRate: '',
                                    pulse: '',
                                    isAllergies: '',
                                    bloodPressure: '',
                                    allergytList: [],
                                    diagnosisList: [],
                                    createTime: '',
                                    booldType: '',
                                    booldTypeRh: '',
                                    tcmDiagnosisList: []
                                }
                                obj3 = {
                                    bodyTemperature: '',
                                    pulse: '',
                                    respirationRate: '',
                                    dbp: '',
                                    sbp: ''
                                }
                                for (const key in this.histroyListMaps) {
                                    this.outpatientData[Number(key)].hidden = true
                                }
                                this.outpatientData[15].hidden = true
                                this.outpatientData[19].opts = []
                            }
                            // this._chiefCompliantChange(chiefCompliant)
                            this.$refs.outpatient[0].initforms(obj3)
                            this.patient = Object.assign(obj2, obj)
                            // this.transferObj3 = Object.assign(obj3)
                            this.transferObj3 = Object.assign(this.$refs.outpatient[0].form, obj3)
                        }
                    })
                } else {
                    const clinic = this.clinic
                    // hx接口路径
                    const apiAddress = this.commonUtil.getConfigValue('transferApiAddress')

                    const orgCode = clinic.orgCode
                    const appId = 'senxiang'
                    const secret = 'sxsecretsx'
                    let hash = ''
                    for (let i = 0; i < 6; i++) {
                        hash += Math.floor(Math.random() * 10)
                    }
                    const sign = MD5(`${appId}${secret}${hash}`)
                    if (this.opType === 'mmt') {
                        this.outPatientUrl = `${apiAddress}/#/medicalHistory?eventId=${
                            obj.appointmentId
                        }&orgCode=${orgCode}&nation=${obj.nation}&occupation=${obj.occupation}&matrialStatus=${
                            obj.matrialStatus
                        }&department=${obj.deptName}`
                        this.transferUrl = `${apiAddress}/#/referralSheet?appId=${appId}&hash=${hash}&sign=${sign}&orgCode=${orgCode}&eventId=${
                            obj.appointmentId
                        }`
                    } else {
                        this.outPatientUrl = `${apiAddress}/#/medicalHistory?eventId=${
                            obj.appointmentId
                        }&orgCode=${orgCode}&nation=${obj.nation}&occupation=${obj.occupation}&matrialStatus=${
                            obj.matrialStatus
                        }&department=${obj.deptName}`
                    }
                    getPatientInfo({
                        patientId: obj.patientId,
                        registerId: obj.regId,
                        detailFlag: 1
                    }).then(res => {
                        if (res.STATUS === '1') {
                            // 路由跳转进入门诊病历
                            this.activeName = 'tab1'
                            const d = res.ITEMS
                            let obj2 = {}
                            this.caseId = 0
                            if (d && d.opCase) {
                                const opCase = d.opCase
                                // 病例ID
                                if (d.diagnosisList.length > 0) {
                                    this.caseId = opCase.id
                                }

                                // // 中医诊断信息
                                // const tcmDiagnosisList = []
                                // // 诊断信息
                                // const diagnosisList = []
                                // if (d.diagnosisList.length > 0) {
                                //     d.diagnosisList.forEach(item => {
                                //         if (item.diagnosisType !== '中医诊断') {
                                //             diagnosisList.push({
                                //                 diagnosisType: item.diagnosisType,
                                //                 diseaseCode: item.diseaseCode,
                                //                 diseaseName: item.diseaseName
                                //             })
                                //         } else {
                                //             tcmDiagnosisList.push({
                                //                 diagnosisType: item.diagnosisType,
                                //                 diseaseCode: item.diseaseCode,
                                //                 diseaseName: item.diseaseName
                                //             })
                                //         }
                                //     })
                                // }

                                var temp_bloodPressure = ''
                                var str1 = opCase.sbp ? opCase.sbp : ''
                                var str2 = opCase.dbp ? opCase.dbp : ''
                                if (str1 || str2) {
                                    temp_bloodPressure = str1 + '/' + str2
                                }
                                // 患者信息
                                obj2 = {
                                    id: opCase.id,
                                    caseNum: opCase.caseNum || '',
                                    height: opCase.height,
                                    weight: opCase.weight,
                                    bmi: opCase.bmi,
                                    bodyTemperature: opCase.bodyTemperature,
                                    bodyTpositionName: opCase.bodyTpositionName,
                                    respirationRate: opCase.respirationRate,
                                    pulse: opCase.pulse || '',
                                    isAllergies: opCase.isAllergies || 0,
                                    bloodPressure: temp_bloodPressure,
                                    allergytList: d.allergytList || [],
                                    diagnosisList: d.diagnosisList || [],
                                    createTime: opCase.createTime || '',
                                    booldType: opCase.booldType || '',
                                    booldTypeRh: opCase.booldTypeRh || ''
                                    // diagnosisList,
                                    // tcmDiagnosisList
                                }
                            } else {
                                obj2 = {
                                    id: 0,
                                    caseNum: '',
                                    height: '',
                                    weight: '',
                                    bmi: '',
                                    bodyTemperature: '',
                                    bodyTpositionName: '',
                                    respirationRate: '',
                                    pulse: '',
                                    isAllergies: '',
                                    bloodPressure: '',
                                    allergytList: [],
                                    diagnosisList: [],
                                    createTime: '',
                                    booldType: '',
                                    booldTypeRh: '',
                                    tcmDiagnosisList: []
                                }
                            }
                            this.patient = Object.assign(obj2, obj)
                        }
                    })
                }
            })
        },

        // 获取基础患者信息
        getPatientBasic() {
            return new Promise((resolve, reject) => {
                const routerParams = this.$route.params
                const patientId = routerParams.patientId
                const regId = routerParams.regId
                getPatientByRegId(regId).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d) {
                            const address = d.address === 'null' ? '' : d.address
                            const obj = {
                                patientId,
                                regId: d.id,
                                isFirstClinic: d.isFirstClinic,
                                avatar: d.headImg
                                    ? this.$store.getters.basic.filePrifix + d.headImg
                                    : paramAvatar(d.sex, d.birthDate),
                                phone: d.phone,
                                name: d.name,
                                nation: formatDictMap(this.dictData[29], d.nation),
                                sex: formatSex(d.sex),
                                age: getBabyAge(d.birthDate),
                                patientStatus: d.patientStatus,
                                matrialStatus: formatDictMap(this.dictData[107], d.matrialStatus), // 婚姻状况
                                clinicCompletedTime: d.clinicCompletedTime || '', // 完成就诊日期
                                deptCode: d.deptCode,
                                deptId: d.deptId,
                                deptName: d.deptName,
                                doctorName: d.doctorName || '',
                                cardNum: d.cardNum || '',
                                outpatientNum: d.outpatientNum || '',
                                outpatientType: d.outpatientType || '',
                                address: formatRegion(d.region) + address,
                                appointmentId: d.appointmentId,
                                birthDate: d.birthDate,
                                idNum: d.idNum,
                                transferId: d.transferId || 0,
                                transferStatus: d.transferStatus,
                                occupation: formatDictMap(this.dictData[20], d.occupation) // 职业
                            }
                            resolve(obj)
                        }
                    } else {
                        reject('error')
                    }
                })
            })
        },

        // 查看药品说明书
        handleDrugDetail(row) {
            getDrugUrl(row.itemId).then(res => {
                if (res.STATUS === '1') {
                    if (res.ITEMS && res.ITEMS.url) {
                        window.open(res.ITEMS.url, '_blank')
                    } else {
                        this.$message.warning('无说明')
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.common-title {
  font-size: 14px;
  margin-bottom: 10px;

  h2 {
    display: inline-block;
    margin-left: 10px;
    font-size: 14px;
  }
}

.footer {
  font-size: 14px;
  text-align: right;

  p {
    line-height: 32px;

    span {
      color: #e6a23c;
    }
  }
}

.tab3-form {
  border: 1px solid #ccc;
  margin-top: 10px;
  padding-top: 15px;
  border-radius: 3px;

  .el-form-item {
    label {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>

<style lang="scss">
.input-with-select {
  > .el-input__inner {
    width: 123px;
  }

  .el-input-group__append {
    background-color: #fff;

    .el-select {
      width: 75px;
    }
  }
}
</style>
