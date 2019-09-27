<template>
  <el-row class="page-container">
    <el-row class="page-main" v-show="showIndex">
      <el-tabs v-model="activeName" type="card">

        <el-tab-pane label="入库管理" name="getStorage">
          <stroage-comp ref="form" key="getStorage" v-if="activeName === 'getStorage'" :search-list="searchList" :total-count='totalCount' :tab-columns="tabColumns" @handleSearch="handleSearch" :tab-data="tabData" :key="activeName" :summaryRetailPrice="summaryRetailPrice" :summaryPurchasePrice="summaryPurchasePrice" :isSearchInvoice="isSearchInvoice" >
          </stroage-comp>
        </el-tab-pane>

        <el-tab-pane label="出库管理" name="outStorage">
          <stroage-comp ref="form" key="outStorage" v-if="activeName === 'outStorage'" :search-list="searchList" :total-count='totalCount' :tab-columns="tabColumns" @handleSearch="handleSearch" :tab-data="tabData" :key="activeName">
          </stroage-comp>
        </el-tab-pane>

        <el-tab-pane label="当前库存" name="nowStorage">
          <now-storage ref="formNowStorage" v-if="activeName === 'nowStorage'"></now-storage>
        </el-tab-pane>

        <el-tab-pane label="库存盘点" name="checkDetail">
          <check-storage v-if="activeName === 'checkDetail'"></check-storage>
        </el-tab-pane>

        <el-tab-pane label="调价管理" name="pricingDetail">
          <pricing v-if="activeName === 'pricingDetail'" :activeName="activeName"></pricing>
        </el-tab-pane>

        <el-tab-pane label="发票管理" name="billDetail">
          <bill v-if="activeName === 'billDetail'" :activeName="activeName"></bill>
        </el-tab-pane>

      </el-tabs>
    </el-row>
    <transition name="fade" mode="out-in">
      <router-view :key="activeName"></router-view>
    </transition>
  </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { getStroageList, deleteStroage, getOpSkDealerList,getListByInvoice,getStroageListByInvoice } from '@/api/pharmacy'
import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'
import paginationMixin from '@/components/TabComponents/mixin'

import stroageComp from './components/stroage'
import nowStorage from './nowStorage/index'
import checkStorage from './checkStorage/index'
import pricing from './pricing/index'
import bill from './bill/index'
import { Session } from '@/utils/storage'
import {toFixed} from '@/utils/float'
import { defaultPickOpts, formatDictMap} from '@/utils'

