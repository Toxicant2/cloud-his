<template>
  <el-row class="page-container">
    <el-row class="page-main">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
          <template v-if="tab.key === 'basicSetting'">
            <div class="addClass">
              <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAppoint" v-if="!isClinicCenter">引用</el-button>
              <el-button type="primary" size="small" icon="el-icon-plus" @click="openAppointClinic" v-if="isClinicCenter">引用诊所</el-button>
              <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增规则</el-button>
            </div>
            <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
            <dialog-form ref="edit" :width="'450px'" :title="basicSettingTitle" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
          </template>

          <!-- 参数设置 -->
          <template v-else>
            <parameter-maintain></parameter-maintain>
          </template>
        </el-tab-pane>
      </el-tabs>
      <el-dialog title="引用其他诊所目录" :visible.sync="centerDialogVisible" width="30%" center @close="close" class="basicDialog">
        <template v-if="clinicOptions.length > 0">
          <p class="otherclinicDia">请选择引用的诊所疾病目录：</p>

          <el-radio-group v-model="clinicId">
            <el-radio :label="item.value" v-for="(item,index) in clinicOptions" :key="index">{{item.name}}</el-radio>
          </el-radio-group>

          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleAppointClinic" :loading="loading">引用</el-button>
          </span>
        </template>
        <template v-else>
          <p style="font-size:16px;text-align:center">暂无可引用的诊所目录</p>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="centerDialogVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-row>
  </el-row>
</template>

<script>
import {
    getBasicSettingData,
    updateBasicSetting,
    addBasicSetting,
    delBasicSetting,
    saveByOrgLevel,
    saveByOrgId
} from '@/api/catalog'

import { getOrgOpts } from '@/api/org'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'
import { mapGetters } from 'vuex'
import { getCurrentDay } from '@/utils/common'
import { param, param2Obj } from '@/utils'

