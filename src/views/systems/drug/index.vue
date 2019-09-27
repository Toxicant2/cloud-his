<template>
    <el-row class="page-container">
        <el-row v-if="!isModify" class="page-main">
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="tab in tabMapOpts" :key="tab.catType" :name="tab.key" :label="tab.label">
                    <el-row class="fl">
                        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
                        <el-button v-if="!isClinicCenter" type="primary" icon="el-icon-plus" @click="handleAppoint">引用</el-button>
                        <el-button v-if="isClinicCenter" type="primary" icon="el-icon-plus" @click="openAppointClinic">引用诊所</el-button>
                    </el-row>

                    <direct-search ref="search" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleFormSearch" />
                    <el-table-self :key="`${activeName}_tab`" :current-page="pageIndex" :list-loading="listLoading" :columns="maps[activeName].columns" :table-data="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                </el-tab-pane>
            </el-tabs>
        </el-row>
        <el-row v-else class="page-main">
            <el-row class="header">
                <h2>{{ isAdd?'新增':'修改' }}{{ maps[activeName].name }}</h2>
                <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
            </el-row>
            <el-form ref="form" :model="form" label-position="right" label-width="125px" class="form-container">
                <el-row v-if="isAdd&&(activeName==='tab1'||activeName==='tab2')">
                    <el-col :xs="24" :sm="12" :lg="8">
                        <el-form-item :label="`${maps[activeName].labelName}：`">
                            <el-popover v-model="popoverVisible" :visible-arrow="false" :transition="'linear'" trigger="click" width="720" popper-class="charge-item" placement="bottom-start">
                                <div class="ci-conditions">
                                    <el-input v-model="chargeItemForm.name" clearable placeholder="名称/完整拼音码/国药准字" @input="handleChargeItemSearch" />
                                    <el-input v-model="chargeItemForm.manufacturer" clearable placeholder="生产厂家/生产厂家拼音码" @input="handleChargeItemSearch" />
                                </div>

                                <el-scrollbar style="height:350px;" class="ci-main">
                                    <ul class="el-scrollbar__view el-select-dropdown__list">
                                        <template v-if="chargeItemList.length > 0">
                                            <li v-for="(ci,ciIndex) in chargeItemList" :key="ciIndex" :class="{'active':form.sysCatId === ci.id}" class="el-select-dropdown__item" @click="handleChargeItemClick(ci)">
                                                <div> {{ ci.name }} {{ ci.spec ? `（${ci.spec}）` : '' }}
                                                    <span v-if="ci.insurance" style="color:red;">【{{ ci.insurance }}】</span>
                                                </div>
                                                <div style="color: #8492a6; font-size: 10px">{{ ci.manufacturerName }}</div>
                                            </li>
                                        </template>
                                        <li v-else>暂无数据</li>
                                    </ul>
                                </el-scrollbar>

                                <div class="ci-footer">
                                    <el-pagination :current-page="chargeItemPageIndex" :page-sizes="chargeItemPageSizes" :page-size="chargeItemPageSize" :total="chargeItemTotal" layout="total, sizes, prev, pager, next, jumper" @size-change="handleChargeItemSizeChange" @current-change="handleChargeItemCurrentChange" />
                                </div>

                                <div slot="reference" class="ci-container">
                                    <span v-if="form.name">
                                        {{ form.name }}
                                    </span>
                                    <span v-else class="placeholder">可搜索查询</span>
                                </div>
                            </el-popover>
                        </el-form-item>
                    </el-col>
                </el-row>
                <template v-for="(row,rowIndex) in formDoms">
                    <el-row v-if="!row.hidden" :key="rowIndex">
                        <div v-if="row.name" class="header-line">
                            <span v-if="rowIndex > 0" class="line" />
                            <h3>{{ row.name }}</h3>
                        </div>
                        <template v-for="(col,colIndex) in row.items">
                            <el-col v-if="!col.hidden" :key="colIndex" :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" :lg="col.lg?col.lg:8" :style="col.style" style="height:47px;">
                                <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules">
                                    <span v-if="!col.name" slot="label" />
                                    <!-- 输入框 -->
                                    <el-input v-if="col.type === 'input'" v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder||'请输入'" @input="col.func?col.func($event):{}">
                                        <template v-if="col.slot" :slot="col.slot.slot">
                                            <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" />
                                            <span v-if="col.slot.unit">{{ col.slot.unit }}</span>
                                        </template>
                                    </el-input>
                                    <!-- 单选框 -->
                                    <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.field]" :label="opt.value">{{ opt.label }}
                                    </el-radio>

                                    <!-- 多选框 -->
                                    <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                        <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                                    </el-checkbox-group>

                                    <!-- 选择器 -->
                                    <el-select v-else-if="col.type === 'select'" v-model="form[col.field]" :multiple="col.multiple" :filterable="col.filterable" :default-first-option="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
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
                                            <el-input v-if="c.type === 'input'" v-model="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder||'请输入'" @input="c.func?c.func($event):{}" />
                                            <!-- 数字 -->
                                            <el-input-number v-else-if="c.type === 'number'" v-model="form[c.field]" :controls="false" :min="c.min" :precision="c.precision" :disabled="c.disabled || disabled" size="small" @input="c.func?c.func($event):{}" />
                                            <!-- 选择器 -->
                                            <el-select v-else-if="c.type === 'select'" v-model="form[c.field]" :placeholder="c.placeholder" filterable>
                                                <el-option v-for="(opt,optIndex) in c.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                                    <span style="float: left">{{ opt.label }}</span>
                                                    <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                                </el-option>
                                            </el-select>
                                            <span v-if="c.suffix">{{ c.suffix }}</span>
                                        </el-form-item>
                                    </div>

                                    <!-- 空 -->
                                    <template v-else-if="col.type === 'empty'" />
                                </el-form-item>
                            </el-col>
                        </template>
                    </el-row>
                </template>
                <el-row class="submit-btn">
                    <el-button @click="back">取消</el-button>
                    <el-button :loading="loading" type="primary" @click="handleConfirm">保存</el-button>
                </el-row>
            </el-form>
        </el-row>

        <el-dialog :visible.sync="centerDialogVisible" title="引用其他诊所目录" width="30%" center class="basicDialog" @close="close">
            <template v-if="clinicOptions.length > 0">
                <p class="otherclinicDia">请选择引用的诊所疾病目录：</p>

                <el-radio-group v-model="clinicId">
                    <el-radio v-for="(item,index) in clinicOptions" :key="index" :label="item.value">{{ item.name }}</el-radio>
                </el-radio-group>

                <span slot="footer" class="dialog-footer">
                    <el-button :loading="loading" type="primary" @click="handleAppointClinic">引用</el-button>
                </span>
            </template>
            <template v-else>
                <p style="font-size:16px;text-align:center">暂无可引用的诊所目录</p>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="centerDialogVisible = false">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </el-row>
