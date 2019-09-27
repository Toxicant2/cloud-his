<template>
    <el-row class="page-container">
        <el-row class="page-main equipment"  v-if="showIndex">
            <el-col class="first-content">
                <template v-for="(item,index) in firstInfoList">
                        <el-col class="first-content-item" :key="index" :style="item.style">
                            <template v-for="(itemObj,indexObj) in item.list">
                                <el-col class="part" :key="indexObj" :style="item.itemStyle">
                                    <el-col class="content">{{ itemObj.value }} <font style="color:#6D7278;font-size:14px">{{ itemObj.unit }}</font></el-col>
                                    <el-col class="describe">{{ itemObj.label }}</el-col>
                                </el-col>
                            </template>
                        </el-col>
                </template>
            </el-col>
            <el-col>
                <direct-search ref="form" :label-position="'center'" :label-width="'85px'" :form-style="{'text-align':'left'}" :forms="searchList" @handleSearch="handleFormSearch"/>
            </el-col>
            <el-col>
                <el-table-self :columns="columns"  :cell-style="cellStyle"  :list-loading="listLoading"  :table-data="dataList"
                    :total-count="total" :page-sizes="pageSizes" :page-size="pageSize"
                    :tab-type="'index'"
                    :tab-label="'序号'"
                    @pageSizeChange="handleSizeChange"
                    @currentPageChange="handleCurrentChange"
                />
            </el-col>
        </el-row>
        <el-row v-else>
            <equipment-detail :id="id" @back="showIndex = true"></equipment-detail>
        </el-row>
    </el-row>
</template>

<script>
    import { getTemptoolmanageList, getStatistics } from '@/api/arclinic'
    import directSearch from '@/components/FormComponents/directSearch'
    import elTableSelf from '@/components/TabComponents/index'
    import paginationMixin from '@/components/TabComponents/mixin'
    import { getBabyAge } from '@/utils'
    import { deepClone } from '../../../utils'

import equipmentDetail from './detail'

    export default {
        components: {
            directSearch,
            elTableSelf,
            equipmentDetail
        },
        mixins: [paginationMixin],
        data() {
            return {
                getBabyAge,
                showIndex: true,
                listLoading: false,
                cacheForm: {},
                firstInfoList: [
                    {
                        list: [
                            { label: '设备数量', value: 0, unit: '台' },
                            { label: '启用数量', value: 0, unit: '台' },
                            { label: '未启用数量', value: 0, unit: '台' }
                        ],
                        style: 'width:60%',
                        itemStyle: 'width:20%'
                    },
                    {
                        list: [
                            { label: '累积测温时长', value: 0, unit: '时' },
                            { label: '累积测温次数', value: 0, unit: '次' }
                        ],
                        style: 'width:40%',
                        itemStyle: 'float:right;width:30%'
                    }
                ],
                searchList: [
                    {
                        type: 'select',
                        label: '保障状态',
                        opts: [{ label: '生效中', value: '1' }, { label: '已过期', value: '0' }],
                        prop: 'state'
                    },
                    {
                        type: 'input',
                        label: '',
                        labelWidth: '80',
                        placeholder: '姓名/联系方式/mac地址',
                        prop: 'condition',
                        slot: {
                            slot: 'append',
                            type: 'button',
                            icon: 'el-icon-search'
                        }
                    }
                    // {
                    //     type: "button",
                    //     labelWidth:'0',
                    //     itemStyle:'float:right',
                    //     color:'primary',
                    //     value: "设备导入",
                    // },
                    // {
                    //     type: "button",
                    //     itemStyle:'float:right',
                    //     color:'success',
                    //     labelWidth:'0',
                    //     value: "导出",
                    // }
                ],
                columns: [
                    {
                        value: 'code',
                        label: '设备编号'
                    },
                    {
                        value: 'name',
                        label: '设备名称'
                    },
                    {
                        value: 'patientName',
                        label: '宝宝姓名'
                    },
                    {
                        value: 'latelyDate',
                        sortable: true,
                        label: '最近使用'
                    },
                    {
                        complex: true,
                        label: '累积使用',
                        list: [
                            {
                                value: 'useCount',
                                width: '90px',
                                sortable: true,
                                label: '次数',
                                formatter(row) {
                                    return row.useCount + '次'
                                }
                            }, {
                                value: 'useTime',
                                width: '90px',
                                sortable: true,
                                label: '时长'
                            }
                        ]
                    },
                    {
                        complex: true,
                        label: '监测保障',
                        list: [
                            {
                                value: 'status',
                                width: '90px',
                                label: '状态',
                                formatter(row) {
                                    return row.status == '1' ? '生效中' : '已过期'
                                }
                            }, {
                                value: 'security',
                                width: '90px',
                                label: '已保障',
                                formatter(row) {
                                    return row.security + '天'
                                }
                            }, {
                                value: 'validityDate',
                                width: '140px',
                                sortable: true,
                                label: '有效期'
                            }
                        ]
                    },
                    {
                        label: '操作',
                        fixed: 'right',
                        align: 'center',
                        width: 80,
                        operType: 'button',
                        operations: [
                            {
                                label: '查看',
                                type: 'primary',
                                func: this.viewDetail
                            }
                        ]
                    }
                ],
                dataList: [],
                total: 0
            }
        },
        watch: {
            showIndex() {
                this.handleSearch()
            }
        },
        methods: {
            // 查看详情
            viewDetail(row) {
                this.showIndex = false
                this.id = row.id
            },

            cellStyle({ row, column, rowIndex, columnIndex }) {
                if (columnIndex == 3) {
                    return { color: '#409EFF', cursor: 'pointer' }
                }
            },

            handleFormSearch(form) {
                this.pageIndex = 1
                this.handleSearch(form)
            },

            // 查询列表
            handleSearch(form) {
                this.cacheForm = this.cacheForm || form
                const temp_params = Object.assign(this.cacheForm, form)
                const params = deepClone(temp_params)
                // this.$refs.form.initforms(params)
                this.$nextTick(() => {
                    params.pageNo = this.pageIndex
                    params.pageSize = this.pageSize
                    // 调用接口
                    getTemptoolmanageList(params).then(res => {
                        if (res.STATUS === '1') {
                            const d = res.ITEMS
                            this.dataList = d.list
                            this.total = d.totalRecord
                        }
                    })

                    getStatistics().then(res => {
                        if (res.STATUS == '1') {
                            const d = res.ITEMS
                            this.firstInfoList[0].list[0].value = d.count
                            this.firstInfoList[0].list[1].value = d.onCount
                            this.firstInfoList[0].list[2].value = d.offCount
                            this.firstInfoList[1].list[1].value = d.useCount
                            this.firstInfoList[1].list[0].value = d.useTime ? d.useTime : 0
                        }
                    })
                })
            }
        },

        mounted() {
            this.handleSearch()
        }
    }
</script>

<style lang="scss" scoped>
.first-content{
    border-bottom:1px solid #e6e6e6;
    padding-bottom:10px;
    margin-bottom:15px;
    .first-content-item{
        .part{
            text-align:center;
            .content{
                margin:12px 0;
                font-weight:bold;
                text-align:center;
                font-size:22px;
            }
            .describe{
                margin:5px 0;
                text-align:center;
                font-size:14px;
            }
        }
    }
}
</style>