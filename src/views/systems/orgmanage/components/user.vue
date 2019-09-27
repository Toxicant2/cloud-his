<template>
    <el-row>
        <direct-search ref="directSearch" :label-position="'right'" :forms="searchList" :label-width="'100px'" @handleSearch="handleSearchFun" />
        <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" :current-page="pageIndex" @pageSizeChange="handleSizeChange"
@currentPageChange="handleCurrentChange" />
        <!-- <dialog-quickclick ref="quick" :width="'720px'" title="选择入驻医生" :quick-searchlist="quickSearch" :el-list="elList" :get-data="getAllDoctorList" :params="{'headImgFlag': 1}" @quickClick="chooseDoctor"></dialog-quickclick> -->
        <quick-click ref="quick" :width="'720px'" title="选择入驻医生" :quick-searchlist="quickSearch" :el-list="elList" :get-data="getStaffList" :params="searchForm" @quickClick="chooseDoctor" />
        <dialog-form ref="edit" :width="'720px'" :count-line="12" :title="employeesTitle" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
    </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import quickClick from '@/components/DialogComponents/QuickClick'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'
import { getOrgClinicStaffList } from '@/api/org'
import { getStaffList } from '@/api/upms'
import { formatSex } from '@/utils'
import employees from '../mixin'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        paginationMixin,
        quickClick
    },
    mixins: [paginationMixin, employees],
    props: ['orgInfo', 'orgId', 'curOrgName', 'level', 'isCheckOut'],
    data() {
        return {
            getStaffList,
            total: 0,
            listLoading: false,
            employeesTitle: '',
            customerId: '',
            cacheForm: {},
            formEdit: {},
            tabData: [],
            searchList: [
                {
                    type: 'input',
                    prop: 'name',
                    label: '姓名',
                    placeholder: '请输入人员姓名',
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
                    value: 'userRealName',
                    label: '姓名',
                    align: 'center',
                    width: 120
                },
                {
                    value: 'mobile',
                    label: '手机号',
                    align: 'center',
                    width: 120
                },
                {
                    value: 'sex',
                    label: '性别',
                    align: 'center',
                    formatter(row) {
                        return row.sex === '1' ? '男' : '女'
                    },
                    width: 80
                },
                {
                    value: 'departName',
                    label: '科室',
                    align: 'center',
                    width: 120
                },
                {
                    value: 'roleName',
                    label: '角色',
                    align: 'center'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 230,
                    operType: 'button',
                    operations: [
                        {
                            label: '解锁',
                            type: 'primary',
                            func: this.handleUnlock
                        },
                        {
                            func: this.handleStatus,
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
                        // {
                        //     func: this.handleDelete,
                        //     label: '删除',
                        //     type: 'danger'
                        // }
                    ]
                }
            ],
            quickSearch: [
                {
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
            elList: {
                spanCol: 6,
                list: [
                    {
                        formatter(row) {
                            return `${row.realName}（${row.depart ? row.depart : ''}）`
                        }
                    },
                    {
                        value: 'mobile'
                    },
                    {
                        formatter(row) {
                            return formatSex(row.sex)
                        }
                    }
                ]
            },
            searchForm: { checkedStatus: '1', isUse: '1', avatarFlag: 1 }
        }
    },
    watch: {
        orgId() {
            this.$refs.directSearch.initforms({ name: '' })
            this.handleSearchFun()
        }
    },
    created() {
        if (this.orgId && this.isCheckOut !== 0) {
            this.handleSearchFun()
        }
    },
    methods: {
    // 新增人员
        handleAdd() {
            if (!this.orgId) {
                this.$message.warning('请先选择诊所')
                return false
            }
            if (this.isCheckOut === 0) {
                this.$message.warning('请先审核通过，再使用该功能')
                return false
            }
            if (this.orgInfo.org.type === 8) {
                this.searchForm = { onlineCheckStatus: 1 }
            } else {
                this.searchForm = { checkedStatus: '1', isUse: '1', avatarFlag: 1 }
            }
            this.$refs.quick.open()
        },
        // 查询人员
        handleSearchFun(form) {
            if (!this.orgId) {
                this.$message.warning('请先选择诊所')
                return false
            }
            this.cacheForm = this.cacheForm || form
            this.pageIndex = 1
            this.handleSearch()
        },

        // 获取人员列表
        handleSearch() {
            const params = {}
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.userName = this.cacheForm.name
            params.orgId = this.orgId
            params.avatarFlag = 1
            this.listLoading = true
            getOrgClinicStaffList(params).then(res => {
                this.listLoading = false
                if (res.STATUS === '1') {
                    this.tabData = res.ITEMS.list
                    this.tabData.forEach(item => {
                        const roleList = []
                        if (item.roleList.length > 0) {
                            item.roleList.forEach(role => {
                                roleList.push(role.name)
                            })
                        }
                        item.roleName = roleList.join(',')
                    })

                    this.total = res.ITEMS.totalRecord
                }
            })
        }
    }
}
</script>

