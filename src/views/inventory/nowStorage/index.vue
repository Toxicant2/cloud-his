<template>
    <el-row class="page-main now-stroage">
        <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','margin':'10px 0px'}" :forms="searchList" @handleSearch="handleFormSearch" />
        <el-row class="btn-grounp">
            <template v-if="!flagSetting">
                <el-button type="primary" icon="el-icon-download" @click="exportExcel()">导出</el-button>
                <el-button type="primary" icon="el-icon-setting" @click="settingStorage()">库存设置</el-button>
            </template>
            <template v-else>
                <el-button type="primary" @click="_updateSetting()">保存</el-button>
                <el-button type="primary" @click="back()">返回</el-button>
            </template>
        </el-row>
        <el-table-self v-if="hackReset" :current-page="pageIndex" :list-loading="listLoading" :cell-style="cellStyle" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" :show-summary="!flagSetting && pageIndex >= (total/pageSize)" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :span-method="objectSpanMethod" :get-summaries="summaryMethod" />
    </el-row>
</template>

<script>
import { nowStroage, updateSetting, exportNowStorage, nowSroageCount } from '@/api/pharmacy'
import { getOrgOpts } from '@/api/org'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { mapGetters } from 'vuex'
import { exportExcelCb } from '@/utils/exportExcel'
import paginationMixin from '@/components/TabComponents/mixin'
import { toFixed } from '@/utils/float'
export default {
    components: {
        directSearch,
        elTableSelf
    },
    mixins: [paginationMixin],
    data() {
        const shortcuts = []
        const arr = [7, 30, 90, 180, 360]
        arr.forEach(item => {
            let text = ''
            switch (item) {
                case 7:
                    text = '一周'
                    break
                case 30:
                    text = '一个月'
                    break
                case 90:
                    text = '三个月'
                    break
                case 180:
                    text = '半年'
                    break
                case 360:
                    text = '一年'
                    break
                default:
                    break
            }
            shortcuts.push({
                text,
                onClick(picker) {
                    const start = new Date()
                    start.setTime(start.getTime() + 3600 * 1000 * 24 * item)
                    picker.$emit('pick', start)
                }
            })
        })
        const orgList = []

        getOrgOpts({ type: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        orgList.push({
                            value: item.id,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            flagSetting: false,
            hackReset: true,
            listLoading: false,
            cacheForm: {
                orgIds: [3]
            },
            tabData: [],
            searchList: [
                {
                    type: 'select',
                    label: '',
                    prop: 'orgIds',
                    placeholder: '诊所',
                    labelWidth: '0',
                    opts: orgList,
                    isHidden: false,
                    multiple: true
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'catName',
                    placeholder: '商品名称',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                },
                {
                    type: 'select',
                    label: '类型',
                    prop: 'catType',
                    labelWidth: '65px',
                    placeholder: '类型',
                    opts: []
                },
                {
                    type: 'date',
                    label: '效期查询',
                    prop: 'earlyValue',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    options: {
                        shortcuts
                    }
                },
                {
                    type: 'checkbox',
                    label: '筛选',
                    prop: 'isFilter',
                    opts: [
                        {
                            value: '1',
                            label: '低库存预警',
                            lineSuffix: true,
                            style: {
                                backgroundColor: 'salmon'
                            }
                        },
                        {
                            value: '2',
                            label: '高库存预警',
                            lineSuffix: true,
                            style: {
                                backgroundColor: 'purple'
                            }
                        },
                        {
                            value: '3',
                            label: '效期预警',
                            lineSuffix: true,
                            style: {
                                backgroundColor: 'sandybrown'
                            }
                        },
                        {
                            value: '4',
                            label: '过期预警',
                            lineSuffix: true,
                            style: {
                                backgroundColor: 'red'
                            }
                        }
                    ]
                }
            ],
            tabColumns: [],
            // 当前库存
            normalTabColumns: [
                {
                    value: 'orgName',
                    label: '诊所',
                    isHidden: true
                },
                {
                    value: 'catCode',
                    label: '编号'
                },
                {
                    value: 'catName',
                    label: '名称'
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'isTinyName',
                    label: '是否拆零',
                    width: 100
                },
                {
                    value: 'manufacturerName',
                    label: '生产厂商',
                    width: 230
                },
                {
                    value: 'totalQtyStr',
                    label: '总库存'
                },
                {
                    value: 'batchNum',
                    label: '批号'
                },
                {
                    value: 'purchasePrice',
                    label: '进价',
                    width: 100
                },
                {
                    label: '总进价',
                    value: 'purchasePriceAmt'
                },
                {
                    value: 'retailPrice',
                    label: '零售价',
                    width: 100
                },
                {
                    label: '总零售价',
                    value: 'retailPriceAmt'
                },
                {
                    value: 'validDate',
                    label: '有效期'
                },
                {
                    value: 'qty',
                    label: '库存数'
                }
            ],
            // 设置库存
            settingTabColumns: [
                {
                    value: 'orgName',
                    label: '诊所',
                    isHidden: true
                },
                {
                    value: 'catCode',
                    label: '编号'
                },
                {
                    value: 'catName',
                    label: '名称'
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'isTinyName',
                    label: '是否拆零',
                    width: 100
                },
                {
                    value: 'manufacturerName',
                    label: '生产厂商',
                    width: 230
                },
                {
                    value: 'purchasePrice',
                    label: '进价',
                    width: 100
                },
                {
                    value: 'retailPrice',
                    label: '零售价',
                    width: 100
                },
                {
                    // value: 'qty',
                    value: 'totalQtyStr',
                    label: '库存数'
                },
                {
                    value: 'upperLimit',
                    label: '库存上限',
                    operType: 'input',
                    type: 'number',
                    width: 100,
                    min: 0,
                    showInput: true,
                    precision: 0,
                    func: this.handleUpperLimit
                },
                {
                    value: 'lowerLimit',
                    label: '库存下限',
                    operType: 'input',
                    type: 'number',
                    width: 100,
                    min: 0,
                    showInput: true,
                    precision: 0,
                    func: this.handleLowerLimit
                },
                {
                    value: 'termWarning',
                    label: '效期预警天数',
                    operType: 'input',
                    type: 'number',
                    width: 100,
                    min: 0,
                    showInput: true,
                    precision: 0
                }
            ],
            spanArr: [],
            spanArr1: [],
            onlyShowArr: [],
            summaryPurchasePrice: 0,
            summaryRetailPrice: 0
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    watch: {
        flagSetting: function (val) {
            this.searchList[2].hidden = this.searchList[3].hidden = val
            if (val) {
                this.tabColumns = this.settingTabColumns
            } else {
                this.tabColumns = this.normalTabColumns
                this.hackReset = false
                this.handleSearch(this.cacheForm)
                this.$nextTick(() => {
                    this.hackReset = true
                })
            }
        }
    },
    methods: {
        // 返回
        back() {
            delete this.cacheForm.flagSetting
            this.flagSetting = false
            this.pageIndex = 1
        },

        // 单元格样式
        cellStyle({ row, column, rowIndex, columnIndex }) {
            if (!this.flagSetting) {
                let index = 5
                if (this.$store.getters.clinic.isClinicCenter) {
                    index = 6
                }
                if (columnIndex <= index) {
                    // if (row.temp_qty < parseInt(row.lowerLimit)) {
                    //     return { backgroundColor: 'salmon', color: '#FFF' }
                    // }
                    // // 高库存
                    // if (
                    //     row.temp_qty > parseInt(row.upperLimit) &&
                    //   parseInt(row.upperLimit) !== 0
                    // ) {
                    //     return { backgroundColor: 'purple', color: '#FFF' }
                    // }
                    // 低库存
                    if (row.totalQty < parseInt(row.lowerLimit)) {
                        return { backgroundColor: 'salmon', color: '#FFF' }
                    }
                    // 高库存
                    if (row.totalQty > parseInt(row.upperLimit) && parseInt(row.upperLimit) !== 0) {
                        return { backgroundColor: 'purple', color: '#FFF' }
                    }
                } else {
                    // 效期
                    if (parseInt(row.termWarning) !== 0) {
                        const ms = 24 * 60 * 60 * 1000
                        if (
                            (new Date(row.validDate).getTime() - new Date().getTime()) / ms <
                            parseInt(row.termWarning) &&
                            (new Date(row.validDate).getTime() - new Date().getTime()) / ms > 0
                        ) {
                            return { backgroundColor: 'sandybrown', color: '#FFF' }
                        }
                    }
                    // 过期
                    if (new Date(row.validDate).getTime() - new Date().getTime() <= 0) {
                        return { backgroundColor: 'red', color: '#FFF' }
                    }
                }
            }
        },

        // 上限
        handleUpperLimit(row) {
            if (row.upperLimit < row.lowerLimit) {
                this.$message.warning('上限不得小于下限')
            }
        },

        // 下限
        handleLowerLimit(row) {
            if (row.lowerLimit > row.upperLimit) {
                this.$message.warning('上限不得小于下限')
            }
        },

        // 导出表格
        exportExcel() {
            const form = this.cacheForm
            const data = {}
            for (const key in form) {
                if (key === 'pageNo' || key === 'pageSize') {
                    continue
                }
                if (key === 'isFilter' && (!form[key] || form[key].length === 0)) {
                    data.isFilter = ''
                    continue
                }
                if (key === 'isFilter' && form[key] && form[key].length > 0) {
                    data.isFilter = form[key].join()
                    continue
                }
                if (key === 'orgIds') {
                    data.orgIds = form.orgIds.join(',')
                } else if (form[key]) {
                    data[key] = form[key]
                }
            }
            exportNowStorage(data, 'blob').then(res => {
                exportExcelCb(res, '当前库存.xlsx')
            })
        },

        // 库存设置
        settingStorage() {
            this.pageIndex = 1
            this.flagSetting = true
            this.handleSearch(this.cacheForm)
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            // 当前库存中只有运营中心才显示诊所
            if (this.$store.getters.clinic.isClinicCenter) {
                this.searchList[0].isHidden = false
                this.settingTabColumns[0].isHidden = false
                this.normalTabColumns[0].isHidden = false
            } else {
                this.searchList[0].isHidden = true
                this.settingTabColumns[0].isHidden = true
                this.normalTabColumns[0].isHidden = true
                delete this.cacheForm.orgIds
                if (form && form.orgIds) {
                    delete form.orgIds
                }
            }
            this.listLoading = true
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            this.$refs.form.initforms(params)
            const data = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize
            }
            if (this.flagSetting) {
                data.flagSetting = this.flagSetting // 后台判空操作
            }
            for (const key in params) {
                if (key === 'isFilter' && params[key] && params[key].length > 0) {
                    data.isFilter = params[key].join()
                    continue
                }
                if (key === 'orgIds') {
                    data.orgIds = params.orgIds.join(',')
                } else if (params[key]) {
                    data[key] = params[key]
                }
            }

            nowStroage(data).then(res => {
                if (res.STATUS === '1') {
                    const result = res.ITEMS.list
                    var count = 0
                    var count1 = 0
                    const that = this
                    this.spanArr = []
                    this.spanArr1 = []

                    // 诊所默认效期预警天数
                    const validityEarlyWarningDays =  this.commonUtil.getConfigValue('validityEarlyWarningDays')

                    this._.forEach(result, function (item, index) {
                        item.termWarning = item.termWarning || validityEarlyWarningDays

                        // item.temp_qty = item.qty
                        item.validDate = item.validDate ? item.validDate.split(' ')[0] : ''
                        item.isTinyName = item.isTiny === 1 ? '是' : '否'
                        item.purchasePrice = parseFloat(item.purchasePrice).toFixed(4)
                        item.retailPrice = parseFloat(item.retailPrice).toFixed(4)

                        if(item.isTiny === 1){
                            item.totalQtyStr = (item.superQty > 0?`${item.superQty}${item.specUnit}`:'') + (item.tinyQty > 0?`${item.tinyQty}${item.specUseUnit}`:'')

                            item.specUnit = item.isTinyBatch === 1?item.specUseUnit:item.specUnit
                        } else {
                            item.totalQtyStr = item.superQty + item.specUnit
                        }
                        item.qty = item.qty + item.specUnit
                        // if (item.isTiny === 1) {
                        //     item.purchasePrice = item.purchasePrice * item.coefficient
                        //     if (item.purchasePrice) {
                        //         item.purchasePrice = parseFloat(item.purchasePrice).toFixed(4)
                        //     } else {
                        //         item.purchasePrice = 0
                        //     }
                        //     item.retailPrice = (item.retailPrice * item.coefficient).toFixed(4)
                        //     item.qty1 =
                        //         parseInt(item.coefficient ? item.qty / item.coefficient : item.coefficient).toFixed(
                        //             0
                        //         ) + ''
                        //     var str1 = item.specUnit ? item.qty1 + item.specUnit : item.qty1
                        //     item.qty2 = item.coefficient ? parseInt(item.qty % item.coefficient) : item.qty
                        //     var str2 = ''
                        //     if (item.qty2 > 0) {
                        //         str2 = item.specUseUnit ? item.qty2 + item.specUseUnit : ''
                        //     } else {
                        //         str2 = ''
                        //     }
                        //     if (item.qty1 <= 0) {
                        //         str1 = ''
                        //     }
                        //     item.qty = str1 + str2
                        // } else {
                        //     const str1 = item.specUnit ? item.qty + item.specUnit : item.qty
                        //     item.purchasePrice = parseFloat(item.purchasePrice).toFixed(4)
                        //     item.qty = str1
                        // }
                        if (index === 0) {
                            that.spanArr.push(1)
                            count = 0

                            that.spanArr1.push(1)
                            count1 = 0
                        } else {
                            if (item.catCode === result[index - 1].catCode) {
                                that.spanArr[count] += 1
                                that.spanArr.push(0)
                            } else {
                                that.spanArr.push(1)
                                count = index
                            }
                            if (item.orgId === result[index - 1].orgId) {
                                that.spanArr1[count1] += 1
                                that.spanArr1.push(0)
                            } else {
                                that.spanArr1.push(1)
                                count1 = index
                            }
                        }
                    })
                    this.listLoading = false
                    this.tabData = result
                    this.total = res.ITEMS.totalRecord
                    if (this.pageIndex >= this.total / this.pageSize) {
                        nowSroageCount(data).then(res => {
                            if (res.STATUS === '1') {
                                this.summaryPurchasePrice = res.ITEMS.purchasePriceCount // 合计总进价
                                this.summaryRetailPrice = res.ITEMS.retailPriceCount // 合计总零售价
                            }
                        })
                    }
                }
            })
        },

        // 初始化表单选项
        initSelect() {
            const temp_arr = [].concat(this.dictData['515'], this.dictData['516'], this.dictData['519'])

            const arr = [{ value: '', label: '全部' }].concat(temp_arr)
            this.searchList[2].opts = arr
        },

        // 保存
        _updateSetting() {
            const that = this
            const data = []
            var flag = true
            this._.forEach(that.tabData, function (item) {
                data.push({
                    id: item.catId,
                    upperLimit: item.upperLimit,
                    lowerLimit: item.lowerLimit,
                    termWarning: item.termWarning
                })
                if (item.upperLimit < item.lowerLimit) {
                    that.$message.warning('上限不得小于下限')
                    flag = false
                }
            })
            if (flag) {
                updateSetting(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('保存成功!')
                        this.handleSearch(this.cacheForm)
                    }
                })
            }
        },

        // 合并列
        objectSpanMethod(param) {
            const { rowIndex, columnIndex } = param
            const _row = this.spanArr[rowIndex]
            const _col = _row > 0 ? 1 : 0
            let index = 6

            const _row1 = this.spanArr1[rowIndex]
            const _col1 = _row1 > 0 ? 1 : 0

            if (this.$store.getters.clinic.isClinicCenter) {
                index = 7
                if (columnIndex === 0) {
                    return {
                        rowspan: _row1,
                        colspan: _col1
                    }
                }
            }
            if (columnIndex < index) {
                return {
                    rowspan: _row,
                    colspan: _col
                }
            }
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
        }
    },
    mounted() {
        this.initSelect()
        this.handleSearch()
        this.tabColumns = this.normalTabColumns
    }
}
</script>

<style>
.now-stroage .el-form--inline .el-form-item {
    margin-right: 0 !important;
}
.btn-grounp {
    text-align: right;
    float: right;
    margin-bottom: 20px;
}
.el-table-self {
    clear: both;
}
</style>
