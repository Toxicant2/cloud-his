<template>
    <el-row class="page-main">
        <el-row v-loading="allLoading" :gutter="20">
            <el-col :sm="24" :md="4" class="drugDetail">
                <div v-if="isCurrentDay">
                    <div v-if="isQueueNum" class="queueBtn">
                        <el-button @click="handleQueueChange(1)">过号</el-button>
                        <el-button @click="handleQueueChange(2)">重新叫号</el-button>
                        <el-button @click="handleQueueChange(3)">下一位</el-button>
                    </div>
                    <div v-else style="overflow:hidden;margin-left:10px;">
                        <el-button type="primary" style="padding:9px 20px;float:left" @click="handleChange(0)">上一位</el-button>
                        <el-button type="primary" style="padding:9px 20px;float:right" @click="handleChange(1)">下一位</el-button>
                    </div>
                    <p style="border-bottom:1px solid #e7e7e7;margin-top:8px" />
                </div>

                <patient-card :patient="patient" :panel-ellist="patientElList" :name-can-click="true" style="margin-top:15px;" @panelNameClick="historyOutPatient" />
                <dialog-form ref="diagnosisForm" :count-line="12" :form-data="diagnosisFormData" :form-edit="patient" width="800px" title="个人信息完善" @handleConfirm="handleConfirm" />
            </el-col>
            <el-col :sm="24" :md="20">
                <el-row class="tabs-right">
                    <el-button v-if="activeName==='tab1' && opType !== 'his'" type="primary" @click="handleSync">同步病历信息</el-button>
                    <!-- <el-button type="primary" @click="handleEndOutpatient">完成就诊</el-button> -->
                    <el-button :type="revisitingStatus===1?'warning':'primary'" @click="handleNeedReturnVisit">{{ revisitingStatus===1?'取消回诊':'需回诊' }}</el-button>
                    <el-button @click="handleBack">返回</el-button>
                </el-row>
                <el-tabs v-model="activeName" :before-leave="beforeLeave" type="border-card" @tab-click="handleSwitch">
                    <el-tab-pane v-for="(tab,index) in tabMapOpts" v-if="!tab.isHidden && (tab.key !== 'tab7' || (tab.key === 'tab7' && caseId && opType === 'mmt' ))" :key="index" :name="tab.key" :label="tab.label">
                        <template v-if="tab.key === 'tab1'">
                            <!-- <iframe src="http://drugs.dxy.cn/drug/150049.htm" frameborder="0" style="width:100%;height:500px;" target="_blank"></iframe> -->
                            <iframe v-if="opType !== 'his' && opSwitch" ref="hxOpCase" :src="outPatientUrl" width="100%" height="850px" frameborder="0" scrolling="auto" />
                            <el-row v-else-if="opType === 'his'" :gutter="20">
                                <el-col :span="18">
                                    <outpatient-form ref="outpatient" :forms="outpatientData" :patient="patient" :label-width="'120px'" @chiefCompliantChange="_chiefCompliantChange" @handleConfirm="outpatientConfirm" @freshCache="handleFreshCache" />
                                </el-col>
                                <el-col :span="6">
                                    <diagnosis ref="diagnosis" @handleDiagnosisClick="handleDiagnosisClick" />
                                </el-col>
                            </el-row>
                        </template>
                        <template v-else-if="tab.key === 'tab7'">
                            <iframe :src="transferUrl" width="100%" height="850px" frameborder="0" scrolling="auto" />
                        </template>
                        <template v-else-if="tab.key === 'tab8'">
                            <follow ref="follow" :case-id="caseId" :dict-map="dictMap" :patient="patient" @getFollowList="getFollowList" />
                        </template>
                        <template v-else-if="tab.key === 'tab9'">
                            <transfer v-if="activeName === 'tab9'" ref="transfer" :patient="patient" :case-id="caseId" @transferIdChange="transferIdChange" @getCacheTransferData="getCacheTransferData" />
                        </template>
                        <template v-else>
                            <el-row v-loading="panelLoading">
                                <template v-if="tab.key=== 'tab2' || tab.key=== 'tab3'">
                                    <el-row class="common-title">
                                        <el-button :disabled="!caseId" icon="el-icon-plus" type="primary" @click="addTab">新增处方</el-button>
                                        <h2>过敏史：
                                            <template v-if="patient.isAllergies === 1">
                                                <span v-for="(a,aI) in patient.allergytList" :key="aI">{{ a.allergyName||'' }} {{ a.reactionName?`（${a.reactionName}`:'（' }}{{ a.degreeName?`${a.degreeName}）`:'）' }}</span>
                                            </template>
                                            <span v-else>否认</span>
                                        </h2>
                                        <el-button :disabled="!caseId" class="fr" @click="handleChooseTpl">选择模板</el-button>
                                        <el-button :disabled="!caseId" class="fr" style="margin-right:10px;" @click="handleChooseDrug">历史用药</el-button>
                                    </el-row>
                                    <el-row class="tabs-right">
                                        <el-select v-model="recipeClass" :disabled="auditStatusFlag && Boolean(recipeAuditMessage)" placeholder="请选择处方类型">
                                            <el-option v-for="(opt,optIndex) in recipeClassList[tab.key]" :key="optIndex" :label="opt.label" :value="opt.value">
                                                <span style="float: left">{{ opt.label }}</span>
                                                <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                            </el-option>
                                        </el-select>
                                    </el-row>
                                    <el-tabs v-model="tab2Active" type="card" class="recipe-tabs" @tab-remove="removeTab" @tab-click="handleTab2Switch">
                                        <!-- 审核状态 -->
                                        <recipe-status v-if="isAudit && recipeAuditMessage && recipeAuditMessage.checkedStatus> -1 && tab2List[0].detailList.length>0>0" :audit-message="recipeAuditMessage" @handleEmit="getRecipeStatus" />
                                        <!-- 处方列表 -->

                                        <el-tab-pane v-for="(item, index) in tab2List" :key="index" :closable="!item.isRefund && !item.isCharged &&!item.isApplyRefund" :disabled="!caseId" :label="`${!item.isCharged?'':'【收费】'}${!item.isRefund?'':'【作废】'}${!item.isApplyRefund?'':'【申请退药】'}处方${index+1}`" :name="item.name">
                                            <!-- ({{!caseId}}|| {{auditStatusFlag }}) && {{recipeAuditMessage != null}} -->
                                            <complex-tab v-if="!isApplyRefund" :key="`${tab.key}_tab`" :columns="tab2Map[tab.key].columns" :add-columns="tab2Map[tab.key].addColumns" :table-data="item.detailList" :params="{insurance, pageSize:20,chara:tab2Map[tab.key].chara, placeholder:tab2Map[tab.key].placeholder , style:{width:'580px'}}" :disabled="!caseId || (auditStatusFlag && recipeAuditMessage != null)" :is-show="(!item.isCharged && !auditStatusFlag &&!item.isApplyRefund) || recipeAuditMessage==null" @addItem="addItem" />
                                            <!-- 申请退药 -->
                                            <template v-if="isApplyRefund">
                                                <el-table-self ref="multipleTable" :tab-type="'selection'" :columns="tab2Map[tab.key].refundColumns" :table-data="item.detailList" :selec-table="handleSelecTable" style="margin-top:20px;" type="number" @blurCell="changeNum" @selectChange="handleSelectChange" @selectAll="handleSelectAll" />
                                                <p style="margin:10px 0;font-size:15px">退费合计：{{ refundAmt }}</p>
                                                <el-button type="primary" @click="handleRefundDrug">退药</el-button>
                                            </template>
                                            <el-button v-if="refundProcess && refundProcess !== '1' && !isApplyRefund && item.isCharged" :disabled="!caseId" :style="tab.key=== 'tab2'?'margin-top:20px;position:fixed;z-index:3':'margin-top:157px;position:fixed;z-index:3'" @click="handleRefund">申请退药</el-button>
                                        </el-tab-pane>
                                    </el-tabs>
                                    <el-form v-if="tab.key=== 'tab3' && !isApplyRefund" v-model="tab3Form" :disabled="auditStatusFlag && Boolean(recipeAuditMessage)" inline label-width="95px">
                                        <el-row class="tab3-form">
                                            <template v-for="(item,index) in tab3FormData" v-if="!item.hidden">
                                                <el-col :key="item.field" :span="item.spanCount?item.spanCount:8">
                                                    <el-form-item :key="index" :label="`${item.name}：`" :label-width="item.labelWidth" :prop="item.field" :class="item.className" :rules="item.rules" style="height:33px;">
                                                        <span v-if="!item.name" slot="label" />
                                                        <!-- 输入框 -->
                                                        <el-input v-if="item.type === 'input'" v-model="tab3Form[item.field]" :type="item.inputType?item.inputType:''" :placeholder="item.placeholder" :resize="item.resize" :maxlength="item.maxlength" @input="item.func?item.func($event):{}">
                                                            <span v-if="item.unit" :slot="item.slot?item.slot:'append'">{{ item.unit }}</span>
                                                        </el-input>

                                                        <!-- 数字输入 -->
                                                        <el-input-number v-if="item.type === 'number'" v-model="tab3Form[item.field]" :controls="false" :precision="item.precision" :min="item.min" :max="item.max" @change="item.func?item.func($event):{}" />

                                                        <!-- 选择器 -->
                                                        <el-select v-else-if="item.type === 'select'" v-model="tab3Form[item.field]" placeholder="请选择" @change="item.func?item.func($event):{}">
                                                            <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                                                <span style="float: left">{{ opt.label }}</span>
                                                                <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                                            </el-option>
                                                        </el-select>

                                                        <!-- 输入+选择 -->
                                                        <el-input v-else-if="item.type === 'input-select'" v-model="tab3Form[item.field]" placeholder="请输入" class="input-with-select">
                                                            <el-select slot="append" v-model="tab3Form[item.field2]" placeholder="请选择">
                                                                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                                                    <span style="float: left">{{ opt.label }}</span>
                                                                    <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
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
                                    <complex-tab :key="`${tab.key}_tab`" :columns="tab2Map[tab.key].columns" :add-columns="tab2Map[tab.key].addColumns" :table-data="tab4Obj.detailList" :params="{pageSize:20, chara:tab2Map[tab.key].chara, placeholder:tab2Map[tab.key].placeholder , style:{width:'530px'}}" :disabled="tab.key=== 'tab4'?false:!caseId" @addItem="addItem" />
                                </template>
                                <el-row v-if="tab.key!=='tab7' && !isApplyRefund" class="footer">
                                    <!-- <el-input v-model="remark" v-if="!isCharged && !isApplyRefunded && recipeAuditMessage && recipeAuditMessage.checkedStatus === 2" placeholder="请输入备注" style="width:580px;float:left;margin-top:20px" :rows="1" type="textarea" :autosize="{minRows:1,maxRows:3}"></el-input> -->
                                    <p>
                                        <span>合计总金额：</span>
                                        ￥{{ totalPrice }}
                                    </p>

                                    <el-button :disabled="tab.key=== 'tab4'?false:!caseId" @click="handleSaveTpl">存储为模板</el-button>

                                    <el-button v-if="(tab.key === 'tab2' || tab.key === 'tab3') && (( saveTxt !== '保存' && saveTxt !== '提交审核') || (saveTxt === '保存' && isShowPrint)) || isCharged || isApplyRefunded" :disabled="!caseId" type="primary" @click="handlePrint">打印</el-button>
                                    <el-button v-if="!isCharged && !isApplyRefunded" :disabled="tab.key=== 'tab4'?false:!caseId" :loading="recipeLoading" type="primary" @click="handleSave">{{ saveTxt }}</el-button>
                                </el-row>
                                <dialog-form ref="recipeTpl" :label-width="'120px'" :width="'450px'" :form-data="tplData" :form-edit="tplEdit" title="存储处方模板" @handleConfirm="handleTplConfirm" />
                                <!-- 处方模板 -->
                                <recipe-tpl ref="recipeTplModel" @repReference="repReference" />
                                <!-- 历史用药 -->
                                <medical-history ref="medicalHisModel" @medReference="medReference" />
                                <!-- 药品说明书 -->
                                <el-dialog ref="drugDialog" :append-to-body="true" :visible.sync="drugVisible" center title="药品说明书" width="100%">
                                    <el-row v-loading="dialogLoading">
                                        <!-- <iframe :src="drugDialogSrc" frameborder="0" style="width:100%;height:500px;" ></iframe> -->
                                        <!-- <iframe src="http://drugs.dxy.cn/drug/150049.htm" frameborder="0" style="width:100%;height:500px;" target="_blank"></iframe> -->
                                    </el-row>
                                </el-dialog>
                            </el-row>
                        </template>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import {
    getDictByIdList,
    getDiseaseDetailById,
    getDrugUrl
} from '@/api/catalog'
import {
    getPatientByRegId,
    updatePatientStatus,
    getNextLastPatient,
    offlineBespeakHX,
    saveMissSort,
    getNextSort,
    callSn,
    setRevisitingStatus
} from '@/api/arclinic'
import {
    getPatientInfo,
    saveOutPatient,
    cancleOpdrrecipeAudit,
    saveOpdrrecipe,
    getOpdrrecipeListMix,
    deleteOpdrrecipe,
    deleteOpdrrecipeDetail,
    saveOpdrrecipeTpl,
    refundDrug
} from '@/api/outpatient'

