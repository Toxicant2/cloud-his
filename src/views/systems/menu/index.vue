<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-row style="margin:10px;">
                <el-button type="primary" icon="el-icon-plus" style="float:right;" @click="addMenu">新增一级菜单</el-button>
            </el-row>
            <tree-table :list-loading="listLoading" :data="tabData" :eval-func="func" :columns="tabColumns" :expand-all="expandAll" border>
                <el-table-column label="操作" width="250" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="handleAddChild(scope.row)">新增</el-button>
                        <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </tree-table>
            <dialog-form ref="menu" :title="title" :count-line="12" :form-data="menuData" :form-edit="menuEdit" width="680px" @handleConfirm="handleConfirm" />
        </el-row>
    </el-row>
</template>

<script>
import { getReportList } from '@/api/statement'
import treeTable from '@/components/TabComponents/TreeTable/index'
import dialogForm from '@/components/DialogComponents/Form'
import treeToArray from './eval'
import { getMenuList, addMenu, updateMenu, deleteMenu } from '@/api/upms'
export default {
    components: {
        dialogForm,
        treeTable
    },
    data() {
        const reportList = [
            {
                value: '',
                label: '请选择'
            }
        ]
        getReportList({ pageNo: 1, pageSize: 1000 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.total > 0) {
                    let obj = {}
                    d.records.forEach(item => {
                        obj = {
                            value: item.id + '',
                            label: item.reportName
                        }
                        if (item.isUse === 0) {
                            obj.disabled = true
                        }
                        reportList.push(obj)
                    })
                }
            }
        })
        return {
            listLoading: false,
            tabData: [],
            tabColumns: [
                {
                    value: 'parentId',
                    label: '父级节点'
                },
                {
                    value: 'id',
                    label: '节点ID'
                },
                {
                    value: 'title',
                    label: '标题'
                },
                {
                    value: 'icon',
                    label: '图标'
                },
                {
                    value: 'sort',
                    label: '排序'
                },
                {
                    value: 'path',
                    label: '路径'
                },
                {
                    value: 'component',
                    label: '组件'
                },
                {
                    value: 'name',
                    label: '名称'
                }
            ],
            title: '',
            menuEdit: null,
            menuData: [
                {
                    type: 'input',
                    name: '父节点',
                    field: 'parentId',
                    disabled: true
                },
                {
                    type: 'input',
                    name: '节点ID',
                    field: 'id',
                    disabled: true
                },
                {
                    type: 'input',
                    name: '标题',
                    field: 'title'
                },
                {
                    type: 'input',
                    name: '图标',
                    field: 'icon'
                },
                {
                    type: 'input',
                    name: '排序',
                    field: 'sort'
                },
                {
                    type: 'input',
                    name: '路径',
                    field: 'path'
                },
                {
                    type: 'select',
                    name: '路径',
                    field: 'path',
                    opts: reportList,
                    rules: [{ required: true, message: '报表菜单路径不可为空', trigger: 'select' }],
                    hidden: true
                },
                {
                    type: 'input',
                    name: '组件',
                    field: 'component'
                },
                {
                    type: 'input',
                    name: '名称',
                    field: 'name'
                }
            ],
            expandAll: true,
            func: treeToArray
        }
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        switchPathType(flag = false) {
            this.menuData[5].hidden = flag
            this.menuData[6].hidden = !flag
        },
        // 查询
        handleSearch() {
            this.listLoading = true
            getMenuList().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.evalList(d)
                }
            })
        },

        // 改变数据格式
        evalList(data) {
            const list = []
            data.forEach(v => {
                if (v.parentId < 0) {
                    v.children = []
                    list.push(v)
                }
            })
            list.forEach(a => {
                data.forEach(m => {
                    if (a.id === m.parentId) {
                        m.children = []
                        a.children.push(m)
                    }
                })
                if (a.children.length > 0) {
                    a.children.forEach(b => {
                        data.forEach(m => {
                            if (b.id === m.parentId) {
                                m.children = []
                                b.children.push(m)
                            }
                        })
                        if (b.children.length > 0) {
                            b.children.forEach(c => {
                                data.forEach(m => {
                                    if (c.id === m.parentId) {
                                        m.children = []
                                        c.children.push(m)
                                    }
                                })
                            })
                        }
                    })
                }
            })
            this.tabData = list
            this.listLoading = false
        },

        // 新增
        addMenu() {
            this.title = '新增一级菜单'
            this.switchPathType()
            this.menuEdit = {
                parentId: -1,
                id: 0,
                type: 0
            }
            this.$refs.menu.open()
        },

        // 新增子菜单
        handleAddChild(row) {
            this.title = '新增子菜单'
            const type = row.type === '8' || row.type === '9' ? '9' : 0
            this.switchPathType(type === '9')
            this.menuEdit = {
                parentId: row.id,
                id: 0,
                type
            }
            this.$refs.menu.open()
        },

        // 编辑
        handleEdit(row) {
            if (this.menuData[6].opts && this.menuData[6].opts.length > 0) {
                this.menuData[6].opts.forEach(item => {
                    if (item.value === row.path && item.disabled) {
                        row.path = ''
                    }
                })
            }

            this.title = '编辑'
            this.switchPathType(row.type === '9')
            this.menuEdit = {
                parentId: row.parentId,
                id: row.id,
                title: row.title,
                icon: row.icon,
                sort: row.sort,
                path: row.path,
                component: row.component,
                name: row.name,
                type: row.type
            }
            this.$refs.menu.open()
        },

        // 删除
        handleDelete(row) {
            this.$confirm('是否确认删除菜单?', '系统提示', {
                type: 'warning'
            })
                .then(() => {
                    deleteMenu(row.id).then(res => {
                        this.successCallback(res, '菜单删除成功！')
                    })
                })
                .catch(() => {})
        },

        // 保存
        handleConfirm(form) {
            if (form.id) {
                updateMenu(form).then(res => {
                    this.successCallback(res, '菜单修改成功！')
                })
            } else {
                addMenu(form).then(res => {
                    this.successCallback(res, '菜单新增成功！')
                })
            }
        },

        // 菜单保存成功提醒
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$refs.menu.close()
                this.$message.success(msg)
            }
        }
    }
}
</script>
