<template>
    <div class="charge">
        <el-dialog :title="title" :visible.sync="dialogVisible" width="1000px" center class="chargeDetail" @close="close">
            <div class="main">
                <!-- 正常收费 -->
                <div v-if="!isCredit" class="dialog_left">
                    <p class="yingshou">
                        <span>应收：</span>
                        <span>￥{{ total }}</span>
                    </p>
                    <div class="chargeDetail">
                        <span>收费详情</span>
                    </div>
                    <p>
                        <span>本次费用：</span>
                        <span>￥{{ temp_total }}</span>
                    </p>
                    <p>
                        <span>减免费用：</span>
                        <el-input v-model="reductionAmt" style="width:100px;text-align:right" @input="changeFreeAccount(reductionAmt)" />
                    </p>
                    <p>
                        <span>商保支付：</span>
                        <span>￥{{ CommercialPay }}</span>
                    </p>
                    <p>
                        <span>精度调整：</span>
                        <span>￥{{ decimal_total }}</span>
                    </p>
                    <div>
                        <div class="bottom-content">
                            <p>
                                <span style="color:#0097FF;font-size:17px;">本次可用商保支付：￥{{ CommercialPay }}</span>
                            </p>
                            <p>
                                <span>当前商保余额：￥{{ CommercialBalance }}</span>
                            </p>
                            <p>
                                <span>用户类型：{{ insuranceInfo && insuranceInfo.userType===1?'1.0用户':insuranceInfo && insuranceInfo.userType===2?'2.0用户':insuranceInfo && insuranceInfo.userType===3?'宝无忧':'' }}</span>
                            </p>
                            <p>
                                <span>当前状态：{{ insuranceInfo && insuranceInfo.status===1?'签约已生效':insuranceInfo && insuranceInfo.status===2?'签约未生效或未签约':'' }}</span>
                            </p>
                            <p>
                                <span>有效期至：{{ insuranceInfo && insuranceInfo.expirationTime?insuranceInfo.expirationTime:'' }}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 记账收费 -->
                <div v-else class="dialog_left">
                    <p class="yingshou">
                        <span>剩余欠费：</span>
                        <span>￥{{ total }}</span>
                    </p>
                    <div class="chargeDetail">
                        <span>欠费详情</span>
                    </div>
                    <p v-for="(item,index) in chargeIds" :key="index">
                        <span>单号{{ item.chargeNum }}欠费：</span>
                        <span>￥{{ item.money }}</span>
                    </p>
                    <p>
                        <span>补交合计：</span>
                        <span>￥{{ temp_total }}</span>
                    </p>
                    <p>
                        <span>精度调整：</span>
                        <span>￥{{ decimal_total }}</span>
                    </p>
                    <!-- <div>
            <div class="bottom-content">
              <p>
                <span style="color:#0097FF;font-size:17px;">本次可用商保支付：￥{{CommercialPay}}</span>
              </p>
              <p>
                <span>当前商保余额：￥{{CommercialBalance}}</span>
              </p>
              <p>
                <span>用户类型：{{insuranceInfo && insuranceInfo.userType===1?'1.0用户':insuranceInfo && insuranceInfo.userType===2?'2.0用户':insuranceInfo && insuranceInfo.userType===3?'宝无忧':''}}</span>
              </p>
              <p>
                <span>当前状态：{{insuranceInfo && insuranceInfo.status===1?'签约已生效':insuranceInfo && insuranceInfo.status===2?'签约未生效或未签约':''}}</span>
              </p>
              <p>
                <span>有效期至：{{insuranceInfo && insuranceInfo.expirationTime?insuranceInfo.expirationTime:''}}</span>
              </p>
            </div>
          </div>-->
                </div>

                <div class="dialog_right">
                    <el-form ref="form" :model="form">
                        <el-tabs v-model="form.payments" @tab-click="handleClick">
                            <el-tab-pane v-for="(p,pIndex) in paymentList" :label="p.label" :name="p.value" :key="pIndex">
                                <template>
                                    <div class="surplus">还需支付：￥{{ needPay }}</div>
                                    <el-checkbox-group v-model="form.payType" :max="2" class="selectType" @change="handleChange">
                                        <el-checkbox v-for="(item,index) in payList" :label="item.value" :key="index">
                                            <img :src="payUrl[index]">
                                            {{ item.label }}
                                        </el-checkbox>
                                    </el-checkbox-group>
                                    <div style="margin-top:20px;margin-left:8%;">
                                        <div style="height:52px">
                                            <el-row v-if="form.payType && form.payType.toString() === amountType.toString() && form.payments === 'one'">
                                                <el-col :span="7">
                                                    <el-form-item :span="24">
                                                        <span>应收：</span>
                                                        <font style="color:#F15A24">￥{{ needPay }}</font>
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="10">
                                                    <el-form-item :span="24" label="实收：" class="form_btn">
                                                        <el-input v-model="form.amountPaid" :size="sizes" style="width:100px" />&nbsp;&nbsp;元
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="7">
                                                    <el-form-item :span="24">
                                                        <span>找零：</span>
                                                        <font style="color:#F15A24">￥{{ form.oddChange }}</font>
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>

                                            <el-row v-if="form.payType.length === 2 && form.payments === 'two'">
                                                <el-col :span="14">
                                                    <el-form-item :span="12" :label="firstTypeName+'：'" class="form_btn">
                                                        <el-input v-model="form.firstType" :size="sizes" style="width:100px" @input="handleInput" />&nbsp;&nbsp;元
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="10">
                                                    <el-form-item :span="12">
                                                        <span>{{ secondTypeName }}：</span>
                                                        <font style="color:#F15A24">￥{{ form.secondType }}</font>
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>
                                        </div>
                                        <el-checkbox-group v-if="!isCredit" v-model="checkList" class="groupList">
                                            <el-checkbox label="打印收费清单(A4)" />
                                            <el-checkbox label="打印收费清单(小票)" />
                                            <el-checkbox label="打印收费票据" />
                                            <el-checkbox v-if="isPrintInvoice" label="打印明细发票" />
                                            <el-checkbox v-if="isPrintInvoice" label="打印收费类型发票" />

                                            <!-- <el-checkbox label="打印登记票据" v-if="routerSource === 'register'"></el-checkbox> -->
                                        </el-checkbox-group>
                                    </div>
                                </template>
                            </el-tab-pane>
                        </el-tabs>
                    </el-form>
                    <div class="bottom_btn">
                        <el-button type="primary" @click="close">取消</el-button>
                        <el-button v-show="form.payments == 'two'" :loading="medicalLoading" type="primary" @click="medicalInsuranceCharge">医保收费</el-button>
                        <el-button :loading="loading" type="primary" @click="charge">收费</el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { param2Obj, param, deepClone, encryptStar } from '@/utils'
