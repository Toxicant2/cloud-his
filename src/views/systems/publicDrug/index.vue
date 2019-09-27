<template>
    <el-row class="page-container">
        <el-row v-if="!isModify" class="page-main">
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="tab in tabMapOpts" :key="tab.catType" :name="tab.key" :label="tab.label">
                    <el-row class="fl">
                        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
                    </el-row>

                    <!-- <el-tabs v-if="activeName == 'tab5'" v-model="otherActiveName" type="card" @tab-click="otherHandleSwitch">
                        <el-tab-pane v-for="tab in otherTabMapOpts" :key="tab.catType" :name="tab.key" :label="tab.label">
                            <el-row class="fl">
                                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
                            </el-row>
                        </el-tab-pane>
                    </el-tabs> -->

                    <direct-search ref="search" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleFormSearch" />
                    <el-table-self :key="`${activeName}_tab`" :list-loading="listLoading" :columns="maps[activeName].columns" :table-data="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" :current-page="pageIndex" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                </el-tab-pane>
            </el-tabs>
        </el-row>
        <el-row v-else class="page-main">
            <el-row class="header">
                <h2>{{ isAdd?'新增':'修改' }}{{ maps[activeName].name }}</h2>
                <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
            </el-row>
            <el-form ref="form" :model="form" label-position="right" label-width="125px" class="form-container">
                <el-row v-for="(row,rowIndex) in formDoms" v-if="!row.hidden" :key="rowIndex">
                    <div v-if="row.name" class="header-line">
                        <span v-if="rowIndex > 0" class="line" />
                        <h3>{{ row.name }}</h3>
                    </div>
                    <el-col v-for="(col,colIndex) in row.items" :key="colIndex" :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" :lg="col.lg?col.lg:8" style="height:47px;" :style="col.style">
                        <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules">
                            <span v-if="!col.name" slot="label" />
                            <!-- 输入框 -->
                            <el-input v-if="col.type === 'input'" v-model.trim="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder" @input="col.func?col.func($event):{}">
                                <template v-if="col.slot" :slot="col.slot.slot">
                                    <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" />
                                    <span v-if="col.slot.unit">{{ col.slot.unit }}</span>
                                </template>
                            </el-input>

                            <!-- 数字输入框 -->
                            <el-input-number v-else-if="col.type === 'number'" v-model="form[col.field]" :min="col.min" :max="col.max" :disabled="col.disabled" :controls="col.controls || false" :placeholder="col.placeholder" :maxlength="col.maxlength" @input="col.func" />

                            <!-- 单选框 -->
                            <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.field]" :label="opt.value">
                                {{ opt.label }}
                            </el-radio>

                            <!-- 多选框 -->
                            <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                            </el-checkbox-group>

                            <!-- 选择器 -->
                            <el-select v-else-if="col.type === 'select'" v-model="form[col.field]" :disabled="col.disabled" :multiple="col.multiple" :filterable="col.filterable" :default-first-option="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                                <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                    <span style="float: left">{{ opt.label }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                </el-option>
                            </el-select>

                            <!-- 级联 -->
                            <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.field]" :popper-class="col.className" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" clearable filterable />

                            <!-- 规格 -->
                            <div v-else-if="col.type === 'complex'" class="complex">
                                <el-form-item v-for="(c,cIndex) in col.items" :key="cIndex" :prop="c.field" :rules="c.rules" :class="{'suffix':c.suffix}">
                                    <!-- 输入框 -->
                                    <el-input v-if="c.type === 'input'" v-model.trim="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder" />
                                    <!-- 数字 -->
                                    <el-input-number v-else-if="c.type === 'number'" v-model="form[c.field]" size="small" :controls="false" :min="c.min" :precision="c.precision" :disabled="c.disabled || disabled" />
                                    <!-- 选择器 -->
                                    <el-select v-else-if="c.type === 'select'" v-model="form[c.field]" filterable :placeholder="c.placeholder">
                                        <el-option v-for="(opt,optIndex) in c.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                            <span style="float: left">{{ opt.label }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                        </el-option>
                                    </el-select>
                                    <span v-if="c.suffix">{{ c.suffix }}</span>
                                </el-form-item>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row class="submit-btn">
                    <el-button @click="back">取消</el-button>
                    <el-button type="primary" :loading="loading" @click="handleConfirm">保存</el-button>
                </el-row>
            </el-form>
        </el-row>
    </el-row>
</template>

