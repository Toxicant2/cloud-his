<template>
  <el-row class="page-container doctorAudit">
    <el-row class="page-main" v-if="!isPreview">
      <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
      <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" :span-method="spanMethod" />
      <dialog-form ref="audit" :width="'560px'" :label-width="'130px'" :title="'专业人员审核'" :form-data="auditData" :form-edit="auditEdit" @handleConfirm="handleConfirm" />
    </el-row>
    <el-row class="page-main" v-else>
      <el-row class="header">
        <h2>个人医生注册信息审核</h2>
        <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
      </el-row>
      <el-row class="main">
        <div class="some">
          <p>
            注册账号手机号：{{mobile}}
          </p>
          <p class="mb20">
            注册账号类型：个人医生
          </p>
        </div>
        <el-form-panel ref="person" :label-width="'180px'" :forms="person" btn-text="" :can-edit="false" :disabled="true" />
      </el-row>
    </el-row>
  </el-row>
</template>

<script>
import { getStaffList, auditStaff, updateUserStatus, getStaffDetail } from '@/api/upms'
import {  getAreaOrgOpts } from '@/api/org'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'

import elFormPanel from '@/views/register/components/FormPanel'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        elFormPanel
    },
    mixins: [paginationMixin],
    data() {
    // 非诊所的运营中心
        const orgList = []
        getAreaOrgOpts().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        orgList.push({
                            // value: param({
                            //     orgId: item.id,
                            //     orgName: item.name,
                            //     areaCode: item.areaCode
                            // }),
                            value: item.id,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            person: null,
            isPreview: false,
            listLoading: false,
            tabData: [],
            searchList: [
                {
                    type: 'select',
                    label: '运营机构',
                    prop: 'orgId',
                    placeholder: '请选择',
                    opts: orgList
                },
                {
                    type: 'select',
                    label: '审核状态',
                    prop: 'checkedStatus',
                    placeholder: '请选择',
                    opts: [
                        {
                            value: '',
                            label: '全部'
                        },
                        {
                            value: 0,
                            label: '待审核'
                        },
                        {
                            value: 1,
                            label: '已审核'
                        },
                        {
                            value: 2,
                            label: '已拒绝'
                        }
                    ]
                },
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
                    value: 'code',
                    label: '编号'
                },
                {
                    value: 'realName',
                    label: '姓名',
                    operType: 'button',
                    operations: [
                        {
                            type: 'text',
                            func: this.handlePreview
                        }
                    ]
                },
                {
                    value: 'mobile',
                    label: '手机号',
                    width: 120
                },
                {
                    value: 'orgName',
                    label: '运营机构',
                    width: 150
                },
                {
                    complex: true,
                    label: '线下执业',
                    list: [
                        {
                            value: 'checkStatus',
                            label: '审核状态',
                            scope: true,
                            width:100
                        },
                        {
                            value: 'checkNote',
                            label: '审核备注',
                            width: 150
                        }
                    ]
                },
                {
                    label: '线上执业',
                    complex: true,
                    formatter(row) {
                        return row.isQaOnline === 1
                    },
                    list: [
                        {
                            value: 'onlineCheckStatus',
                            label: '审核状态',
                            scope: true,
                            width:100
                        },
                        {
                            value: 'onlineCheckNote',
                            label: '审核备注',
                            width: 150
                        },
                        {
                            value: 'authOnlineOutpatient',
                            label: '线上诊疗权',
                            icon: true,
                            width:90
                        },
                        {
                            value: 'authOnlineCheckRecipe',
                            label: '审方发药权',
                            icon: true,
                            width:90
                        }
                    ]
                },
                {
                    value: 'isUse',
                    label: '启用状态',
                    scope: true
                },
                {
                    label: '操作',
                    fixed: 'right',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleAudit,
                            formatter(row) {
                                return {
                                    label: '审核',
                                    type: 'primary',
                                    disabled:
                    (row.checkStatus > 0 && row.isQaOnline !== 1) ||
                      (row.isQaOnline === 1 && row.onlineCheckStatus>0 && row.checkStatus > 0)
                                }
                            }
                        },
                        {
                            func: this.handleStatus,
                            formatter(row) {
                                return {
                                    label: row.checkStatus || row.onlineCheckStatus ? (row.isUse === 1 ? '停用' : '启用') : '启用',
                                    type: row.checkStatus || row.onlineCheckStatus ? (row.isUse === 1 ? 'danger' : 'primary') : '',
                                    disabled: !row.checkStatus  || ( row.isQaOnline === 1 && !row.onlineCheckStatus ) 
                                }
                            }
                        }
                    ]
                }
            ],

            auditEdit: null,
            auditData: [
                {
                    type: 'input',
                    name: '编号',
                    field: 'code'
                },
                {
                    type: 'input',
                    name: '姓名',
                    field: 'realName',
                    disabled: true
                },
                {
                    type: 'select',
                    name: '运营机构',
                    field: 'org',
                    opts: orgList,
                    rules: [{ required: true, message: '运营机构必选' }]
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '线下执业审核备注',
                    field: 'checkNote',
                    resize: 'none',
                    maxlength: '200',
                    placeholder: '最多输入200字',
                    autosize: { minRows: 4, maxRows: 8 },
                    isDash: true
                },
                {
                    type: 'radio',
                    name: '线下执业审核',
                    field: 'checkStatus',
                    opts: [
                        {
                            value: 1,
                            label: '审核通过'
                        },
                        {
                            value: 2,
                            label: '拒绝通过'
                        }
                    ],
                    rules: [{ required: true, message: '是否审核通过必选' }]
                },
                {
                    type: 'input',
                    inputType: 'textarea',
                    name: '线上执业审核备注',
                    field: 'onlineCheckNote',
                    resize: 'none',
                    maxlength: '200',
                    placeholder: '最多输入200字',
                    autosize: { minRows: 4, maxRows: 8 },
                    isDash: true,
                    hidden: true
                },
                {
                    type: 'radio',
                    name: '线上执业审核',
                    field: 'onlineCheckStatus',
                    opts: [
                        {
                            value: 1,
                            label: '审核通过'
                        },
                        {
                            value: 2,
                            label: '拒绝通过'
                        }
                    ],
                    rules: [{ required: true, message: '是否审核通过必选' }],
                    hidden: true
                },
                {
                    type: 'radioMixin',
                    name: '特殊权限管制',
                    list: [
                        {
                            name: '线上诊疗权(医生门诊的病历书写、开具处方、检验检查、治疗等权限)',
                            field: 'authOnlineOutpatient',
                            opts: [
                                {
                                    value: 1,
                                    label: '有'
                                },
                                {
                                    value: 2,
                                    label: '无'
                                }
                            ]
                        },
                        {
                            name: '审方发药权(审方、发药权限)',
                            field: 'authOnlineCheckRecipe',
                            opts: [
                                {
                                    value: 1,
                                    label: '有'
                                },
                                {
                                    value: 2,
                                    label: '无'
                                }
                            ]
                        }
                    ],
                    rules: [{ required: true, message: '是否审核通过必选' }],
                    hidden: true
                }
            ],
            mobile: '',
            cacheForm: {},
            isQaOnline: ''
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
            this.auditData[5].isDash = true
            this.auditData[3].hidden = false
            this.auditData[4].hidden = false
            this.auditData[5].hidden = true
            this.auditData[6].hidden = true
            this.auditData[7].hidden = true
            if (row.isQaOnline === 1) {
                if (row.checkStatus === 1) {
                    this.auditData[3].hidden = true
                    this.auditData[4].hidden = true
                }
                this.auditData[5].hidden = false
                this.auditData[6].hidden = false
                this.auditData[7].hidden = false
            }
            this.isQaOnline = row.isQaOnline
            this.auditEdit = {
                code: row.code,
                realName: row.realName,
                userId: row.userId,
                checkNote: row.checkNote || '',
                org: ''
            }
            this.$refs.audit.open()
        },

        // 保存审核
        handleConfirm(form) {
            // const org = param2Obj(form.org)
            const params = {
                userId: form.userId,
                code: form.code,
                offlineCheck: {
                    checkStatus: form.checkStatus,
                    checkNote: form.checkNote
                },
                onlineCheck: {
                    checkStatus: form.onlineCheckStatus,
                    checkNote: form.onlineCheckNote
                },
                authOnlineCheckRecipe: form.authOnlineCheckRecipe,
                authOnlineOutpatient: form.authOnlineOutpatient,
                orgId: form.org
            }
            if (this.isQaOnline) {
                if (!params.authOnlineCheckRecipe || !params.authOnlineOutpatient) {
                    this.$message.warning('请选择特殊权限管制')
                    this.$refs.audit.loading = false
                    return
                }
            }
            auditStaff(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.handleSearch()
                        this.$message.success('审核成功')
                        this.$refs.audit.close()
                    }
                })
                .catch(() => {
                    this.$refs.audit.loading = false
                })
        },

        // 修改启用状态
        handleStatus(row) {
            const txt = `确认将
                    ${row.realName.indexOf('医生') > -1 ? row.realName : row.realName + '医生'}改为
                    ${row.isUse === 1 ? '停用' : '启用'}状态？`
            this.$confirm(txt, '提示', {
                type: 'warning'
            })
                .then(() => {
                    updateUserStatus(row.id).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('状态修改成功')
                        }
                    })
                })
                .catch(() => {})
        },

        // 预览医生信息
        handlePreview(row) {
            getStaffDetail(row.id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.isPreview = true
                        this.mobile = row.mobile
                        if (!this.person) {
                            const { person } = require('@/views/register/tpl/person')
                            this.person = person
                        }
                        this.$nextTick(() => {
                            this.$refs.person.initforms({
                                data: d.staff || '',
                                attachmentList: d.attachmentList || [],
                                experienceList:d.experienceList
                            })
                        })
                    }
                }
            })
        },

        // 返回
        back() {
            this.pageIndex = 1
            this.isPreview = false
            this.handleSearch()
        },

        // 合并列
        spanMethod({ row, column, rowIndex, columnIndex }) {
            if (row.isQaOnline !== 1) {
                if (columnIndex === 7) {
                    return [1, 4]
                } else if (columnIndex === 8 || columnIndex === 9 || columnIndex === 10) {
                    return [0, 0]
                }
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>

<style lang="scss" scoped>
.page-main {
  .header {
    text-align: center;
    h2 {
      display: inline-block;
      font-size: 16px;
      font-weight: 700;
      line-height: 32px;
    }
    button {
      float: right;
    }
  }
  .main {
    margin: 20px auto;
    overflow: hidden;
    zoom: 1;
    width: 1200px;
    .some {
      p {
        font-size: 14px;
        color: #333;
        padding: 12px;
        &.mb20 {
          margin-bottom: 20px;
          border-bottom: 1px solid #ccc;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.doctorAudit {
  .el-dialog {
    margin-bottom: 100px;
  }
  .smallRadio {
    margin-bottom: 5px;
    .name {
      line-height: 19px;
      margin-top: 7px;
      width: 250px;
      display: block;
      float: left;
    }
    .el-radio-group {
      font-size: 0;
      float: right;
      margin-top: 10px;
    }
    .el-radio {
      margin-right: 10px;
    }
    .el-radio + .el-radio {
      margin-left: 10px;
    }
  }
}
</style>
