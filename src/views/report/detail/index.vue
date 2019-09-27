<template>
    <el-row class="page-main">
        <div class="header">
            <span>{{title}}</span>
            <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
        </div>
        <el-row class="master">
            <el-col v-for="(item,index) in describeList" :key="index" :span="6">{{item.label}}：{{describeData[item.value]}}</el-col>
        </el-row>
        <el-table-self :getSummaries="getSummaries" :tab-type="'index'" :tab-label="'序号'" :show-summary="true" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns"/>
        <el-row class="footer">
            <el-button type="primary" @click="handleExportExcel">导出</el-button>
            <el-button type="primary" @click="handlePrint">打印</el-button>
        </el-row>

        <!-- 打印 -->
        <div id="print">
            <div class="storage">
                <!-- 标题 -->
                <h1>{{this.tabData[0]?this.tabData[0].orgName:''}}{{printTitle}}</h1>
                <!-- 表单部分 -->
                <ul class="clearfix">
                    <li v-for="(item,index) in printDescribeList" :key="index">{{item.label}}：{{describeData[item.value]}}</li>
                </ul>
                <!-- 表格部分 -->
                <table border="1" cellspacing="0" align="center">
                    <tr>
                        <th v-for="(item,index) in tabColumns" :key="index">{{ item.label }}</th>
                    </tr>
                    <template v-if="tabData.length > 0">
                        <tr v-for="(item,index) in tabData" :key="index">
                            <td v-for="(itemContent,indexContent) in tabColumns" :key="indexContent">
                            {{ itemContent.value === 'expiryDate'? item[itemContent.value].split(' ')[0]:item[itemContent.value] }}
                            </td>
                        </tr>
                        <tr>
                            <td v-for="(item,index) in tabColumns" :key="index">{{total[index]}}</td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td :colspan="tabColumns.length">暂无数据</td>
                    </tr>
                </table>
            </div>
        </div>
    </el-row>
</template>

<script>
import { getStroageDetail, exportStorageIn, exportStorageOut } from '@/api/pharmacy'

import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'

import { getTotalRow, getTabTotalRow } from '../common/index.js'

import { exportExcelCb } from '@/utils/exportExcel'
import { toFixed } from '@/utils/float'
import { formatDictMap } from '@/utils'
import {
    remove_ie_header_and_footer
} from '@/utils/print'