import patientCard from '@/components/Panel/PatientCard'
import complexTab from '@/components/TabComponents/complex'
import outpatientForm from './components/outpatient'
import diagnosis from './components/diagnosis'
import recipeStatus from './components/recipeStatus'
import follow from './components/follow'
import transfer from './components/transfer'
import recipeTpl from './components/recipeTpl'
import medicalHistory from './components/medicalHistory'
import dialogForm from '@/components/DialogComponents/Form'
import elTableSelf from '@/components/TabComponents/index'
import perfectInfo from './mixin/perfectInfo'
import count from './mixin/count'
import { mapGetters } from 'vuex'
import MD5 from '@/utils/MD5'

import {
    getBabyAge,
    formatSex,
    disabledPickerOpts,
    paramAvatar,
    formatDate,
    formatRegion,
    deepClone,
    compareJson,
    formatDictMap
} from '@/utils'
import { multiply, divide, toFixed } from '@/utils/float'
import { remove_ie_header_and_footer } from '@/utils/print'
import { setTimeout } from 'timers'
export default {
    components: {
        follow,
        transfer,
        patientCard,
        outpatientForm,
        diagnosis,
        recipeStatus,
        recipeTpl,
        complexTab,
        dialogForm,
        elTableSelf,
        medicalHistory
    },
    mixins: [perfectInfo, count],
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
            145: [], // 给药频次
            152: [], // 用法-中药
            146: [], // 取药方式,
            483: [], // 每日剂量单位
            484: [], // 西药/中成药处方类型
            485: [], // 中药处方类型
            490: [], // 离院去向
            492: [], // 随访方式
            493: [] // 随访类型
        }
        const frequencyList = []
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
                        if (
                            (item.dictId > 137 && item.dictId < 141) ||
                            item.dictId === 490
                        ) {
                            // 138,139,140
                            dictMap[item.dictId].push({
                                value: item.name,
                                label: item.name
                            })
                        } else {
                            dictMap[item.dictId].push({
                                value: item.code,
                                label: item.name
                            })
                            if (item.dictId === 145) {
                                frequencyList.push({
                                    code: item.code,
                                    calc: this.formatterFrequency(item.note)
                                })
                            }
                        }
                    })
                }
            }
        })
        return {
            // 定向用户类型
            insurance: {
                insuranceCode: 0,
                insuranceName: ''
            },
            recipeAuditMessage: null,
            treatmentFlag: false,
            opType: 'mmt',
            outPatientUrl: '',
            transferUrl: '',
            dictMap,
            // dictData,
            frequencyList,
            caseId: 0,
            totalPrice: 0,
            panelLoading: false,
            recipeLoading: false,
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
                    label: '转诊',
                    key: 'tab7'
                },
                {
                    label: '随访',
                    key: 'tab8'
                }
                // {
                //     label: '转诊单',
                //     key: 'tab9'
                // }
            ],
            tab2Active: 'recipe1',
            tab2Map: {
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
                                return `${row.itemName}${
                                    row.spec ? `（${row.spec}）` : ''
                                }`
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
                            width: '100px',
                            func: this.frequencyChangeNew
                        },
                        {
                            type: 'number',
                            value: 'days',
                            label: '天数',
                            min: 1,
                            precision: 0,
                            width: '90px',
                            func: this.daysChangeNew
                        },
                        {
                            type: 'input',
                            value: 'qty',
                            label: '总量',
                            maxlength: 3,
                            minWidth: '200px',
                            // unit: 'unit',
                            appendType: 'select',
                            selectValue: 'isTinyRecipe',
                            selectFunc: this.unitChange,
                            func: this.totalCountChange,
                            formatterDisabled(row) {
                                return !!row.id
                            }
                        },
                        {
                            type: 'input',
                            value: 'returnQty',
                            label: '申请退药数量',
                            maxlength: 3,
                            minWidth: '180px',
                            unit: 'unit',
                            hidden: true
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                            batchPopover: true,
                            value: 'qty',
                            label: '总库存',
                            width: '100'
                        }
                        // {
                        //     value: 'validDate',
                        //     label: '效期',
                        //     width: '100',
                        //     formatter(row) {
                        //         return row.validDate ? row.validDate.split(' ')[0] : ''
                        //     }
                        // }
                    ],
                    refundColumns: [
                        {
                            value: 'groupSn',
                            label: '组号',
                            maxlength: 2,
                            width: '65px'
                        },
                        {
                            label: '药品名称',
                            minWidth: '250px',
                            formatter(row) {
                                return `${row.itemName}${
                                    row.spec ? `（${row.spec}）` : ''
                                }`
                            },
                            style: { color: '#409EFF' }
                        },
                        {
                            value: 'dosage',
                            label: '单次剂量',
                            minWidth: '180px',
                            unit: 'dosageUnit',
                            func: this.dosageUnitChangeNew
                        },
                        {
                            value: 'usage',
                            label: '用法',
                            width: '120px',
                            formatter(row) {
                                return formatDictMap(dictMap[144], row.usage)
                            }
                        },
                        {
                            value: 'frequency',
                            label: '频率',
                            width: '100px',
                            func: this.frequencyChangeNew,
                            formatter(row) {
                                return formatDictMap(
                                    dictMap[145],
                                    row.frequency
                                )
                            }
                        },
                        {
                            value: 'days',
                            label: '天数',
                            min: 1,
                            precision: 0,
                            width: '90px'
                        },
                        {
                            value: 'qty',
                            label: '总量',
                            maxlength: 3,
                            minWidth: '180px',
                            unit: 'unit'
                        },
                        {
                            value: 'refundNum',
                            label: '退药数量',
                            align: 'center',
                            operType: 'input',
                            type: 'refund',
                            disabled: false
                        },
                        {
                            value: 'price',
                            label: '单价',
                            width: '80px'
                        },
                        {
                            value: 'refundAccount',
                            label: '退药金额',
                            align: 'center'
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
                                return `${row.itemName}${
                                    row.spec ? `（${row.spec}）` : ''
                                }`
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
                            type: 'input',
                            value: 'returnQty',
                            label: '申请退药数量',
                            maxlength: 3,
                            minWidth: '180px',
                            unit: 'unit',
                            hidden: true
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                            batchPopover: true,
                            value: 'qty',
                            label: '总库存',
                            width: '100'
                        }
                        // {
                        //     value: 'validDate',
                        //     label: '效期',
                        //     width: '100',
                        //     formatter(row) {
                        //         return row.validDate ? row.validDate.split(' ')[0] : ''
                        //     }
                        // }
                    ],
                    refundColumns: [
                        {
                            type: 'spans',
                            label: '药品名称',
                            minWidth: '250px',
                            formatter(row) {
                                return `${row.itemName}${
                                    row.spec ? `（${row.spec}）` : ''
                                }`
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
                            value: 'refundNum',
                            label: '退药数量',
                            align: 'center',
                            operType: 'input',
                            type: 'refund',
                            disabled: false
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                // 材料
                tab10: {
                    chara: 50,
                    placeholder: '新增材料',
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
                            value: 'spec',
                            label: '规格',
                            width: '120px'
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
                        },
                        {
                            type: 'button',
                            label: '操作',
                            width: '135px',
                            func: this.deleteRow,
                            btnType: 'danger',
                            icon: 'el-icon-delete',
                            text: '删除',
                            fixed: 'right'
                        }
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
                            width: '100'
                        },
                        {
                            value: 'spec',
                            label: '规格',
                            width: '100'
                        },
                        {
                            value: 'qty',
                            label: '库存',
                            width: '100'
                        }
                    ]
                }
            },
            tab2List: [],
            cacheTab2List: [],
            tab4Obj: {},
            cacheTab4Obj: {},
            tab3Form: {
                usage: '152',
                days: 1,
                dose: 1,
                doseUnit: '01',
                frequency: '200001',
                medicineType: '01',
                footNote: ''
            },
            cacheTab3Form: {
                usage: '152',
                days: 1,
                dose: 1,
                doseUnit: '01',
                frequency: '200001',
                medicineType: '01',
                footNote: ''
            },
            tab3FormData: [
                {
                    type: 'select',
                    field: 'usage',
                    name: '用法',
                    opts: dictMap[152]
                    // rules: [
                    //     { required: true, message: '用法不可为空', trigger: 'blur' }
                    // ]
                },
                {
                    type: 'input-select',
                    name: '每日剂量',
                    field: 'dose',
                    field2: 'doseUnit',
                    // rules: [
                    //     { required: true, message: '每日剂量不可为空', trigger: 'blur' },
                    //     { pattern: /^(0|([1-9]?\d{1,3}(\.\d{0,2})?)|10000)$/, message: '每日剂量不可超过10000且最多保留2位小数', trigger: 'blur' }
                    // ],
                    opts: dictMap[483]
                },
                {
                    type: 'number',
                    field: 'days',
                    min: 1,
                    max: 100,
                    name: '总剂数',
                    func: this.daysInputChange,
                    precision: 0
                },
                {
                    type: 'select',
                    field: 'frequency',
                    name: '频次',
                    opts: dictMap[145]
                    // rules: [
                    //     { required: true, message: '频次不可为空', trigger: 'blur' }
                    // ]
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
            cachePatient: {}, // 判断是否改变病历信息
            cacheFollowList: [], // 判断是否改变随访
            patientElList: {
                btnList: [
                    {
                        name: '历史病例',
                        func: this.historyOutPatient
                    },
                    {
                        name: '完善信息',
                        func: this.perfectOutpatient
                    }
                ],
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
                10: 'familyHistory',
                11: 'menstrualHistory'
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
                    autosize: { minRows: 2, maxRows: 4 },
                    rules: [
                        {
                            required: true,
                            message: '主诉必填',
                            trigger: 'change'
                        }
                    ],
                    opts1: dictMap[137],
                    opts2: [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9',
                        '10'
                    ],
                    opts3: [
                        '早晨',
                        '中午',
                        '晚上',
                        '分钟',
                        '小时',
                        '天',
                        '周',
                        '月',
                        '年'
                    ]
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '现病史',
                    field: 'presentIllness',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
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
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '月经史',
                    field: 'menstrualHistory',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 },
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
                    rules: [{ required: true, message: '过敏史必选' }],
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
                    name: '中医辨证',
                    field: 'chinsesMedicineDialectical'
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '用药史',
                    field: 'medicine',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '健康教育',
                    field: 'healthEducation',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '诊疗意见',
                    field: 'treatPlan',
                    maxlength: 250,
                    autosize: { minRows: 1, maxRows: 4 }
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
            auditStatusFlag: false,
            isAudit: false, // 诊所审核（诊所是否有审核资格）
            isRefund: false, // 已作废
            isCharged: false, // 已收费
            recipeClass: '',
            defaultRecipeClass: '', // 默认处方类型
            recipeClassList: {
                tab2: dictMap[484],
                tab3: dictMap[485]
            },
            // 处方模板
            tplData: [
                {
                    type: 'radio',
                    name: '病历模板类型',
                    field: 'templateType',
                    opts: [
                        {
                            value: 1,
                            label: '个人'
                        },
                        {
                            value: 0,
                            label: '科室'
                        }
                    ]
                },
                {
                    type: 'input',
                    name: '病历模板名称',
                    field: 'templateName',
                    rules: [
                        {
                            required: true,
                            message: '病历模板名称不可为空',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            tplEdit: null,
            //   routerParams: JSON.parse(this.$route.params.routerParams),
            isCurrentDay: this.$route.params.isCurrentDay,
            isCurrentPatient: true,
            nextLastPatient: {},
            allLoading: false,
            opSwitch: true, // 上一位下一位时使iframe刷新
            transferObj3: {},
            cacheTransferData: {},
            //   isRefund1:false,
            refundProcess: this.commonUtil.getConfigValue('refundProcess'),
            isApplyRefund: false, // 判断是否显示申请退药
            isApplyRefunded: false, // 是否为申请退药处方
            // remark: '', // 未通过备注
            recipeStatus: '',
            isShowPrint: true,
            drugVisible: false,
            dialogLoading: false,
            drugDialogSrc: '',
            isQueueNum: this.commonUtil.getConfigValue('isUseFunction') === '1',
            revisitingStatus: 0, // 患者需回诊状态
            showPrescriptionAmount: this.commonUtil.getConfigValue(
                'showPrescriptionAmount'
            ),
            isExecute: true,
            hasSave: false
        }
    },
    // watch: {
    //     $route() {
    //         if (this.$route.name === 'outpatientDetail') {
    //             this.opType = this.$route.params.type
    //             // if (this.commonUtil.getConfigValue('transferType') !== '1') {
    //             //     this.tabMapOpts[9].isHidden = false
    //             // } else {
    //             //     this.tabMapOpts[9].isHidden = true
    //             // }
    //             this._getPatientInfo()
    //         }
    //     }
    // },
    computed: {
        ...mapGetters(['dictData', 'clinic', 'basic', 'user']),
        // 保存按钮
        saveTxt() {
            const activeName = this.activeName
            if (activeName === 'tab2' || activeName === 'tab3') {
                const auditStatus = this.recipeAuditMessage
                    ? this.recipeAuditMessage.checkedStatus
                    : -1

                const auditTxt =
                    auditStatus > -1
                        ? auditStatus === 0
                            ? '取消审核'
                            : '修改'
                        : this.isRefund
                            ? '审核为新处方'
                            : '提交审核'

                return this.isAudit
                    ? auditTxt
                    : this.isRefund
                        ? '另存为新处方'
                        : '保存'
            } else {
                return '保存'
            }
        }
    },
    activated() {
        if (!this.$route.query.tabClick) {
            this.opType = this.$route.params.type
            this._getPatientInfo()
        }
    },
    mounted() {
        this.opType = this.$route.params.type
        // if (this.commonUtil.getConfigValue('transferType') !== '1') {
        //     this.tabMapOpts[9].isHidden = false
        // } else {
        //     this.tabMapOpts[9].isHidden = true
        // }
        this._getPatientInfo()
    },
    methods: {
        // 获得随访记录
        getFollowList() {
            this.cacheFollowList = deepClone(this.$refs.follow[0].followList)
        },
        // 切换一级pane
        handleSwitch(tab) {
            if (!this.isExecute) {
                return
            }
            this.handleCallback()
        },

        handleCallback() {
            const activeName = this.activeName
            this.isCharged = false
            this.isApplyRefund = false
            this.isRefund = false
            if (activeName === 'tab8') {
                this.$refs.follow[0].handleSearchFollow()
                return
            }
            if (activeName === 'tab9') {
                this.$nextTick(() => {
                    if (!this.patient.transferId) {
                        this.$refs.transfer[0].$refs.medicalRecordForm.initCaseInfo(
                            this.transferObj3
                        ) // 转诊单病历信息
                    }
                })
                return
            }
            if (activeName === 'tab1') {
                this._getPatientInfo()
                return
            }
            if (activeName === 'tab7') {
                return
            }
            if (!this.caseId) {
                this.totalPrice = 0
                if (activeName === 'tab2' || activeName === 'tab3') {
                    this.recipeClass =
                        this.activeName === 'tab2'
                            ? this.defaultRecipeClass
                            : '01'
                    this.tab2List = [
                        {
                            name: 'recipe1',
                            recipe: {
                                id: 0
                            },
                            detailList: []
                        }
                    ]
                    this.cacheTab2List = deepClone(this.tab2List)
                } else {
                    this.tab4Obj = {
                        recipe: {
                            id: 0
                        },
                        detailList: []
                    }
                    this.cacheTab4Obj = deepClone(this.tab4Obj)
                }

                return
            }
            if (activeName === 'tab3') {
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

            this.panelLoading = true
            if (this.caseId > 0) {
                this.getDetails(activeName)
            }
        },
        // 获取详情
        getDetails(activeName) {
            const params = {
                caseId: this.caseId,
                recipeChara: this.tab2Map[activeName].chara
            }
            getOpdrrecipeListMix(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    // 已退费（作废）
                    const refundList = d.refundList || []
                    // 已收费
                    const chargeList = d.chargeList || []
                    // 未收费
                    const unchargeList = d.unchargeList || []
                    const applyRefundList = d.applyRefundList || []
                    let result = []
                    let total = 0

                    if (activeName === 'tab2' || activeName === 'tab3') {
                        this.tab2Active = 'recipe1'
                        let recipeIndex = 0
                        let recipeIndex2 = 0
                        let recipeIndex3 = 0
                        if (
                            unchargeList.length > 0 ||
                            chargeList.length > 0 ||
                            refundList.length > 0 ||
                            applyRefundList.length > 0
                        ) {
                            // 作废
                            refundList.forEach((item, index) => {
                                recipeIndex++
                                const recipe = item.recipe
                                if (index == 0) {
                                    this.auditStatusFlag =
                                        recipe && recipe.checkedStatus == 0
                                }
                                const detailList = item.detailList
                                if (detailList.length > 0) {
                                    detailList.forEach(de => {
                                        de.id = 0
                                        const unitOpts = [
                                            {
                                                value: 0,
                                                label: de.specUnit
                                            }
                                        ]
                                        if (de.isTiny === 1) {
                                            unitOpts.push({
                                                value: 1,
                                                label: de.specUseUnit
                                            })
                                        }
                                        de.opts = unitOpts
                                    })
                                }
                                result.push({
                                    name: `recipe${index + 1}`,
                                    recipe: {
                                        recipeClass:
                                            recipe.recipeClass ||
                                            (activeName === 'tab2'
                                                ? this.defaultRecipeClass
                                                : '01'),
                                        id: 0,
                                        checkedStatus: recipe.checkedStatus,
                                        checkedUserName: recipe.checkedUserName,
                                        checkedNote: recipe.checkedNote,
                                        createTime: recipe.createTime
                                    },
                                    isRefund: true,
                                    detailList,
                                    isShowPrint: true
                                })
                                if (index === 0 && detailList.length > 0) {
                                    detailList.forEach(de => {
                                        // total += Number(de.amt ? toFixed(de.amt, 2) : 0)
                                        total = toFixed(
                                            Number(total) +
                                                Number(de.amt ? de.amt : 0),
                                            2
                                        )
                                        de.refundNum = 0
                                        de.refundAccount = 0
                                    })
                                    this.recipeClass =
                                        recipe.recipeClass ||
                                        (activeName === 'tab2'
                                            ? this.defaultRecipeClass
                                            : '01')
                                    this.isRefund = true
                                }
                            })

                            // 已收费
                            chargeList.forEach((item, index) => {
                                recipeIndex2++
                                const recipe = item.recipe
                                if (index == 0) {
                                    this.auditStatusFlag =
                                        recipe && recipe.checkedStatus == 0
                                }
                                if (
                                    recipeIndex === 0 &&
                                    index === 0 &&
                                    item.detailList.length > 0
                                ) {
                                    item.detailList.forEach(de => {
                                        // total += Number(de.amt ? toFixed(de.amt, 2) : 0)
                                        total = toFixed(
                                            Number(total) +
                                                Number(de.amt ? de.amt : 0),
                                            2
                                        )
                                        de.refundNum = 0
                                        de.refundAccount = 0
                                    })
                                    this.recipeClass =
                                        recipe.recipeClass ||
                                        (activeName === 'tab2'
                                            ? this.defaultRecipeClass
                                            : '01')
                                    this.isCharged = true
                                }
                                const detailList = item.detailList
                                if (detailList.length > 0) {
                                    detailList.forEach(de => {
                                        const unitOpts = [
                                            {
                                                value: 0,
                                                label: de.specUnit
                                            }
                                        ]
                                        if (de.isTiny === 1) {
                                            unitOpts.push({
                                                value: 1,
                                                label: de.specUseUnit
                                            })
                                        }
                                        de.opts = unitOpts
                                        // de.refundNum = 0
                                        // de.refundAccount = 0
                                    })
                                }
                                result.push({
                                    name: `recipe${recipeIndex + index + 1}`,
                                    recipe: {
                                        recipeClass:
                                            recipe.recipeClass ||
                                            (activeName === 'tab2'
                                                ? this.defaultRecipeClass
                                                : '01'),
                                        id: 0,
                                        checkedStatus: recipe.checkedStatus,
                                        checkedUserName: recipe.checkedUserName,
                                        checkedNote: recipe.checkedNote,
                                        createTime: recipe.createTime
                                    },
                                    isCharged: true,
                                    detailList,
                                    isShowPrint: true
                                })
                            })

                            // 申请退药
                            if (
                                this.refundProcess &&
                                this.refundProcess !== '1'
                            ) {
                                applyRefundList.forEach((item, index) => {
                                    recipeIndex3++
                                    const recipe = item.recipe
                                    if (index == 0) {
                                        this.auditStatusFlag =
                                            recipe && recipe.checkedStatus == 0
                                    }
                                    const detailList = item.detailList
                                    detailList.forEach(item => {
                                        item.returnQty = item.returnQty || 0
                                    })
                                    result.push({
                                        name: `recipe${recipeIndex2 +
                                            recipeIndex +
                                            index +
                                            1}`,
                                        recipe: {
                                            recipeClass:
                                                recipe.recipeClass ||
                                                (activeName === 'tab2'
                                                    ? this.defaultRecipeClass
                                                    : '01'),
                                            id: 0,
                                            checkedStatus: recipe.checkedStatus,
                                            checkedUserName:
                                                recipe.checkedUserName,
                                            checkedNote: recipe.checkedNote,
                                            createTime: recipe.createTime
                                        },
                                        isApplyRefund: true,
                                        detailList,
                                        isShowPrint: true
                                    })
                                    if (
                                        recipeIndex2 === 0 &&
                                        recipeIndex === 0 &&
                                        index === 0 &&
                                        detailList.length > 0
                                    ) {
                                        detailList.forEach(de => {
                                            // total += Number(de.amt ? toFixed(de.amt, 2) : 0)
                                            total = toFixed(
                                                Number(total) +
                                                    Number(de.amt ? de.amt : 0),
                                                2
                                            )
                                        })
                                        this.recipeClass =
                                            recipe.recipeClass ||
                                            (activeName === 'tab2'
                                                ? this.defaultRecipeClass
                                                : '01')
                                        this.isApplyRefunded = true
                                        this.tab2Map[
                                            'tab2'
                                        ].columns[7].hidden = false
                                    }
                                })
                            }

                            // 未收费
                            unchargeList.forEach((item, index) => {
                                const recipe = item.recipe
                                if (index == 0) {
                                    this.auditStatusFlag =
                                        recipe && recipe.checkedStatus == 0
                                }
                                const detailList = item.detailList
                                if (detailList.length > 0) {
                                    detailList.forEach(de => {
                                        const unitOpts = [
                                            {
                                                value: 0,
                                                label: de.specUnit
                                            }
                                        ]
                                        if (de.isTiny === 1) {
                                            unitOpts.push({
                                                value: 1,
                                                label: de.specUseUnit
                                            })
                                        }
                                        de.opts = unitOpts
                                    })
                                }
                                result.push({
                                    name: `recipe${recipeIndex3 +
                                        recipeIndex +
                                        recipeIndex2 +
                                        index +
                                        1}`,
                                    recipe: {
                                        recipeClass:
                                            recipe.recipeClass ||
                                            (activeName === 'tab2'
                                                ? this.defaultRecipeClass
                                                : '01'),
                                        id: recipe.id,
                                        checkedStatus: recipe.checkedStatus,
                                        checkedUserName: recipe.checkedUserName,
                                        checkedNote: recipe.checkedNote,
                                        createTime: recipe.createTime
                                    },
                                    detailList,
                                    isShowPrint: true
                                })
                                if (
                                    recipeIndex3 === 0 &&
                                    recipeIndex === 0 &&
                                    recipeIndex2 === 0 &&
                                    index === 0 &&
                                    detailList.length > 0
                                ) {
                                    detailList.forEach(de => {
                                        // total += Number(de.amt ? toFixed(de.amt, 2) : 0)
                                        total = toFixed(
                                            Number(total) +
                                                Number(de.amt ? de.amt : 0),
                                            2
                                        )
                                        de.refundNum = 0
                                        de.refundAccount = 0
                                    })
                                    this.recipeClass =
                                        recipe.recipeClass ||
                                        (activeName === 'tab2'
                                            ? this.defaultRecipeClass
                                            : '01')
                                    this.isRefund = false
                                }
                            })
                            if (activeName === 'tab3') {
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

                                    this.cacheTab3Form = deepClone(
                                        this.tab3Form
                                    )
                                }
                            }
                        } else {
                            this.auditStatusFlag = false
                            result.push({
                                name: 'recipe1',
                                recipe: {
                                    id: 0
                                },
                                detailList: []
                            })
                            this.recipeClass =
                                activeName === 'tab2'
                                    ? this.defaultRecipeClass
                                    : '01'
                        }
                        this.tab2List = deepClone(result)
                        // 判断是否变动
                        this.cacheTab2List = deepClone(result)
                        // && result[0].recipe.id
                        if (this.isAudit && !this.isRefund) {
                            const temp_first_recipe = result[0].recipe
                            this.recipeAuditMessage = {
                                checkedStatus: temp_first_recipe.checkedStatus,
                                checkedUserName:
                                    temp_first_recipe.checkedUserName,
                                checkedNote: temp_first_recipe.checkedNote
                            }
                        } else {
                            this.recipeAuditMessage = null
                        }
                    } else {
                        if (unchargeList.length > 0) {
                            const detailList = unchargeList[0].detailList
                            result = {
                                recipe: {
                                    id: unchargeList[0].recipe.id
                                },
                                detailList
                            }
                            if (detailList.length > 0) {
                                detailList.forEach(de => {
                                    // total += Number(de.amt ? toFixed(de.amt, 2) : 0)
                                    total = toFixed(
                                        Number(total) +
                                            Number(de.amt ? de.amt : 0),
                                        2
                                    )
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
                        // 判断检验检查是否变动
                        this.cacheTab4Obj = deepClone(result)
                    }
                    this.panelLoading = false
                    this.totalPrice = toFixed(total, 2)
                }
            })
        },

        // 切换二级pane
        handleTab2Switch(tab) {
            this.isApplyRefund = false
            this.tab2Map['tab2'].columns[7].hidden = true

            // 2019-05-21 注释掉 显示出总价
            // this.tab2Map['tab3'].columns[4].hidden = true
            let total = 0
            if (tab.label.indexOf('申请退药') > -1) {
                this.tab2Map['tab2'].columns[7].hidden = false
                this.tab2Map['tab3'].columns[4].hidden = false
            }
            this.tab2List.forEach(item => {
                if (item.name === this.tab2Active) {
                    if (item.isShowPrint) {
                        this.isShowPrint = true
                    } else {
                        this.isShowPrint = false
                    }
                    const detailList = item.detailList
                    const recipe = item.recipe
                    let data = null
                    if (detailList.length > 0) {
                        detailList.forEach(de => {
                            total = toFixed(
                                Number(total) + Number(de.amt ? de.amt : 0),
                                2
                            )
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
                    this.recipeClass =
                        recipe && recipe.recipeClass
                            ? recipe.recipeClass
                            : this.activeName === 'tab2'
                                ? this.defaultRecipeClass
                                : '01'
                    this.isRefund = item.isRefund || false
                    this.isCharged = item.isCharged || false
                    this.isApplyRefunded = item.isApplyRefund || false
                    // && recipe.id
                    if (this.isAudit && !this.isRefund) {
                        this.recipeAuditMessage = {
                            checkedStatus: recipe.checkedStatus,
                            checkedUserName: recipe.checkedUserName,
                            checkedNote: recipe.checkedNote
                        }
                        this.auditStatusFlag = recipe.checkedStatus == 0
                    } else {
                        this.recipeAuditMessage = null
                    }
                }
            })
            this.totalPrice = toFixed(total, 2)
        },

        // 历史病例
        historyOutPatient() {
            const patient = this.patient
            this.$router.push({
                name: 'patientDetail',
                params: {
                    id: patient.patientId,
                    registerId: patient.regId
                }
            })
        },

        // 处方打印
        handleRecipePrint(list, diagnosis, title) {
            let totalPrice = 0
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
                        var note = ''
                        item.className =
                            item.medicineType === '09' ? 'isLine' : ''
                        if (item.note) {
                            note = `<div class="clearfix" style="color:red;text-indent:1em"><span>备注：${item.note}</span></div>`
                        }
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(
                                Number(totalPrice) + Number(item.amt),
                                2
                            )
                        }
                        recipes += `
                        <li>
                            <div class="clearfix">
                                <span style="width:4%;" class="${
    item.className
}">${index + 1}.</span>
                                <span style="width:94%;" class="${
    item.className
}">${item.itemName}【${item.spec}】 ${
    item.qty
}${item.unit}</span>
                            </div>
                            <div class="clearfix">
                                <span style="width:15%;text-align:center;" class="${
    item.className
}">Sig.</span>
                                <span style="width:83%;" class="${
    item.className
}">每次${item.dosage}${
    item.dosageUnit
}，${formatDictMap(
    dictMap[activeName === 'tab2' ? 144 : 152],
    item.usage
)} ${formatDictMap(dictMap[145], item.frequency)}</span>
                            </div>
                            <div class="${item.className}">${note}</div>
                        </li>
                    `
                    })
                    recipes += '</ul>'
                    recipes += '<div class="slash">/</div>'
                }
            } else {
                const tab3Form = this.tab3Form
                if (list.length > 0) {
                    recipes += '<ul class="chinese-medicine">'
                    list.forEach((item, index) => {
                        if (item.medicineType !== '09') {
                            totalPrice = toFixed(
                                Number(totalPrice) + Number(item.amt),
                                2
                            )
                        }
                        item.className =
                            item.medicineType === '09' ? 'isLine' : ''
                        recipes += `
                        <li class="${item.className}">
                           <label > ${
    item.itemName
}</label>  &ensp;&ensp;${item.dosage || ''}${
    item.dosageUnit
}
                        </li>
                    `
                    })
                    recipes += '</ul>'
                    recipes += '<div class="slash">/</div>'
                    dailySetting = `
                        <div class="daily-setting">
                            <div >剂数：  一剂 </div>
                            <div style="margin-top:10px;" >
                                用法用量：
                                配${tab3Form.days}副
                                ${formatDictMap(
        dictMap[145],
        tab3Form.frequency
    )}
                                每次${tab3Form.dose || ''}${formatDictMap(
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
                                    <span><label>科室/病区：</label>${
    patient.deptName
}</span>
                                    <span><label>就诊类型：</label>${
    patient.outpatientType
}</span>
                                </div>
                                <div class="w3">
                                    <span><label>姓名：</label>${
    patient.name
}</span>
                                    <span><label>性别：</label>${
    patient.sex
}</span>
                                    <span><label>年龄：</label>${
    patient.age
}</span>
                                </div>
                                <div class="w2">
                                    <span><label>开具时间：</label>${
    patient.updateTime
}</span>
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
        ? `<img src="${signUrl}" style="height:40px;width:auto;display:inline-block;float:left;">`
        : patient.doctorName
}</span>
                                    <span style="${
    !isShow
        ? 'display:none'
        : 'display:block'
}"><label>金额：</label>${totalPrice}</span>
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
            document.body.innerHTML = oldContent
            return false
            // }, 100)
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
                    createTime =
                        recipe && recipe.createTime
                            ? recipe.createTime.split(' ')[0]
                            : formatDate()
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
                // 是否区分中西药处方
                if (
                    that.commonUtil.getConfigValue('isSeparateCWRecipe') === '1'
                ) {
                    if (westList && westList.length > 0) {
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
                            let result = []
                            for (
                                var i = 0;
                                i < chineseWestList.length;
                                i += 5
                            ) {
                                result = chineseWestList.slice(i, i + 5)
                                that.handleRecipePrint(
                                    result,
                                    tcmDiagnosis,
                                    '中成药'
                                )
                                setTimeout(() => {
                                    window.location.reload()
                                }, 100)
                            }
                            // this.handleRecipePrint(chineseWestList, tcmDiagnosis, '中成药')
                            // setTimeout(() => {
                            //     window.location.reload()
                            // }, 100)
                        }, timer)
                    }
                    if (num === 0) {
                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }
                } else {
                    let result = []
                    for (var i = 0; i < list.length; i += 5) {
                        result = list.slice(i, i + 5)
                        that.handleRecipePrint(result, diagnosis, '西药')
                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }
                    // this.handleRecipePrint(list, diagnosis, '西药')
                    // setTimeout(() => {
                    //     window.location.reload()
                    // }, 100)
                }
            } else {
                this.handleRecipePrint(list, tcmDiagnosis, '中药')
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            }
        },

        // 添加药品、检查项目
        addItem(row, type) {
            const activeName = this.activeName
            const isMedicine = activeName === 'tab2' || activeName === 'tab3' // 是否药品
            // const _price = type === 'history' ? row.price : row.isStock === 1 ? row.retailPrice : row.price
            const unitOpts = [
                {
                    value: 0,
                    label: row.specUnit
                }
            ]
            if (row.isTiny === 1) {
                unitOpts.push({
                    value: 1,
                    label: row.specUseUnit
                })
            }
            // 拆零默认小单位
            const _price2 = row.isTiny === 1 ? row.tinyPrice : row.price
            const obj = {
                itemName: row.name, // ------------ 前端用药品名
                amt: row.amt || _price2, // 金额
                days: row.days || isMedicine ? 1 : '', // 天数
                dosage: row.specDose || (isMedicine ? 1 : ''), // 用量
                dosageUnit: row.specDoseUnit || '', // 用量单位dict
                dose: row.dose || '', // 每次剂量
                doseUnit: row.specDoseUnit || '', // 剂量单位dict
                footNote: '', // 脚注
                frequency: row.useFrequency || (isMedicine ? '200001' : ''), // 频率（药品默认qd-一天一次）
                groupSn: '', // 组号
                id: 0,
                itemId: row.id, // 项目内码

                medicineType: row.medicineType || (isMedicine ? '01' : ''), // 取药方式（默认本院）
                note: row.note || '',
                price: _price2, // 单价
                qty: row.recQty || 1, // 总量
                recipeId: 0, // 处方id
                spec: row.spec || '', // 规格（接口不需要只做前端显示，获取的时候会存在。）
                // recipeSn: '', // 方号
                // skinTest: '', // 皮试(0,1)
                // sn:'', // 序号
                unit: row.unit || '', // 单位
                usage: row.userMethod || (isMedicine ? '100000' : ''), // 用法（药品默认口服）
                specDose: row.specDose || (isMedicine ? 1 : ''), // 剂量（默认1）
                itemType: row.catType,
                itemCode: row.code,
                chargeItemId: row.sysCatId,
                specDispUseRatio: row.specDispUseRatio,
                isTiny: row.isTiny,
                isTinyRecipe:
                    activeName === 'tab2' ? (row.isTiny === 1 ? 1 : 0) : 1,
                opts: unitOpts,

                oldPrice: row.price, // 原销售价
                tinyPrice: row.tinyPrice // 拆零零售价
            }

            let total = 0
            if (isMedicine) {
                this.tab2List.forEach((tab, index) => {
                    if (tab.name === this.tab2Active) {
                        let flag = false
                        this.tab2List[index].detailList.forEach(d => {
                            // total += Number(d.amt ? d.amt : 0)
                            total = toFixed(
                                Number(total) + Number(d.amt ? d.amt : 0),
                                2
                            )
                            if (d.itemId === obj.itemId) {
                                flag = true
                            }
                        })
                        if (flag) {
                            this.$message.error(
                                '处方中已存在的药品，无需重复添加'
                            )
                        } else {
                            if (activeName === 'tab2') {
                                if (
                                    this.tab2List[index].detailList.length > 0
                                ) {
                                    obj.groupSn = this.tab2List[
                                        index
                                    ].detailList[
                                        this.tab2List[index].detailList.length -
                                            1
                                    ].groupSn
                                } else {
                                    obj.groupSn = 1
                                }
                            }
                            // total += Number(obj.amt ? obj.amt : 0)

                            total = toFixed(
                                Number(total) + Number(obj.amt ? obj.amt : 0),
                                2
                            )
                            this.tab2List[index].detailList.push(obj)
                        }
                    }
                })
            } else {
                const list = this.tab4Obj.detailList
                if (list.length > 0) {
                    let flag = false
                    list.forEach((tab, index) => {
                        // total += Number(tab.amt ? tab.amt : 0)
                        total = toFixed(
                            Number(total) + Number(tab.amt ? tab.amt : 0),
                            2
                        )
                        if (tab.itemId === obj.itemId) {
                            flag = true
                        }
                    })
                    if (flag) {
                        this.$message.error(
                            `已存在${obj.itemName}，无需重复添加`
                        )
                    } else {
                        // total += Number(obj.amt ? obj.amt : 0)
                        total = toFixed(
                            Number(total) + Number(obj.amt ? obj.amt : 0),
                            2
                        )
                        list.push(obj)
                    }
                } else {
                    // total += Number(obj.amt ? obj.amt : 0)
                    total = toFixed(
                        Number(total) + Number(obj.amt ? obj.amt : 0),
                        2
                    )
                    list.push(obj)
                }
                this.tab4Obj.detailList = list
            }
            this.totalPrice = toFixed(total, 2)
        },

        // 新增处方
        addTab() {
            this.isShowPrint = false
            this.tab2Map['tab2'].columns[7].hidden = true
            this.auditStatusFlag = false

            if (this.tab2List.length > 9) {
                this.$message.error('处方加太多了哦')
                return
            }
            this.recipeClass =
                this.activeName === 'tab2' ? this.defaultRecipeClass : '01'
            this.totalPrice = '0.00'
            const name = `recipe${this.tab2List.length + 1}`
            this.tab2List.push({
                name,
                recipe: {
                    id: 0
                },
                detailList: []
            })
            this.tab2Active = name
            this.isApplyRefund = false
            this.isCharged = false
            this.isApplyRefunded = false
            this.isRefund = false
            this.recipeAuditMessage = null
            if (this.activeName === 'tab3') {
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
        },

        // 移除处方
        removeTab(targetName) {
            this.$confirm(
                `是否确认删除处方${targetName.match(/[\d]+/)}？`,
                '提示',
                {
                    type: 'warning'
                }
            )
                .then(() => {
                    const temparr = []
                    const tab2List = this.tab2List
                    if (tab2List.length < 2) {
                        this.$message.error('留个处方吧')
                        return
                    }
                    let activeName = this.tab2Active
                    tab2List.forEach(item => {
                        temparr.push(item.name)
                    })
                    tab2List.forEach((tab, index) => {
                        if (tab.name === targetName) {
                            if (tab.recipe && tab.recipe.id) {
                                deleteOpdrrecipe(tab.recipe.id).then(res => {
                                    if (res.STATUS === '1') {
                                        this.$message.success('处方删除成功')
                                        this.cacheTab2List = deepClone(
                                            this.tab2List
                                        )
                                    }
                                })
                            }

                            if (activeName === targetName) {
                                const nextTab =
                                    tab2List.length > index + 1
                                        ? tab2List[index]
                                        : tab2List[index - 1]
                                if (nextTab) {
                                    activeName = nextTab.name
                                }
                            } else {
                                const index1 = temparr.indexOf(activeName)
                                const nextTab =
                                    index1 < index
                                        ? tab2List[index1] ||
                                          tab2List[index1 - 1]
                                        : tab2List[index1] ||
                                          tab2List[index1 + 1]
                                this.$nextTick(() => {
                                    if (nextTab) {
                                        activeName = nextTab.name
                                    }
                                })
                            }
                        }
                    })
                    this.$nextTick(() => {
                        this.tab2Active = activeName
                    })

                    let total = 0
                    this.tab2List.forEach(item => {
                        if (item.name === activeName) {
                            const detailList = item.detailList
                            const recipe = item.recipe
                            let data = null
                            if (detailList.length > 0) {
                                detailList.forEach(de => {
                                    // total += Number(de.amt ? de.amt : 0)
                                    total = toFixed(
                                        Number(total) +
                                            Number(de.amt ? de.amt : 0),
                                        2
                                    )
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
                            this.recipeClass =
                                recipe && recipe.recipeClass
                                    ? recipe.recipeClass
                                    : this.activeName === 'tab2'
                                        ? this.defaultRecipeClass
                                        : '01'
                            this.isRefund = item.isRefund || false
                            this.isCharged = item.isCharged || false
                            // && recipe.id
                            if (this.isAudit && !this.isRefund) {
                                this.recipeAuditMessage = {
                                    checkedStatus: recipe.checkedStatus,
                                    checkedUserName: recipe.checkedUserName,
                                    checkedNote: recipe.checkedNote
                                }
                                this.auditStatusFlag =
                                    recipe.checkedStatus == 0
                            } else {
                                this.recipeAuditMessage = null
                            }
                        }
                    })
                    this.totalPrice = toFixed(total, 2)
                    this.tab2List = tab2List.filter(
                        tab => tab.name !== targetName
                    )
                    this.tab2List.forEach((item, index) => {
                        item.name = `recipe${index + 1}`
                    })
                })
                .catch(() => {})
        },

        // 删除行
        deleteRow(row) {
            const activeName = this.activeName
            if (activeName === 'tab2' || activeName === 'tab3') {
                this.tab2List.forEach((tab, index) => {
                    if (tab.name === this.tab2Active) {
                        this.tab2List[index].detailList.forEach((d, dIndex) => {
                            if (d.itemId === row.itemId) {
                                if (row.id) {
                                    deleteOpdrrecipeDetail(row.id).then(res => {
                                        if (res.STATUS === '1') {
                                            this.tab2List[
                                                index
                                            ].detailList.splice(dIndex, 1)
                                            if (this.tab2List.length == 0) {
                                                this.tab2List[
                                                    index
                                                ].recipe = {}
                                            }
                                            this.$message.success('删除成功')
                                            this.cacheTab2List = deepClone(
                                                this.tab2List
                                            )
                                        }
                                    })
                                } else {
                                    this.tab2List[index].detailList.splice(
                                        dIndex,
                                        1
                                    )
                                }
                                this.totalPrice = toFixed(
                                    toFixed(this.totalPrice, 2) -
                                        toFixed(row.amt, 2),
                                    2
                                )
                            }
                        })
                    }
                })
            } else {
                this.tab4Obj.detailList.forEach((tab, index) => {
                    if (tab.itemId === row.itemId) {
                        if (row.id) {
                            deleteOpdrrecipeDetail(row.id).then(res => {
                                if (res.STATUS === '1') {
                                    this.tab4Obj.detailList.splice(index, 1)
                                    this.$message.success('删除成功')
                                    this.cacheTab4Obj = deepClone(this.tab4Obj)
                                }
                            })
                        } else {
                            this.tab4Obj.detailList.splice(index, 1)
                        }
                        this.totalPrice = toFixed(
                            toFixed(this.totalPrice, 2) - toFixed(row.amt, 2),
                            2
                        )
                    }
                })
            }
        },

        // 单位变化
        unitChange(val, row) {
            row.price = val === 1 ? row.tinyPrice : row.oldPrice
            const temp = toFixed(row.amt, 2)
            row.amt = toFixed(row.price * row.qty, 4)
            this.totalPrice = toFixed(this.totalPrice + (row.amt - temp), 2)
        },

        // 数量变化（非药品）
        totalCountChange(val, row) {
            let total = 0
            const activeName = this.activeName
            if (activeName === 'tab2') {
                this.tab2List.forEach((tab, index) => {
                    if (tab.name === this.tab2Active) {
                        this.tab2List[index].detailList.forEach((d, dIndex) => {
                            if (d.itemId === row.itemId) {
                                d.amt = val ? (d.price * val).toFixed(4) : 0
                            }
                            // total += Number(d.amt ? d.amt : 0)
                            total = toFixed(
                                Number(total) + Number(d.amt ? d.amt : 0),
                                2
                            )
                        })
                    }
                })
            } else {
                this.tab4Obj.detailList.forEach(d => {
                    if (d.itemId === row.itemId) {
                        d.amt = val ? (d.price * val).toFixed(4) : 0
                    }
                    // total += Number(d.amt ? d.amt : 0)
                    total = toFixed(
                        Number(total) + Number(d.amt ? d.amt : 0),
                        2
                    )
                })
            }
            this.totalPrice = toFixed(total, 2)
        },

        // 中药-总剂数变化
        daysInputChange(val) {
            let total = 0
            this.tab2List.forEach((tab, index) => {
                if (tab.name === this.tab2Active) {
                    this.tab2List[index].detailList.forEach(d => {
                        d.qty = d.dosage
                            ? val
                                ? Number(d.dosage) * val
                                : 0
                            : 0
                        d.amt = (d.price * d.qty).toFixed(4)
                        // total += Number(d.amt ? d.amt : 0)
                        total = toFixed(
                            Number(total) + Number(d.amt ? d.amt : 0),
                            2
                        )
                    })
                }
            })
            this.totalPrice = toFixed(total, 2)
        },

        // 中药-剂量变化
        doseInputChange(val, row) {
            let total = 0
            this.tab2List.forEach((tab, index) => {
                if (tab.name === this.tab2Active) {
                    this.tab2List[index].detailList.forEach((d, dIndex) => {
                        if (d.itemId === row.itemId) {
                            const days = this.tab3Form.days
                            d.qty = days ? (val ? Number(days) * val : 0) : 0
                            d.amt = (d.price * d.qty).toFixed(4)
                        }
                        // total += Number(d.amt ? d.amt : 0)
                        total = toFixed(
                            Number(total) + Number(d.amt ? d.amt : 0),
                            2
                        )
                    })
                }
            })
            this.totalPrice = toFixed(total, 2)
        },

        // 西药-根据频次计算每日用量
        formatterFrequency(str) {
            if (!str) return 1
            let num = 0
            if (str.indexOf('/') > -1) {
                const arr = str.split('/')
                num = Number(arr[0]) / Number(arr[1])
            } else {
                num = Number(str)
            }
            if (isNaN(num)) return 1
            return num
        },

        // 西药-单次剂量，频率，天数，获取总量
        getTotal(a, b, c, row) {
            let total = 0
            if (isNaN(a)) return false
            if (!b) return false
            if (isNaN(c)) return false
            let frequencyCalc = 0
            this.frequencyList.forEach(item => {
                if (item.code === b) {
                    frequencyCalc = item.calc
                }
            })
            this.tab2List.forEach((tab, index) => {
                if (tab.name === this.tab2Active) {
                    this.tab2List[index].detailList.forEach((d, dIndex) => {
                        if (d.itemId === row.itemId) {
                            if (row.isTiny === 1) {
                                d.qty = Math.ceil(
                                    divide(
                                        multiply(multiply(a, frequencyCalc), c),
                                        row.specDose
                                    )
                                )
                            } else {
                                d.qty = Math.ceil(
                                    divide(
                                        divide(
                                            multiply(
                                                multiply(a, frequencyCalc),
                                                c
                                            ),
                                            row.specDose
                                        ),
                                        row.specDispUseRatio
                                    )
                                )
                            }
                            d.amt = d.qty ? (d.price * d.qty).toFixed(4) : 0
                        }
                        // total += Number(d.amt ? d.amt : 0)
                        total = toFixed(
                            Number(total) + Number(d.amt ? d.amt : 0),
                            2
                        )
                    })
                }
            })
            this.totalPrice = toFixed(total, 2)
        },

        // 西药-单次剂量变化
        dosageUnitChangeNew(val, row) {
            const frequency = row.frequency
            const days = row.days
            this.getTotal(val, frequency, days, row)
        },

        // 西药-频率变化
        frequencyChangeNew(val, row) {
            const dosage = row.dosage
            const days = row.days
            this.getTotal(dosage, val, days, row)
        },

        // 西药-天数变化
        daysChangeNew(val, row) {
            const dosage = row.dosage
            const frequency = row.frequency
            this.getTotal(dosage, frequency, val, row)
        },

        // 保存处方
        handleSave(type, oldTab) {
            this.hasSave = false
            const isRefund = this.isRefund
            const activeName = oldTab || this.activeName
            let param = {}
            const PATIENT_INFO = this.patient
            let temp = {}
            /*
             * 保存类型
             * 普通保存-1，审核保存1，取消审核2
             */
            let checkStatus = -1
            if (activeName === 'tab2' || activeName === 'tab3') {
                const activeIndex =
                    Number(this.tab2Active.replace('recipe', '')) - 1
                temp = this.tab2List[activeIndex]
                const recipeId = temp.recipe ? temp.recipe.id || 0 : 0
                if (this.isAudit) {
                    if (recipeId) {
                        const auditStatus = this.recipeAuditMessage
                            ? this.recipeAuditMessage.checkedStatus
                            : -1
                        checkStatus = auditStatus === 0 ? 2 : 1
                    } else {
                        checkStatus = 1
                    }
                }
            } else {
                temp = this.tab4Obj
            }
            if (temp.detailList.length === 0) {
                this.$message.error('不可开空处方哦')
                if (type === 'change') {
                    this.handleCallback()
                }

                return false
            }
            if (checkStatus === 2) {
                cancleOpdrrecipeAudit(temp.recipe.id).then(res => {
                    if (res.STATUS === '1') {
                        this.recipeAuditMessage = null
                        this.tab2List.forEach(item => {
                            if (item.name === this.tab2Active) {
                                item.recipe = {
                                    id: item.recipe.id,
                                    recipeClass: item.recipe.recipeClass
                                }
                            }
                        })
                        if (activeName === 'tab2' || activeName === 'tab3') {
                            this.cacheTab2List = deepClone(this.tab2List)
                        }
                        this.auditStatusFlag = false
                    }
                })
            } else {
                if (activeName === 'tab3') {
                    temp.detailList.map(item => {
                        item = Object.assign(item, this.tab3Form)
                    })
                }
                const detailList = temp.detailList
                param = {
                    isCheck: checkStatus === 1,
                    recipe: {
                        recipeClass: this.recipeClass,
                        caseId: this.caseId,
                        chara: this.tab2Map[activeName].chara,
                        id: temp.recipe ? temp.recipe.id || 0 : 0,
                        patientId: PATIENT_INFO.patientId,
                        registerId: PATIENT_INFO.regId
                    },
                    detailList
                }
                if (this.saveTxt === '审核为新处方') {
                    param.recipe.checkedStatus = 0
                }
                // if (this.recipeAuditMessage && this.recipeAuditMessage.checkedStatus === 2) {
                //     param.recipe.remark = this.remark
                // }
                this.recipeLoading = true
                saveOpdrrecipe(param)
                    .then(res => {
                        // return
                        if (res.STATUS === '1') {
                            const d = res.ITEMS
                            if (d) {
                                const recipe = d.recipe

                                const detailList = d.detailList
                                if (detailList.length > 0) {
                                    detailList.forEach(de => {
                                        const unitOpts = [
                                            {
                                                value: 0,
                                                label: de.specUnit
                                            }
                                        ]
                                        if (de.isTiny === 1) {
                                            unitOpts.push({
                                                value: 1,
                                                label: de.specUseUnit
                                            })
                                        }
                                        de.opts = unitOpts
                                    })
                                }
                                const obj = {
                                    recipe: {
                                        recipeClass: this.recipeClass,
                                        id: recipe.id,
                                        checkedStatus: recipe.checkedStatus,
                                        createTime: recipe.createTime
                                    },
                                    detailList
                                }
                                if (
                                    activeName === 'tab2' ||
                                    activeName === 'tab3'
                                ) {
                                    let name = this.tab2Active
                                    let activeIndex = 0
                                    if (isRefund) {
                                        name = `recipe${this.tab2List.length +
                                            1}`
                                        activeIndex = this.tab2List.length
                                        this.isRefund = false
                                        this.tab2Active = name
                                        if (
                                            this.tab2List[
                                                this.tab2List.length - 1
                                            ].recipe.createTime
                                        ) {
                                            this.recipeAuditMessage = {
                                                checkedStatus:
                                                    recipe.checkedStatus,
                                                checkedUserName:
                                                    recipe.checkedUserName,
                                                checkedNote: recipe.checkedNote
                                            }
                                        } else {
                                            this.recipeAuditMessage = null
                                        }
                                        this.auditStatusFlag =
                                            recipe.checkedStatus == 0
                                    } else {
                                        name = this.tab2Active
                                        activeIndex =
                                            Number(name.replace('recipe', '')) -
                                            1
                                        const isCenterCheckRecipe = this.commonUtil.getConfigValue(
                                            'isCenterCheckRecipe'
                                        )
                                        if (isCenterCheckRecipe == 1) {
                                            this.recipeAuditMessage = {
                                                checkedStatus:
                                                    recipe.checkedStatus,
                                                checkedUserName:
                                                    recipe.checkedUserName,
                                                checkedNote: recipe.checkedNote
                                            }
                                        }

                                        this.auditStatusFlag =
                                            recipe.checkedStatus == 0

                                        obj.recipe = Object.assign(
                                            obj.recipe,
                                            this.recipeAuditMessage
                                        )
                                    }
                                    obj.name = name
                                    this.tab2List[activeIndex] = obj
                                    this.cacheTab2List[activeIndex] = obj
                                } else {
                                    this.tab4Obj = obj
                                    this.cacheTab4Obj = deepClone(this.tab4Obj)
                                }
                            }
                            this.isShowPrint = true
                            this.$message.success('处方保存成功')
                            if (
                                activeName === 'tab2' ||
                                activeName === 'tab3'
                            ) {
                                this.tab2List = deepClone(this.cacheTab2List)
                            }
                            this.recipeLoading = false
                        }
                        this.$nextTick(() => {
                            if (type === 'change') {
                                this.handleCallback()
                            }
                        })
                    })
                    .catch(() => {
                        this.recipeLoading = false
                    })
            }
        },

        // 存储为模板
        handleSaveTpl() {
            const activeName = this.activeName
            let temp = {}
            if (activeName === 'tab2' || activeName === 'tab3') {
                const activeIndex =
                    Number(this.tab2Active.replace('recipe', '')) - 1
                temp = this.tab2List[activeIndex]
            } else {
                temp = this.tab4Obj
            }
            if (temp.detailList.length === 0) {
                this.$message.error('空处方不可存为模板！')
                return false
            }
            if (activeName === 'tab3') {
                temp.detailList.map(item => {
                    item = Object.assign(item, this.tab3Form)
                })
            }
            this.tplEdit = {
                templateType: 1,
                templateName: '',
                detailList: temp.detailList,
                recipeClass: this.recipeClass,
                catType: this.tab2Map[this.activeName].chara
            }

            const index =
                activeName === 'tab2'
                    ? 0
                    : activeName === 'tab3'
                        ? 1
                        : activeName === 'tab4'
                            ? 2
                            : activeName === 'tab5'
                                ? 3
                                : activeName === 'tab6'
                                    ? 4
                                    : 0
            this.$refs.recipeTpl[index].open()
        },

        // 保存处方模板
        handleTplConfirm(form) {
            const activeName = this.activeName
            const index =
                activeName === 'tab2'
                    ? 0
                    : activeName === 'tab3'
                        ? 1
                        : activeName === 'tab4'
                            ? 2
                            : activeName === 'tab5'
                                ? 3
                                : activeName === 'tab6'
                                    ? 4
                                    : 0
            const params = {
                templateDetailList: form.detailList,
                drRecipeTemplate: {
                    templateName: form.templateName,
                    templateType: form.templateType,
                    recipeClass: form.recipeClass,
                    catType: form.catType
                }
            }
            saveOpdrrecipeTpl(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.$refs.recipeTpl[index].loading = false
                        this.$refs.recipeTpl[index].close()
                    }
                })
                .catch(() => {
                    this.$refs.recipeTpl[index].loading = false
                })
        },

        // 选择模板
        handleChooseTpl() {
            var onOff = true
            for (var k in this.tab2List) {
                if (
                    this.tab2List[k].name === this.tab2Active &&
                    (this.tab2List[k].isCharged || this.tab2List[k].isRefund)
                ) {
                    onOff = false
                }
            }
            const activeName = this.activeName
            const index =
                activeName === 'tab2'
                    ? 0
                    : activeName === 'tab3'
                        ? 1
                        : activeName === 'tab4'
                            ? 2
                            : activeName === 'tab5'
                                ? 3
                                : activeName === 'tab6'
                                    ? 4
                                    : 0
            const type =
                activeName === 'tab2'
                    ? 10
                    : activeName === 'tab3'
                        ? 20
                        : activeName === 'tab4'
                            ? 30
                            : activeName === 'tab5'
                                ? 40
                                : activeName === 'tab6'
                                    ? 50
                                    : 10
            this.$refs.recipeTplModel[index].open(
                type,
                this.recipeClass,
                onOff
            )
        },

        // 选择药品
        handleChooseDrug() {
            var onOff = true
            for (var k in this.tab2List) {
                if (
                    this.tab2List[k].name === this.tab2Active &&
                    (this.tab2List[k].isCharged || this.tab2List[k].isRefund)
                ) {
                    onOff = false
                }
            }
            if (this.auditStatusFlag) {
                onOff = false
            }
            const activeName = this.activeName
            const index =
                activeName === 'tab2' ? 0 : activeName === 'tab3' ? 1 : 0
            const type =
                activeName === 'tab2' ? 10 : activeName === 'tab3' ? 20 : 10
            this.$refs.medicalHisModel[index].open(type, onOff)
        },

        // 同步妈妈团和HIS病历信息
        handleSync() {
            this._getPatientInfo(false)
        },

        // 切换显示病史
        historyChange(flag, val) {
            if (!flag) {
                this.$refs.outpatient[0].resetField(this.histroyListMaps[val])
            }
            this.outpatientData[val].hidden = !flag
        },

        // 过敏史改变
        allergyChange(flag) {
            if (flag) {
                this.$refs.outpatient[0].switchAllergy()
            }
            this.outpatientData[15].hidden = !flag
        },

        // 保存门诊病历
        outpatientConfirm(form) {
            const routerParams = this.$route.params
            const PATIENT_INFO = this.patient
            const allergytList = []
            if (form.allergytList.length > 0) {
                form.allergytList.forEach(item => {
                    if (
                        !item.allergyName &&
                        !item.degreeName &&
                        !item.reactionName
                    ) {
                        return
                    } else {
                        const obj = {
                            allergyName: item.allergyName,
                            // allergytCode: '',
                            caseId: 0,
                            // degreeCode: '',
                            degreeName: item.degreeName,
                            id: 0,
                            patientId: PATIENT_INFO.patientId,
                            // reactionCode: '',
                            reactionName: item.reactionName,
                            registerId: PATIENT_INFO.regId
                        }
                        allergytList.push(obj)
                    }
                })
            }
            const diagnosisList = form.diagnosisList.concat(
                form.tcmDiagnosisList
            )
            // const tcmDiagnosisList = form.tcmDiagnosisList || [] // 中医诊断
            let diaDogInfect = ''
            if (form.diaDogInfect.length > 0) {
                form.diaDogInfect.forEach(item => {
                    diaDogInfect += item + ','
                })
            }

            const param = {
                allergytList,
                attachmentList: form.attachmentList,
                diagnosisList,
                // tcmDiagnosisList,
                opCase: {
                    assistantExamResult: form.assistantExamResult,
                    birth: form.birth,
                    blood: form.blood,
                    bodyTemperature: form.bodyTemperature,
                    chiefCompliant: form.chiefCompliant,
                    caseNum: PATIENT_INFO.caseNum,
                    deptCode: PATIENT_INFO.deptCode,
                    deptId: PATIENT_INFO.deptId,
                    deptName: PATIENT_INFO.deptName,
                    familyHistory: form.familyHistory,
                    feed: form.feed,
                    id: PATIENT_INFO.id,
                    isAllergies: form.isAllergies,
                    isPlanInoculate: form.isPlanInoculate,
                    morbidity: form.morbidity,
                    operation: form.operation,
                    otherBodyExam: form.otherBodyExam,
                    pastHistory: form.pastHistory,
                    patientId: PATIENT_INFO.patientId,
                    personalHistory: form.personalHistory,
                    presentIllness: form.presentIllness,
                    pulse: form.pulse,
                    registerId: PATIENT_INFO.regId,
                    respirationRate: form.respirationRate,
                    sbp: form.sbp,
                    dbp: form.dbp,
                    treatPlan: form.treatPlan,
                    whereabouts: form.whereabouts,
                    menstrualHistory: form.menstrualHistory, // 月经史
                    diaDogInfect: diaDogInfect.substring(
                        0,
                        diaDogInfect.length - 1
                    ), // 传染病。。
                    medicine: form.medicine, // 用药史
                    healthEducation: form.healthEducation, // 健康教育
                    tcmDiagnosis: form.tcmDiagnosis, // 中成药诊断
                    weight: PATIENT_INFO.weight,
                    height: PATIENT_INFO.height,
                    bmi: PATIENT_INFO.bmi,
                    chinsesMedicineDialectical: form.chinsesMedicineDialectical
                }
            }

            if (param.opCase.isAllergies == 0) {
                param.allergytList = []
            }
            saveOutPatient(param).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const opCase = param.opCase
                    var temp_bloodPressure = ''
                    var str1 = d.sbp ? d.sbp : ''
                    var str2 = d.dbp ? d.dbp : ''
                    if (str1 || str2) {
                        temp_bloodPressure = str1 + '/' + str2
                    }
                    const obj = {
                        id: d.id,
                        isAllergies: opCase.isAllergies,
                        allergytList,
                        bodyTemperature: opCase.bodyTemperature,
                        respirationRate: opCase.respirationRate,
                        pulse: opCase.pulse || '',
                        bloodPressure: temp_bloodPressure,
                        createTime: d.createTime || '',
                        diagnosisList,
                        updateTime: opCase.updateTime
                    }
                    if (diagnosisList.length > 0) {
                        this.caseId = d.id
                    }
                    this.patient = Object.assign(this.patient, obj)

                    this.cachePatient = this.$refs.outpatient[0].form
                    this.transferObj3 = Object.assign(this.cachePatient, {
                        doctorName: 'test李'
                    })
                    // 接诊
                    // if (!this.isQueueNum) { // 排队叫号未开启
                    if (
                        routerParams.patientStatus == 1 ||
                        routerParams.patientStatus == 3
                    ) {
                        updatePatientStatus({
                            registerId: PATIENT_INFO.regId,
                            cardNum: PATIENT_INFO.cardNum || '',
                            status: 2
                        }).then(res => {})
                    }
                    // }

                    this.$message.success('修改成功')
                }
            })
        },

        // 获取患者病历信息
        _getPatientInfo(sync = true) {
            this.allLoading = true
            this.opSwitch = false
            this.getPatientBasic().then(obj => {
                this.opSwitch = true
                if (this.opType === 'his') {
                    getPatientInfo({
                        patientId: obj.patientId,
                        registerId: obj.regId,
                        detailFlag: 1
                    })
                        .then(res => {
                            this.allLoading = false
                            let obj3 = {}
                            if (res.STATUS === '1') {
                                // 路由跳转进入门诊病历
                                this.activeName = this.$route.params.activeName
                                if (
                                    this.activeName === 'tab8' &&
                                    res.ITEMS.opCase
                                ) {
                                    this.$refs.follow[0].handleSearchFollow(
                                        res.ITEMS.opCase.id
                                    )
                                }
                                const d = res.ITEMS
                                let obj2 = {}

                                let chiefCompliant = ''
                                this.caseId = 0
                                if (d && d.opCase) {
                                    const opCase = d.opCase
                                    // 病例ID
                                    if (
                                        d.diagnosisList &&
                                        d.diagnosisList.length > 0
                                    ) {
                                        this.caseId = opCase.id
                                    }
                                    // 主诉
                                    chiefCompliant =
                                        opCase.chiefCompliant || ''
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
                                        bodyTemperature:
                                            opCase.bodyTemperature || '',
                                        bodyTpositionName:
                                            opCase.bodyTpositionName,
                                        respirationRate:
                                            opCase.respirationRate || '',
                                        pulse: opCase.pulse || '',
                                        isAllergies: opCase.isAllergies || 0,
                                        bloodPressure: temp_bloodPressure,
                                        allergytList: d.allergytList || [],
                                        diagnosisList: d.diagnosisList || [],
                                        createTime: opCase.createTime || '',
                                        booldType: opCase.booldType || '',
                                        booldTypeRh: opCase.booldTypeRh || '',
                                        updateTime: opCase.updateTime
                                        // tcmDiagnosisList: d.tcmDiagnosisList || [] // 中成药诊断
                                    }

                                    // 过敏史
                                    let allergyLineCount = 0
                                    const allergytList = []
                                    if (
                                        d.allergytList &&
                                        d.allergytList.length > 0
                                    ) {
                                        let temp = null
                                        d.allergytList.forEach(item => {
                                            temp = {
                                                allergyName:
                                                    item.allergyName || '',
                                                reactionName:
                                                    item.reactionName || '',
                                                degreeName:
                                                    item.degreeName || ''
                                            }
                                            allergytList.push(temp)
                                        })
                                        allergyLineCount =
                                            d.allergytList.length
                                        this.outpatientData[15].hidden = false
                                    }

                                    // 中医诊断信息
                                    const tcmDiagnosisList = []
                                    // 诊断信息
                                    const diagnosisList = []
                                    if (
                                        d.diagnosisList &&
                                        d.diagnosisList.length > 0
                                    ) {
                                        d.diagnosisList.forEach(item => {
                                            if (
                                                item.diagnosisType !==
                                                '中医诊断'
                                            ) {
                                                diagnosisList.push({
                                                    diagnosisType:
                                                        item.diagnosisType,
                                                    diseaseCode:
                                                        item.diseaseCode,
                                                    diseaseName:
                                                        item.diseaseName
                                                })
                                            } else {
                                                tcmDiagnosisList.push({
                                                    diagnosisType:
                                                        item.diagnosisType,
                                                    diseaseCode:
                                                        item.diseaseCode,
                                                    diseaseName:
                                                        item.diseaseName
                                                })
                                            }
                                        })
                                    }

                                    // 各种史
                                    const historyList = []
                                    for (const key in this.histroyListMaps) {
                                        if (opCase[this.histroyListMaps[key]]) {
                                            historyList.push(Number(key))
                                            this.outpatientData[
                                                Number(key)
                                            ].hidden = false
                                        }
                                    }
                                    obj3 = {
                                        allergyLineCount,
                                        allergytList,
                                        attachmentList: d.attachmentList,
                                        diagnosisList,
                                        assistantExamResult:
                                            opCase.assistantExamResult,
                                        birth: opCase.birth,
                                        blood: opCase.blood,
                                        bodyTemperature:
                                            opCase.bodyTemperature || '',
                                        bodyTpositionName:
                                            opCase.bodyTpositionName || '',
                                        chiefCompliant:
                                            opCase.chiefCompliant || '',
                                        dbp: opCase.dbp || '',
                                        familyHistory: opCase.familyHistory,
                                        feed: opCase.feed,
                                        historyList,
                                        isAllergies: opCase.isAllergies || 0,
                                        isPlanInoculate:
                                            opCase.isPlanInoculate || 0,
                                        morbidity: opCase.morbidity,
                                        operation: opCase.operation,
                                        otherBodyExam: opCase.otherBodyExam,
                                        pastHistory: opCase.pastHistory,
                                        personalHistory: opCase.personalHistory,
                                        presentIllness: opCase.presentIllness,
                                        pulse: opCase.pulse,
                                        respirationRate:
                                            opCase.respirationRate || '',
                                        sbp: opCase.sbp,
                                        treatPlan: opCase.treatPlan,
                                        whereabouts: opCase.whereabouts,
                                        menstrualHistory:
                                            opCase.menstrualHistory, // 月经史
                                        diaDogInfect: opCase.diaDogInfect
                                            ? opCase.diaDogInfect.split(',')
                                            : [], // 传染病。。
                                        medicine: opCase.medicine, // 用药史
                                        healthEducation: opCase.healthEducation, // 健康教育
                                        doctorName: opCase.doctorName,
                                        tcmDiagnosisList, // 中成药诊断
                                        chinsesMedicineDialectical:
                                            opCase.chinsesMedicineDialectical
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
                                        allergytList: [],
                                        bodyTemperature: '',
                                        pulse: '',
                                        respirationRate: '',
                                        dbp: '',
                                        sbp: ''
                                    }
                                    // this.treatmentFlag = true
                                    for (const key in this.histroyListMaps) {
                                        this.outpatientData[
                                            Number(key)
                                        ].hidden = true
                                    }
                                    this.outpatientData[15].hidden = true
                                    this.outpatientData[19].opts = []
                                }
                                this._chiefCompliantChange(chiefCompliant)
                                // 判断是否改动病历信息
                                this.$refs.outpatient[0].initforms(obj3)
                                this.patient = Object.assign(obj2, obj)
                            }
                            this.cachePatient = deepClone(
                                this.$refs.outpatient[0].form
                            )
                            this.transferObj3 = Object.assign({},
                                this.cachePatient,
                                obj3
                            )
                        })
                        .catch(() => {
                            this.allLoading = false
                        })
                } else {
                    const clinic = this.clinic
                    // hx接口路径
                    const apiAddress = this.commonUtil.getConfigValue(
                        'transferApiAddress'
                    )

                    const orgCode = clinic.orgCode
                    const appId = 'senxiang'
                    const secret = 'sxsecretsx'
                    let hash = ''
                    for (let i = 0; i < 6; i++) {
                        hash += Math.floor(Math.random() * 10)
                    }
                    const sign = MD5(`${appId}${secret}${hash}`)
                    if (this.opType === 'mmt') {
                        this.outPatientUrl = `${apiAddress}/#/medicalHistory?eventId=${obj.appointmentId}&orgCode=${orgCode}&nation=${obj.nation}&occupation=${obj.occupation}&matrialStatus=${obj.matrialStatus}&department=${obj.deptName}&address=${obj.address}`
                        this.transferUrl = `${apiAddress}/#/referralSheet?appId=${appId}&hash=${hash}&sign=${sign}&orgCode=${orgCode}&eventId=${obj.appointmentId}`
                        // this.outPatientUrl = `http://119.23.77.38/#/medicalHistory?eventId=${obj.appointmentId}&orgCode=${orgCode}`
                        // this.transferUrl = `http://119.23.77.38/#/referralSheet?appId=${appId}&hash=${hash}&sign=${sign}&orgCode=${orgCode}&eventId=${obj.appointmentId}`
                    } else {
                        this.outPatientUrl = `${apiAddress}/#/medicalHistory?eventId=${obj.appointmentId}&orgCode=${orgCode}&nation=${obj.nation}&occupation=${obj.occupation}&matrialStatus=${obj.matrialStatus}&department=${obj.deptName}&address=${obj.address}`
                        // this.outPatientUrl = `http://119.23.77.38/#/medicalHistory?eventId=${obj.appointmentId}&orgCode=${orgCode}`
                    }
                    getPatientInfo({
                        patientId: obj.patientId,
                        registerId: obj.regId,
                        detailFlag: 1
                    })
                        .then(res => {
                            this.allLoading = false
                            if (res.STATUS === '1') {
                                // 路由跳转进入门诊病历
                                this.activeName = 'tab1'
                                const d = res.ITEMS
                                let obj2 = {}
                                this.caseId = 0
                                if (d && d.opCase) {
                                    const opCase = d.opCase
                                    // 病例ID
                                    if (
                                        d.diagnosisList &&
                                        d.diagnosisList.length > 0
                                    ) {
                                        this.caseId = opCase.id
                                    }

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
                                        bodyTpositionName:
                                            opCase.bodyTpositionName,
                                        respirationRate:
                                            opCase.respirationRate || '',
                                        pulse: opCase.pulse || '',
                                        isAllergies: opCase.isAllergies || 0,
                                        bloodPressure: temp_bloodPressure,
                                        allergytList: d.allergytList || [],
                                        diagnosisList: d.diagnosisList || [],
                                        createTime: opCase.createTime || '',
                                        booldType: opCase.booldType || '',
                                        booldTypeRh: opCase.booldTypeRh || ''
                                        // tcmDiagnosisList: d.tcmDiagnosisList || [] // 中成药诊断
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
                                if (!sync) this.$message.success('同步成功！')
                            }
                        })
                        .catch(() => {
                            this.allLoading = false
                        })
                }
                // this.$nextTick(() => {
                //     this.allLoading = false
                // })
            })
        },

        // 获取患者基础信息
        getPatientBasic() {
            return new Promise((resolve, reject) => {
                let patientId = ''
                let regId = ''
                // if (this.isCurrentPatient) {
                //     console.log(1111);
                //     const routerParams = this.$route.params
                //     patientId = routerParams.patientId
                //     regId = routerParams.regId
                // } else {
                //     console.log(3222);
                //     patientId = this.nextLastPatient.sysPatientId
                //     regId = this.nextLastPatient.id
                // }
                const routerParams = this.$route.params
                patientId = routerParams.patientId
                regId = routerParams.regId
                getPatientByRegId(regId).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d) {
                            const address =
                                d.address === 'null' ? '' : d.address
                            const obj = {
                                patientId,
                                regId: d.id,
                                isFirstClinic: d.isFirstClinic,
                                avatar: d.headImg
                                    ? this.$store.getters.basic.filePrifix +
                                      d.headImg
                                    : paramAvatar(d.sex, d.birthDate),
                                phone: d.phone,
                                name: d.name,
                                nation: formatDictMap(
                                    this.dictData[29],
                                    d.nation
                                ),
                                sex: formatSex(d.sex),
                                age: getBabyAge(d.birthDate),
                                patientStatus: d.patientStatus,
                                matrialStatus: formatDictMap(
                                    this.dictData[107],
                                    d.matrialStatus
                                ), // 婚姻状况
                                clinicCompletedTime:
                                    d.clinicCompletedTime || '', // 完成就诊日期
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
                                idNumType: d.idNumType,
                                transferId: d.transferId || 0,
                                transferStatus: d.transferStatus,
                                occupation: formatDictMap(
                                    this.dictData[20],
                                    d.occupation
                                ) // 职业
                            }
                            const isChildRecipeAge = this.commonUtil.getConfigValue(
                                'isChildRecipeAge'
                            )
                            this.defaultRecipeClass = this.judgeAge(
                                d.birthDate,
                                isChildRecipeAge
                            )
                                ? '06'
                                : '01'
                            this.revisitingStatus = d.revisitingStatus
                            const clinicList = this.clinic.configList
                            // 判断定向用户
                            const catPtLimit = clinicList.orgCatPatientLimit
                            if (catPtLimit) {
                                const catPtLimitValue =
                                    catPtLimit.actualValue ||
                                    catPtLimit.defaultValue
                                if (catPtLimitValue) {
                                    const list = catPtLimitValue.split(',')
                                    const flag = list.some(item => {
                                        return (
                                            item === d.commercialInsuranceCode
                                        )
                                    })
                                    if (flag) {
                                        this.insurance = {
                                            insuranceCode:
                                                d.commercialInsuranceCode,
                                            insuranceName:
                                                d.commercialInsuranceType
                                        }
                                    }
                                }
                            }
                            // 判断诊所是否需要审核处方
                            const orgCheckRecipe =
                                clinicList.isCenterCheckRecipe
                            if (orgCheckRecipe) {
                                const auditValue =
                                    orgCheckRecipe.actualValue ||
                                    orgCheckRecipe.defaultValue
                                this.isAudit = auditValue === '1'
                            }
                            resolve(obj)
                        }
                    } else {
                        reject('error')
                    }
                })
            })
        },

        // 主诉改变
        _chiefCompliantChange(content) {
            this.$refs.diagnosis[0].getADDiseaseList(content)
        },

        // 点击智能诊断结果
        handleDiagnosisClick(id) {
            getDiseaseDetailById(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.$refs.outpatient[0].concatDiagnisis({
                            diagnosisType: d.classValue,
                            diseaseCode: d.code,
                            diseaseName: d.name
                        })
                    }
                }
            })
        },

        // 完成就诊
        // handleEndOutpatient() {
        //     const PATIENT_INFO = this.patient
        //     updatePatientStatus({
        //         registerId: PATIENT_INFO.regId,
        //         cardNum: PATIENT_INFO.cardNum,
        //         status: 3
        //     }).then(res => {
        //         if (res.STATUS === '1') {
        //             this.$message.success('就诊完成')
        //             this.$router.push({
        //                 name: 'doctorClinic'
        //             })
        //         }
        //     })
        // },

        // 返回
        handleBack() {
            this.$router.push({ name: 'doctorClinic' })
        },

        // 切换上一位下一位
        handleChange(type) {
            var flag = this.judgeDataChange()

            if (!flag) {
                this.$confirm(
                    `请保存相关数据再切换到${
                        type === 0 ? '上一位' : '下一位'
                    }?`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
                    .then(() => {
                        // 保存门诊病历
                        if (
                            this.activeName == 'tab1' &&
                            this.opType === 'his'
                        ) {
                            if (this.$refs.outpatient[0].form.chiefCompliant) {
                                this.outpatientConfirm(
                                    this.$refs.outpatient[0].form
                                )
                            } else {
                                this.$message.warning('主诉必填')
                                return
                            }
                        }

                        // 西/成药处方 检验检查、治疗、其他
                        if (
                            this.activeName === 'tab2' ||
                            this.activeName === 'tab3' ||
                            this.activeName === 'tab4' ||
                            this.activeName === 'tab5' ||
                            this.activeName === 'tab6' ||
                            this.activeName === 'tab10'
                        ) {
                            this.handleSave()
                        }

                        // 随访
                        if (this.activeName == 'tab8') {
                            this.$refs.follow[0].handleSaveFollow()
                        }

                        if (this.activeName == 'tab9') {
                            this.$refs.transfer[0].submitMedcial('save')
                        }

                        this.nextOrPrePatient(type)
                    })
                    .catch(() => {})
            } else {
                this.nextOrPrePatient(type)
            }
        },

        // 判断数据是否变化
        judgeDataChange(oldTab) {
            var flag = false
            // 门诊病历
            const activeName = oldTab || this.activeName
            if (activeName == 'tab1' && this.opType === 'his') {
                flag = compareJson(
                    this.cachePatient,
                    this.$refs.outpatient[0].form
                )
            } else if (activeName == 'tab1') {
                flag = true
            }
            // return;
            // 西/成药处方
            if (activeName == 'tab2') {
                flag = compareJson(this.tab2List, this.cacheTab2List)
            }

            // 中药处方
            if (activeName == 'tab3') {
                flag =
                    compareJson(this.tab3Form, this.cacheTab3Form) &&
                    compareJson(this.tab2List, this.cacheTab2List)
            }

            // 检验检查、治疗、其他、材料
            if (
                activeName == 'tab4' ||
                activeName == 'tab5' ||
                activeName == 'tab6' ||
                activeName == 'tab10'
            ) {
                flag = compareJson(this.tab4Obj, this.cacheTab4Obj)
            }

            if (activeName == 'tab8') {
                flag = compareJson(
                    this.cacheFollowList,
                    this.$refs.follow[0].followList
                )
            }
            if (activeName == 'tab9') {
                const transfer = this.$refs.transfer[0].$refs.medicalRecordForm
                    .$refs
                const transferData = Object.assign(
                    {},
                    transfer.transfer[0].$refs.transferInfo.form,
                    transfer.patientRequire[0].form,
                    transfer.outpatient[0].form,
                    { prescriptions: transfer.westernMedicine[0].tabList },
                    { examList: transfer.examine[0].tableData },
                    { analysisList: transfer.inspection[0].tableData },
                    transfer.cost[0].$refs.costInfo.form,
                    { attachments: transfer.upload.form }
                )

                flag = compareJson(this.cacheTransferData, transferData)
            }
            return flag
        },

        nextOrPrePatient(type) {
            this.totalPrice = 0
            this.allLoading = true
            const data = {
                sn:
                    this.nextLastPatient && this.nextLastPatient.sn
                        ? this.nextLastPatient.sn
                        : this.$route.params.sn,
                upDown: type
            }
            getNextLastPatient(data)
                .then(res => {
                    if (res.STATUS === '1') {
                        if (res.ITEMS) {
                            const d = res.ITEMS
                            this.orderNextInfo(d)
                        }
                    }
                })
                .catch(() => {
                    this.allLoading = false
                })
        },

        // 下一位整理返回信息
        orderNextInfo(d) {
            this.nextLastPatient = d
            this.nextLastPatient.isCurrentDay = true
            this.isCurrentPatient = false
            const type = this.judgePtType(this.nextLastPatient)
            const isCurrentDay = this.nextLastPatient.isCurrentDay
            const sn = this.nextLastPatient.sn
            const patientStatus = this.nextLastPatient.patientStatus
            const queueId = this.nextLastPatient.queueId || 0
            //   const routerParams = JSON.stringify({
            //     isCurrentDay: this.nextLastPatient.isCurrentDay,
            //     sn: this.nextLastPatient.sn,
            //     regDate: this.nextLastPatient.regDate,
            //     patientSources: this.nextLastPatient.patientSources,
            //     patientStatus: this.nextLastPatient.patientStatus,
            //     birthDate: this.nextLastPatient.birthDate
            //   })

            this.$router.push({
                name: 'outpatientDetail',
                params: {
                    patientId: this.nextLastPatient.sysPatientId,
                    regId: this.nextLastPatient.id,
                    type,
                    activeName: 'tab1',
                    sn,
                    isCurrentDay,
                    patientStatus,
                    queueId
                    //   routerParams
                }
            })
            this.opType = this.$route.params.type
            this._getPatientInfo()
            if (
                this.nextLastPatient.patientStatus === 1 ||
                this.nextLastPatient.patientStatus === 3
            ) {
                // 通知华西同步数据
                offlineBespeakHX(this.nextLastPatient.id).then(result => {})
            }
        },

        // 判断年龄是否满18周岁 return true:18岁及以上，false: 0-17岁
        judgeAge(birth, age = 17) {
            if (!birth) return true
            const birthDate = birth.split(' ')[0].split('-')
            const birthYear = Number(birthDate[0])
            const birthMonth = Number(birthDate[1])
            const birthDay = Number(birthDate[2])
            const d = new Date()
            const nowYear = d.getFullYear()
            const nowMonth = d.getMonth() + 1
            const nowDay = d.getDate()
            if (nowYear === birthYear) {
                return false
            } else {
                const ageDiff = nowYear - birthYear
                if (ageDiff > age) {
                    return true
                } else {
                    if (ageDiff === age) {
                        if (nowMonth > birthMonth) {
                            return true
                        } else if (nowMonth === birthMonth) {
                            if (nowDay >= birthDay) {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            return false
                        }
                    } else {
                        return false
                    }
                }
            }
        },

        // 判断患者类型
        judgePtType(item) {
            // his --- his病历，无转诊
            // mmt --- mmt病历，有转诊
            // hx  --- hx病历，无转诊
            const clinic = this.$store.getters.clinic
            // 接口地址
            const apiAddress = this.commonUtil.getConfigValue(
                'transferApiAddress'
            )
            // 转诊类型
            const transferType = this.commonUtil.getConfigValue('transferType')
            // 诊所code
            const orgCode = clinic.orgCode
            if (
                !orgCode ||
                !transferType ||
                transferType !== '1' ||
                !apiAddress
            ) {
                return 'his'
            }
            const isTodayAfter =
                new Date(item.regDate).getTime() -
                    new Date('2018-12-07').getTime() >
                0
            if (item.patientSources === '01' && isTodayAfter) {
                return 'mmt'
            }
            if (!this.judgeAge(item.birthDate) && isTodayAfter) {
                return 'hx'
            }

            return 'his'
        },

        // 引用处方模板
        repReference(data) {
            // this.tab4Obj.detailList = [];
            this.tab2List.forEach((tab, index) => {
                if (tab.name === this.tab2Active) {
                    this.tab2List[index].detailList = []
                }
            })
            const templateDetailList = data.templateDetailList
            if (templateDetailList && templateDetailList.length > 0) {
                templateDetailList.forEach(item => {
                    this.addItem(item)
                })
                const activeName = this.activeName
                const index =
                    activeName === 'tab2'
                        ? 0
                        : activeName === 'tab3'
                            ? 1
                            : activeName === 'tab4'
                                ? 2
                                : activeName === 'tab5'
                                    ? 3
                                    : activeName === 'tab6'
                                        ? 4
                                        : 0
                if (activeName === 'tab3') {
                    this.tab3Form = {
                        usage: templateDetailList[0].userMethod,
                        days: templateDetailList[0].days,
                        dose: templateDetailList[0].dose,
                        doseUnit: templateDetailList[0].specDoseUnit,
                        frequency: templateDetailList[0].useFrequency,
                        medicineType: templateDetailList[0].medicineType,
                        footNote: templateDetailList[0].footNote
                    }
                }
                this.$refs.recipeTplModel[index].close()
            }
        },

        // 引用历史用药
        medReference(row, type) {
            this.addItem(row, type)

            const activeName = this.activeName
            const index =
                activeName === 'tab2'
                    ? 0
                    : activeName === 'tab3'
                        ? 1
                        : activeName === 'tab4'
                            ? 2
                            : activeName === 'tab5'
                                ? 3
                                : activeName === 'tab6'
                                    ? 4
                                    : 0
            this.$refs.medicalHisModel[index].close()
        },

        transferIdChange(id) {
            this.patient.transferId = id
        },
        // 缓存转诊单中的数据
        getCacheTransferData() {
            const transfer = this.$refs.transfer[0].$refs.medicalRecordForm
                .$refs
            const prescriptions = deepClone(
                transfer.westernMedicine[0].tabList
            )
            const examList = deepClone(transfer.examine[0].tableData)
            const analysisList = deepClone(transfer.inspection[0].tableData)
            const attachments = deepClone(transfer.upload.form)
            this.cacheTransferData = Object.assign(
                {},
                transfer.transfer[0].$refs.transferInfo.form,
                transfer.patientRequire[0].form,
                transfer.outpatient[0].form,
                { prescriptions },
                { examList },
                { analysisList },
                transfer.cost[0].$refs.costInfo.form,
                { attachments }
            )
        },

        // 申请退药
        handleRefund() {
            this.isApplyRefund = true
        },
        // 退药
        handleRefundDrug() {
            if (this.selections && this.selections.length > 0) {
                const n = this.tab2Active.replace(/[^0-9]/gi, '') - 1
                const refundList = this.tab2List[n].detailList
                const detailList = []
                this.selections.forEach(item => {
                    detailList.push({
                        count: item.refundNum,
                        detailId: item.id
                    })
                })
                const data = {
                    isAll: this.isAllRefund ? 1 : 0,
                    recipeId: this.selections[0].recipeId,
                    detailList
                }
                refundDrug(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('申请成功')
                        this.handleSwitch()
                        this.isApplyRefund = false
                    }
                })
            } else {
                this.$message.warning('请先选择药品')
            }
        },
        getRecipeStatus(val) {
            this.recipeStatus = val
        },

        // 删除图片后更新cachePatient
        handleFreshCache(val) {
            this.cachePatient.attachmentList = val
        },

        // 查看药品说明书
        handleDrugDetail(row) {
            if (row.chargeItemId) {
                getDrugUrl(row.chargeItemId).then(res => {
                    if (res.STATUS === '1') {
                        if (res.ITEMS && res.ITEMS.url) {
                            window.open(res.ITEMS.url, '_blank')
                        } else {
                            this.$message.warning('无说明')
                        }
                    }
                })
            } else {
                this.$message.warning('无说明')
            }
        },

        // 切换一级pane前
        beforeLeave(newTab, oldTab) {
            this.activeName = newTab
            var p = new Promise((resolve, reject) => {
                var flag = this.judgeDataChange(oldTab)
                if (!flag) {
                    this.isExecute = false
                    this.$confirm(`请保存相关数据再切换?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            // 保存门诊病历
                            if (oldTab == 'tab1' && this.opType === 'his') {
                                if (
                                    this.$refs.outpatient[0].form.chiefCompliant
                                ) {
                                    this.outpatientConfirm(
                                        this.$refs.outpatient[0].form
                                    )
                                    resolve()
                                    this.handleCallback()
                                    // this.isExecute = true
                                } else {
                                    this.$message.warning('主诉必填')
                                    reject()
                                    this.isExecute = false
                                }
                            }
                            // 西/成药处方 检验检查、治疗、其他
                            if (
                                oldTab == 'tab2' ||
                                oldTab == 'tab3' ||
                                oldTab == 'tab4' ||
                                oldTab == 'tab5' ||
                                oldTab == 'tab6' ||
                                oldTab == 'tab10'
                            ) {
                                this.handleSave('change', oldTab)
                                setTimeout(() => {
                                    resolve()
                                    // this.isExecute = true
                                }, 500)

                                // this.handleCallback()
                            }

                            // 随访
                            if (oldTab == 'tab8') {
                                this.$refs.follow[0].handleSaveFollow()
                                resolve()
                                this.isExecute = true
                            }

                            if (oldTab == 'tab9') {
                                this.$refs.transfer[0].submitMedcial('save')
                                resolve()
                                this.isExecute = true
                            }
                        })
                        .catch(() => {
                            resolve()
                            this.handleCallback()
                        })
                } else {
                    resolve()
                    this.isExecute = true
                }
            })
            return p
        },

        // 排队叫号按钮  过号、重新叫号、下一位
        handleQueueChange(type) {
            if (type === 1 || type === 3) {
                var flag = this.judgeDataChange()
                if (!flag) {
                    this.$confirm(
                        `请保存相关数据再切换到${
                            type === 0 ? '上一位' : '下一位'
                        }?`,
                        '提示',
                        {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }
                    )
                        .then(() => {
                            // 保存门诊病历
                            if (
                                this.activeName == 'tab1' &&
                                this.opType === 'his'
                            ) {
                                if (
                                    this.$refs.outpatient[0].form.chiefCompliant
                                ) {
                                    this.outpatientConfirm(
                                        this.$refs.outpatient[0].form
                                    )
                                } else {
                                    this.$message.warning('主诉必填')
                                    return
                                }
                            }

                            // 西/成药处方 检验检查、治疗、其他
                            if (
                                this.activeName == 'tab2' ||
                                this.activeName == 'tab3' ||
                                this.activeName == 'tab4' ||
                                this.activeName == 'tab5' ||
                                this.activeName == 'tab6' ||
                                this.activeName == 'tab10'
                            ) {
                                this.handleSave()
                            }

                            // 随访
                            if (this.activeName == 'tab8') {
                                this.$refs.follow[0].handleSaveFollow()
                            }

                            if (this.activeName == 'tab9') {
                                this.$refs.transfer[0].submitMedcial('save')
                            }

                            this.handleNextCb(type)
                        })
                        .catch(() => {})
                } else {
                    this.handleNextCb(type)
                }
            } else {
                this.btnLoading = true
                callSn(this.$route.params.queueId)
                    .then(res => {
                        if (res.STATUS === '1') {
                            this.btnLoading = false
                        }
                    })
                    .catch(() => {
                        this.btnLoading = false
                    })
            }
        },

        // 下一位、过号
        handleNextCb(type) {
            this.allLoading = true
            if (type === 1) {
                saveMissSort()
                    .then(res => {
                        if (res.STATUS === '1') {
                            if (res.ITEMS) {
                                this.orderNextInfo(res.ITEMS)
                            } else {
                                this.$message.warning('当前已是最后一位')
                                this.allLoading = false
                            }
                        }
                    })
                    .catch(() => {
                        this.allLoading = false
                    })
            } else {
                getNextSort()
                    .then(res => {
                        if (res.STATUS === '1') {
                            if (res.ITEMS) {
                                this.orderNextInfo(res.ITEMS)
                            } else {
                                this.$message.warning('当前已是最后一位')
                                this.allLoading = false
                            }
                        }
                    })
                    .catch(() => {
                        this.allLoading = false
                    })
            }
        },

        // 需回诊
        handleNeedReturnVisit() {
            const data = {
                registerId: this.patient.regId,
                revisitingStatus: this.revisitingStatus === 1 ? 0 : 1
            }
            setRevisitingStatus(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(
                        this.revisitingStatus === 1
                            ? '已取消回诊'
                            : '回诊设置成功'
                    )
                    this.revisitingStatus = this.revisitingStatus === 1 ? 0 : 1
                }
            })
        }
    },
    beforeRouteLeave(to, from, next) {
        var flag = false
        // 门诊病历
        if (this.activeName === 'tab1' && this.opType === 'his') {
            flag = compareJson(
                this.cachePatient,
                this.$refs.outpatient[0].form
            )
        } else {
            flag = true
        }
        if (!flag) {
            this.$confirm(`请保存病历再切换?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    if (this.activeName === 'tab1' && this.opType === 'his') {
                        if (this.$refs.outpatient[0].form.chiefCompliant) {
                            this.outpatientConfirm(
                                this.$refs.outpatient[0].form
                            )
                        } else {
                            this.$message.warning('主诉必填')
                            return
                        }
                        next()
                    }
                })
                .catch(() => {
                    next()
                })
        } else {
            next()
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
.recipe-tabs {
    /deep/ .el-tabs__item {
        &:not(.is-closable) {
            background-color: #f1f1f1;
        }
    }
}
.input-with-select {
    /deep/ {
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
}
.queueBtn {
    overflow: hidden;
    margin-left: 10px;
    display: flex;
    justify-content: center;
    button {
        padding: 9px 0px;
        float: left;
        color: #fff;
        width: 33%;
    }
    button:nth-of-type(1) {
        background-color: #e02020;
        border-color: #e02020;
    }
    button:nth-of-type(2) {
        background-color: #ff6e02;
        border-color: #ff6e02;
    }
    button:nth-of-type(3) {
        background-color: #00ac6a;
        border-color: #00ac6a;
    }
}
</style>

<style lang="scss">
.drugDetail {
    .el-form-item__label {
        width: 125px !important;
    }
    .el-input-group__prepend {
        div {
            &.el-select {
                .el-input__inner {
                    padding-left: 55px !important;
                }
            }
        }
    }
    .el-form-item__content {
        margin-left: 130px !important;
    }
}
</style>
