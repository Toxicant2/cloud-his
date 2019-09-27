<template>
    <div class="out-wrapper">
        <el-form ref="form" :disabled="disabled" :model="form" :label-width="labelWidth" :size="size" label-position="right">
            <el-row>
                <el-col v-for="(item,index) in forms" v-if="!item.hidden" :key="item.field" :span="item.spanCount?item.spanCount:countLine">
                    <el-form-item :key="index" :label="item.name?`${item.name}：`:''" :label-width="item.labelWidth" :prop="item.field" :rules="item.rules" :class="item.className" :style="item.style">
                        <!-- 输入框 -->
                        <el-input v-if="item.type === 'input'" v-model="form[item.field]" :type="item.inputType?item.inputType:''" :placeholder="item.placeholder" :resize="item.resize" :maxlength="item.maxlength" :rows="item.rows" :autosize="item.autosize" @input="item.func">
                            <span v-if="item.unit" :slot="item.slot?item.slot:'append'">{{ item.unit }}</span>
                        </el-input>

                        <!-- 日期 -->
                        <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.field]" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="item.func?item.func($event):{}" />

                        <!-- 单选框 -->
                        <el-radio v-for="(opt,optIndex) in item.opts" v-else-if="item.type === 'radio'" v-model="form[item.field]" :class="item.class" :key="optIndex" :label="opt.value" @change="item.func?item.func($event):{}">{{ opt.label }}</el-radio>

                        <!-- 多选框-group -->
                        <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.field]">
                            <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" :border="item.border" @change="item.func?item.func($event,opt.value):{}">{{ opt.label }}</el-checkbox>
                        </el-checkbox-group>

                        <!-- 选择器 -->
                        <el-select v-else-if="item.type === 'select'" v-model="form[item.field]" :multiple="item.multiple" :placeholder="item.placeholder?item.placeholder:'请选择'" remote filterable default-first-option @change="item.func?item.func($event):{}">
                            <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                <span style="float: left">{{ opt.label }}</span>
                                <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                            </el-option>
                        </el-select>

                        <!-- 体格检查 && 月经史 -->
                        <template v-else-if="item.type === 'mixin-input'">
                            <el-form-item v-for="(c,cIndex) in item.list" :key="cIndex" :prop="c.field" :label="c.name?`${c.name}：`:''" :label-width="c.labelWidth?c.labelWidth:'36px'" :rules="c.rules" :class="{'suffix':c.suffix}">
                                <!-- 输入框 -->
                                <el-input v-if="c.type === 'input'" v-model="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder" />

                                <!-- 呼吸背景色输入框 background-input -->
                                <el-input v-else-if="c.type === 'background-input'" :type="c.inputType?item.inputType:''" v-model="form[c.field]" :disabled="c.disabled" :placeholder="c.placeholder" :resize="c.resize" :maxlength="c.maxlength" :rows="c.rows" :autosize="c.autosize" @keyup.enter.native="addIndex"
