<template>
    <el-row class="page-main">
        <p class="title-right">
            <span class="title">{{ type === 'cancelCredit' ? '取消记账':type === 'refund'?'退费': '详情' }}</span>
            <el-button plain icon="el-icon-arrow-left" @click="backList">返回</el-button>
        </p>
        <el-row :gutter="20">
            <el-col :sm="24" :md="4">
                <patient-card :patient="patient" :panel-ellist="patientElList" li-list-style="margin-top:20px" />
            </el-col>
            <!-- 可修改的退费 -->
            <el-col v-if="step === 1" :sm="24" :md="20">
                <!-- 退费项目 -->
                <div v-if="type === 'refund' || type === 'cancelCredit'">
                    <p>{{ type === 'cancelCredit' ? '取消记账项目': '已收费项目' }}</p>
                    <el-table-self ref="multipleTable" :tab-type="'selection'" :columns="refundColumns" :table-data="refundList" :selec-table="handleSelecTable" style="margin-top:20px;" type="number" @blurCell="changeNum" @selectChange="handleSelectChange" @selectAll="handleSelectAll" />
                    <div class="info">
                        <!-- <p class="zhushi">*该收费项目使用了医保、商保、减免、记账和卡券支付和积分抵扣中的一种，只能全额退款。</p> -->
                        <div class="sum">
                            <p>
                                <span>退费合计：</span>
                                <span>￥{{ priceSum }}</span>
                            </p>
                            <p>
                                <span>退费减免合计：</span>
                                <span>￥{{ crossClainSum }}</span>
                            </p>
                            <p>
                                <span>应退金额：</span>
                                <span>￥{{ refundAccount }}</span>
                            </p>
                        </div>
                    </div>
                    <div class="submit-btn">
                        <el-button class="refundBtn" @click="refund">{{ type === 'cancelCredit' ? '取消记账': '退费' }}</el-button>
                    </div>
                </div>
                <!-- 退费详情 -->
                <div v-if="type === 'refundDetail' || type === 'chargeDetail'">
                    <p v-if="type === 'refundDetail'">已退费项目</p>
                    <p v-else>已收费项目</p>
                    <el-table-self :columns="detailColumns" :table-data="detailList" style="margin-top:20px;" type="number" @blurCell="changeNum" />
                    <div class="info">
                        <div class="sum">
                            <p>
                                <span>合计：</span>
                                <span>￥{{ chargeCount }}</span>
                            </p>
                        </div>
                    </div>
                    <div class="submit-btn">
                        <el-button class="refundBtn" @click="printDetail('A4')">{{ `打印${type === 'refundDetail'?'退费':'收费'}明细(A4)` }}</el-button>
                        <el-button class="refundBtn" @click="printDetail('xp')">{{ `打印${type === 'refundDetail'?'退费':'收费'}明细(小票)` }}</el-button>
                        <el-button class="refundBtn" @click="printTicket">打印票据单</el-button>
                        <el-button v-if="isPrintInvoice" class="refundBtn" @click="print">打印明细发票</el-button>
                        <el-button v-if="isPrintInvoice" class="refundBtn" @click="printCharge('发票')">打印收费类型发票</el-button>
                    </div>
                </div>
            </el-col>
            <!-- 确认退费退药 -->
            <el-col v-if="step === 2" :sm="24" :md="20">
                <el-table-self key="second" :columns="conrefundColumns" :table-data="conrefundList" style="height:520px;border-bottom:1px solid #ebeef5;overflow-y:scroll" tab-type="index" tab-label=" " />
                <div class="refund">
                    <div class="account">
                        <p>应退金额：</p>
                        <p>￥{{ finalAccount }}</p>
                    </div>
                    <div class="refundType">
                        <p>退款方式：</p>
                        <p>(人工处理)</p>
                    </div>
                    <div class="select">
                        <div v-for="(item,index) in chargeTypeList" v-if="chargeTypeList && chargeTypeList.length > 0" :key="index">
                            <img :src="item.itemCode === '01'?amount:item.itemCode === '02'?alipayUrl:item.itemCode === '03'?wechatUrl:item.itemCode === '04'?card:item.itemCode === '05'?account:item.itemCode === '21'?medical:item.itemCode === '11'?medical:item.itemCode === '31'?yky:''">
                            <span>{{ item.itemName }}：{{ item.itemAmt }}</span>
                        </div>
                    </div>
                </div>
                <div class="infos">
                    <el-button class="refundBtn" @click="finalRefund">确认退费</el-button>
                </div>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import childAvatar from '@/assets/icon_images/child-avatar.png'
