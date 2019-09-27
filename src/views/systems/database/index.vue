<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <direct-search ref="form" :label-position="'right'" :label-width="'120px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleInitSearch" />
            <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
            <dialog-form ref="create" :title="'生成配置'" :form-data="createData" :form-edit="createEdit" @handleConfirm="handleConfirm" />
        </el-row>
    </el-row>
</template>

<script>
    import {
        getDBTablePage,
        createCode
    } from '@/api/codegen'
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
            return {
                listLoading: false,
                tabData: [],
                searchList: [
                    {
                        type: 'input',
                        label: '',
                        prop: 'tableName',
                        placeholder: '表名称',
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
                        value: 'tableName',
                        label: '表名称'
                    }, {
                        value: 'tableComment',
                        label: '表注释'
                    }, {
                        value: 'engine',
                        label: '索引'
                    }, {
                        value: 'createTime',
                        label: '创建时间'
                    }, {
                        label: '操作',
                        fixed: 'right',
                        align: 'center',
                        width: 150,
                        operType: 'button',
                        operations: [
                            {
                                label: '生成',
                                icon: 'el-icon-check',
                                func: this.handleCreate
                            }
                        ]
                    }
                ],

                createEdit: null,
                createData: [
                    {
                        type: 'input',
                        name: '表名称',
                        field: 'tableName',
                        disabled: true
                    }, {
                        type: 'input',
                        name: '包名',
                        field: 'packageName',
                        disabled: true
                    }, {
                        type: 'input',
                        name: '作者',
                        field: 'author',
                        placeholder: '可为空，加载系统默认配置'
                    }, {
                        type: 'input',
                        name: '模块',
                        field: 'moduleName',
                        placeholder: '可为空，加载系统默认配置'
                    }, {
                        type: 'input',
                        name: '表前缀',
                        field: 'tablePrefix',
                        placeholder: '可为空，加载系统默认配置'
                    }, {
                        type: 'input',
                        name: '表注释',
                        field: 'comments',
                        placeholder: '可为空，加载表备注'
                    }
                ],
                cacheForm: {}
            }
        },
        methods: {
            // 表单查询
            handleInitSearch(form) {
                this.pageIndex = 1
                this.handleSearch(form)
            },

            // 查询
            handleSearch(form) {
                this.cacheForm = this.cacheForm || form
                const params = Object.assign(this.cacheForm, form)
                params.pageNo = this.pageIndex
                params.pageSize = this.pageSize
                getDBTablePage(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.tabData = d.records
                        this.total = d.total
                    }
                })
            },

            // 生成
            handleCreate(row) {
                this.createEdit = {
                    tableName: row.tableName,
                    packageName: 'org.simq'
                }
                this.$refs.create.open()
            },

            // 生成配置确认
            handleConfirm(form) {
                createCode(form, 'arraybuffer').then(res => {
                    const content = res
                    const blob = new Blob([content], { type: 'application/zip' })
                    const fileName = form.tableName + '.zip'
                    if ('download' in document.createElement('a')) { // 非IE下载
                        const elink = document.createElement('a')
                        elink.download = fileName
                        elink.style.display = 'none'
                        elink.href = URL.createObjectURL(blob)
                        document.body.appendChild(elink)
                        elink.click()
                        URL.revokeObjectURL(elink.href) // 释放URL 对象
                        document.body.removeChild(elink)
                    } else { // IE10+下载
                        navigator.msSaveBlob(blob, fileName)
                    }
                    this.$refs.create.close()
                })
            }
        },
        mounted() {
            this.handleSearch()
        }
    }
</script>

<style>
</style>
