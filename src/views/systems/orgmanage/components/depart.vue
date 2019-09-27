<template>
  <el-row>
    <direct-search ref="form" :label-position="'right'" :forms="searchList" :label-width="'100px'" @handleSearch="handleSearchFun" />
    <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" :current-page="pageIndex" />
    <dialog-form ref="edit" :width="'450px'" :title="orgTitle" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
  </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'
import { getDepartmentList, addDepartment, updateDepartment,updateDepartmentStatus } from '@/api/org'
import { getDictById } from '@/api/catalog'
// import { getDictType } from '@/api/mqmc-catalog.js'
import { param, param2Obj } from '@/utils'

export default {
    props: {
        orgId: { type: Number },
        isCheckOut: { type: Number },
        departOPts: { type: Array }
    },
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        paginationMixin
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
            total: 0,
            listLoading: false,
            orgTitle: '',
            cacheForm: {},
            formEdit: {},
            departNameList: [],
            tabData: [],
            formData: [
                {
                    type: 'select',
                    name: '名称',
                    field: 'name',
                    opts: dictData[524],
                    func: this.changeDeptName,
                    rules: [{ required: true, message: '名称必填' }]
                },
                {
                    type: 'input',
                    name: '编码',
                    field: 'code',
                    disabled: true,
                    placeholder: '请输入编码',
                    rules: [{ required: true, message: '编码必填' }]
                },
                {
                    type: 'select',
                    name: '属性',
                    field: 'property',
                    opts: propertyList,
                    rules: [{ required: true, message: '属性必填' }]
                }
            ],
            searchList: [
                {
                    type: 'input',
                    prop: 'name',
                    label: '科室',
                    placeholder: '请输入科室',
                    labelWidth: '80px'
                },
                {
                    type: 'button',
                    value: '查询',
                    color: 'primary',
                    labelWidth: '1px',
                    func: this.handleSearchFun
                },
                {
                    type: 'button',
                    value: '新增',
                    color: 'primary',
                    labelWidth: '1px',
                    func: this.handleAdd
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
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleStop,
                            formatter(row) {
                                return {
                                    label: row.isUse === 1 ? '停用' : '启用',
                                    type: row.isUse === 1 ? 'danger' : 'primary'
                                }
                            }
                        },
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        }
                    ]
                }
            ]
        }
    },
    watch: {
        orgId(val) {
            this.$refs.form.initforms({name:''})
            this.handleSearchFun({name:''})
        }
    },
    methods: {
    // 新增科室
        handleAdd() {
            if (!this.orgId) {
                this.$message.warning('请先选择诊所')
                return false
            }
            if (this.isCheckOut === 0) {
                this.$message.warning('请先审核通过，再使用该功能')
                return false
            }
            this.formEdit = {}
            this.orgTitle = '新增科室'
            this.$refs.edit.open()
        },
        // 查询科室
        handleSearchFun(form) {
            if (!this.orgId) {
                this.$message.warning('请先选择诊所')
                return false
            }
            this.cacheForm = this.cacheForm  ||  form
            this.pageIndex = 1
            this.handleSearch()
        },
        // 启用/停用科室
        handleStop(row) {
            const str = row.isUse === 1 ? '停用' : '启用'
            this.$confirm(`确定${str}吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    this.orgDepartSwitch(row)
                })
                .catch(() => {})
        },
        // 删除科室
        handleDel(row) {
            this.$confirm('确定删除吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    this.orgDepartDel(row.id)
                })
                .catch(() => {})
        },
        // 编辑科室
        handleEdit(row) {
            this.orgTitle = '编辑科室'
            const name = param({
                label: row.name,
                value: row.code
            })
            this.formEdit = {
                code: row.code,
                orgId: row.orgId,
                id: row.id,
                name,
                property: row.property
            }
            this.$refs.edit.open()
        },
        // 保存
        handleConfirm(form) {
            form.name = param2Obj(form.name).label
            if (this.orgTitle === '新增科室') {
                this.orgDepartAdd(form)
            } else {
                // 编辑
                this.orgDepartUpdate(form)
            }
        },
        changeDeptName(form) {
            const data = param2Obj(form)
            this.$refs.edit.initFields({ code: data.value })
        },
        // 获取科室列表接口
        handleSearch() {
            if (this.isCheckOut === 0) {
                this.$message.warning('请先审核通过，再使用该功能')
                return false
            }
            const params = {}
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            // params.name = this.cacheForm.name
            params.orgId = this.orgId
            this.listLoading = true
            getDepartmentList(params).then(res => {
                this.listLoading = false
                if (res.STATUS === '1') {
                    const records = res.ITEMS.records
                    this.tabData = records
                    this.total = res.ITEMS.total
                }
            })
        },
        // 停用、启用接口
        orgDepartSwitch(data) {
            updateDepartmentStatus(data.id).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.handleSearch()
                }
            })
        },
        // 新增科室接口
        orgDepartAdd(data) {
            const params = Object.assign({}, data, { orgId: this.orgId })
            addDepartment(params).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.handleSearch()
                    this.$refs.edit.close()
                }
            }).catch(() =>{
                this.$refs.edit.loading = false
            })
        },
        // 编辑科室接口
        orgDepartUpdate(data) {
            updateDepartment(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.handleSearch()
                    this.$refs.edit.close()
                }
            }).catch(() =>{
                this.$refs.edit.loading = false
            })
        }
    },
    created() {
        if (this.orgId && this.isCheckOut !== 0) {
            this.handleSearchFun()
        }
    }
}
</script>

<style scoped lang='scss'>
</style>