import parameterMaintain from './components/index'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        parameterMaintain
    },
    mixins: [paginationMixin],
    data() {
        const propertyList = [
            { value: 1, label: '年' },
            { value: 2, label: '年月' },
            { value: 3, label: '年月日' }
        ]
        const orgList = []
        const clinicOptions = []
        getOrgOpts({ type: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    orgList.push({
                        value: param({
                            orgId: item.id,
                            orgName: item.name,
                            areaCode: item.areaCode
                        }),
                        label: item.name
                    })
                    clinicOptions.push({
                        name: item.name,
                                value: param({
                                    id: item.id,
                                    name: item.name
                                })
                    })
                })
            }
        })
        return {
            clinicOptions,
            temp_list: propertyList,
            tabMapOpts: [
                {
                    label: '编号规则',
                    key: 'basicSetting'
                },
                {
                    label: '参数设置',
                    key: 'nowStorage'
                }
            ],
            totalCount: 0,
            activeName: 'basicSetting',
            listLoading: false,
            basicSettingTitle: '',
            tabData: [],
            tabColumns: [
                {
                    value: 'name',
                    label: '编号类型',
                    align: 'center'
                },
                {
                    value: 'prefix',
                    label: '前缀',
                    align: 'center'
                },
                {
                    value: 'dateType',
                    label: '日期',
                    align: 'center'
                },
                {
                    value: 'numLength',
                    label: '流水号长度（位）',
                    align: 'center'
                },
                {
                    value: 'initNum',
                    label: '起始流水号',
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
                            func: this.handleDel,
                            label: '删除',
                            type: 'danger'
                        }
                    ]
                }
            ],
            formEdit: {
                date: 3,
                org: '',
                name: '',
                dictCode: '',
                initNum: 1,
                numLength: 3,
                prefix: ''
            },

            formData: [
                {
                    type: 'select',
                    name: '运营机构',
                    field: 'org',
                    opts: orgList,
                    rules: [{ required: true, message: '运营机构必填', trigger: 'blur' }],
                    spanCount: 24,
                    func: this.handleOrg
                },
                {
                    type: 'select',
                    name: '编号类型',
                    rules: [{ required: true, message: '运营机构必填', trigger: 'blur' }],
                    field: 'name',
                    opts: [],
                    disabled: false,
                    func: this.handleName
                },
                {
                    type: 'input',
                    name: '前缀',
                    maxlength: 4,
                    field: 'prefix',
                    func: this.handlePrefix
                },
                {
                    type: 'radio',
                    name: '日期',
                    field: 'date',
                    opts: propertyList,
                    func: this.handleDate
                },
                {
                    type: 'number',
                    name: '流水号长度',
                    min: 1,
                    max: 5,
                    field: 'numLength',
                    func: this.handleNumLength
                },
                {
                    type: 'number',
                    name: '起始流水号',
                    min: 1,
                    max: 5,
                    field: 'initNum',
                    func: this.handleInitNum
                },
                {
                    type: 'input',
                    name: '编号预览',
                    disabled: true,
                    field: 'settingStr'
                }
            ],
            cacheForm: {},
            isClinicCenter: this.$store.getters.clinic.isClinicCenter,
            centerDialogVisible: false,
            clinicId: '',
            loading: false
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    watch: {
        'formEdit.date': function(val, oldVal) {
            this.formEdit.date = val
            this.$refs.edit[0].form = this.formEdit
            this.formEdit.settingStr = this.preSetting(this.formEdit)
        }
    },
    methods: {
    // 运营机构
        handleOrg(val) {
            this.formEdit.org = val
            this.$refs.edit[0].form = this.formEdit
        },
        // 编号类型
        handleName(val) {
            this.formEdit.name = val
            this.$refs.edit[0].form = this.formEdit
        },
        // 前缀
        handlePrefix(val) {
            this.formEdit.prefix = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },
        // 日期
        handleDate(val) {
            this.formEdit.date = val
            this.$refs.edit[0].form = this.formEdit
            this.formEdit.settingStr = this.preSetting(this.formEdit)
        },
        // 流水号长度
        handleNumLength(val) {
            this.formEdit.numLength = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },
        // 起始流水号
        handleInitNum(val) {
            this.formEdit.initNum = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },

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
            getBasicSettingData(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const that = this
                    this._.forEach(d.records, function(item) {
                        that._.forEach(that.dictData[480], function(element) {
                            if (element.value === item.dictCode) {
                                item.name = element.label
                            }
                        })

                        item.dateType =
              item.date === 1 ? '年' : item.date === 2 ? '年月' : item.date === 3 ? '年月日' : ''
                    })
                    this.tabData = d.records
                    this.total = d.total
                }
            })
        },

        // 新增
        handleAdd() {
            this.formEdit = {
                date: 3,
                dictCode: '',
                initNum: 1,
                org: '',
                name: '',
                numLength: 3,
                prefix: ''
            }
            this.formData[1].disabled = false
            this.formData[1].type = 'remote'
            this.formData[1].opts = this.dictData[480]
            this.basicSettingTitle = '新增规则'
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
            this.$refs.edit[0].open()
        },

        // 编号引用
        handleAppoint() {
            this.$confirm('是否确定引用运营中心的编号规则?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                saveByOrgLevel().then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                    }
                })
            })
        },

        // 运营中心引用诊所弹窗
        openAppointClinic() {
            this.centerDialogVisible = true
        },
        // 运营中心引用诊所
        handleAppointClinic() {
            if (this.clinicId) {
                this.loading = true
                this.$confirm(`是否确定引用${param2Obj(this.clinicId).name}的编号规则?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                    .then(() => {
                        saveByOrgId(param2Obj(this.clinicId).id).then(res => {
                            if (res.STATUS === '1') {
                                this.$message.success(res.MESSAGE)
                                this.centerDialogVisible = false
                                this.loading = false
                            }
                        })
                    })
                    .catch(() => {
                        this.loading = false
                    })
            } else {
                this.$message.warning('请先选择诊所')
            }
        },

        close() {
            this.centerDialogVisible = false
        },

        // 编号预览
        preSetting(obj) {
            var temp = getCurrentDay()
                .split(' ')[0]
                .split('-')
            var dateStr = ''
            for (let index = 0; index < obj.date; index++) {
                const value = temp[index]
                dateStr += value
            }
            var temp_str = ''
            for (let index = 0; index < obj.numLength - 1; index++) {
                temp_str += '0'
            }
            return obj.prefix + dateStr + temp_str + obj.initNum
        },

        // 编辑
        handleEdit(row) {
            this.basicSettingTitle = `编辑${row.name}规则`
            this.formData[1].disabled = true
            this.formData[1].type = 'input'
            var settingStr = this.preSetting(row)
            this.formEdit = {
                date: row.date,
                dictCode: row.dictCode,
                id: row.id,
                org: row.orgId
                    ? param({
                        orgId: row.orgId,
                        orgName: row.orgName,
                        areaCode: row.areaCode
                    })
                    : '',
                initNum: row.initNum,
                numLength: row.numLength,
                prefix: row.prefix,
                name: row.name,
                settingStr: settingStr
            }
            this.$refs.edit[0].open()
        },

        // 修改状态
        handleDel(row) {
            var ids = [row.id]
            delBasicSetting(ids).then(res => {
                this.successCallback(res, '删除成功')
            })
        },

        // 保存
        handleConfirm(form) {
            const org = param2Obj(form.org)
            form = Object.assign(form, org)
            if (form.id) {
                // 修改
                updateBasicSetting(form)
                    .then(res => {
                        if (res.STATUS === '1') {
                            this.successCallback(res, '编辑成功')
                        }
                    })
                    .catch(() => {
                        this.$refs.edit[0].loading = false
                    })
            } else {
                // 新增
                if (form.name) {
                    form.id = 0
                    form.dictCode = form.name
                    delete form.settingStr
                    delete form.name
                    addBasicSetting(form)
                        .then(res => {
                            if (res.STATUS === '1') {
                                this.successCallback(res, '保存成功')
                            }
                        })
                        .catch(() => {
                            this.$refs.edit[0].loading = false
                        })
                } else {
                    this.$message.error('编号类型必选')
                }
            }
        },

        // 保存成功
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$message.success(msg)
                this.$refs.edit[0].close()
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>

<style lang="scss">
.addClass {
  text-align: right;
  margin: 0 6px 15px 0px;
}
.basicDialog {
  .el-radio {
    width: 40%;
    margin: 5px;
    margin-left: 15px;
  }
}
</style>
<style scoped>
.otherclinicDia {
  font-size: 16px;
  height: 30px;
  line-height: 30px;
  margin-top: -20px;
}
</style>
