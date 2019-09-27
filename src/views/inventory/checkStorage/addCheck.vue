<template>
  <el-row class="addCheck">
    <p class="title">{{title}}
      <el-button type="primary" @click="handleSave">保存
      </el-button>
      <el-button type="info" plain @click="stopCheck" v-if="status === -1 ">终止盘点</el-button>
      <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
    </p>
    <el-row v-loading="loading">
      <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','float':'left', 'margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
      <div class="count">
        <span>进货盈亏合计：{{purchasePl}}</span>
        <span>零售盈亏合计：{{retailPl}}</span>
        <el-checkbox v-model="isStock" @change="handleFormSearch">0库存不展示</el-checkbox>
        <el-checkbox v-model="isExpireDate" @change="handleFormSearch">过期药物不显示</el-checkbox>
        <div class="note">备注：<el-input v-model="note"></el-input>
        </div>
      </div>
      <el-table-self name="nowStorage" :current-page="pageIndex" :table-data="tabData" :columns="tabColumns" :total-count="totalCount" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" />
    </el-row>
  </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import {
    checkDetail,
    checkListOfNew,
    checkListOfGo,
    stockStatusOff,
    saveCheck
} from '@/api/pharmacy'
import { toFixed } from '@/utils/float'

export default {
    components: {
        directSearch,
        elTableSelf
    },
    mixins: [paginationMixin],
    props: {
        type: { type: String }
    },
    computed: {
        title() {
            return this.type === 'edit' ? '修改盘点' : '新增盘点'
        }
    },
    data() {
        return {
            searchList: [
                {
                    type: 'input',
                    label: '',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    },
                    placeholder: '药品名称/药品拼音码',
                    prop: 'catName',
                    labelWidth: '0'
                },
                {
                    type: 'select',
                    label: '类型选择',
                    opts: [
                        {
                            label: '全部',
                            value: ''
                        },
                        {
                            label: '西药',
                            value: '1001'
                        },
                        {
                            label: '中成药',
                            value: '1002'
                        },
                        {
                            label: '中草药',
                            value: '2001'
                        },
                        {
                            label: '材料',
                            value: '5001'
                        }
                    ],
                    prop: 'catType'
                }
            ],
            isStock: false,
            isExpireDate: false,
            retailPl: 0,
            purchasePl: 0,
            loading: false,
            totalCount: 0,
            tabColumns: [
                {
                    label: '商品名称',
                    value: 'catName',
                    width: '200px'
                },
                {
                    label: '规格',
                    value: 'spec',
                    width: '150px'
                },
                {
                    label: '生产厂商',
                    value: 'manufacturerName'
                },
                {
                    label: '药品批号',
                    width: 100,
                    value: 'batchNum'
                },
                {
                    label: '进货价（元）',
                    width: 100,
                    value: 'purchasePrice'
                },
                {
                    label: '零售价（元）',
                    width: 100,
                    value: 'retailPrice'
                },
                {
                    label: '有效期',
                    value: 'validDate'
                },
                {
                    label: '账面数量',
                    width: 120,
                    value: 'bookQty'
                },
                {
                    label: '实际数量',
                    value: 'checkQty',
                    width: 220,
                    formatter1(row) {
                        return row.specUnit || ''
                    },
                    bigFunc: this.handlecheckInput,
                    value2: 'useCheckQty',
                    formatter2(row) {
                        return row.specUseUnit || ''
                    },
                    smallFunc: this.handlecheckInput,
                    operType: 'check-inputs'
                },
                {
                    label: '进货盈亏（元）',
                    value: 'purchasePriceAmt',
                    width: 120
                },
                {
                    label: '零售盈亏（元）',
                    value: 'retailPriceAmt',
                    width: 120
                }
            ],
            cacheData: [],

            tabData: [],
            checkId: this.$route.params.id,
            cacheForm: {},
            firstNew: true,
            status: '',
            flag: true,
            note: ''
        }
    },
    methods: {
        back() {
            this.$store.dispatch('delVisitedViews', this.$route)
            this.$router.push({ name: 'storage' })
        },
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.loading = true
            this.flag = true
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            if (this.type === 'addNew' && this.firstNew) {
                this.getAddCheckList(params)
            }
            // 继续盘点
            if (this.type === 'addGo' || !this.firstNew) {
                this.getAddCheckListGo(params)
            }
            // 修改
            if (this.type === 'edit' && this.checkId) {
                this.editCheckList(params)
            }
            this.firstNew = false
        },

        // 新增盘点列表
        getAddCheckList(params) {
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.isStock = this.isStock ? '1' : ''
            params.isExpireDate = this.isExpireDate ? 1 : 0
            checkListOfNew(params).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    this.arrangeData(res)
                }
            })
        },

        // 继续盘点药品
        getAddCheckListGo(params) {
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.isStock = this.isStock ? '1' : ''
            params.isExpireDate = this.isExpireDate ? 1 : 0
            params.id = this.checkId
            checkListOfGo(params).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    this.arrangeData(res)
                }
            })
        },
        // 整理数据
        arrangeData(res) {
            const d = res.ITEMS.page
            this.status = res.ITEMS.check.status
            this.checkId = res.ITEMS.check.id
            this.note = res.ITEMS.check.remark
            if (d.records && d.records.length > 0) {
                d.records.forEach(item => {
                    // let qty = 0
                    if (item.isTiny === 1) {
                        // 库存大单位
                        const bigUnit =
              item.bookQty && item.coefficient
                  ? `${parseInt(item.bookQty / item.coefficient)}${item.specUnit || ''}`
                  : ''
                        // 库存小单位
                        const smallUnit =
              item.bookQty && item.coefficient
                  ? item.bookQty % item.coefficient
                      ? `${parseInt(item.bookQty % item.coefficient)}${item.specUseUnit || ''}`
                      : ''
                  : ''
                        item.bookQty = bigUnit + smallUnit
                    } else {
                        item.purchasePrice = toFixed(item.purchasePrice, 4)
                        item.bookQty = item.specUnit ? `${item.bookQty}${item.specUnit}` : item.bookQty
                    }
                    item.purchasePrice = item.purchasePrice + ' 元 /' + item.unit // 进货单价
                    item.retailPrice = item.retailPrice + ' 元 /' + item.unit // 零售单价
                    item.purchasePriceAmt = item.purchasePriceAmt || 0 // 进货盈亏
                    item.retailPriceAmt = item.retailPriceAmt || 0 // 零售盈亏
                    item.initbigQty = item.checkQty // 初始数量(大)
                    item.initsmallQty = item.useCheckQty // 初始账面数量(小)
                })
            }
            this.tabData = d.records
            this.totalCount = d.total
        },

        // 获取修改盘点药品单
        editCheckList(params) {
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.isStock = this.isStock ? '1' : ''
            params.id = this.checkId
            checkDetail(params).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const r = d.page
                    this.status = d.check.status
                    this.note = d.check.remark
                    this.retailPl = d.check.retailPl || 0
                    this.purchasePl = d.check.purchasePl || 0
                    if (r.records && r.records.length > 0) {
                        r.records.forEach(item => {
                            if (item.isTiny === 1) {
                                item.initbigQty =
                  item.bookQty && item.coefficient ? parseInt(item.bookQty / item.coefficient) : '' // 初始数量(大)
                                item.initsmallQty =
                  item.bookQty && item.coefficient
                      ? item.bookQty % item.coefficient
                          ? parseInt(item.bookQty % item.coefficient)
                          : 0
                      : '' // 初始账面数量(小)
                                // 库存大单位
                                const bigUnit =
                  item.bookQty && item.coefficient
                      ? `${parseInt(item.bookQty / item.coefficient)}${item.specUnit || ''}`
                      : ''

                                // 库存小单位
                                const smallUnit =
                  item.bookQty && item.coefficient
                      ? item.bookQty % item.coefficient
                          ? `${parseInt(item.bookQty % item.coefficient)}${item.specUseUnit || ''}`
                          : ''
                      : ''
                                item.bookQty = bigUnit + smallUnit
                                item.purchasePrice = item.purchasePrice + ' 元 /' + item.specUseUnit // 进货单价
                                item.retailPrice = item.retailPrice + ' 元 /' + item.specUseUnit // 零售单价
                            } else {
                                item.initbigQty = item.specUnit ? item.bookQty : item.bookQty
                                item.bookQty = item.specUnit ? `${item.bookQty}${item.specUnit}` : item.bookQty
                                item.purchasePrice = item.purchasePrice + ' 元 /' + item.specUnit // 进货单价
                                item.retailPrice = item.retailPrice + ' 元 /' + item.specUnit // 零售单价
                            }
                            item.checkQty = item.checkQty || item.initbigQty
                            item.useCheckQty = item.useCheckQty || item.initsmallQty
                            item.purchasePriceAmt = item.purchasePriceAmt || 0
                            item.retailPriceAmt = item.retailPriceAmt || 0
                        })
                    }
                    this.tabData = r.records
                    this.totalCount = r.total
                }
            })
        },

        // 终止盘点
        stopCheck() {
            this.$confirm('盘点未完成，终止后将清空本次盘点数据并解除库房锁定', '提示', {
                type: 'warning'
            })
                .then(() => {
                    stockStatusOff().then(res => {
                        if (res.STATUS === '1') {
                            this.$store.dispatch('delVisitedViews', this.$route)
                            this.$router.push({ name: 'storage' })
                        }
                    })
                })
                .catch(() => {})
        },

        // 修改实际数量
        handlecheckInput(row, index) {
            var re = /^(0|\+?[1-9][0-9]*)$/
            if (!re.test(row.checkQty)) {
                this.$message.warning('禁止输入小数，负数和非数字')
                row.checkQty = 0
                this.flag = false
            } else {
                this.flag = true
            }
            if (!re.test(row.useCheckQty)) {
                this.$message.warning('禁止输入小数，负数和非数字')
                row.useCheckQty = 0
                this.flag = false
            } else {
                this.flag = true
            }
            const initPurchase = row.purchasePriceAmt
            const initRetail = row.retailPriceAmt
            if (row.isTiny === 1) {
                row.retailPriceAmt = toFixed(
                    (row.checkQty * row.coefficient +
            Number(row.useCheckQty) -
            (row.initbigQty * row.coefficient + Number(row.initsmallQty))) *
            parseFloat(row.retailPrice),
                    4
                )
                row.purchasePriceAmt = toFixed(
                    (row.checkQty * row.coefficient +
            Number(row.useCheckQty) -
            (row.initbigQty * row.coefficient + Number(row.initsmallQty))) *
            parseFloat(row.purchasePrice),
                    4
                )
            } else {
                row.retailPriceAmt = toFixed(
                    (row.checkQty - row.initbigQty) * parseFloat(row.retailPrice),
                    4
                )
                row.purchasePriceAmt = toFixed(
                    (row.checkQty - row.initbigQty) * parseFloat(row.purchasePrice),
                    4
                )
            }
            this.purchasePl = toFixed(this.purchasePl - initPurchase + row.purchasePriceAmt, 4)
            this.retailPl = toFixed(this.retailPl - initRetail + row.retailPriceAmt, 4)
        },

        // 改变页码
        handleCurrentChange(val) {
            this.$confirm('切换分页后将清空本页所盘点内容，是否保存本次盘点', '提示', {
                type: 'warning',
                confirmButtonText: '是',
                cancelButtonText: '否'
            })
                .then(() => {
                    this.handleSave()
                    this.pageIndex = val
                    this.handleSearch()
                })
                .catch(() => {
                    this.firstNew = false
                    this.pageIndex = val
                    this.handleSearch()
                })
        },

        // 保存/修改
        handleSave() {
            if (this.flag) {
                this.loading = true
                const detailList = []
                const check = {
                    id: this.checkId,
                    remark: this.note
                }
                this.tabData.forEach(item => {
                    detailList.push({
                        checkQty: item.checkQty,
                        id: item.id,
                        useCheckQty: item.useCheckQty
                    })
                })
                const data = {
                    check: check,
                    detailList: detailList
                }
                // return

                saveCheck(data).then(res => {
                    this.loading = false
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                    }
                })
            }
        }
    },
    mounted() {
        this.handleFormSearch()
    }
}
</script>

<style scoped lang='scss'>
.title {
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  margin-bottom: 10px;
  line-height: 50px;
  button {
    float: right;
    margin-top: 7px;
    margin-left: 10px;
  }
}
.note {
  display: inline-block;
  margin-left: 20px;
  .el-input {
    display: inline-block;
    width: 200px;
  }
}
.count {
  float: left;
  font-size: 14px;
  height: 47px;
  line-height: 50px;
  color: #606266;
  span {
    margin-left: 20px;
    display: inline-block;
    width: 180px;
  }
  .el-checkbox {
    margin-left: 20px;
  }
}
.addCheck .el-table-self {
  clear: both;
}
.footer {
  text-align: right;
  margin-top: 30px;
}
</style>