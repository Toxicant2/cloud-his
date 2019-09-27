<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <span class="title"> {{title}}
                <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="$router.back(-1)">返回</el-button>
            </span>
            <div class='infos' id="infos">
                <el-row v-for="(itemDes,indexDes) in describeList" :key="indexDes">
                    <el-col v-for="(item,index) in itemDes" :span="6" :key="index">{{item.label}}：{{describeData[item.value]}}</el-col>
                </el-row>
            </div>
            <el-table-self :tab-type="'index'" :tab-label="'序号'" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :getSummaries="getSummaries" :show-summary="true" />
            <el-row class="bottom-button">
                <el-button type="primary" @click.native="printPrescription">打印</el-button>
                <el-button type="primary" @click.native="handleCancleAudit" v-if="$route.params.flag">取消审核</el-button>
            </el-row>

            <!-- 打印 -->
            <div id="printStorage">
                <div class="printStorage">
                    <!-- 标题 -->
                    <div class="first-title">
                        <h1>
                            {{this.tabData[0]?this.tabData[0].orgName:''}}{{printTitle}}
                        </h1>
                    </div>
                    <!-- 表单部分 -->
                    <div class="second-form">
                        <ul v-for="(itemDes,indexDes) in printDescribeList" :key="indexDes">
                            <li v-for="(item,index) in itemDes" :span="6" :key="index">{{item.label}}：{{describeData[item.value]}}</li>
                        </ul>
                    </div>
                    <!-- 表格部分 -->
                    <div class="third-table">
                        <table border="1" cellspacing="0" align="center" style="table-layout:fixed;width:100%">
                            <tr>
                                <th v-for="(item,index) in tabColumns" :key="index">{{ item.label }}</th>
                            </tr>
                            <tr v-for="(item,index) in tabData" :key="index">
                                <td v-for="(itemContent,indexContent) in tabColumns" :key="indexContent">
                                    {{ itemContent.value === 'expiryDate'? item[itemContent.value].split(' ')[0]:item[itemContent.value] }}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </el-row>
    </el-row>
</template>

<script>
import { getStroageDetail, cancleAudit } from '@/api/pharmacy'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'

