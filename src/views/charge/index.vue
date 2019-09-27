<template>
    <el-row class="page-container chargeDetail">

        <el-row v-if="libIndex" class="page-main">
            <el-row class="tabs-right">
                <template v-if="beChargedType === 1">
                    <el-button :size="size" type="primary" @click="quickSell">快速售药</el-button>
                    <el-button :size="size" type="primary" @click="quick">快速收费</el-button>
                </template>
                <el-button v-if="beChargedType === 2 || beChargedType === 3" :size="size" plain icon="el-icon-arrow-left" @click="back">返回</el-button>
            </el-row>
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="(tab.key === 'beCharged' && beChargedType === 1) || tab.key === 'charge' || tab.key === 'refund'">
                        <el-radio-group v-model="listType">
                            <el-radio-button label="0">
                                <i class="el-icon-tickets" />&ensp;列表
                            </el-radio-button>
                            <el-radio-button label="1">
                                <i class="el-icon-picture" />&ensp;卡片
                            </el-radio-button>
                        </el-radio-group>
                    </template>
                    <!-- 待收费 -->
                    <template v-if="tab.key === 'beCharged' && beChargedType === 1">
                        <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="recordSearchList" @handleSearch="handleFormSearch" />
                        <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="recordElList" :panel-list="recordList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                        <el-table-self v-else :columns="recordColumns" :table-data="recordList" :current-page="pageIndex" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>

                    <!-- 个人收费项目 -->
                    <template v-if="tab.key === 'beCharged' && beChargedType === 2">
                        <div class="person_info">
                            <div class="person_top">
                                <el-row :gutter="20">
                                    <el-col v-for="(item,index) in chargeElList" :key="index" :span="6">
                                        <p>{{ item.label }}：{{ chargeInfoList[item.value] }}</p>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                        <div class="charge_select">
                            <el-row :gutter="20">
                                <el-col :span="18" class="el-col-left">
                                    <el-table-self :columns="chargeColumns" :table-data="chargeList" :tab-type="chargeType" :tab-label="chargeLabel" />
                                    <el-button v-if="!isAddOther" type="primary" style="margin:20px 0" @click="isAddOther = true">增加其他收费项目</el-button>
                                    <!-- <el-button type="primary" style="margin:20px 0" @click="handleSetProvide" v-if="chargeType === 'index'">药品自备</el-button> -->
                                    <el-button :loading="loading" type="primary" style="margin:20px 0 20px 10px" @click="handleSaveProvide">确认药品来源</el-button>
                                    <el-button v-if="isAddOther" type="danger" style="margin:20px 28px 10px 0;float:right;position:relative;z-index:2" @click="cancelOtherCharge">取消</el-button>
                                    <complex-tab v-if="isAddOther" :columns="otherChargeColumns" :add-columns="addColumns" :table-data="otherChargeList" :disabled="false" :params="{style:{width:'780px'},placeholder:'请输入收费项目',type:'chargeItem'}" @addItem="addItem" />
                                </el-col>
                                <el-col :span="6">
                                    <div class="construction">
                                        <el-container>
                                            <el-header class="title">收费汇总</el-header>
                                            <div class="list">
                                                <p>
                                                    <!-- <span>#</span> -->
                                                    <span>项目</span>
                                                    <span>金额</span>
                                                </p>
                                                <p v-for="(c,cIndex) in construtList" v-if="c.money!=0" :key="cIndex">
                                                    <!-- <span>{{cIndex+1}}</span> -->
                                                    <span>{{ c.project }}</span>
                                                    <span>{{ c.money }}</span>
                                                </p>
                                            </div>
                                            <el-footer>
                                                <p>
                                                    <span>合计：</span>
                                                    <span>￥{{ quickSum }}</span>
                                                </p>
                                                <el-button type="primary" @click="open">收费</el-button>
                                            </el-footer>
                                        </el-container>
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </template>

                    <!-- 已收费 -->
                    <template v-if="tab.key === 'charge'">
                        <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="recordSearchList" @handleSearch="handleFormSearch" />
                        <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="haschargeElList" :panel-list="haschargeList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                        <el-table-self v-else :columns="haschargeColumns" :current-page="pageIndex" :table-data="haschargeList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>

                    <!-- 已退费 -->
                    <template v-if="tab.key === 'refund'">
                        <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="recordSearchList" @handleSearch="handleFormSearch" />
                        <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="refundElList" :panel-list="refundList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                        <el-table-self v-else :columns="refundColumns" :current-page="pageIndex" :table-data="refundList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>

                    <!-- 收费流水 -->
                    <template v-if="tab.key === 'detail'">
                        <!-- <direct-search
                        ref="form"
                        :label-position="'right'"
                        :form-style="{'text-align':'right','margin-bottom':'10px'}"
                        :forms="detailSearchList"
                        @handleSearch="handleFormSearch"
                        />
                        <el-table-self
                        :getSummaries="getSummaries"
                        :columns="detailColumns"
                        :table-data="detailList"
                        :show-summary="true"
                        />-->
                        <charge-detail ref="chargeDetail" />
                    </template>

                    <!-- 记账记录 -->
                    <template v-if="tab.key === 'creditRecord'">
                        <credit-record ref="creditRecord" />
                    </template>

                    <!-- 交账管理 -->
                    <template v-if="tab.key === 'accountManager'">
                        <account-detail ref="accountDetail" />
                    </template>
                </el-tab-pane>
            </el-tabs>
            <!-- 收费弹窗 -->
            <dialogCharge ref="dialog" :input-style="'width:300px;'" :is-credit="isCredit" title="付款" @activeName="handleActive" @chargeFinish="handleSearch" />
            <!-- 快速收费 -->
            <quick-charge ref="quickDialog" :be-charged-type="beChargedType" :quick-charge-type="quickChargeType" @showQuickCharge="showQuickCharge" @activeName="handleActive" @chargeFinish="handleSearch" />
        </el-row>

        <transition name="fade" mode="out-in">
            <keep-alive>
                <router-view />
            </keep-alive>
        </transition>
    </el-row>
