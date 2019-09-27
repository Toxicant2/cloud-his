<template>
    <el-row style="padding: 0 20px 20px;">
        <el-row style="text-align:right;">
            <el-button icon="el-icon-arrow-left" style="margin-top: 7px;" @click.native="back">返回</el-button>
        </el-row>
        <el-row>
            <el-form ref="form" :model="form" :label-position="labelPosition" :label-width="labelWidth" :size="size" :disabled="disabled" class="el-form-panel" :inline="true">
                <el-row v-for="(row,rowIndex) in forms" :key="rowIndex">
                    <div v-if="rowIndex > 0" class="line"/>
                    <h2 v-if="row.name" class="title">{{ row.name }}</h2>
                    <el-form-item v-for="(col,colIndex) in row.list" :key="colIndex" :label="`${col.name}：`" :prop="col.basic?col.basicKey? `${col.basicKey}.${col.basic}`: `${col.basic}`:''" :rules="col.rules" :label-width="col.labelWidth" style="width:100%;" :class="col.className">
                        <span v-if="!col.name" slot="label"/>
                        <!-- 输入框 -->
                        <el-input v-if="col.type === 'input'" :type="col.inputType?col.inputType:''" :disabled="col.disabled" :placeholder="col.placeholder" :autosize="col.autosize" v-model="form[col.basic]" :maxlength="col.maxlength"/>

                        <!-- 日期 -->
                        <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.basic]" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat"/>

                        <!-- 选择器 -->
                        <el-select v-else-if="col.type === 'select'" v-model="form[col.basic]" :multiple="col.multiple" placeholder="请选择" @change="col.basic === 'certType'?handleCertChange($event):{}">
                            <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :disabled="opt.disabled" :label="opt.label" :value="opt.value"/>
                        </el-select>

                        <!-- 单选框 -->
                        <el-radio v-else-if="col.type === 'radio'" v-for="(opt,optIndex) in col.opts" v-model="form[col.basic]" :key="optIndex" :label="opt.value">{{ opt.label }}
                        </el-radio>

                        <!-- 多选框 -->
                        <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.basic]">
                            <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                        </el-checkbox-group>

                        <!-- 级联 -->
                        <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.basic]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" filterable/>

                        <!-- 上传列表 -->
                        <el-upload-row v-for="(item,index) in col.question" v-else-if="col.type === 'upload'" :key="index" :file="item" :list-type="'picture-card'" :file-list="fileList[item.fileIndex]" :class="{isHidden:tempList1[item.fileIndex].length>=item.limit}" @uploadSuccess="uploadSuccess" @deleteUpload="deleteUpload"/>

                        <!-- 就诊时间 -->
                        <template v-else-if="col.type === 'consultingHour'">
                            <div v-for="(item,itemIndex) in col.list" :key="itemIndex" class="doctor-hour">
                                <span>{{ item.name }}：</span>
                                <el-time-select
style="width:120px;"
v-model="form[item.basic][0]" placeholder="起始时间" :picker-options="{
                                    start: item.start,
                                    step: item.step,
                                    end: item.end,
                                    maxTime:form[item.basic][1]
                                }"
/>
                                &ensp;-&ensp;
                                <el-time-select
style="width:120px;"
v-model="form[item.basic][1]" placeholder="结束时间" :picker-options="{
                                    start: item.start,
                                    step: item.step,
                                    end: item.end,
                                    minTime:form[item.basic][0]
                                }"
/>
                            </div>
                        </template>
                    </el-form-item>

                </el-row>

                <el-row style="text-align:center;">
                    <template v-if="!disabled">
                        <el-button type="primary" :size="size" style="padding-left:50px;padding-right:50px;" :loading="loading" @click="handleClick">{{ btnText }}</el-button>
                    </template>
                </el-row>
            </el-form>
            <el-row v-if="disabled" style="text-align:center;">
                <el-button type="primary" :size="size" style="padding-left:50px;padding-right:50px;" :loading="loading" @click="handleExamine('1')">审核通过</el-button>
                <el-button type="primary" :size="size" style="padding-left:50px;padding-right:50px;" :loading="loading" @click="handleExamine('2')">审核不通过</el-button>
            </el-row>
            <el-dialog title="审核未通过" :visible.sync="dialogVisible">
                <el-row :gutter="20">
                    <el-col :span="3" style="text-align:right;">备注：</el-col>
                    <el-col :span="20">
                        <el-input type="textarea" :rows="2" v-model="checkedNote" placeholder="请输入审核未通过原因"/>
                    </el-col>

                </el-row>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleDialog">确 定</el-button>
                </div>
            </el-dialog>
        </el-row>
    </el-row>