import { getTabTotalRow } from '@/views/report/common/index.js'
import { mapGetters } from 'vuex'
import { remove_ie_header_and_footer } from '@/utils/print'
import { param, formatDictMap } from '@/utils'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm
    },
    mixins: [paginationMixin],
    data() {
        return {
            flag: false,
            totalPrice: 0.0,
            title: '',
            printTitle: '',
            describeData: {},
            describeList: [],
            printDescribeList: [],
            printOutDescribeList: [
                [
                    {
                        value: 'changeTime',
                        label: '出库日期'
                    },
                    {
                        value: 'changeMode',
                        label: '出库方式'
                    },
                    {
                        value: 'dealerName',
                        label: '供应商'
                    }
                ],
                [
                    {
                        value: 'deptName',
                        label: '领用科室'
                    },
                    {
                        value: 'totalPrice',
                        label: '出库总金额'
                    },
                    {
                        value: 'createUserName',
                        label: '制单人'
                    }
                ],
                [
                    {
                        value: 'checkedUserName',
                        label: '确认人员'
                    },
                    {
                        value: 'description',
                        label: '备注'
                    }
                ]
            ],
            getDescribeList: [
                [
                    {
                        value: 'changeNum',
                        label: '入库单号'
                    },
                    {
                        value: 'changeTime',
                        label: '入库日期'
                    },
                    {
                        value: 'changeMode',
                        label: '入库方式'
                    },
                    {
                        value: 'dealerName',
                        label: '供应商'
                    }
                ],
                [
                    {
                        value: 'checkedUserName',
                        label: '审核人员'
                    },

                    {
                        value: 'createTime',
                        label: '制单日期'
                    },
                    {
                        value: 'createUserName',
                        label: '制单人'
                    },
                    {
                        value: 'checkedTime',
                        label: '审核日期'
                    }
                ],
                [
                    {
                        value: 'description',
                        label: '备注'
                    }
                ]
            ],
            printGetDescribeList: [
                [
                    {
                        value: 'changeTime',
                        label: '入库日期'
                    },
                    {
                        value: 'changeMode',
                        label: '入库方式'
                    },
                    {
                        value: 'dealerName',
                        label: '供应商'
                    }
                ],
                [
                    {
                        value: 'totalPrice',
                        label: '入库金额'
                    },
                    {
                        value: 'createUserName',
                        label: '制单人'
                    },
                    {
                        value: 'checkedUserName',
                        label: '审核人员'
                    }
                ],
                [
                    {
                        value: 'description',
                        label: '备注'
                    }
                ]
            ],
            outDescribeList: [
                [
                    {
                        value: 'changeNum',
                        label: '出库单号'
                    },
                    {
                        value: 'changeTime',
                        label: '出货日期'
                    },
                    {
                        value: 'changeMode',
                        label: '出库方式'
                    },
                    {
                        value: 'deptName',
                        label: '领用科室'
                    }
                ],
                [
                    {
                        value: 'userName',
                        label: '领用人员'
                    },
                    {
                        value: 'description',
                        label: '备注'
                    },
                    {
                        value: 'createTime',
                        label: '制单日期'
                    },
                    {
                        value: 'createUserName',
                        label: '制单人'
                    }
                ],
                [
                    {
                        value: 'checkedTime',
                        label: '审核日期'
                    },
                    {
                        value: 'checkedUserName',
                        label: '审核人员'
                    }
                ]
            ],
            value: '',
            listLoading: false,
            tabData: [],
            tabColumns: [],
            getTabColumns: [
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
                    width: '100px'
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
                    label: '进价金额',
                    count: true
                },
                {
                    value: 'retailPrice',
                    label: '零售价'
                },
                {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    count: true
                },
                {
                    value: 'chajiajiner',
                    label: '差价金额',
                    count: true
                },
                {
                    value: 'batch',
                    label: '批号'
                },
                {
                    label: '有效期',
                    value: 'expiryDate',
                    placeholder: '有效期',
                    minWidth: '100px',
                    formatter(row) {
                        return row.expiryDate ? row.expiryDate.split(' ')[0] : ''
                    }
                }, {
                    label: '发票号',
                    value: 'invoiceNumDetail',
                    width: '120px'
                }
            ],
            outTabColumns: [
                {
                    value: 'catName',
                    label: '商品名称',
                    width: 220
                },
                {
                    value: 'catTypeName',
                    label: '药品名称',
                    width: 220
                },
                {
                    value: 'manufacturerName',
                    label: '生产厂商'
                },
                {
                    value: 'specUnit',
                    label: '出库单位',
                    width: 110
                },
                {
                    value: 'storageNum',
                    label: '出库数量',
                    width: 150
                },
                {
                    value: 'purchasePrice',
                    label: '进价',
                    width: 110
                },
                {
                    value: 'purchasePriceAmt',
                    label: '进价金额',
                    width: 110,
                    count: true
                },
                {
                    value: 'retailPrice',
                    label: '零售价',
                    width: 110
                },
                {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    width: 110,
                    count: true
                },
                {
                    value: 'chajiajiner',
                    label: '差价金额',
                    width: 110,
                    count: true
                },
                {
                    value: 'batch',
                    label: '批次',
                    width: 110
                },
                {
                    label: '有效期',
                    value: 'expiryDate',
                    width: 110,
                    formatter(row) {
                        return row.expiryDate ? row.expiryDate.split(' ')[0] : ''
                    }
                }
            ]
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    methods: {
        // 合计
        getSummaries(param) {
            return getTabTotalRow(param, this.tabColumns, 1)
        },

        // 保留几位小数
        saveNumber(val1, val2, num = 2) {
            return parseFloat(val1 * val2).toFixed(num)
        },

        saveChuNumber(val1, val2, num = 2) {
            return parseFloat(val1 / val2).toFixed(num)
        },

        // 打印方法
        printPrescription() {
            // this.countSum()
            // 是否ie
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const Print = document.getElementById('printStorage')
            const newContent = Print.innerHTML
            var style = `
                    <style type='text/css'>
                        body{
                            width:180% !important;
                            padding-top:20px;
                        }
                    </style>`
            const oldContent = document.body.innerHTML
            document.body.innerHTML = newContent + style

            window.print()
            window.location.reload()
            document.body.innerHTML = oldContent
            return false
        },

        // 查询详情
        handleSearch(form) {
            const id = this.$route.params.id
            const isQty = this.$route.params.changeType === 'add' ? 0 : 1
            const data = {
                isQty
            }
            getStroageDetail(id, data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.describeData = d.master

                    const that = this
                    this.describeData.changeMode = formatDictMap(
                        this.dictData['141'],
                        this.describeData.changeMode
                    )
                    this.tabData = d.detail
                    this._.forEach(that.tabData, function (item) {
                        //             item.storageNum =
                        //   that.describeData.changeMode === '调整出库' ? -item.storageNum : item.storageNum
                        //             item.purchasePriceAmt =
                        //   that.describeData.changeMode === '调整出库'
                        //       ? -item.purchasePriceAmt
                        //       : item.purchasePriceAmt
                        //             item.retailPriceAmt =
                        //   that.describeData.changeMode === '调整出库'
                        //       ? -item.retailPriceAmt
                        //       : item.retailPriceAmt

                        that._.forEach(that.dictData['148'], function (item2) {
                            if (item.catType === item2.value) {
                                item.catTypeName = item2.label
                            }
                        })

                        if (item.isTiny === 1) {
                            // 入库
                            // 下拉大单位
                            item.temp_sepcUnit = item.specUnit
                            item.qty1 =
                                parseInt(
                                    item.coefficient ? item.totalNum / item.coefficient : item.coefficient
                                ).toFixed(0) + ''

                            const str1 = item.specUnit ? item.qty1 + item.specUnit : item.qty1

                            item.qty2 = item.coefficient ? parseInt(item.totalNum % item.coefficient) : item.qty
                            let str2 = ''
                            if (item.qty2 > 0) {
                                str2 = item.specUseUnit ? item.qty2 + item.specUseUnit : ''
                            } else {
                                str2 = ''
                            }
                            item.totalNum = str1 + str2
                            if (item.isTinyChange === 1) {
                                item.specUnit = item.specUseUnit
                                // 零售价
                            } else {
                                // 数量
                                // item.storageNum = that.saveChuNumber(item.storageNum, item.coefficient, 2)
                                // 进价
                                // item.purchasePrice = that.saveNumber(item.purchasePrice, item.coefficient, 4)
                                // 零售价
                                // item.retailPrice = that.saveNumber(item.retailPrice, item.coefficient, 4)
                            }
                            // 进价
                            // item.purchasePrice = that.saveChuNumber(item.purchasePriceAmt, item.storageNum, 4)
                            // item.purchasePriceAmt
                            // 零售价
                            // 零售金额
                            item.temp_priceAmt = that.saveNumber(item.temp_price, item.storageNum)
                            // 差价金额
                            // item.retailPriceAmt = item.retailPriceAmt
                            item.chajiajiner = that.saveNumber(
                                item.retailPrice - item.purchasePrice,
                                item.storageNum
                            )
                            item.chajiajiner = item.chajiajiner ? item.chajiajiner : 0
                        } else {
                            item.temp_sepcUnit = item.specUnit
                            item.totalNum = item.totalNum + item.specUnit
                            item.chajiajiner = (item.retailPriceAmt - item.purchasePriceAmt).toFixed(2)
                        }

                        that.totalPrice += parseFloat(item.purchasePriceAmt)
                    })
                    that.totalPrice = that.totalPrice.toFixed(2)
                    that.describeData.totalPrice = that.totalPrice
                }
            })
        },

        // 取消审核
        handleCancleAudit() {
            if (!this.describeData.isRevoke) {
                this.$message.warning('已存在库存变动，不可撤销！')
            } else {
                const isUseInsurance = this.commonUtil.getConfigValue('isUseInsurance')
                let ipAddress = ''
                let databaseName = ''
                if(isUseInsurance === '1'){
                    if(this.commonUtil.getExplorer() !== 'ie'){
                        this.$message.warning('请使用IE浏览器进行医保诊所审核')
                        return false
                    } else {
                        ipAddress = this.commonUtil.getConfigValue('ipDispose')
                        databaseName = this.commonUtil.getConfigValue('databaseName')
                        const clinicId = this.$store.getters.clinic.thirdPartyClinicId
                        if (!ipAddress || !clinicId || !databaseName) {
                            this.$message.warning('该诊所未进行相关金舵手服务配置，请联系管理员！')
                            return false
                        }
                    }
                }
                const data = { id: this.$route.params.id }
                cancleAudit(data).then(res => {
                    if (res.STATUS == '1') {
                        const d = res.ITEMS
                        if(!d || isUseInsurance !== '1') {
                            this.$message.success('取消审核成功！')
                            this.$router.push({
                                name: 'storage'
                            })
                            return false
                        }
                        this.execSql(databaseName,ipAddress,res)
                        this.$message.success('取消审核成功！')
                        this.$router.push({
                            name: 'storage'
                        })
                    }
                })
            }
        },

        // 出入库审核执行sql
        execSql(databaseName,ipAddress,res) {
            // console.log(databaseName,ipAddress,res)
            if (!!window.ActiveXObject || 'ActiveXObject' in window){
                //创建数据库连接对象
                const conn = new ActiveXObject('ADODB.Connection')
                //Server ip服务：需要配置
                //Data Source数据库服务:需要配置
                const connectionstring = `Provider=SQLOLEDB;Persist Security Info=False;Initial Catalog=${databaseName};Data Source=${ipAddress};User ID=H2O;Password=123456`
                //打开连接
                conn.open(connectionstring)
                try {
                    console.log(res.ITEMS)
                    conn.Execute(res.ITEMS)
                } catch (e) {
                    console.log(e)
                }
                conn.Close()
            }
        },

        // 点击审核
        handleAudit(row) {
            this.auditEdit = {
                code: row.code,
                realName: row.realName,
                userId: row.id,
                checkedNote: row.checkNote ? row.checkNote : '',
                org: param({
                    orgId: row.orgId,
                    orgName: row.orgName,
                    areaCode: row.areaCode
                })
            }
            this.$refs.audit.open()
        },

        // 修改启用状态
        handleAuditDetele(row) { }
    },
    mounted() {
        this.flag = this.$route.params.changeType === 'add'
        this.title = this.flag ? '入库详情' : '出库详情'
        this.describeList = this.flag ? this.getDescribeList : this.outDescribeList
        this.printDescribeList = this.flag ? this.printGetDescribeList : this.printOutDescribeList
        this.tabColumns = this.flag ? this.getTabColumns : this.outTabColumns
        this.printTitle = this.flag ? '入库单' : '出库单'
        this.dictData['148'] = [].concat(
            this.dictData['515'],
            this.dictData['516'],
            this.dictData['517'],
            this.dictData['518'],
            this.dictData['519'],
            this.dictData['520']
        )
        this.handleSearch()
    }
}
</script>

