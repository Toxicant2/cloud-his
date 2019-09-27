<template>
    <el-row>
        <el-row v-if="mainIndex">
            <direct-search ref="form" :label-position="'center'" :label-width="'100px'" :form-style="{'text-align':'left','float':'left', 'margin':'10px 0px'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-button class="btn" type="primary" icon="el-icon-plus" @click="handleAdd">新增调价单</el-button>
            <el-table-self :current-page="pageIndex" :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
        </el-row>
        <el-row v-else>
            <adjust-detail ref="adjust" :adjust-type="type" :adjust-id="adjustId" :adjustTypeList="dictMap[491]" @back="mainIndex = true" @confirm="handleConfirmCb"></adjust-detail>
        </el-row>
    </el-row>
</template>

<script>
import {
    getDictByIdList,
    getSkAdjustList,
    deleteSkAdjust
} from '@/api/catalog'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'

import adjustDetail from './detail'

import { pickerOptions, formatDictMap } from '@/utils'
export default {
    components: {
        directSearch,
        elTableSelf,
        adjustDetail
    },
    mixins: [paginationMixin],
    props: {
        activeName: {
            type: String,
            default: ''
        }
    },
    data() {
        const dictMap = {
            491: [], // 调价类型
            '491_all': [{ value: '', label: '全部' }]
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
                        const obj = {
                            value: item.code,
                            label: item.name,
                            disabled: item.code !== '02'
                        }
                        if (item.dictId === 491) {
                            dictMap['491_all'].push(obj)
                        }
                        dictMap[item.dictId].push(obj)
                    })
                }
            }
        })
        var btnList = [{ func: this.handleDetail, label: '详情', type: 'primary' }]
        var btnMoreList = [{ func: this.handleUpdate, label: '修改', type: 'primary' }, { func: this.handleAute, label: '审核', type: 'success' }, { func: this.handleDelete, label: '删除', type: 'danger' }]
        return {
            dictMap,
            mainIndex: true,
            adjustId: 0,
            type: '',
            listLoading: false,
            searchList: [
                {
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '调价日期',
                    prop: 'dates',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                }, {
                    type: 'select',
                    label: '调价类型',
                    prop: 'adjustType',
                    opts: dictMap['491_all']
                }, {
                    type: 'input',
                    label: '',
                    labelWidth: '0',
                    prop: 'priceAdjustNumber',
                    placeholder: '调价单号',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            tabColumns: [
                {
                    label: '调价单号',
                    value: 'priceAdjustNumber'
                }, {
                    label: '调价日期',
                    value: 'createTime',
                    width: '150px'
                }, {
                    label: '调价方式',
                    formatter(row) {
                        return formatDictMap(dictMap[491], row.adjustType)
                    }
                }, {
                    label: '制单人',
                    value: 'createUserName'
                }, {
                    label: '审核人',
                    value: 'checkUserName'
                }, {
                    label: '状态',
                    formatter(row) {
                        if (row.priceAdjustStatus === 0) {
                            return '未确认'
                        } else {
                            return '已确认'
                        }
                    }
                }, {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 280,
                    operType: 'button',
                    operations: {
                        formatter(row) {
                            return row.priceAdjustStatus === 0 ? btnMoreList : btnList
                        }
                    }
                }
            ],
            tabData: [],
            cacheForm: {}
        }
    },
    watch: {
        mainIndex(newVal) {
            if (!newVal) {
                this.$nextTick(() => {
                    this.$refs.adjust.initCp()
                })
            }
        }
    },
    methods: {
        // 缓存查询条件
        handleFormSearch(form) {
            this.pageIndex = 0
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            this.listLoading = true
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            const data = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize
            }
            for (const key in params) {
                if (key === 'dates') {
                    if (params[key] && params[key].length > 0) {
                        data.startDate = params[key][0]
                        data.endDate = params[key][1]
                    }
                    continue
                }
                if (params[key]) {
                    data[key] = params[key]
                }
            }
            getSkAdjustList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let result = []
                    if (d.total > 0) {
                        result = d.records
                    }
                    this.total = d.total
                    this.tabData = result
                    this.listLoading = false
                }
            })
        },

        // 新增调价单
        handleAdd() {
            this.mainIndex = false
            this.adjustId = 0
            this.type = 'add'
        },

        // 修改
        handleUpdate(row) {
            this.mainIndex = false
            this.adjustId = row.id
            this.type = 'edit'
        },

        // 审核
        handleAute(row) {
            this.mainIndex = false
            this.adjustId = row.id
            this.type = 'audit'
        },

        // 详情
        handleDetail(row) {
            this.mainIndex = false
            this.adjustId = row.id
            this.type = 'detail'
        },

        // 删除
        handleDelete(row) {
            this.$confirm('确认删除？', '提示', {
                type: 'warning'
            }).then(() => {
                deleteSkAdjust(row.id).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('删除成功')
                        this.handleSearch()
                    }
                })
            }).catch(() => {

            })
        },

        // 成功回调
        handleConfirmCb(type) {
            let msg = ''
            switch (type) {
                case 'add':
                    msg = '新增成功'
                    break
                case 'edit':
                    msg = '修改成功'
                    break
                case 'audit':
                    msg = '审核成功'
                    break
                default:
                    break
            }
            this.$message.success(msg)
            this.mainIndex = true
            this.handleFormSearch()
        }
    },
    mounted() {
        if (this.activeName === 'pricingDetail') {
            this.handleFormSearch()
        }
    }
}
</script>

<style lang="scss" scoped>
.btn {
    float: left;
    margin: 10px 20px;
}
</style>