</template>

<script>
import ImageCropper from '@/components/ImageCropper'
import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'
import elTableSelf from '@/components/TabComponents/index'
import complexTab from '@/components/TabComponents/complex'
import paginationMixin from '@/components/TabComponents/mixin'
import dialogCharge from './components/charge'
import creditRecord from './components/creditRecord'
import quickCharge from './quickCharge/index'

import { getBabyAge, defaultPickOpts, formatSex, paramAvatar, pickerOptions } from '@/utils'
import { getFloat, add, toFixed } from '@/utils/float'

import { unCharge, cancelCharge } from '@/api/arclinic'
import { getUnchargeList, getUnchargeCount, saveDrugProvide } from '@/api/outpatient'
import { getChargeList } from '@/api/charge'
import { mapGetters } from 'vuex'
import { getDictByIdList, getBasicSettingNum } from '@/api/catalog'

import chargeDetail from './components/chargeDetail'
import accountDetail from './components/accountDetail'
import { deepClone, formatDictMap } from '../../utils'
import count from './mixin/count'
import moment from 'moment'

export default {
    components: {
        ImageCropper,
        directSearch,
        panelCard,
        elTableSelf,
        dialogCharge,
        complexTab,
        creditRecord,
        chargeDetail,
        accountDetail,
        quickCharge
    },
    mixins: [paginationMixin, count],
    data() {
        const defaultShowType = this.commonUtil.getConfigValue('defaultShowType') // 列表展示样式
        const dictMap = {
            9: [], // 性别
            144: [], // 用法
            146: [], // 来源
            131: [] // 证件类型
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
                        let obj = {}
                        obj = {
                            value: item.code,
                            label: item.name
                        }
                        dictMap[item.dictId].push(obj)
                    })
                }
            }
        })
        return {
            size: 'small',
            libIndex: true,
            loading: false,
            cacheForm: {},
            listType: defaultShowType,
            defaultPickOpts,
            avatar: '',
            tabMapOpts: [
                {
                    label: '待收费',
                    key: 'beCharged'
                },
                {
                    label: '已收费',
                    key: 'charge'
                },
                {
                    label: '已退费',
                    key: 'refund'
                },
                {
                    label: '收费流水',
                    key: 'detail'
                },
                {
                    label: '记账记录',
                    key: 'creditRecord'
                },
                {
                    label: '交账管理',
                    key: 'accountManager'
                }
            ],
            beChargedType: 1,
            // 快速收费类型1：快速收费+登记，2：无需登记直接售药
            quickChargeType: 1,
            activeName: 'beCharged',
            // 收费list搜索栏
            recordSearchList: [
                {
                    type: 'checkbox',
                    prop: 'isHiddenChargeList',
                    opts: [
                        {
                            value: 1,
                            label: '作废单'
                        }
                    ],
                    hidden: false
                },
                {
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '',
                    prop: 'dates',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'condition',
                    placeholder: '患者姓名/手机号/病历号/单据号',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],

            // 待收费模板列表
            recordElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age'
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    },
                    {
                        name: '接诊时间',
                        value: 'clinicTime'
                    },
                    {
                        name: '结束时间',
                        value: 'clinicCompletedTime'
                    },
                    {
                        name: '接诊医生',
                        value: 'doctorName'
                    },
                    {
                        name: '',
                        formatter(row) {
                            return `（${row.patientStatus}）`
                        }
                    }
                ],
                btnlist: [
                    {
                        formatter(row) {
                            return row.isCancellationCharge === 1 ? '恢复' : '作废'
                        },
                        func: this.handleCancelCharge
                    },
                    {
                        name: '收费',
                        func: this.handleJump,
                        isHidden(row) {
                            return row.isCancellationCharge === 1
                        }
                        // formatter(row) {
                        //     return row.chargeTotal ? `${row.chargeTotal}` : 0
                        // }
                    }
                ]
            },
            recordList: [], // 待收费数据
            recordColumns: [
                {
                    label: '序号',
                    value: 'index'
                },
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '性别',
                    value: 'sex',
                    width: 100
                },
                {
                    label: '年龄',
                    value: 'age'
                },
                {
                    label: '用户类型',
                    value: 'commercialInsuranceType'
                },
                {
                    label: '接诊时间',
                    value: 'clinicTime'
                },
                {
                    label: '结束时间',
                    value: 'clinicCompletedTime'
                },
                {
                    label: '接诊医生',
                    width: 150,
                    value: 'doctorName'
                },
                {
                    label: '状态',
                    width: 100,
                    formatter(row) {
                        return row.patientStatus
                    }
                },
                {
                    label: '操作',
                    operType: 'button',
                    width: 180,
                    operations: [
                        {
                            formatter(row) {
                                return {
                                    label: row.isCancellationCharge === 1 ? '恢复' : '作废',
                                    type: 'danger'
                                }
                            },
                            func: this.handleCancelCharge
                        },
                        {
                            func: this.handleJump,
                            label: '收费',
                            type: 'primary',
                            isHidden(row) {
                                return row.isCancellationCharge === 1
                            }
                        }
                    ]
                }
            ],

            // 待收费明细表格
            chargeColumns: [
                {
                    value: 'projectName',
                    label: '项目名称'
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'quantity',
                    label: '数量'
                },
                {
                    value: 'unit',
                    label: '单位'
                },
                {
                    value: 'unitPrice',
                    label: '单价'
                },
                {
                    value: 'sumMoney',
                    label: '金额'
                },
                {
                    value: 'medicineType',
                    label: '药品来源',
                    operType: 'select',
                    opts: dictMap[146],
                    formatterDisabled(row) {
                        return !(row.chara === '10' || row.chara === '20')
                    }
                },
                {
                    value: 'executiveSection',
                    label: '执行科室'
                }
            ],
            // 待收费明细数据
            chargeList: [],

            // 已收费数据
            haschargeList: [],
            // 已收费模板列表
            haschargeElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age',
                    func: this.refundStatus
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    },
                    {
                        name: '接诊时间',
                        value: 'clinicTime'
                    },
                    {
                        name: '收费时间',
                        value: 'chargeTime'
                    },
                    {
                        name: '收费人员',
                        value: 'reciverName'
                    }
                    // {
                    //   name: "记账金额",
                    //   value: "onAccountOrg"
                    // }
                ],
                statusList: [
                    {
                        value: 'refundStatus',
                        formatter(val) {
                            if (val === 2) {
                                return '申请退费'
                            }
                            return ''
                        }
                    },
                    {
                        value: 'chargeSourceCode',
                        formatter(val) {
                            if (val === 1) {
                                return '快速收费'
                            }
                            return ''
                        }
                    }
                ],
                btnlist: [
                    {
                        value: 'charge',
                        style: 'color:#EA5514',
                        formatter(row) {
                            return `￥${row.receivedCash}`
                        },
                        func: this.handDetail
                    },
                    // {
                    //   name: "交账",
                    //   func: this.openCharge,
                    //   isHidden(row) {
                    //     return !(row.onAccountOrg > 0);
                    //   }
                    // },
                    {
                        formatter(row) {
                            return row.refundStatus === 1 ? '详情' : '退费'
                        },
                        func: this.refundStatus
                    }
                    // {
                    //     name: '打印',
                    //     func: this.print
                    // }
                ]
            },
            haschargeColumns: [
                {
                    label: '序号',
                    value: 'index'
                },
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '性别',
                    value: 'sex',
                    width: 100
                },
                {
                    label: '年龄',
                    value: 'age'
                },
                {
                    label: '用户类型',
                    width: 150,
                    value: 'commercialInsuranceType'
                },
                {
                    label: '接诊时间',
                    value: 'clinicTime'
                },
                {
                    label: '收费时间',
                    value: 'chargeTime'
                },
                {
                    label: '收费人员',
                    width: 150,
                    value: 'reciverName'
                },
                {
                    label: '金额',
                    value: 'charge',
                    formatter(row) {
                        return row.receivedCash
                    }
                },
                {
                    label: '优惠金额',
                    value: 'reductionAmt'
                },
                {
                    label: '操作',
                    operType: 'button',
                    width: 200,
                    operations: [
                        {
                            func: this.handDetail,
                            label: '详情',
                            type: 'primary'
                        },
                        {
                            func: this.refundStatus,
                            label: '退费',
                            type: 'warning'
                        }
                    ]
                }
            ],

            // 已退费数据
            refundList: [],
            // 已退费模板列表
            refundElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age',
                    func: this.refundStatus
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    },
                    {
                        name: '退费时间',
                        value: 'updateTime'
                    },
                    {
                        name: '退费人员',
                        value: 'reciverName'
                    }
                ],
                btnlist: [
                    {
                        value: 'charge',
                        formatter(row) {
                            return row.charge ? `￥${row.charge}` : ''
                        },
                        func: this.refundStatus
                    }
                ]
            },
            refundColumns: [
                {
                    label: '序号',
                    value: 'index'
                },
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '性别',
                    value: 'sex',
                    width: 100
                },
                {
                    label: '年龄',
                    value: 'age'
                },
                {
                    label: '用户类型',
                    width: 150,
                    value: 'commercialInsuranceType'
                },
                {
                    label: '退费时间',
                    value: 'updateTime'
                },
                {
                    label: '退费人员',
                    value: 'reciverName'
                },
                {
                    label: '金额',
                    value: 'charge',
                    formatter(row) {
                        return row.charge ? row.charge : ''
                    }
                },
                {
                    label: '操作',
                    operType: 'button',
                    width: 100,
                    operations: [
                        {
                            func: this.refundStatus,
                            label: '详情',
                            type: 'primary'
                        }
                    ]
                }
            ],

            // 收费患者基本信息模板
            chargeElList: [
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '科室',
                    value: 'deptName'
                },
                {
                    label: '医师',
                    value: 'doctorName'
                },
                {
                    label: '证件类型',
                    value: 'idNumTypeName'
                },
                {
                    label: '证件号码',
                    value: 'idNum'
                },
                {
                    label: '单据号',
                    value: 'billNumber'
                },
                {
                    label: '性别',
                    value: 'sex'
                },
                {
                    label: '年龄',
                    value: 'age'
                }
            ],
            // 收费患者基本信息数据
            chargeInfoList: {
                name: '',
                deptName: '',
                doctorName: '',
                idNumTypeName: '',
                idNum: '',
                billNumber: '',
                sex: '',
                invoiceNumber: '',
                age: ''
            },

            // 传到收费弹窗的各种金额数据
            chargeData: {},
            insurance: {},
            /** 收费     */
            chargeType: 'index',
            chargeLabel: '组号',
            // 收费汇总的标题
            construtColumns: [
                {
                    value: 'project',
                    label: '项目'
                },
                {
                    value: 'money',
                    label: '金额'
                }
            ],
            // 收费汇总
            construtList: [],
            pageIndex: 1,
            quickSum: 0, // 收费明细总计金额
            isCredit: false,
            dictMap,
            selections: [],
            defaultShowDay: this.commonUtil.getConfigValue('waitChargeDefaultDays')
        }
    },
    watch: {
        $route(to, from) {
            this.routerChange()
        },
        beChargedType(val, old) {
            this.beChargedType = val
        }
    },
    computed: {
        ...mapGetters(['basic'])
    },
    mounted() {
        console.log(this.commonUtil.toChineseNum(203.0))
        this.routerChange()
        this.handleSearch()
    },
    methods: {
        routerChange() {
            this.libIndex = this.$route.name === 'charge'
            if (this.$route.name === 'charge') {
                // this.activeName = 'beCharged'
                // this.pageIndex = 1
                const startDate = moment()
                    .subtract(this.defaultShowDay, 'days')
                    .format('YYYY-MM-DD HH:mm:ss')
                const endDate = moment().format('YYYY-MM-DD HH:mm:ss')
                const dates = [startDate, endDate]
                if (this.activeName === 'beCharged') {
                    this.cacheForm.dates = this.defaultShowDay ? dates : []
                }
                this.handleSearch()
            }
        },

        formatAge(val) {
            if (val) {
                this.form.age = getBabyAge(val)
            } else {
                this.form.age = ''
            }
        },

        // 切换pane
        handleSwitch(tab) {
            this.beChargedType = 1
            this.isAddOther = false
            this.otherChargeList = []
            this.quickchargeList = []
            this.cacheForm = {}
            this.$refs.creditRecord[0].back() // 恢复为记账记录主页
            if (tab.name === 'beCharged') {
                this.$nextTick(() => {
                    this.recordSearchList[0].hidden = false
                    const startDate = moment()
                        .subtract(this.defaultShowDay, 'days')
                        .format('YYYY-MM-DD HH:mm:ss')
                    const endDate = moment().format('YYYY-MM-DD HH:mm:ss')
                    const dates = [startDate, endDate]
                    this.cacheForm.dates = this.defaultShowDay ? dates : []
                    this.cacheForm.isHiddenChargeList = []
                })
            } else {
                this.recordSearchList[0].hidden = true
            }
            this.pageIndex = 1
            if (tab.name === 'detail') {
                this.$refs.chargeDetail[0].handleSearch()
            }
            if (tab.name === 'accountManager') {
                this.$refs.accountDetail[0].handleSearch()
            }

            this.$nextTick(() => {
                this.handleSearch()
                if (this.$refs.form.length > 0) {
                    const dates = this.cacheForm.dates || []
                    const isHiddenChargeList = this.cacheForm.isHiddenChargeList || []
                    this.$refs.form.forEach((item, index) => {
                        this.$refs.form[index].$refs.form.resetFields()
                        this.$refs.form[index].initFieldsObj({
                            dates,
                            isHiddenChargeList
                        })
                    })
                }
            })
        },
        headerCell() {
            return 'border-bottom:1px dashed #ebeef5;padding:0;height:40px;margin-bottom:10px;'
        },
        cell() {
            return 'height:25px;padding:0;border:none;'
        },
        // 返回
        back() {
            this.beChargedType = 1
            this.quickchargeList = []
            this.otherChargeList = []
            this.isAddOther = false
            this.$nextTick(() => {
                this.$refs.form.forEach((item, index) => {
                    this.$refs.form[index].initFieldsObj({
                        condition: this.cacheForm.condition || '',
                        dates: this.cacheForm.dates || [],
                        isHiddenChargeList: this.cacheForm.isHiddenChargeList || []
                    })
                })
            })
        },
        // 最终收费弹窗打开
        open() {
            if (this.quickSum >= 0) {
                this.isCredit = false
                const detailList = []
                if (this.otherChargeList && this.otherChargeList.length > 0) {
                    this.otherChargeList.forEach(item => {
                        if (item.medicineType !== '09') {
                            detailList.push({
                                isParent: item.isParent,
                                isStock: item.isStock,
                                itemId: item.id,
                                itemCode: item.code,
                                // price: item.amt,
                                price: item.price, // sjf 2019-05-21更改

                                invoiceItemCode: item.invoiceItemCode,
                                invoiceItemName: item.invoiceItemName,
                                accountItemCode: item.accountItemCode,
                                accountItemName: item.accountItemName,
                                batchNum: item.batchNum, // ...
                                groupSn: item.groupSn,
                                chara: item.chara,
                                qty: item.qty,
                                itemName: item.name,
                                unit: item.unit,
                                dosage: item.specDose,
                                usage: item.userMethod,
                                spec: item.spec,
                                frequency: item.frequency,
                                amt: item.amt,
                                insuranceCodes: item.insuranceCodes,
                                isTinyRecipe: 1
                            })
                        }
                    })
                }
                const data = {
                    detailList,
                    patientId: this.chargeInfoList.sysPatientId,
                    registerId: this.chargeInfoList.id,
                    totalAmount: this.quickSum
                }
                getUnchargeList(this.chargeInfoList.sysPatientId, this.chargeInfoList.id).then(res => {
                    if (res.STATUS === '1') {
                        this.insurance = res.ITEMS.insurance // 保险信息
                    }
                })
                this.$nextTick(() => {
                    this.$refs.dialog.open(
                        this.chargeInfoList,
                        this.insurance,
                        this.quickSum,
                        detailList,
                        [],
                        '',
                        false,
                        this.chargeList
                    )
                })
                // this.$refs.dialog.open(this.chargeInfoList, this.insurance, this.chargeAmt)
            } else {
                this.$message.warning('合计金额不可以小于0')
            }
        },

        // 个人收费详情
        handleJump(item) {
            this.chargeType = 'index'

            this.quickSum = 0
            this.chargeList = []
            getBasicSettingNum('outpatientChargeNum').then(res => {
                if (res.STATUS === '1') {
                    item.billNumber = res.ITEMS
                }
            })
            this.$nextTick(() => {
                if (item) {
                    this.chargeInfoList = Object.assign(item)
                    this.chargeInfoList.idNumTypeName = formatDictMap(
                        this.dictMap[131],
                        this.chargeInfoList.idNumType
                    )
                    // this.shangbao = item.commercialInsuranceCode && item.commercialInsuranceType ? param({ code: item.commercialInsuranceCode, name: item.commercialInsuranceType || '' }) : ''
                }
            })

            const registerId = item.id
            const patientId = item.sysPatientId

            getUnchargeList(patientId, registerId).then(res => {
                if (res.STATUS === '1') {
                    this.chargeItemDetail(res)
                }
            })

            this.beChargedType = 2
        },
        // 整理个人收费详情
        chargeItemDetail(res) {
            this.construtList = [
                {
                    chara: '10',
                    money: 0,
                    project: '西药费'
                },
                {
                    chara: '20',
                    money: 0,
                    project: '中药费'
                },
                {
                    chara: '30',
                    money: 0,
                    project: '检验/检查'
                },
                {
                    chara: '40',
                    money: 0,
                    project: '治疗费'
                },
                {
                    chara: '50',
                    money: 0,
                    project: '材料费'
                },
                {
                    chara: '99',
                    money: 0,
                    project: '其他'
                }
            ]
            const cost = res.ITEMS.costMap
            const d = res.ITEMS.detailList
            const total = res.ITEMS.total
            this.insurance = res.ITEMS.insurance // 保险信息
            const result = []
            const that = this
            this._.forEach(d, function(item) {
                result.push({
                    id: item.chargeItemId,
                    projectName: item.itemName,
                    spec: item.spec,
                    quantity: item.qty,
                    unit: item.unit,
                    unitPrice: item.price,
                    sumMoney: item.amt,
                    executiveSection: item.execDeptName,
                    chara: item.chara,
                    amt: item.amt,
                    insuranceCodes: item.insuranceCodes,
                    itemId: item.id,
                    medicineType: item.medicineType
                })
            })
            const newD = d.concat(this.otherChargeList)
            this._.forEach(newD, function(item) {
                if (item.chara === '10') {
                    that.construtList[0].money = add(
                        toFixed(that.construtList[0].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '20') {
                    that.construtList[1].money = add(
                        toFixed(that.construtList[1].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '30') {
                    that.construtList[2].money = add(
                        toFixed(that.construtList[2].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '40') {
                    that.construtList[3].money = add(
                        toFixed(that.construtList[3].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '50') {
                    that.construtList[4].money = add(
                        toFixed(that.construtList[4].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '99') {
                    that.construtList[5].money = add(
                        toFixed(that.construtList[5].money, 2),
                        toFixed(item.amt, 2)
                    )
                }
            })
            //   if (cost) {
            //     const obj = cost
            //     for (const i in obj) {
            //       this.construtList.push({ project: i, money: obj[i] }) // 收费汇总
            //     }
            //   }

            this.quickSum = getFloat(total, 4)

            this.chargeList = result // 收费明细

            this.chargeAmt = getFloat(total, 4) // 金额
        },

        // 分页查询
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询列表
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form

            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            if (this.activeName === 'beCharged') {
                this.$nextTick(() => {
                    if (this.$refs.form && this.$refs.form.length > 0) {
                        this.$refs.form[0].initFieldsObj(params)
                    }
                    params.dates = params.dates ? params.dates : []
                    params.condition = params.condition ? params.condition : ''
                    params.isHiddenCharge = !(
                        params.isHiddenChargeList && params.isHiddenChargeList.length > 0
                    )
                    const data = deepClone(params)
                    if (data.isHiddenChargeList) {
                        delete data.isHiddenChargeList
                    }
                    unCharge(data).then(res => {
                        this.getUnchargePage(res)
                    })
                })
            } else if (this.activeName === 'charge') {
                const data = deepClone(params)
                data.status = '0'
                data.beginTime = data.dates ? data.dates[0] : ''
                data.endTime = data.dates ? data.dates[1] : ''
                data.name = data.condition ? data.condition : ''
                data.refundStatus = '0,2'
                data.dates = ''
                data.outAccountOrg = true
                getChargeList(data).then(res => {
                    this.getChargePage(res)
                })
            } else if (this.activeName === 'refund') {
                const data = deepClone(params)
                data.status = '0'
                data.beginTime = data.dates ? data.dates[0] : ''
                data.endTime = data.dates ? data.dates[1] : ''
                data.name = data.condition ? data.condition : ''
                data.refundStatus = '1'
                data.dates = ''
                getChargeList(data).then(res => {
                    this.getRefundPage(res)
                })
            } else if (this.activeName === 'creditRecord') {
                this.$nextTick(() => {
                    this.$refs.creditRecord[0].$refs.form[0].handleSearch()
                })
            }
        },

        // 待收费list
        getUnchargePage(res) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                let result = []
                let total = 0
                const that = this
                if (d.total > 0) {
                    this._.forEach(d.records, function(item, index) {
                        item.avatar = item.headImg
                            ? that.basic.filePrifix + item.headImg
                            : paramAvatar(item.sex, item.birthDate)
                        item.sex = formatSex(String(item.sex))
                        item.age = item.birthDate ? getBabyAge(String(item.birthDate)) : ''
                        switch (item.patientStatus) {
                            case 0:
                                item.patientStatus = '登记'
                                break
                            case 1:
                                item.patientStatus = '就诊'
                                break
                            case 2:
                                item.patientStatus = '就诊中'
                                break
                            case 3:
                                item.patientStatus = '完成就诊'
                                break
                        }
                        item.index = d.size * (d.current - 1) + index + 1
                    })
                    result = d.records
                    total = d.total
                }
                this.recordList = result
                this.total = total
            }
        },

        // 已收费list
        getChargePage(res) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                let result = []
                let total = 0
                const that = this
                if (d.totalRecord > 0) {
                    this._.forEach(d.list, function(item, index) {
                        item.avatar = item.headImg
                            ? that.basic.filePrifix + item.headImg
                            : paramAvatar(item.sex, item.birthDate)
                        item.name = item.patientName
                        item.sex = formatSex(String(item.sex))
                        item.age = item.birthDate ? getBabyAge(String(item.birthDate)) : ''
                        item.charge = item.totalAmt ? item.totalAmt : 0
                        item.isRefund = item.refundStatus === 1 ? 1 : 0
                        item.index = d.size * (d.current - 1) + index + 1
                    })
                    result = d.list
                    total = d.totalRecord
                }
                this.haschargeList = result
                this.total = total
            }
        },

        // 已退费list
        getRefundPage(res) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                let result = []
                let total = 0
                const that = this
                if (d.totalRecord > 0) {
                    this._.forEach(d.list, function(item, index) {
                        item.avatar = item.headImg
                            ? that.basic.filePrifix + item.headImg
                            : paramAvatar(item.sex, item.birthDate)
                        item.name = item.patientName
                        item.sex = formatSex(String(item.sex))
                        item.age = item.birthDate ? getBabyAge(String(item.birthDate)) : ''
                        item.charge = item.totalAmt ? Math.abs(item.totalAmt) : 0
                        item.index = d.size * (d.current - 1) + index + 1
                    })
                    result = d.list
                    total = d.totalRecord
                }
                this.refundList = result
                this.total = total
            }
        },

        // 收费后显示已收费列表
        handleActive(name) {
            this.beChargedType = 1
            this.activeName = name
            this.recordSearchList[0].hidden = true
            this.cacheForm.dates = []
            this.cacheForm.condition = ''
            this.cacheForm.isHiddenChargeList = []
            this.$nextTick(() => {
                if (this.$refs.form.length > 0) {
                    this.$refs.form.forEach((item, index) => {
                        this.$refs.form[index].initFieldsObj({
                            condition: this.cacheForm.condition,
                            dates: this.cacheForm.dates || [],
                            isHiddenChargeList: this.cacheForm.isHiddenChargeList || []
                        })
                    })
                }
                this.handleSearch()
            })
        },

        handDetail(item) {
            this.$router.push({
                name: 'chargeDetail',
                params: {
                    chargeId: item.chargeId,
                    patientId: item.patientId || 0,
                    time: item.clinicTime ? item.clinicTime : 's',
                    type: 'chargeDetail'
                }
            })
        },
        // 跳转到退费详情页面
        refundStatus(item) {
            // const refundProcess= this.$store.getters.clinic.configList.refundProcess
            // if(refundProcess && refundProcess.actualValue !== '4' && refundProcess.actualValue !== '1' && item.refundStatus === 2 ){
            //     this.$message.warning('请先去药房申请退药')
            // }else{

            const type =
        item.refundStatus === 1 || (item.chargeStatus === 1 && item.refundStatus === 0)
            ? 'refundDetail'
            : 'refund'
            // 已退费详情
            this.$router.push({
                name: 'chargeDetail',
                params: {
                    chargeId: item.chargeId,
                    patientId: item.patientId || 0,
                    time: item.clinicTime ? item.clinicTime : 's',
                    type
                }
            })
            // }
        },

        // 快速收费弹窗
        quick() {
            this.quickChargeType = 1
            this.$refs.quickDialog.open()
        },

        // 快速售药
        quickSell() {
            this.quickChargeType = 2
            this.showQuickCharge()
        },

        // 已收费列表打开收费
        // openCharge(row) {
        //     getUnchargeList(row.patientId, row.registerId).then(res => {
        //         if (res.STATUS === '1') {
        //             this.insurance = res.ITEMS.insurance
        //             this.isCredit = true
        //         }
        //     })
        //     this.$nextTick(() => {
        //         this.$refs.dialog.open(
        //             row,
        //             this.insurance,
        //             row.onAccountOrg,
        //             [],
        //             [
        //                 {
        //                     chargeId: row.chargeId,
        //                     money: row.onAccountOrg,
        //                     chargeNum: row.chargeNum
        //                 }
        //             ]
        //         )
        //     })
        // },

        showQuickCharge() {
            this.activeName = 'beCharged'
            this.$refs.quickDialog.init()
            this.beChargedType = 3
        },

        // 药品自备选择
        // selectionChange(selections) {
        //     this.selections = selections
        // },

        // 设置药品自备
        // handleSetProvide() {
        //     this.chargeType = ''
        //     this.$nextTick(() => {
        //         this.chargeType = 'selection'
        //     })
        //     // this.selectable()
        // },

        // 保存药品自备
        handleSaveProvide() {
            // return
            const recipeDetailIds = []
            if (this.chargeList && this.chargeList.length > 0) {
                this.chargeList.forEach(item => {
                    if (item.medicineType === '09') {
                        recipeDetailIds.push(item.itemId)
                    }
                })
            } else {
                this.$message.warning('没有可以修改的收费项目')
                return
            }
            if (recipeDetailIds.length > 0) {
                const data = {
                    patientId: this.chargeInfoList.sysPatientId,
                    registerId: this.chargeInfoList.id,
                    recipeDetailIds
                }
                this.$confirm('确认修改药品来源？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.loading = true
                        saveDrugProvide(data)
                            .then(res => {
                                this.loading = false
                                if (res.STATUS === '1') {
                                    this.$message.success(res.MESSAGE)
                                    // const arr = res.detailList.concat(this.otherChargeList)
                                    this.chargeItemDetail(res)
                                }
                            })
                            .catch(() => {
                                this.loading = false
                            })
                    })
                    .catch(() => {})
            } else {
                this.$message.warning('无修改')
            }
        },

        // 设置某些行不可选
        selectable(row) {
            if (row.chara === '10' || row.chara === '20') {
                return true
            } else {
                return false
            }
        },

        handleCancelCharge(row) {
            this.$confirm(`是否${row.isCancellationCharge === 1 ? '恢复' : '作废'}该收费单`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    const data = {
                        regId: row.id,
                        isCancelCharge: row.isCancellationCharge === 1 ? 0 : 1
                    }
                    cancelCharge(data).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.handleSearch()
                        }
                    })
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss">
.chargeDetail {
  .input-search {
    width: 202px;
  }

  .person_info {
    border: 1px solid #409eff;
    .person_top {
      border-bottom: 1px dashed #ddd;
      padding-bottom: 20px;
      p {
        padding: 20px;
        padding-bottom: 0;
        font-size: 14px;
      }
    }
    .person_bottom {
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      span {
        font-size: 14px;
        margin-left: 30px;
      }
      .el-select {
        width: 150px;
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .charge_select {
    margin-top: 20px;
    .el-col-left {
      padding-right: 0 !important;
    }
    .el-table-self {
      margin-right: 0 !important;
      margin-left: 0 !important;
    }
  }
  .construction {
    width: 100%;
    height: 100%;
    border: 1px solid #ebeef5;
    .title {
      text-align: center;
      padding: 8px 0;
      width: 100%;
      font-size: 15px;
      height: 40px !important;
      font-weight: bold;
      border-bottom: 1px solid #ebeef5;
    }
    .el-main {
      padding: 0 10px;
    }
    .el-footer {
      border-top: 1px dashed #ebeef5;
      height: auto !important;
      text-align: right;
      padding: 0;
      margin: 50px 10px 0;
      p {
        margin-top: 10px;
      }
    }
    .el-button--primary {
      margin: 10px 0;
    }
    .el-table::before {
      height: 0;
    }
    .el-table__fixed-right::before {
      height: 0 !important;
    }
    .el-table__fixed::before {
      height: 0 !important;
      background: none;
    }
  }
  .list {
    margin: 0 20px;
    p {
      width: 100%;
      font-size: 12px;
      display: block;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #ddd;
      padding: 0 20px;
      color: #606266;
    }
    p:nth-of-type(1) {
      font-weight: bold;
      color: #909399;
    }
    p span {
      display: inline-block;
      width: 50%;
      float: left;
    }
    p span:nth-of-type(1) {
      text-align: left;
    }
    p span:nth-of-type(2) {
      text-align: right;
    }
  }
}
</style>

<style>
.charge_select .el-table__fixed-right::before {
  height: 0 !important;
}
</style>
