<template>
    <div class="detail">
        <el-dialog :title="title" :visible.sync="centerDialogVisible" width="500px" @close="close" center>
            <div v-loading="loading">
                <el-row class="topTitle">
                    <!-- <el-col :span="16"><b>NO.</b>201809130001</el-col> -->
                    <span>{{patientInfo.className}}</span>
                </el-row>
                <p class="clinicTitle">{{clinicName}}</p>
                <p class="smallTitle">处方笺</p>
                <div class="info">
                    <el-row>
                        <el-col :span="col.spanCount?col.spanCount:24" v-for="(col,colIndex) in patientColumns" :key="colIndex"><b>{{col.label}}：</b>{{patientInfo[col.value]}}</el-col>
                    </el-row>
                </div>
                <el-scrollbar class="RP">
                    <p>RP:</p>
                    <!-- 西药 -->
                    <ul class="western-medicine" v-if="westernList && westernList.length > 0">
                        <li v-for="(item,index) in westernList" :key="index">
                            <div class="clearfix">
                                <span style="width:4%;">{{index + 1}}.</span>
                                <span style="width:70%;">{{item.itemName}}【{{item.spec}}】</span>
                                <span style="width:15%;float:right">{{item.qty}}{{item.unit}}</span>
                            </div>
                            <div class="clearfix">
                                <span style="width:15%;text-align:center;">Sig.</span>
                                <span style="width:83%;">每次{{item.dosage}}{{item.dosageUnit}}，{{item.usage}} {{item.frequency}}</span>
                            </div>
                            <div class="clearfix" v-if="item.note" style="color:red;padding-left:20px">备注：{{item.note}}</div>
                        </li>
                    </ul>
                    <!-- 中药 -->
                    <div v-if="chineseList && chineseList.length > 0">
                        <ul class="chinese-medicine">
                            <li v-for="(item,index) in chineseList" :key="index">
                                <label> {{item.itemName}}</label> &ensp;&ensp;{{item.dosage || ''}}{{item.dosageUnit}}
                            </li>
                        </ul>
                        <div class="daily-setting">
                            <div>剂数： 一剂 </div>
                            <div style="margin-top:3px;">
                                用法用量：
                                配{{chineseList[0].days}}副
                                {{chineseList[0].frequency}}
                                每次{{chineseList[0].dose || ''}}{{chineseList[0].doseUnit}}
                                {{chineseList[0].usage}}
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
                <span class="totalAmt">药品总金额：￥{{recipeInfo.chargeAmount}}</span>
                <div class="sign">
                    <b>医师:</b>
                    <span>{{patientInfo.doctorName}}</span>
                    <b>审方药师:</b>
                    <span>{{patientInfo.checkedUserName}}</span>
                    <b>配药药师:</b>
                    <span></span>
                    <b>发药药师:</b>
                    <span></span>
                </div>
                <div class="audit" v-if="type === 'audit'">
                    <p v-if="patientInfo.remark" style="margin-top:5px">医生备注：{{patientInfo.remark}}</p>
                    <div class="auditSelect">
                        <span>审核：</span>
                        <el-radio-group v-model="auditInfo.checkedStatus" @change="handleChange">
                            <el-radio :label="1">审核通过</el-radio>
                            <el-radio :label="2">拒绝通过</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="auditSelect" v-if="auditInfo.checkedStatus === 2">
                        <span></span>
                        <el-checkbox-group v-model="auditInfo.refuseExt">
                            <el-checkbox label="不规范"></el-checkbox>
                            <el-checkbox label="不适宜"></el-checkbox>
                            <el-checkbox label="不合法"></el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="auditSelect">
                        <span>审核备注：</span>
                        <el-input type="textarea" :rows="3" placeholder="请输入内容" maxlength="500" v-model="auditInfo.checkedNote">
                        </el-input>
                    </div>
                </div>
                <div class="audit" v-if="type === 'detail'">
                    <p v-if="patientInfo.remark" style="margin-top:5px">医生备注：{{patientInfo.remark}}</p>
                    <div class="auditSelect">
                        <span>审核结果：</span>
                        <em>{{patientInfo.refuseExt?`${patientInfo.checkedStatus}（${patientInfo.refuseExt}）`:`${patientInfo.checkedStatus}`}}</em>
                    </div>
                    <div class="auditSelect">
                        <span>审核备注：{{patientInfo.checkedNote}}</span>
                    </div>
                </div>

            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close" v-if="type === 'audit'">取 消</el-button>
                <el-button type="primary" @click="handleAudit" v-if="type === 'audit'" :loading="loading">确 认</el-button>
                <el-button type="primary" @click="handleAudit('next')" v-if="type === 'audit' && len > 1" :loading="loading">确认并跳转至下张</el-button>
                <el-button v-if="type === 'detail'" @click="close">返回</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import {
    recipeCheck,
    getRecipeDetailByrecipeId,
    getRecipeDetailBycheckId,
    recipeClock
} from '@/api/outpatient'
import { getDictByIdList } from '@/api/catalog'
import { formatSex, formatDictMap, getBabyAge } from '@/utils'
import { toFixed } from '@/utils/float'
export default {
    data() {
        const dictMap = {
            144: [], // 用法-西药
            145: [], // 给药频次
            152: [], // 用法-中药
            483: [] // 每日剂量单位
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
            loading: false,
            centerDialogVisible: false,
            title: '',
            patientColumns: [
                {
                    label: '门诊/住院号',
                    value: 'outpatientNum',
                    spanCount: 10
                },
                {
                    label: '科室/病区',
                    value: 'deptName',
                    spanCount: 8
                },
                {
                    label: '就诊类型',
                    value: 'outpatientType',
                    spanCount: 6
                },
                {
                    label: '姓名',
                    value: 'patientName',
                    spanCount: 10
                },
                {
                    label: '性别',
                    value: 'sex',
                    spanCount: 8
                },
                {
                    label: '年龄',
                    value: 'age',
                    spanCount: 6
                },
                {
                    label: '开具日期',
                    value: 'prescribingTime'
                },
                {
                    label: '临床诊断',
                    value: 'diseaseName'
                },
                {
                    label: '中医诊断',
                    value: 'tcmDiagnosis'
                }
            ],
            patientInfo: {},
            auditInfo: {
                checkedStatus: 1,
                refuseExt: [],
                checkedNote: ''
            },

            recipeInfo: {},
            westernList: [],
            chineseList: [],
            dictMap,
            type: '',
            clinicName: '',
            len: ''
        }
    },
    methods: {
        open(row, type, len) {
            this.loading = true
            this.centerDialogVisible = true
            row.chargeAmount = toFixed(row.chargeAmount, 2)
            this.recipeInfo = row
            this.type = type
            this.len = len
            this.title = type === 'audit' ? '药 方 审 核' : '审 核 详 情'
            if (type === 'audit') {
                this.getUnauditedDetail()
                this.auditInfo = {
                    checkedStatus: 1,
                    refuseExt: [],
                    checkedNote: ''
                }
            } else {
                this.getAuditDetail()
            }
        },
        close() {
            // 解锁
            if (this.type === 'audit') {
                recipeClock(this.recipeInfo.recipeId).then(res => {
                    if (res.STATUS === '1') {
                        this.centerDialogVisible = false
                    }
                })
                this.auditInfo = {
                    checkedStatus: 1,
                    refuseExt: [],
                    checkedNote: ''
                }
            } else {
                this.centerDialogVisible = false
            }
        },

        // 获取待审核详情
        getUnauditedDetail() {
            this.chineseList = []
            this.westernList = []
            getRecipeDetailByrecipeId(this.recipeInfo).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const recipeInfo = {
                        diseaseName: this.recipeInfo.mainDiseaseName,
                        tcmDiagnosis: this.recipeInfo.tcmDiagnosis,
                        createTime: this.recipeInfo.createTime,
                        doctorName: this.recipeInfo.doctorName,
                        checkedUserName: this.recipeInfo.checkedUserName,
                        className: this.recipeInfo.className,
                        prescribingTime: this.recipeInfo.prescribingTime
                    }
                    this.patientInfo = Object.assign(d.register, recipeInfo)
                    this.patientInfo.sex = formatSex(this.patientInfo.sex)
                    this.patientInfo.age = getBabyAge(this.patientInfo.birthDate)
                    this.patientInfo.outpatientType = this.patientInfo.outpatientType || '门诊'
                    this.patientInfo.remark = d.remark

                    d.details.forEach(item => {
                        if (item.chara === '10') {
                            item.usage = formatDictMap(this.dictMap[144], item.usage)
                            item.frequency = formatDictMap(this.dictMap[145], item.frequency)
                            this.westernList.push(item)
                        } else if (item.chara === '20') {
                            item.usage = formatDictMap(this.dictMap[152], item.usage)
                            item.doseUnit = formatDictMap(this.dictMap[483], item.doseUnit)
                            item.frequency = formatDictMap(this.dictMap[145], item.frequency)
                            this.chineseList.push(item)
                        }
                    })
                    this.$nextTick(() => {
                        this.loading = false
                    })
                }
            })
        },

        // 获取已审核详情
        getAuditDetail() {
            this.chineseList = []
            this.westernList = []
            getRecipeDetailBycheckId(this.recipeInfo).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const recipeInfo = {
                        diseaseName: this.recipeInfo.mainDiseaseName,
                        tcmDiagnosis: this.recipeInfo.tcmDiagnosis,
                        createTime: this.recipeInfo.createTime,
                        checkedNote: this.recipeInfo.checkedNote,
                        checkedStatus: this.recipeInfo.checkedStatus,
                        refuseExt: this.recipeInfo.refuseExt,
                        doctorName: this.recipeInfo.doctorName,
                        checkedUserName: this.recipeInfo.checkedUserName,
                        className: this.recipeInfo.className,
                        prescribingTime: this.recipeInfo.prescribingTime
                    }
                    this.patientInfo = Object.assign(d.register, recipeInfo)
                    this.patientInfo.sex = formatSex(this.patientInfo.sex)
                    this.patientInfo.age = getBabyAge(this.patientInfo.birthDate)
                    this.patientInfo.outpatientType = this.patientInfo.outpatientType || '门诊'
                    this.patientInfo.checkedStatus = this.patientInfo.checkedStatus === 1 ? '通过' : '未通过'
                    this.patientInfo.remark = d.remark
                    d.details.forEach(item => {
                        if (item.chara === '10') {
                            item.usage = formatDictMap(this.dictMap[144], item.usage)
                            item.frequency = formatDictMap(this.dictMap[145], item.frequency)
                            this.westernList.push(item)
                        } else if (item.chara === '20') {
                            item.usage = formatDictMap(this.dictMap[152], item.usage)
                            item.doseUnit = formatDictMap(this.dictMap[483], item.doseUnit)
                            item.frequency = formatDictMap(this.dictMap[145], item.frequency)
                            this.chineseList.push(item)
                        }
                    })
                    this.$nextTick(() => {
                        this.loading = false
                    })
                }
            })
        },

        // 审核处方
        handleAudit(val) {
            this.loading = true
            const data = Object.assign(this.auditInfo, {
                id: this.recipeInfo.id,
                recipeId: this.recipeInfo.recipeId
            })
            data.refuseExt = data.refuseExt.join(',')
            recipeCheck(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.$emit('handleSuccess')
                    this.$nextTick(() => {
                        if (val === 'next') {
                            this.$emit('nextAudit')
                        } else {
                            this.centerDialogVisible = false
                        }
                        this.loading = false
                    })
                }
            })
        },

        handleChange(val) {
            if (val === 1) {
                this.auditInfo.refuseExt = []
            }
        }
    },
    mounted() {
        this.clinicName = this.$store.getters.clinic.orgName
    }
}
</script>
<style lang="scss" scoped>
.topTitle {
    font-size: 14px;
    text-align: right;
    span {
        display: inline-block;
        border: 1px solid #000;
        padding: 2px 5px;
    }
}
.clinicTitle {
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    margin-top: 2px;
}
.smallTitle {
    text-align: center;
    font-size: 15px;
    margin-top: 5px;
}
.info {
    width: 100%;
    margin-top: 10px;
    p {
        border-bottom: 1px solid #333;
        font-size: 14px;
        padding-bottom: 3px;
    }
    .el-row {
        font-size: 13px;
        padding: 5px 0 8px;
        border-bottom: 1px solid #333;
        border-top: 1px solid #333;
        .el-col {
            margin-top: 5px;
            b {
                font-weight: bold;
            }
        }
    }
}
.RP {
    width: 100%;
    margin-top: 10px;
    height: 150px;
    p {
        font-weight: bold;
        font-size: 18px;
    }
    ul.western-medicine {
        margin-top: 5px;
        li {
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
            div {
                span {
                    display: block;
                    min-height: 1px;
                    float: left;
                    line-height: 20px;
                    text-align: left;
                    border: none;
                    padding: 0;
                }
            }
        }
    }
    ul.chinese-medicine {
        overflow: hidden;
        zoom: 1;
        padding-bottom: 10px;
        border-bottom: 1px solid #000;
        li {
            float: left;
            margin-top: 10px;
            min-width: 24%;
            label {
                font-weight: normal;
            }
        }
    }
    .daily-setting {
        margin-top: 10px;
        border-bottom: 1px solid #000;
        padding-bottom: 10px;
    }
}
.totalAmt {
    display: block;
    text-align: right;
    border-bottom: 1px solid #333;
    padding: 10px 20px 10px 0;
}
.sign {
    border-bottom: 1px solid #81879d;
    padding: 20px 0 15px;
    font-size: 13px;
    overflow: hidden;
    b {
        font-weight: bold;
        float: left;
    }
    span {
        border-bottom: 1px solid #333;
        width: 58px;
        display: block;
        margin-right: 4.6px;
        float: left;
        height: 19px;
        text-align: center;
    }
}
.auditSelect {
    margin-top: 10px;
    span {
        margin-bottom: 5px;
        display: inline-block;
        min-width: 42px;
    }
    em {
        font-style: normal;
        color: red;
    }
    .el-radio {
        margin-left: 30px;
    }
    .el-radio + .el-radio {
        margin-left: 100px !important;
    }
    .el-checkbox-group {
        display: inline-block;
        margin-left: 30px;
    }
}
</style>

<style lang="scss">
.detail {
    .el-dialog {
        position: absolute;
        left: 50%;
        margin-left: -250px;
        margin-bottom: 50px;
        // bottom:50px;
    }
    .el-dialog__header {
        padding: 10px 20px 10px;
        background: #0097ff;
    }
    .el-dialog__close,
    .el-dialog__title {
        color: #fff;
    }
    .el-dialog__headerbtn {
        top: 15px;
    }
    .el-dialog__footer {
        padding: 10px 0 20px;
        border-top: 1px solid #ddd;
    }
    .el-dialog--center .el-dialog__body {
        padding: 15px 25px 10px;
        color: #333;
    }
    .el-textarea__inner {
        resize: none;
    }
}
</style>

