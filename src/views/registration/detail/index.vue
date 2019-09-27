<template>
    <div v-loading="allLoading" class="page-main registration">
        <el-row class="header">
            <h2>门诊登记详情</h2>
            <el-button icon="el-icon-arrow-left" @click="back">返回</el-button>
        </el-row>
        <el-form ref="form" :model="form" label-position="right" label-width="120px">
            <el-row class="form-container">
                <el-col :sm="18" :md="20">
                    <el-row v-for="(row,rowIndex) in formDoms" v-if="!row.hidden" :key="rowIndex">
                        <div v-if="showMore?rowIndex === 1:rowIndex === 2" class="more">
                            <el-button type="text" @click="handleShowMore">
                                更多信息
                                <i :class="showMore?'el-icon-arrow-up':'el-icon-arrow-down'" />
                            </el-button>
                        </div>
                        <div v-if="row.name" class="header-line">
                            <span v-if="rowIndex > 0" class="line" />
                            <h3>{{ row.name }}</h3>
                        </div>
                        <el-col v-for="(col,colIndex) in row.items" :key="colIndex" :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" :lg="col.lg?col.lg:8">
                            <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules" :class="col.className">
                                <span v-if="!col.name" slot="label" />
                                <!-- 输入框 -->
                                <el-input v-if="col.type === 'input' || col.type === 'autoComplete'" v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder">
                                    <template v-if="col.slot" :slot="col.slot.slot">
                                        <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" />
                                    </template>
                                </el-input>

                                <template v-else-if="col.type === 'mixin-input'">
                                    <el-form-item v-for="(c,cIndex) in col.list" :key="cIndex" :prop="c.field" :label="c.name?`${c.name}：`:''" :label-width="c.labelWidth?c.labelWidth:'0'" :rules="c.rules" style="width:33%" :class="{'suffix':c.suffix}">
                                        <!-- 输入框 -->
                                        <el-row>
                                            <el-col :span="18">
                                                <el-input v-if="c.type === 'input'" v-model="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder" @change="c.func?c.func($event):{}" />
                                            </el-col>
                                            <el-col :span="6"><span v-if="c.suffix">{{ c.suffix }}</span></el-col>
                                        </el-row>
                                    </el-form-item>
                                </template>

                                <!-- 数字输入框 -->
                                <el-input-number v-else-if="col.type === 'number'" v-model="form[col.field]" :min="col.min" :max="col.max" :precision="col.precision" :controls="false" :placeholder="col.placeholder" :maxlength="col.maxlength" :disabled="col.disabled" />

                                <!-- 按钮 -->
                                <el-button v-else-if="col.type === 'wechat'" @click="wechat">
                                    <svg-icon icon-class="wechat" style="margin-right: 5px;" />绑定微信
                                </el-button>

                                <!-- 文字 -->
                                <span v-else-if="col.type === 'text'">{{ outpatientNum }}</span>

                                <!-- 日期 -->
                                <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.field]" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat" type="date" @change="col.func?col.func($event):{}" />

                                <!-- 单选框 -->
                                <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.field]" :label="opt.value" @change="col.func?col.func($event):{}">{{ opt.label }}</el-radio>

                                <!-- 多选框 -->
                                <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                    <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                                </el-checkbox-group>

                                <!-- 选择器 -->
                                <el-select v-else-if="col.type === 'select'" v-model="form[col.field]" :disabled="col.disabled" :multiple="col.multiple" :filterable="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                                    <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>

                                <!-- 级联 -->
                                <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.field]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" :filterable="true" />

                                <!-- 上传列表 -->
                                <el-upload-row v-else-if="col.type === 'upload'" :file="col.file" :file-list="fileList" :accept="col.accept" @uploadSuccess="uploadSuccess" @handleRemove="handleRemove" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :sm="6" :md="4">
                    <div class="crop-avatar">
                        <div class="image-select" @click="uploadAvatar">
                            <div class="image-preview">
                                <img :src="avatar?avatar:unknownAvatar" alt>
                            </div>
                            <div class="image-upload">
                                <el-button>上传头像</el-button>
                            </div>
                        </div>
                        <input ref="fileInput" type="file" style="display:none" @change="fileChange($event)">
                    </div>
                </el-col>
            </el-row>
            <el-row class="submit-btn">
                <el-button :loading="loading" type="primary" @click="handleConfirm">保存</el-button>
                <el-button :loading="loading" :disabled="!form.chargeItemStr" type="primary" @click="handleConfirm('charge')">保存并收费</el-button>
                <el-checkbox v-model="isPrint">打印票据</el-checkbox>
            </el-row>

        </el-form>
        <dialog-image ref="wechat" :img-url="wechatImg" title="绑定微信" width="480px" />
        <charge ref="chargeDialog" :input-style="'width:300px;'" title="付款" @printRegister="handlePrint" @startCharge="startCharge" />
    </div>
