<template>
  <el-row class="page-container">
    <el-row class="page-main">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增科室</el-button>
      <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
      <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
      <dialog-form ref="edit" :width="'680px'" :count-line="12" :title="departmentTitle" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
    </el-row>
  </el-row>
</template>

<script>
import {
    addDepartment,
    updateDepartment,
    getDepartmentList,
    updateDepartmentStatus,
    getOrgOpts
} from '@/api/org'
import { getDictById } from '@/api/catalog'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'
import { param, param2Obj } from '@/utils'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm
    },
    mixins: [paginationMixin],
    data() {
        const dictData = this.$store.getters.dictData
        const propertyList = []
        const data = { dictId: 133 }
        getDictById(data).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS.records
                d.forEach(item => {
                    propertyList.push({
                        value: item.name,
                        label: item.name
                    })
                })
            }
        })

        return {
            listLoading: false,
            departmentTitle: '',
            tabData: [],
            searchList: [
                // {
                //     type: 'select',
                //     label: '运营机构',
                //     prop: 'orgId',
                //     placeholder: '请选择',
                //     opts: orgOptList
                // },
                {
                    type: 'select',
                    label: '状态',
                    prop: 'isUse',
                    placeholder: '请选择',
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
                    placeholder: '请输入编号/名称',
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
                    value: 'code',
                    label: '科室编号',
                    align: 'center'
                },
                {
                    value: 'name',
                    label: '科室名称',
                    align: 'center'
                },
                {
                    value: 'property',
                    label: '科室属性',
                    align: 'center'
                },
                {
                    value: 'sort',
                    label: '显示顺序',
                    align: 'center',
                    sortable: true
                },
                {
                    value: 'introduction',
                    label: '说明',
                    align: 'center'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        },
                        {
                            func: this.handleStatus,
                            formatter(row) {
                                return {
                                    label: row.isUse === 1 ? '停用' : '启用',
                                    type: row.isUse === 1 ? 'danger' : 'primary'
                                }
                            }
                        }
                    ]
                }
            ],

            formEdit: null,
            formData: [
                // {
                //     type: 'input',
                //     name: '科室编号',
                //     field: 'code',
                //     rules: [{ required: true, message: '科室编号必填', trigger: 'blur' }]
                // },
                {
                    type: 'select',
                    name: '科室名称',
                    field: 'deptStr',
                    rules: [{ required: true, message: '科室名称必填', trigger: 'blur' }],
                    opts: dictData[524]
                },
                {
                    type: 'select',
                    name: '科室属性',
                    field: 'property',
                    opts: propertyList,
                    rules: [{ required: true, message: '科室属性必填' }]
                },
                {
                    type: 'number',
                    name: '显示顺序',
                    min: 1,
                    field: 'sort',
                    rules: [{ required: true, message: '显示顺序必填', trigger: 'blur' }]
                },
                // {
                //     type: 'select',
                //     name: '运营机构',
                //     field: 'org',
                //     opts: orgList,
                //     rules: [{ required: true, message: '运营机构必填' }],
                //     spanCount: 24
                // },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '说明',
                    field: 'introduction',
                    resize: 'none',
                    autosize: { minRows: 4, maxRows: 8 },
                    spanCount: 24
                }
            ],
            cacheForm: {}
        }
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            getDepartmentList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tabData = d.records
                    this.total = d.total
                }
            })
        },

        // 新增
        handleAdd() {
            this.formEdit = null
            this.departmentTitle = '新增科室'
            this.$refs.edit.open()
        },

        // 编辑
        handleEdit(row) {
            this.formEdit = {
                id: row.id,
                code: row.code,
                property: row.property ? row.property : '',
                sort: row.sort,
                introduction: row.introduction,
                name: row.name,
                deptStr: param({
                    label: row.name,
                    value: row.code
                })
            }

            this.departmentTitle = '编辑科室'
            this.$refs.edit.open()
        },

        // 修改停用启用状态
        handleStatus(row) {
            const txt = `确认将${row.name}改为${row.isUse === 1 ? '停用' : '启用'}状态？`
            this.$confirm(txt, '提示', {
                type: 'warning'
            })
                .then(() => {
                    updateDepartmentStatus(row.id).then(res => {
                        this.successCallback(res, '状态修改成功')
                    })
                })
                .catch(() => {})
        },

        // 保存
        handleConfirm(form) {
            const org = {
                orgId: this.$store.getters.clinic.orgId,
                orgName: this.$store.getters.clinic.orgName,
                areaCode: this.$store.getters.clinic.areaCode
            }
            const obj = {
                id: form.id || 0,
                name: param2Obj(form.deptStr).label,
                code: param2Obj(form.deptStr).value,
                introduction: form.introduction,
                property: form.property,
                sort: form.sort
            }
            const params = Object.assign(org, obj)
            if (params.id) {
                updateDepartment(params)
                    .then(res => {
                        this.successCallback(res, '编辑成功')
                    })
                    .catch(() => {
                        this.$refs.edit.loading = false
                    })
            } else {
                addDepartment(params)
                    .then(res => {
                        this.successCallback(res, '新增成功')
                    })
                    .catch(() => {
                        this.$refs.edit.loading = false
                    })
            }
        },

        // 保存成功
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$message.success(msg)
                this.$refs.edit.close()
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>
