<template>
  <el-row class="page-main">
    <!-- 详情 -->
    <template v-if="type === 'detail'">
      <el-dialog title="详情" :visible.sync="detailDialogVisible" width="500px" class="chargeDetail">
        <el-row class="detailInfo">
          <el-col v-for="(item,index) in detailInfos" :key="index" :span="item.spanCount?item.spanCount:24" style="margin-bottom: 15px;">
            <span :class="item.className?item.className:''">{{item.label?`${item.label}：`:''}}</span>
            <span style="width: 350px;display: block;float: left;">{{detailInfoData[item.value]}}</span>
          </el-col>
        </el-row>
        <el-table :data="detailTableData" style="width: 100%;margin-top:20px" border header-row-class-name="headerClass">
          <el-table-column :prop="item.prop" :label="item.label" v-for="(item,index) in detailTableColumns" :key="index"></el-table-column>
        </el-table>
      </el-dialog>
    </template>

    <!-- 添加 -->
    <template v-else-if="type === 'add'">
      <el-dialog title="新增随访计划" :visible.sync="addDialogVisible" width="1000px" class="chargeDetail" center>
        <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'left','margin-bottom':'10px'}" :forms="addSearchList" :itemStyle="{'width':'200px'}" @handleSearch="handleFormSearch" />
        <el-table-self ref="multipleTable" :columns="addColumns" :table-data="addList" :table-height="300" :total-count="addCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" :tab-type="'selection'" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" @selectionChange="selectionChange" />
        <el-row>
          <el-col :span="6" v-for="(col,index) in followColumns" :key="index">
            <el-row>
              <el-col :span="10" style="line-height:32px;text-align:right">{{col.label}}：</el-col>
              <el-col :span="14">
                <el-select v-model="followSelect[col.value]" size="small">
                  <el-option v-for="item in col.opts" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <template></template>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleAddPlan">新增</el-button>
        </span>
      </el-dialog>
    </template>

    <!-- 编辑 -->
    <template v-else-if="type === 'edit'">
      <form-dialog title="编辑随访" ref="editDialog" width="500px" labelWidth="110px" :form-data="editFormData" class="chargeDetail" @handleConfirm="handleEditPlan"></form-dialog>
    </template>
  </el-row>
</template>
<script>
import { getPatientList, addFollowPlan, getFollowInfo } from '@/api/outpatient'
import { getDictByIdList } from '@/api/catalog'
import { getOrgClinicStaffList } from '@/api/org'

import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import formDialog from '@/components/DialogComponents/Form'
import paginationMixin from '@/components/TabComponents/mixin'

