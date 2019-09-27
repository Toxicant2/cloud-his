<template>
    <el-row class="page-main">
        <div class="addStorage">
            <span class="title">
                {{ title }}
                <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="$router.back(-1)">返回</el-button>
            </span>
            <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleSearch" />
            <el-table-self :tab-type="'index'" :tab-label="'序号'" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :get-summaries="getSummaries" :show-summary="true" @project="getProject" @changeSelect="changeSelect" />
            <span class="select-item">
                <el-popover v-model="popoverVisible" popper-class="popper-class">
                    <el-table-self style="height:300px;overflow:auto;" :list-loading="listLoading" :table-data="selectTabData" :columns="selectTabColumns" @rowClick="clickRow" />
                    <el-input slot="reference" v-model="searchValue" placeholder="请输入新增的药品名称">
                        <i slot="suffix" :class="['el-input__icon',popoverVisible ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" />
                    </el-input>
                </el-popover>
            </span>
            <div class="bottom-button">
                <el-button type="primary" @click.native="$router.back(-1)">取消</el-button>
                <el-button type="primary" :loading="audeLoading" @click.native="save('true')">保存并审核</el-button>
                <el-button type="primary" :loading="saveLoading" @click.native="save()">保存</el-button>
            </div>
        </div>
    </el-row>
</template>