</template>

<script type="text/ecmascript-6">
import dialogImage from '@/components/DialogComponents/Image'
import { clinic } from '../tpl/clinic'
// import { clinic } from '@/views/register/tpl/clinic'
import { param2Obj } from '@/utils'
import elUploadRow from '@/components/Upload/index'

export default {
    components: {
        dialogImage,
        elUploadRow
    },
    props: {
        orgId: { type: Number },
        parentId: { type: Number },
        orgName: { type: String },
        orgInfo: { type: Object },
        curNodeData: { type: Object },
        toggleSts: { type: Boolean },
        disabled: { type: Boolean, default: false }
    },
    data() {
    // 表单初始化
        const form = {}
        clinic.forEach(row => {
            row.list.forEach(col => {
                if (col.type === 'consultingHour') {
                    col.list.forEach(item => {
                        form[item.basic] = ['', '']
                    })
                } else {
                    if (col.basic) {
                        if (col.type === 'cascader' || col.type === 'checkbox') {
                            form[col.basic] = []
                        } else {
                            form[col.basic] = ''
                        }
                    }
                }
            })
        })

        return {
            forms: clinic,
            btnText: '重新提交审核',
            dialogTitle: '',
            imgUrl: '',
            isShowFileInput: false,
            filePrefix: this.$store.getters.basic.filePrefix,
            // form,
            loading: false,
            isHidden: false,
            uploadIndex: -1,
            uploadItemIdx: -1,
            attachmentList: [],
            labelPosition: 'right',
            labelWidth: '160px',
            size: 'small',
            checkedStatus: '',
            dialogVisible: false,
            checkedNote: '',

            authCode: process.env.VUE_APP_API_ROOT + '/upms/code/',
            randomCode: 0,
            form: {
                morning: ['', ''],
                afternoon: ['', ''],
                night: ['', '']
            },
            fileList: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: []
            },
            tempList: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: []
            },
            tempList1: {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: []
            }
        }
    },
    watch: {
        forms(newVal) {
            this.formatForm()
        }
    },
    created() {
        if (this.toggleSts) {
            // 编辑
            this.initforms(this.orgInfo)
        } else {
            // 新增
            this.initforms()
        }
    },
    methods: {
        back() {
            this.$emit('goBack')
        },

        // 表单赋值
        initforms(edit) {
            const form = {}
            let attachmentList = []
            if (edit) {
                const orgInfo = edit.orgInfo
                const org = edit.org
                const base = edit.base
                const subject = edit.subjectList
                attachmentList = edit.attachmentList
                this.forms.forEach(row => {
                    row.list.forEach(col => {
                        if (col.type === 'consultingHour') {
                            col.list.forEach(item => {
                                let val = null
                                if (item.basic === 'morning') {
                                    val = orgInfo ? this.handleTime(orgInfo.morningOpenTime) : ''
                                } else if (item.basic === 'afternoon') {
                                    val = orgInfo ? this.handleTime(orgInfo.afternoonOpenTime) : ''
                                } else {
                                    val = orgInfo ? this.handleTime(orgInfo.nightOpenTime) : ''
                                }
                                form[item.basic] = [val.start, val.end]
                            })
                        } else {
                            if (col.basic) {
                                if (col.type === 'cascader') {
                                    form[col.basic] = orgInfo
                                        ? [orgInfo.province, orgInfo.city, orgInfo.district]
                                        : []
                                } else if (col.type === 'checkbox') {
                                    const opts = []
                                    subject.forEach(item => {
                                        opts.push(
                                            `sort=${item.sort}&subjectCode=${
                                                item.subjectCode
                                            }&subjectName=${encodeURIComponent(item.subjectName)}`
                                        )
                                    })
                                    form[col.basic] = opts
                                } else if (
                                    col.basic === 'name' ||
                  col.basic === 'code' ||
                  col.basic === 'orgLevel'
                                ) {
                                    // 组织机构代码、类型数据在org中
                                    if (col.basic === 'orgLevel') {
                                        form[col.basic] = String(org[col.basic])
                                    } else {
                                        form[col.basic] = org[col.basic]
                                    }
                                } else if (col.basic === 'username') {
                                    form[col.basic] = base.userName
                                } else if (col.basic === 'phone') {
                                    form[col.basic] = base.mobileNum
                                } else {
                                    form[col.basic] = orgInfo ? orgInfo[col.basic] : ''
                                }
                            }
                        }
                    })
                })
                this.forms[0].list[0].disabled = true
                this.forms[0].list[1].disabled = true
                this.forms[0].list[0].rules[0].required = false
                this.forms[0].list[1].rules[0].required = false
            } else {
                // 新增
                this.forms.forEach(row => {
                    row.list.forEach(col => {
                        if (col.type === 'consultingHour') {
                            col.list.forEach(item => {
                                form[item.basic] = ['', '']
                            })
                        } else {
                            if (col.basic) {
                                if (col.type === 'cascader' || col.type === 'checkbox') {
                                    form[col.basic] = []
                                } else {
                                    form[col.basic] = ''
                                }
                            }
                        }
                    })
                })
                this.forms[1].list[4].opts[0].disabled = true
                this.forms[0].list[0].disabled = false
                this.forms[0].list[1].disabled = false
                this.forms[0].list[0].rules[0].required = true
                this.forms[0].list[1].rules[0].required = true
            }
            // form.orgId = this.orgId
            form.orgName = this.orgName
            this.form = form
            this.attachmentList = attachmentList
            const list = attachmentList
            const fileList = {
                i1: [],
                i2: [],
                i3: [],
                i4: [],
                i5: [],
                i6: [],
                i9: []
            }
            if (list && list.length > 0) {
                list.forEach(item => {
                    const file = {
                        businessId: item.businessId,
                        businessType: item.businessType,
                        name: item.fileName,
                        url: this.$store.getters.basic.filePrifix + item.filePath,
                        fileType: item.fileType,
                        id: item.id
                    }
                    if (item.businessType === 1 || item.businessType === 20) {
                        fileList.i1.push(file)
                    } else if (item.businessType === 3 || item.businessType === 21) {
                        fileList.i2.push(file)
                    } else if (item.businessType === 4 || item.businessType === 22) {
                        fileList.i3.push(file)
                    } else if (item.businessType === 23) {
                        fileList.i4.push(file)
                    } else if (item.businessType === 24) {
                        fileList.i5.push(file)
                    } else if (item.businessType === 28) {
                        fileList.i6.push(file)
                    } else if (item.businessType === 9) {
                        fileList.i9.push(file)
                    }
                })
            }
            if (fileList.i9 && fileList.i9.length > 0) {
                this.isHidden = true
            }
            this.fileList = fileList
            this.tempList1 = Object.assign({}, fileList)
            this.$nextTick(() => {
                if (this.$refs.form && this.$refs.form.clearValidate) {
                    this.$refs.form.clearValidate()
                }
            })
        },
        handleTime(str) {
            const arr = str.split('-')
            return {
                start: arr[0],
                end: arr[1]
            }
        },
        handleClick() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.saveFormData()
                } else {
                    window.scrollTo(0, 0)
                }
            })
        },
        saveFormData() {
            // 新增、编辑的时候，orgId取的都是curNodeData中的id
            // this.loading = true
            const tpl = this.form
            if (tpl.subjectList.length === 0) {
                this.$message.error('请至少选择一项诊疗科目')
                return false
            }
            const subjectList = []
            tpl.subjectList.forEach(item => {
                subjectList.push(param2Obj(item))
            })
            const params = {
                attachmentList: tpl.attachmentList ? tpl.attachmentList : [],
                subjectList,
                org: {},
                orgInfo: {}
            }
            params.orgInfo = {
                address: tpl.address,
                afternoonOpenTime: tpl.afternoon.join('-') === '-' ? '' : tpl.afternoon.join('-'),
                city: tpl.level3[1] || '',
                contacttPhone: '',
                district: tpl.level3[2] || '',
                id: 0,
                introduction: tpl.introduction,
                isCommercialInsurance: tpl.isCommercialInsurance,
                isHolidayOpen: tpl.isHolidayOpen,
                isMedicalInsurance: tpl.isMedicalInsurance,
                isSharePatientInfo: tpl.isSharePatientInfo,
                licenseName: tpl.licenseName,
                licenseNum: tpl.licenseNum,
                morningOpenTime: tpl.morning.join('-') === '-' ? '' : tpl.morning.join('-'),
                nightOpenTime: tpl.night.join('-') === '-' ? '' : tpl.night.join('-'),
                orgId: tpl.orgId,
                province: tpl.level3[0] || '',
                telephone: tpl.telephone
            }
            params.org = {
                code: tpl.code,
                name: tpl.name,
                orgLevel: tpl.orgLevel,
                parentId: this.parentId
            }
            if (this.toggleSts) {
                const info = this.orgInfo
                params.org.id = info.orgInfo.sysOrgId
                params.orgInfo.id = info.orgInfo.id
                params.orgInfo.sysOrgId = info.orgInfo.sysOrgId
                this.$emit('handleEditClick', params)
            } else {
                params.base = {
                    username: tpl.username,
                    phone: tpl.phone
                }
                this.$emit('handleSaveClick', params)
            }
        },
        // 审核
        handleExamine(val) {
            this.checkedStatus = val
            if (val === '2') {
                this.dialogVisible = true
            } else {
                const data = {
                    checkedStatus: 1,
                    orgId: this.orgId,
                    checkedNote: ''
                }
                this.$emit('submitCheck', data)
            }
        },
        handleDialog() {
            if (!this.checkedNote) {
                this.$message.warning('请输入审核未通过原因')
                return
            }
            const data = {
                checkedStatus: 2,
                orgId: this.orgId,
                checkedNote: this.checkedNote
            }
            this.$emit('submitCheck', data)
        },
        handleClinicTime(arr) {
            return !!(arr[0] && arr[1])
        },

        // 文件上传成功
        uploadSuccess(fileList, obj) {
            const result = []
            // 只处理本次上传
            fileList.forEach(item => {
                if (item.response) {
                    const col = item.response.ITEMS[0]
                    result.push({
                        businessType: col.businessType,
                        fileName: col.fileName,
                        fileNote: '',
                        filePath: col.filePath,
                        fileSize: col.fileSize,
                        fileType: obj.fileType
                    })
                }
            })
            this.tempList[obj.fileIndex] = result
            this.tempList1[obj.fileIndex] = result
            if (obj.fileType === 9) {
                if (result && result.length > 0) {
                    this.isHidden = true
                }
            }
            let attachmentList = []
            for (const key in this.tempList) {
                attachmentList = attachmentList.concat(this.tempList[key])
            }
            this.form.attachmentList = attachmentList
        },

        // 删除图片回调
        deleteUpload(file) {
            let fileIndex = null
            if (file.businessType === 1 || file.businessType === 20) {
                fileIndex = 'i1'
            } else if (file.businessType === 3 || file.businessType === 21) {
                fileIndex = 'i2'
            } else if (file.businessType === 4 || file.businessType === 22) {
                fileIndex = 'i3'
            } else if (file.businessType === 23) {
                fileIndex = 'i4'
            } else if (file.businessType === 24) {
                fileIndex = 'i5'
            } else if (file.businessType === 29) {
                fileIndex = 'i6'
            } else if (file.businessType === 9) {
                fileIndex = 'i9'
            } else if (file.businessType === 5) {
                fileIndex = 'i10'
            } else if (file.businessType === 6) {
                fileIndex = 'i11'
            } else if (file.businessType === 7) {
                fileIndex = 'i12'
            }
            if (!file.id) {
                this.tempList[fileIndex].splice(0, 1)
            }
            this.tempList1[fileIndex].splice(0, 1)
            let attachmentList = []
            for (const key in this.tempList) {
                attachmentList = attachmentList.concat(this.tempList[key])
            }
            this.form.attachmentList = attachmentList
        }
    }
}
</script>