</template>

<script>
import formMixin from '../mixin'
import { getPatientByAppointId, getPatientByRegId, patientInfo } from '@/api/arclinic'

import dialogImage from '@/components/DialogComponents/Image'
import panelCard from '@/components/Panel/PanelCard'
import elUploadRow from '@/components/Upload/index'
import charge from '@/views/charge/components/charge'
import { param, paramAvatar, getBabyAge } from '@/utils'
export default {
    components: {
        panelCard,
        dialogImage,
        elUploadRow,
        charge
    },
    mixins: [formMixin],
    watch: {
        $route() {
            this.routerChange()
        }
    },
    mounted() {
        this.routerChange()
    },
    methods: {
    // 返回
        back() {
            this.$router.push({
                name: 'registration'
            })
        },

        // 切换路由
        routerChange() {
            if (this.$route.name === 'regDetail') {
                const dom = this.$refs.form.constructor === Array ? this.$refs.form[0] : this.$refs.form
                dom.resetFields()
                const type = this.$route.params.type
                const id = this.$route.params.id
                this.formDoms[0].items[1].disabled = false
                if (type === 'appoint') {
                    this.formDoms[0].items[1].disabled = true
                    // 今日预约
                    getPatientByAppointId(id).then(res => {
                        res.ITEMS.doctorId = ''
                        res.ITEMS.deptId = ''
                        res.ITEMS.regType = ''
                        this.getSuccessCb(res, true)
                    })
                } else if (type === 'record') {
                    // 登记记录
                    this.allLoading = true
                    getPatientByRegId(id)
                        .then(res => {
                            this.getSuccessCb(res, true)
                        })
                        .catch(() => {
                            this.allLoading = false
                        })
                } else {
                    // 病人库
                    patientInfo(id).then(res => {
                        this.$nextTick(() => {
                            this.getSuccessCb(res)
                        })
                    })
                }
            }
        },

        // 患者信息查询成功回调
        getSuccessCb(res, flag = false) {
            if (res.STATUS === '1') {
                const d = flag ? res.ITEMS : res.ITEMS.patient
                this.patientInfo = d
                const attachmentList = flag ? d.attachmentList : res.ITEMS.attachmentList
                if (!d) {
                    this.$message.error('系统错误，请重试或联系管理员！')
                    return
                }
                // 是否收过费
                const isCharge = !!d.chargeStatus
                // 是否微信挂号
                const isWx = d.commercialInsuranceCode === '12'
                this.formDoms[3].items[0].disabled = isCharge || isWx
                this.formDoms[3].items[1].disabled = isCharge || isWx
                this.formDoms[1].items[4].disabled = isWx

                // // 患者来源是否妈妈团
                const isMmt = d.patientSources === '01'
                this.formDoms[1].items[2].disabled = isMmt
                this.formDoms[1].items[6].disabled = isMmt
                this.formDoms[1].items[2].opts[0].disabled = !isMmt
                this.formDoms[2].items[1].opts[0].disabled = true

                this.avatar = d.headImg
                    ? this.$store.getters.basic.filePrifix + d.headImg
                    : paramAvatar(d.sex, d.birthDate)
                const attachmentListResult = []
                if (attachmentList && attachmentList.length > 0) {
                    attachmentList.forEach(item => {
                        attachmentListResult.push({
                            businessId: item.businessId,
                            businessType: item.businessType,
                            name: item.fileName,
                            url: this.$store.getters.basic.filePrifix + item.filePath,
                            fileType: item.fileType,
                            id: item.id
                        })
                    })
                }
                this.fileList = attachmentListResult
                this.outpatientNum = d.outpatientNum || d.opCaseNum || this._generateOpNum()

                this.form = {
                    appointmentId: d.appointmentId || 0,
                    attachmentList: [], // 头像+附件
                    birthDate: d.birthDate || '',
                    cardNum: d.cardNum || '',
                    cardType: d.cardType || '',
                    chargeItemStr: d.chargeItemCode
                        ? param({
                            chargeItemCode: d.chargeItemCode,
                            chargeItemName: d.chargeItemName
                        })
                        : '',
                    chargeAmount: d.chargeAmount ? d.chargeAmount : '',
                    commercialInsuranceStr: d.commercialInsuranceCode
                        ? param({
                            commercialInsuranceCode: d.commercialInsuranceCode,
                            commercialInsuranceType: d.commercialInsuranceType
                        })
                        : '',
                    contactMan: d.contactMan || '', // 联系人姓名
                    contactSex: d.contactSex || '', // 联系人性别
                    departStr: flag
                        ? d.deptId
                            ? param({
                                departId: d.deptId,
                                departCode: d.deptCode,
                                departName: d.deptName
                            })
                            : ''
                        : this.always.departStr,
                    doctorStr: d.doctorId
                        ? param({
                            doctorId: d.doctorId,
                            doctorCode: '',
                            doctorName: d.doctorName
                        })
                        : '',
                    familyAddr: d.address || d.familyAddr || '',
                    // id: flag ? (d.id || 0) : 0,
                    idNum: d.idNum,
                    idNumType: d.idNumType,
                    isFirstClinic: flag ? d.isFirstClinic : 0,
                    matrialStatus: d.matrialStatus || '', // 婚姻状况
                    medicalInsuranceStr: d.medicalInsuranceCode
                        ? param({
                            medicalInsuranceCode: d.medicalInsuranceCode,
                            medicalInsuranceType: d.medicalInsuranceType
                        })
                        : '',
                    nation: d.nation || '01',
                    note: d.note,
                    occupation: d.occupation || '', // 职业
                    outpatientType: d.outpatientType || '门诊',
                    patientId: d.sysPatientId || d.id,
                    patientName: d.name,
                    patientSources: flag ? d.patientSources || '03' : '03',
                    phone: d.tel || d.phone || '',
                    regType: flag ? d.regType : this.always.regType,
                    region: d.region || [],
                    registerId: flag ? d.id || 0 : 0,
                    contactManRel: d.relationCode || d.contactManRelation || '', // 与患者关系
                    // relationName: d.relationName || '',
                    sex: d.sex || '',
                    workOrg: d.workOrg || '', // 预约时有工作单位
                    age: getBabyAge(d.birthDate || ''),
                    commercialInsuranceCode: d.commercialInsuranceCode,
                    ageYear: d.ageYear,
                    ageMonth: d.ageMonth,
                    ageDay: d.ageDay
                }
                this.idNumTypeChange(d.idNumType)
                this.formatAge(d.birthDate)
                if (this.cacheAccrualList.length > 1 && d.regType && d.commercialInsuranceCode !== '12') {
                    this.handleChangeRegtype(d.regType)
                }
                if (d.commercialInsuranceCode === '12') {
                    this.chargeItemsOpts()
                }
                this.allLoading = false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.page-main {
  .header {
    margin: 10px 0;
    text-align: right;
    h2 {
      float: left;
      font-size: 16px;
      font-weight: 700;
      line-height: 32px;
    }
  }
  .input-search {
    width: 202px;
  }

  .form-container {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
    .header-line {
      line-height: 36px;
      .header {
        margin-left: 10px;
        h3 {
          display: inline-block;
          font-size: 14px;
          color: #666;
        }
      }
      .line {
        display: block;
        border-bottom: 1px dashed #ccc;
        margin: 10px 0;
        margin-top: 0;
      }
    }
    .crop-avatar {
      margin-top: 36px;
      margin-left: 20px;
      .image-select {
        border: 1px solid #ddd;
        text-align: center;
        background: #fff;
        padding: 10px;
        cursor: pointer;
        .image-preview {
          width: auto;
          overflow: hidden;
          text-align: center;
          img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0 auto;
          }
        }
        .image-upload {
          margin-top: 10px;
          .el-button {
            width: 100%;
          }
        }
      }
    }
    .more {
      margin-top: -15px;
      text-align: center;
    }
  }

  .submit-btn {
    border-top: 1px solid #ccc;
    padding-top: 10px;
    text-align: right;
  }
}
</style>
<style lang='scss'>
// .mixin-input {
//   margin-bottom: 0 !important;
//   .el-form-item__content {
//       height:32px;
//     .el-input {
//       width: 100%!important;
//     }
//     .suffix {
//       display: inline-block;
//       color: #606266;
//       &:not(:last-child) {
//         margin-right: 0!important;
//       }
//       label {
//         font-size: 12px;
//         padding-right: 0;
//       }

//       span {
//         font-size: 12px;
//         display:inline-block;
//         text-align:center;
//         width:100%;
//       }
//     }
//   }
// }
</style>

