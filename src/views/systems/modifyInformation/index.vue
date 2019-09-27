<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <header v-if="isAuditModify" class="modify-header">
                <h2>个人中心</h2>
                <el-button @click="backToLogin">返回登录</el-button>
            </header>
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" v-if="tab.key !== 'tab2'||(tab.key === 'tab2' && isAdministrator)" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="tab.key === 'tab1'">
                        <el-button v-if="!disabled" type="primary" style="float:right;position:relative;z-index:22" @click="handleCancel">取消</el-button>
                        <el-button v-if="disabled" type="primary" style="float:right;position:relative;z-index:22" @click="disabled = false">编辑</el-button>
                        <el-form-panel ref="person" :label-width="'180px'" :btn-text="'重新提交审核'" :forms="person" :disabled="disabled" type="personModify" @handleClick="handleSavePerson" @emit="handleEmit" />
                    </template>
                    <template v-else-if="tab.key === 'tab2'">
                        <el-form-panel ref="clinic" :label-width="'180px'" :btn-text="'重新提交审核'" :forms="clinicForm" type="clinic" @handleClick="handleSaveClinic" />
                    </template>
                    <template v-else-if="tab.key === 'tab3'">
                        <el-form ref="form" :rules="rules" :model="form" label-position="right" label-width="180px" style="width:500px;">
                            <el-form-item v-for="(item,index) in formData" :key="index" :label="item.name?`${item.name}:`:''" :prop="item.field">
                                <!-- 输入框 -->
                                <el-input v-model="form[item.field]" :placeholder="item.placeholder" type="password" />
                            </el-form-item>
                            <el-row style="text-align:center;">
                                <el-button @click="handleReset">重置</el-button>
                                <el-button :loading="loading" type="primary" @click="handleConfirm">确认</el-button>
                            </el-row>
                        </el-form>
                    </template>
                    <template v-else-if="tab.key === 'tab4'">
                        <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="auditColumns" :current-page="pageIndex" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>
                    <template v-else>
                        <template v-if="orgListVisible">
                            <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="orgColumns" />
                        </template>
                        <template v-else>
                            <el-button v-if="clinicEdit" :type="clinicDisabled?'primary':'warning'" style="float:right;position:relative;z-index:22" @click="clinicDisabled=!clinicDisabled">{{ clinicDisabled?"编辑":'取消' }}</el-button>
                            <el-button style="float:right;position:relative;z-index:22;margin-right:10px;" @click="orgListVisible=true">返回</el-button>
                            <el-form-panel ref="clinic" :label-width="'180px'" :btn-text="'重新提交审核'" :disabled="clinicDisabled" :forms="clinicForm" type="clinic" @handleClick="handleSaveClinic" />
                        </template>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-row>
</template>

