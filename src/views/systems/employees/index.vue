<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增员工</el-button>
            <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
            <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :current-page="pageIndex" :table-data="tabData" :columns="tabColumns" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange"
@currentPageChange="handleCurrentChange" />
            <dialog-form ref="edit" :width="'720px'" :count-line="12" :title="employeesTitle" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
            <quick-click ref="quick" :width="'720px'" title="选择入驻医生" :quick-searchlist="quickSearch" :el-list="elList" :get-data="getStaffList" :params="searchForm" @quickClick="chooseDoctor" />
            <dialog-form ref="editphone" :width="'400px'" :count-line="22" :title="'修改手机号'" :form-data="formData2" :form-edit="formEdit2" @handleConfirm="handleConfirm2" />
        </el-row>

    </el-row>
</template>

<script>
import {
    getDepartmentOpts,
    getOrgClinicStaffList,
    addDepartmentUser,
    updateDepartmentUser,
    deleteDepartmentUser,
    updateDepartmentUserStatus,
    getOrgOpts
} from '@/api/org'
import { getDictById } from '@/api/catalog'
import { getStaffList, getRoleList, resetDptUserPsw, updatePhone } from '@/api/upms'
import { param, param2Obj, formatSex, paramAvatar, formatDictMap } from '@/utils'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import quickClick from '@/components/DialogComponents/QuickClick'
import paginationMixin from '@/components/TabComponents/mixin'
import employees from '@/views/systems/orgmanage/mixin'
import { mapGetters } from 'vuex'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        quickClick
    },
    mixins: [paginationMixin, employees],
    data() {
        const dictMap = this.$store.getters.dictData

        const checkedOrgList = []
        getOrgOpts({ type: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        checkedOrgList.push({
                            value: param({
                                orgId: item.id,
                                orgName: item.name
                            }),
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            dictMap,
            getStaffList,
            listLoading: false,
            employeesTitle: '',
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
                    prop: 'userName',
                    placeholder: '请输入员工姓名',
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
                    value: 'userRealName',
                    label: '姓名'
                },
                {
                    value: 'mobile',
                    label: '手机号',
                    width: 120
                },
                {
                    label: '性别',
                    align: 'center',
                    formatter(row) {
                        return formatSex(row.sex)
                    }
                },
                {
                    value: 'departName',
                    label: '科室'
                },
                {
                    value: 'userTypeStr',
                    label: '人员类别'
                },
                {
                    value: 'workTypeStr',
                    label: '工作形式'
                },
                {
                    value: 'doctorTypeStr',
                    label: '医生类别'
                },
                {
                    label: '医生头衔',
                    formatter(row) {
                        return formatDictMap(dictMap[488], row.doctorTitle)
                    }
                },
                {
                    label: '是否排班',
                    formatter(row) {
                        return row.isScheduling === 1 ? '是' : '否'
                    }
                },
                {
                    value: 'regFee',
                    label: '看诊费'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    width: 350,
                    operType: 'button',
                    operations: [
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        },
                        {
                            label: '修改手机号',
                            type: 'danger',
                            func: this.handleEditPhone,
                            disabled: !this.$store.getters.clinic.isAdministrator
                        },
                        {
                            label: '重置密码',
                            type: 'danger',
                            func: this.handleResetPwd
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
                        // {
                        //     label: '删除',
                        //     type: 'danger',
                        //     func: this.handleDelete
                        // }
                    ]
                }
            ],

            formEdit: null,

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
            cacheForm: {},

            formData2: [
                {
                    type: 'span',
                    name: '旧手机号',
                    field: 'oldPhone'
                },
                {
                    type: 'input',
                    name: '新手机号',
                    field: 'newPhone',
                    maxlength: 11,
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        },
                        {
                            required: true,
                            message: '请输入手机号',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            formEdit2: null,
            infos: {},
            orgId: '',
            roleList: [],
            searchForm: { checkedStatus: '1', isUse: '1', avatarFlag: 1 }
        }
    },
    computed: {
        ...mapGetters(['user'])
    },
  mounted() {
    this.handleSearch()
  },
  methods: {
    handleFormSearch(form) {
      this.pageIndex = 1
      this.handleSearch(form)
    },

    // 查询
    handleSearch(form) {
      this.listLoading = true
      this.cacheForm = this.cacheForm || form
      const params = Object.assign(this.cacheForm, form)
      params.pageNo = this.pageIndex
      params.pageSize = this.pageSize
      params.avatarFlag = 1
      getOrgClinicStaffList(params).then(res => {
        this.listLoading = false
        if (res.STATUS === '1') {
          const d = res.ITEMS
          let total = 0
          if (d.totalRecord > 0) {
            const userTypeList = this.dictMap[134]
            const workTypeList = this.dictMap[135]
            const doctorTypeList = this.dictMap[136]
            d.list.map(item => {
              item.userTypeStr = formatDictMap(userTypeList, item.userType)
              item.workTypeStr = formatDictMap(workTypeList, item.workType)
              item.doctorTypeStr = formatDictMap(doctorTypeList, item.doctorType)
            })
            total = d.totalRecord
          }
          this.tabData = d.list || []
          this.total = total
        }
        this.$nextTick(() => {
          this.$refs.editphone.close()
        })
      })
    },

    // 新增
    handleAdd() {
      if (this.$store.getters.clinic.type === 8) {
        this.searchForm = { onlineCheckStatus: 1 }
      } else {
        this.searchForm = { checkedStatus: '1', isUse: '1', avatarFlag: 1 }
      }
      this.$refs.quick.open()
    },
    // 重置密码
    handleResetPwd(row) {
      this.$confirm(`是否确认将【${row.userRealName}】的密码重置为初始状态？`, '提示', {
        type: 'warning'
      })
        .then(() => {
          resetDptUserPsw(row.userId).then(res => {
            if (res.STATUS === '1') {
              this.handleSearch()
              this.$message.success('重置成功！')
            }
          })
        })
        .catch(() => {})
    },

    // 修改手机号
    handleEditPhone(row) {
      this.infos = row
      this.$refs.editphone.open()
      this.$nextTick(() => {
        this.$refs.editphone.initforms({ oldPhone: row.mobile })
      })
    },

    // 保存新手机号
    handleConfirm2(form) {
      const userId = this.infos.userId
      const phone = form.newPhone
      updatePhone(phone, userId)
        .then(res => {
          if (res.STATUS === '1') {
            this.handleSearch()
            this.$message.success(res.MESSAGE)
          }
        })
        .catch(err => {
          this.$refs.editphone.loading = false
        })
    }
  }
}
</script>

