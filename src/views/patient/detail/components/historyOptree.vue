<template>
    <el-row :gutter="20" class="history-op">
        <template v-if="historyList.length > 0">
            <el-col :span="6">
                <history-tree :step-list="historyList" @handleClick="handleClick" />
            </el-col>
            <el-col v-loading="loading" :span="18">
                <el-collapse v-model="collapseVisibleList" class="op_collapse">
                    <el-collapse-item v-for="(item,index) in collapseList" :key="index" :name="item.name">
                        <template slot="title">
                            <span class="slot_title" />{{ item.title }}
                        </template>
                        <template v-if="item.name === 'tab1'||item.name === 'tab2'">
                            <el-row class="line_row">
                                <el-col v-for="(col,colIndex) in item.list" v-if="!col.isHistory||(col.isHistory&&opCase[col.value])" :key="colIndex" :span="col.span||8" class="item">
                                    <span class="item_label">{{ `${col.label}：` }}</span>{{ opCase[col.value] || '' }}
                                </el-col>
                            </el-row>
                        </template>
                        <template v-else-if="item.name === 'tab3'||item.name === 'tab4'">
                            <div v-if="recipeList[item.chara].length > 0" class="switch_list">
                                <span v-for="(s,i) in recipeList[item.chara]" :key="i" :class="{'active':activeList[item.chara] === i}" @click="activeList[item.chara] = i">
                                    {{ `处方${i+1}` }}
                                </span>
                            </div>
                            <el-table :data="recipeList[item.chara][activeList[item.chara]]" :header-row-class-name="'headerName'" style="width: 100%">
                                <el-table-column v-for="(column,columnIndex) in item.columns" :key="columnIndex" :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth" />
                            </el-table>
                            <el-row v-if="item.name === 'tab4'" class="line_row line_useage">
                                {{ recipeList[item.chara][activeList[item.chara]]?recipeList[item.chara][activeList[item.chara]][0].medicineNote:'' }}
                            </el-row>
                            <el-row style="text-align:right;margin:10px 10px 10px 0;">
                                <el-button type="primary" @click="handlePrint(recipeList[item.chara][activeList[item.chara]],item.name)">打印</el-button>
                            </el-row>
                        </template>
                        <template v-else>
                            <el-table :data="recipeList[item.chara]" :header-row-class-name="'headerName'" style="width: 100%">
                                <el-table-column v-for="(column,columnIndex) in item.columns" :key="columnIndex" :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth" />
                            </el-table>
                        </template>
                    </el-collapse-item>
                </el-collapse>
            </el-col>
        </template>
        <template v-else>
            <div class="no-op">
                <h2>暂无历史病历</h2>
            </div>
        </template>
    </el-row>
</template>