import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm
    },
    mixins: [paginationMixin],
    data() {
        return {
            listLoading: false,
            title: '',
            printTitle: '',
            describeData: {},
            describeList: [],
            printDescribeList: [],
            printOutDescribeList: [
                {
                    value: 'changeTime',
                    label: '出库日期'
                }, {
                    value: 'changeMode',
                    label: '出库方式'
                }, {
                    value: 'dealerName',
                    label: '供应商'
                }, {
                    value: 'deptName',
                    label: '领用科室'
                }, {
                    value: 'totalPrice',
                    label: '出库总金额'
                }, {
                    value: 'createUserName',
                    label: '制单人'
                }, {
                    value: 'checkedUserName',
                    label: '确认人员'
                }, {
                    value: 'description',
                    label: '备注'
                }
            ],
            getDescribeList: [
                {
                    value: 'changeNum',
                    label: '入库单号'
                }, {
                    value: 'changeTime',
                    label: '入库日期'
                }, {
                    value: 'changeMode',
                    label: '入库方式'
                }, {
                    value: 'dealerName',
                    label: '供应商'
                }, {
                    value: 'checkedUserName',
                    label: '审核人员'
                }, {
                    value: 'createTime',
                    label: '制单日期'
                }, {
                    value: 'createUserName',
                    label: '制单人'
                }, {
                    value: 'checkedTime',
                    label: '审核日期'
                }, {
                    value: 'description',
                    label: '备注'
                }
            ],
            printGetDescribeList: [
                {
                    value: 'changeTime',
                    label: '入库日期'
                }, {
                    value: 'changeMode',
                    label: '入库方式'
                }, {
                    value: 'dealerName',
                    label: '供应商'
                }, {
                    value: 'totalPrice',
                    label: '入库金额'
                }, {
                    value: 'createUserName',
                    label: '制单人'
                }, {
                    value: 'checkedUserName',
                    label: '审核人员'
                }, {
                    value: 'description',
                    label: '备注'
                }
            ],
            outDescribeList: [
                {
                    value: 'changeNum',
                    label: '出库单号'
                }, {
                    value: 'changeTime',
                    label: '出货日期'
                }, {
                    value: 'changeMode',
                    label: '出库方式'
                }, {
                    value: 'deptName',
                    label: '领用科室'
                }, {
                    value: 'userName',
                    label: '领用人员'
                }, {
                    value: 'description',
                    label: '备注'
                }, {
                    value: 'createTime',
                    label: '制单日期'
                }, {
                    value: 'createUserName',
                    label: '制单人'
                }, {
                    value: 'checkedTime',
                    label: '审核日期'
                }, {
                    value: 'checkedUserName',
                    label: '审核人员'
                }
            ],
            tabData: [],
            tabColumns: [],
            getTabColumns: [
                {
                    value: 'catName',
                    label: '药品名称',
                    width: '200px'
                }, {
                    value: 'catTypeName',
                    label: '类别',
                    width: '200px'
                }, {
                    value: 'specUnit',
                    label: '单位',
                    width: '100px'
                }, {
                    value: 'manufacturerName',
                    label: '生产厂商',
                    width: 230
                }, {
                    value: 'storageNum',
                    label: '数量'
                }, {
                    value: 'purchasePrice',
                    label: '进价'
                }, {
                    value: 'purchasePriceAmt',
                    label: '进价金额',
                    count: true
                }, {
                    value: 'retailPrice',
                    label: '零售价'
                }, {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    count: true
                }, {
                    value: 'difAmount',
                    label: '差价金额',
                    count: true
                }, {
                    value: 'batch',
                    label: '批号'
                }, {
                    label: '有效期',
                    value: 'expiryDate',
                    placeholder: '有效期',
                    minWidth: '100px',
                    formatter(row) {
                        return row.expiryDate ? row.expiryDate.split(' ')[0] : ''
                    }
                }
            ],
            outTabColumns: [
                {
                    value: 'catName',
                    label: '药品名称',
                    width: 220
                }, {
                    value: 'catTypeName',
                    label: '类别',
                    width: 220
                }, {
                    value: 'manufacturerName',
                    label: '生产厂商'
                }, {
                    value: 'specUnit',
                    label: '出库单位',
                    width: 110
                }, {
                    value: 'purchasePrice',
                    label: '进价',
                    width: 110
                }, {
                    value: 'retailPrice',
                    label: '零售价',
                    width: 110
                }, {
                    value: 'batch',
                    label: '批次',
                    width: 130
                }, {
                    label: '有效期',
                    value: 'expiryDate',
                    width: 110,
                    formatter(row) {
                        return row.expiryDate ? row.expiryDate.split(' ')[0] : ''
                    }
                },
                // {
                //     value: 'totalNum',
                //     label: '库存数量',
                //     width: 110
                // },
                {
                    value: 'storageNum',
                    label: '出库数量',
                    width: 150
                }, {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    width: 110,
                    count: true
                }, {
                    value: 'difAmount',
                    label: '差价金额',
                    width: 110,
                    count: true
                }
            ],
            total: {}
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    methods: {
        // 返回
        back() {
            this.$router.push({ name: 'report' })
        },

        // 查询详情
        getDetail() {
            const id = this.$route.params.id
            const orgId = this.$route.params.orgId
            const isQty = this.$route.params.changeType === 'add' ? 0 : 1
            const data = { isQty, orgId }
            getStroageDetail(id, data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const dictMap = this.dictData

                    this.describeData = d.master
                    this.describeData.changeMode = formatDictMap(dictMap[141], this.describeData.changeMode)

                    let priceAmt = 0

                    if (d.detail.length > 0) {
                        d.detail.forEach(item => {
                            item.catTypeName = formatDictMap(dictMap[148], item.catType)
                            if (item.isTiny === 1) {
                                // // 库存大单位
                                // const bigUnit = item.totalNum && item.coefficient ? `${parseInt(item.totalNum / item.coefficient)}${item.specUnit || ''}` : ''
                                // // 库存小单位
                                // const smallUnit = item.totalNum && item.coefficient ? (item.totalNum % item.coefficient ? `${parseInt(item.totalNum % item.coefficient)}${item.specUseUnit || ''}` : '') : ''
                                // // 库存数量
                                // item.totalNum = bigUnit + smallUnit

                                // 差价金额
                                item.difAmount = toFixed((item.retailPrice - item.purchasePrice) * item.storageNum) || 0
                                if (item.isTinyChange === 1) {
                                    item.specUnit = item.specUseUnit
                                } else {
                                    // 数量
                                    item.storageNum = item.coefficient ? toFixed(item.storageNum / item.coefficient) : 0
                                    // 进价
                                    item.purchasePrice = toFixed(item.purchasePrice * item.coefficient, 4)
                                    // 零售价
                                    item.retailPrice = toFixed(item.retailPrice * item.coefficient, 4)
                                }
                            } else {
                                // 差价金额
                                item.difAmount = toFixed(item.retailPriceAmt - item.purchasePriceAmt)
                            }
                            priceAmt += Number(item.retailPriceAmt)
                        })
                    }
                    this.describeData.totalPrice = toFixed(priceAmt)
                    this.tabData = d.detail
                    this.total = getTotalRow(this.tabColumns, this.tabData)
                }
            })
        },

        // 合计行
        getSummaries(param) {
            return getTabTotalRow(param, this.tabColumns, 1)
        },

        // 导出
        handleExportExcel() {
            const id = this.$route.params.id
            const type = this.$route.params.changeType
            if (type === 'add') {
                exportStorageIn({ id }, 'blob').then(res => {
                    exportExcelCb(res, '入库详情.xlsx')
                })
            } else {
                exportStorageOut({ id }, 'blob').then(res => {
                    exportExcelCb(res, '出库详情.xlsx')
                })
            }
        },

        // 打印方法
        handlePrint() {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const Print = document.getElementById('print')
            const newContent = Print.innerHTML
            var style = `
                    <style type='text/css'>
                        body{
                            width:108% !important;
                        }
                    </style>`
            const oldContent = document.body.innerHTML
            document.body.innerHTML = newContent + style

            window.print()
            window.location.reload()
            document.body.innerHTML = oldContent
            return false
        }
    },
    mounted() {
        const flag = this.$route.params.changeType === 'add'
        this.title = flag ? '入库详情' : '出库详情'
        this.printTitle = flag ? '入库单' : '出库单'

        this.describeList = flag ? this.getDescribeList : this.outDescribeList
        this.printDescribeList = flag ? this.printGetDescribeList : this.printOutDescribeList
        this.tabColumns = flag ? this.getTabColumns : this.outTabColumns
        this.dictData['148'] = [].concat(
            this.dictData['515'],
            this.dictData['516'],
            this.dictData['517'],
            this.dictData['518'],
            this.dictData['519'],
            this.dictData['520']
        )
        this.getDetail()
    }
}
</script>

<style lang="scss" scoped>
.header {
    height: 50px;
    line-height: 50px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e1e1e1;
    font-size: 18px;
    font-weight: bold;
    .el-button{
        float: right;
        margin-top: 9px;
    }
}
.master {
    font-size: 14px;
    border: 1px solid #0099fb;
    margin: 20px 0;
    padding: 10px 20px;
    div{
        line-height: 28px;
    }
}

.footer{
    text-align: right;
    margin-top: 10px;
}

</style>