<script>
import { updatePassword, getStaffDetail, updateStaff, getCheckLog, setUserClinic } from '@/api/upms'
import { getOrgInfo, editOrg, getUserClinic } from '@/api/org'
import elFormPanel from '@/views/register/components/FormPanel'
import elTableSelf from '@/components/TabComponents/index'
import { param, passwdVailid } from '@/utils'
import { mapGetters } from 'vuex'
import paginationMixin from '@/components/TabComponents/mixin'
export default {
    components: {
        elFormPanel,
        elTableSelf
    },
    mixins: [paginationMixin],
    data() {
        const validatePassword = (rule, value, callback) => {
            passwdVailid(value, callback).then(() => {
                if (this.form.newPasswordConfirm !== '') {
                    this.$refs.form[0].validateField('newPasswordConfirm')
                }
                callback()
            }).catch(res => {
                callback(new Error(res))
            })
            // const password = /^[a-zA-Z0-9_]{8,20}$/
            // if (!password.test(value)) {
            //     let errs = ''
            //     if (value.length > 20) {
            //         errs = '密码长度不可超出20位字符！'
            //     } else if (value.length < 8) {
            //         errs = '密码长度不可少于8位字符！'
            //     } else {
            //         errs = '只能包含字母、数字和下划线！'
            //     }
            //     callback(new Error(errs))
            // } else {
            //     if (this.form.newPasswordConfirm !== '') {
            //         this.$refs.form[0].validateField('newPasswordConfirm')
            //     }
            //     callback()
            // }
        }
        const validateCheckPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.form.newPassword) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        const isAuditModify = this.$route.path === '/audit/modify'
        return {
            activeName: 'tab1',
            // 诊所可否编辑
            clinicEdit: false,
            clinicDisabled: false,
            isAuditModify,
            tabMapOpts: [
                {
                    label: '个人信息',
                    key: 'tab1'
                },
                {
                    label: '诊所信息',
                    key: 'tab2'
                },
                {
                    label: '修改密码',
                    key: 'tab3'
                },
                {
                    label: '审核记录',
                    key: 'tab4'
                },
                {
                    label: '诊所列表',
                    key: 'tab5'
                }
            ],
            person: null,
            clinicForm: null,
            isAdministrator: false,
            loading: false,
            form: {
                password: '',
                newPassword: '',
                newPasswordConfirm: ''
            },
            formData: [
                {
                    name: '原密码',
                    field: 'password'
                },
                {
                    name: '新密码',
                    field: 'newPassword'
                },
                {
                    name: '确认密码',
                    field: 'newPasswordConfirm'
                }
            ],
            rules: {
                password: [{ required: true, trigger: 'blur', message: '原密码必填' }],
                newPassword: [{ required: true, trigger: 'blur', validator: validatePassword }],
                newPasswordConfirm: [{ required: true, trigger: 'blur', validator: validateCheckPassword }]
            },
            disabled: true,
            auditColumns: [
                {
                    label: '日期',
                    value: 'createTime'
                },
                {
                    label: '机构',
                    value: 'orgName'
                },
                {
                    label: '类型',
                    formatter(row) {
                        return row.type === 0 ? '线下审核' : row.type === 1 ? '线上审核' : row.type === 2 ? '重新提交审核' : ''
                    }
                },
                {
                    label: '结果',
                    value: '',
                    formatter(row) {
                        return row.status === 1 ? '通过' : row.status === 2 ? '未通过' : ''
                    }
                },
                {
                    label: '备注',
                    value: 'note'
                },
                {
                    label: '特殊权限',
                    value: 'auth'
                }
            ],
            orgListVisible: true,
            orgColumns: [
                {
                    label: '编码',
                    value: 'code'
                },
                {
                    label: '诊所名称',
                    value: 'name'
                },
                {
                    label: '机构名称',
                    value: 'orgName'
                },
                {
                    label: '诊所类型',
                    value: 'orgType'
                },
                {
                    label: '创建日期',
                    // value: 'createTime',
                    formatter(row) {
                        return row.createTime ? row.createTime.split(' ')[0] : ''
                    }
                },
                {
                    label: '审核状态',
                    formatter(row) {
                        return row.checkStatus === 1 ? '已通过' : row.checkStatus === 2 ? '已拒绝' : '待审核'
                    }
                },
                {
                    label: '备注',
                    value: 'note'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 250,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleLogin,
                            isHidden(row) {
                                return !isAuditModify
                            },
                            formatter(row) {
                                return {
                                    label: '登录',
                                    type: 'primary',
                                    disabled: row.checkStatus !== 1
                                }
                            }
                        },
                        {
                            label: '查看',
                            // type: 'primary',
                            func: this.handlePreviewOrg
                        }
                    ]
                }
            ],
            tabData: [],
            listLoading: false,
            total: 0
        }
    },
    watch: {
        activeName(newVal) {
            if (newVal === 'tab4') {
                this.pageIndex = 1
                this.pageSize = 12
                this.handleSearch()
            } else if (newVal === 'tab5') {
                this.pageIndex = 1
                this.pageSize = 12
                this.orgListVisible = true
                this.handleSearchOrg()
            }
        }
    },
    computed: {
        ...mapGetters(['user', 'clinic'])
    },
    created() {
        this.isAdministrator = this.clinic.isAdministrator
        this.renderForms()
        // this.handleSearch()
    },
    methods: {
        // 返回登录
        backToLogin() {
            this.$router.push({
                path: '/login'
            })
        },

        // 初始化表单元素
        renderForms() {
            const { person } = require('@/views/register/tpl/person')
            person[0].list[6].isHidden = true
            this.person = person
            this.handleGetUser()

            const { clinic } = require('@/views/register/tpl/clinic')
            this.clinicForm = clinic
            if (this.isAdministrator) {
                this.handleGetClinic(this.clinic.orgId || 0)
            }
        },

        // 获取个人信息
        handleGetUser() {
            getStaffDetail(this.user.id || 0).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.$nextTick(() => {
                            this.$refs.person[0].initforms({
                                data: d.staff || '',
                                attachmentList: d.attachmentList || [],
                                experienceList: d.experienceList
                            })
                        })
                    }
                }
            })
        },

        // 获取诊所信息
        handleGetClinic(orgId) {
            getOrgInfo(orgId).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        const subjectList = []
                        if (d.subjectList.length > 0) {
                            d.subjectList.forEach(item => {
                                subjectList.push(
                                    param({
                                        sort: item.sort,
                                        subjectCode: item.subjectCode,
                                        subjectName: item.subjectName
                                    })
                                )
                            })
                        }
                        const orgInfo = d.orgInfo
                        const org = d.org
                        if (this.activeName !== 'tab3' && this.activeName !== 'tab5') {
                            return false
                        }
                        this.$nextTick(() => {
                            let doms
                            if (!this.isAdministrator) {
                                doms = this.$refs.clinic[0]
                            } else {
                                doms = this.activeName === 'tab5' ? this.$refs.clinic[1] : this.$refs.clinic[0]
                            }
                            // 三级地址
                            const level3 = orgInfo.province ? [orgInfo.province, orgInfo.city, orgInfo.district] : []
                            // 上午
                            const morning = orgInfo.morningOpenTime ? orgInfo.morningOpenTime.split('-') : ['', '']
                            //  中午
                            const afternoon = orgInfo.afternoonOpenTime
                                ? orgInfo.afternoonOpenTime.split('-')
                                : ['', '']
                            //  晚上
                            const night = orgInfo.nightOpenTime ? orgInfo.nightOpenTime.split('-') : ['', '']
                            doms.initforms({
                                data: {
                                    // org
                                    name: org.name,
                                    code: org.code,
                                    parentId: org.parentId,
                                    id: org.id,
                                    orgLevel: String(org.orgLevel),

                                    // orgInfo
                                    address: orgInfo.address,
                                    administratorId: orgInfo.administratorId,
                                    orgInfoId: orgInfo.id,
                                    introduction: orgInfo.introduction,
                                    isCommercialInsurance: orgInfo.isCommercialInsurance,
                                    isHolidayOpen: orgInfo.isHolidayOpen,
                                    isMedicalInsurance: orgInfo.isMedicalInsurance,
                                    isSharePatientInfo: orgInfo.isSharePatientInfo,
                                    licenseName: orgInfo.licenseName,
                                    licenseNum: orgInfo.licenseNum,
                                    orgId: orgInfo.orgId,
                                    sysOrgId: orgInfo.sysOrgId,
                                    telephone: orgInfo.telephone,

                                    // subjectList
                                    subjectList,

                                    // others
                                    level3,
                                    morning,
                                    night,
                                    afternoon
                                },
                                attachmentList: d.attachmentList || []
                            })
                        })
                    }
                }
            })
        },

        // 保存（个人）
        handleSavePerson(form) {
            form.staff.id = this.user.id
            updateStaff(form)
                .then(res => {
                    this.successCallback(res, 1)
                })
                .catch(() => {
                    this.$refs.person[0].resetLoading()
                })
        },

        // 保存（诊所）
        handleSaveClinic(form) {
            // form.orgInfo.id = this.clinic.orgId
            // form.orgInfo.sysOrgId = this.clinic.sysOrgId
            // form.org.id = this.clinic.sysOrgId

            editOrg(form)
                .then(res => {
                    this.successCallback(res, 2)
                })
                .catch(() => {
                    this.$refs.clinic[0].resetLoading()
                })
        },

        // 保存成功回调
        successCallback(res, type) {
            if (res.STATUS === '1') {
                this.$message.success('修改成功')
                if (type === 1) {
                    this.$refs.person[0].resetLoading()
                    this.LogBackIn()
                } else {
                    const doms = this.activeName === 'tab5' ? this.$refs.clinic[1] : this.$refs.clinic[0]
                    doms.resetLoading()
                    const org = res.ITEMS.org

                    if (org.id === this.clinic.orgId) {
                        this.LogBackIn()
                    }
                }
            }
        },

        LogBackIn() {
            this.$alert('当前诊所审核需重新登录！', {
                confirmButtonText: '确定',
                callback: action => {
                    this.$store.dispatch('LogOut').then(() => {
                        location.reload()
                    })
                }
            })
        },

        // 修改密码保存
        handleConfirm() {
            this.$refs.form[0].validate(valid => {
                if (valid) {
                    this.loading = true
                    this.form.userId = this.user.userId
                    updatePassword(this.form)
                        .then(res => {
                            if (res.STATUS === '1') {
                                this.$alert('密码修改成功，请重新登录', '提示', {
                                    callback: action => {
                                        this.$store.dispatch('LogOut').then(() => {
                                            location.reload()
                                        })
                                    }
                                })
                            }
                        })
                        .catch(() => {
                            this.loading = false
                        })
                }
            })
        },

        // 重置
        handleReset() {
            this.$refs.form[0].resetFields()
        },

        handleEmit() {
            this.disabled = false
        },

        handleCancel() {
            this.disabled = true
            this.$refs.person[0].handleCancel()
        },

        // 获取人员审核记录
        handleSearch() {
            const params = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize,
                staffId: this.$store.getters.user.id
            }
            this.listLoading = true
            getCheckLog(params)
                .then(res => {
                    this.listLoading = false
                    if (res.STATUS === '1') {
                        const d = res.ITEMS.list
                        this.tabData = d
                        this.total = res.ITEMS.totalRecord
                    }
                })
                .catch(() => {
                    this.listLoading = false
                })
        },

        // 获取诊所列表
        handleSearchOrg() {
            this.listLoading = true
            getUserClinic().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tabData = d || []
                    this.listLoading = false
                }
            }).catch(() => {
                this.listLoading = false
            })
        },

        // 编辑诊所
        handlePreviewOrg(row) {
            this.orgListVisible = false
            this.clinicDisabled = true
            this.clinicEdit = row.administratorId === this.user.id
            this.handleGetClinic(row.id)
        },

        // 登录
        handleLogin(row) {
            setUserClinic(row.id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.$store.dispatch('directorLogin', d).then(res => {
                            this.$store.dispatch('delAllViews', d).then(() => {
                                this.$router.push({
                                    path: res.path ? res.path : res.redirect
                                })
                            })
                        })
                    }
                } else if (res.STATUS === '8') {
                    this.$router.push({
                        path: '/audit/modify'
                    })
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .modify-header {
        text-align: center;
        line-height: 48px;
        h2{
            display: inline-block;
        }
        .el-button{
            float: right;
            margin-top: 6px;
        }
    }
</style>

