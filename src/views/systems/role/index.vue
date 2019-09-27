<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-button type="primary" icon="el-icon-plus" @click="addRole">新增角色</el-button>
            <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" />
            <role-tree ref="role" :title="title" :width="'688px'" :form-data="formData" :form-edit="formEdit" @handleConfirm="saveRole" />
        </el-row>
    </el-row>
</template>

<script>
import { getRoleList, addRole, updateRole, deleteRole } from '@/api/upms'
import { getOrgOpts } from '@/api/org'
import directSearch from '@/components/FormComponents/directSearch'
import roleTree from '@/components/DialogComponents/RoleTree'
import elTableSelf from '@/components/TabComponents/index'
export default {
    components: {
        roleTree,
        elTableSelf,
        directSearch
    },
    data() {
        const dictData = this.$store.getters.dictData
        const orgList = []
        getOrgOpts().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        orgList.push({
                            value: item.id,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            tabData: [],
            searchList: [
                {
                    type: 'select',
                    label: '机构名称',
                    prop: 'orgId',
                    placeholder: '请选择',
                    opts: orgList
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'roleName',
                    placeholder: '请输入角色名称',
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
                    value: 'name',
                    label: '角色名称'
                },
                {
                    value: 'count',
                    label: '用户个数'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 250,
                    operType: 'button',
                    operations: [
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        },
                        {
                            func: this.handleDelete,
                            formatter(row) {
                                return {
                                    label: '删除',
                                    type: 'danger',
                                    disabled: row.count > 0
                                }
                            }
                        }
                    ]
                }
            ],
            listLoading: false,

            title: '',
            formData: [
                {
                    type: 'select',
                    name: '机构名称',
                    field: 'orgId',
                    placeholder: '请选择',
                    opts: orgList,
                    rules: [{ required: true, message: '机构名称必填' }]
                },
                {
                    type: 'input',
                    name: '角色名称',
                    field: 'name',
                    rules: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
                },
                {
                    type: 'select',
                    name: '角色等级',
                    field: 'level',
                    rules: [{ required: true, message: '角色等级必填', trigger: 'blur' }],
                    opts: dictData[527]
                },
                {
                    type: 'tree',
                    name: '角色权限'
                }
            ],
            formEdit: null,
            cacheForm: {}
        }
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        handleFormSearch(form) {
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            this.listLoading = true
            this.cacheForm = form || this.cacheForm
            const params = Object.assign(this.cacheForm, form)
            params.menuFlag = 1
            getRoleList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tabData = d
                    this.listLoading = false
                }
            })
        },

        // 新增
        addRole() {
            this.title = '新增'
            this.formData[0].disabled = false
            this.formEdit = {
                id: 0,
                name: '',
                menuIdList: []
            }
            this.$refs.role.open()
        },

        // 编辑
        handleEdit(row) {
            this.title = '编辑'
            this.formData[0].disabled = true
            const menuIdList = []
            if (row.menuList && row.menuList.length > 0) {
                row.menuList.forEach(item => {
                    if (item.parentId > 0) {
                        menuIdList.push(item.id)
                    }
                })
            }
            this.formEdit = {
                id: row.id,
                name: row.name,
                orgId: row.orgId,
                level: String(row.level),
                menuIdList
            }
            this.$refs.role.open()
        },

        // 删除
        handleDelete(row) {
            this.$confirm('是否确认删除角色?', '系统提示', {
                type: 'warning'
            })
                .then(() => {
                    deleteRole(row.id).then(res => {
                        this.successCallback(res, '角色删除成功！')
                    })
                })
                .catch(() => {})
        },

        // 保存
        saveRole(form) {
            if (form.id) {
                updateRole(form).then(res => {
                    this.successCallback(res, '角色修改成功！')
                })
            } else {
                addRole(form).then(res => {
                    this.successCallback(res, '角色新增成功！')
                })
            }
        },

        // 角色保存成功提醒
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$refs.role.close()
                this.$message.success(msg)
            }
        }
    }
}
</script>