</template>

<script>
import {
    getCatList,
    getDictByIdList,
    updateCatItem,
    saveCatItem,
    // getCatStockList,
    // getCatItem,
    getCatTree,
    updateCatItemStatus,
    createSysNum,
    appointOrgCenter,
    appointClinic
} from '@/api/catalog'
import { getOrgOpts } from '@/api/org'
import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'
import paginationMixin from '@/components/TabComponents/mixin'
import chargeItemPaginationMixin from './mixin'
import { formatDictMap, param, param2Obj, deepClone } from '@/utils'
import ConvertPinyin from '@/utils/pinyin'
import { mapGetters } from 'vuex'
import { toFixed } from '@/utils/float'
export default {
    components: {
        elTableSelf,
        directSearch
    },
    mixins: [paginationMixin, chargeItemPaginationMixin],
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
            528: [], // 抗生素级别
            523: [], // 保健相关细项分类
            533: [] // 其他相关细项分类
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
                                    userMethodCode: item.code,
                                    userMethodName: item.name
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
            item => item.label !== '保健'
        )

        const configList = this.$store.getters.clinic.configList
        const chineseMp = configList.chineseMedicalMarkUp // 中药加成率
        const westernMp = configList.westernMedicalMarkUp // 西药/中成药加成率
        const materialMp = configList.materialMarkUp // 材料加成率
        const otherMp = configList.otherMarkUp // 其他加成率

        return {
            addLabel: '药品名称：',
            temp_unitData: dictMap,
            // reomteLoading: false,
            // conditions: '',
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
                    labelName: '药品查询',
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
                                    disabled: true
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
                                    type: 'input',
                                    name: '定向用户',
                                    field: 'insuranceCodes',
                                    disabled: true
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
                        },
                        {
                            name: '使用信息',
                            items: [
                                {
                                    type: 'complex',
                                    name: '编辑规格',
                                    rules: [{ required: true }],
                                    xs: 24,
                                    sm: 24,
                                    lg: 24,
                                    items: [
                                        {
                                            type: 'number',
                                            min: 0.0001,
                                            precision: 4,
                                            name: '',
                                            field: 'specDose',
                                            placeholder: '剂量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '剂量必填',
                                                    trigger: 'blur'
                                                }
                                            ]
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specDoseUnit',
                                            filterable: true,
                                            placeholder: '剂量单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '剂量单位必选'
                                                }
                                            ],
                                            suffix: '*'
                                        },
                                        {
                                            type: 'number',
                                            min: 0,
                                            name: '',
                                            field: 'specDispUseRatio',
                                            placeholder: '制剂数量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂数量必填',
                                                    trigger: 'blur'
                                                },
                                                {
                                                    pattern: /^[1-9]\d+|^[1-9]$/,
                                                    message:
                                                        '制剂数量为大于等于1的整数',
                                                    trigger: 'blur'
                                                }
                                            ],
                                            func: this.handleRatioChange
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUseUnit',
                                            filterable: true,
                                            placeholder: '制剂单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂单位必选'
                                                }
                                            ],
                                            suffix: '/'
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUnit',
                                            filterable: true,
                                            placeholder: '库存单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '库存单位必选'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '进价',
                                    field: 'purchasePrice',
                                    rules: [
                                        // { required: true, message: '进价必填', trigger: 'blur' },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的进价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.purchasePriceChange
                                },
                                {
                                    type: 'input',
                                    name: '销售价',
                                    field: 'price',
                                    rules: [
                                        {
                                            required: true,
                                            message: '销售价必填',
                                            trigger: 'blur'
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的销售价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.handlePriceChange
                                },
                                {
                                    type: 'empty',
                                    xs: 24,
                                    sm: 12,
                                    lg: 8
                                },
                                {
                                    type: 'radio',
                                    name: '是否拆零',
                                    field: 'isTiny',
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
                                            message: '是否拆零必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拆零零售价',
                                    field: 'tinyPrice',
                                    rules: [
                                        {
                                            required: true,
                                            message: '拆零零售价必填',
                                            trigger: ['blur', 'change']
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的拆零零售价',
                                            trigger: ['blur', 'change']
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    hidden: true
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
                                // {
                                //     type: 'select',
                                //     name: '默认用法',
                                //     field: 'userMethodStr',
                                //     opts: dictMap[144]
                                // },
                                // {
                                //     type: 'select',
                                //     name: '默认频率',
                                //     field: 'useFrequencyStr',
                                //     opts: dictMap[145]
                                // },
                                // {
                                //     type: 'input',
                                //     name: '默认用量',
                                //     field: 'doasge'
                                // },
                                {
                                    type: 'select',
                                    name: '是否抗菌药物',
                                    field: 'antiLevel',
                                    opts: dictMap[528]
                                },
                                {
                                    type: 'radio',
                                    name: '毒麻药品标识',
                                    field: 'narcoticHempLabeling',
                                    opts: [
                                        {
                                            value: '1',
                                            label: '是'
                                        },
                                        {
                                            value: '0',
                                            label: '否'
                                        }
                                    ]
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
                        {
                            label: '进价',
                            value: 'purchasePrice'
                        },
                        {
                            label: '销售价',
                            value: 'price'
                        },
                        {
                            label: '拆零零售价',
                            formatter(row) {
                                return row.isTiny === 1 ? row.tinyPrice : ''
                            }
                        },
                        {
                            label: '拆零单位',
                            formatter(row) {
                                return row.isTiny === 1 ? row.specUseUnit : ''
                            }
                        },
                        {
                            value: 'specUnit',
                            label: '零售单位'
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
                        //         return row.isTiny === 1 ? (row.price * row.specDispUseRatio).toFixed(2) : row.price
                        //     }
                        // },
                        // {
                        //     value: 'specUnit',
                        //     label: '零售单位'
                        // },
                        {
                            value: 'insuranceCodes',
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
                    labelName: '药品查询',
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
                                    disabled: true
                                },
                                {
                                    type: 'select',
                                    name: '药品类型',
                                    field: 'typeCode',
                                    opts: dictMap[521],
                                    rules: [
                                        {
                                            required: true,
                                            message: '药品分类类型'
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
                        },
                        {
                            name: '使用信息',
                            items: [
                                {
                                    type: 'complex',
                                    name: '编辑规格',
                                    rules: [{ required: true }],
                                    xs: 24,
                                    sm: 24,
                                    lg: 24,
                                    items: [
                                        {
                                            type: 'number',
                                            min: 0,
                                            name: '',
                                            field: 'specDispUseRatio',
                                            placeholder: '制剂数量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂数量必填',
                                                    trigger: 'blur'
                                                },
                                                {
                                                    pattern: /^[1-9]\d+|^[1-9]$/,
                                                    message:
                                                        '制剂数量为大于等于1的整数',
                                                    trigger: 'blur'
                                                }
                                            ],
                                            func: this.handleRatioChange
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUseUnit',
                                            placeholder: '制剂单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂单位必选'
                                                }
                                            ],
                                            suffix: '/'
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUnit',
                                            placeholder: '库存单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '库存单位必选'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '进价',
                                    field: 'purchasePrice',
                                    rules: [
                                        // { required: true, message: '进价必填', trigger: 'blur' },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的进价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.purchasePriceChange
                                },
                                {
                                    type: 'input',
                                    name: '销售价',
                                    field: 'price',
                                    rules: [
                                        {
                                            required: true,
                                            message: '销售价必填',
                                            trigger: 'blur'
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的销售价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.handlePriceChange
                                },
                                {
                                    type: 'empty',
                                    xs: 24,
                                    sm: 12,
                                    lg: 8
                                },
                                {
                                    type: 'radio',
                                    name: '是否拆零',
                                    field: 'isTiny',
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
                                            message: '是否拆零必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拆零零售价',
                                    field: 'tinyPrice',
                                    rules: [
                                        {
                                            required: true,
                                            message: '拆零零售价必填',
                                            trigger: ['blur', 'change']
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的拆零零售价',
                                            trigger: ['blur', 'change']
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    hidden: true
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
                                }
                                // {
                                //     type: 'select',
                                //     name: '默认用法/煎法',
                                //     field: 'userMethodStr',
                                //     opts: dictMap[152]
                                // }
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
                            label: '进价',
                            value: 'purchasePrice'
                        },
                        {
                            label: '销售价',
                            value: 'price'
                        },
                        {
                            label: '拆零零售价',
                            formatter(row) {
                                return row.isTiny === 1 ? row.tinyPrice : ''
                            }
                        },
                        {
                            label: '拆零单位',
                            formatter(row) {
                                return row.isTiny === 1 ? row.specUseUnit : ''
                            }
                        },
                        {
                            value: 'specUnit',
                            label: '零售单位'
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
                        //         return row.isTiny === 1 ? (row.price * row.specDispUseRatio).toFixed(2) : row.price
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
                    labelName: '材料查询',
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
                                            message: '材料编码必填',
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
                        },
                        {
                            name: '使用信息',
                            items: [
                                {
                                    type: 'complex',
                                    name: '编辑规格',
                                    rules: [{ required: true }],
                                    xs: 24,
                                    sm: 24,
                                    lg: 24,
                                    items: [
                                        {
                                            type: 'input',
                                            name: '',
                                            field: 'specDispUseRatio',
                                            placeholder: '规格数量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '规格数量必填',
                                                    trigger: 'blur'
                                                },
                                                {
                                                    pattern: /^[1-9]\d+|^[1-9]$/,
                                                    message:
                                                        '规格数量为大于等于1的整数',
                                                    trigger: 'blur'
                                                }
                                            ],
                                            func: this.handleRatioChange
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUseUnit',
                                            placeholder: '规格单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '规格单位必选'
                                                }
                                            ],
                                            suffix: '/'
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUnit',
                                            placeholder: '库存单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '库存单位必选'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '进价',
                                    field: 'purchasePrice',
                                    rules: [
                                        // { required: true, message: '进价必填', trigger: 'blur' },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的进价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.purchasePriceChange
                                },
                                {
                                    type: 'input',
                                    name: '销售价',
                                    field: 'price',
                                    rules: [
                                        {
                                            required: true,
                                            message: '销售价必填',
                                            trigger: 'blur'
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的销售价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.handlePriceChange
                                },
                                {
                                    type: 'empty',
                                    xs: 24,
                                    sm: 12,
                                    lg: 8
                                },
                                {
                                    type: 'radio',
                                    name: '是否拆零',
                                    field: 'isTiny',
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
                                            message: '是否拆零必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拆零零售价',
                                    field: 'tinyPrice',
                                    rules: [
                                        {
                                            required: true,
                                            message: '拆零零售价必填',
                                            trigger: ['blur', 'change']
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的拆零零售价',
                                            trigger: ['blur', 'change']
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    hidden: true
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
                            value: 'spec',
                            label: '规格'
                        },
                        {
                            value: 'manufacturerName',
                            label: '生产厂家',
                            minWidth: '200'
                        },
                        {
                            label: '进价',
                            value: 'purchasePrice'
                        },
                        {
                            label: '销售价',
                            value: 'price'
                        },
                        {
                            label: '拆零零售价',
                            formatter(row) {
                                return row.isTiny === 1 ? row.tinyPrice : ''
                            }
                        },
                        {
                            label: '拆零单位',
                            formatter(row) {
                                return row.isTiny === 1 ? row.specUseUnit : ''
                            }
                        },
                        {
                            value: 'specUnit',
                            label: '零售单位'
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
                        //         return row.isTiny === 1 ? (row.price * row.specDispUseRatio).toFixed(2) : row.price
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
                    labelName: '项目查询',
                    isMedicine: 0,
                    // chara: '30,40',
                    // catType: '9901,9908',
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
                                            message: '项目编码必填',
                                            trigger: 'blur'
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
                    // catType: '9902,9909',
                    // list: [
                    //     {
                    //         name: '基本属性',
                    //         items: [
                    //             {
                    //                 type: 'input',
                    //                 name: '器材名称',
                    //                 field: 'name',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '器材名称必填',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 type: 'select',
                    //                 name: '器材分类',
                    //                 field: 'typeCode',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '器材分类必选',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ],
                    //                 opts: otherTypeCode,
                    //                 func: this.typeChange,
                    //                 disabled: true
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '器材编码',
                    //                 field: 'code',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '器材编码必填',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ],
                    //                 disabled: true
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '规格',
                    //                 field: 'spec',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '规格必填',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '拼音码',
                    //                 field: 'spellCode'
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '生产厂家',
                    //                 field: 'manufacturerName',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '生产厂家必填',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ],
                    //                 func: this.manufacturerNameChange
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '生产厂家拼音码',
                    //                 field: 'manufacturerSpellCode'
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         name: '使用信息',
                    //         items: [
                    //             {
                    //                 type: 'complex',
                    //                 name: '编辑规格',
                    //                 rules: [{ required: true }],
                    //                 xs: 24,
                    //                 sm: 24,
                    //                 lg: 24,
                    //                 items: [
                    //                     {
                    //                         type: 'input',
                    //                         name: '',
                    //                         field: 'specDispUseRatio',
                    //                         placeholder: '规格数量',
                    //                         rules: [
                    //                             {
                    //                                 required: true,
                    //                                 message: '规格数量必填',
                    //                                 trigger: 'blur'
                    //                             },
                    //                             {
                    //                                 pattern: /^[1-9]\d+|^[1-9]$/,
                    //                                 message:
                    //                                     '规格数量为大于等于1的整数',
                    //                                 trigger: 'blur'
                    //                             }
                    //                         ],
                    //                         func: this.handleRatioChange
                    //                     },
                    //                     {
                    //                         type: 'select',
                    //                         name: '',
                    //                         field: 'specUseUnit',
                    //                         placeholder: '规格单位',
                    //                         opts: dictMap[35],
                    //                         rules: [
                    //                             {
                    //                                 required: true,
                    //                                 message: '规格单位必选'
                    //                             }
                    //                         ],
                    //                         suffix: '/'
                    //                     },
                    //                     {
                    //                         type: 'select',
                    //                         name: '',
                    //                         field: 'specUnit',
                    //                         placeholder: '库存单位',
                    //                         opts: dictMap[35],
                    //                         rules: [
                    //                             {
                    //                                 required: true,
                    //                                 message: '库存单位必选'
                    //                             }
                    //                         ]
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '进价',
                    //                 field: 'purchasePrice',
                    //                 rules: [
                    //                     // { required: true, message: '进价必填', trigger: 'blur' },
                    //                     {
                    //                         pattern: priceRegular,
                    //                         message: '请输入正确的进价',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ],
                    //                 slot: {
                    //                     slot: 'append',
                    //                     unit: ''
                    //                 },
                    //                 func: this.purchasePriceChange
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '销售价',
                    //                 field: 'price',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '销售价必填',
                    //                         trigger: 'blur'
                    //                     },
                    //                     {
                    //                         pattern: priceRegular,
                    //                         message: '请输入正确的销售价',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ],
                    //                 slot: {
                    //                     slot: 'append',
                    //                     unit: ''
                    //                 },
                    //                 func: this.handlePriceChange
                    //             },
                    //             {
                    //                 type: 'empty',
                    //                 xs: 24,
                    //                 sm: 12,
                    //                 lg: 8
                    //             },
                    //             {
                    //                 type: 'radio',
                    //                 name: '是否拆零',
                    //                 field: 'isTiny',
                    //                 opts: [
                    //                     {
                    //                         value: 1,
                    //                         label: '是'
                    //                     },
                    //                     {
                    //                         value: 0,
                    //                         label: '否'
                    //                     }
                    //                 ],
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '是否拆零必选'
                    //                     }
                    //                 ]
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '拆零零售价',
                    //                 field: 'tinyPrice',
                    //                 rules: [
                    //                     {
                    //                         required: true,
                    //                         message: '拆零零售价必填',
                    //                         trigger: ['blur', 'change']
                    //                     },
                    //                     {
                    //                         pattern: priceRegular,
                    //                         message: '请输入正确的拆零零售价',
                    //                         trigger: ['blur', 'change']
                    //                     }
                    //                 ],
                    //                 slot: {
                    //                     slot: 'append',
                    //                     unit: ''
                    //                 },
                    //                 hidden: true
                    //             },
                    //             {
                    //                 type: 'input',
                    //                 name: '最高限价',
                    //                 field: 'maxPrice',
                    //                 rules: [
                    //                     {
                    //                         pattern: priceRegular,
                    //                         message: '请输入正确的最高限价',
                    //                         trigger: 'blur'
                    //                     }
                    //                 ]
                    //             }
                    //         ]
                    //     }
                    // ]
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
                                //     type: 'input',
                                //     name: '定向用户',
                                //     field: 'insuranceCodes',
                                //     disabled: true
                                // }
                            ]
                        },
                        {
                            name: '使用信息',
                            items: [
                                {
                                    type: 'complex',
                                    name: '编辑规格',
                                    rules: [{ required: true }],
                                    xs: 24,
                                    sm: 24,
                                    lg: 24,
                                    items: [
                                        {
                                            type: 'number',
                                            min: 0.0001,
                                            precision: 4,
                                            name: '',
                                            field: 'specDose',
                                            placeholder: '剂量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '剂量必填',
                                                    trigger: 'blur'
                                                }
                                            ]
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specDoseUnit',
                                            filterable: true,
                                            placeholder: '剂量单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '剂量单位必选'
                                                }
                                            ],
                                            suffix: '*'
                                        },
                                        {
                                            type: 'number',
                                            min: 0,
                                            name: '',
                                            field: 'specDispUseRatio',
                                            placeholder: '制剂数量',
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂数量必填',
                                                    trigger: 'blur'
                                                },
                                                {
                                                    pattern: /^[1-9]\d+|^[1-9]$/,
                                                    message:
                                                        '制剂数量为大于等于1的整数',
                                                    trigger: 'blur'
                                                }
                                            ],
                                            func: this.handleRatioChange
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUseUnit',
                                            filterable: true,
                                            placeholder: '制剂单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '制剂单位必选'
                                                }
                                            ],
                                            suffix: '/'
                                        },
                                        {
                                            type: 'select',
                                            name: '',
                                            field: 'specUnit',
                                            filterable: true,
                                            placeholder: '库存单位',
                                            opts: dictMap[35],
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '库存单位必选'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '进价',
                                    field: 'purchasePrice',
                                    rules: [
                                        // { required: true, message: '进价必填', trigger: 'blur' },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的进价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.purchasePriceChange
                                },
                                {
                                    type: 'input',
                                    name: '销售价',
                                    field: 'price',
                                    rules: [
                                        {
                                            required: true,
                                            message: '销售价必填',
                                            trigger: 'blur'
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的销售价',
                                            trigger: 'blur'
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    func: this.handlePriceChange
                                },
                                {
                                    type: 'empty',
                                    xs: 24,
                                    sm: 12,
                                    lg: 8
                                },
                                {
                                    type: 'radio',
                                    name: '是否拆零',
                                    field: 'isTiny',
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
                                            message: '是否拆零必选'
                                        }
                                    ]
                                },
                                {
                                    type: 'input',
                                    name: '拆零零售价',
                                    field: 'tinyPrice',
                                    rules: [
                                        {
                                            required: true,
                                            message: '拆零零售价必填',
                                            trigger: ['blur', 'change']
                                        },
                                        {
                                            pattern: priceRegular,
                                            message: '请输入正确的拆零零售价',
                                            trigger: ['blur', 'change']
                                        }
                                    ],
                                    slot: {
                                        slot: 'append',
                                        unit: ''
                                    },
                                    hidden: true
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
                                // {
                                //     type: 'select',
                                //     name: '默认用法',
                                //     field: 'userMethodStr',
                                //     opts: dictMap[144]
                                // },
                                // {
                                //     type: 'select',
                                //     name: '默认频率',
                                //     field: 'useFrequencyStr',
                                //     opts: dictMap[145]
                                // },
                                // {
                                //     type: 'input',
                                //     name: '默认用量',
                                //     field: 'doasge'
                                // },
                                {
                                    type: 'select',
                                    name: '是否抗菌药物',
                                    field: 'antiLevel',
                                    opts: dictMap[528]
                                }
                            ]
                        }
                    ]
                }
            },

            dataList: [],
            searchList: [
                {
                    type: 'checkbox',
                    label: '',
                    prop: 'isTiny',
                    opts: [
                        {
                            value: '1',
                            label: '是否拆零'
                        }
                    ],
                    hidden: false
                },
                {
                    type: 'select',
                    label: '状态',
                    prop: 'isUse',
                    labelWidth: '100px',
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
            cacheForm: {},
            isClinicCenter: this.$store.getters.clinic.isClinicCenter,
            centerDialogVisible: false,
            clinicOptions: [],
            clinicId: '',
            disabled: false,
            // 拆零零售价锁：零售价是否跟着系数和是否拆零变化
            isLock: false,
            // 药品加成率
            chineseMp: chineseMp
                ? chineseMp.actualValue || chineseMp.defaultValue
                : 1,
            westernMp: westernMp
                ? westernMp.actualValue || westernMp.defaultValue
                : 1,
            materialMp: materialMp
                ? materialMp.actualValue || materialMp.defaultValue
                : 1,
            otherMp: otherMp ? otherMp.actualValue || otherMp.defaultValue : 1
        }
    },
    watch: {
        // 'form.name': function(val) {
        //     if(val) {
        //         this.form.spellCode = ConvertPinyin(val)
        //     }
        // },

        // 'form.manufacturerName': function (val) {
        //     if(val) {
        //         this.form.manufacturerSpellCode = ConvertPinyin(val)
        //     }
        // },

        // 库存单位（大单位）
        'form.specUnit': function(val, oldVal) {
            const doms = this.maps[this.activeName].list[1]
            if (!val) {
                doms.items[1].slot.unit = ''
                doms.items[2].slot.unit = ''
            }
            this.temp_unitData[35].forEach(item => {
                if (item.value === val) {
                    doms.items[1].slot.unit = '元/' + item.label
                    doms.items[2].slot.unit = '元/' + item.label
                }
            })
        },

        // 制剂单位（小单位）
        'form.specUseUnit': function(val, oldVal) {
            const doms = this.maps[this.activeName].list[1]
            if (!val) {
                doms.items[5].slot.unit = ''
            }
            this.temp_unitData[35].forEach(item => {
                if (item.value === val) {
                    if (this.form.isTiny === 1) {
                        doms.items[5].slot.unit = '元/' + item.label
                    }
                }
            })
        },

        // 是否拆零
        'form.isTiny': function(val, oldVal) {
            if (this.activeName !== 'tab4') {
                const doms = this.maps[this.activeName].list[1]
                const isTiny = val === 1
                doms.items[5].hidden = !isTiny
                if (isTiny && this.form.specUseUnit) {
                    this.temp_unitData[35].forEach(item => {
                        if (item.value === this.form.specUseUnit) {
                            doms.items[5].slot.unit = '元/' + item.label
                        }
                    })
                }
                if (isTiny) {
                    if (
                        !this.isLock &&
                        this.form.price &&
                        this.form.specDispUseRatio
                    ) {
                        this.form.tinyPrice = toFixed(
                            this.form.price / this.form.specDispUseRatio,
                            4
                        )
                    }
                } else {
                    this.$set(this.form, 'tinyPrice', '')
                }
            }
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        // 名称改变
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

        // 进价改变
        purchasePriceChange(val) {
            // 销售价 = 进价 * 药品加成率
            const makeUp = this.getMakeUp()
            if (val && makeUp) {
                this.form.price = toFixed(val * (makeUp === '0' ? 1 : makeUp))
                this.handlePriceChange(this.form.price)
            }
        },

        // 销售价改变
        handlePriceChange(val) {
            if (val) {
                if (this.form.isTiny === 1 && this.form.specDispUseRatio) {
                    this.$set(
                        this.form,
                        'tinyPrice',
                        toFixed(val / this.form.specDispUseRatio, 4)
                    )
                }
            }
        },

        // 换算系数改变
        handleRatioChange(val) {
            if (!this.isLock && val) {
                if (this.form.isTiny === 1 && this.form.price) {
                    this.$set(
                        this.form,
                        'tinyPrice',
                        toFixed(this.form.price / val, 4)
                    )
                }
            }
        },

        // 获取加成率
        getMakeUp() {
            switch (this.activeName) {
                case 'tab1':
                    return this.westernMp
                case 'tab2':
                    return this.chineseMp
                case 'tab3':
                    return this.materialMp
                case 'tab5':
                    return this.otherMp
                default:
                    return ''
            }
        },

        // 切换pane
        handleSwitch(tab) {
            const activeName = this.activeName
            this.pageIndex = 1
            this.cacheForm = {}

            this.searchList[0].hidden = activeName === 'tab4'
            // 其他展示列和西药一样
            if (this.activeName === 'tab5') {
                this.maps['tab5'].columns = this.maps['tab1'].columns
            }

            this.handleSearch()
        },

        // 返回
        back(flag) {
            this.isModify = false
            if (flag === true) {
                this.pageIndex = 1
                this.cacheForm = {}
                this.handleSearch()
            }
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
            // params.isUse = params.isUse === undefined ? 1 : params.isUse

            this.$nextTick(() => {
                this.$refs.search[activeName.replace('tab', '') - 1].initforms(
                    params
                )

                const data = Object.assign({}, params)
                this.isModify = false

                data.pageNo = this.pageIndex
                data.pageSize = this.pageSize

                // 是否库存
                data.isStock = activeName === 'tab4' ? 0 : 1
                // 是否药品
                data.isMedicine = this.maps[activeName].isMedicine

                data.chara = this.maps[activeName].chara
                // if (activeName === 'tab4') {
                //     data.catType = this.maps[activeName].catType
                // }
                data.isTiny =
                    params.isTiny && params.isTiny.length > 0 ? '1' : ''

                getCatList(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$nextTick(() => {
                            const d = res.ITEMS
                            let result = []
                            if (d.totalRecord > 0) {
                                result = d.list
                            }
                            this.total = d.totalRecord
                            this.dataList = result
                            this.listLoading = false
                        })
                    }
                })
            })
        },

        // 生成系统编号
        typeChange(val) {
            if (!val) {
                this.form.code = ''
                return false
            }
            const activeName = this.activeName
            const dictCode =
                    activeName === 'tab1' || activeName === 'tab2' || activeName === 'tab5'
                        ? this.dictNameList[activeName][val]
                        : this.dictNameList[activeName]
            createSysNum(dictCode).then(res => {
                if (res && res.STATUS === '1') {
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
            this.handleChargeItemInit()
            this.formDoms = this.maps[this.activeName].list
            this.initForms()
        },

        // 引用
        handleAppoint() {
            this.$confirm('是否确定引用运营中心的收费项目?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const params = Object.assign(this.cacheForm)
                const activeName = this.activeName
                params.isStock = activeName === 'tab4' ? 0 : 1
                params.isMedicine = this.maps[activeName].isMedicine
                delete params.pageNo
                delete params.pageSize

                params.chara = this.maps[activeName].chara
                if (activeName === 'tab4') {
                    params.catType = this.maps[activeName].catType
                }
                appointOrgCenter(params).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                    }
                })
            })
        },

        // 运营中心引用诊所
        openAppointClinic() {
            this.clinicOptions = []
            getOrgOpts({ type: 1 }).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            this.clinicOptions.push({
                                name: item.name,
                                value: param({
                                    id: item.id,
                                    name: item.name
                                })
                            })
                        })
                    }
                }
                this.$nextTick(() => {
                    this.centerDialogVisible = true
                })
            })
        },

        // 引用诊所
        handleAppointClinic() {
            if (this.clinicId) {
                this.loading = true
                this.$confirm(
                    `是否确定引用${param2Obj(this.clinicId).name}的收费项目?`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
                    .then(() => {
                        const params = Object.assign(this.cacheForm)
                        const activeName = this.activeName
                        params.isStock = activeName === 'tab4' ? 0 : 1
                        params.isMedicine = this.maps[activeName].isMedicine
                        params.orgId = param2Obj(this.clinicId).id
                        delete params.pageNo
                        delete params.pageSize

                        params.chara = this.maps[activeName].chara
                        if (activeName === 'tab4') {
                            params.catType = this.maps[activeName].catType
                        }
                        // if (activeName === 'tab5') {
                        //     params.chara = '99'
                        //     params.catType = '9902'
                        //     if (this.otherActiveName === 'tab1') {
                        //         params.typeCode = '990202'
                        //     } else {
                        //         params.typeCode = '990201'
                        //     }
                        // } else {
                        //     params.chara = this.maps[activeName].chara
                        //     if (activeName === 'tab4') {
                        //         params.catType = this.maps[activeName].catType
                        //     }
                        // }
                        appointClinic(params).then(res => {
                            if (res.STATUS === '1') {
                                this.$message.success(res.MESSAGE)
                                this.centerDialogVisible = false
                                this.loading = false
                            }
                        })
                    })
                    .catch(() => {
                        this.loading = false
                    })
            } else {
                this.$message.warning('请先选择诊所')
            }
        },

        close() {
            this.centerDialogVisible = false
        },

        // 编辑
        handleEdit(item) {
            this.isLock = true
            this.isModify = true
            this.isAdd = false
            this.formDoms = this.maps[this.activeName].list
            // 分类
            const typeCode =
                this.activeName === 'tab1'
                    ? item.typeCode
                        ? item.typeCode.split('&')
                        : []
                    : item.typeCode || ''

            this.initForms({
                id: item.id,
                // sysCatId: item.id,
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
                isPrice: item.isPrice,
                description: item.description || '',
                insuranceCodes: item.insuranceCodes || '', // 定向用户
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
                // userMethodStr: item.userMethodCode
                //     ? param({
                //         userMethodCode: item.userMethodCode,
                //         userMethodName: item.userMethodName
                //     })
                //     : '', // 默认用法
                // doasge: item.doasge || '',// 默认用量
                purchasePrice: item.purchasePrice,
                tinyPrice: item.tinyPrice,
                yieldlyName: item.yieldlyName,
                url: item.url,
                antiLevel: item.antiLevel || '0', // 是否抗菌药物
                narcoticHempLabeling: item.narcoticHempLabeling || '0' // 是否毒麻药物
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
                    updateCatItemStatus(item.id, item.isUse === 1 ? 0 : 1).then(
                        res => {
                            if (res.STATUS === '1') {
                                this.handleSearch()
                                this.$message.success('修改成功')
                            }
                        }
                    )
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
                this.isLock = false
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
                    if (activeName !== 'tab4') {
                        form.unit =
                            form.isTiny === 1
                                ? form.specUseUnit
                                : form.specUnit
                        if (activeName !== 'tab1') {
                            form.catType = this.maps[activeName].catType
                        }
                        if (activeName === 'tab2') {
                            // 剂量单位和零售单位一致
                            form.specDoseUnit = form.unit
                        }

                        form.chara = this.maps[activeName].chara

                        if (this.activeName === 'tab5') {
                            form.catType = form.typeCode === '990901' ? '9909' : '9902'
                            form.isMedicine = form.typeCode === '990202' ? 1 : 0
                        } else {
                            form.isMedicine = this.maps[activeName].isMedicine
                        }
                    }

                    const params = Object.assign(
                        accountItem,
                        invoiceItem,
                        form
                    )
                    if (form.id) {
                        updateCatItem(params)
                            .then(res => {
                                if (res.STATUS === '1') {
                                    this.back(true)
                                    this.loading = false
                                    // this.handleSearch()
                                    this.$message.success('修改成功')
                                }
                            })
                            .catch(() => {
                                this.loading = false
                            })
                    } else {
                        params.id = 0

                        const databaseService = this.commonUtil.getConfigValue(
                            'databaseService'
                        )
                        const ipAddress = this.commonUtil.getConfigValue(
                            'ipDispose'
                        )
                        const databaseName = this.commonUtil.getConfigValue(
                            'databaseName'
                        )
                        const clinicId = this.$store.getters.clinic
                            .thirdPartyClinicId

                        if (!ipAddress || !databaseName || !clinicId) {
                            this.$confirm(
                                '该诊所未进行相关金舵手服务配置，是否继续保存药品?',
                                '提示',
                                {
                                    confirmButtonText: '是',
                                    cancelButtonText: '否',
                                    type: 'warning'
                                }
                            )
                                .then(() => {
                                    saveCatItem(params)
                                        .then(res => {
                                            if (res.STATUS === '1') {
                                                this.loading = false
                                                this.addSuccessCb()
                                                // this.handleSearch()
                                            }
                                        })
                                        .catch(() => {
                                            this.loading = false
                                        })
                                })
                                .catch(() => {
                                    this.loading = false
                                })
                        } else {
                            saveCatItem(params)
                                .then(res => {
                                    if (res.STATUS === '1') {
                                        this.loading = false
                                        // this.handleSearch()
                                        this.saveDrugD(
                                            res.ITEMS,
                                            databaseService,
                                            ipAddress,
                                            databaseName
                                        )
                                        this.addSuccessCb()
                                    }
                                })
                                .catch(() => {
                                    this.loading = false
                                })
                        }
                    }
                } else {
                    this.$message.error('检测到有必填项为空或者不符合输入要求')
                    window.scrollTo(0, 0)
                }
            })
        },

        // 新增成功回调
        addSuccessCb() {
            this.$confirm('新增成功，是否继续新增?', '提示', {
                confirmButtonText: '是',
                cancelButtonText: '否',
                type: 'warning'
            })
                .then(() => {
                    this.handleAdd()
                })
                .catch(() => {
                    this.back(true)
                })
        },

        // 收费项目保存动作 为医保接口统一目录
        saveDrugD(d, databaseService, ipAddress, databaseName) {
            let dosageId = null
            let ManufacturerId = null
            //  创建数据库连接对象
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                const conn = new ActiveXObject('ADODB.Connection')
                // 创建数据库连接对象
                // Server ip服务：需要配置
                // Data Source数据库服务:需要配置

                var connectionstring = `Provider=SQLOLEDB;Persist Security Info=False;Initial Catalog=${databaseName};Data Source=${ipAddress};User ID=H2O;Password=123456`
                conn.open(connectionstring)
                const dosage = conn.execute(d.selectFormNameSql)
                if (!dosage.EOF) {
                    dosageId = dosage.Fields(0).Value
                }

                const Manufacturer = conn.execute(d.selectManufacturerSql)
                if (!Manufacturer.EOF) {
                    ManufacturerId = Manufacturer.Fields(0).Value
                }

                const tempSql = d.insertDrugSql

                const sql =
                    dosageId === null
                        ? tempSql.replace(/'剂型id'/, dosageId)
                        : tempSql.replace(/剂型id/, dosageId)
                const resultSql =
                    ManufacturerId === null
                        ? sql.replace(/'生产厂家id'/, ManufacturerId)
                        : sql.replace(/生产厂家id/, ManufacturerId)
                // 打开连接
                try {
                    console.log(resultSql)
                    conn.Execute(resultSql)
                } catch (e) {
                    console.log(e)
                    conn.Close() // 关闭数据库链接
                }
            }
        }
    }
}
</script>

<style lang="scss">
.ci-conditions {
    .el-input {
        width: 48%;
    }
}
.ci-main {
    .active {
        > div {
            color: #409eff;
        }
    }
}
.ci-container {
    min-height: 32px;
    padding: 0 15px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    color: #606266;
    cursor: pointer;
    > span {
        &.placeholder {
            font-size: 14px;
            color: #c0c4cc;
        }
    }
}
.ci-footer {
    text-align: right;
}
.charge-item {
    .el-select-dropdown__item {
        height: auto;
        line-height: 28px;
    }
}
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
.basicDialog {
    .el-radio {
        width: 40%;
        margin: 5px;
        margin-left: 15px;
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
.otherclinicDia {
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    margin-top: -20px;
}
</style>

