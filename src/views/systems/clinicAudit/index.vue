<template>
    <el-row class="page-container">
        <el-row class="page-main" v-if="!isPreview">
            <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
            <dialog-form ref="audit" :width="'560px'" :title="'诊所审核'" :form-data="auditData" :form-edit="auditEdit" @handleConfirm="handleConfirm" />
        </el-row>
        <el-row class="page-main" v-else>
            <el-row class="header">
                <h2>诊所注册信息审核</h2>
                <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
            </el-row>
            <el-row class="main">
                <div class="some">
                    <p>
                        注册账号手机号：{{mobile}}
                    </p>
                    <p class="mb20">
                        注册账号类型：诊所
                    </p>
                </div>
                <el-form-panel ref="clinic" :label-width="'180px'" :forms="clinic" :can-edit="false" :disabled="true" />
            </el-row>
        </el-row>
    </el-row>
</template>

<script>
    import {
        auditClinic,
        getClinicList,
        getOrgOpts,
        updateClinicStatus,
        getOrgInfo
    } from '@/api/org'
    import directSearch from '@/components/FormComponents/directSearch'
    import elTableSelf from '@/components/TabComponents/index'
    import dialogForm from '@/components/DialogComponents/Form'
    import paginationMixin from '@/components/TabComponents/mixin'

    import elFormPanel from '@/views/register/components/FormPanel'
    import { param } from '@/utils'

    export default {
        components: {
            directSearch,
            elTableSelf,
            dialogForm,
            elFormPanel
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
                                label: item.name
                            })
                        })
                    }
                }
            })
            return {
                clinic: null,
                isPreview: false,
                listLoading: false,
                tabData: [],
                searchList: [
                    {
                        type: 'select',
                        label: '审核状态',
                        prop: 'checked_status',
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
                        label: '诊所状态',
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
                        placeholder: '请输入诊所名称',
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
                        label: '诊所名称',
                        operType: 'button',
                        operations: [
                            {
                                type: 'text',
                                func: this.handlePreview
                            }
                        ]
                    }, {
                        value: 'orgName',
                        label: '运营机构',
                        width: 250
                    }, {
                        value: 'code',
                        label: '编号',
                        align: 'center'
                    }, {
                        value: 'checkedStatus',
                        label: '审核状态',
                        scope: true
                    }, {
                        value: 'isUse',
                        label: '启用状态',
                        scope: true
                    }, {
                        value: 'checkNote',
                        label: '审核备注',
                        width: 250
                    }, {
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
                                        disabled: row.checkedStatus === 1
                                    }
                                }
                            }, {
                                func: this.handleStatus,
                                formatter(row) {
                                    return {
                                        label: row.checkedStatus === 1 ? row.isUse === 1 ? '停用' : '启用' : '启用',
                                        type: row.checkedStatus === 1 ? row.isUse === 1 ? 'danger' : 'primary' : '',
                                        disabled: row.checkedStatus !== 1
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
                        name: '诊所代码',
                        field: 'code'
                    }, {
                        type: 'input',
                        name: '诊所名称',
                        field: 'name',
                        disabled: true
                    }, {
                        type: 'select',
                        name: '运营机构',
                        field: 'orgId',
                        opts: orgList,
                        rules: [{ required: true, message: '运营机构必选' }]
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
                                value: 1,
                                label: '审核通过'
                            }, {
                                value: 2,
                                label: '拒绝通过'
                            }
                        ],
                        rules: [{ required: true, message: '是否审核通过必选' }]
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
                getClinicList(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.tabData = d.records
                        this.total = d.total
                    }
                })
            },

            // 点击审核
            handleAudit(row) {
                this.auditEdit = {
                    code: row.code,
                    name: row.name,
                    clinicId: row.id,
                    orgId: row.orgId,
                    checkedNote: row.checkNote ? row.checkNote : ''
                }
                this.$refs.audit.open()
            },

            // 保存审核
            handleConfirm(form) {
                auditClinic(form).then(res => {
                    if (res.STATUS === '1') {
                        this.handleSearch()
                        this.$message.success('审核成功')
                        this.$refs.audit.close()
                    }
                })
            },

            // 修改启用状态
            handleStatus(row) {
                const txt = `确认将${row.name}改为【${row.isUse === 1 ? '停用' : '启用'}】状态？`
                this.$confirm(txt, '提示', {
                    type: 'warning'
                }).then(() => {
                    updateClinicStatus(row.id).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('状态修改成功')
                        }
                    })
                }).catch(() => {

                })
            },

            // 预览诊所信息
            handlePreview(row) {
                getOrgInfo(row.id).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d) {
                            this.isPreview = true
                            this.mobile = row.contacttPhone
                            if (!this.clinic) {
                                const { clinic } = require('@/views/register/tpl/clinic')
                                this.clinic = clinic
                            }
                            const sub = []
                            if (d.subjectList.length > 0) {
                                d.subjectList.forEach(item => {
                                    sub.push(param({
                                        sort: item.sort,
                                        subjectCode: item.subjectCode,
                                        subjectName: item.subjectName
                                    }))
                                })
                            }
                            this.$nextTick(() => {
                                this.$refs.clinic.initforms({
                                    data: {
                                        name: row.name,
                                        licenseName: row.licenseName,
                                        licenseNum: row.licenseNum,
                                        code: row.code,
                                        level3: row.province ? [row.province, row.city, row.district] : [],
                                        address: row.address,
                                        isMedicalInsurance: row.isMedicalInsurance,
                                        isSharePatientInfo: row.isSharePatientInfo,
                                        isCommercialInsurance: row.isCommercialInsurance,
                                        subjectList: sub,
                                        telephone: row.telephone,

                                        morning: row.morningOpenTime ? row.morningOpenTime.split('-') : ['', ''],
                                        afternoon: row.afternoonOpenTime ? row.afternoonOpenTime.split('-') : ['', ''],
                                        night: row.nightOpenTime ? row.nightOpenTime.split('-') : ['', ''],

                                        isHolidayOpen: row.isHolidayOpen,
                                        introduction: row.introduction
                                    },
                                    attachmentList: d.attachmentList || []
                                })
                            })
                        }
                    }
                })
            },

            // 返回
            back() {
                this.isPreview = false
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
    width: 855px;
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