:class="{'red-background': form[c.field]>c.up, 'blue-background': form[c.field]&& form[c.field]<c.down}" @input="c.func" />
                                <!-- 日期 -->
                                <!-- <el-date-picker v-else-if="c.type === 'date'" v-model="form[c.field]" :picker-options="c.options" :format="c.format"
                                    :value-format="c.valueFormat">
                </el-date-picker>-->
                                <span v-if="c.suffix">{{ c.suffix }}</span>
                            </el-form-item>
                        </template>

                        <!-- 过敏史 -->
                        <template v-else-if="item.type === 'mixin-select'">
                            <span v-for="(col,colIndex) in form.allergyLineCount" :key="colIndex">
                                <el-select v-model="form.allergytList[colIndex].allergyName" filterable allow-create default-first-option placeholder="过敏源">
                                    <el-option v-for="(opt,optIndex) in item.opts1" :key="optIndex" :label="opt.label" :value="opt.value">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>

                                <el-select v-model="form.allergytList[colIndex].reactionName" filterable allow-create default-first-option placeholder="过敏反应">
                                    <el-option v-for="(opt,optIndex) in item.opts2" :key="optIndex" :label="opt.label" :value="opt.value">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>
                                <el-select v-model="form.allergytList[colIndex].degreeName" filterable allow-create default-first-option placeholder="过敏程度">
                                    <el-option v-for="(opt,optIndex) in item.opts3" :key="optIndex" :label="opt.label" :value="opt.value">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>
                                <el-button v-if="form.allergyLineCount > 1" icon="el-icon-minus" @click="minusAlleray(colIndex)" />
                                <el-button v-if="form.allergyLineCount === 1 || colIndex > 0" icon="el-icon-plus" @click="addAllergy" />
                            </span>
                        </template>

                        <!-- 上传 -->
                        <template v-else-if="item.type === 'upload'">
                            <div class="upload">
                                <el-button icon="el-icon-plus" @click="uploadFile">上传文件</el-button>
                                <input ref="fileInput" type="file" multiple style="display:none" @change="fileChange($event)">
                                <span>支持jpg、png格式上传，每张不超过3M</span>
                            </div>
                            <div class="img-list">
                                <ul class="el-upload-list el-upload-list--picture-card">
                                    <li v-for="(file,fileIndex) in form.attachmentList" :key="fileIndex" class="el-upload-list__item is-success">
                                        <img :src="`${$store.getters.basic.filePrifix}${file.filePath}`" class="el-upload-list__item-thumbnail">
                                        <a class="el-upload-list__item-name">
                                            <i class="el-icon-document" />
                                            {{ file.fileName }}
                                        </a>
                                        <label class="el-upload-list__item-status-label">
                                            <i class="el-icon-upload-success el-icon-check" />
                                        </label>
                                        <span class="el-upload-list__item-actions">
                                            <span class="el-upload-list__item-preview" @click="handlePreviewImage(file)">
                                                <i class="el-icon-zoom-in" />
                                            </span>
                                            <span class="el-upload-list__item-delete" @click="handleDeleteImage(file,fileIndex)">
                                                <i class="el-icon-delete" />
                                            </span>
                                        </span>
                                    </li>
                                </ul>
                                <dialog-image ref="preview" :title="title" :img-url="imgUrl" />
                            </div>
                        </template>

                        <!-- 主诉 -->
                        <template v-else-if="item.type === 'textarea-select'">
                            <el-popover :disabled="disabled" v-model="chiefPopperVisible" :width="popperWidth" :visible-arrow="false" :transition="'linear'" trigger="focus" @show="handleShow">
                                <el-input slot="reference" v-model="form[item.field]" :resize="item.resize" :maxlength="item.maxlength" :autosize="item.autosize" type="textarea" @input="handleChiefCompliantChange" />
                                <div class="chief-tell">

                                    <div class="line symptoms clearfix">
                                        <div class="name">常见症状：</div>
                                        <div class="list">
                                            <span v-for="(opt,optIndex) in item.opts1" :key="optIndex" @click="handleChoose(opt.label, 1)">{{ opt.label }}</span>
                                        </div>
                                    </div>
                                    <div class="line time clearfix">
                                        <div class="name">常用时间：</div>
                                        <div class="list">
                                            <span v-for="(opt,optIndex) in item.opts2" :key="`2_${optIndex}`" @click="handleChoose(opt,2)">{{ opt }}</span>
                                            <span v-for="(opt,optIndex) in item.opts3" :key="optIndex" @click="handleChoose(opt,3)">{{ opt }}</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <el-button type="text" @click="chiefPopperVisible = false">关闭</el-button>
                                    </div>
                                </div>
                            </el-popover>
                        </template>

                        <!-- 诊断 -->
                        <template v-else-if="item.type === 'tab-select'">
                            <el-popover :disabled="disabled" v-model="popoverVisible" :width="popperWidth" :visible-arrow="false" :transition="'linear'" trigger="click" popper-class="popoverClass" @show="handleShow">
                                <div class="ds-header">
                                    <p>西医诊断</p>
                                    <!-- 诊断名称 -->
                                    <el-input v-model="ds.name" v-focus="focusState" @input="handleFormSearch">
                                        <el-button slot="append" icon="el-icon-search" @click="handleFormSearch" />
                                    </el-input>
                                    <!-- 匹配规则 -->
                                    <el-radio-group v-model="ds.likeType" @change="handleFormSearch">
                                        <el-radio v-for="(opt,optIndex) in likeTypeList" :key="optIndex" :label="opt.value">{{ opt.label }}</el-radio>
                                    </el-radio-group>
                                </div>

                                <el-scrollbar style="max-height:350px;">
                                    <ul class="el-scrollbar__view el-select-dropdown__list">
                                        <template v-if="dsList.length > 0">
                                            <li v-for="(d,dIndex) in dsList" :key="dIndex" class="el-select-dropdown__item" @click="handleDsClick(d)" @contextmenu="handleDsContextmenu($event,d)">{{ d.name }}</li>
                                        </template>
                                        <li v-else>暂无数据</li>
                                    </ul>
                                </el-scrollbar>

                                <div class="ds-footer">
                                    <el-pagination :current-page="pageIndex" :page-sizes="pageSizes" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                                </div>

                                <div slot="reference" class="ds-container">
                                    <span v-if="form.diagnosisList && form.diagnosisList.length > 0" style="display: inline-block;width: auto;">
                                        <el-tag v-for="(tag,index) in form.diagnosisList" :key="index" :type="'info'" :size="'mini'" :hit="false" :closable="!disabled" :disable-transitions="false" @close="handleClose(tag)">{{ tag.diseaseName }}</el-tag>
                                    </span>
                                    <span v-else class="placeholder">可搜索查询，可右键存疑</span>
                                </div>
                            </el-popover>
                            <!-- 右键 -->
                            <vue-context-menu :menu-data="menuData" :context-menu-data="contextMenuData" @inDoubt="inDoubt" />
                        </template>

                        <!-- 中医诊断 -->
                        <template v-else-if="item.type === 'tab-select1'">
                            <el-popover :disabled="disabled" v-model="popoverVisible1" :width="popperWidth" :visible-arrow="false" :transition="'linear'" trigger="click" popper-class="popoverClass" @show="handleShow">
                                <div class="ds-header">
                                    <p>中医诊断</p>
                                    <!-- 诊断名称 -->
                                    <el-input v-model="ds1.name" v-focus="focusState1" @input="handleFormSearch1">
                                        <el-button slot="append" icon="el-icon-search" @click="handleFormSearch1" />
                                    </el-input>
                                    <!-- 匹配规则 -->
                                    <el-radio-group v-model="ds1.likeType" @change="handleFormSearch1">
                                        <el-radio v-for="(opt,optIndex) in likeTypeList" :key="optIndex" :label="opt.value">{{ opt.label }}</el-radio>
                                    </el-radio-group>
                                </div>

                                <el-scrollbar style="max-height:350px;">
                                    <ul class="el-scrollbar__view el-select-dropdown__list">
                                        <template v-if="dsList1.length > 0">
                                            <li v-for="(d,dIndex) in dsList1" :key="dIndex" class="el-select-dropdown__item" @click="handleDsClick1(d)" @contextmenu="handleDsContextmenu1($event,d)">{{ d.name }}</li>
                                        </template>
                                        <li v-else>暂无数据</li>
                                    </ul>
                                </el-scrollbar>

                                <div class="ds-footer">
                                    <el-pagination :current-page="pageIndex" :page-sizes="pageSizes" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange1" @current-change="handleCurrentChange1" />
                                </div>

                                <div slot="reference" class="ds-container">
                                    <span v-if="form.tcmDiagnosisList && form.tcmDiagnosisList.length > 0" style="display: inline-block;width: auto;">
                                        <el-tag v-for="(tag,index) in form.tcmDiagnosisList" :key="index" :type="'info'" :size="'mini'" :hit="false" :closable="!disabled" :disable-transitions="false" @close="handleClose1(tag)">{{ tag.diseaseName }}</el-tag>
                                    </span>
                                    <span v-else class="placeholder">可搜索查询，可右键存疑</span>
                                </div>
                            </el-popover>
                            <!-- 右键 -->
                            <vue-context-menu :menu-data="menuData1" :context-menu-data="contextMenuData1" @inDoubt1="inDoubt1" />
                        </template>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row v-if="!disabled && isShow" style="text-align:right;">
                <el-button :size="size" @click="handleSaveTpl">存储为模板</el-button>
                <el-button :size="size" type="primary" @click="handlePrint">打印</el-button>
                <el-button :size="size" :loading="loading" type="primary" @click="handleConfirm">保存</el-button>
                <div id="qrcode" style="display:none;">
                    <div class="page">
                        <div class="qrcode">
                            <h2>相关知识二维码链接</h2>
                            <el-col v-for="(item,index) in qrCodeList" :key="index" :span="12" class="qrcode-item">
                                <img :src="item.qrcode" alt>
                                <span>{{ item.name }}</span>
                            </el-col>
                        </div>
                    </div>
                </div>
                <dialog-form ref="form2" :label-width="'120px'" :width="'450px'" :form-data="tplData" :form-edit="tplEdit" title="存储病历模板" @handleConfirm="handleTplConfirm" />
            </el-row>
        </el-form>
        <el-row v-if="disabled" style="text-align:right;">
            <el-button :size="size" type="primary" @click="handlePrint">病历打印</el-button>
        </el-row>
    </div>
