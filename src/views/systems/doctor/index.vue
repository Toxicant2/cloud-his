<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <direct-search
                ref="form"
                :label-position="'right'"
                :label-width="'100px'"
                :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}"
                :forms="searchList"
                @handleSearch="handleSearch"/>
            <el-table-self
                :list-loading="listLoading"
                :tab-type="'index'"
                :tab-label="'序号'"
                :table-data="tabData"
                :columns="tabColumns"
                :total-count="total"
                :page-sizes="pageSizes"
                :page-size="pageSize"
                @pageSizeChange="handleSizeChange"
                @currentPageChange="handleCurrentChange"/>
            <dialog-form
                ref="audit"
                :width="'560px'"
                :title="'医生审核'"
                :form-data="auditData"
                :form-edit="auditEdit"
                @handleConfirm="handleConfirm"/>
        </el-row>
    </el-row>
</template>

<script>
    import {
        getStaffList
    } from '@/api/upms'
    import {
        getOrgOpts
    } from '@/api/org'
    import directSearch from '@/components/FormComponents/directSearch'
    import elTableSelf from '@/components/TabComponents/index'
    import dialogForm from '@/components/DialogComponents/Form'
    import paginationMixin from '@/components/TabComponents/mixin'
    export default {
        components: {
            directSearch,
            elTableSelf,
            dialogForm
        },
        mixins: [paginationMixin],
        data() {
            const orgList = []
            getOrgOpts().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            orgList.push({
                                value: item.id,
                                label: item.orgName
                            })
                        })
                    }
                }
            })
            return {
                listLoading: false,
                tabData: [],
                searchList: [
                    {
                        type: 'select',
                        label: '审核状态',
                        prop: 'checkedStatus',
                        placeholder: '请选择',
                        opts: [
                            {
                                value: '',
                                label: '全部'
                            }, {
                                value: 0,
                                label: '待审核'
                            }, {
                                value: 1,
                                label: '已审核'
                            }, {
                                value: 2,
                                label: '已拒绝'
                            }
                        ]
                    }, {
                        type: 'select',
                        label: '账号状态',
                        prop: 'is_use',
                        placeholder: '请选择',
                        opts: [
                            {
                                value: '',
                                label: '全部'
                            }, {
                                value: 1,
                                label: '启用'
                            }, {
                                value: 0,
                                label: '停用'
                            }
                        ]
                    }, {
                        type: 'input',
                        label: '',
                        prop: 'name',
                        placeholder: '请输入医生姓名',
                        labelWidth: '0',
                        slot: {
                            slot: 'append',
                            type: 'button',
                            icon: 'el-icon-search'
                        }
                    }
                ],
                tabColumns: [
                    {
                        value: 'realName',
                        label: '医生姓名',
                        align: 'center'
                    }, {
                        value: 'orgName',
                        label: '运行机构',
                        align: 'center'
                    }, {
                        value: 'code',
                        label: '医生代码',
                        align: 'center'
                    }, {
                        value: 'checkedStatus',
                        label: '审核状态',
                        align: 'center',
                        scope: true
                    }, {
                        value: 'is_use',
                        label: '启用状态',
                        align: 'center',
                        scope: true
                    }, {
                        value: 'checkNote',
                        label: '审核备注',
                        align: 'center',
                        width: 250
                    }, {
                        label: '操作',
                        fixed: 'right',
                        align: 'center',
                        width: 200,
                        operType: 'button',
                        operations: [
                            {
                                label: '审核',
                                type: 'primary',
                                func: this.handleAudit
                            }, {
                                label: '停用',
                                type: 'danger',
                                func: this.handleStatus
                            }
                        ]
                    }
                ],

                auditEdit: null,
                auditData: [
                    {
                        type: 'input',
                        name: '医生代码',
                        field: 'code'
                    }, {
                        type: 'input',
                        name: '医生姓名',
                        field: 'realName',
                        disabled: true
                    }, {
                        type: 'select',
                        name: '运营机构',
                        field: 'orgId',
                        opts: orgList
                    }, {
                        type: 'input',
                        inputType: 'textarea',
                        name: '审核备注',
                        field: 'checkedNote',
                        resize: 'none',
                        maxlength: '200',
                        placeholder: '最多输入200字',
                        autosize: { minRows: 4, maxRows: 8 }
                    }, {
                        type: 'radio',
                        name: '审核',
                        field: 'checkedStatus',
                        opts: [
                            {
                                value: '1',
                                label: '审核通过'
                            }, {
                                value: '2',
                                label: '拒绝通过'
                            }
                        ],
                        rules: [{ required: true, message: '是否审核通过必选' }]
                    }
                ]
            }
        },
        methods: {
            // 查询
            handleSearch(form) {
                const params = Object.assign({}, form)
                params.pageNo = this.pageIndex
                params.pageSize = this.pageSize
                getStaffList(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.tabData = d.list
                        this.total = d.totalRecord
                    }
                })
            },

            // 点击审核
            handleAudit(row) {
                this.$refs.audit.open()
            },

            // 保存审核
            handleConfirm() {
                this.$refs.audit.close()
            }
        },
        mounted() {
            this.handleSearch()
        }
    }
</script>

<style>

</style>
