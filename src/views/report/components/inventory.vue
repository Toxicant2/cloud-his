<template>
    <el-row>
        <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','margin':'10px 0px'}" :forms="searchList"  @handleSearch="handleSearch" />

        <report-header :org-name="orgName" :tab-title="tableTitle" @print="_handlePrint" @export="handleExportExcel"/>

        <el-table-self :getSummaries="getSummaries" :tab-type="'index'" :tab-label="'序号'" :show-summary="true" :current-page="pageIndex" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" @handleSearch="handleSearch" />
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { exportNowStorage, getDrugProjectList } from '@/api/statement'
import { getOrgOpts } from '@/api/org'

import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import reportHeader from '../common/ReportHeader'

import { getTotalRow, getTabTotalRow, handlePrint } from '../common/index.js'

import { formatDictMap } from '@/utils'
import { multiply, toFixed } from '@/utils/float'
import { exportExcelCb } from '@/utils/exportExcel'

import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        elTableSelf,
        reportHeader
    },
    mixins: [paginationMixin],
    data() {
        const dictMap = {
            489: [{ value: '', label: '全部' }] // 西药/中成药处方类型
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
                        dictMap[item.dictId].push({
                            value: item.code,
                            label: item.name
                        })
                    })
                }
            }
        })
        // 机构
        const orgOptList = []
        getOrgOpts({ type: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    orgOptList.push({
                        value: item.id,
                        label: item.name
                    })
                })
            }
        })
        return {
            dictMap,
            orgName: '',
            orgOptList,
            listLoading: false,
            cacheForm: {},
            total: {},
            tableTitle: '当前库存报表',
            searchList: [
                {
                    type: 'select',
                    label: '运营机构',
                    prop: 'orgId',
                    hidden: true,
                    placeholder: '请选择',
                    opts: orgOptList
                }, {
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
                }, {
                    type: 'select',
                    prop: 'catType',
                    label: '药品类型',
                    placeholder: '药品类型',
                    opts: dictMap[489]
                }
            ],
            tabColumns: [
                {
                    value: 'catCode',
                    label: '编码'
                }, {
                    value: 'catName',
                    label: '名称'
                }, {
                    value: 'spec',
                    label: '规格'
                }, {
                    value: 'catType',
                    label: '类型'
                }, {
                    value: 'unit',
                    label: '单位'
                }, {
                    value: 'isTiny',
                    label: '是否拆零',
                    width: 100
                }, {
                    value: 'manufacturerName',
                    label: '厂家/产地',
                    width: 230
                }, {
                    value: 'qty',
                    label: '库存数量'
                }, {
                    value: 'purchasePriceAmt',
                    label: '进价金额',
                    width: 100,
                    formatter(row) {
                        return toFixed(row.purchasePriceAmt)
                    },
                    count: true
                }, {
                    value: 'price',
                    label: '零售价',
                    width: 100
                }, {
                    value: 'retailPriceAmt',
                    label: '零售金额',
                    width: 100,
                    formatter(row) {
                        return toFixed(row.retailPriceAmt)
                    },
                    count: true
                }
            ],
            tabData: []
        }
    },
    computed: {
        ...mapGetters([
            'clinic'
        ])
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    methods: {
        // 初始化组件
        handleInitCp() {
            this.cacheForm = {}
            this.handleSearch()
        },

        // 导出表格
        handleExportExcel() {
            // import('@/utils/Export2Excel').then(excel => {
            //     const header = []
            //     const filterVal = []
            //     this.tabColumns.forEach(item => {
            //         header.push(item.label)
            //         filterVal.push(item.value)
            //     })
            //     const list = this.tabData
            //     const data = this.formatJson(filterVal, list)
            //     excel.export_json_to_excel({
            //         header,
            //         data,
            //         filename: '当前库存',
            //         autoWidth: true,
            //         bookType: 'xlsx'
            //     })
            // })
            if (this.cacheForm.pageNo) {
                delete this.cacheForm.pageNo
                delete this.cacheForm.pageSize
            }
            exportNowStorage(this.cacheForm, 'blob').then(res => {
                exportExcelCb(res, '当前库存.xlsx')
            })
        },

        // 处理数据
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                return v[j]
            }))
        },

        // 查询
        handleSearch(form) {
            this.listLoading = true
            const clinic = this.clinic

            if (clinic.isClinicCenter) {
                this.searchList[0].hidden = false
            }

            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)

            this.$refs.form.initforms(params)
            if (form && form.orgId) {
                const list = this.orgOptList
                list.forEach(org => {
                    if (org.value === form.orgId) {
                        this.orgName = org.label
                    }
                })
            } else {
                this.orgName = this.clinic.orgName
            }
            getDrugProjectList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS || []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.catType = formatDictMap(this.dictMap[489], item.catType)
                            if (item.isTiny === 1) {
                                // 进价
                                item.purchasePrice = multiply(item.purchasePrice, item.coefficient, 4)
                                // 零售价
                                item.retailPrice = multiply(item.retailPrice, item.coefficient, 4)
                                // 库存大单位
                                const bigUnit = item.qty && item.coefficient ? `${parseInt(item.qty / item.coefficient)}${item.specUnit || ''}` : ''

                                // 库存小单位
                                const smallUnit = item.qty && item.coefficient ? (item.qty % item.coefficient ? `${parseInt(item.qty % item.coefficient)}${item.specUseUnit || ''}` : '') : ''
                                item.qty = bigUnit + smallUnit
                                item.isTiny = '是'
                            } else {
                                item.purchasePrice = toFixed(item.purchasePrice, 4)
                                item.qty = item.specUnit ? `${item.qty}${item.specUnit}` : item.qty
                                item.isTiny = '否'
                            }
                        })
                    }
                    this.tabData = d
                    this.listLoading = false
                    this.total = getTotalRow(this.tabColumns, d)
                }
            })
        },

        // 合计行
        getSummaries(param) {
            return getTabTotalRow(param, this.tabColumns, 1)
        },

        // 打印
        _handlePrint() {
            handlePrint({
                columns: this.tabColumns,
                data: this.tabData,
                total: this.total,
                orgName: this.orgName,
                title: '当前库存报表'
            })
        }
    }
}
</script>

