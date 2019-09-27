<template>
  <el-row>
    <template v-if="isFirst">
      <direct-search ref="form" :label-position="'center'" :label-width="labelWidth?labelWidth:'100px'" :form-style="{'text-align':'left','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
      <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :total-count="totalCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :show-summary="isSearchInvoice && pageIndex >= (totalCount/pageSize)" :get-summaries="summaryMethod" />
    </template>
    <template v-else>
      <bill-detail @back="back" :billId="billId"></bill-detail>
    </template>
  </el-row>
</template>
<script>
import { getDictByIdList } from '@/api/catalog'
import {
  getStroageList,
  getOpSkDealerList,
  getStroageListByInvoice,
  getListByInvoice
} from '@/api/pharmacy'
import { defaultPickOpts, formatDictMap } from '@/utils'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import billDetail from './detail'
import { toFixed } from '@/utils/float'
export default {
  components: {
    directSearch,
    elTableSelf,
    billDetail
  },
  mixins: [paginationMixin],
  data() {
    const dictData = this.$store.getters.dictData
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
      dictData,
      listLoading: false,
      pageIndex: 1,
      searchList: [
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
        }
      ],
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
          width: 140,
          operType: 'button',
          operations: [
            {
              label: '修改发票号',
              func: this.editBillNumber,
              type: 'primary'
            }
          ]
        }
      ],
      tabData: [],
      totalCount: 0,
      labelWidth: '',
      cacheForm: {},
      dictMap,
      isFirst: true,
      billId: 0,
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
          formatter(row) {
            return row.expiryDate ? row.expiryDate.split(' ')[0] : ''
          }
        },
        {
          value: 'invoiceNumDetail',
          label: '发票号',
          width: '120px'
        }
      ],
      summaryPurchasePrice: 0,
      summaryRetailPrice: 0,
      isSearchInvoice: false
    }
  },
  computed: {
    tabColumns: function() {
      return this.isSearchInvoice ? this.tabInvoiceColumns : this.getTabColumns
    }
  },
  watch: {
    $route() {
      this.routerChange()
    }
  },
  methods: {
    routerChange() {
      this.handleSearch()
      this.pageIndex = 1
      // this.showIndex = this.$route.name === 'storage'
    },
    handleFormSearch(form) {
      this.pageIndex = 1
      this.handleSearch(form)
    },

    // 查询
    // handleSearch(form) {
    //     form = form || {}
    //     form.pageNo = this.pageIndex
    //     form.pageSize = this.pageSize
    //     this.$emit('handleSearch', form)

    // },

    handleSearch(form) {
      if (this.$route.name === 'storage') {
        this.cacheForm = this.cacheForm || form
        const params = Object.assign(this.cacheForm, form)
        // if (!form) {
          params.pageNo = this.pageIndex
          params.pageSize = this.pageSize
        // }
        params['changeType'] = 0
        if (this.showIndex && params.dealerName && form) {
          if (this.searchList[3].opts.filter(i => i.value === params.dealerName)[0]) {
            params.dealerName = this.searchList[3].opts.filter(
              i => i.value === params.dealerName
            )[0].label
          }
        }
        delete params.undefined
        if (params.invoiceNum) {
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
        } else {
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
        // getStroageList(params).then(res => {
        //     const d = res.ITEMS
        //     if (d && d.total > 0) {
        //         d.records.forEach(item => {
        //             item.changeMode = formatDictMap(this.dictMap[141], item.changeMode)
        //         })
        //     }
        //     this.totalCount = d.total
        //     this.tabData = d.records || []
        // })
      }
    },

    handleSuccessInvoice(d) {
      if (d && d.total > 0) {
        d.records.forEach(item => {
          item.catTypeName = formatDictMap(this.dictData[148], item.catType)
          if (item.isTiny === 1) {
            if (item.isTinyChange === 1) {
              item.specUnit = item.specUseUnit
              // 零售价
              item.temp_price = item.retailPrice
            } else {
              // 数量
              item.storageNum = toFixed(item.storageNum / item.coefficient, 2)
              // 进价
              item.purchasePrice = toFixed(item.purchasePrice * item.coefficient, 4)
              // 零售价
              item.temp_price = toFixed(item.retailPrice * item.coefficient, 4)
            }
            item.temp_priceAmt = toFixed(item.temp_price * item.storageNum, 2)
            // 差价金额
            item.chajiajiner = toFixed((item.temp_price - item.purchasePrice) * item.storageNum)
          } else {
            item.temp_price = item.retailPrice
            item.temp_priceAmt = toFixed(item.temp_price * item.storageNum)
            item.chajiajiner = toFixed((item.retailPrice - item.purchasePrice) * item.storageNum)
          }
        })
      }

      this.isSearchInvoice = true
    },

    // 合计行
        summaryMethod(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                const values = data.map(item => Number(item[column.property]))
                if (index === 8) {
                    sums[index] = toFixed(this.summaryPurchasePrice, 4)
                } else if (index === 10) {
                    sums[index] = toFixed(this.summaryRetailPrice, 4)
                } else {
                    sums[index] = ''
                }
            })

            return sums
        },

    editBillNumber(row) {
      this.billId = row.id
      this.isFirst = false
    },

    back() {
      this.isFirst = true
      this.handleFormSearch()
    }
  },
  mounted() {
    this.handleFormSearch()
  }
}
</script>