<style lang="scss">
.el-form-panel {
  .el-input,
  .el-date-editor.el-input__inner,
  .el-textarea {
    width: 296px;
  }
  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #606266;
  }
  .subject {
    .el-form-item__content {
      width: 675px;
    }
  }
}
.isHidden .el-upload--picture-card {
  display: none;
}
</style>
<style lang="scss" scoped>
.el-form-panel {
  .line {
    width: 100%;
    height: 20px;
    border-top: 1px dashed #ccc;
  }
  h2.title {
    font-size: 18px;
    color: #4a4a4a;
    padding-left: 20px;
    margin-bottom: 10px;
  }
  .register {
    font-size: 14px;
    color: #606265;
    margin-left: 20px;
    a {
      color: #409eff;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .code {
    width: 96px;
    height: 28px;
    float: right;
    margin-left: 10px;
  }
  .doctor-hour {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    > span {
      color: #606266;
    }
  }
  .img-content {
    margin-bottom: 10px;
    width: 148px;
    height: 148px;
    line-height: 146px;
    background-color: #fbfdff;
    border: 1px dashed #c0ccda;
    border-radius: 6px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    vertical-align: top;
    font-size: 14px;
    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
    .addImg {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
      > i {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 28px;
        color: #8c939d;
      }
      .explain-text {
        position: absolute;
        width: 100%;
        line-height: normal;
        text-align: center;
        top: 55%;
        font-size: 12px;
        color: #b1b1b1;
      }
      .addInput {
        display: none;
      }
    }
    .showImg {
      position: relative;
      height: 100%;
      .img-item {
        width: 100%;
        height: 100%;
      }
      .itemActions {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        cursor: default;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-transition: opacity 0.3s;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
        > span {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
