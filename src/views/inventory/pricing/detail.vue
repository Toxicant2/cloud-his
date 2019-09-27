<template>
    <el-row class="page-main">
        <div class="header">
            <span>{{title}}</span>
            <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
        </div>

        <el-form ref="form" :model="form" :label-width="'100px'" :disabled="disabled" class="clearfix">
            <el-col v-for="(item,itemIndex) in formData" :key="itemIndex" :xs="item.xs || 24" :sm="item.sm || 12" :lg="item.lg || 6" v-if="!item.hidden">
                <el-form-item :label="`${item.name}：`" :prop="item.prop">
                    <span slot="label" v-if="!item.name"></span>
                    <!-- 输入框 -->
                    <el-input v-if="item.type === 'input'" v-model="form[item.field]" :disabled="item.disabled" :placeholder="item.placeholder">
                    </el-input>

                    <!-- 日期 -->
                    <el-date-picker v-else-if="item.type === 'date'" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat">
                    </el-date-picker>

                    <!-- 下拉框 -->
                    <el-select v-else-if="item.type === 'select'" v-model="form[item.field]" placeholder="请选择" :disabled="item.disabled">
                        <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-form>

        <complex-tab :columns="tabColumns" :add-columns="addColumns" :table-data="tabData" @addItem="addItem" :params="{
            isAdjustPrice:true,
            placeholder:'编码/名称/条码/五笔码/拼音码',
            style:{width:'680px'}
        }" :disabled="disabled" :is-show="!disabled"/>

        <div class="footer">
            <el-button type="primary" :loading="btnLoading" @click="handleSave">{{btnTxt}}</el-button>
        </div>
    </el-row>
</template>

