<template>
  <el-row class="auditCheck">
    <p class="title">{{title}}

      <el-button
        type="primary"
        @click="handleAudit"
        v-if="type === 'audit'"
      >审核</el-button>
      <el-button
        type="primary"
        @click="printPrescription"
        v-if="type === 'detail'"
      >打印</el-button>
      <el-button
        icon="el-icon-arrow-left"
        @click.native="$router.back(-1)"
      >返回</el-button>
    </p>

    <div class="checkInfo">
      <span
        v-for="(item,i) in infoColumns"
        :key="i"
        v-if="!item.hidden"
      >{{item.label}}：{{infoData[item.value]}}</span>
    </div>
    <el-row v-loading="loading">
      <direct-search
        ref="form"
        :label-position="'center'"
        :label-width="'100px'"
        :form-style="{'text-align':'left','float':'left', 'margin':'10px 0px 20px 0'}"
        :forms="searchList"
        @handleSearch="handleFormSearch"
      />
      <div class="count">
        <el-checkbox
          v-model="isStock"
          @change="handleFormSearch"
        >0库存不展示</el-checkbox>
        <el-checkbox
          v-model="isExpireDate"
          @change="handleFormSearch"
        >过期药物不显示</el-checkbox>
        <span>备注：{{note}}</span>
      </div>
      <el-table-self
        name="nowStorage"
        :current-page="pageIndex"
        :table-data="tabData"
        :columns="tabColumns"
        :total-count="totalCount"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        @pageSizeChange="handleSizeChange"
        @currentPageChange="handleCurrentChange"
        @handleSearch="handleFormSearch"
      />
    </el-row>

    <!-- 打印 -->
    <div id="printCheck">
      <div class="printCheck">
        <!-- 标题 -->
        <div class="first-title">
          <h1>
            {{infoData.checkNum}}{{printTitle}}
          </h1>
        </div>
        <!-- 表单部分 -->
        <div class="second-form">
          <ul>
            <li
              v-for="(item,index) in infoColumns"
              :span="6"
              :key="index"
              v-if="item.label !== '盘点单号'"
            >{{item.label}}：{{infoData[item.value]}}</li>
          </ul>
        </div>
        <!-- 表格部分 -->
        <div class="third-table">
          <table
            border="1"
            cellspacing="0"
            align="center"
            style="table-layout:fixed;width:100%;"
          >
            <tr>
              <th
                v-for="(item,index) in tabColumns"
                :key="index"
              >{{ item.label }}</th>
            </tr>
            <tr
              v-for="(item,index) in tabData"
              :key="index"
            >
              <td
                v-for="(itemContent,indexContent) in tabColumns"
                :key="indexContent"
              >
                {{ itemContent.value === 'expiryDate'? item[itemContent.value].split(' ')[0]:item[itemContent.value] }}
              </td>
            </tr>
          </table>
        </div>
        <p class="footer-time">打印于：{{currentTime}}</p>
      </div>
    </div>
  </el-row>