import {
  defaultPickOpts,
  formatSex,
  getBabyAge,
  formatDictMap,
  disabledPickerOptsAfter
} from '@/utils'
import { getCurrentDay } from '@/utils/common'
export default {
  components: {
    directSearch,
    elTableSelf,
    formDialog
  },
  mixins: [paginationMixin],

  data() {
    const dictMap = {
      493: [] // 随访类型
    }
    let str = ''
    for (const key in dictMap) {
      str += `dictId=${key}&`
    }
    str = str.substring(0, str.length - 1)
    getDictByIdList(str).then(res => {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        if (d && d.length > 0) {
          d.forEach(item => {
            dictMap[item.dictId].push({
              value: item.code,
              label: item.name
            })
          })
        }
      }
    })

    const doctorList = [
      // {
      //   value: "",
      //   label: "请选择"
      // }
    ]
    getOrgClinicStaffList({ pageNo: 1, pageSize: 100, isUse: 1 }).then(res => {
      if (res.STATUS === '1') {
        const d = res.ITEMS
        if (d.totalRecord > 0) {
          d.list.forEach(item => {
            doctorList.push({
              value: item.userRealName,
              label: item.userRealName
            })
          })
        }
      }
    })
    return {
      type: '',
      detailDialogVisible: false,
      editDialogVisible: false,
      addDialogVisible: false,
      detailInfos: [
        {
          label: '患者',
          value: 'patientName',
          className: 'firstSpan',
          style: 'margin-bottom:5px'
        },
        {
          label: '性别',
          value: 'sex',
          className: 'firstSpan',
          style: 'margin-bottom:5px'
        },
        {
          label: '年龄',
          value: 'age',
          className: 'firstSpan',
          style: 'margin-bottom:5px'
        },
        {
          label: '门诊医生',
          value: 'doctorName',
          className: 'firstSpan'
        },
        {
          label: '计划日期',
          value: 'planFuDate',
          className: 'firstSpan'
        },
        {
          label: '计划随访类型',
          value: 'planFuClass',
          className: 'firstSpan'
        },
        {
          label: '计划随访人员',
          value: 'planFuUserName',
          className: 'firstSpan'
        },
        {
          label: '计划随访事项',
          value: 'fuContent',
          className: 'firstSpan'
        },
        {
          label: '西医诊断',
          value: 'diagnosis',
          className: 'firstSpan'
        }
      ],
      detailInfoData: {},
      detailTableColumns: [
        {
          label: '随访日期',
          prop: 'actualFuDate'
        },
        {
          label: '随访人员',
          prop: 'actualFuUserName'
        },
        {
          label: '随访方式',
          prop: 'patientTag'
        },
        {
          label: '随访结果',
          prop: 'actualFuResult'
        }
      ],
      detailTableData: [],

      addSearchList: [
        {
          type: 'date',
          label: '就诊日期',
          prop: 'clinicTime',
          valueFormat: 'yyyy-MM-dd',
          options: defaultPickOpts.opts,
          rules: [{ required: true, message: '就诊日期必填', trigger: 'change' }]
        },
        {
          type: 'input',
          label: '项目',
          prop: 'treatmentItem',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          },
          labelWidth: '60px'
        },
        {
          type: 'checkbox',
          label: '',
          prop: 'isMyPatient',
          opts: [
            {
              label: '我的病人',
              value: '1'
            }
          ],
          labelWidth: '20px'
        }
      ],

      addColumns: [
        {
          label: '姓名',
          value: 'patientName',
          operType: 'label'
        },
        {
          label: '医生',
          value: 'doctorName'
        },
        {
          label: '项目',
          value: 'treatmentItem'
        },
        {
          label: '就诊时间',
          value: 'clinicTime'
        },
        {
          label: '计划时间',
          value: 'planFuDate',
          operType: 'date',
          dateType: 'datetime',
          showDate: true,
          size: 'mini',
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          options: disabledPickerOptsAfter,
          width: '210px'
        },
        {
          label: '随访事项',
          value: 'fuContent',
          operType: 'input',
          showInput: true,
          size: 'mini'
        }
      ],
      addList: [],
      addCount: 0,

      editFormData: [
        {
          type: 'span',
          name: '患者',
          field: 'patientName',
          style: 'margin-bottom:5px'
        },
        {
          type: 'span',
          name: '性别',
          field: 'sex',
          style: 'margin-bottom:5px'
        },
        {
          type: 'span',
          name: '年龄',
          field: 'age',
          style: 'margin-bottom:5px'
        },
        {
          type: 'span',
          name: '门诊医生',
          field: 'doctorName'
        },
        {
          type: 'date',
          name: '计划日期',
          field: 'planFuDate',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          operType: 'date',
          dateType: 'datetime',
          width: '210px',
          showDate: true,
          format: 'yyyy-MM-dd HH:mm:ss',
          options: disabledPickerOptsAfter,
          rules: [
            {
              required: true,
              message: '计划日期必填',
              trigger: 'change'
            }
          ]
        },
        {
          type: 'select',
          name: '计划随访类型',
          field: 'planFuClass',
          opts: dictMap[493]
        },
        {
          type: 'select',
          name: '计划随访人员',
          field: 'planFuUserName',
          opts: doctorList
        },
        {
          type: 'input',
          name: '计划随访内容',
          field: 'fuContent',
          rows: 3,
          inputType: 'textarea',
          rules: [
            {
              required: true,
              message: '计划随访内容必填',
              trigger: 'change'
            }
          ]
        }
      ],

      options: [{ label: '治疗后随访', value: '1' }],

      cacheForm: { clinicTime: getCurrentDay().split(' ')[0] },
      followColumns: [
        {
          label: '计划随访人员',
          value: 'planFuUserName',
          opts: doctorList,
          rules: [
            {
              required: true,
              message: '计划随访人员必填',
              trigger: 'change'
            }
          ]
        },
        {
          label: '随访类型',
          value: 'planFuClass',
          opts: dictMap[493]
        }
      ],
      followSelect: {
        planFuUserName: '',
        planFuClass: ''
      },
      selectData: [],
      patientInfo: {},
      dictMap
    }
  },
  methods: {
    open(type, patientInfo) {
      this.patientInfo = patientInfo
      this.type = type
      if (type === 'detail') {
        getFollowInfo(patientInfo.id).then(res => {
          let params = {}
          this.detailTableData = []
          if (res.STATUS === '1') {
            params = res.ITEMS
            params.sex = formatSex(params.sex)
            params.age = params.birthDate
              ? getBabyAge(
                  params.birthDate.indexOf('.0') > -1
                    ? params.birthDate.split('.0')[0]
                    : params.birthDate
                )
              : ''
            params.planFuClass = formatDictMap(this.dictMap[493], params.planFuClass)
            params.planFuDate = params.planFuDate ? params.planFuDate : ''
            this.detailTableData.push({
              actualFuDate: params.actualFuDate ? params.actualFuDate.split(' ')[0] : '',
              actualFuUserName: params.actualFuUserName,
              patientTag: params.patientTag,
              actualFuResult: params.actualFuResult
            })
            this.detailInfoData = params
          }
          this.$nextTick(() => {
            this.detailDialogVisible = true
          })
        })
      } else if (type === 'add') {
        this.addDialogVisible = true
        this.followSelect.planFuUserName =
          this.followSelect.planFuUserName || this.$store.getters.user.realName
        this.$nextTick(() => {
          this.handleSearch()
        })
      } else if (type === 'edit') {
        getFollowInfo(patientInfo.id).then(res => {
          let params = {}
          if (res.STATUS === '1') {
            params = res.ITEMS
            params.sex = formatSex(params.sex)
            params.age = params.birthDate
              ? getBabyAge(
                  params.birthDate.indexOf('.0') > -1
                    ? params.birthDate.split('.0')[0]
                    : params.birthDate
                )
              : ''
          }
          this.$nextTick(() => {
            this.$refs.editDialog.open()
            params.planFuUserName = params.planFuUserName || this.$store.getters.user.realName
            this.$nextTick(() => {
              this.$refs.editDialog.initforms(params)
            })
          })
        })
      }
    },
    handleFormSearch(form) {
      this.pageIndex = 1
      this.handleSearch(form)
    },
    handleSearch(form) {
      
          this.cacheForm = this.cacheForm || form
      const params = Object.assign(this.cacheForm, form)
      this.$refs.form.initforms(params)
      this.$nextTick(() => {
        params.pageNo = this.pageIndex
        params.pageSize = this.pageSize
        params.isMyPatient = params.isMyPatient && params.isMyPatient.length > 0 ? 1 : 0
        this.$refs.form.$refs.form.validate((valid) =>{
        if(valid){
          getPatientList(params).then(res => {
            if (res.STATUS === '1') {
              const d = res.ITEMS.list
              this.addList = d
              this.addCount = res.ITEMS.totalRecord
            }
          })
           }
      })
      })
       
      // console.log(this.$refs,'1234141')
      
    },

    selectionChange(val) {
      this.selectData = val
    },

    // 新增随访计划
    handleAddPlan() {
      const data = []
      let flag = true
      if (this.selectData && this.selectData.length > 0) {
        this.selectData.forEach(item => {
          if (item.planFuDate && item.fuContent) {
            data.push({
              caseId: item.caseId,
              patientId: item.patientId,
              registerId: item.registerId,
              planFuDate: item.planFuDate,
              fuContent: item.fuContent,
              planFuUserName: this.followSelect.planFuUserName,
              planFuClass: this.followSelect.planFuClass
            })
          } else {
            flag = false
          }
        })
      } else {
        this.$message.error('请先选择患者')
        return
      }
      if (!flag) {
        this.$message.warning('计划时间和随访事项必填')
        return
      }
      addFollowPlan(data).then(res => {
        if (res.STATUS === '1') {
          this.$message.success(res.MESSAGE)
          this.addDialogVisible = false
          this.$emit('handleSearch')
        }
      })
    },

    // 编辑随访计划
    handleEditPlan(form) {
      this.$refs.editDialog.$refs.form.validate(valid => {
        if (valid) {
          const data = []
          data.push({
            caseId: this.patientInfo.caseId,
            id: this.patientInfo.id,
            patientId: this.patientInfo.patientId,
            registerId: this.patientInfo.registerId,
            planFuDate: form.planFuDate,
            planFuUserName: form.planFuUserName,
            planFuClass: form.planFuClass,
            fuContent: form.fuContent
          })
          addFollowPlan(data).then(res => {
            if (res.STATUS === '1') {
              this.$message.success(res.MESSAGE)
              this.$refs.editDialog.close()
              this.$emit('handleSearch')
            }
          })
        }
      })
    }
  },
  mounted() {}
}
</script>

<style lang="scss">
.headerClass {
  th {
    background-color: #eef5fd !important;
    color: #586276;
    font-weight: normal;
  }
}

.firstSpan {
  width: 100px;
  display: inline-block;
  text-align: right;
  float: left;
}

.chargeDetail {
  .el-dialog__header {
    background: #0097ff;

    .el-dialog__title {
      color: #fff;
      text-align: center;
      display: inline-block;
      width: 100%;
    }
    .el-dialog__headerbtn .el-dialog__close {
      color: #fff;
    }
  }
}
</style>
<style>
.chargeDetail .el-table--border td,
.chargeDetail .el-table--border th {
  padding: 5px 0;
}
</style>