<style scoped>
.infos {
    padding: 0 20px;
    font-size: 14px;
    padding-bottom: 20px;
    border: 1px solid #0099fb;
    margin: 20px 0;
}
.infos .el-row {
    margin-top: 20px;
}
.total {
    border-top: 1px solid #e1e1e1;
    margin-top: 20px;
    padding-top: 20px;
    text-align: right;
    padding-right: 15px;
}
.title {
    font-size: 18px;
    font-weight: bold;
    height: 50px;
    border-bottom: 1px solid #e1e1e1;
    display: block;
    margin-bottom: 20px;
    line-height: 50px;
}
.bottom-button {
    padding-bottom: 20px;
    margin-top: 20px;
    border-top: 1px solid #e1e1e1;
}
.total-count {
    height: 40px;
    margin: 20px 0;
}
.bottom-button button {
    float: right;
    margin-left: 10px;
}
.bottom-button button.el-button.el-button--primary.el-button--small {
    margin-top: 20px;
}
#printStorage {
    display: none;
}
</style>

<style>
.printStorage {
    width: 150%;
    margin-left: -50%;
    font-size: 12px;
}
.printStorage .first-title {
    font-size: 16px;
    margin: 10px auto;
    text-align: center;
}
.printStorage .second-form {
    width: 35%;
    font-size: 12px;
    height: 60px;
    margin: 2px 34%;
}
.printStorage ul li {
    float: left;
    margin: 2px 0;
    width: 26%;
}
.printStorage .third-table {
    width: 30%;
    margin: 10px 30%;
}
.printStorage table {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
}
.printStorage table td,
.printStorage table th {
    text-align: center;
    padding: 5px;
    word-break: break-all;
}
</style>