</template>
<script>
import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'
import paginationMixin from '@/components/TabComponents/mixin'
import { auditCheck, checkDetail } from '@/api/pharmacy'
import { toFixed } from '@/utils/float'
import {
    remove_ie_header_and_footer
} from '@/utils/print'
import { getCurrentDay } from '@/utils/common'
export default {
    components: {
        elTableSelf,
        directSearch
    },
    mixins: [paginationMixin],
    props: {
        type: { type: String }
    },
    computed: {
        title() {
            return this.type === 'audit' ? '审核盘点' : '盘点记录详情'
        }
    },
    data() {
        return {
            loading: false,
            infoColumns: [
                {
                    label: '盘点日期',
                    value: 'checkTime'
                },
                {
                    label: '盘点单号',
                    value: 'checkNum'
                },
                {
                    label: '零售盈亏',
                    value: 'retailPl'
                },
                {
                    label: '进货盈亏',
                    value: 'purchasePl'
                },
                {
                    label: '制单人',
                    value: 'createUserName'
                },
                {
                    label: '审核人',
                    value: 'carryoverUserName'
                },
                {
                    label: '确认日期',
                    value: 'carryoverTime'
                }
            ],
            infoData: {},
            totalCount: 10,
            tabColumns: [
                {
                    label: '商品名称',
                    value: 'catName'
                },
                {
                    label: '规格',
                    value: 'spec'
                },
                {
                    label: '生产厂商',
                    value: 'manufacturerName'
                },
                {
                    label: '药品批号',
                    value: 'batchNum'
                },
                {
                    label: '进货价（元）',
                    value: 'purchasePrice'
                },
                {
                    label: '零售价（元）',
                    value: 'retailPrice'
                },
                {
                    label: '有效期',
                    value: 'validDate'
                },
                {
                    label: '账面数量',
                    value: 'bookQty'
                },
                {
                    label: '实际数量',
                    value: 'checkQty'
                },
                {
                    label: '进货盈亏（元）',
                    value: 'purchasePriceAmt'
                },
                {
                    label: '零售盈亏（元）',
                    value: 'retailPriceAmt'
                }
            ],
            tabData: [
                {
                    name: '11',
                    realNum: ''
                }
            ],
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
                            value: '01'
                        },
                        {
                            label: '中成药',
                            value: '09'
                        },
                        {
                            label: '中草药',
                            value: '02'
                        },
                        {
                            label: '材料',
                            value: '06'
                        }
                    ],
                    prop: 'catType'
                }
            ],
            isStock: false,
            isExpireDate: false,
            checkId: this.$route.params.id,
            printTitle: '盘点单详情',
            cacheForm: {},
            currentTime: '',
            note: ''
        }
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.loading = true
            if (this.type === 'audit') {
                this.infoColumns[5].hidden = true
                this.infoColumns[6].hidden = true
            } else {
                this.infoColumns[5].hidden = false
                this.infoColumns[6].hidden = false
            }
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.isStock = this.isStock ? '1' : ''
            params.isExpireDate = this.isExpireDate ? 1 : 0
            params.id = this.checkId
            checkDetail(params).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.infoData = d.check
                    this.note = d.check.remark || '无'
                    d.page.records.forEach(item => {
                        if (item.isTiny === 1) {
                            // 库存大单位
                            const bigUnit = item.bookQty && item.coefficient ? `${parseInt(item.bookQty / item.coefficient)}${item.specUnit || ''}` : ''
                            // 库存小单位
                            const smallUnit = item.bookQty && item.coefficient ? (item.bookQty % item.coefficient ? `${parseInt(item.bookQty % item.coefficient)}${item.specUseUnit || ''}` : '') : ''
                            item.bookQty = bigUnit + smallUnit
                            item.checkQty = item.checkQty + item.specUnit + (item.useCheckQty > 0 ? `${item.useCheckQty} ${item.specUseUnit} ` : '')
                            item.purchasePrice = item.purchasePrice + ' 元 /' + item.specUseUnit // 进货单价
                            item.retailPrice = item.retailPrice + ' 元 /' + item.specUseUnit // 零售单价
                        } else {
                            item.bookQty = item.specUnit ? `${item.bookQty}${item.specUnit}` : item.bookQty
                            item.purchasePrice = item.purchasePrice + ' 元 /' + item.specUnit // 进货单价
                            item.retailPrice = item.retailPrice + ' 元 /' + item.specUnit // 零售单价
                            item.checkQty = item.checkQty + item.specUnit
                        }
                        item.purchasePriceAmt = item.purchasePriceAmt || 0
                        item.retailPriceAmt = item.retailPriceAmt || 0
                    })
                    this.tabData = d.page.records
                    this.totalCount = d.page.total
                }
            })
        },

        // 审核
        handleAudit() {
            auditCheck(this.checkId).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.$store.dispatch('delVisitedViews', this.$route)
                    this.$router.push({ name: 'storage' })
                }
            })
        },

        // 打印方法
        printPrescription() {
            this.currentTime = getCurrentDay()
            this.$nextTick(() => {
                // this.countSum()
                // 是否ie
                if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    remove_ie_header_and_footer()
                }
                const Print = document.getElementById('printCheck')
                const newContent = Print.innerHTML
                var style = `
                    <style type='text/css'>
                        body{
                            padding:20px 10px;
                        }
                    </style>`
                const oldContent = document.body.innerHTML
                document.body.innerHTML = newContent + style

                window.print()
                window.location.reload()
                document.body.innerHTML = oldContent
                return false
            })
        }

    },

    mounted() {
        this.handleSearch()
    }
}
</script>
<style lang="scss" scoped>
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
.count {
  float: left;
  font-size: 14px;
  height: 47px;
  line-height: 50px;
  color: #606266;
  span {
    margin-left: 50px;
    display: inline-block;
    width: 180px;
  }
  .el-checkbox {
    margin-left: 50px;
  }
}
.checkInfo {
  width: calc(100% - 10px);
  border: 1px solid #409eff;
  height: auto;
  overflow: hidden;
  padding: 0 20px 20px;
  margin: auto;
  margin-bottom: 20px;
  span {
    display: block;
    float: left;
    margin-top: 20px;
    width: 25%;
    font-size: 14px;
  }
}
.footer {
  text-align: right;
  margin-top: 30px;
}
#printCheck {
  display: none;
}
</style>