export default {
    components: {
        elTableSelf,
        directSearch,
        nowStorage,
        stroageComp,
        checkStorage,
        pricing,
        bill
    },
    mixins: [paginationMixin],
    data() {
        const dictData = this.$store.getters.dictData
        var addBtnList = [
            { func: this.handleDetail, label: '查看详情', type: 'primary' },
            { func: this.handleCancleAudit, label: '取消审核', type: 'warning' }
        ]
        var outBtnList = [{ func: this.handleDetail, label: '查看详情', type: 'primary' }]
        var btnMoreList = [
            { func: this.handleUpdate, label: '修改', type: 'primary' },
            { func: this.handleAute, label: '审核', type: 'success' },
            { func: this.handleDelete, label: '删除', type: 'danger' }
        ]

        const dictMap = {
            141: [], // 出入库方式
            '141_in': [{ value: '', label: '全部' }],
            '141_out': [{ value: '', label: '全部' }]
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
                        if (item.dictId === 141) {
                            if (item.note === '1') {
                                dictMap['141_in'].push(obj)
                            } else if (item.note === '2') {
                                dictMap['141_out'].push(obj)
                            }
                        }
                        dictMap[item.dictId].push(obj)
                    })
                }
            }
        })
        const dealerList = [{ label: '全部', value: '' }]
        getOpSkDealerList().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach((item, index) => {
                        dealerList.push({
                            value: item.dealerName,
                            label: item.dealerName
                        })
                    })
                }
            }
        })
        return {
            dictMap,
            dictData,
            showIndex: true,
            defaultPickOpts,
            tabMapOpts: [
                {
                    label: '入库管理',
                    key: 'getStorage'
                },
                {
                    label: '出库管理',
                    key: 'outStorage'
                },
                {
                    label: '当前库存',
                    key: 'nowStorage'
                },
                {
                    label: '库存盘点',
                    key: 'checkDetail'
                },
                {
                    label: '调价管理',
                    key: 'pricingDetail'
                },
                {
                    label: '发票管理',
                    key: 'billDetail'
                }
            ],
            totalCount: 0,
            activeName: 'getStorage',
            tabData: [],
            tabInvoiceData:[],
            // 入库表单
            getSearchList: [
                {
                    type: 'date',
                    labelSpecial: '*',
                    label: '入库时间',
                    placeholder: '起始时间',
                    prop: 'startChangeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'date',
                    labelSpecial: '-',
                    labelWidth: '0px',
                    placeholder: '结束时间',
                    color: 'red',
                    prop: 'endChangeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    label: '入库类型',
                    labelWidth: '90px',
                    prop: 'changeMode',
                    placeholder: '请选择',
                    opts: dictMap['141_in']
                },
                {
                    type: 'select',
                    label: '供应商',
                    labelWidth: '90px',
                    prop: 'dealerName',
                    placeholder: '请选择',
                    opts: dealerList
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'batch',
                    placeholder: '入库单号',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'invoiceNum',
                    placeholder: '发票号',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                },
                {
                    labelWidth: '10px',
                    type: 'button',
                    color: 'primary',
                    value: '+新增入库',
                    func: this.addStorage
                }
            ],
            // 出库表单
            outSearchList: [
                {
                    type: 'date',
                    labelSpecial: '*',
                    label: '出库时间',
                    placeholder: '起始时间',
                    prop: 'startChangeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'date',
                    labelSpecial: '-',
                    labelWidth: '0px',
                    color: 'red',
                    placeholder: '结束时间',
                    prop: 'endChangeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    label: '出库类型',
                    prop: 'changeMode',
                    placeholder: '请选择',
                    opts: dictMap['141_out']
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'batch',
                    placeholder: '出库单号',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                },
                {
                    type: 'button',
                    color: 'primary',
                    value: '+新增出库',
                    func: this.addStorage
                }
            ],
            // 入库表头
            getTabColumns: [
                {
                    value: 'changeNum',
                    label: '入库单号',
                    align: 'center'
                },
                {
                    value: 'invoiceNum',
                    label: '发票号',
                    align: 'center'
                },
                {
                    value: 'changeTime',
                    label: '入库时间',
                    align: 'center'
                },
                {
                    value: 'changeMode',
                    label: '入库方式',
                    align: 'center'
                },
                {
                    value: 'dealerName',
                    label: '供应商',
                    align: 'center'
                },
                {
                    value: 'createUserName',
                    label: '制单人',
                    align: 'center'
                },
                {
                    value: 'checkedStatus',
                    label: '状态',
                    align: 'center',
                    formatter(row) {
                        return row.checkedStatus === 1 ? '已审核' : '未审核'
                    }
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 280,
                    operType: 'button',
                    operations: {
                        formatter(row) {
                            return row.checkedStatus === 1 ? addBtnList : btnMoreList
                        }
                    }
                }
            ],
            // 出库表头
            outTabColumns: [
                {
                    value: 'changeNum',
                    label: '出库单号',
                    align: 'center'
                },
                {
                    value: 'changeTime',
                    label: '出库时间',
                    align: 'center'
                },
                {
                    value: 'changeMode',
                    label: '出库方式',
                    align: 'center'
                },
                {
                    value: 'deptName',
                    label: '领用科室',
                    align: 'center'
                },
                {
                    value: 'createUserName',
                    label: '制单人',
                    align: 'center'
                },
                {
                    value: 'createUserName',
                    label: '出库人',
                    align: 'center'
                },
                {
                    value: 'checkedStatus',
                    label: '状态',
                    align: 'center',
                    formatter(row) {
                        return row.checkedStatus === 1 ? '已审核' : '未审核'
                    }
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    operType: 'button',
                    width: 280,
                    operations: {
                        formatter(row) {
                            return row.checkedStatus === 1 ? outBtnList : btnMoreList
                        }
                    }
                }
            ],
             tabInvoiceColumns: [
                {
                    value: 'changeNum',
                    label: '入库单号'
                },
                {
                    value: 'catName',
                    label: '商品名称',
                    minWidth: 150
                },
                {
                    value: 'catTypeName',
                    label: '药品类型',
                    width: 100
                },
                {
                    value: 'spec',
                    label: '规格',
                    width: 110
                },
                {
                    value: 'manufacturerName',
                    label: '生产厂商',
                    width: 200
                },
                {
                    value: 'specUnit',
                    label: '单位',
                    width: 100
                },
                {
                    value: 'storageNum',
                    label: '数量'
                },
                {
                    value: 'purchasePrice',
                    label: '进价'
                },
                {
                    value: 'purchasePriceAmt',
                    label: '进价金额'
                },
                {
                    value: 'temp_price',
                    width: 100,
                    label: '零售价'
                },
                {
                    value: 'temp_priceAmt',
                    label: '零售金额',
                    width: 100
                },
                {
                    value: 'chajiajiner',
                    label: '差价金额',
                    width: 100
                },
                {
                    value: 'batch',
                    label: '批号',
                    width: 120
                },
                {
                    value: 'expiryDate',
                    label: '有效期',
                    width: '100px',
                    formatter(row){
                        return row.expiryDate?row.expiryDate.split(' ')[0]:''
                    }
                },
                {
                    value: 'invoiceNumDetail',
                    label: '发票号',
                    width: '120px'
                }
            ],
            isSearchInvoice: false,
            cacheForm: {},
            a_idx: 0,
            summaryPurchasePrice:0,
            summaryRetailPrice:0
        }
    },
    computed: {
        changeType: function() {
            return this.activeName === 'getStorage'
                ? 'add'
                : this.activeName === 'outStorage'
                    ? 'out'
                    : '-1' // 0是入库，1是出库
        },
        searchList: function() {
            return this.changeType === 'add' ? this.getSearchList : this.outSearchList
        },
        tabColumns: function() {
            return this.isSearchInvoice?this.tabInvoiceColumns:this.changeType === 'add' ? this.getTabColumns : this.outTabColumns
        },
    },
    watch: {
        changeType: function(val, oldVal) {
            if (val !== '-1') {
                this.pageIndex = 1
                this.cacheForm = {}
            }
        },
        $route() {
            this.routerChange()
        }
    },
    methods: {
        routerChange() {
            this.showIndex = this.$route.name === 'storage'
            const detailRouter = Session.get('detailRouter')
            this.tabMapOpts.forEach(item => {
                if (item.key === 'checkDetail' || item.key === 'pricingDetail') {
                    if (!detailRouter[item.key]) {
                        item.hidden = true
                    }
                }
            })
        },

        // 查询
        handleSearch(form) {
            if (this.$route.name === 'storage') {
                this.cacheForm = this.cacheForm || form
                const params = Object.assign(this.cacheForm, form)
                if (!form) {
                    params.pageNo = this.pageIndex
                    params.pageSize = this.pageSize
                }
                if (this.changeType === 'add') {
                    params['changeType'] = 0
                } else if (this.changeType === 'out') {
                    params['changeType'] = 1
                }
                if (this.showIndex && params.dealerName && form) {
                    if (this.searchList[3].opts.filter(i => i.value === params.dealerName)[0]) {
                        params.dealerName = this.searchList[3].opts.filter(
                            i => i.value === params.dealerName
                        )[0].label
                    }
                }
                delete params.undefined
                if(params.invoiceNum){
                    getStroageListByInvoice(params).then(res => {
                    const d = res.ITEMS
                    this.handleSuccessInvoice(d)
                        if (this.pageIndex >= this.total / this.pageSize) {
                            getListByInvoice(params).then(res => {
                                if (res.STATUS === '1') {
                                    this.summaryPurchasePrice = res.ITEMS.purchasePriceAmtCount // 合计总进价
                                    this.summaryRetailPrice = res.ITEMS.retailPriceAmtCount // 合计总零售价
                                }
                            })
                        }
                    this.totalCount = d.total
                    this.tabData = d.records || []
                })
                }else{
                    getStroageList(params).then(res => {
                    const d = res.ITEMS
                    if (d && d.total > 0) {
                            d.records.forEach(item => {
                                item.changeMode = formatDictMap(this.dictMap[141], item.changeMode)
                            })
                        }

                        this.isSearchInvoice = false
                    this.totalCount = d.total
                    this.tabData = d.records || []
                })
                }

            }
        },
        handleSuccessInvoice(d){
            if (d && d.total > 0) {
                d.records.forEach(item => {
                    item.catTypeName = formatDictMap(this.dictData[148], item.catType)
                    if(item.isTiny === 1){
                        if (item.isTinyChange === 1) {
                                item.specUnit = item.specUseUnit
                                // 零售价
                                item.temp_price = item.retailPrice
                            } else {
                                // 数量
                                item.storageNum = toFixed((item.storageNum/ item.coefficient), 2)
                                // 进价
                                item.purchasePrice = toFixed((item.purchasePrice* item.coefficient), 4)
                                // 零售价
                                item.temp_price = toFixed((item.retailPrice* item.coefficient), 4)
                            }
                            item.temp_priceAmt = toFixed((item.temp_price* item.storageNum),2)
                            // 差价金额
                            item.chajiajiner = toFixed(
                                (item.temp_price - item.purchasePrice)*item.storageNum
                            )
                    }else{
                        item.temp_price = item.retailPrice
                                item.temp_priceAmt = toFixed(item.temp_price* item.storageNum)
                                item.chajiajiner = toFixed(
                                    (item.retailPrice - item.purchasePrice)*item.storageNum
                                )
                    }

                })
            }

            this.isSearchInvoice = true
        },

        // 取消审核
        handleCancleAudit(item) {
            this.$router.push({
                name: 'stroageDetail',
                params: { id: item.id, changeType: this.changeType, flag: true }
            })
        },

        // 查看详情
        handleDetail(item) {
            this.$router.push({
                name: 'stroageDetail',
                params: { id: item.id, changeType: this.changeType, flag: false }
            })
        },
        // 新增
        addStorage() {
            this.$router.push({
                name: 'addStorage',
                params: { id: '-1', changeType: this.changeType }
            })
        },
        // 修改
        handleUpdate(item) {
            this.$router.push({
                name: 'addStorage',
                params: { id: item.id, changeType: this.changeType }
            })
        },
        // 审核
        handleAute(item) {
            this.$router.push({
                name: 'audeStroage',
                params: { id: item.id, changeType: this.changeType }
            })
        },
        // 删除
        handleDelete(row, index) {
            const data = { id: row.id }
            this.$confirm('确认删除？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    deleteStroage(data).then(res => {
                        if (res.STATUS === '1') {
                            this.tabData.splice(index, 1)
                            this.$message.success('删除成功！')
                        }
                    })
                })
                .catch(() => {})
        },


    },
    mounted() {
        this.routerChange()
        this.dictData['148'] = [].concat(
            this.dictData['515'],
            this.dictData['516'],
            this.dictData['517'],
            this.dictData['518'],
            this.dictData['519'],
            this.dictData['520']
        )
    }
}
</script>