import { getCurrentDay } from '@/utils/common'
import { getDictByIdList } from '@/api/catalog'
import { getOrgInfo } from '@/api/org'
import { patientInfo } from '@/api/arclinic'
import { getChargeDetail, charge, repay, chargeInsurance, chargeQuickPayment } from '@/api/charge'
import { sendDispens } from '@/api/pharmacy'
import amount from '@/assets/icon_images/amount.png'
import alipay from '@/assets/icon_images/alipay.png'
import wechat from '@/assets/icon_images/wechat.png'
import card from '@/assets/icon_images/card.png'
import medical from '@/assets/icon_images/medical.png'
import account from '@/assets/icon_images/account.png'
import yky from '@/assets/icon_images/yky.png'
import { getFloat, add, subtract, toFixed } from '@/utils/float'
import {
    handlePrintDetail,
    handlePrintCount,
    handlePrintDetailxp,
    handlePrintBillmx,
    handlePrintBillxp
} from '../commonPrint.js'
import { formatSex } from '../../../utils/index.js'
export default {
    props: ['title', 'width', 'sizes', 'inputStyle', 'isCredit'],
    data() {
    // 支付类型
        const dictMap = {
            36: [] // 支付类型
        }
        const credit = {}
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    if (item.code !== '21') {
                        dictMap[item.dictId].push({
                            value: param({
                                code: item.code,
                                name: item.name
                            }),
                            label: item.name
                        })
                    }
                })
            }
        })
        return {
            area: '',
            medicalLoading: false,
            receivedCash: 0,
            currentTime: '',
            typeInfo: [[], [], [], [], []],
            costInfo: [0, 0, 0, 0, 0],
            clinicInfoName: '',
            outpatientNumber: '',
            dialogVisible: false,
            insuranceInfo: {}, // 保险信息
            patientInfo: {}, // 患者信息
            cipForm: {
                shangbaoType: '',
                shangbao: ''
            },
            form: {
                integer: 0,
                payType: [''],
                amountPaid: 0,
                oddChange: 0,
                payments: 'one',
                // note: '',
                firstType: '',
                secondType: ''
            },
            paymentList: [
                {
                    label: '单种支付',
                    value: 'one'
                },
                {
                    label: '多种支付',
                    value: 'two'
                }
            ],

            cachePayList: dictMap[36],
            payList: [],
            cachePayUrl: [amount, alipay, wechat, card, account, yky, medical],
            payUrl: [],
            total: 0, // 应收
            CommercialBalance: 0, // 商保余额
            CommercialPay: 0, // 商保支付金额
            medicalInsuranceCost: 0, // 医保支付金额
            temp_total: 0, // 本次费用
            needPay: 0, // 还需支付
            decimal_total: 0, // 取整费
            payAccount: 0,
            yibao: {},
            loading: false,
            tempPayType: [],
            centerDialogVisible: false,
            info: [],
            chargeAccount: 0, // 收费金额
            doctorName: '', // 医生
            chargeSource: '', // 收费来源
            receiverName: '', // 收费人员
            yibaoAmt: 0,
            shangbaoAmt: 0,
            otherAmt: 0,
            otherName: '',
            clinicTime: '', // 收费时间
            amountType: [],
            detailList: [],

            firstTypeName: '', // 多种支付选择的第一个
            secondTypeName: '', // 多种支付选择的第二个
            credit: credit, // 记账的支付方式
            chargeIds: [],
            routerSource: '',
            isPrint: false,
            chargeNum: '',
            reductionAmt: 0,
            isPrintInvoice: this.commonUtil.getConfigValue('isPrintInvoice') === '1',
            isPrintChargeBill: this.commonUtil.getConfigValue('isPrintChargeBill') === '1',
            isPrintChargeDetail: this.commonUtil.getConfigValue('isPrintChargeDetail') === '1',
            isPrintChargeReceipts: this.commonUtil.getConfigValue('isPrintChargeReceipts') === '1',
            checkList: []
        }
    },
    computed: {},
    watch: {
        'form.amountPaid': {
            handler: function(val, old) {
                if (val !== '') {
                    if (!isNaN(val)) {
                        if (String(val).indexOf('.') > -1 && String(val).split('.')[1].length > 1) {
                            this.$message.error('小数点后最多可以输入一位小数')
                            // this.form.oddChange = 0.0
                            return
                        }
                        this.form.oddChange = toFixed(Number(val - getFloat(this.needPay, '6')), 2)
                    } else {
                        this.$message.error('请输入正确的金额')
                    }
                } else {
                    this.form.oddChange = 0.0
                }
            },
            deep: true
        },
        isCredit(val, old) {
            if (val) {
                this.payList.splice(4, 1)
            } else {
                this.payList = deepClone(this.cachePayList)
            }
        }
    },
    methods: {
        close() {
            this.dialogVisible = false
            this.loading = false
            this.form.payments = 'one'
        },

        open(
            patientInfo,
            insurance,
            chargeAmt,
            detailList,
            chargeIds,
            routerSource,
            isPrint,
            chargeList
        ) {
            this.reductionAmt = 0
            this.payList = deepClone(this.cachePayList)
            this.payUrl = deepClone(this.cachePayUrl)
            if (this.isCredit) {
                this.payList.splice(4, 1)
                this.payUrl.splice(4, 1)
            }
            this.patientInfo = patientInfo
            this.detailList = detailList
            this.chargeIds = chargeIds // 收费单号及费用
            this.routerSource = routerSource // 从哪里收费的
            this.isPrint = isPrint
            this.checkList = []
            if (isPrint) {
                this.checkList.push('打印登记票据')
            } 
                if (this.isPrintInvoice) {
                    this.checkList.push('打印明细发票')
                    this.checkList.push('打印收费类型发票')
                }
                if (this.isPrintChargeBill) {
                    this.checkList.push('打印收费票据')
                }
                if (this.isPrintChargeDetail) {
                    this.checkList.push('打印收费清单(A4)')
                }
                if (this.isPrintChargeReceipts) {
                    this.checkList.push('打印收费清单(小票)')
                }
            
            this.dialogVisible = true
            this.form.payType = [this.payList[0].value] // 支付类型默认选中第一个
            this.tempPayType = [this.payList[0].value] // 临时保存支付类型的第一个
            this.amountType = [this.payList[0].value] // 保存支付类型的第一个

            if (patientInfo.medicalInsuranceCode && patientInfo.medicalInsuranceCode != '3') {
                this.form.payments = 'two'
                this.handleClick({ name: 'two' })
                this.form.payType = ['code=11&name=%E5%8C%BB%E4%BF%9D', 'code=01&name=%E7%8E%B0%E9%87%91']
                this.handleChange(['code=11&name=%E5%8C%BB%E4%BF%9D', 'code=01&name=%E7%8E%B0%E9%87%91'])
            }

            this.temp_total = Number(chargeAmt) // 本次费用
            this.CommercialBalance = insurance && insurance.balance ? insurance.balance : 0 // 商保余额
            // this.CommercialBalance = 200
            this.medicalInsuranceCost = 0
            //   保无忧药品
            let commercialShopAmt = 0
            if (chargeList && chargeList.length > 0) {
                chargeList.forEach(item => {
                    // if (item.insuranceCodes && item.insuranceCodes.indexOf('3') > -1) {
                    commercialShopAmt = add(commercialShopAmt, item.amt)
                    // }
                })
            }
            if (detailList && detailList.length > 0) {
                detailList.forEach(item => {
                    // if (item.insuranceCodes && item.insuranceCodes.indexOf('3') > -1) {
                    commercialShopAmt = add(commercialShopAmt, item.amt)
                    // }
                })
            }
            this.commercialShopAmt = commercialShopAmt
            if (
                patientInfo.patientSources === '01' &&
        (patientInfo.commercialInsuranceCode === '3' || patientInfo.commercialInsuranceCode === '8')
            ) {
                // 是否为保无忧用户
                this.CommercialPay =
          commercialShopAmt < this.CommercialBalance ? commercialShopAmt : this.CommercialBalance // 商保支付金额
            } else {
                this.CommercialPay = 0
            }

            this.needPay = subtract(this.temp_total, this.CommercialPay)
            this.total = add(this.temp_total, this.decimal_total)

            this.form.amountPaid = getFloat(this.needPay, '6') // 应收
            this.form.oddChange = toFixed(Number(this.form.amountPaid - getFloat(this.needPay, '6')), 2)
            this.loading = false
        },

        // 收费
        charge() {
            this.loading = true
            // 还需支付 this.total-this.CommercialBalance
            if (this.form.payments === 'one') {
                // 单种支付
                const testType = param2Obj(this.form.payType)
                if (
                    testType.name === '现金' &&
          (Number(this.needPay) > 0 && Number(this.needPay) > Number(this.form.amountPaid))
                ) {
                    this.$message.error('输入的金额不可以低于需要支付的金额')
                    this.loading = false
                    return false
                }
            } else {
                // 多种支付
                if (this.firstTypeName === '医保') {
                    if (Number(this.form.firstType) > Number(this.temp_total)) {
                        this.$message.error('输入的金额不可以高于本次费用')
                        this.loading = false
                        return false
                    }
                } else {
                    if (Number(this.form.firstType) > Number(this.needPay)) {
                        this.$message.error('输入的金额不可以高于需要支付的金额')
                        this.loading = false
                        return false
                    }
                }
                if (
                    this.firstTypeName !== '医保' &&
          add(this.form.firstType, this.form.secondType) !== this.needPay
                ) {
                    this.$message.error('请输入正确的金额')
                    this.loading = false
                    return false
                }
                if (Number(this.form.firstType) < 0) {
                    this.$message.error('请输入正确的金额')
                    this.loading = false
                    return false
                }
                if (this.form.payType.length < 2 && this.needPay !== 0) {
                    this.$message.error('请选择两种支付方式')
                    this.loading = false
                    return false
                }
                if (this.needPay !== 0) {
                    if (
                        this.firstTypeName !== '医保' &&
            this.form.payType[0].toString() === [this.payList[0].value].toString()
                    ) {
                        if (
                            String(this.form.firstType).indexOf('.') > -1 &&
              String(this.form.firstType).split('.')[1].length > 1
                        ) {
                            this.loading = false
                            this.$message.error('小数点后最多可输入一位小数')
                            return
                        }
                    } else {
                        if (
                            String(this.form.firstType).indexOf('.') > -1 &&
              String(this.form.firstType).split('.')[1].length > 2
                        ) {
                            this.loading = false
                            this.$message.error('小数点后最多可输入两位小数')
                            return
                        }
                    }
                }

                if (this.form.firstType && isNaN(this.form.firstType)) {
                    this.$message.error('请输入正确的金额')
                    this.loading = false
                    return false
                }
                if (this.form.payType.length > 1 && !this.form.firstType && this.needPay !== 0) {
                    this.$message.error('请输入金额')
                    this.loading = false
                    return false
                }
            }
            if (this.routerSource === 'register') {
                // 登记收费
                this.$emit('startCharge')
            } else {
                this.chargeDetail()
            }
        },

        // 医保收费
        medicalInsuranceCharge() {
            this.medicalLoading = true
            if (
                this.form.payType.length == 2 &&
        this.form.payType.indexOf('code=11&name=%E5%8C%BB%E4%BF%9D') > -1
            ) {
                const isUseInsurance = this.commonUtil.getConfigValue('isUseInsurance')
                if (isUseInsurance === '1') {
                    if (this.commonUtil.getExplorer() !== 'ie') {
                        this.$message.warning('请使用IE浏览器进行医保诊所审核')
                        return false
                    } else {
                        const ipAddress = this.commonUtil.getConfigValue('ipDispose')
                        const databaseName = this.commonUtil.getConfigValue('databaseName')
                        const clinicId = this.$store.getters.clinic.thirdPartyClinicId
                        if (!ipAddress || !clinicId || !databaseName) {
                            this.$message.warning('该诊所未进行相关金舵手服务配置，请联系管理员！')
                            return false
                        }
                    }
                }
                const data = {
                    patientId: this.patientInfo.sysPatientId,
                    registerId: this.patientInfo.id
                }
                chargeInsurance(data).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        // 创建数据库连接对象
                        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                            const conn = new ActiveXObject('ADODB.Connection')
                            // Server ip服务：需要配置
                            // Data Source数据库服务:需要配置
                            const connectionstring = `Provider=SQLOLEDB;Persist Security Info=False;Initial Catalog=${databaseName};Data Source=${ipAddress};User ID=H2O;Password=123456`
                            // 打开连接
                            conn.open(connectionstring)
                            try {
                                console.log(d)
                                conn.Execute(d)
                            } catch (e) {
                                console.log(e)
                            }
                            conn.Close()
                        }
                        this.medicalLoading = false
                    }
                })
            } else {
                this.$message.error('请选择医保支付及其它支付方式！')
                this.medicalLoading = false
                return ''
            }
        },

        chargeDetail() {
            const d = Object.assign({}, this.form, this.cipForm)
            d.payAccount = this.needPay
            let data = {}
            let repayData = {}
            let tempData = {}
            const payType = param2Obj(d.payType[0]) // 选择的支付方式
            if (this.isCredit) {
                const chargeTypeDTOList = []
                d.payType.forEach((item, index) => {
                    chargeTypeDTOList.push({
                        chargeTypeCode: param2Obj(item).code,
                        chargeTypeCost:
              d.payType.length > 1
                  ? index === 0
                      ? Number(d.firstType)
                      : Number(d.secondType)
                  : Number(this.total - this.CommercialBalance),
                        chargeTypeName: param2Obj(item).name
                    })
                })
                const chargeIds = []
                this.chargeIds.forEach(item => {
                    chargeIds.push(item.chargeId)
                })
                repayData = {
                    chargeIds: chargeIds,
                    patientId: this.patientInfo.patientId,
                    repayAmount: this.total,
                    chargeTypeDTOList: chargeTypeDTOList,
                    reductionAmt: toFixed(this.reductionAmt, 2)
                }
            } else {
                tempData = {
                    commercialInsuranceCost: this.CommercialPay ? Number(this.CommercialPay) : 0,
                    commercialInsuranceTypeCode: '21',
                    commercialInsuranceTypeName: this.patientInfo.commercialInsuranceType || '',
                    medicalInsuranceCost: this.medicalInsuranceCost ? Number(this.medicalInsuranceCost) : 0,
                    medicalInsuranceTypeCode: '11',
                    medicalInsuranceTypeName: this.medicalInsuranceCost ? '医保' : '',
                    patientId: this.patientInfo.sysPatientId,
                    registerId: this.patientInfo.id,
                    totalAmount: this.total,
                    detailList: this.detailList,
                    reductionAmt: toFixed(this.reductionAmt, 2)
                }
            }

            if (d) {
                const chargeTypeDTOList = []
                if (this.form.payments === 'two') {
                    // 多种支付
                    const payIndex = d.payType.indexOf('code=11&name=%E5%8C%BB%E4%BF%9D')
                    if (payIndex > -1) {
                        chargeTypeDTOList.push({
                            chargeTypeCode: param2Obj(d.payType[payIndex]).code,
                            chargeTypeCost: Number(d.firstType),
                            chargeTypeName: param2Obj(d.payType[payIndex]).name
                        })
                        chargeTypeDTOList.push({
                            chargeTypeCode: param2Obj(d.payType[1 - payIndex]).code,
                            chargeTypeCost: d.secondType,
                            chargeTypeName: param2Obj(d.payType[1 - payIndex]).name
                        })
                        // })
                    } else {
                        d.payType.forEach((item, index) => {
                            chargeTypeDTOList.push({
                                chargeTypeCode: param2Obj(item).code,
                                chargeTypeCost:
                  d.payType.length > 1
                      ? index === 0
                          ? Number(d.firstType)
                          : Number(d.secondType)
                      : Number(this.total - this.CommercialBalance),
                                chargeTypeName: param2Obj(item).name
                            })
                        })
                    }

                    const otherData = {
                        chargeTypeDTOList: chargeTypeDTOList
                    }
                    data = Object.assign({}, tempData, otherData)
                } else {
                    // 单种支付
                    // const otherData = {
                    //     otherChargeTypeCost: d.payAccount ? d.payAccount : 0,
                    //     otherChargeTypeCode: d.payAccount ? payType.code : '',
                    //     otherChargeTypeName: d.payAccount ? payType.name : ''
                    // }
                    const otherData = {
                        otherChargeTypeCost: d.payAccount >= 0 ? d.payAccount : 0,
                        otherChargeTypeCode: d.payAccount >= 0 ? payType.code : '',
                        otherChargeTypeName: d.payAccount >= 0 ? payType.name : ''
                    }
                    data = Object.assign({}, tempData, otherData)
                }
                const isUseInsurance = this.commonUtil.getConfigValue('isUseInsurance')
                let ipAddress = ''
                let databaseName = ''
                if (isUseInsurance === '1') {
                    if (this.commonUtil.getExplorer() !== 'ie') {
                        this.audeLoading = false
                        this.$message.warning('请使用IE浏览器进行医保诊所审核')
                        return false
                    } else {
                        ipAddress = this.commonUtil.getConfigValue('ipDispose')
                        databaseName = this.commonUtil.getConfigValue('databaseName')
                        const clinicId = this.$store.getters.clinic.thirdPartyClinicId
                        if (!ipAddress || !clinicId || !databaseName) {
                            this.audeLoading = false
                            this.$message.warning('该诊所未进行相关金舵手服务配置，请联系管理员！')
                            return false
                        }
                    }
                }
                // this.dialogVisible = false
                // this.$emit('activeName', 'charge')
                // return
                // 收费
                if (this.isCredit) {
                    repay(repayData).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.dialogVisible = false
                            this.$emit('chargeFinish')
                        }
                    })
                } else {
                    if (this.routerSource === 'quickSell') {
                        // 快速售药
                        chargeQuickPayment(data).then(res => {
                            if (res.STATUS === '1') {
                                const d = res.ITEMS
                                if (!d || !d.jdsChangeRecipeSql || isUseInsurance !== '1') {
                                    this.chargeCallback(res)
                                    return false
                                }
                                this.execSql(databaseName, ipAddress, res)
                            }
                        })
                    } else {
                        charge(data).then(res => {
                            if (res.STATUS === '1') {
                                const d = res.ITEMS
                                if (!d || !d.jdsChangeRecipeSql || isUseInsurance !== '1') {
                                    this.chargeCallback(res)
                                    return false
                                }
                                this.execSql(databaseName, ipAddress, res)
                            }
                        })
                    }
                }
            }
        },

        execSql(databaseName, ipAddress, res) {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                // 创建数据库连接对象
                const conn = new ActiveXObject('ADODB.Connection')
                // Server ip服务：需要配置
                // Data Source数据库服务:需要配置
                const connectionstring = `Provider=SQLOLEDB;Persist Security Info=False;Initial Catalog=${databaseName};Data Source=${ipAddress};User ID=H2O;Password=123456`
                // 打开连接
                conn.open(connectionstring)
                try {
                    console.log(res.ITEMS.jdsChangeRecipeSql)
                    conn.Execute(res.ITEMS.jdsChangeRecipeSql)
                } catch (e) {
                    console.log(e)
                }
                conn.Close()
                this.chargeCallback(res)
            }
        },

        chargeCallback(res) {
            this.loading = false
            this.$message.success(res.MESSAGE)
            this.dialogVisible = false
            if (this.commonUtil.getConfigValue('isChargeAndDis') !== '0') {
                if (res.ITEMS.deliveryId) {
                    sendDispens({ id: res.ITEMS.deliveryId }).then(res => {})
                }
            }
            this.$nextTick(() => {
                if (this.checkList.length > 0) {
                    // 获取打印的收费明细、收费单
                    if(this.patientInfo.sysPatientId){
                        patientInfo(this.patientInfo.sysPatientId).then(result => {
                            if (result.STATUS === '1') {
                                this.outpatientNumber = result.ITEMS.patient.opCaseNum
                                this.getChargeDetail(res)
                            }
                        })
                    }else{
                        this.getChargeDetail(res)
                    }
                }
            })

            this.$emit('activeName', 'charge')
        },

        getChargeDetail(res){
            getChargeDetail(res.ITEMS.chargeId).then(res => {
                                if (res && res.STATUS === '1') {
                                    const list = res.ITEMS.detailList // 药品列表
                                    this.chargeAccount = res.ITEMS.charge.totalAmt // 收费金额
                                    this.receivedCash = res.ITEMS.charge.receivedCash
                                    // this.outpatientNumber = res.ITEMS.charge.outpatientNum
                                    this.doctorName = res.ITEMS.charge.doctorName // 医生
                                    this.receiverName = res.ITEMS.charge.receiverName // 收费人员
                                    this.chargeSource = res.ITEMS.charge.chargeSource || '自费' // 收费来源
                                    this.clinicTime = res.ITEMS.charge.chargeTime // 收费时间
                                    this.clinicInfoName = res.ITEMS.charge.orgName
                                    this.chargeNum = res.ITEMS.charge.chargeNum
                                    const t = res.ITEMS.typeList
                                    const result = []
                                    const that = this
                                    this._.forEach(list, function(item) {
                                        result.push({
                                            name: item.accrualCatName,
                                            spec: item.spec,
                                            unit: item.unit,
                                            price: item.price,
                                            zongAccount: item.totalAmt,
                                            recipeChara: item.recipeChara,
                                            num: item.qty
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

                                    this.info = result

                                    this.$nextTick(() => {
                                        this.checkPrint()
                                    })
                                }
                            })
        },

        // 支付方式的多选框改变值
        handleChange(val) {
            if (this.form.payments === 'one') {
                if (val.length > 1) {
                    val.splice(0, val.length - 1)
                    this.form.payType = val
                    this.tempPayType = this.form.payType
                } else {
                    this.form.payType = this.tempPayType
                }
                this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), this.reductionAmt)
                this.total = add(this.temp_total, this.decimal_total)
            } else {
                this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), this.reductionAmt)
                if (this.form.payType.length > 1) {
                    // 支付方式有医保时，医保为第一个
                    const payIndex = this.form.payType.indexOf('code=11&name=%E5%8C%BB%E4%BF%9D')
                    if (payIndex > -1) {
                        this.firstTypeName = param2Obj(this.form.payType[payIndex]).name
                        this.secondTypeName = param2Obj(this.form.payType[1 - payIndex]).name
                    } else {
                        this.firstTypeName = param2Obj(this.form.payType[0]).name
                        this.secondTypeName = param2Obj(this.form.payType[1]).name
                    }

                    this.form.firstType = ''
                    this.form.secondType = ''
                }
            }
        },

        // 收完费打印
        checkPrint() {
            const that = this
            this._.forEach(that.checkList, function(item) {
                if (item === '打印登记票据') {
                    that.handlePrintRegister(that.patientInfo)
                }
                if (item === '打印收费清单(A4)') {
                    that.print('A4')
                }
                if (item === '打印收费清单(小票)') {
                    that.print('xp')
                }
                if (item === '打印收费票据') {
                    that.printCharge()
                }
                if (item === '打印明细发票') {
                    that.print()
                }
                if (item === '打印收费类型发票') {
                    that.printCharge('发票')
                }
            })
            window.location.reload()
        },

        // 打印
        print(type) {
            // item.chargeSourceCode===1?'快速收费'
            const chargeInfo = {
                patientInfoName: this.patientInfo.name
                    ? this.patientInfo.name
                    : this.chargeSource === '快速收费'
                        ? '快速收费'
                        : '',
                chargeSource: this.chargeSource,
                outpatientNumber: this.outpatientNumber || '-',
                clinicTime: this.clinicTime,
                chargeAccount: this.chargeAccount,
                total: this.total,
                receivedCash:
          this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
              ? getFloat(this.receivedCash, '6')
              : this.receivedCash,
                otherName: this.otherName,
                doctorName: this.doctorName,
                receiverName: this.receiverName,
                // currentTime: getCurrentDay(),
                currentTime: this.getTwoSeconds(),

                isCash: !!(
                    this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
                ),
                clinicInfoName: this.clinicInfoName,
                chargeNum: this.chargeNum,
                sex: this.patientInfo.sex,
                phone: encryptStar(this.patientInfo.tel, 3, 4),
                reductionAmt: this.reductionAmt
            }
            if (type === 'A4') {
                handlePrintDetail(this.info, chargeInfo)
            } else if (type === 'xp') {
                handlePrintDetailxp(this.info, chargeInfo)
            } else {
                handlePrintBillmx(this.info, chargeInfo)
            }
        },

        printCharge(type) {
            const chargeInfo = {
                clinicInfoName: this.clinicInfoName,
                clinicTime: this.clinicTime,
                patientInfoName: this.patientInfo.name
                    ? this.patientInfo.name
                    : this.chargeSource === '快速收费'
                        ? '快速收费'
                        : '',
                chargeSource: this.chargeSource,
                doctorName: this.doctorName,
                currentTime: getCurrentDay(),
                receiverName: this.receiverName,
                total: this.total,
                isCash: !!(
                    this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
                ),
                receivedCash:
          this.otherName &&
          this.otherName.split('、').length === 1 &&
          this.otherName.split('、')[0] === '现金'
              ? getFloat(this.receivedCash, '6')
              : this.receivedCash
            }
            if (type === '发票') {
                handlePrintBillxp(this.info, chargeInfo)
            } else {
                handlePrintCount(this.info, chargeInfo)
            }
        },

        // 打印挂号单
        handlePrintRegister(item) {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const orgName = this.$store.getters.clinic.orgName
            const date = item.regDate ? item.regDate.split(' ')[0] : ''
            const doctorName = item.patientStatus === 0 ? '未分诊' : item.doctorName || ''
            const chargeAmount =
        item.chargeAmount || item.chargeAmount === 0 ? `￥${item.chargeAmount}` : ''
            const content = `
                <div class="print patientRes">
                    <div class="page">
                        <h2>${orgName}</h2>
                        <h3>登记单</h3>
                        <div class="main">
                            <div class="content">
                                <div class="item">
                                    <label>科室：<span> ${item.deptName}</span></label>
                                </div>
                                <div class="item">
                                    <label>医生姓名： <span>${doctorName}</span></label>
                                </div>
                                <div class="item">
                                    <label>挂号时间：<span>${date}</span></label>
                                </div>
                                <div class="item">
                                    <label>排队序号：<span>${item.sn || ''}</span></label>
                                </div>
                            </div>
                            <div class="content">
                                <div class="item">
                                    <label>患者姓名：<span>${item.name}</span></label>
                                </div>
                                <div class="item">
                                    <label>诊金：<span>${chargeAmount}</span></label>
                                </div>
                            </div>
                            <div class="content">
                                <div class="item">
                                    <label class="beizhu">注：挂号当日有效，过期作废！</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            const newContent = content
            const oldContent = document.body.innerHTML
            document.body.innerHTML = newContent

            // setTimeout(() => {
            window.print()
            // window.location.reload()
            document.body.innerHTML = oldContent
            return false
            // }, 1000);
        },

        // 支付方式的切换
        handleClick(tab) {
            if (tab.name === 'one') {
                if (this.isCredit) {
                    this.payList = deepClone(this.cachePayList)
                    this.payList.splice(4, 1)
                    this.payUrl = deepClone(this.cachePayUrl)
                    this.payUrl.splice(4, 1)
                } else {
                    this.payList = deepClone(this.cachePayList)
                    this.payUrl = deepClone(this.cachePayUrl)
                }
                this.form.payType = [this.payList[0].value]

                this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), this.reductionAmt)
                this.medicalInsuranceCost = 0
            } else {
                this.payList = deepClone(this.cachePayList)
                // if (!this.isCredit) {
                this.payList.splice(4, 1)
                // }
                this.payUrl = deepClone(this.cachePayUrl)
                this.payUrl.splice(4, 1)
                this.form.payType = []
                this.form.firstType = ''
                this.form.secondType = ''

                this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), this.reductionAmt)
            }
            this.total = add(this.temp_total, this.decimal_total)
        },

        // 多种支付的第一种支付方式改变值
        handleInput(val) {
            if (val < 0) {
                this.$message.error('请输入正确的金额')
            }
            if (
                this.firstTypeName !== '医保' &&
        this.form.payType[0].toString() === [this.payList[0].value].toString()
            ) {
                if (String(val).indexOf('.') > -1 && String(val).split('.')[1].length > 1) {
                    this.$message.error('小数点后最多可输入一位小数')
                    return
                }
            } else {
                if (String(val).indexOf('.') > -1 && String(val).split('.')[1].length > 2) {
                    this.$message.error('小数点后最多可输入两位小数')
                    return
                }
            }

            if (this.form.firstType && isNaN(this.form.firstType)) {
                this.$message.error('请输入正确的金额')
                return
            }
            if (this.firstTypeName === '医保') {
                // 医保用户且用医保支付
                if (
                    this.patientInfo.patientSources === '01' &&
          (this.patientInfo.commercialInsuranceCode === '3' ||
            this.patientInfo.commercialInsuranceCode === '8')
                ) {
                    // 是否为保无忧用户
                    this.CommercialPay =
            subtract(this.temp_total, val) < this.CommercialBalance
                ? subtract(this.temp_total, val)
                : this.CommercialBalance // 商保支付金额
                } else {
                    this.CommercialPay = 0
                }
                this.medicalInsuranceCost = val
                this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), val)
                this.form.secondType = this.needPay
                // this.CommercialPay = subtract(this.temp_total, val)
            } else {
                this.form.secondType = toFixed(Number(this.needPay) - Number(val))
            }
        },

        // 登记并收费修改患者信息
        handleRegisterChange(patientInfo) {
            patientInfo.sex = patientInfo.sex ? formatSex(patientInfo.sex) : ''
            this.patientInfo = patientInfo
            this.chargeDetail()
        },

        // 获取加2秒的时间
        getTwoSeconds() {
            const date = new Date(new Date().getTime() + 2000)
            const temp =
        ' ' +
        (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) +
        ':' +
        (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()) +
        ':' +
        (date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds())
            return (
                date.getFullYear() +
        '-' +
        (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) +
        '-' +
        (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
        temp
            )
        },

        // 修改减免金额
        changeFreeAccount(val) {
            if (!val || isNaN(val)) {
                this.reductionAmt = ''
            }

            this.needPay = subtract(subtract(this.temp_total, this.CommercialPay), this.reductionAmt || 0)
            this.needPay = toFixed(this.needPay, 2)
            this.form.amountPaid = getFloat(this.needPay, '6') // 应收
        }
    }
}
</script>

<style lang="scss" scoped>
.main {
  // padding: 0 20px;
  display: flex;
  justify-content: space-between;
  margin-top: -15px;
}
.dialog_left {
  width: 40%;
  p {
    width: 100%;
    height: auto;
    margin-top: 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-size: 16px;
      color: #4d4d4d;
    }
  }
  .yingshou {
    margin-top: 0;
    height: 40px;
    color: #000000;
    font-weight: bold;
    line-height: 40px;
    span {
      font-size: 18px;
    }
    span:nth-of-type(2) {
      font-size: 20px;
      color: #ff0000;
    }
  }
  .chargeDetail {
    width: 100%;
    height: 1px;
    border-bottom: 1px solid #509;
    box-sizing: border-box;
    position: relative;
    margin: 18px 0;
    span {
      display: block;
      position: absolute;
      width: 100px;
      left: 50%;
      margin-left: -50px;
      background: #fff;
      top: -9px;
      font-size: 15px;
      color: #509;
      text-align: center;
    }
  }
  .title1 {
    font-size: 18px;
    color: #4d4d4d;
    text-align: center;
    margin-top: 20px;
  }
  .el-form {
    margin-top: 25px;
    width: 100%;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
}
.dialog_right {
  width: 56%;
  border: 1px solid #eee;
  .title1 {
    font-size: 16px;
    color: #4d4d4d;
    text-align: center;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
  }
  .el-form {
    // margin-top: 45px;
    padding: 0 10px;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
  .surplus {
    color: #ea5514;
    font-size: 18px;
    font-weight: bold;
    margin-top: 20px;
    margin-left: 9%;
  }
}
.bottom_btn {
  text-align: right;
  margin-right: 60px;
  margin-top: 30px;
  margin-bottom: 20px;
  button {
    width: 100px;
  }
  button:nth-of-type(1) {
    background-color: #ff0000;
    border-color: #ff0000;
  }
}
.selectType {
  margin-top: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  text-align: center;
  img {
    display: block;
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
    margin-left: -18px;
  }
  .el-checkbox {
    margin: 10px 7px;
  }
}
.groupList {
  .el-checkbox {
    margin-bottom: 10px;
  }
}
</style>

<style>
.dialog_left .el-input-group__append {
  background-color: #00913a;
  color: #fff;
  border: 1px solid #00913a;
  padding: 0 10px;
}
.dialog_right .el-input-group__append:nth-of-type(2) {
  background: #3350ff;
}
.dialog_right .el-form-item__label {
  width: auto !important;
}
.form_btn .el-input-group__append {
  background-color: #3350ff;
  border: 1px solid #3350ff;
}
.bottom-content {
  margin-top: 80px;
}
.dialog_left .bottom-content p span {
  font-size: 15px;
}
.dialog_left .bottom-content .el-checkbox {
  width: 16%;
}
.charge .el-dialog__header {
  background-color: #0097ff;
}
.charge .el-dialog__title {
  color: #ffffff;
  font-size: 20px;
}
.el-tabs__nav-wrap::after {
  height: 1px;
}
/* .selectType  */
</style>