import maleAvatar from '@/assets/icon_images/male-avatar.png'
import femaleAvatar from '@/assets/icon_images/female-avatar.png'
import patientCard from '@/components/Panel/PatientCard'
import elTableSelf from '@/components/TabComponents/index'
import { patientInfo } from '@/api/arclinic'
import { getChargeDetail, refundCost } from '@/api/charge'
import { mapGetters } from 'vuex'
import { getBabyAge, formatSex, param, encryptStar } from '@/utils'
import { toFixed, multiply, getFloat } from '@/utils/float'
import { getCurrentDay } from '@/utils/common'
import { getDictByIdList } from '@/api/catalog'
import amount from '@/assets/icon_images/amount.png'
import alipayUrl from '@/assets/icon_images/alipay.png'
import wechatUrl from '@/assets/icon_images/wechat.png'
import card from '@/assets/icon_images/card.png'
import account from '@/assets/icon_images/account.png'
import medical from '@/assets/icon_images/medical.png'
import yky from '@/assets/icon_images/yky.png'

import {
    handlePrintCount,
    handlePrintDetail,
    handlePrintDetailxp,
    handlePrintBillxp,
    handlePrintBillmx
} from '../commonPrint.js'
export default {
    components: {
        patientCard,
        elTableSelf
    },
    data() {
        const payData = [
            { name: '支付宝', value: '02' },
            { name: '微信', value: '03' },
            { name: '银联', value: '04' },
            { name: '现金', value: '01' }
        ]
        const payInfo = []
        this._.forEach(payData, function(item) {
            payInfo.push({
                label: param({
                    name: item.name,
                    value: item.value
                })
            })
        })
        const refundProcess = this.commonUtil.getConfigValue('refundProcess')
        return {
            currentTime: '',
            amount,
            medical,
            alipayUrl,
            receivedCash: 0,
            wechatUrl,
            card,
            account,
            yky,
            unknownAvatar,
            childAvatar,
            patientInfo: {},
            info: [],
            typeInfo: [[], [], [], [], []],
            costInfo: [0, 0, 0, 0, 0],
            area: '',
            maleAvatar,
            clinicTime: '',
            yibaoAmt: 0,
            shangbaoAmt: 0,
            receiverName: '',
            chargeSource: '',
            chargeAccount: 0,
            doctorName: '',
            otherName: '',
            femaleAvatar,
            patient: {
                name: '',
                avatar: '',
                sex: '',
                age: '',
                maritalStatus: '',
                outpatientNumber: '',
                visitTime: ''
            },
            // 退费的个人信息
            patientElList: {
                liList: [
                    {
                        name: '性别',
                        value: 'sex'
                    },
                    {
                        name: '年龄',
                        value: 'age'
                    },
                    {
                        name: '婚姻状况',
                        value: 'maritalStatus'
                    },
                    {
                        name: '病历号',
                        value: 'outpatientNumber'
                    },
                    {
                        name: '就诊日期',
                        value: 'visitTime'
                    }
                ]
            },
            // 退费项目模板
            refundColumns: [
                {
                    value: 'name',
                    label: '收费名称',
                    align: 'center',
                    width: 280
                },
                {
                    value: 'spec',
                    label: '规格',
                    align: 'center',
                    width: 280
                },
                {
                    value: 'unit',
                    label: '单位',
                    align: 'center',
                    width: 80
                },
                {
                    value: 'price',
                    label: '单价',
                    align: 'center'
                },
                {
                    value: 'num',
                    label: '数量',
                    align: 'center'
                },
                {
                    value: 'zongAccount',
                    label: '金额',
                    align: 'center'
                },
                {
                    value: 'crossClain',
                    label: '减免金额',
                    align: 'center'
                },
                {
                    value: 'refundNum',
                    label: '退费数量',
                    align: 'center',
                    operType: 'input',
                    type: 'refund',
                    disabled: false
                },
                {
                    value: 'refundAccount',
                    label: '退费金额',
                    align: 'center'
                },
                {
                    value: 'refundCrossAccount',
                    label: '退费减免金额',
                    align: 'center'
                },

                {
                    value: 'section',
                    label: '科室',
                    align: 'center'
                },
                {
                    value: 'attendingDoctor',
                    label: '接诊医生',
                    align: 'center'
                }
            ],
            // 退费详情表单
            detailColumns: [
                {
                    value: 'name',
                    label: '收费名称',
                    align: 'center',
                    width: 300
                },
                {
                    value: 'spec',
                    label: '规格',
                    align: 'center',
                    width: 300
                },
                {
                    value: 'unit',
                    label: '单位',
                    align: 'center',
                    width: 80
                },
                {
                    value: 'price',
                    label: '单价',
                    align: 'center'
                },
                {
                    value: 'num',
                    label: '数量',
                    align: 'center',
                    width: 100
                },
                {
                    value: 'zongAccount',
                    label: '金额',
                    align: 'center'
                },
                {
                    value: 'section',
                    label: '科室',
                    align: 'center'
                },
                {
                    value: 'attendingDoctor',
                    label: '接诊医生',
                    align: 'center'
                }
            ],
            // 退费详情数据、
            detailList: [],
            // 退费项目数据
            refundList: [],
            // 确认退费的模板
            conrefundColumns: [
                {
                    value: 'name',
                    label: '退费项目',
                    align: 'center'
                },
                {
                    value: 'batchNum',
                    label: '批次',
                    align: 'center',
                    width: 200
                },
                {
                    value: 'manufacturerName',
                    label: '厂商',
                    align: 'center'
                },
                {
                    value: 'price',
                    label: '单价（￥）',
                    align: 'center'
                },
                {
                    value: 'num',
                    label: '数量',
                    align: 'center'
                },
                {
                    value: 'unit',
                    label: '单位',
                    align: 'center'
                },
                {
                    value: 'crossClain',
                    label: '医商保扣除金额',
                    align: 'center'
                },
                {
                    value: 'selfPayment',
                    label: '自付金额（￥）',
                    align: 'center'
                }
            ],
            // 确认退费的数据
            conrefundList: [],
            alipay: payInfo[0].label,
            wechat: payInfo[1].label,
            unionpay: payInfo[2].label,
            cash: payInfo[3].label,
            priceSum: 0, // 费用合计
            crossClainSum: 0, // 退费减免金额
            refundAccount: 0, // 退费金额总计
            step: 1, // 退费的第几步 1为第一步，2为第二步
            checkList: [payInfo[0].label], // 确认退费时的退费方式
            dictMap: [],
            refundDetailList: [],
            finalAccount: 0,
            chargeInfo: {},
            type: '',
            clinicInfoName: '',
            chargeData: {
                total: 0,
                patientId: 40,
                registerId: 40,
                shangbao: 50
            },
            showInput: true,
            chargeCount: 0,
            isAllRefund: false,
            selections: [],
            cacheSelections: [],
            chargeTypeList: [],
            refundProcess,
            isPrintInvoice: this.commonUtil.getConfigValue('isPrintInvoice') === '1'
        }
    },
    watch: {
        $route() {
            this.step = 1
            const that = this
            this._.forEach(that.refundList, function(item) {
                item.refundNum = 0
            })
            this.priceSum = 0
            this.crossClainSum = 0
            this.refundAccount = 0
            if (this.$route.name === 'chargeDetail') {
                this.getPatientInfo()
                this.detail()
            }
            this.type = this.$route.params.type
        },
        checkList(newVal, oldVal) {
            if (newVal.length > 1) {
                newVal.splice(0, newVal.length - 1)
                this.checkList = newVal
            } else {
                this.checkList = oldVal
            }
        },
        type(val, oldVal) {
            if (val === 'refund' || val === 'cancelCredit') {
                this.showInput = true
            } else {
                this.showInput = false
            }
        }
    },
    computed: {
        ...mapGetters(['basic']),
        isSelection() {
            const isSelection =
        this.chargeInfo.chargeSourceCode === 1 &&
        this.refundProcess &&
        (this.refundProcess === '3' || this.refundProcess === '4')
            ? 'selection'
            : this.refundProcess && this.refundProcess !== '1'
                ? ''
                : 'selection'
            return isSelection
        }
    },
    mounted() {
        this.getPatientInfo()
        this.detail()
        this.type = this.$route.params.type
    },
    methods: {
    // 打印
        print(type) {
            const chargeInfo = {
                patientInfoName: this.patient.name,
                chargeSource: this.chargeSource,
                outpatientNumber: this.patient.outpatientNumber ? this.patient.outpatientNumber : '-',
                clinicTime: this.clinicTime,
                chargeAccount: this.type === 'chargeDetail' ? this.chargeAccount : this.chargeCount,
                receivedCash:
          this.type === 'chargeDetail'
              ? this.otherName &&
              this.otherName.split('、').length === 1 &&
              this.otherName.split('、')[0] === '现金'
                  ? getFloat(this.receivedCash, '6')
                  : this.receivedCash
              : this.receivedCash,

                otherName: this.otherName,
                doctorName: this.doctorName,
                receiverName: this.receiverName,
                currentTime: this.currentTime,

                isCash: !!(
                    this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
                ),
                clinicInfoName: this.clinicInfoName,
                chargeNum: this.chargeInfo.chargeNum,
                sex: this.patient.sex,
                phone: encryptStar(this.patient.phone, 3, 4),
                reductionAmt: this.chargeInfo.reductionAmt
            }
            if (type === 'A4') {
                handlePrintDetail(this.info, chargeInfo)
            } else if (type === 'xp') {
                handlePrintDetailxp(this.info, chargeInfo)
            } else {
                handlePrintBillmx(this.info, chargeInfo)
            }

            window.location.reload()
        },
        printDetail(type) {
            this.print(type)
        },

        printCharge(type) {
            const chargeInfo = {
                clinicInfoName: this.clinicInfoName,
                clinicTime: this.clinicTime,
                patientInfoName: this.patient.name,
                chargeSource: this.chargeSource,
                doctorName: this.doctorName,
                currentTime: this.currentTime,
                total: this.type === 'chargeDetail' ? this.chargeAccount : this.chargeCount,
                receiverName: this.receiverName,
                isCash: !!(
                    this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
                ),
                receivedCash:
          this.type === 'chargeDetail'
              ? this.otherName &&
              this.otherName.split('、').length === 1 &&
              this.otherName.split('、')[0] === '现金'
                  ? getFloat(this.receivedCash, '6')
                  : this.receivedCash
              : this.receivedCash
            }
            if (type === '发票') {
                handlePrintBillxp(this.info, chargeInfo)
            } else {
                handlePrintCount(this.info, chargeInfo)
            }

            window.location.reload()
        },

        printTicket() {
            this.printCharge()
        },
        printBill() {
            this.print()
        },

        // 输入退费数量失去焦点时计算
        changeNum(index, val) {
            val =
        isNaN(val) || val <= 0
            ? 0
            : val > this.refundList[index].num
                ? this.refundList[index].num
                : val
            if (val <= 0) {
                this.$refs.multipleTable.$refs.selftab.toggleRowSelection(this.refundList[index], false)
            }
            // 更改对应的退费数量、退费金额、退费减免金额
            this.refundList[index].refundNum = val
            this.refundList[index].refundAccount = toFixed(
                this.refundList[index].price * this.refundList[index].refundNum,
                4
            ) // 退费金额
            this.refundList[index].refundCrossAccount = toFixed(
                this.refundList[index].refundNum *
          (this.refundList[index].crossClain / this.refundList[index].num),
                4
            ) // 退费减免金额

            this.freshAccount()
        },

        // 统计各类合计
        freshAccount() {
            this.refundAccount = 0
            this.priceSum = 0
            this.crossClainSum = 0
            let selectCount = 0
            let lastCount = 0
            this.selections = this.selections.concat(this.cacheSelections)
            for (var i = 0; i < this.selections.length; i++) {
                this.priceSum += Number(this.selections[i].refundAccount)
                this.crossClainSum += Number(this.selections[i].refundCrossAccount)
                this.refundAccount = this.priceSum - this.crossClainSum
                selectCount += Number(this.selections[i].refundNum)
            }
            for (var j = 0; j < this.refundList.length; j++) {
                lastCount += Number(this.refundList[j].num)
            }
            this.crossClainSum = toFixed(this.crossClainSum, 2) // 退费合计
            this.priceSum = toFixed(this.priceSum, 2) // 退费减免合计
            this.refundAccount = toFixed(this.refundAccount, 2) // 应退金额
            this.isAllRefund = selectCount === lastCount // 是否全退
        },
        freshAccount1() {
            if (this.refundProcess && this.refundProcess !== '1') {
                const selections = []
                this.refundList.forEach(item => {
                    if ((item.recipeChara === '10' || item.recipeChara === '20') && item.refundNum > 0) {
                        selections.push(item)
                    }
                })
                this.selections = selections
                this.cacheSelections = selections
            }
            this.refundAccount = 0
            this.priceSum = 0
            this.crossClainSum = 0
            let selectCount = 0
            let lastCount = 0
            for (var i = 0; i < this.selections.length; i++) {
                this.priceSum += Number(this.selections[i].refundAccount)
                this.crossClainSum += Number(this.selections[i].refundCrossAccount)
                this.refundAccount = this.priceSum - this.crossClainSum
                selectCount += Number(this.selections[i].refundNum)
            }
            for (var j = 0; j < this.refundList.length; j++) {
                lastCount += Number(this.refundList[j].num)
            }
            this.crossClainSum = toFixed(this.crossClainSum, 2) // 退费合计
            this.priceSum = toFixed(this.priceSum, 2) // 退费减免合计
            this.refundAccount = toFixed(this.refundAccount, 2) // 应退金额
            this.isAllRefund = selectCount === lastCount // 是否全退
        },

        // 获取病人信息
        getPatientInfo() {
            const id = this.$route.params.patientId
            if (id !== '0' && id !== null && id !== 0) {
                // 获取婚姻状况
                const str = 'dictId=107'
                getDictByIdList(str).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        const that = this
                        this._.forEach(d, function(item) {
                            that.dictMap.push({
                                value: item.code,
                                label: item.name
                            })
                        })
                    }
                })

                patientInfo(id).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS.patient

                        if (d.matrialStatus) {
                            const that = this
                            this._.forEach(that.dictMap, function(m) {
                                if (m.value === d.matrialStatus) {
                                    d.maritalResver = m.label
                                }
                            })
                        }
                        this.currentTime = getCurrentDay()
                        var visitTime = this.$route.params.time.length > 1 ? this.$route.params.time : ''
                        this.patient = {
                            name: d.name,
                            avatar: d.headImg ? this.basic.filePrifix + d.headImg : unknownAvatar,
                            sex: d.sex ? formatSex(d.sex) : '',
                            age: d.birthDate ? getBabyAge(d.birthDate) : '',
                            maritalStatus: d.maritalResver ? d.maritalResver : '',
                            outpatientNumber: d.opCaseNum,
                            visitTime: visitTime ? visitTime.split(' ')[0] : '',
                            phone: d.phone
                        }
                    }
                })
            } else {
                this.currentTime = getCurrentDay()
                this.patient = {
                    name: '快速收费',
                    avatar: unknownAvatar,
                    sex: '-',
                    age: '-',
                    maritalStatus: '-',
                    outpatientNumber: '-',
                    visitTime: '-'
                }
            }
        },

        // 获取收费明细
        detail() {
            this.refundColumns[7].disabled = false
            this.refundAccount = 0
            const chargeId = this.$route.params.chargeId
            getChargeDetail(chargeId).then(res => {
                if (res.STATUS === '1') {
                    const type = this.$route.params.type
                    this.clinicInfoName = res.ITEMS.charge.orgName
                    const d = type === 'refundDetail' ? res.ITEMS.refundList : res.ITEMS.detailList
                    this.chargeTypeList = res.ITEMS.typeList
                    this.chargeAccount = res.ITEMS.charge.totalAmt // 收费金额
                    this.receivedCash = res.ITEMS.charge.receivedCash
                    this.doctorName = res.ITEMS.charge.doctorName // 医生
                    this.receiverName = res.ITEMS.charge.receiverName // 收费人员
                    this.chargeSource = res.ITEMS.charge.chargeSource || '自费' // 收费来源  类别
                    this.clinicTime = res.ITEMS.charge.chargeTime // 收费时间
                    this.chargeInfo = res.ITEMS.charge
                    const t = res.ITEMS.typeList
                    const result = []
                    const that = this
                    this._.forEach(d, function(item) {
                        result.push({
                            id: item.id,
                            name: item.accrualCatName,
                            spec: item.spec !== 'null' && item.spec ? item.spec : '',
                            unit: item.unit,
                            price: item.price,
                            zongAccount: type === 'refundDetail' ? item.returnAmt : item.totalAmt,
                            crossClain: item.reductionAmt,
                            num: type === 'refundDetail' ? item.returnQty : item.qty,
                            refundNum:
                that.isSelection !== 'selection'
                    ? that.refundProcess !== '1'
                        ? item.returnQty || 0
                        : 0
                    : 0,
                            refundAccount:
                that.isSelection !== 'selection'
                    ? that.refundProcess !== '1'
                        ? toFixed((item.returnQty || 0) * item.price)
                        : 0
                    : 0,
                            refundCrossAccount: 0,
                            section: item.execDeptName,
                            recipeChara: item.recipeChara,
                            showInput: that.showInput,
                            attendingDoctor: that.doctorName,
                            refundable: item.refundable,
                            manufacturerName: item.manufacturerName,
                            batchNum: item.batchNum
                        })
                    })
                    let otherName = ''
                    this._.forEach(t, function(i) {
                        otherName += i.itemName ? i.itemName + '、' : ''
                        if (i.itemCode === '11') {
                            that.yibaoAmt = i.itemAmt ? i.itemAmt : 0
                        }
                        if (i.itemCode === '21') {
                            that.shangbaoAmt = i.itemAmt ? i.itemAmt : 0
                        }
                        if (
                            i.itemCode === '01' ||
              i.itemCode === '02' ||
              i.itemCode === '03' ||
              i.itemCode === '04'
                        ) {
                            that.otherAmt = i.itemAmt ? i.itemAmt : 0
                        }
                    })
                    that.otherName = otherName.substring(0, otherName.length - 1)
                    this.refundList = result
                    this.detailList = result
                    this.info = result

                    if (this.info.length > 0) {
                        this.typeInfo = [[], [], [], [], []]
                        this.costInfo = [0, 0, 0, 0, 0]
                        const that = this
                        this._.forEach(that.info, function(item, index) {
                            that.detailList[index].showInput = false
                            if (item.refundable) {
                                that.detailList[index].disabled = true
                            }
                        })
                    }
                    if (type === 'refundDetail' || type === 'chargeDetail') {
                        let total = 0
                        this._.forEach(result, function(item) {
                            total = total + item.zongAccount
                        })
                        this.chargeCount = toFixed(total, 2)
                    }
                }
                this.$nextTick(() => {
                    if (
                        !(
                            this.chargeInfo.chargeSourceCode === 1 &&
              this.refundProcess &&
              (this.refundProcess === '3' || this.refundProcess === '4')
                        )
                    ) {
                        if (this.refundProcess && this.refundProcess !== '1') {
                            this.freshAccount1()
                        }
                    }
                })
            })
        },

        // 获取选中的退费项目
        handleSelectChange(selections, row) {
            if (JSON.stringify(selections).indexOf(JSON.stringify(row)) > -1) {
                row.refundNum = row.num
                row.refundAccount = toFixed(row.num * row.price, 2)
                // row.refundAccount = multiply(row.num, row.price)
                row.showInput = true
            } else {
                row.refundNum = 0
                row.refundAccount = 0
                row.showInput = false
            }

            this.selections = selections
            this.freshAccount()
        },

        // 全选
        handleSelectAll(selection) {
            if (selection && selection.length > 0) {
                selection.forEach(item => {
                    item.refundNum = item.num
                    item.refundAccount = toFixed(item.num * item.price, 2)
                    item.showInput = true
                })
            } else {
                if (this.refundList && this.refundList.length > 0) {
                    this.refundList.forEach(item => {
                        if (this.refundProcess !== '1') {
                            if (item.recipeChara !== '10' && item.recipeChara !== '20') {
                                item.refundNum = 0
                                item.refundAccount = 0
                                item.showInput = false
                            }
                        } else {
                            item.refundNum = 0
                            item.refundAccount = 0
                            item.showInput = false
                        }
                    })
                }
            }
            this.selections = selection
            this.freshAccount()
        },

        // 设置某些行不可选
        handleSelecTable(row) {
            if (row.disabled) {
                return false
            } else {
                if (this.chargeInfo.chargeSourceCode === 1) {
                    return true
                } else {
                    if (this.refundProcess && this.refundProcess !== '1') {
                        if (row.recipeChara !== '10' && row.recipeChara !== '20') {
                            return true
                        } else {
                            return false
                        }
                    } else {
                        return true
                    }
                }
            }
        },

        // 退费第一步
        refund() {
            if (this.selections && this.selections.length > 0) {
                if (this.refundAccount > 0) {
                    this.refundDetailList = []
                    if (this.selections && this.selections.length > 0) {
                        const that = this
                        this._.forEach(that.selections, function(item) {
                            if (item.refundNum > 0) {
                                that.refundDetailList.push(item)
                            }
                        })
                    }
                    this.step = 2
                    this.showDetail()
                } else {
                    this.$message.error('退费金额要大于0！')
                }
            } else {
                this.$message.error('请选择退费项目')
            }
        },

        // 显示退费第二步数据
        showDetail() {
            this.conrefundList = []
            if (this.refundDetailList && this.refundDetailList.length > 0) {
                let total = 0
                const that = this
                this._.forEach(that.refundDetailList, function(item) {
                    that.conrefundList.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        num: item.refundNum,
                        unit: item.unit,
                        crossClain: item.refundCrossAccount,
                        selfPayment: item.refundAccount,
                        recipeChara: item.recipeChara,
                        batchNum: item.batchNum,
                        manufacturerName: item.manufacturerName
                    })
                    total += Number(item.refundAccount)
                })
                this.finalAccount = toFixed(total, 2)
            }
        },

        // 退费第二步
        finalRefund() {
            const detailList = []
            const that = this
            const isAll = this.isAllRefund ? 1 : 0
            this._.forEach(that.conrefundList, function(item) {
                detailList.push({
                    count: Number(item.num),
                    detailId: item.id
                })
            })
            const data = {
                chargeId: this.chargeInfo.id,
                detailList: detailList,
                isAll: isAll
            }
            refundCost(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('退费成功')
                    this.$router.push({ name: 'charge' })
                }
            })
        },

        // 从退费详情返回列表
        backList() {
            if (this.step === 1) {
                this.$router.push({ name: 'charge' })
            } else {
                this.step = 1
                if (this.selections && this.selections.length > 0) {
                    this.selections.forEach(item => {
                        this.$nextTick(() => {
                            if (this.chargeInfo.chargeSourceCode === 1) {
                                this.$refs.multipleTable.$refs.selftab.toggleRowSelection(item, true)
                            } else {
                                if (this.refundProcess && this.refundProcess !== '1') {
                                    if (item.recipeChara !== '10' && item.recipeChara !== '20') {
                                        this.$refs.multipleTable.$refs.selftab.toggleRowSelection(item, true)
                                    }
                                } else {
                                    this.$refs.multipleTable.$refs.selftab.toggleRowSelection(item, true)
                                }
                            }
                        })
                    })
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.title-right {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.info {
  overflow: hidden;
  padding: 30px 10px 0;
  .zhushi {
    float: left;
    color: #c30d23;
    font-size: 16px;
  }
  .sum {
    float: right;
    p {
      margin-bottom: 8px;
      font-size: 16px;
    }
    span:nth-of-type(1) {
      color: #000;
      display: inline-block;
      width: 150px;
      text-align: right;
    }
    span:nth-of-type(2) {
      color: #ea5514;
    }
  }
}
.submit-btn {
  text-align: right;
  border: none;
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
  button {
    background: #ff6600;
    color: #fff;
    border-color: #ff6600;
  }
}
.refund {
  border-bottom: 1px solid #ebeef5;
  overflow: hidden;
  padding: 15px 0 10px;
  .account {
    float: left;
    min-width: 260px;
    padding-right: 20px;
    p:nth-of-type(1) {
      font-size: 16px;
      color: #000;
      margin-left: 10px;
    }
    p:nth-of-type(2) {
      font-size: 45px;
      color: #ea5514;
      margin-top: 5px;
    }
  }
  .refundType {
    float: left;
    font-size: 16px;
    color: #000;
    margin-top: 15px;
    p {
      margin-top: 5px;
    }
  }
  .select {
    float: left;
    margin-left: 50px;
    div {
      float: left;
      margin-left: 20px;
    }
    img {
      display: block;
      width: 50px;
      height: 50px;
      margin: auto;
      margin-bottom: 10px;
      //   margin-left: -18px;
    }
  }
}
.refundBtn {
  font-size: 15px;
}
.infos {
  button {
    background: #ff6600;
    color: #fff;
    border-color: #ff6600;
    float: right;
    margin-top: 10px;
  }
}
</style>
<style lang="scss">
</style>