<script>
import {
    getSkAdjust,
    saveSkAdjust,
    auditSkAdjust,
    exportSkAdjust
} from '@/api/catalog'
import complexTab from '@/components/TabComponents/complex'
import { exportExcelCb } from '@/utils/exportExcel'
export default {
    components: {
        complexTab
    },
    props: {
        adjustType: { type: String },
        adjustId: { type: Number },
        adjustTypeList: { type: Array }
    },
    data() {
        const { adjustTypeList } = this.$props
        return {
            listLoading: false,
            disabled: false,
            btnLoading:false,
            form: {
                priceAdjustNumber: '',
                createTime: '',
                adjustType: '02',
                createUserName: '',
                checkUserName: '',
                effectiveTime: '',
                priceAdjustBasis: ''
            },
            formData: [
                {
                    type: 'input',
                    name: '调价单号',
                    field: 'priceAdjustNumber',
                    disabled: true
                }, {
                    type: 'date',
                    name: '调价日期',
                    field: 'createTime',
                    options: {
                        disabledDate(time) {
                            return time.getTime() <= Date.now() - 8.64e6 - 3600 * 1000 * 24
                        }
                    },
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00',
                    disabled: true
                }, {
                    type: 'select',
                    name: '调价类型',
                    field: 'adjustType',
                    opts: adjustTypeList
                }, {
                    type: 'input',
                    name: '制单人',
                    field: 'createUserName',
                    disabled: true
                }, {
                    type: 'input',
                    name: '审核人',
                    field: 'checkUserName',
                    disabled: true
                }, {
                    type: 'input',
                    name: '审核日期',
                    field: 'effectiveTime',
                    disabled: true
                }, {
                    type: 'input',
                    name: '备注',
                    field: 'priceAdjustBasis',
                    sm: 12,
                    lg: 12
                }
            ],

            tabData: [],
            addColumns: [
                {
                    value: 'name',
                    label: '名称',
                    width: '150'
                }, {
                    value: 'spec',
                    label: '规格',
                    width: '120'
                }, {
                    value: 'manufacturerName',
                    label: '生产厂家',
                    width: '150'
                }, {
                    value: 'price',
                    label: '零售价',
                    width: '120'
                }, {
                    value: 'maxPrice',
                    label: '最高限价',
                    width: '120'
                }
            ],
            tabColumns: [
                {
                    value: 'catName',
                    label: '名称'
                }, {
                    value: 'spec',
                    label: '规格',
                    width: '150px'
                }, {
                    value: 'manufacturerName',
                    label: '生产厂家',
                    width: '150px'
                },
                {
                    value: 'beforeSuperRetailPrice',
                    label: '调前销售价',
                    width: '120px'
                },
                {
                    type: 'number',
                    value: 'afterSuperRetailPrice',
                    label: '调后销售价',
                    min: 0.0001,
                    precision: 4,
                    width: '120px'
                },
                {
                    value: 'beforeRetailPrice',
                    label: '调前拆零价',
                    width: '120px'
                },
                {
                    type: 'number',
                    value: 'afterRetailPrice',
                    label: '调后拆零价',
                    // min: 0.0001,
                    precision: 4,
                    width: '120px'
                },
                // {
                //     value: 'beforeRetailPrice',
                //     label: '原价',
                //     width: '120px'
                // }, {
                //     type: 'number',
                //     value: 'afterRetailPrice',
                //     label: '调后价格',
                //     min: 0.0001,
                //     precision: 4,
                //     width: '120px'
                // },
                {
                    type: 'input',
                    value: 'description',
                    label: '备注'
                }
            ],
            operationColumn: [
                {
                    type: 'button',
                    label: '操作',
                    width: '135px',
                    func: this.deleteRow,
                    btnType: 'danger',
                    icon: 'el-icon-delete',
                    text: '删除',
                    fixed: 'right'
                }
            ]
        }
    },
    computed: {
        title() {
            switch (this.adjustType) {
                case 'add':
                    return '新增调价单'
                case 'edit':
                    return '修改调价'
                case 'detail':
                    return '调价详情'
                case 'audit':
                    return '确认调价'
                default:
                    break
            }
        },
        btnTxt() {
            switch (this.adjustType) {
                case 'add':
                    return '保存'
                case 'edit':
                    return '保存'
                case 'detail':
                    return '导出'
                case 'audit':
                    return '审核'
                default:
                    break
            }
        }
    },
    methods: {
        // 返回
        back() {
            this.$emit('back')
        },

        // 新增药品、检验检查、其他
        addItem(row) {
            const flag = this.tabData.some(item => {
                return item.catId === row.id
            })
            if (flag) {
                this.$message.error('调价单中已存在，无需重复添加')
                return false
            }
            const _price = row.isTiny === 1?row.tinyPrice:0
            const obj = {
                catCode: row.code,
                catId: row.id,
                catName: row.name,
                spec: row.spec,
                manufacturerName: row.manufacturerName,
                isTiny:row.isTiny,
                id: 0,
                description: '',
                beforeSuperRetailPrice: row.price,
                afterSuperRetailPrice: row.price,
                beforeRetailPrice: _price,
                afterRetailPrice: _price
            }
            this.tabData.push(obj)
        },

        // 删除行
        deleteRow(row) {
            this.tabData.forEach((item, index) => {
                if (item.catId === row.catId) {
                    this.tabData.splice(index, 1)
                }
            })
        },

        // 保存
        handleSave() {
            this.btnLoading = true
            if (this.adjustType === 'add' || this.adjustType === 'edit') {
                const form = this.form
                const detailList = this.tabData
                if (detailList.length === 0) {
                    this.$message.error('调价列表不可为空')
                    this.btnLoading = false
                    return false
                }
                const flag = detailList.some(item => {
                    return !item.afterSuperRetailPrice && (item.isTiny===1?!item.afterRetailPrice:true)
                })
                if (flag) {
                    this.$message.error('调后价格不可为空')
                    this.btnLoading = false
                    return false
                }
                const params = {
                    adjust: {
                        id: this.adjustId,
                        adjustType: form.adjustType,
                        priceAdjustBasis: form.priceAdjustBasis
                    },
                    detailList
                }
                saveSkAdjust(params).then(res => {
                    if (res.STATUS === '1') {
                        this.$emit('confirm', this.adjustType)
                    }
                })
            } else if (this.adjustType === 'audit') {
                auditSkAdjust(this.adjustId).then(res => {
                    if (res.STATUS === '1') {
                        this.$emit('confirm', this.adjustType)
                    }
                })
            } else {
                exportSkAdjust(this.adjustId, 'blob').then(res => {
                    this.btnLoading = false
                    exportExcelCb(res, '调价详情.xlsx')
                })
            }
        },

        initCp() {
            const type = this.adjustType
            const isAdd = type === 'add'
            this.formData[0].hidden = isAdd
            this.formData[1].hidden = isAdd
            this.formData[3].hidden = isAdd

            const isDetail = type === 'detail'
            this.formData[4].hidden = !isDetail
            this.formData[5].hidden = !isDetail

            this.disabled = (type === 'detail' || type === 'audit')
            this.tabColumns = this.disabled ? this.tabColumns : this.tabColumns.concat(this.operationColumn)
            if (isAdd) return false
            this._getSkAdjust()
        },

        // 获取详情
        _getSkAdjust() {
            getSkAdjust(this.adjustId).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const master = d.master
                    this.form = {
                        priceAdjustNumber: master.priceAdjustNumber,
                        createTime: master.createTime,
                        adjustType: master.adjustType,
                        createUserName: master.createUserName,
                        checkUserName: master.checkUserName,
                        effectiveTime: master.effectiveTime,
                        priceAdjustBasis: master.priceAdjustBasis
                    }
                    const detail = d.detail
                    const result = []
                    if (detail.length > 0) {
                        detail.forEach(item => {
                            result.push({
                                id: item.id,
                                catCode: item.catCode,
                                catId: item.catId,
                                catName: item.catName,
                                spec: item.spec,
                                manufacturerName: item.manufacturerName,
                                description: item.description,
                                beforeRetailPrice: item.beforeRetailPrice, // 单价
                                afterRetailPrice: item.afterRetailPrice,

                                isTiny:item.isTiny,
                                beforeSuperRetailPrice: item.beforeSuperRetailPrice,
                                afterSuperRetailPrice: item.afterSuperRetailPrice
                            })
                        })
                    }
                    this.tabData = result
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .header {
        height: 50px;
        line-height: 50px;
        margin-bottom: 20px;
        margin-left: 16px;
        border-bottom: 1px solid #e1e1e1;
        font-size: 18px;
        font-weight: bold;
        .el-button{
            float: right;
            margin-top: 9px;
        }
    }
    .footer{
        margin-top: 20px;
        text-align: right;
    }
</style>