<script>
import {
    getSelectData,
    getStroageDetail,
    outSelectData,
    saveAndAute,
    saveOutAndAute,
    saveGetStroage,
    saveOutStroage,
    getOpSkDealerList
} from '@/api/pharmacy'
// import complexTab from '@/components/TabComponents/complex'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { getCurrentDay } from '@/utils/common'
import { getTabTotalRow } from '@/views/report/common/index.js'
import paginationMixin from '@/components/TabComponents/mixin'
import { getDepartmentOpts, getOrgClinicStaffList } from '@/api/org'
// import route from '@/lang/zh'
import { param, param2Obj, disabledPickerOptsAfter } from '@/utils'
import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        elTableSelf
        // complexTab
    },
    mixins: [paginationMixin],
    data() {
        // 医师
        const doctorList = []
        getOrgClinicStaffList({
            pageNo: 1,
            pageSize: 100,
            userType: 1,
            isUse: 1
        }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.totalRecord > 0) {
                    this._.forEach(d.list, function(item) {
                        doctorList.push({
                            value: param({
                                userId: item.userId,
                                userName: item.userRealName
                            }),
                            label: item.userRealName
                        })
                    })
                }
            }
        })
        return {
            temp_departmentList: [],
            flag: false,
            title: '',
            temp_isTiny: [],
            searchValue: '',
            popoverVisible: false,
            options: [],
            listLoading: false,
            tabData: [],
            selectTabData: [],
            searchList: [],
            getSearchList: [
                {
                    type: 'date',
                    labelSpecial: '*',
                    label: '入库时间',
                    prop: 'changeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    labelSpecial: '*',
                    label: '入库方式',
                    prop: 'changeMode',
                    placeholder: '请选择',
                    opts: []
                },
                {
                    type: 'select',
                    labelSpecial: '*',
                    label: '供应商',
                    hidden: true,
                    prop: 'dealerName',
                    placeholder: '请选择',
                    opts: []
                },
                // {
                //     type: 'input',
                //     label: '发票号',
                //     labelSpecial: '',
                //     prop: 'godownEntry',
                //     placeholder: '发票号',
                //     disabled: false
                // },
                {
                    type: 'input',
                    label: '备注',
                    labelSpecial: '',
                    prop: 'description',
                    placeholder: '备注'
                }
            ],
            outSearchList: [
                {
                    type: 'date',
                    label: '出库时间',
                    labelSpecial: '*',
                    prop: 'changeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },
                {
                    type: 'select',
                    label: '出库方式',
                    labelSpecial: '*',
                    prop: 'changeMode',
                    placeholder: '请选择',
                    opts: []
                },
                {
                    type: 'select',
                    labelSpecial: '*',
                    label: '领用科室',
                    prop: 'deptStr',
                    hidden: true,
                    placeholder: '请选择',
                    opts: []
                },
                {
                    type: 'select',
                    label: '领用人员',
                    hidden: true,
                    labelSpecial: '*',
                    prop: 'userStr',
                    placeholder: '请选择',
                    opts: doctorList
                },
                {
                    type: 'select',
                    label: '供应商',
                    hidden: true,
                    prop: 'dealerName',
                    labelSpecial: '*',
                    placeholder: '请选择',
                    opts: []
                },
                {
                    type: 'input',
                    label: '备注',
                    labelSpecial: '',
                    prop: 'description',
                    placeholder: '备注'
                }
            ],
            selectTabColumns: [],
            // 入库下拉
            selectGetTabColumns: [
                {
                    value: 'name',
                    label: '药品名称',
                    minWidth: 200
                },
                {
                    value: 'spec',
                    label: '规格',
                    width: 120
                },
                {
                    value: 'manufacturerName',
                    minWidth: 250,
                    label: '生产厂商'
                },
                {
                    value: 'specUnit',
                    label: '单位',
                    width: 80
                }
                // {
                //     value: 'temp_price',
                //     label: '零售价',
                //     width: 80
                // }
            ],
            // 出库下拉
            selectOutTabColumns: [
                {
                    value: 'catName',
                    label: '药品名称',
                    width: 150
                },
                {
                    value: 'specUnit',
                    label: '单位',
                    width: 150
                },
                {
                    value: 'spec',
                    label: '规格',
                    width: 120
                },
                {
                    value: 'manufacturerName',
                    width: 200,
                    label: '生产厂商'
                },
                {
                    value: 'temp_price',
                    width: 80,
                    label: '零售价'
                },
                {
                    value: 'batchNum',
                    width: 100,
                    label: '批号'
                },
                {
                    value: 'validDate',
                    width: 100,
                    label: '有效期',
                    options: disabledPickerOptsAfter
                },
                {
                    value: 'qty',
                    width: 100,
                    label: '数量'
                }
            ],
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
                    operType: 'select',
                    opts: [],
                    field: 'specUnit',
                    width: 100,
                    formatterDisabled(row) {
                        return !!row.id
                    }
                },
                {
                    value: 'storageNum',
                    label: '数量',
                    operType: 'input',
                    func: this.storageNumChange,
                    type: 'number',
                    precision: 0,
                    min: 1,
                    width: 100,
                    autofocus: false,
                    showInput: true
                },
                {
                    value: 'purchasePrice',
                    label: '进价',
                    func: this.purchasePriceChange,
                    precision: 4,
                    width: 100,
                    min: 0,
                    operType: 'input',
                    type: 'number',
                    showInput: true
                },
                {
                    value: 'purchasePriceAmt',
                    width: 100,
                    precision: 2,
                    label: '进价金额',
                    func: this.purchasePriceAmtPriceChange,
                    min: 0,
                    operType: 'input',
                    type: 'number',
                    showInput: true,
                    count: true
                },
                {
                    // 零售价不跟着进价变
                    value: 'temp_price',
                    width: 100,
                    // precision: 4,
                    // min: 0,
                    label: '零售价',
                    func: this.temp_priceChange,
                    // type: 'number',
                    operType: 'input',
                    showInput: true,
                    disabled: true
                },
                {
                    value: 'temp_priceAmt',
                    precision: 2,
                    label: '零售金额',
                    width: 100,
                    count: true
                },
                {
                    value: 'chajiajiner',
                    label: '差价金额',
                    width: 100,
                    count: true
                },
                {
                    value: 'batch',
                    label: '批号',
                    width: 120,
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'expiryDate',
                    label: '有效期',
                    placeholder: '有效期',
                    options: disabledPickerOptsAfter,
                    operType: 'date',
                    showDate: true,
                    width: '155px',
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00'
                },
                {
                    value: 'invoiceNumDetail',
                    label: '发票号',
                    width: '120px'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    width: 80,
                    operType: 'button',
                    operations: [
                        {
                            label: '删除',
                            type: 'danger',
                            func: this.handleDelete
                        }
                    ]
                }
            ],
            outTabColumns: [
                {
                    value: 'catName',
                    label: '商品名称',
                    minWidth: '150'
                },
                {
                    value: 'catTypeName',
                    label: '药品类型'
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'manufacturerName',
                    label: '生产厂商',
                    width: 150
                },
                // {
                //     operType: 'select',
                //     value: 'specUnit',
                //     label: '单位',
                //     opts: [],
                //     width: 80
                // },
                {
                    value: 'specUnit',
                    label: '单位'
                },
                {
                    value: 'purchasePriceStr',
                    label: '进价'
                },
                {
                    value: 'temp_price',
                    label: '零售价'
                },
                {
                    value: 'storageNum',
                    label: '库存数量'
                },
                {
                    value: 'chukushuliang',
                    label: '出库数量',
                    func: this.chukushuliangChange,
                    type: 'number',
                    width: 180,
                    precision: 0,
                    min: 0,
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'purchasePriceAmt',
                    label: '进价金额',
                    width: 100,
                    count: true
                },
                {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    width: 100,
                    count: true
                },
                {
                    value: 'chajiajiner',
                    label: '差价金额',
                    width: 120,
                    count: true
                },
                {
                    value: 'batch',
                    label: '批次',
                    width: 100
                },
                {
                    value: 'expiryDate',
                    label: '有效期',
                    options: disabledPickerOptsAfter,
                    width: 100,
                    formatter(item) {
                        return item.expiryDate
                            ? item.expiryDate.split(' ')[0]
                            : ''
                    },
                    valueFormat: 'yyyy-MM-dd 00:00:00'
                },
                {
                    value: 'invoiceNumDetail',
                    label: '发票号',
                    width: '120px'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    operType: 'button',
                    operations: [
                        {
                            label: '删除',
                            type: 'danger',
                            func: this.handleDelete
                        }
                    ]
                }
            ],
            formData: [],

            saveLoading: false, // 保存loading
            audeLoading: false // 保存并审核loading
        }
    },
    computed: {
        ...mapGetters(['dictData', 'clinic'])
    },
    watch: {
        searchValue: function(val, oldVal) {
            if (val !== '') {
                this.getSelectTableData()
                this.popoverVisible = true
            } else {
                this.popoverVisible = false
            }
        }
    },
    mounted() {
        this.flag = this.$route.params.changeType === 'add'
        if (this.$route.params.id !== '-1') {
            this.title = this.flag ? '修改入库' : '修改出库'
            // 获得数据
            this.getData()
        } else {
            this.title = this.flag ? '新增入库' : '新增出库'
        }
        this.tabColumns = this.flag ? this.getTabColumns : this.outTabColumns
        this.searchList = this.flag ? this.getSearchList : this.outSearchList
        this.selectTabColumns = this.flag
            ? this.selectGetTabColumns
            : this.selectOutTabColumns

        this.dictData['148'] = [].concat(
            this.dictData['515'],
            this.dictData['516'],
            this.dictData['517'],
            this.dictData['518'],
            this.dictData['519'],
            this.dictData['520']
        )

        this.getSelectTableData() // 获得下拉表格数据
        this.initSelect()
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

        // 改变单位
        getProject(val, index) {
            this.tabData[index].chukuUnit = val
            var flag = '' // 选择的单位
            this.temp_isTiny.forEach(item => {
                if (item.value === val) {
                    flag = item.flag
                    this.tabData[index].specUnit = item.label
                    this.tabData[index].isTinyChange =
                        flag === 'specUseUnit' ? 1 : 0
                }
            })
            // 改成小单位
            if (flag === 'specUseUnit') {
                if (this.flag) {
                    // 进价
                    this.tabData[index].purchasePrice = this.saveChuNumber(
                        this.tabData[index].purchasePrice,
                        this.tabData[index].coefficient,
                        4
                    )
                    // 销售价
                    this.tabData[index].temp_price = this.tabData[
                        index
                    ].tinyPrice
                    // 进价改变影响进价金额
                    this.purchasePriceChange(this.tabData[index])
                } else {
                    // // 改变零售价
                    // this.tabData[index].temp_price = this.saveChuNumber(
                    //     this.tabData[index].temp_price,
                    //     this.tabData[index].coefficient,
                    //     4
                    // )
                    // // 出库进价
                    // this.tabData[index].purchasePriceStr = this.saveChuNumber(
                    //     this.tabData[index].purchasePriceStr,
                    //     this.tabData[index].coefficient,
                    //     4
                    // )
                    // // 如果存在了出库数量，后面的数据跟着改变
                    // if (this.tabData[index].chukushuliang) {
                    //     // 进价金额
                    //     this.tabData[index].purchasePriceAmt = this.saveNumber(
                    //         this.tabData[index].chukushuliang,
                    //         this.tabData[index].purchasePriceStr
                    //     )
                    //     // 零售金额
                    //     this.tabData[index].retailPriceAmt = this.saveNumber(
                    //         this.tabData[index].chukushuliang,
                    //         this.tabData[index].temp_price
                    //     )
                    // }
                }
            } else {
                // 改成大单位
                if (this.flag) {
                    // 进价
                    this.tabData[index].purchasePrice = this.saveNumber(
                        this.tabData[index].purchasePrice,
                        this.tabData[index].coefficient,
                        4
                    )
                    // 销售价
                    this.tabData[index].temp_price = this.tabData[index].price
                    // 进价改变影响进价金额
                    this.purchasePriceChange(this.tabData[index])
                } else {
                    // // 改变零售价
                    // this.tabData[index].temp_price = this.saveNumber(
                    //     this.tabData[index].temp_price,
                    //     this.tabData[index].coefficient,
                    //     4
                    // )
                    // // 出库进价
                    // this.tabData[index].purchasePriceStr = this.saveNumber(
                    //     this.tabData[index].purchasePriceStr,
                    //     this.tabData[index].coefficient,
                    //     4
                    // )
                    // // 如果存在了出库数量，后面的数据跟着改变
                    // if (this.tabData[index].chukushuliang) {
                    //     // 进价金额
                    //     this.tabData[index].purchasePriceAmt = this.saveNumber(
                    //         this.tabData[index].purchasePriceStr,
                    //         this.tabData[index].chukushuliang
                    //     )
                    //     // 零售金额
                    //     this.tabData[index].retailPriceAmt = this.saveNumber(
                    //         this.tabData[index].temp_price,
                    //         this.tabData[index].chukushuliang
                    //     )
                    // }
                }
            }

            // 零售金额
            if (this.tabData[index].storageNum) {
                this.tabData[index].temp_priceAmt = this.saveNumber(
                    this.tabData[index].temp_price,
                    this.tabData[index].storageNum
                )
            }
            // 差价金额
            if (
                (this.tabData[index].storageNum &&
                    this.tabData[index].purchasePrice) ||
                this.tabData[index].chukushuliang
            ) {
                this.chajiajinerChange(this.tabData[index])
            }
            if (this.tabData[index].chukushuliang) {
                this.chukushuliangChange(this.tabData[index])
            }
        },

        //  改变数量
        storageNumChange(row) {
            if (row.purchasePrice && !row.purchasePriceAmt) {
                // 如果进价存在 则改变进价金额
                row.purchasePriceAmt = this.saveNumber(
                    row.purchasePrice,
                    row.storageNum
                )
            }

            if (!row.purchasePrice && row.purchasePriceAmt) {
                // 如果进价金额存在 则改变进价
                row.purchasePrice = this.saveChuNumber(
                    row.purchasePriceAmt,
                    row.storageNum,
                    4
                )
            }

            if (row.purchasePrice && row.purchasePriceAmt) {
                row.purchasePriceAmt = this.saveNumber(
                    row.purchasePrice,
                    row.storageNum
                )
            }

            if (row.temp_price) {
                // 如果零售价存在 则改变零售金额
                row.temp_priceAmt = this.saveNumber(
                    row.temp_price,
                    row.storageNum
                )
            }
            if (row.temp_priceAmt && row.purchasePriceAmt) {
                this.chajiajinerChange(row)
            }
        },

        // 改变进价
        purchasePriceChange(row) {
            if (row.storageNum) {
                // 零售金额
                row.temp_priceAmt = this.saveNumber(
                    row.temp_price,
                    row.storageNum
                )
                // 进价金额
                row.purchasePriceAmt = row.purchasePrice ? this.saveNumber(
                    row.purchasePrice,
                    row.storageNum
                ) : 0
                this.chajiajinerChange(row)
            }
        },

        // 改变进价金额
        purchasePriceAmtPriceChange(row) {
            // 改变进价
            row.purchasePrice = row.purchasePriceAmt ? this.saveChuNumber(
                row.purchasePriceAmt,
                row.storageNum,
                4
            ) : 0

            if (row.storageNum) {
                row.temp_priceAmt = this.saveNumber(
                    row.temp_price,
                    row.storageNum
                )
                this.chajiajinerChange(row)
            }
        },

        // 改变零售价
        temp_priceChange(row) {
            // 零售金额
            row.temp_priceAmt = this.saveNumber(row.temp_price, row.storageNum)
            this.chajiajinerChange(row)
        },

        // 差价金额
        chajiajinerChange(row) {
            if (row.purchasePriceAmt) {
                if (row.temp_priceAmt && row.purchasePriceAmt && this.flag) {
                    row.chajiajiner = parseFloat(
                        row.temp_priceAmt - row.purchasePriceAmt
                    ).toFixed(2)
                } else {
                    if (row.retailPriceAmt) {
                        row.chajiajiner = parseFloat(
                            row.retailPriceAmt - row.purchasePriceAmt
                        ).toFixed(2)
                    } else {
                        row.chajiajiner = 0
                    }
                }
            } else {
                row.chajiajiner = 0
            }
        },

        // 改变出库数量
        chukushuliangChange(row) {
            // let temp_num = 0 // 出库specUseUnit数量   row.totalNum：库存specUseUnit数量
            // if (row.specUnit === row.temp_sepcUnit) {
            //     temp_num = row.isTiny === 1 ? row.chukushuliang * row.coefficient : row.chukushuliang
            // } else {
            //     temp_num = row.chukushuliang
            // }
            // row.chukushuliang = row.chukushuliang.toFixed(2)
            // row.retailPriceAmt = this.saveNumber(row.temp_price, row.chukushuliang)
            // row.purchasePriceAmt = this.saveNumber(
            //     row.purchasePriceStr,
            //     row.chukushuliang
            // )
            // 适应入库情况
            // row.temp_priceAmt = row.retailPriceAmt
            // this.chajiajinerChange(row)
            if (row.chukushuliang > row.max) {
                this.$message.warning('库存不足！')
                row.purchasePriceAmt = 0
                row.retailPriceAmt = 0
                row.chajiajiner = 0
                this.$nextTick(() => {
                    row.chukushuliang = 0
                })
            } else {
                row.chukushuliang = row.chukushuliang.toFixed(2)
                row.retailPriceAmt = this.saveNumber(
                    row.temp_price,
                    row.chukushuliang
                )
                row.purchasePriceAmt = this.saveNumber(
                    row.purchasePriceStr,
                    row.chukushuliang
                )
                // 适应入库情况
                row.temp_priceAmt = row.retailPriceAmt
                this.chajiajinerChange(row)
            }
        },

        // 改变单位
        changeSelect(row) {
            if (row.isTiny === 1) {
                this.temp_isTiny = [
                    {
                        label: row.temp_sepcUnit,
                        value: row.temp_sepcUnit,
                        flag: 'specUnit'
                    },
                    {
                        label: row.specUseUnit,
                        value: row.specUseUnit,
                        flag: 'specUseUnit'
                    }
                ]
            } else {
                this.temp_isTiny = [
                    {
                        label: row.temp_sepcUnit,
                        value: row.temp_sepcUnit,
                        flag: 'specUnit'
                    }
                ]
            }
            this.getTabColumns[4].opts = this.temp_isTiny
            // this.outTabColumns[4].opts = this.temp_isTiny
        },

        // 删除行
        handleDelete(row, index) {
            this.$confirm('确认删除？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.tabData.splice(index, 1)
                })
                .catch(() => {})
        },

        // 点击下拉表格的一行
        clickRow(row, event) {
            // 关闭数据表格
            this.popoverVisible = false
            // 填充数据
            var temp_json = {}
            var catTypeName = ''
            const that = this
            this._.forEach(that.dictData[148], function(item) {
                if (row.catType === item.value) {
                    catTypeName = item.label
                }
            })

            if (this.flag) {
                // 入库
                temp_json = {
                    chara: row.chara,
                    temp_sepcUnit: row.specUnit,
                    opts: [],
                    batchId: row.id,
                    isTiny: row.isTiny,
                    coefficient: row.specDispUseRatio,
                    temp_price: row.price, // 销售价
                    price: row.price, // 原销售价
                    tinyPrice: row.isTiny === 1 ? row.tinyPrice || '' : '', // 拆零零售价
                    catType: row.catType,
                    catCode: row.code,
                    catTypeName: catTypeName,
                    catName: row.name,
                    specUnit: row.specUnit,
                    specUseUnit: row.specUseUnit,
                    spec: row.spec,
                    retailPrice: row.price,
                    manufacturerName: row.manufacturerName,
                    chajiajiner: 0,
                    inventoryId: row.id,
                    isTinyChange: 0,
                    purchasePrice: row.purchasePrice || 0 // 进价
                }
                this.purchasePriceChange(temp_json)
            } else {
                // 出库
                temp_json = {
                    temp_id:
                        row.id +
                        row.catName +
                        row.purchasePrice +
                        row.temp_price +
                        row.spec +
                        row.catId +
                        row.batchNum +
                        row.batchNum,
                    batchId: row.id,
                    // opts: [],
                    catName: row.catName,
                    spec: row.spec, // 规格
                    catType: row.catType,
                    catTypeName: catTypeName,
                    purchasePriceStr: row.purchasePriceStr, // 成本价
                    catCode: row.catCode,
                    purchasePrice: row.purchasePrice, // 成本价
                    manufacturerName: row.manufacturerName,
                    retailPrice: row.retailPrice,
                    temp_price: row.temp_price, // 零售价
                    chajiajiner: 0.0,
                    purchasePriceAmt: 0,
                    retailPriceAmt: 0,
                    inventoryId: row.catId,
                    temp_sepcUnit: row.specUnit,
                    isTiny: row.isTiny,
                    coefficient: row.coefficient,
                    specUnit: row.specUnit,
                    specUseUnit: row.specUseUnit,
                    batch: row.batchNum, // 批号
                    storageNum: row.qty, // 库存数量
                    temp_qty: row.temp_qty,
                    totalNum: row.temp_qty,
                    expiryDate: row.validDate, // 有效期
                    isTinyChange: row.isTinyBatch,
                    max: row.temp_qty // 出库数量最大值
                }
            }
            console.log(temp_json)
            if (this.tabData.length === 0) {
                this.tabData.push(temp_json)
            } else {
                let flag = false
                const that = this
                this._.forEach(that.tabData, function(item) {
                    if (item.temp_id === temp_json.temp_id) {
                        flag = true
                    }
                })
                if (flag && !this.flag) {
                    this.$message.warning('请勿重复添加！')
                } else {
                    this.tabData.push(temp_json)
                }
            }
        },

        // 根据加成率计算
        changeByMakeUp(row) {},

        // 验证数据
        validate(arr) {
            if (!this.formData.changeTime) {
                this.formData.changeTime = getCurrentDay()
            }
            if (arr && arr.length > 0) {
                const that = this
                let flag = true
                this._.forEach(arr, function(item) {
                    if (that.flag) {
                        if (
                            !(
                                item.storageNum &&
                                item.purchasePrice &&
                                item.batch &&
                                item.expiryDate &&
                                item.purchasePriceAmt
                            )
                        ) {
                            flag = false
                        }
                    } else {
                        if (!item.chukushuliang) {
                            flag = false
                        }
                    }
                })
                if (!flag) {
                    that.$message.warning('药品信息需填写完整')
                    return false
                }
            } else {
                this.$message.warning('请添加药品信息')
                return false
            }

            if (!this.flag && !this.outSearchList[2].hidden) {
                if (!this.formData.deptStr) {
                    this.$message.warning('领用科室必选')
                    return false
                }
                if (!this.formData.userStr) {
                    this.$message.warning('领用人员必选')
                    return false
                }
            }
            if (
                !this.getSearchList[2].hidden ||
                !this.outSearchList[4].hidden
            ) {
                if (!this.formData.dealerName) {
                    this.$message.warning('供应商必选')
                    return false
                }
            }

            if (!this.formData.changeMode) {
                this.$message.warning('方式必选')
                return false
            }
            // if (this.formData.godownEntry.trim() === '') {
            //   this.$message.warning('发票号必填')
            //   this.formData.description = ''
            //   flag = false
            //   return flag
            // }
            if (
                (this.formData.changeMode === '7' ||
                    this.formData.changeMode === '8') &&
                !this.formData.description
            ) {
                this.$message.warning('备注必填')
                // this.formData.description = ''
                return false
            }
            return true
        },

        // 保存
        save(saveFlag) {
            // 出库方式，清空后几项的值
            if (!this.flag) {
                if (this.formData.changeMode === '3') {
                    this.formData.deptStr = ''
                    this.formData.deptName = ''
                    this.formData.deptId = ''
                    this.formData.userId = ''
                    this.formData.userName = ''
                    this.formData.userStr = ''
                }
                if (this.formData.changeMode === '4') {
                    this.formData.dealerName = ''
                    this.formData.dealerId = ''
                    this.formData.dealerCode = ''
                }
                if (this.formData.changeMode === '7') {
                    this.formData.deptStr = ''
                    this.formData.deptName = ''
                    this.formData.deptId = ''

                    this.formData.userId = ''
                    this.formData.userName = ''
                    this.formData.userStr = ''

                    this.formData.dealerName = ''
                    this.formData.dealerId = ''
                    this.formData.dealerCode = ''
                }
            } else {
                if (this.formData.changeMode === '8') {
                    this.formData.dealerName = ''
                    this.formData.dealerId = ''
                    this.formData.dealerCode = ''
                }
            }

            if (!this.flag) {
                this.formData.storageNum = this.formData.chukushuliang
            }
            if (this.$route.params.id !== '-1') {
                this.formData.id = this.$route.params.id
            } else {
                delete this.formData.id
            }
            var params = this.formData
            params.details = this.tabData

            var flag = this.validate(params.details)

            const isUseInsurance = this.commonUtil.getConfigValue(
                'isUseInsurance'
            )
            let ipAddress = ''
            let databaseName = ''
            if (isUseInsurance === '1') {
                if (this.commonUtil.getExplorer() !== 'ie') {
                    this.$message.warning('请使用IE浏览器进行医保诊所审核')
                    return false
                } else {
                    ipAddress = this.commonUtil.getConfigValue('ipDispose')
                    databaseName = this.commonUtil.getConfigValue(
                        'databaseName'
                    )
                    const clinicId = this.$store.getters.clinic
                        .thirdPartyClinicId
                    if (!ipAddress || !clinicId || !databaseName) {
                        this.$message.warning(
                            '该诊所未进行相关金舵手服务配置，请联系管理员！'
                        )
                        return false
                    }
                }
            }
            if (flag) {
                if (saveFlag) {
                    this.audeLoading = true
                } else {
                    this.saveLoading = true
                }
                if (this.flag) {
                    this._.forEach(params.details, function(item) {
                        item.retailPrice = item.temp_price
                        if (item.isTinyChange === 1) {
                            item.specUnit = item.temp_sepcUnit
                        }
                    })
                    if (saveFlag) {
                        saveAndAute(params)
                            .then(res => {
                                if (res.STATUS === '1') {
                                    const d = res.ITEMS
                                    if (!d || isUseInsurance !== '1') {
                                        this.audeLoading = false
                                        this.$message.success('保存并审核成功')
                                        this.$router.back(-1)
                                        return false
                                    }
                                    this.execSql(databaseName, ipAddress, res)
                                    this.audeLoading = false
                                    this.$message.success('保存并审核成功')
                                    this.$router.back(-1)
                                }
                            })
                            .catc(() => {
                                this.audeLoading = false
                            })
                    } else {
                        saveGetStroage(params)
                            .then(res => {
                                if (res.STATUS === '1') {
                                    this.saveLoading = false
                                    this.$message.success('保存成功')
                                    this.$router.back(-1)
                                }
                            })
                            .catc(() => {
                                this.saveLoading = false
                            })
                    }
                } else {
                    // 出库保存
                    var flagNum = true
                    const departmentObj = param2Obj(params.deptStr)
                    const userObj = param2Obj(params.userStr)
                    params = Object.assign(params, departmentObj, userObj)
                    if (params.details.length > 0) {
                        var unitFlag = true
                        for (
                            let index = 0;
                            index < params.details.length;
                            index++
                        ) {
                            var num = params.details[index].chukushuliang
                            // if (params.details[index].chukuUnit === params.details[index].temp_sepcUnit) {
                            //     num = params.details[index].chukushuliang * params.details[index].coefficient
                            // }

                            if (num > params.details[index].totalNum) {
                                this.$message.warning(
                                    '出库数量不得大于库存数量！'
                                )
                                flagNum = false
                                unitFlag = false
                                break
                            } else {
                                if (
                                    params.details[index].expiryDate.split(' ')
                                        .length === 1
                                ) {
                                    params.details[index].expiryDate =
                                        params.details[index].expiryDate +
                                        ' 00:00:00'
                                }
                                params.details[index].storageNum =
                                    params.details[index].chukushuliang
                                params.details[index].retailPrice =
                                    params.details[index].temp_price
                                params.details[index].purchasePrice =
                                    params.details[index].purchasePriceStr
                            }
                        }
                        if (unitFlag) {
                            this._.forEach(params.details, function(item) {
                                item.retailPrice = item.temp_price
                                if (item.isTinyChange === 1) {
                                    item.specUnit = item.temp_sepcUnit
                                }
                            })
                        }
                    }
                    if (flagNum) {
                        if (saveFlag) {
                            saveOutAndAute(params)
                                .then(res => {
                                    if (res.STATUS === '1') {
                                        this._.forEach(params.details, function(
                                            item
                                        ) {
                                            item.retailPrice = item.temp_price
                                            if (item.isTinyChange === 1) {
                                                item.specUnit =
                                                    item.temp_sepcUnit
                                            }
                                        })
                                        const d = res.ITEMS
                                        if (!d || isUseInsurance !== '1') {
                                            this.audeLoading = false
                                            this.$message.success(
                                                '保存并审核成功'
                                            )
                                            this.$router.back(-1)
                                            return false
                                        }
                                        this.execSql(
                                            databaseName,
                                            ipAddress,
                                            res
                                        )
                                        this.audeLoading = false
                                        this.$message.success('保存并审核成功')
                                        this.$router.back(-1)
                                    }
                                })
                                .catch(() => {
                                    this.audeLoading = false
                                })
                        } else {
                            saveOutStroage(params)
                                .then(res => {
                                    if (res.STATUS === '1') {
                                        this.saveLoading = false
                                        this.$message.success('保存成功')
                                        this.$router.back(-1)
                                    }
                                })
                                .catch(() => {
                                    this.saveLoading = false
                                })
                        }
                    } else {
                        this.reloadLoading(saveFlag)
                    }
                }
            }
        },

        // 重置loading
        reloadLoading(flag = false) {
            if (flag) {
                this.audeLoading = false
            } else {
                this.saveLoading = false
            }
        },

        // 出入库审核执行sql
        execSql(databaseName, ipAddress, res) {
            // console.log(databaseName,ipAddress,res)
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                // 创建数据库连接对象
                const conn = new ActiveXObject('ADODB.Connection')
                // Server ip服务：需要配置
                // Data Source数据库服务:需要配置
                const connectionstring = `Provider=SQLOLEDB;Persist Security Info=False;Initial Catalog=${databaseName};Data Source=${ipAddress};User ID=H2O;Password=123456`
                // 打开连接
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

        // 获得可选数据
        getSelectTableData() {
            const data = {}
            data.pageNo = this.pageIndex
            data.pageSize = 1000
            if (this.searchValue !== '') {
                if (this.flag) {
                    data.name = this.searchValue
                    getSelectData(data).then(res => {
                        this.selectTabData = res.ITEMS.records
                        // const that = this
                        // this._.forEach(that.selectTabData, function (item) {
                        //     // 拆零药品
                        //     if (item.isTiny === 1) {
                        //         // item.temp_price = item.price * item.specDispUseRatio * 1.15
                        //         item.temp_price = item.price * item.specDispUseRatio
                        //         item.temp_price = parseFloat(item.temp_price).toFixed(4)
                        //     } else {
                        //         item.temp_price = item.price
                        //     }
                        //     item.spec = item.spec ? item.spec : ''
                        // })
                    })
                } else {
                    data.catName = this.searchValue
                    outSelectData(data).then(res => {
                        const that = this
                        this.selectTabData = res.ITEMS.list || []
                        this._.forEach(that.selectTabData, function(item) {
                            item.temp_price = item.retailPrice
                            item.purchasePriceStr = item.purchasePrice
                            item.temp_qty = item.qty
                            item.validDate = item.validDate
                                ? item.validDate.split(' ')[0]
                                : ''
                            if (item.isTiny === 1) {
                                item.specUnit =
                                    item.isTinyBatch === 1
                                        ? item.specUseUnit
                                        : item.specUnit
                            }
                            item.qty = item.qty + item.specUnit
                            // if (item.isTiny === 1) {
                            //     item.purchasePriceStr = that.saveNumber(item.purchasePrice, item.coefficient, 4)
                            //     item.temp_qty = item.qty
                            //     item.qty1 =
                            //         parseInt(
                            //             item.coefficient ? item.qty / item.coefficient : item.coefficient
                            //         ).toFixed(0) + ''

                            //     const str1 = item.specUnit ? item.qty1 + item.specUnit : item.qty1

                            //     item.qty2 = item.coefficient ? parseInt(item.qty % item.coefficient) : item.qty
                            //     let str2 = ''
                            //     if (item.qty2 > 0) {
                            //         str2 = item.specUseUnit ? item.qty2 + item.specUseUnit : ''
                            //     } else {
                            //         str2 = ''
                            //     }
                            //     item.qty = str1 + str2
                            //     item.temp_price = (item.retailPrice * item.coefficient).toFixed(4)
                            // } else {
                            //     item.temp_qty = item.qty
                            //     item.qty = item.qty + item.specUnit
                            // }
                        })
                    })
                }
            }
        },

        // 初始化下拉框
        initSelect() {
            this.getSearchList[1].opts = this.dictData['141'].filter(
                item =>
                    item.note === '1' && item.value !== '5' && item.isUse === 1
            )

            this.outSearchList[1].opts = this.dictData['141'].filter(
                item =>
                    item.note === '2' && item.value !== '6' && item.isUse === 1
            )
            this.searchList[2].opts = []
            getOpSkDealerList().then(res => {
                if (res.ITEMS) {
                    const temp_opts = []
                    const d = res.ITEMS
                    if (d.length > 0) {
                        d.forEach((item, index) => {
                            temp_opts[index] = {
                                label: item.dealerName,
                                value: item.dealerName
                            }
                        })
                    }
                    if (this.flag) {
                        this.searchList[2].opts = temp_opts
                    } else {
                        this.searchList[4].opts = temp_opts
                    }
                }
            })

            getDepartmentOpts().then(res => {
                if (res.STATUS === '1') {
                    const that = this
                    const d = res.ITEMS
                    this._.forEach(d, function(item) {
                        var temp = [
                            {
                                value: param({
                                    deptId: item.id,
                                    deptName: item.name
                                }),
                                label: item.name
                            }
                        ]
                        that.temp_departmentList = that.temp_departmentList.concat(
                            temp
                        )
                    })
                }
                this.outSearchList[2].opts = this.temp_departmentList
            })

            if (this.$route.params.id === '-1') {
                const form = { changeTime: getCurrentDay() }
                this.$refs.form.initFields(form)
            }
        },

        handleSearch(form) {
            this.formData = form
            // 入库
            this.getSearchList[2].hidden = this.formData.changeMode !== '2'

            // 其他入库-备注
            this.getSearchList[3].labelSpecial =
                this.formData.changeMode === '8' ? '*' : ''

            // 出库
            // 供应商
            this.outSearchList[4].hidden = this.formData.changeMode !== '3'

            // 科室-领用人员
            this.outSearchList[2].hidden = this.formData.changeMode !== '4'
            this.outSearchList[3].hidden = this.formData.changeMode !== '4'

            // 其他出库 备注
            this.outSearchList[5].labelSpecial =
                this.formData.changeMode === '7' ? '*' : ''
        },

        // 获得数据
        getData() {
            const id = this.$route.params.id
            const isQty = this.$route.params.changeType === 'add' ? 0 : 1
            const data = {
                isQty
            }
            getStroageDetail(id, data).then(res => {
                if (res.STATUS && res.STATUS === '1') {
                    var d = res.ITEMS.master
                    if (!this.flag) {
                        d.deptStr =
                            d.deptId && d.deptName
                                ? param({
                                    deptId: d.deptId,
                                    deptName: d.deptName
                                })
                                : ''
                        d.userStr =
                            d.userId && d.userName
                                ? param({
                                    userId: d.userId,
                                    userName: d.userName
                                })
                                : ''
                    }
                    this.formData = d
                    var arr = res.ITEMS.detail

                    this.$refs.form.form = this.formData
                    if (!this.flag && this.$route.params.id !== '-1') {
                        this.outSearchList[5].labelSpecial =
                            this.formData.changeMode === '7' ? '*' : ''
                    }
                    if (arr.length > 0) {
                        const that = this
                        this._.forEach(arr, function(item) {
                            item.temp_sepcUnit = item.specUnit
                            that._.forEach(that.dictData[148], function(item2) {
                                if (item.catType === item2.value) {
                                    item.catTypeName = item2.label
                                }
                            })
                            if (item.isTiny === 1) {
                                // 拆零
                                if (that.flag) {
                                    // 入库
                                    // 下拉大单位
                                    if (item.isTinyChange === 1) {
                                        item.specUnit = item.specUseUnit
                                        item.chukuUnit = item.temp_sepcUnit
                                        // 零售价
                                        item.temp_price = item.retailPrice
                                    } else {
                                        item.chukuUnit = item.temp_sepcUnit
                                        // 数量（去掉计算）
                                        // item.storageNum = that.saveChuNumber(item.storageNum, item.coefficient, 2)
                                        // 进价
                                        // item.purchasePrice = that.saveNumber(item.purchasePrice, item.coefficient, 4)
                                        // 零售价
                                        item.temp_price = item.retailPrice // that.saveNumber(item.retailPrice, item.coefficient, 4)
                                    }
                                    // 进价
                                    // item.purchasePrice = that.saveChuNumber(item.purchasePriceAmt, item.storageNum, 4)
                                    // item.purchasePriceAmt
                                    // 零售价
                                    // 零售金额
                                    item.temp_priceAmt = that.saveNumber(
                                        item.temp_price,
                                        item.storageNum
                                    )
                                    // 差价金额
                                    item.chajiajiner = that.saveNumber(
                                        item.temp_price - item.purchasePrice,
                                        item.storageNum
                                    )

                                    // 显示供应商
                                    if (d.dealerName) {
                                        that.getSearchList[2].hidden = false
                                    }

                                    that.getSearchList[3].labelSpecial =
                                        that.formData.changeMode === '8'
                                            ? '*'
                                            : ''
                                } else {
                                    if (item.isTinyChange === 1) {
                                        item.specUnit = item.specUseUnit
                                        item.chukuUnit = item.specUseUnit
                                        // 零售价
                                        item.temp_price = item.retailPrice.toFixed(
                                            4
                                        )
                                        // 进价
                                        item.purchasePriceStr = item.purchasePrice.toFixed(
                                            4
                                        )
                                        // 出库数量
                                        item.chukushuliang = item.storageNum
                                    } else {
                                        item.chukuUnit = item.temp_sepcUnit
                                        // 数量
                                        // item.storageNum = that.saveChuNumber(item.storageNum, item.coefficient, 2)
                                        // 进价
                                        item.purchasePriceStr =
                                            item.purchasePrice // that.saveNumber(item.purchasePrice, item.coefficient, 4)
                                        // 零售价
                                        item.temp_price = item.retailPrice // that.saveNumber(item.retailPrice, item.coefficient, 4)

                                        // 出库数量
                                        item.chukushuliang = item.storageNum
                                    }
                                    item.max = item.totalNum // 出库数量最大值

                                    // item.qty1 =
                                    //     parseInt(
                                    //         item.coefficient ? item.totalNum / item.coefficient : item.coefficient
                                    //     ).toFixed(0) + ''

                                    // var str1 = item.temp_sepcUnit ? item.qty1 + item.temp_sepcUnit : item.qty1

                                    // item.qty2 = item.coefficient
                                    //     ? parseInt(item.totalNum % item.coefficient)
                                    //     : item.qty
                                    // var str2 = ''
                                    // if (item.qty2 > 0) {
                                    //     str2 = item.specUseUnit ? item.qty2 + item.specUseUnit : ''
                                    // } else {
                                    //     str2 = ''
                                    // }
                                    item.storageNum =
                                        item.totalNum + item.specUnit
                                    item.chajiajiner = (
                                        item.retailPriceAmt -
                                        item.purchasePriceAmt
                                    ).toFixed(2)

                                    // 显示科室
                                    if (d.deptName) {
                                        that.outSearchList[2].hidden = false
                                        that.outSearchList[3].hidden = false
                                    }
                                    // 显示供应商
                                    if (d.dealerName) {
                                        that.outSearchList[4].hidden = false
                                    }
                                }
                                that.outSearchList[5].labelSpecial =
                                    that.formData.changeMode === '7' ? '*' : ''
                            } else if (that.flag) {
                                // 入库非拆零
                                item.temp_price = item.retailPrice
                                item.temp_priceAmt = that.saveNumber(
                                    item.temp_price,
                                    item.storageNum
                                )
                                item.chajiajiner = that.saveNumber(
                                    item.retailPrice - item.purchasePrice,
                                    item.storageNum
                                )
                                item.purchasePriceStr = item.purchasePrice

                                // 显示供应商
                                if (d.dealerName) {
                                    that.getSearchList[2].hidden = false
                                }
                                that.getSearchList[3].labelSpecial =
                                    that.formData.changeMode === '8' ? '*' : ''
                            } else {
                                // 出库非拆零
                                item.chukushuliang = item.storageNum
                                item.storageNum = item.totalNum + item.specUnit
                                item.temp_price = item.retailPrice
                                item.chajiajiner = that.saveNumber(
                                    item.temp_price - item.purchasePrice,
                                    item.chukushuliang
                                )

                                // 显示科室
                                if (d.deptName) {
                                    that.outSearchList[2].hidden = false
                                    that.outSearchList[3].hidden = false
                                }

                                // 显示供应商
                                if (d.dealerName) {
                                    that.outSearchList[4].hidden = false
                                }

                                item.purchasePriceStr = item.purchasePrice
                                item.max = item.totalNum // 出库数量最大值
                            }
                        })
                        this.tabData = arr
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
.title {
    font-size: 18px;
    font-weight: bold;
    height: 50px;
    margin-left: 16px;
    border-bottom: 1px solid #e1e1e1;
    display: block;
    margin-bottom: 20px;
    line-height: 50px;
}
.el-select-dropdown {
    display: none;
}
.select-item {
    position: relative;
    height: 50px;
    display: block;
    width: 250px;
    margin-left: 60px;
    line-height: 70px;
}
.el-select-dropdown {
    display: none;
}
.bottom-button {
    padding-bottom: 20px;
    margin-top: 20px;
    margin-right: 15px;
    border-top: 1px solid #e1e1e1;
}
.bottom-button button {
    float: right;
    margin-left: 10px;
}
.total {
    border-top: 1px solid #e1e1e1;
    margin-top: 20px;
    padding-top: 20px;
    text-align: right;
    padding-right: 15px;
}
.bottom-button button.el-button.el-button--primary.el-button--small {
    margin-top: 20px;
}
</style>

<style>
.none-select {
    display: none !important;
}
.select-item .el-table-self {
    margin: 0 !important;
}
.select-item .el-input-group {
    margin-bottom: 5px !important;
}
.addStorage .el-input-number.is-without-controls .el-input__inner {
    padding: 0 !important;
}
.addStorage .el-input-number--small {
    width: 80px;
}
.page-container .addStorage .el-input-number .el-input__inner {
    text-align: center;
}
.popper-class {
    left: 260px !important;
}
</style>