<script>
import historyTree from './historyTree'
import { getOpHistory, getOpDetail } from '@/api/outpatient'
import { getDictByIdList } from '@/api/catalog'
import { formatDictMap, formatDate, print } from '@/utils'
import { remove_ie_header_and_footer } from '@/utils/print'
import { toFixed } from '@/utils/float'
import { mapGetters } from 'vuex'
export default {
    components: {
        historyTree
    },
    props: ['patientId', 'printType'],
    data() {
        const dictMap = {
            60: [], // 血型
            125: [], // RH血型
            144: [], // 用法-西药
            145: [], // 给药频率
            152: [], // 用法-中药
            483: [], // 每日剂量单位
            484: [], // 西药/中成药处方类型
            485: [] // 中药处方类型
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
                        dictMap[item.dictId].push({
                            value: item.code,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            dictMap,
            loading: false,
            collapseVisibleList: [],
            historyList: [],
            opCase: {},
            collapseList: [
                {
                    title: '体征信息',
                    name: 'tab1',
                    list: [
                        {
                            label: '体重（KG）',
                            value: 'weight'
                        },
                        {
                            label: '身高（CM）',
                            value: 'height'
                        },
                        {
                            label: 'BMI指数',
                            value: 'bmi'
                        },
                        {
                            label: '血型',
                            value: 'booldStr'
                        },
                        {
                            label: '体温（°C）',
                            value: 'bodyTemperature'
                        },
                        {
                            label: '呼吸（次/分）',
                            value: 'respirationRate'
                        },
                        {
                            label: '心率（次/分）',
                            value: 'pulse'
                        },
                        {
                            label: '血压',
                            value: 'bpStr',
                            span: 16
                        },
                        {
                            label: '其他体格检查',
                            value: 'otherBodyExam',
                            span: 24
                        }
                    ]
                },
                {
                    title: '门诊病历',
                    name: 'tab2',
                    list: [
                        {
                            label: '发病时间',
                            value: 'morbidity',
                            span: 24
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
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '输血史',
                            value: 'blood',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '出生史',
                            value: 'birth',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '喂养史',
                            value: 'feed',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '个人史',
                            value: 'personalHistory',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '家族史',
                            value: 'familyHistory',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '月经史',
                            value: 'menstrualHistory',
                            span: 24,
                            isHistory: true
                        },
                        {
                            label: '是否计划接种',
                            value: 'isPlanInoculate',
                            span: 24
                        },
                        {
                            label: '过敏史',
                            value: 'allergyt',
                            span: 24
                        },
                        {
                            label: '辅助检查结果',
                            value: 'assistantExamResult',
                            span: 24
                        },
                        {
                            label: '西医诊断',
                            value: 'diagnosis',
                            span: 24
                        },
                        {
                            label: '中医诊断',
                            value: 'tcmDiagnosis',
                            span: 24
                        },
                        {
                            label: '用药史',
                            value: 'medicine',
                            span: 24
                        },
                        {
                            label: '健康教育',
                            value: 'healthEducation',
                            span: 24
                        },
                        {
                            label: '诊疗意见',
                            value: 'treatPlan',
                            span: 24
                        },
                        {
                            label: '离院去向',
                            value: 'whereabouts',
                            span: 12
                        },
                        {
                            label: '离院日期',
                            value: 'endDate',
                            span: 12
                        }
                    ]
                },
                {
                    title: '西药/中成药',
                    name: 'tab3',
                    chara: '10',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '药品名称',
                            width: '200px'
                        },
                        {
                            prop: 'spec',
                            label: '规格'
                        },
                        {
                            prop: 'usage',
                            label: '用法'
                        },
                        {
                            prop: 'frequency',
                            label: '频率'
                        },
                        {
                            prop: 'days',
                            label: '天数'
                        },
                        {
                            prop: 'qty',
                            label: '总量'
                        }
                    ]
                },
                {
                    title: '中药',
                    name: 'tab4',
                    chara: '20',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '药品名称',
                            width: '200px'
                        },
                        {
                            prop: 'dosage',
                            label: '剂量'
                        },
                        {
                            prop: 'dosageUnit',
                            label: '单位'
                        },
                        {
                            prop: 'note',
                            label: '特殊要求'
                        }
                    ]
                },
                {
                    title: '检验检查',
                    name: 'tab5',
                    chara: '30',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '名称'
                        },
                        {
                            prop: 'qty',
                            label: '数量'
                        },
                        {
                            prop: 'price',
                            label: '单价（元）'
                        }
                    ]
                },
                {
                    title: '治疗',
                    name: 'tab6',
                    chara: '40',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '名称'
                        },
                        {
                            prop: 'qty',
                            label: '数量'
                        },
                        {
                            prop: 'price',
                            label: '单价（元）'
                        }
                    ]
                },
                {
                    title: '材料',
                    name: 'tab10',
                    chara: '99',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '名称'
                        },
                        {
                            prop: 'qty',
                            label: '数量'
                        },
                        {
                            prop: 'price',
                            label: '单价（元）'
                        }
                    ]
                },
                {
                    title: '其他',
                    name: 'tab7',
                    chara: '50',
                    columns: [
                        {
                            prop: 'itemName',
                            label: '名称'
                        },
                        {
                            prop: 'qty',
                            label: '数量'
                        },
                        {
                            prop: 'price',
                            label: '单价（元）'
                        }
                    ]
                }
            ],
            activeList: {
                '10': 0,
                '20': 0
            },
            recipeList: {
                '10': [],
                '20': [],
                '30': [],
                '40': [],
                '50': [],
                '99': []
            },
            medicineNote: '', // 中药用法备注
            showPrescriptionAmount: this.commonUtil.getConfigValue('showPrescriptionAmount')
        }
    }, // 从随访管理传过来的
    watch: {
        $route(val) {
            if (val.name === 'patientDetail') {
                this._getOpHistory()
            }
        }
    },
    computed: {
        ...mapGetters(['basic', 'user'])
    },
    mounted() {
        this._getOpHistory()
    },
    methods: {
    // 点击历史病历
        handleClick(item) {
            this.loading = true
            getOpDetail(item.id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        const opCase = d.opCase
                        let diagnosis = ''
                        let tcmDiagnosis = ''
                        const tcmDiagnosisList = []
                        const diagnosisList = []
                        if (d.diagnosisList.length > 0) {
                            d.diagnosisList.forEach((item, index) => {
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
                        let allergyt = ''
                        if (d.allergytList.length > 0) {
                            d.allergytList.forEach((a, index) => {
                                allergyt += `${a.allergyName || ''} ${
                                    a.reactionName ? `（${a.reactionName}` : '（'
                                }${a.degreeName ? `${a.degreeName}）` : '）'}`
                            })
                        } else {
                            allergyt = '否认'
                        }

                        const dictMap = this.dictMap

                        const recipeListMap = d.recipeListMap
                        this.opCase = {
                            deptName: opCase.deptName,
                            orgName: opCase.orgName,
                            doctorName: opCase.doctorName,

                            weight: opCase.weight,
                            height: opCase.height,
                            bmi: opCase.bmi,
                            booldStr: `${formatDictMap(dictMap[60], opCase.booldType)}/${formatDictMap(
                                dictMap[125],
                                opCase.booldTypeRh
                            )}`,
                            bodyTemperature: opCase.bodyTemperature,
                            respirationRate: opCase.respirationRate,
                            pulse: opCase.pulse,
                            bpStr: `${opCase.sbp || ''}/${opCase.dbp || ''}mmHg`,
                            otherBodyExam: opCase.otherBodyExam,

                            morbidity: opCase.morbidity ? opCase.morbidity.split(' ')[0] : '',
                            chiefCompliant: opCase.chiefCompliant,
                            presentIllness: opCase.presentIllness,
                            pastHistory: opCase.pastHistory,
                            operation: opCase.operation,
                            blood: opCase.blood,
                            birth: opCase.birth,
                            feed: opCase.feed,
                            personalHistory: opCase.personalHistory,
                            familyHistory: opCase.familyHistory,
                            menstrualHistory: opCase.menstrualHistory,
                            isPlanInoculate: opCase.isPlanInoculate === 1 ? '是' : '否',
                            allergyt,
                            assistantExamResult: opCase.assistantExamResult,
                            diagnosis,
                            medicine: opCase.medicine,
                            healthEducation: opCase.healthEducation,
                            treatPlan: opCase.treatPlan,
                            whereabouts: opCase.whereabouts,
                            endDate: item.endDate,

                            outPatientNum: item.outPatientNum,
                            outpatientType: item.outpatientType,
                            updateTime: opCase.updateTime,
                            createTime: opCase.createTime,
                            tcmDiagnosis
                        }
                        // this.collapseVisibleList = ['tab1', 'tab2']
                        const result = {
                            '10': [],
                            '20': [],
                            '30': [],
                            '40': [],
                            '50': [],
                            '99': []
                        }
                        for (const key in recipeListMap) {
                            if (key === '10' || key === '20') {
                                recipeListMap[key].forEach(item => {
                                    const temp1 = []
                                    const recipe = item.recipe
                                    if (item.detailList.length > 0) {
                                        item.detailList.forEach(detail => {
                                            temp1.push({
                                                amt: detail.amt,
                                                itemName: detail.itemName,
                                                spec: detail.spec,
                                                unit: detail.unit,
                                                usage: formatDictMap(dictMap[key === '10' ? 144 : 152], detail.usage),
                                                frequency: formatDictMap(dictMap[145], detail.frequency),
                                                days: detail.days,
                                                qty: detail.qty,
                                                dosage: detail.dosage,
                                                dosageUnit: detail.dosageUnit,
                                                dose: detail.dose,
                                                doseUnit: formatDictMap(dictMap[483], detail.doseUnit),
                                                note: detail.note,
                                                recipeClass: recipe.recipeClass, // 处方类型
                                                itemType: detail.itemType,
                                                medicineType: detail.medicineType,
                                                medicineNote:
                          key === '20'
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
                                    result[key].push(temp1)
                                })
                            } else {
                                const detailList = recipeListMap[key][0].detailList
                                detailList.forEach(item => {
                                    result[key].push({
                                        itemName: item.itemName,
                                        qty: item.qty,
                                        price: item.price
                                    })
                                })
                            }
                        }
                        this.activeList = {
                            '10': 0,
                            '20': 0
                        }
                        this.recipeList = result
                        this.loading = false
                    }
                }
            })
        },

        // 获取患者历史病历
        _getOpHistory() {
            const patientId = this.$route.params.id || this.patientId // 从随访管理传过来的
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
                            result.push({
                                id: item.caseId,
                                regDate: item.startDate,
                                endDate: item.endDate,
                                doctorName: item.doctorName,
                                orgName: item.orgName,
                                outPatientNum: item.outPatientNum,
                                outpatientType: item.outpatientType
                            })
                        })
                        this.handleClick(result[0])
                    }
                    this.historyList = result
                }
            })
        },
        // 处方打印
        handlePrint(list, activeName) {
            const that = this
            if (activeName === 'tab3') {
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
                        // this.handleRecipePrint(westList, this.opCase.diagnosis, '西药', activeName)
                        // timer += 100
                        let result = []
                        for (var i = 0; i < westList.length; i += 5) {
                            result = westList.slice(i, i + 5)
                            this.handleRecipePrint(result, this.opCase.diagnosis, '西药', activeName)
                            timer += 100
                        }
                    }
                    if (chineseWestList && chineseWestList.length > 0) {
                        num = 1
                        setTimeout(() => {
                            // this.handleRecipePrint(chineseWestList, this.opCase.tcmDiagnosis, '中成药', activeName)
                            // setTimeout(() => {
                            //     window.location.reload()
                            // }, 100)
                            let result = []
                            for (var i = 0; i < chineseWestList.length; i += 5) {
                                result = chineseWestList.slice(i, i + 5)
                                this.handleRecipePrint(result, this.opCase.tcmDiagnosis, '中成药', activeName)
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
                    // this.handleRecipePrint(list, this.opCase.diagnosis, '西药', activeName)
                    // setTimeout(() => {
                    //     window.location.reload()
                    // }, 100)
                    let result = []
                    for (var i = 0; i < list.length; i += 5) {
                        result = list.slice(i, i + 5)
                        this.handleRecipePrint(result, this.opCase.diagnosis, '西药', activeName)
                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }
                }
            } else {
                this.handleRecipePrint(list, this.opCase.tcmDiagnosis, '中药', activeName)
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            }
        },
        // 打印处方
        handleRecipePrint(list, diagnosis, title, activeName) {
            const isShow = this.showPrescriptionAmount == 1
            const sign = this.user.electronicSignature
            let signUrl = ''
            if (sign && sign.length > 0) {
                signUrl = this.basic.filePrifix + sign[0].filePath
            }
            // 是否ie
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            let totalPrice = 0
            const dictMap = this.dictMap
            const opCase = this.opCase
            const obj = {
                outpatientNum: opCase.outPatientNum,
                outpatientType: opCase.outpatientType,
                deptName: opCase.deptName,
                doctorName: opCase.doctorName,
                updateTime: opCase.updateTime
                    ? opCase.updateTime.split(' ')[0]
                    : (opCase.createTime?opCase.createTime.split(' ')[0]:'')
            }
            const vuexPatient = this.$store.getters.patient
            const patient = Object.assign(obj, vuexPatient)
            let recipes = ''
            let dailySetting = ''
            let recipeClass = ''
            if (list && list.length > 0) {
                const first = list[0]
                if (activeName === 'tab3') {
                    recipes += '<ul class="western-medicine">'
                    list.forEach((item, index) => {
                        item.className = item.medicineType === '09' ? 'isLine' : ''
                        var note = ''
                        if (item.note) {
                            note = `<div class="clearfix" style="color:red;text-indent:1em"><span>备注：${
                                item.note
                            }</span></div>`
                        }
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
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
}${item.dosageUnit}，${item.usage} ${item.frequency}</span>
                            </div>
                            <div class="${item.className}">${note}</div>
                        </li>
                    `
                    })
                    recipes += '</ul>'
                    recipes += '<div class="slash">/</div>'
                } else {
                    recipes += '<ul class="chinese-medicine">'
                    list.forEach((item, index) => {
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
                        }
                        item.className = item.medicineType === '09' ? 'isLine' : ''
                        recipes += `<li class="${item.className}">
                           <label> ${item.itemName}</label>  &ensp;&ensp;${item.dosage || ''}${
    item.dosageUnit
}
                        </li>`
                    })
                    recipes += '</ul>'
                    recipes += '<div class="slash">/</div>'
                    dailySetting = `
                        <div class="daily-setting">
                            <div>剂数：  一剂 </div>
                            <div style="margin-top:10px;">
                                用法用量：
                                配${first.days}副
                                ${first.frequency}
                                每次${first.dose || ''}${first.doseUnit}
                                ${first.usage}
                            </div>
                        </div>
                    `
                }
                recipeClass = formatDictMap(dictMap[activeName === 'tab3' ? 484 : 485], first.recipeClass)
            } else {
                recipeClass = activeName === 'tab3' ? '儿科' : '中药'
            }
            // <span><label>开具时间：</label>${formatDate()}</span>
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
    this.printType !== 'follow' && signUrl
        ? `float:left`
        : `float:none`
}">医师：</label>${
    this.printType !== 'follow' && signUrl
        ? `<img src="${signUrl}" style="height:40px;width:auto;display:inline-block;float:left;">`
        : patient.doctorName
}</span>
                                    <span style="${
    !isShow ? 'display:none' : 'display:block'
}"><label>金额：</label>${toFixed(totalPrice, 2)}</span>
                                </div>
                                 <div class="w2">
                                    <span><label>药师（审核、核对、发药）：</label>_________</span>
                                    <span><label>药师/士（调配）：</label>_________</span>
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

            // setTimeout(() => {
            window.print()
            // window.location.reload()
            document.body.innerHTML = oldContent
            return false
            // }, 100)
        }
    }
}
</script>

<style lang="scss">
$borderColor: #ccc;
$activeColor: #409eff;
.history-op {
  .no-op {
    margin-left: 17px;
    h2 {
      font-size: 16px;
      padding: 5px 0;
    }
  }
}
.op_collapse {
  border: 1px solid $borderColor;
  border-bottom: none;
  .el-collapse-item__header {
    border-bottom-color: $borderColor;
    &.is-active {
      border-bottom-color: $borderColor;
    }
  }
  .el-collapse-item__wrap {
    border-bottom-color: $borderColor;
    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
  .slot_title {
    display: inline-block;
    width: 5px;
    height: 16px;
    background-color: $activeColor;
    vertical-align: middle;
    margin-right: 10px;
    margin-left: 10px;
  }
  .line_row {
    &.line_useage {
      padding-left: 30px;
    }
    line-height: 36px;
    .item {
      &:not(:last-child) {
        border-bottom: 1px solid $borderColor;
      }
      padding: 0 15px 0 30px;
    }
  }
  .switch_list {
    padding-top: 5px;
    padding-left: 25px;
    padding-bottom: 5px;
    span {
      display: inline-block;
      height: 28px;
      line-height: 28px;
      color: #333;
      background-color: #ccc;
      border-radius: 15px;
      padding: 0 20px;
      margin-right: 15px;
      cursor: pointer;
      &.active {
        color: #fff;
        background-color: $activeColor;
      }
    }
  }
  .headerName {
    th {
      color: #586276;
      background-color: #eef5fd;
    }
  }
}
</style>

