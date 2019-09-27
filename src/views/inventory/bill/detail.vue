<template>
  <el-row class="page-main">
    <div class="addStorage">
      <span class="title">
        修改发票号
        <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="handleBack">返回</el-button>
      </span>
      <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleSearch" />
      <el-table-self :tab-type="'index'" :tab-label="'序号'" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns"  />
      
      <div class="bottom-button">
        <el-button type="primary" @click.native="handleBack">取消</el-button>
        <!-- <el-button type="primary" @click.native="save('true')">保存并审核</el-button> -->
        <el-button type="primary" @click.native="save()">保存</el-button>
      </div>
    </div>
  </el-row>
</template>

<script>
import { getStroageDetail, getOpSkDealerList, saveInventoryNumber } from '@/api/pharmacy'
// import complexTab from '@/components/TabComponents/complex'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { getCurrentDay } from '@/utils/common'
import paginationMixin from '@/components/TabComponents/mixin'
import { getDepartmentOpts, getOrgClinicStaffList } from '@/api/org'
// import route from '@/lang/zh'
import { param } from '@/utils'
import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        elTableSelf
    // complexTab
    },
    mixins: [paginationMixin],
    props: ['billId'],
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
            options: [],
            listLoading: false,
            tabData: [],
            searchList: [
                {
                    type: 'date',
                    labelSpecial: '*',
                    label: '入库时间',
                    prop: 'changeTime',
                    dateType: 'datetime',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    disabled: true
                },
                {
                    type: 'select',
                    labelSpecial: '*',
                    label: '入库方式',
                    prop: 'changeMode',
                    placeholder: '请选择',
                    opts: [],
                    disabled: true
                },
                {
                    type: 'select',
                    labelSpecial: '*',
                    label: '供应商',
                    hidden: true,
                    prop: 'dealerName',
                    placeholder: '请选择',
                    opts: [],
                    disabled: true
                },
                // {
                //     type: 'input',
                //     label: '发票号',
                //     labelSpecial: '',
                //     prop: 'godownEntry',
                //     placeholder: '发票号',
                //     disabled: true
                // },
                {
                    type: 'input',
                    label: '备注',
                    labelSpecial: '',
                    prop: 'description',
                    disabled: true
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
                },
                {
                    value: 'temp_price',
                    label: '零售价',
                    width: 80
                }
            ],
            tabColumns: [
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
                    field: 'specUnit',
                    width: 100
                },
                {
                    value: 'storageNum',
                    label: '数量',
                    operType: 'input',
                    type: 'number',
                    precision: 0,
                    min: 1,
                    width: 100
                },
                {
                    value: 'purchasePrice',
                    label: '进价',
                    func: this.purchasePriceChange,
                    precision: 4,
                    width: 100,
                    min: 0
                },
                {
                    value: 'purchasePriceAmt',
                    width: 100,
                    precision: 2,
                    label: '进价金额',
                    func: this.purchasePriceAmtPriceChange,
                    min: 0,
                    count: true
                },
                {
                    value: 'temp_price',
                    width: 100,
                    precision: 4,
                    min: 0,
                    label: '零售价',
                    func: this.temp_priceChange,
                    type: 'number',
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
                    width: 120
                },
                {
                    value: 'expiryDate',
                    label: '有效期',
                    width: '155px',
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00'
                },
                {
                    label: '发票号',
                    fixed: 'right',
                    width: 120,
                    operType: 'input',
                    showInput: true,
                    value: 'invoiceNumDetail'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    width: 80,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleCopy,
                            formatter(row, index) {
                                return {
                                    disabled: index === 0,
                                    label: '同上',
                                    type: 'primary'
                                }
                            }
                        }

                    ]
                }
            ],

            formData: []
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },

    methods: {

        // 保留几位小数
        saveNumber(val1, val2, num = 2) {
            return parseFloat(val1 * val2).toFixed(num)
        },
        saveChuNumber(val1, val2, num = 2) {
            return parseFloat(val1 / val2).toFixed(num)
        },

        // 保存
        save(saveFlag) {
            if (this.formData.changeMode === '8') {
                this.formData.dealerName = ''
                this.formData.dealerId = ''
                this.formData.dealerCode = ''
            }
            const data = []
            this._.forEach(this.tabData, function(item) {
                data.push({
                    id: item.id,
                    invoiceNumDetail: item.invoiceNumDetail
                })
            })
            saveInventoryNumber(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('保存成功')
                    this.handleBack()
                }
            })
        },

        // 初始化下拉框
        initSelect() {
            this.searchList[1].opts = this.dictData['141'].filter(
                item => item.note === '1' && item.value !== '5' && item.isUse === 1
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

                    this.searchList[2].opts = temp_opts
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
                        that.temp_departmentList = that.temp_departmentList.concat(temp)
                    })
                }
            })

            if (this.$route.params.id === '-1') {
                const form = { changeTime: getCurrentDay() }
                this.$refs.form.initFields(form)
            }
        },

        handleSearch(form) {
            this.formData = form
            // 入库
            this.searchList[2].hidden = this.formData.changeMode !== '2'

            // 其他入库-备注
            this.searchList[3].labelSpecial = this.formData.changeMode === '8' ? '*' : ''
        },

        // 获得数据
        getData() {
            const id = this.billId
            const isQty = 0
            const data = {
                isQty
            }
            getStroageDetail(id, data).then(res => {
                if (res.STATUS && res.STATUS === '1') {
                    var d = res.ITEMS.master
                    this.formData = d
                    var arr = res.ITEMS.detail
                    this.$refs.form.form = this.formData
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
                                // 入库
                                // 下拉大单位
                                if (item.isTinyChange === 1) {
                                    item.specUnit = item.specUseUnit
                                    item.chukuUnit = item.temp_sepcUnit
                                    // 零售价
                                    item.temp_price = item.retailPrice
                                } else {
                                    item.chukuUnit = item.temp_sepcUnit
                                    // 数量
                                    item.storageNum = that.saveChuNumber(item.storageNum, item.coefficient, 2)
                                    // 进价
                                    item.purchasePrice = that.saveNumber(item.purchasePrice, item.coefficient, 4)
                                    // 零售价
                                    item.temp_price = that.saveNumber(item.retailPrice, item.coefficient, 4)
                                }
                                // 进价
                                // item.purchasePrice = that.saveChuNumber(item.purchasePriceAmt, item.storageNum, 4)
                                // item.purchasePriceAmt
                                // 零售价
                                // 零售金额
                                item.temp_priceAmt = that.saveNumber(item.temp_price, item.storageNum)
                                // 差价金额
                                item.chajiajiner = that.saveNumber(
                                    item.temp_price - item.purchasePrice,
                                    item.storageNum
                                )

                                // 显示供应商
                                if (d.dealerName) {
                                    that.searchList[2].hidden = false
                                }

                                that.searchList[3].labelSpecial = that.formData.changeMode === '8' ? '*' : ''
                            } else {
                                // 入库非拆零
                                item.temp_price = item.retailPrice
                                item.temp_priceAmt = that.saveNumber(item.temp_price, item.storageNum)
                                item.chajiajiner = that.saveNumber(
                                    item.retailPrice - item.purchasePrice,
                                    item.storageNum
                                )
                                item.purchasePriceStr = item.purchasePrice

                                // 显示供应商
                                if (d.dealerName) {
                                    that.searchList[2].hidden = false
                                }
                                that.searchList[3].labelSpecial = that.formData.changeMode === '8' ? '*' : ''
                            }
                        })
                        this.tabData = arr
                    }
                }
            })
        },

        handleBack() {
            this.$emit('back')
        },

        // 同上
        handleCopy(row, index) {
            row.invoiceNumDetail = this.tabData[index - 1].invoiceNumDetail ? this.tabData[index - 1].invoiceNumDetail : ''
        }
    },
    mounted() {
        this.getData()

        this.dictData['148'] = [].concat(
            this.dictData['515'],
            this.dictData['516'],
            this.dictData['517'],
            this.dictData['518'],
            this.dictData['519'],
            this.dictData['520']
        )

        this.initSelect()
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