<script>
import {
    getCatStockList,
    addCatStock,
    updateCatStock,
    updateCatStockItemStatus,
    getDictByIdList,
    getCatTree,
    createSysNum,
    getCatStockItemInsurance
} from '@/api/catalog'
import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'
import paginationMixin from '@/components/TabComponents/mixin'
import { formatDictMap, param, param2Obj, deepClone } from '@/utils'
import ConvertPinyin from '@/utils/pinyin'
export default {
    components: {
        elTableSelf,
        directSearch
    },
    mixins: [paginationMixin],
    data() {
        const dictMap = {
            35: [], // 库存单位
            40: [], // 剂型
            147: [], // 性质
            115: [], // 发票项目类型
            // 144: [], // 默认用法-西药
            // 152: [], // 默认用法-中药
            // 145: [], // 默认频率
            150: [], // 会计类型
            522: [], // 材料类型
            521: [], // 中药类型
            515: [], // 西药类型
            79: [], // 商保类型（定向用户）
            528: [], // 抗生素级别
            523: [], // 保健相关细项分类
            533: [], // 其他相关细项分类
            // 529: [], // 麻醉药品标识
            all_79: [{ value: '', label: '全部' }]
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
                        if (item.dictId === 35 || item.dictId === 40) {
                            obj = {
                                value: item.name,
                                label: item.name
                            }
                        } else if (item.dictId === 150) {
                            obj = {
                                value: param({
                                    accountItemCode: item.code,
                                    accountItemName: item.name
                                }),
                                label: item.name
                            }
                        } else if (item.dictId === 115) {
                            obj = {
                                value: param({
                                    invoiceItemCode: item.code,
                                    invoiceItemName: item.name
                                }),
                                label: item.name
                            }
                        } else if (item.dictId === 144 || item.dictId === 152) {
                            obj = {
                                value: param({
                                    useMethodCode: item.code,
                                    useMethodName: item.name
                                }),
                                label: item.name
                            }
                        } else if (item.dictId === 145) {
                            obj = {
                                value: param({
                                    useFrequencyCode: item.code,
                                    useFrequencyName: item.name
                                }),
                                label: item.name
                            }
                        } else if (item.dictId === 147) {
                            if (item.code === '10' || item.code === '20') { return }
                            obj = {
                                value: item.code,
                                label: item.name
                            }
                        } else {
                            obj = {
                                value: item.code,
                                label: item.name
                            }
                        }
                        if (item.dictId === 79) {
                            dictMap['all_79'].push(obj)
                        }
                        dictMap[item.dictId].push(obj)
                    })
                }
            }
        })
        const catTreeList1 = []
        const catTreeList2 = []
        // 西药
        getCatTree(1).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        catTreeList1.push({
                            code: item.code,
                            name: item.name,
                            childList: item.childList
                        })
                    })
                }
            }
        })
        // 中药(中成药？)
        getCatTree(0).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        catTreeList2.push({
                            code: item.code,
                            name: item.name,
                            childList: item.childList
                        })
                    })
                }
            }
        })

        // 价格正则
        const priceRegular = /(^[1-9](\d+)?(\.\d{1,4})?$)|(^\d\.\d{1,4}$)|0/

        const temp_dictData = this.$store.getters.dictData

        // 其他类型
        const otherTypeCode = [].concat(
            temp_dictData['523'],
            temp_dictData['533']
        )
        temp_dictData['project-type'] = [].concat(
            temp_dictData['517'],
            temp_dictData['518'],
            temp_dictData['520']
        )
        temp_dictData['project-type'] = temp_dictData['project-type'].filter(
            item => item.label != '保健'
        )
        return {
            addLabel: '药品名称：',
            temp_unitData: dictMap,
            drugNameList: [],
            conditions: '',
            isModify: false,
            isAdd: false,
            loading: false,
            listLoading: false,
            activeName: 'tab1',
            tabMapOpts: [
                {
                    label: '西药/中成药',
                    key: 'tab1'
                },
                {
                    label: '中药',
                    key: 'tab2'
                },
                {
                    label: '材料',
                    key: 'tab3'
                },
                {
                    label: '项目',
                    key: 'tab4'
                },
                {
                    label: '其他',
                    key: 'tab5'
                }
            ],
            // otherActiveName: 'tab1',
            // otherTabMapOpts: [
            //     {
            //         label: '保健药品',
            //         key: 'tab1'
            //     },
            //     {
            //         label: '保健器材',
            //         key: 'tab2'
            //     }
            // ],
            maps: {
                tab1: {
                    name: '西药/中成药',
                    chara: '10',
                    catType: '1001',
                    isMedicine: 1,
                    list: [
                        {
                            name: '药品信息',
                            items: [
                                {
                                    type: 'input',
                                    name: '药品名称',
                                    field: 'name',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品名称必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.handleNameChange
                                },
                                {
                                    type: 'select',
                                    name: '药品类型',
                                    field: 'catType',
                                    opts: dictMap[515],
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品类型必选'
                                        }
                                    ],
                                    func: this.typeChange,
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '药品编码',
                                    field: 'code',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品编码必填'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '规格',
                                    field: 'spec',
                                    rules: [
                                        {
                                            required: true,
                                            message: '规格必填',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '剂型',
                                    field: 'formName',
                                    filterable: true,
                                    opts: dictMap[40],
                                    rules: [
                                        { required: true, message: '剂型必选' }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '国药准字',
                                    field: 'approvalNum'
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家',
                                    field: 'manufacturerName',
                                    rules: [
                                        {
                                            required: true,
                                            message: '生产厂家必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.manufacturerNameChange
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家拼音码',
                                    field: 'manufacturerSpellCode'
                                },
                                {
                                    type: 'input',
                                    name: '拼音码',
                                    field: 'spellCode'
                                },
                                {
                                    type: 'input',
                                    name: '商品名',
                                    field: 'tradeName'
                                },
                                {
                                    type: 'input',
                                    name: '商品拼音码',
                                    field: 'tradeSpellCode'
                                },
                                {
                                    type: 'input',
                                    name: '药品本位码',
                                    field: 'standCode'
                                },
                                {
                                    type: 'select',
                                    name: '发票项目',
                                    field: 'invoiceItemStr',
                                    opts: dictMap[115],
                                    rules: [
                                        {
                                            required: true,
                                            message: '发票项目必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '会计项目',
                                    field: 'accountItemStr',
                                    opts: dictMap[150],
                                    rules: [
                                        {
                                            required: true,
                                            message: '会计项目必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    multiple: true,
                                    name: '定向用户',
                                    field: 'insuranceList',
                                    opts: dictMap[79]
                                },
                                {
                                    type: 'input',
                                    name: '说明书地址',
                                    field: 'url'
                                },
                                {
                                    type: 'cascader',
                                    name: '药理分类',
                                    field: 'typeCode',
                                    changeOnSelect: true,
                                    props: {
                                        value: 'code',
                                        label: 'name',
                                        children: 'childList'
                                    },
                                    list: catTreeList1,
                                    xs: 24,
                                    sm: 12,
                                    lg: 16
                                }
                            ]
                        }
                    ],
                    columns: [
                        {
                            value: 'code',
                            label: '编码'
                        },
                        {
                            value: 'name',
                            label: '名称'
                        },
                        {
                            label: '类型',
                            formatter(row) {
                                return row.chara === '10' ? formatDictMap(dictMap[515], row.catType) : formatDictMap(otherTypeCode, row.typeCode)
                            }
                        },
                        {
                            value: 'spec',
                            label: '规格'
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            minWidth: '200'
                        },
                        // {
                        //     label: '拆零价',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.price : ''
                        //     }
                        // },
                        // {
                        //     label: '拆零单位',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.unit : ''
                        //     }
                        // },
                        // {
                        //     label: '零售价',
                        //     formatter(row) {
                        //         return row.isTiny === 1
                        //             ? (
                        //                 row.price * row.specDispUseRatio
                        //             ).toFixed(2)
                        //             : row.price
                        //     }
                        // },
                        // {
                        //     value: 'specUnit',
                        //     label: '零售单位'
                        // },
                        {
                            value: 'insurance',
                            label: '定向用户'
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 180,
                            operType: 'button',
                            operations: [
                                {
                                    func: this.handleEdit,
                                    formatter(row) {
                                        return {
                                            label: '编辑',
                                            type: '',
                                            disabled: row.isUse !== 1
                                        }
                                    }
                                },
                                {
                                    func: this.handleStatus,
                                    formatter(row) {
                                        return {
                                            label:
                                                row.isUse === 1
                                                    ? '停用'
                                                    : '启用',
                                            type:
                                                row.isUse === 1
                                                    ? 'danger'
                                                    : 'primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                tab2: {
                    name: '中药',
                    catType: '2001',
                    chara: '20',
                    isMedicine: 1,
                    list: [
                        {
                            name: '药品信息',
                            items: [
                                {
                                    type: 'input',
                                    name: '药品名称',
                                    field: 'name',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品名称必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.handleNameChange
                                },
                                {
                                    type: 'select',
                                    name: '药品类型',
                                    field: 'typeCode',
                                    opts: dictMap[521],
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品类型必选'
                                        }
                                    ],
                                    func: this.typeChange,
                                    disabled: true
                                    // type: 'cascader',
                                    // name: '药品分类',
                                    // field: 'typeCode',
                                    // className: 'catTree',
                                    // changeOnSelect: true,
                                    // props: {
                                    //     value: 'code',
                                    //     label: 'name',
                                    //     children: 'childList'
                                    // },
                                    // list: catTreeList2
                                },
                                {
                                    type: 'input',
                                    name: '药品编码',
                                    field: 'code',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品编码必填'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '规格',
                                    field: 'spec',
                                    rules: [
                                        {
                                            required: true,
                                            message: '规格必填',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拼音码',
                                    field: 'spellCode'
                                },
                                {
                                    type: 'input',
                                    name: '产地',
                                    field: 'yieldlyName',
                                    rules: [
                                        {
                                            required: true,
                                            message: '产地必填',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家',
                                    field: 'manufacturerName',
                                    func: this.manufacturerNameChange
                                    // rules: [{ required: true, message: '生产厂家必填', trigger: 'blur' }]
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家拼音码',
                                    field: 'manufacturerSpellCode'
                                },
                                {
                                    type: 'input',
                                    name: '药品本位码',
                                    field: 'standCode'
                                }
                            ]
                        }
                        // {
                        //     name: '使用信息',
                        //     items: [
                        //         {
                        //             type: 'complex',
                        //             name: '编辑规格',
                        //             rules: [{ required: true }],
                        //             xs: 24,
                        //             sm: 24,
                        //             lg: 24,
                        //             items: [
                        //                 {
                        //                     type: 'number',
                        //                     min: 0,
                        //                     name: '',
                        //                     field: 'specDispUseRatio',
                        //                     placeholder: '制剂数量',
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '制剂数量必填',
                        //                             trigger: 'blur'
                        //                         },
                        //                         {
                        //                             pattern: /^[1-9]\d+|^[1-9]$/,
                        //                             message:
                        //                                 '制剂数量为大于等于1的整数',
                        //                             trigger: 'blur'
                        //                         }
                        //                     ]
                        //                 },
                        //                 {
                        //                     type: 'select',
                        //                     name: '',
                        //                     field: 'specUseUnit',
                        //                     placeholder: '制剂单位',
                        //                     opts: dictMap[35],
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '制剂单位必选'
                        //                         }
                        //                     ],
                        //                     suffix: '/'
                        //                 },
                        //                 {
                        //                     type: 'select',
                        //                     name: '',
                        //                     field: 'specUnit',
                        //                     placeholder: '库存单位',
                        //                     opts: dictMap[35],
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '库存单位必选'
                        //                         }
                        //                     ]
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             type: 'radio',
                        //             name: '是否拆零',
                        //             field: 'isTiny',
                        //             opts: [
                        //                 {
                        //                     value: 1,
                        //                     label: '是'
                        //                 },
                        //                 {
                        //                     value: 0,
                        //                     label: '否'
                        //                 }
                        //             ],
                        //             rules: [
                        //                 {
                        //                     required: true,
                        //                     message: '是否拆零必选'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             type: 'input',
                        //             name: '零售价',
                        //             field: 'price',
                        //             rules: [
                        //                 {
                        //                     required: true,
                        //                     message: '零售价必填',
                        //                     trigger: 'blur'
                        //                 },
                        //                 {
                        //                     pattern: priceRegular,
                        //                     message: '请输入正确的零售价',
                        //                     trigger: 'blur'
                        //                 }
                        //             ],
                        //             slot: {
                        //                 slot: 'append',
                        //                 unit: ''
                        //             }
                        //         },
                        //         {
                        //             type: 'input',
                        //             name: '最高限价',
                        //             field: 'maxPrice',
                        //             rules: [
                        //                 {
                        //                     pattern: priceRegular,
                        //                     message: '请输入正确的最高限价',
                        //                     trigger: 'blur'
                        //                 }
                        //             ]
                        //         }
                        //         // {
                        //         //     type: 'select',
                        //         //     name: '默认用法/煎法',
                        //         //     field: 'userMethodStr',
                        //         //     opts: dictMap[152]
                        //         // }
                        //     ]
                        // }
                    ],
                    columns: [
                        {
                            value: 'code',
                            label: '编码'
                        },
                        {
                            value: 'name',
                            label: '名称'
                        },
                        {
                            value: 'spec',
                            label: '规格'
                        },
                        {
                            label: '类型',
                            formatter(row) {
                                let str = ''
                                dictMap[521].forEach(item => {
                                    if (item.value === row.typeCode) {
                                        str = item.label
                                    }
                                })
                                return str
                            }
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            minWidth: '200'
                        },
                        // {
                        //     label: '拆零价',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.price : ''
                        //     }
                        // },
                        // {
                        //     label: '拆零单位',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.unit : ''
                        //     }
                        // },
                        // {
                        //     label: '零售价',
                        //     formatter(row) {
                        //         return row.isTiny === 1
                        //             ? (
                        //                 row.price * row.specDispUseRatio
                        //             ).toFixed(2)
                        //             : row.price
                        //     }
                        // },
                        // {
                        //     value: 'specUnit',
                        //     label: '零售单位'
                        // },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 180,
                            operType: 'button',
                            operations: [
                                {
                                    label: '编辑',
                                    func: this.handleEdit
                                },
                                {
                                    func: this.handleStatus,
                                    formatter(row) {
                                        return {
                                            label:
                                                row.isUse === 1
                                                    ? '停用'
                                                    : '启用',
                                            type:
                                                row.isUse === 1
                                                    ? 'danger'
                                                    : 'primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                tab3: {
                    name: '材料',
                    catType: '5001',
                    chara: '50',
                    isMedicine: 0,
                    list: [
                        {
                            name: '基本属性',
                            items: [
                                {
                                    type: 'input',
                                    name: '名称',
                                    field: 'name',
                                    rules: [
                                        {
                                            required: true,
                                            message: '名称必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.handleNameChange
                                },
                                {
                                    type: 'select',
                                    name: '材料分类',
                                    field: 'typeCode',
                                    rules: [
                                        {
                                            required: true,
                                            message: '材料分类必选',
                                            trigger: 'blur'
                                        }
                                    ],
                                    opts: dictMap[522],
                                    func: this.typeChange,
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '材料编码',
                                    field: 'code',
                                    rules: [
                                        {
                                            required: true,
                                            message: '材料编码必填'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '规格',
                                    field: 'spec',
                                    rules: [
                                        {
                                            required: true,
                                            message: '规格必填',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拼音码',
                                    field: 'spellCode'
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家',
                                    field: 'manufacturerName',
                                    rules: [
                                        {
                                            required: true,
                                            message: '生产厂家必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.manufacturerNameChange
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家拼音码',
                                    field: 'manufacturerSpellCode'
                                }
                            ]
                        }
                        // {
                        //     name: '使用信息',
                        //     items: [
                        //         {
                        //             type: 'complex',
                        //             name: '编辑规格',
                        //             rules: [{ required: true }],
                        //             xs: 24,
                        //             sm: 24,
                        //             lg: 24,
                        //             items: [
                        //                 {
                        //                     type: 'input',
                        //                     name: '',
                        //                     field: 'specDispUseRatio',
                        //                     placeholder: '规格数量',
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '规格数量必填',
                        //                             trigger: 'blur'
                        //                         },
                        //                         {
                        //                             pattern: /^[1-9]\d+|^[1-9]$/,
                        //                             message:
                        //                                 '规格数量为大于等于1的整数',
                        //                             trigger: 'blur'
                        //                         }
                        //                     ]
                        //                 },
                        //                 {
                        //                     type: 'select',
                        //                     name: '',
                        //                     field: 'specUseUnit',
                        //                     placeholder: '规格单位',
                        //                     opts: dictMap[35],
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '规格单位必选'
                        //                         }
                        //                     ],
                        //                     suffix: '/'
                        //                 },
                        //                 {
                        //                     type: 'select',
                        //                     name: '',
                        //                     field: 'specUnit',
                        //                     placeholder: '库存单位',
                        //                     opts: dictMap[35],
                        //                     rules: [
                        //                         {
                        //                             required: true,
                        //                             message: '库存单位必选'
                        //                         }
                        //                     ]
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             type: 'radio',
                        //             name: '是否拆零',
                        //             field: 'isTiny',
                        //             opts: [
                        //                 {
                        //                     value: 1,
                        //                     label: '是'
                        //                 },
                        //                 {
                        //                     value: 0,
                        //                     label: '否'
                        //                 }
                        //             ],
                        //             rules: [
                        //                 {
                        //                     required: true,
                        //                     message: '是否拆零必选'
                        //                 }
                        //             ]
                        //         },
                        //         {
                        //             type: 'input',
                        //             name: '零售价',
                        //             field: 'price',
                        //             rules: [
                        //                 {
                        //                     required: true,
                        //                     message: '零售价必填',
                        //                     trigger: 'blur'
                        //                 },
                        //                 {
                        //                     pattern: priceRegular,
                        //                     message: '请输入正确的零售价',
                        //                     trigger: 'blur'
                        //                 }
                        //             ],
                        //             slot: {
                        //                 slot: 'append',
                        //                 unit: ''
                        //             }
                        //         },
                        //         {
                        //             type: 'input',
                        //             name: '最高限价',
                        //             field: 'maxPrice',
                        //             rules: [
                        //                 {
                        //                     pattern: priceRegular,
                        //                     message: '请输入正确的最高限价',
                        //                     trigger: 'blur'
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // }
                    ],
                    columns: [
                        {
                            value: 'code',
                            label: '编码'
                        },
                        {
                            value: 'name',
                            label: '名称'
                        },
                        {
                            value: 'spec',
                            label: '规格'
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            minWidth: '200'
                        },
                        // {
                        //     label: '拆零价',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.price : ''
                        //     }
                        // },
                        // {
                        //     label: '拆零单位',
                        //     formatter(row) {
                        //         return row.isTiny === 1 ? row.unit : ''
                        //     }
                        // },
                        // {
                        //     label: '零售价',
                        //     formatter(row) {
                        //         return row.isTiny === 1
                        //             ? (
                        //                 row.price * row.specDispUseRatio
                        //             ).toFixed(2)
                        //             : row.price
                        //     }
                        // },
                        // {
                        //     value: 'specUnit',
                        //     label: '零售单位'
                        // },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 180,
                            operType: 'button',
                            operations: [
                                {
                                    label: '编辑',
                                    func: this.handleEdit
                                },
                                {
                                    func: this.handleStatus,
                                    formatter(row) {
                                        return {
                                            label:
                                                row.isUse === 1
                                                    ? '停用'
                                                    : '启用',
                                            type:
                                                row.isUse === 1
                                                    ? 'danger'
                                                    : 'primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                tab4: {
                    name: '项目',
                    isMedicine: 0,
                    // chara: '30,40',
                    // catType: '9901,9908,9909',
                    list: [
                        {
                            name: '基本属性',
                            items: [
                                {
                                    type: 'input',
                                    name: '项目名称',
                                    field: 'name',
                                    rules: [
                                        {
                                            required: true,
                                            message: '项目名称必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.handleNameChange
                                },
                                {
                                    type: 'select',
                                    name: '项目类型',
                                    field: 'catType',
                                    opts: temp_dictData['project-type'],
                                    rules: [
                                        {
                                            required: true,
                                            message: '项目类型必选'
                                        }
                                    ],
                                    func: this.typeChange,
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '项目编码',
                                    field: 'code',
                                    rules: [
                                        {
                                            required: true,
                                            message: '项目编码必填'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    type: 'select',
                                    name: '项目单位',
                                    field: 'unit',
                                    opts: dictMap[35],
                                    rules: [
                                        {
                                            required: true,
                                            message: '项目单位必选'
                                        }
                                    ],
                                    filterable: true
                                },
                                {
                                    type: 'select',
                                    name: '性质',
                                    field: 'chara',
                                    opts: dictMap[147],
                                    rules: [
                                        { required: true, message: '性质必选' }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拼音码',
                                    field: 'spellCode'
                                },
                                {
                                    type: 'input',
                                    name: '单价',
                                    field: 'price',
                                    rules: [
                                        {
                                            required: true,
                                            message: '单价必填',
                                            trigger: 'blur'
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的单价',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'radio',
                                    name: '单价可否修改',
                                    field: 'isPrice',
                                    opts: [
                                        {
                                            value: 1,
                                            label: '是'
                                        },
                                        {
                                            value: 0,
                                            label: '否'
                                        }
                                    ],
                                    rules: [
                                        {
                                            required: true,
                                            message: '单价是否可修改必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '最高限价',
                                    field: 'maxPrice',
                                    rules: [
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的最高限价',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '发票项目',
                                    field: 'invoiceItemStr',
                                    opts: dictMap[115],
                                    rules: [
                                        {
                                            required: true,
                                            message: '发票项目必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '会计项目',
                                    field: 'accountItemStr',
                                    opts: dictMap[150],
                                    rules: [
                                        {
                                            required: true,
                                            message: '会计项目必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '备注',
                                    field: 'description'
                                }
                            ]
                        }
                    ],
                    columns: [
                        {
                            value: 'code',
                            label: '编码'
                        },
                        {
                            value: 'name',
                            label: '项目名称'
                        },
                        {
                            value: 'unit',
                            label: '单位'
                        },
                        {
                            value: 'price',
                            label: '单价（元）'
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 180,
                            operType: 'button',
                            operations: [
                                {
                                    label: '编辑',
                                    func: this.handleEdit
                                },
                                {
                                    func: this.handleStatus,
                                    formatter(row) {
                                        return {
                                            label:
                                                row.isUse === 1
                                                    ? '停用'
                                                    : '启用',
                                            type:
                                                row.isUse === 1
                                                    ? 'danger'
                                                    : 'primary'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                tab5: {
                    name: '其他',
                    labelName: '其他查询',
                    chara: '99',
                    // catType: '9902',
                    list: [
                        {
                            name: '相关信息',
                            items: [
                                {
                                    type: 'input',
                                    name: '名称',
                                    field: 'name',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品名称必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.handleNameChange
                                },
                                {
                                    type: 'select',
                                    name: '类型',
                                    field: 'typeCode',
                                    opts: otherTypeCode,
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品类型必选'
                                        }
                                    ],
                                    func: this.typeChange
                                    // disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '编码',
                                    field: 'code',
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品编码必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    type: 'input',
                                    name: '规格',
                                    field: 'spec',
                                    rules: [
                                        {
                                            required: true,
                                            message: '规格必填',
                                            trigger: 'blur'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '剂型',
                                    field: 'formName',
                                    filterable: true,
                                    opts: dictMap[40]
                                },
                                {
                                    type: 'input',
                                    name: '国药准字',
                                    field: 'approvalNum'
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家',
                                    field: 'manufacturerName',
                                    rules: [
                                        {
                                            required: true,
                                            message: '生产厂家必填',
                                            trigger: 'blur'
                                        }
                                    ],
                                    func: this.manufacturerNameChange
                                },
                                {
                                    type: 'input',
                                    name: '生产厂家拼音码',
                                    field: 'manufacturerSpellCode'
                                },
                                {
                                    type: 'input',
                                    name: '拼音码',
                                    field: 'spellCode'
                                },
                                {
                                    type: 'input',
                                    name: '商品名',
                                    field: 'tradeName'
                                },
                                {
                                    type: 'input',
                                    name: '商品拼音码',
                                    field: 'tradeSpellCode'
                                },
                                {
                                    type: 'input',
                                    name: '药品本位码',
                                    field: 'standCode'
                                },
                                {
                                    type: 'select',
                                    name: '发票项目',
                                    field: 'invoiceItemStr',
                                    opts: dictMap[115],
                                    rules: [
                                        {
                                            required: true,
                                            message: '发票项目必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'select',
                                    name: '会计项目',
                                    field: 'accountItemStr',
                                    opts: dictMap[150],
                                    rules: [
                                        {
                                            required: true,
                                            message: '会计项目必选'
                                        }
                                    ]
                                }
                                // {
                                //     type: 'select',
                                //     multiple: true,
                                //     name: '定向用户',
                                //     field: 'insuranceList',
                                //     opts: dictMap[79]
                                // }
                            ]
                        }
                    ]
                }
            },
            disabled: false,
            dataList: [],
            searchList: [
                // {
                //     type: 'checkbox',
                //     label: '',
                //     prop: 'isTiny',
                //     opts: [
                //         {
                //             value: '1',
                //             label: '拆零药品'
                //         }
                //     ]
                // },
                {
                    type: 'select',
                    label: '状态',
                    prop: 'isUse',
                    labelWidth: '75px',
                    opts: [
                        {
                            value: '',
                            label: '全部'
                        },
                        {
                            value: 1,
                            label: '启用'
                        },
                        {
                            value: 0,
                            label: '停用'
                        }
                    ]
                },
                {
                    type: 'select',
                    label: '定向用户',
                    prop: 'insuranceCode',
                    labelWidth: '100px',
                    opts: dictMap['all_79']
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'name',
                    placeholder: '输入名称/拼音码',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            form: {},
            formDoms: [],
            dictNameList: {
                tab1: {
                    '1001': 'ucStockCatXY', // 西药
                    '1002': 'ucStockCatZCY' // 中成药
                },
                tab2: {
                    '200102': 'ucStockCatZYYP', // 中药饮片
                    '200101': 'ucStockCatZYCPY' // 中药成品药
                },
                tab3: 'ucStockCatCL', // 材料,
                tab4: 'ucStockCatSFXM', // 项目
                tab5: {
                    '990201': 'ucStockCatBJQC', // 保健器材
                    '990202': 'ucStockCatBJYP', // 保健药品
                    '990901': 'ucStockCatHZP' // 化妆品
                }
            },
            cacheForm: {}
        }
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        // 名称变化
        handleNameChange(val) {
            if (val) {
                this.form.spellCode = ConvertPinyin(val)
            }
        },

        // 厂商改变
        manufacturerNameChange(val) {
            if (val) {
                this.form.manufacturerSpellCode = ConvertPinyin(val)
            }
        },

        // 切换pane
        handleSwitch(tab) {
            const activeName = this.activeName
            this.pageIndex = 1
            this.cacheForm = {}
            this.searchList[1].hidden = activeName !== 'tab1'
            this.handleSearch()
            if (this.activeName === 'tab5') {
                this.maps['tab5'].columns = this.maps['tab1'].columns
            }
            this.$refs.search[activeName.replace('tab', '') - 1].initforms()
        },

        // 返回
        back() {
            this.isModify = false
            this.pageIndex = 1
            this.cacheForm = {}
            this.handleSearch()
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            this.listLoading = true
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            const activeName = this.activeName
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            const notTab4 = activeName !== 'tab4'

            // 是否药品
            params.isMedicine = this.maps[activeName].isMedicine

            params.chara = this.maps[activeName].chara

            // if (activeName === 'tab5') {
            //     params.chara = '99'
            //     params.catType = '9902'
            //     if (this.otherActiveName === 'tab1') {
            //         params.typeCode = '990202'
            //         params.isMedicine = 1
            //     } else {
            //         params.typeCode = '990201'
            //         params.isMedicine = 0
            //     }
            // } else {
            //     params.chara = this.maps[activeName].chara
            //     if (activeName === 'tab4') {
            //         params.catType = this.maps[activeName].catType
            //     }
            //     params.isMedicine = this.maps[activeName].isMedicine
            // }
            // params.isTiny =
            //     params.isTiny && params.isTiny.length > 0 ? '1' : ''

            getCatStockList(params, notTab4 ? 'stock' : 'accrual').then(res => {
                if (res.STATUS === '1') {
                    this.$nextTick(() => {
                        const d = res.ITEMS
                        let total = 0
                        if (notTab4) { total = d && d.totalRecord ? d.totalRecord : 0 } else total = d && d.total ? d.total : 0

                        let result = []
                        if (total > 0) {
                            result = notTab4 ? d.list : d.records
                        }
                        this.total = total
                        this.dataList = result
                        this.listLoading = false
                    })
                }
            })
        },

        // 生成系统编号
        typeChange(val) {
            const activeName = this.activeName
            const dictCode =
                    activeName === 'tab1' || activeName === 'tab2' || activeName === 'tab5'
                        ? this.dictNameList[activeName][val]
                        : this.dictNameList[activeName]

            if (
                (activeName === 'tab3' || activeName === 'tab4') &&
                this.form.code
            ) {
                return false
            }
            createSysNum(dictCode).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.form.code = d
                    } else {
                        this.$message.error(res.MESSAGE)
                        this.form.code = ''
                    }
                }
            })
        },

        // 新增
        handleAdd() {
            this.isModify = true
            this.isAdd = true
            this.conditions = ''
            this.formDoms = this.maps[this.activeName].list
            this.formDoms[0].items[1].disabled = false
            this.initForms()
            // if (this.activeName === 'tab5') {
            //     this.formDoms =
            //         this.otherActiveName === 'tab1'
            //             ? this.maps['tab5'].list1
            //             : this.maps['tab5'].list

            //     if (this.otherActiveName === 'tab1') {
            //         this.formDoms = this.maps['tab5'].list1
            //         this.initForms({ catType: '9902', antiLevel: '0' })
            //         this.typeChange()
            //     } else {
            //         this.formDoms = this.maps['tab5'].list
            //         this.initForms({ catType: '9902' })
            //         this.typeChange()
            //     }
            //     this.formDoms[0].items[0].disabled = false
            // } else {
            //     this.formDoms = this.maps[this.activeName].list
            //     this.formDoms[0].items[1].disabled = false
            //     if (this.activeName === 'tab1') {
            //         this.initForms({
            //             antiLevel: '0',
            //             narcoticHempLabeling: '0'
            //         })
            //     } else {
            //         this.initForms()
            //     }
            // }
        },

        // 编辑
        handleEdit(item) {
            if (
                this.activeName === 'tab1'
            ) {
                getCatStockItemInsurance(item.id).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        const insuranceList = d.insuranceList
                        const result = []
                        if (insuranceList.length > 0) {
                            insuranceList.forEach(item => {
                                result.push(item.insuranceCode)
                            })
                        }
                        this.handleEditInit(item, result)
                    }
                })
            } else {
                this.handleEditInit(item, [])
            }
        },

        // 编辑时绑定表单
        handleEditInit(item, insuranceList) {
            this.isModify = true
            this.isAdd = false
            this.conditions = ''
            this.formDoms = this.maps[this.activeName].list
            // if (this.activeName === 'tab5') {
            //     this.formDoms =
            //         this.otherActiveName === 'tab1'
            //             ? this.maps['tab5'].list1
            //             : this.maps['tab5'].list
            // } else {
            //     this.formDoms = this.maps[this.activeName].list
            // }
            this.formDoms[0].items[1].disabled = true
            // 分类
            const typeCode =
                this.activeName === 'tab1'
                    ? item.typeCode
                        ? item.typeCode.split('&')
                        : []
                    : item.typeCode || ''

            this.initForms({
                insuranceList,
                id: item.id,
                name: item.name,
                code: item.code,
                spec: item.spec,
                unit: item.unit,
                specDose: item.specDose || '', // 剂量
                specDoseUnit: item.specDoseUnit || '', // 剂量单位
                specDispUseRatio: item.specDispUseRatio || '', // 制剂数量
                specUseUnit: item.specUseUnit || '', // 制剂单位
                specUnit: item.specUnit || '', // 库存单位
                manufacturerName: item.manufacturerName,
                manufacturerSpellCode: item.manufacturerSpellCode,
                spellCode: item.spellCode,
                tradeSpellCode: item.tradeSpellCode,
                price: item.price,
                maxPrice: item.maxPrice,
                typeCode,
                standCode: item.standCode || '',
                formName: item.formName || '',
                catType: item.catType || '',
                approvalNum: item.approvalNum || '',
                tradeName: item.tradeName || '',
                chara: item.chara || '',
                isTiny: item.isTiny || 0,
                insurance: item.insurance || '',
                isPrice: item.isPrice,
                description: item.description || '',
                accountItemStr: item.accountItemCode
                    ? param({
                        accountItemCode: item.accountItemCode,
                        accountItemName: item.accountItemName
                    })
                    : '', // 会计项目
                invoiceItemStr: item.invoiceItemCode
                    ? param({
                        invoiceItemCode: item.invoiceItemCode,
                        invoiceItemName: item.invoiceItemName
                    })
                    : '', // 发票项目
                // useFrequencyStr: item.useFrequencyCode
                //     ? param({
                //         useFrequencyCode: item.useFrequencyCode,
                //         useFrequencyName: item.useFrequencyName
                //     })
                //     : '', // 默认频率
                // userMethodStr: item.useMethodCode
                //     ? param({
                //         useMethodCode: item.useMethodCode,
                //         useMethodName: item.useMethodName
                //     })
                //     : '', // 默认用法
                // dosage: item.dosage || '', // 默认用量
                yieldlyName: item.yieldlyName,
                url: item.url
                // antiLevel: item.antiLevel || '0', // 是否抗菌药物
                // narcoticHempLabeling: item.narcoticHempLabeling || '0' // 是否毒麻药物
            })
        },

        // 修改状态
        handleStatus(item) {
            this.$confirm(
                `是否确认将【${item.name}】修改为【${
                    item.isUse === 1 ? '停用' : '启用'
                }】状态？`,
                '修改状态提示',
                {
                    type: 'warning'
                }
            )
                .then(() => {
                    updateCatStockItemStatus(
                        item.id,
                        item.isUse === 1 ? 0 : 1,
                        this.activeName !== 'tab4' ? 'stock' : 'accrual'
                    ).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('修改成功')
                        }
                    })
                })
                .catch(() => {})
        },

        // 初始化赋值form
        initForms(edit) {
            const form = {}
            this.formDoms.forEach(list => {
                list.items.forEach(item => {
                    if (!item.field || item.hidden) return false
                    if (item.type === 'checkbox' || item.type === 'cascader') {
                        form[item.field] = []
                    } else {
                        form[item.field] = ''
                    }
                })
            })

            if (edit) {
                this.form = Object.assign(form, edit)
            } else {
                this.form = Object.assign({}, form)
            }
            this.loading = false
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        // 保存
        handleConfirm() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.loading = true
                    const activeName = this.activeName
                    if (activeName === 'tab2') {
                        // 中药
                        // 发票项目
                        this.form.invoiceItemCode = '03'
                        this.form.invoiceItemName = '中草药费'
                        // 会计项目
                        this.form.accountItemCode = '01'
                        this.form.accountItemName = '药品收入'
                    }
                    if (activeName === 'tab3') {
                        // 材料
                        // 发票项目
                        this.form.invoiceItemCode = '04'
                        this.form.invoiceItemName = '材料费'
                        // 会计项目
                        this.form.accountItemCode = '06'
                        this.form.accountItemName = '其他收入'
                    }
                    const form = deepClone(this.form)
                    const accountItem = param2Obj(form.accountItemStr)
                    const invoiceItem = param2Obj(form.invoiceItemStr)
                    // const useFrequency = param2Obj(form.useFrequencyStr)
                    // const userMethod = param2Obj(form.userMethodStr)
                    form.typeCode = form.typeCode
                        ? typeof form.typeCode === 'string'
                            ? form.typeCode
                            : form.typeCode.join('&')
                        : ''
                    form.isStock = activeName === 'tab4' ? 0 : 1
                    let params = {}
                    if (activeName !== 'tab4') {
                        // form.unit =
                        //     form.isTiny === 1
                        //         ? form.specUseUnit
                        //         : form.specUnit
                        // 定向用户
                        const insuranceList = []
                        if (activeName === 'tab1') {
                            if (form.insuranceList.length > 0) {
                                form.insuranceList.forEach(item => {
                                    insuranceList.push({
                                        insuranceCode: item
                                    })
                                })
                            }
                        }
                        // if (activeName === 'tab2') {
                        //     // 剂量单位和零售单位一致
                        //     form.specDoseUnit = form.unit
                        // }
                        // 所有性质固定
                        form.chara = this.maps[activeName].chara
                        // 西药项目类型在表单，其余固定
                        if (activeName !== 'tab1') {
                            form.catType = this.maps[activeName].catType
                        }
                        // 除其他外是否药品固定
                        if (activeName === 'tab5') {
                            form.catType = form.typeCode === '990901' ? '9909' : '9902'
                            form.isMedicine = form.typeCode === '990202' ? 1 : 0
                            // if (this.otherActiveName === 'tab1') {
                            //     form.typeCode = '990202'
                            //     form.isMedicine = 1
                            // } else {
                            //     form.typeCode = '990201'
                            //     form.isMedicine = 0
                            //     // 发票项目
                            //     form.invoiceItemCode = '99'
                            //     form.invoiceItemName = '其他费'
                            //     // 会计项目
                            //     form.accountItemCode = '06'
                            //     form.accountItemName = '其他收入'
                            // }
                        } else {
                            form.isMedicine = this.maps[activeName].isMedicine
                        }
                        params = {
                            stock: Object.assign(
                                accountItem,
                                invoiceItem,
                                form
                            ),
                            insuranceList
                        }
                    } else {
                        params = Object.assign(accountItem, invoiceItem, form)
                    }
                    // 新增或修改
                    const requestUrl = form.id ? updateCatStock : addCatStock
                    requestUrl(
                        params,
                        activeName !== 'tab4' ? 'stock' : 'accrual'
                    )
                        .then(res => {
                            if (res.STATUS === '1') {
                                this.loading = false
                                this.handleSearch()
                                if (form.id) {
                                    this.$message.success('修改成功')
                                } else {
                                    this.$confirm(
                                        '新增成功，是否继续新增?',
                                        '提示',
                                        {
                                            confirmButtonText: '是',
                                            cancelButtonText: '否',
                                            type: 'warning'
                                        }
                                    )
                                        .then(() => {
                                            this.handleAdd()
                                        })
                                        .catch(() => {
                                            this.back()
                                        })
                                }
                            }
                        })
                        .catch(() => {
                            this.loading = false
                        })
                } else {
                    this.$message.error('检测到有必填项为空或者不符合输入要求')
                    window.scrollTo(0, 0)
                }
            })
        }
    }
}
</script>

<style lang="scss">
.form-container {
    .complex {
        .el-form-item {
            display: inline-block;
            width: 12%;
            margin-right: 10px;
            &.suffix {
                .el-input,
                .el-select {
                    width: 90%;
                }
            }
        }
    }
}
</style>

<style lang="scss" scoped>
.page-main {
    .header {
        text-align: right;
        h2 {
            float: left;
            font-size: 16px;
            font-weight: 700;
            line-height: 32px;
        }
    }

    .form-container {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #ccc;
        .header-line {
            line-height: 36px;
            .header {
                margin-left: 10px;
                h3 {
                    display: inline-block;
                    font-size: 14px;
                    color: #666;
                }
            }
            .line {
                display: block;
                border-bottom: 1px dashed #ccc;
                margin: 10px 0;
                margin-top: 0;
            }
        }
    }

    .submit-btn {
        border-top: 1px solid #ccc;
        padding-top: 10px;
        text-align: right;
    }
}
</style>

