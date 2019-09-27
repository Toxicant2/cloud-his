<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <span class="title">
                {{title}}
                <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="$router.back(-1)">返回</el-button>
            </span>
            <div class='infos'>
                <el-row v-for="(itemDes,indexDes) in describeList" :key="indexDes">
                    <el-col v-for="(item,index) in itemDes" :span="6" :key="index">{{item.label}}：{{describeData[item.value]}}</el-col>
                </el-row>
            </div>
            <el-table-self :tab-type="'index'" :tab-label="'序号'" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :getSummaries="getSummaries" :show-summary="true" />
            <el-row class="bottom-button">
                <el-button type="primary" :loading="audeLoading" @click.native="handleAudit">审核</el-button>
            </el-row>
        </el-row>
    </el-row>
</template>

<script>
import { getStroageAute, getStroageDetail } from '@/api/pharmacy'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { getTabTotalRow } from '@/views/report/common/index.js'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'
import { mapGetters } from 'vuex'
import { formatDictMap } from '@/utils'
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
            title: '',
            describeData: {},
            describeList: [],
            getDescribeList: [
                [
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
                    }
                ],
                [
                    {
                        value: 'description',
                        label: '备注'
                    }, {
                        value: 'createTime',
                        label: '制单日期'
                    }, {
                        value: 'createUserName',
                        label: '制单人'
                    }]
            ],
            outDescribeList: [
                [
                    {
                        value: 'changeNum',
                        label: '入库单号'
                    }, {
                        value: 'changeTime',
                        label: '出货日期'
                    }, {
                        value: 'changeMode',
                        label: '出库方式'
                    }, {
                        value: 'deptName',
                        label: '领用科室'
                    }], [
                    {
                        value: 'userName',
                        label: '领用人员'
                    }, {
                        value: 'description',
                        label: '备注'
                    }, {
                        value: 'createTime',
                        label: '制单时间'
                    }, {
                        value: 'createUserName',
                        label: '制单人'
                    }]
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
                    width: '80px'
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
                    value: 'expiryDate',
                    label: '有效期',
                    format: 'yyyy-MM-dd',
                    width: '100px',
                    valueFormat: 'yyyy-MM-dd'
                }
            ],
            outTabColumns: [
                {
                    value: 'catName',
                    label: '商品名称',
                    width: 220
                }, {
                    value: 'manufacturerName',
                    label: '生产厂商'
                }, {
                    value: 'specUnit',
                    label: '出库单位',
                    width: 110
                }, {
                    value: 'storageNum',
                    label: '出库数量',
                    width: 150
                }, {
                    value: 'totalNum',
                    label: '库存数量',
                    width: 120
                }, {
                    value: 'purchasePrice',
                    label: '进价',
                    width: 110
                }, {
                    value: 'purchasePriceAmt',
                    label: '进价金额',
                    width: 110,
                    count: true
                }, {
                    value: 'retailPrice',
                    label: '零售价',
                    width: 110
                }, {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    width: 110,
                    count: true
                }, {
                    value: 'batch',
                    label: '批次',
                    width: 110
                }, {
                    value: 'expiryDate',
                    label: '有效期',
                    width: 110
                }
            ],
            audeLoading:false
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
        // 审核详情
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
                    this.describeData.changeMode = formatDictMap(this.dictData['141'], this.describeData.changeMode)
                    this.tabData = d.detail
                    this._.forEach(that.tabData, function (item) {
                        that._.forEach(that.dictData[148], function (item2) {
                            if (item.catType === item2.value) {
                                item.catTypeName = item2.label
                            }
                        })
                        // 出库数量
                        item.outStorageNum = item.storageNum
                        // 当前库存
                        item.nowStorageNum = item.totalNum
                        if (item.isTiny === 1) {
                            // 入库
                            // 下拉大单位
                            item.temp_sepcUnit = item.specUnit
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
                            // 零售金额
                            item.temp_priceAmt = that.saveNumber(item.temp_price, item.storageNum)
                            // 差价金额
                            // // 库存大单位
                            // const bigUnit = item.totalNum && item.coefficient ? `${parseInt(item.totalNum / item.coefficient)}${item.temp_sepcUnit || ''}` : ''

                            // // 库存小单位
                            // const smallUnit = item.totalNum && item.coefficient ? (item.totalNum % item.coefficient ? `${parseInt(item.totalNum % item.coefficient)}${item.specUseUnit || ''}` : '') : ''
                            // item.totalNum = bigUnit + smallUnit
                            item.totalNum = item.totalNum + item.specUnit

                            item.retailPriceAmt = item.retailPriceAmt
                            item.chajiajiner = that.saveNumber(item.retailPrice - item.purchasePrice, item.storageNum)
                        } else {
                            item.chajiajiner = that.saveNumber(item.retailPrice - item.purchasePrice, item.storageNum)
                            item.chukushuliang = that.saveChuNumber(item.retailPriceAmt, item.retailPrice)
                            item.totalNum += item.specUnit
                        }

                        item.expiryDate = item.expiryDate.split(' ')[0]
                    })
                }
            })
        },

        // 点击审核
        handleAudit(row) {
            var flagNum = true
            const data = { 'changeId': this.$route.params.id }
            for (let index = 0; index < this.tabData.length; index++) {
                if (this.$route.params.changeType === 'out') {
                    if (this.tabData[index].outStorageNum > this.tabData[index].nowStorageNum) {
                        this.$message.warning('出库数量不得大于库存数量！')
                        flagNum = false
                        break
                    }
                }
            }
            if (flagNum) {
                this.audeLoading = true
                const isUseInsurance = this.commonUtil.getConfigValue('isUseInsurance')
            let ipAddress = ''
            let databaseName = ''
                if(isUseInsurance === '1'){
                    if(this.commonUtil.getExplorer() !== 'ie'){
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

                getStroageAute(data).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if(!d || isUseInsurance !== '1') {
                            this.audeLoading = false
                            this.$message.success('审核成功')
                            this.$router.go(-1)
                            return false
                        }

                        this.execSql(databaseName,ipAddress,res)
                        this.audeLoading = false
                            this.$message.success('审核成功')
                            this.$router.go(-1)
                    }
                }).catch(() => {
                    this.audeLoading = false
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
        }
    },
    mounted() {
        this.flag = (this.$route.params.changeType === 'add')
        this.title = this.flag ? '审核入库' : '审核出库'
        // route.route.audeStroage = this.flag ? '审核入库' : '审核出库'
        this.describeList = this.flag ? this.getDescribeList : this.outDescribeList
        this.tabColumns = this.flag ? this.getTabColumns : this.outTabColumns
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
.total {
    border-top: 1px solid #e1e1e1;
    margin-top: 20px;
    padding-top: 20px;
    text-align: right;
    padding-right: 15px;
}
</style>