</template>

<script>
import { uploadFile, deleteAttach } from '@/api/upload'
import { getQrcodes } from '@/api/arclinic'
import { getDiagnosticListByPage, getChinaDisease } from '@/api/catalog'
import { saveCaseTpl } from '@/api/outpatient'

import dialogImage from '@/components/DialogComponents/Image'
import vueContextMenu from '@/components/ContextMenu'
import dialogForm from '@/components/DialogComponents/Form'

import paginationMixin from '@/components/TabComponents/mixin'

import { remove_ie_header_and_footer } from '@/utils/print'
import { mapGetters } from 'vuex'
export default {
    components: {
        dialogImage,
        vueContextMenu,
        dialogForm
    },
    directives: {
        focus: {
            update: function(el, { value }) {
                if (value) {
                    el.children[0].focus()
                }
            }
        }
    },
    mixins: [paginationMixin],
    data() {
        return {
            contextMenuData: {
                menuName: 'contextmenu',
                axios: {
                    x: null,
                    y: null
                },
                menulists: [
                    {
                        fnHandler: 'inDoubt',
                        icoName: 'el-icon-question',
                        btnName: '存疑'
                    }
                ]
            },
            contextMenuData1: {
                menuName: 'contextmenu1',
                axios: {
                    x: null,
                    y: null
                },
                menulists: [
                    {
                        fnHandler: 'inDoubt1',
                        icoName: 'el-icon-question',
                        btnName: '存疑1'
                    }
                ]
            },
            menuData: null,
            menuData1: null,
            qrCodeList: [
                {
                    qrcode: 'http://shareee.com.cn/mgr/qr_code/1544774491969.jpg',
                    name: '小儿发热'
                },
                {
                    qrcode: 'http://shareee.com.cn/mgr/qr_code/1544774505844.jpg',
                    name: '如何选择退烧药'
                },
                {
                    qrcode: 'http://shareee.com.cn/mgr/qr_code/1544774518907.jpg',
                    name: '孩子咳嗽的八大误区'
                },
                {
                    qrcode: 'http://shareee.com.cn/mgr/qr_code/1544774531844.jpg',
                    name: '孩子咳嗽不宜吃什么'
                }
            ],
            chiefPopperVisible: false,
            form: {},
            title: '',
            imgUrl: '',
            popperWidth: 0,
            loading: false,
            symbolFlag: 0,
            qrCodes: [],
            ds: {
                name: '',
                likeType: 1
            },
            ds1: {
                name: '',
                likeType: 1
            },
            dsList: [],
            dsList1: [],
            likeTypeList: [
                {
                    value: 0,
                    label: '关键字匹配'
                },
                {
                    value: 1,
                    label: '顺序匹配'
                }
            ],
            focusState: false,
            focusState1: false,
            popoverVisible: false,
            popoverVisible1: false,
            tplData: [
                {
                    type: 'radio',
                    name: '病历模板类型',
                    field: 'templateType',
                    opts: [
                        {
                            value: 0,
                            label: '个人'
                        },
                        {
                            value: 1,
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
            tplEdit: null
        }
    },
    watch: {
        popoverVisible(newVal) {
            if (newVal) {
                this.ds = {
                    name: '',
                    likeType: 1
                }
                this.total = 0
                this.dsList = []
                this.focusState = true
            }
        },
        popoverVisible1(newVal) {
            if (newVal) {
                this.ds1 = {
                    name: '',
                    likeType: 1
                }
                this.total = 0
                this.dsList1 = []
                this.focusState1 = true
            }
        }
    },
    computed: {
        ...mapGetters(['basic', 'user'])
    },
    props: {
        disabled: { type: Boolean, default: false },
        patient: { type: Object, required: true },
        size: { type: String, default: 'small' },
        countLine: {
            // 一行排列几个
            default: 24
        },
        labelPosition: { type: String, default: 'right' },
        labelWidth: { type: String },
        forms: { type: Array }, // 表单组
        isShow: { type: Boolean, default: true }
    },
    created() {
        this.initforms()
        this.$root.eventHub.$on('tplReference', data => {
            this.initforms(data)
        })
    // this._getQrcodes()
    },
    methods: {
    // 门诊病历打印
        handlePrint() {
            const sign = this.user.electronicSignature
            let signUrl = ''
            if (sign && sign.length > 0) {
                signUrl = this.basic.filePrifix + sign[0].filePath
            }
            // 是否ie
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const patient = this.patient
            const form = this.form

            let content1 = '' // 过敏史
            if (
                form.isAllergies === 1 &&
        form.allergytList.length > 0 &&
        form.allergytList[0].allergyName
            ) {
                form.allergytList.forEach((a, aI) => {
                    content1 += `${aI + 1}、${a.allergyName || ''} ${a.reactionName || ''} ${a.degreeName ||
            ''}`
                })
            } else {
                content1 = '否认'
            }
            // 体格检查
            const content2 = `
                    ${form.bodyTemperature ? `体温：${form.bodyTemperature}°C&ensp;&ensp;` : ''}
                    ${form.respirationRate ? `呼吸：${form.respirationRate}次/分&ensp;&ensp;` : ''}
                    ${form.pulse ? `心率：${form.pulse}次/分&ensp;&ensp;` : ''}
                    ${form.sbp || form.dbp ? `血压：${form.sbp || ''}/${form.dbp || ''}mmHg` : ''}
                `
            // 诊断
            let content3 = ''
            if (form.diagnosisList && form.diagnosisList.length > 0) {
                form.diagnosisList.forEach((a, aI) => {
                    content3 += `${aI + 1}、${a.diseaseName} `
                })
            }
            let content4 = ''
            if (form.tcmDiagnosisList && form.tcmDiagnosisList.length > 0) {
                form.tcmDiagnosisList.forEach((a, aI) => {
                    content4 += `${aI + 1}、${a.diseaseName} `
                })
            }
            //
            let diaDogInfect = ''
            if (form.diaDogInfect && form.diaDogInfect.length > 0) {
                form.diaDogInfect.forEach(a => {
                    diaDogInfect += a + ','
                })
            }
            const mapList = [
                {
                    label: '过敏史',
                    content: content1
                },
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
                    value: 'operation',
                    isJudge: true
                },
                {
                    label: '输血史',
                    value: 'blood',
                    isJudge: true
                },
                {
                    label: '出生史',
                    value: 'birth',
                    isJudge: true
                },
                {
                    label: '喂养史',
                    value: 'feed',
                    isJudge: true
                },
                {
                    label: '个人史',
                    value: 'personalHistory',
                    isJudge: true
                },
                {
                    label: '家族史',
                    value: 'familyHistory',
                    isJudge: true
                },
                {
                    label: '月经史',
                    value: 'menstrualHistory',
                    isJudge: true
                },
                {
                    label: '体格检查',
                    content: content2
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
                    content: content3
                },
                {
                    label: '中医诊断',
                    content: content4
                },
                {
                    label: '中医辨证',
                    value: 'chinsesMedicineDialectical'
                },
                {
                    label: '用药史',
                    value: 'medicine'
                },
                {
                    label: '健康教育',
                    value: 'healthEducation'
                },
                {
                    label: '诊疗计划',
                    value: 'treatPlan',
                    isCode: true
                }
            ]
            let mainStr = ''
            mapList.forEach(item => {
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

            const qrcode = '' // document.getElementById('qrcode').innerHTML
            const content = `
                    <div class="print outpatient">
                        <div class="page">
                            <h1>全科诊疗记录</h1>
                            <div class="header">
                                <div>
                                    <span class="w50">${patient.name}&ensp;${patient.sex}&ensp;${
    patient.outpatientNum
}</span>
                                    <span class="w24">民族：${patient.nation}</span>
                                    <span class="w24">年龄：${patient.age}</span>
                                </div>
                                <div>
                                    <span class="w50">住址：${patient.address || ''}</span>
                                    <span class="w24">电话：${patient.phone}</span>
                                    <span class="w24">婚姻：${patient.matrialStatus}</span>
                                </div>
                                <div>
                                    <span class="w50">医生：${patient.doctorName}</span>
                                    <span class="w48">就诊时间：${patient.createTime}</span>
                                </div>
                            </div>
                            <div class="main">
                                <div class="basic">
                                    <span>是否初诊：${
    patient.isFirstClinic === 1 ? '是' : '否'
}</span>
                                    <span>发病时间：${
    form.morbidity ? form.morbidity.split(' ')[0] : ''
}</span>
                                    <span>${diaDogInfect.substring(
        0,
        diaDogInfect.length - 1
    )}</span>
                                </div>
                                ${mainStr}
                            </div>
                            <div class="footer">
                                <ul>
                                    <li>
                                        <span>看诊医生（签名）</span>
                                        ${
    signUrl
        ? `<img src="${signUrl}" style="height:40px;width:auto">`
        : `<span class="line"></span>`
}

                                    </li>
                                    <li>
                                        <span>离院日期：${patient.clinicCompletedTime}</span>
                                        <span>离院去向：${form.whereabouts || ''}</span>
                                    </li>
                                    <li>
                                        <span>家长（签名）</span>
                                        <span class="line"></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        ${qrcode}
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
            setTimeout(() => {
                window.print()
                window.location.reload()
                document.body.innerHTML = oldContent
                return false
            }, 100)
        },

        // 获取二维码
        _getQrcodes() {
            getQrcodes().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let result = []
                    if (d && d.length > 0) {
                        result = d
                    }
                    this.qrCodes = result
                }
            })
        },

        // 清除表单内容
        resetField(field) {
            this.form[field] = ''
        },

        // 初始化form
        initforms(edits) {
            const form = {
                allergyLineCount: 0,
                allergytList: [],
                attachmentList: [],
                diagnosisList: [],
                tcmDiagnosisList: []
            }
            this.forms.forEach(item => {
                if (!item.field) return false
                if (
                    item.type === 'checkbox' ||
          item.type === 'tab-select' ||
          item.type === 'tab-select1' ||
          item.multiple
                ) {
                    form[item.field] = []
                } else if (item.type === 'mixin-input') {
                    item.list.map(key => {
                        form[key.field] = ''
                    })
                } else {
                    if (item.field === 'isAllergies') {
                        form[item.field] = 0
                    } else if (item.field === 'isPlanInoculate') {
                        form[item.field] = 1
                    } else {
                        form[item.field] = ''
                    }
                }
            })
            if (edits) {
                this.form = Object.assign(form, edits)
            } else {
                this.form = Object.assign({}, form)
            }
            this.loading = false
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        isArrayFn(o) {
            return Object.prototype.toString.call(o) === '[object Array]'
        },

        // 给字段赋值
        initFields(obj) {
            for (const key in obj) {
                if (this.isArrayFn(this.form[key])) {
                    if (this.form[key].indexOf(obj[key]) > -1) return false
                    this.form[key].push(obj[key])
                } else {
                    this.form[key] = obj[key]
                }
            }
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        // 主诉显示位置
        handleShow() {
            this.popperWidth = this.$refs.form.$el.offsetWidth - 120
        },

        // 选择主诉
        handleChoose(name, flag) {
            // 主诉符号标识：0-没有上一次点击 1-上一次点击症状 2-上一次点击数字 3-上一次点击单位
            if (flag === 1) {
                if (
                    (this.form.chiefCompliant && this.form.chiefCompliant.indexOf(name) > -1) ||
          this.symbolFlag === 2
                ) {
                    return
                }
                this.form.chiefCompliant +=
          (this.form.chiefCompliant && this.symbolFlag === 1 ? '、' : '') + name
            } else if (flag === 2) {
                this.form.chiefCompliant += name
            } else if (flag === 3) {
                if (this.symbolFlag !== 2) {
                    return
                }
                this.form.chiefCompliant += name + ';'
            }
            this.handleEmit()
            this.symbolFlag = flag
        },

        // 主诉改变
        handleChiefCompliantChange() {
            this.symbolFlag = 0
            this.handleEmit()
        },

        // 提交主诉改变
        handleEmit() {
            this.$emit('chiefCompliantChange', this.form.chiefCompliant)
        },

        // 切换过敏史
        switchAllergy() {
            if (this.form.allergyLineCount > 0) {
                return false
            } else {
                this.addAllergy()
            }
        },

        // 新增过敏史
        addAllergy() {
            this.form.allergyLineCount++
            this.form.allergytList.push({
                allergyName: '',
                reactionName: '',
                degreeName: ''
            })
        },

        // 移除过敏史
        minusAlleray(index) {
            this.form.allergyLineCount--
            this.form.allergytList.splice(index, 1)
        },

        // 给诊断赋值
        concatDiagnisis(d) {
            const flag = this.form.diagnosisList.some((item, index) => {
                return item.diseaseCode === d.diseaseCode
            })
            if (flag) return false
            this.form.diagnosisList.push(d)
        },

        // 诊断行点击
        handleDsClick(row, isInDoubt = false) {
            const flag = this.form.diagnosisList.some((item, index) => {
                return item.diseaseCode === row.code
            })
            if (flag) {
                this.$message.error('已有诊断，无需重复添加！')
                return false
            }
            this.form.diagnosisList.push({
                diagnosisType: row.classValue,
                diseaseCode: row.code,
                diseaseName: row.name + (isInDoubt ? '?' : '')
            })
            this.pageIndex = 1
            this.ds = {
                name: '',
                likeType: 1
            }
            this.popoverVisible = false
        },

        // 诊断右键
        handleDsContextmenu(event, d) {
            event.preventDefault()
            var x = event.clientX
            var y = event.clientY
            this.menuData = d
            this.contextMenuData.axios = { x, y }
        },

        // 存疑诊断
        inDoubt(row) {
            this.handleDsClick(row, true)
        },

        // 移除诊断
        handleClose(tag) {
            this.form.diagnosisList.forEach((item, index) => {
                if (item.diseaseCode === tag.diseaseCode) {
                    this.form.diagnosisList.splice(index, 1)
                }
            })
        },

        // 诊断行点击
        handleDsClick1(row, isInDoubt = false) {
            const flag = this.form.tcmDiagnosisList.some((item, index) => {
                return item.diseaseCode === row.code
            })
            if (flag) {
                this.$message.error('已有诊断，无需重复添加！')
                return false
            }
            this.form.tcmDiagnosisList.push({
                diagnosisType: '中医诊断',
                diseaseCode: row.code,
                diseaseName: row.name + (isInDoubt ? '?' : '')
            })
            this.pageIndex = 1
            this.ds1 = {
                name: '',
                likeType: 1
            }
            this.popoverVisible1 = false
        },

        // 诊断右键
        handleDsContextmenu1(event, d) {
            event.preventDefault()
            var x = event.clientX
            var y = event.clientY
            this.menuData1 = d
            this.contextMenuData1.axios = { x, y }
        },

        // 存疑诊断
        inDoubt1(row) {
            this.handleDsClick1(row, true)
        },

        // 移除诊断
        handleClose1(tag) {
            this.form.tcmDiagnosisList.forEach((item, index) => {
                if (item.diseaseCode === tag.diseaseCode) {
                    this.form.tcmDiagnosisList.splice(index, 1)
                }
            })
        },

        // 表单查询
        handleFormSearch() {
            this.pageIndex = 1
            this.handleSearch()
        },

        // 查询诊断
        handleSearch() {
            const form = this.ds
            if (form.name) {
                const params = {
                    pageNo: this.pageIndex,
                    pageSize: this.pageSize,
                    isUse: 1,
                    name: form.name,
                    likeType: form.likeType
                }
                getDiagnosticListByPage(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        let result = []
                        if (d.total > 0) {
                            result = d.records
                        }
                        this.total = d.total
                        this.dsList = result
                    }
                })
            } else {
                this.total = 0
                this.dsList = []
            }
        },

        // 表单查询
        handleFormSearch1() {
            this.pageIndex = 1
            this.handleSearch1()
        },

        // 查询诊断
        handleSearch1() {
            const form = this.ds1
            if (form.name) {
                const params = {
                    pageNo: this.pageIndex,
                    pageSize: this.pageSize,
                    // isUse: 1,
                    name: form.name,
                    likeType: form.likeType
                }
                getChinaDisease(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        let result = []
                        if (d.total > 0) {
                            result = d.records
                        }
                        this.total = d.total
                        this.dsList1 = result
                    }
                })
            } else {
                this.total = 0
                this.dsList1 = []
            }
        },

        // 跳转页码
        handleCurrentChange1(val) {
            this.pageIndex = val
            this.handleSearch1()
        },

        // 切换页面显示条数
        handleSizeChange1(val) {
            this.pageSize = val
            this.handleSearch1()
        },

        // 点击上传
        uploadFile() {
            this.$refs.fileInput[0].click()
        },

        // 上传文件
        fileChange(e) {
            var files = e.target.files
            var formData = new FormData()
            formData.append('fileType', 41)

            for (let i = 0, len = files.length; i < len; i++) {
                const file = files[i]
                const size = file.size
                if (file.type === 'image/jpeg' || file.type === 'image/png') {
                    if (size > 1024 * 1024 * 3) {
                        this.$message.error('文件大小不可超过3M！')
                        return false
                    }
                } else {
                    this.$message.error('请上传jpg、png格式文件！')
                    return false
                }
                formData.append('file', file)
            }
            uploadFile(formData).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.form.attachmentList.push(...d)
                    this.$message.success('上传成功')
                }
            })
        },

        // 预览图片
        handlePreviewImage(file) {
            this.title = file.fileName
            this.imgUrl = this.$store.getters.basic.filePrifix + file.filePath
            this.$refs.preview[0].open()
        },

        // 删除图片
        handleDeleteImage(file, index) {
            if (this.disabled) return false
            this.$confirm(`确定移除 ${file.fileName}？`)
                .then(() => {
                    deleteAttach(file.filePath, file.id ? file.id : 0).then(res => {
                        if (res.STATUS === '1') {
                            this.form.attachmentList.splice(index, 1)
                            this.$message.success('移除成功！')
                            this.$emit('freshCache', this.form.attachmentList)
                        }
                    })
                })
                .catch(() => {})
        },

        // 保存
        handleConfirm() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (this.form.diagnosisList.length > 0) {
                        this.$emit('handleConfirm', this.form)
                    } else {
                        this.$confirm('该患者的诊断没有填写，是否需要保存?', '提示', {
                            type: 'warning'
                        })
                            .then(res => {
                                this.$emit('handleConfirm', this.form)
                            })
                            .catch(() => {})
                    }
                }
            })
        },

        // 保存为模板
        handleSaveTpl() {
            const form = this.form
            if (form.chiefCompliant && form.diagnosisList.length > 0) {
                const dsList = form.diagnosisList
                this.tplEdit = {
                    templateType: 0,
                    templateName: dsList[0].diseaseName
                }
                this.$refs.form2.open()
            } else {
                this.$message.error('病历模板中主诉和诊断不可为空！')
            }
        },

        // 确认模板
        handleTplConfirm(form) {
            const _form = this.form
            const params = {
                diagnosisTemplates: _form.diagnosisList,
                opDrCaseTemplate: {
                    chiefCompliant: _form.chiefCompliant,
                    healthEducation: _form.healthEducation,
                    otherBodyExam: _form.otherBodyExam,
                    pastHistory: _form.pastHistory,
                    presentIllness: _form.presentIllness,
                    templateName: form.templateName,
                    templateType: form.templateType,
                    treatPlan: _form.treatPlan,
                    chinsesMedicineDialectical: _form.chinsesMedicineDialectical
                }
            }
            saveCaseTpl(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('模板保存成功')
                        this.$root.eventHub.$emit('tplSave', form.templateType)
                        this.$refs.form2.close()
                    }
                })
                .catch(() => {
                    this.$refs.form2.loading = false
                })
        },

        validCaseInfo() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (this.form.diagnosisList.length > 0) {
                        this.$emit('handleConfirm', true)
                    } else {
                        this.$confirm('该患者的诊断没有填写，是否需要保存?', '提示', {
                            type: 'warning'
                        })
                            .then(res => {
                                this.$emit('handleConfirm', true)
                            })
                            .catch(() => {})
                    }
                } else {
                    this.$emit('handleConfirm', false)
                }
            })
        }
    }
}
</script>

<style lang="scss">
.border-checkbox {
  .el-checkbox.is-bordered.el-checkbox {
    padding: 5px 10px 5px 5px;
    height: 30px;
    .el-checkbox__label {
      padding-left: 5px;
    }
  }
}
.chief-tell {
  .line {
    font-size: 12px;
    color: #606266;
    border-bottom: 1px dashed #ccc;
    padding: 10px 0;
    line-height: 1.5;
    .name {
      width: 65px;
      float: left;
      text-align: right;
    }
    .list {
      width: calc(100% - 65px);
      float: left;
      span {
        display: inline-block;
        cursor: pointer;
        padding: 0 4px;
      }
    }
  }
}
.mixin-input {
  margin-bottom: 0 !important;
  .el-form-item__content {
    .el-input {
      width: 100px;
    }
    .el-date-editor {
      width: 135px;
    }
    .suffix {
      display: inline-block;
      color: #606266;
      .el-form-item__error {
        left: -36px;
      }
      &:not(:last-child) {
        margin-right: 10px;
      }
      label {
        font-size: 12px;
        padding-right: 0;
      }

      span {
        font-size: 12px;
      }
    }
  }
}
.mixin-select {
  .el-form-item__content {
    > span {
      display: inline-block;
      &:not(:first-child) {
        margin-top: 10px;
      }
      .el-select {
        width: 160px;
        margin-right: 5px;
      }
      .el-button {
        padding: 9px 10px;
        + .el-button {
          margin-left: 5px;
        }
      }
    }
  }
}
.filter-mul-select {
  .el-select__tags > span {
    display: inline-block;
    width: auto;
  }
}
.upload {
  span {
    color: #606266;
    padding-left: 10px;
  }
}
.img-list {
  margin-top: 10px;
  .el-upload-list--picture-card {
    .el-upload-list__item {
      width: 136px;
      height: 136px;
    }
  }
}
.red-background .el-input__inner {
  background: #c92639;
  color: #fff;
  border-color: #c30d23 !important;
}
.blue-background .el-input__inner {
  background: #0097ff;
  color: #fff;
  border-color: #036eb8 !important;
}
.ds-header {
  p {
    text-align: center;
    line-height: 28px;
    padding-bottom: 5px;
    font-size: 16px;
  }
  .el-input-group {
    width: 50%;
  }
  .el-radio-group {
    transform: translate(10px, 5px);
  }
}
.ds-footer {
  text-align: right;
}
.ds-container {
  min-height: 32px;
  padding: 0 15px 0 5px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  color: #606266;
  cursor: pointer;
  > span {
    display: inline-block !important;
    width: auto;
    &.placeholder {
      font-size: 14px;
      color: #c0c4cc;
      padding-left: 10px;
    }
  }
  .el-tag {
    border-color: transparent;
    background-color: #f0f2f5;
    margin: 2px 0 2px 6px;
    &:first-child {
      margin-left: 0;
    }
  }
  .el-tag__close.el-icon-close {
    background-color: #c0c4cc;
    right: -7px;
    top: 0;
    color: #fff;
    vertical-align: 0;
    margin-top: 0;
    &:hover {
      background-color: #909399;
    }
  }
}
</style>

<style lang="scss">
// .out-wrapper {
//   position: relative;
//   .ctr-btn {
//     position: absolute;
//     z-index: 99;
//     right: 10px;
//     a {
//       display: inline-block;
//       font-size: 14px;
//       font-weight: 400;
//       text-align: center;
//       border-radius: 3px;
//       background-color: #333;
//       padding: 10px 15px;
//       color: #fff;
//       transition: all 0.2s ease-out 0s;
//       opacity: 0.8;
//       cursor: pointer;
//       i {
//         margin-right: 5px;
//       }
//       &:hover {
//         opacity: 1;
//       }
//     }
//   }
// }
.popoverClass {
  margin-top: 0 !important;
}
</style>

