<template>
    <el-row class="page-main reservateDetail" @click.native="closeSelectData">
        <el-form ref="form" :model="form" label-position="right" label-width="120px" :disabled="isDisabled">
            <el-row class="form-container img">
                <el-col :sm="18" :md="20">
                    <el-row v-for="(row,rowIndex) in formDoms" v-if="!row.hidden" :key="rowIndex">
                        <div v-if="row.name" class="header-line">
                            <span v-if="rowIndex > 0" class="line"/>
                            <h3>{{ row.name }}</h3>
                        </div>
                        <el-col :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" v-for="(col,colIndex) in row.items" :lg="col.lg?col.lg:8" :key="colIndex" style="height:47px;">
                            <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules">
                                <!-- 输入框 -->
                                <el-input v-if="col.type === 'input'" v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder">
                                    <template v-if="col.slot" :slot="col.slot.slot">
                                        <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" @click.native="col.slot.func"/>
                                    </template>
                                </el-input>

                                <template v-if="col.type === 'inputSelect'">
                                    <el-input v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder" @input="col.func?col.func($event):{}">
                                        <template v-if="col.slot" :slot="col.slot.slot">
                                            <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" @click="col.func?col.func($event):{}"/>
                                        </template>
                                    </el-input>
                                    <el-popover v-model="popoverVisible" width='900' placement="bottom">
                                        <el-table-self :list-loading="listLoading" @rowClick="clickRow" :table-height="200" :table-data="selectTabData" :columns="selectTabColumns" />
                                    </el-popover>
                                </template>

                                <!-- 文字 -->
                                <span v-if="col.type === 'text'">
                                    {{ form[col.field] }}
                                </span>

                                <!-- 日期 -->
                                <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.field]" type="date" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat" @change="col.func?col.func($event):{}"/>

                                <!-- 单选框 -->
                                <el-radio v-else-if="col.type === 'radio'" v-for="(opt,optIndex) in col.opts" v-model="form[col.field]" :key="optIndex" :label="opt.value">{{ opt.label }}
                                </el-radio>

                                <!-- 多选框 -->
                                <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                    <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                                </el-checkbox-group>

                                <!-- 选择器 -->
                                <el-select v-else-if="col.type === 'select'" :disabled="col.disabled" :multiple="col.multiple" v-model="form[col.field]" :filterable="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                                    <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>

                                <!-- 带分组选择器 -->
                                <el-select v-else-if="col.type === 'selectOptins'" v-model="form[col.field]" placeholder="请选择">
                                    <el-option-group v-for="group in col.opts" :key="group.label" :label="group.label">
                                        <el-option v-for="(item,index) in group.options" :key="index" :label="item" :value="item"/>
                                    </el-option-group>
                                </el-select>

                                <!-- 级联 -->
                                <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.field]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" :filterable="true"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :sm="6" :md="4">
                    <div class="crop-avatar">
                        <div class="image-select" @click="uploadAvatar">
                            <div class="image-preview">
                                <img :src="avatar?avatar:unknownAvatar" alt="">
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
                <el-button @click="$router.back()">返回</el-button>
                <el-button type="primary" @click="handleConfirm">保存</el-button>
            </el-row>
        </el-form>
    </el-row>
</template>

<script>
import { appointmentInfo, patientInfo, likeNameGetInfo, modifyAppointment } from '@/api/arclinic'
import { uploadFile } from '@/api/upload'
import { getDepartmentOpts, getOrgClinicStaffList, getOrgInfo } from '@/api/org'
import { getDictByIdList } from '@/api/catalog'

import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import cityList from '@/common/data/city.js'
import elTableSelf from '@/components/TabComponents/index'
import ImageCropper from '@/components/ImageCropper'
import {
    formatSex,
    getBabyAge,
    disabledPickerOpts,
    disabledPickerOptsAfter,
    deepClone,
    param2Obj,
    param,
    paramAvatar
} from '@/utils'
import { mapGetters } from 'vuex'
export default {
    components: {
        ImageCropper,
        elTableSelf
    },
    data() {
        const dictMap = {
            9: [], // 性别
            20: [], // 职业
            29: [], // 民族
            78: [], // 医保类型
            79: [], // 用户类型
            30: [], // 患者来源
            143: [], // 预约类型
            107: [], // 婚姻状况
            131: [] // 证件类型
        }
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    let obj = {}
                    if (item.dictId === 78) {
                        obj = {
                            value: param({ medicalInsuranceCode: item.code, medicalInsuranceType: item.name }),
                            label: item.name
                        }
                    } else if (item.dictId === 79) {
                        obj = {
                            value: param({
                                commercialInsuranceCode: item.code,
                                commercialInsuranceType: item.name
                            }),
                            label: item.name
                        }
                        if (item.code === '3') {
                            obj.disabled = true
                        }
                    } else {
                        obj = {
                            value: item.code,
                            label: item.name
                        }
                    }
                    if (item.dictId === 30 && item.code === '01') {
                        obj.disabled = true
                    }
                    if (item.dictId === 131) {
                        if (item.code === '1' || item.code === '7') {
                            dictMap[item.dictId].push({
                                value: item.code,
                                label: item.name
                            })
                        }
                    } else {
                        dictMap[item.dictId].push(obj)
                    }
                })
            }
        })
        // 科室
        const departmentList = []
        getDepartmentOpts().then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                this._.forEach(d, function(item) {
                    departmentList.push({
                        value: param({
                            departId: item.id,
                            departCode: item.code,
                            departName: item.name
                        }),
                        label: item.name
                    })
                })
            }
        })
        // 医师
        const doctorList = []
        getOrgClinicStaffList({ pageNo: 1, pageSize: 100, userType: 1, isUse: 1 }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d.totalRecord > 0) {
                    this._.forEach(d.list, function(item) {
                        doctorList.push({
                            value: param({
                                doctorId: item.userId,
                                doctorCode: '',
                                doctorName: item.userRealName
                            }),
                            label: item.userRealName
                        })
                    })
                }
            }
        })
        return {
            value1: '',
            unknownAvatar,
            popoverVisible: false,
            listLoading: false,
            selectTabData: [],
            selectTabColumns: [
                {
                    value: 'name',
                    label: '姓名'
                },
                {
                    value: 'temp_sex',
                    label: '性别'
                },
                {
                    value: 'age',
                    label: '年龄'
                },
                {
                    value: 'phone',
                    label: '手机号码'
                },
                {
                    value: 'idNum',
                    label: '证件号码'
                }
            ],
            id: 0, // 预约id
            avatar: '',
            tabMapOpts: [
                {
                    label: '诊所预约',
                    key: 'order'
                },
                {
                    label: '排班管理',
                    key: 'add'
                }
            ],
            isDisabled: false,
            form: {
                appointmentClass: '1', // 预约类型
                time: '',
                appointmentDateTemp: '',
                appointmentDate: '', // 预约时间
                appointmentId: 0, // 预约ID新增时为0
                appointmentMethod: '03', // 预约方式
                attachmentList: [], // 头像+附件
                birthDate: '', // 出生年月
                departStr: '', // 科室
                // 'commercialInsuranceType': '',
                // 'commercialInsuranceCode': '',
                commercialInsuranceStr: param({
                    commercialInsuranceCode: 99,
                    commercialInsuranceType: '自费'
                }), // 用户类型
                diseaseDescription: '', // 预约内容
                doctorStr: '', // 医生
                idNum: '', // 证件号码
                idNumType: '', // 证件类型
                matrialStatus: '', // 婚姻状况
                // 'medicalInsuranceType': '',
                // 'medicalInsuranceCode': '',
                medicalInsuranceStr: '', // 医保类型
                nation: '01', // 民族
                note: '', // 备注
                occupation: '', // 职业
                patientId: 0, // 患者ID新增时为0
                patientName: '', // 患者姓名
                phone: '', // 患者手机号
                region: [], // 三级地址
                sex: '', // 患者性别
                wechat: '', // 微信
                workOrg: '', // 工作单位
                age: '' // -- 前端显示用，不传入后端
            },
            formDoms: [
                {
                    name: '',
                    items: [
                        {
                            type: 'inputSelect',
                            name: '患者姓名',
                            field: 'patientName',
                            rules: [{ required: true, message: '姓名必填', trigger: 'blur' }],
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            },
                            func: this.searchPatient
                        },
                        {
                            type: 'date',
                            name: '出生年月',
                            field: 'birthDate',
                            options: disabledPickerOpts,
                            rules: [{ required: true, message: '请选择出生日期', trigger: 'blur' }],
                            format: 'yyyy-MM-dd',
                            valueFormat: 'yyyy-MM-dd 00:00:00',
                            func: this.formatAge
                        },
                        {
                            type: 'input',
                            name: '年龄',
                            field: 'age',
                            disabled: true
                        },
                        {
                            type: 'select',
                            name: '性别',
                            field: 'sex',
                            opts: dictMap[9]
                        },
                        {
                            type: 'input',
                            name: '手机号',
                            field: 'phone',
                            maxlength: 11,
                            rules: [
                                {
                                    pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                                    message: '请输入正确的手机号',
                                    trigger: 'blur'
                                }
                            ]
                        },
                        {
                            type: 'input',
                            name: '微信号',
                            field: 'wechat'
                        },
                        {
                            type: 'select',
                            field: 'idNumType',
                            name: '证件类型',
                            placeholder: '请选择证件类型',
                            opts: dictMap[131],
                            func: this.idNumTypeChange
                        },
                        {
                            type: 'input',
                            name: '证件号码',
                            field: 'idNum',
                            rules: [
                                {
                                    pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                                    // pattern: /^[a-zA-Z][1-3]{3}[0-9]{6}$/,
                                    message: '请输入正确的身份证号',
                                    trigger: 'blur'
                                }
                            ]
                        },
                        {
                            type: 'select',
                            name: '职业',
                            field: 'occupation',
                            opts: dictMap[20]
                        },
                        {
                            type: 'select',
                            name: '婚姻状况',
                            field: 'matrialStatus',
                            opts: dictMap[107]
                        },
                        {
                            type: 'select',
                            name: '民族',
                            field: 'nation',
                            opts: dictMap[29]
                        },
                        {
                            type: 'select',
                            name: '医保类型',
                            field: 'medicalInsuranceStr',
                            opts: dictMap[78]
                        },
                        {
                            type: 'select',
                            name: '用户类型',
                            field: 'commercialInsuranceStr',
                            opts: dictMap[79],
                            disabled: false,
                            rules: [
                                {
                                    required: true,
                                    message: '用户类型必填',
                                    trigger: 'change'
                                }
                            ]
                        },
                        {
                            type: 'input',
                            name: '工作单位',
                            field: 'workOrg'
                        },
                        {
                            type: 'cascader',
                            name: '住址',
                            field: 'region',
                            changeOnSelect: false, // 是否允许选择任意一级的选
                            list: cityList
                        },
                        {
                            type: 'select',
                            name: '预约科室',
                            rules: [{ required: true, message: '预约科室必选', trigger: 'blur' }],
                            field: 'departStr',
                            opts: departmentList
                        },
                        {
                            type: 'select',
                            name: '预约类型',
                            rules: [{ required: true, message: '预约类型必选', trigger: 'blur' }],
                            field: 'appointmentClass',
                            opts: dictMap[143]
                        },
                        {
                            name: '预约医生',
                            type: 'select',
                            rules: [{ required: true, message: '请选择预约医生', trigger: 'blur' }],
                            field: 'doctorStr',
                            opts: doctorList
                        },
                        {
                            type: 'date',
                            name: '预约日期',
                            field: 'appointmentDateTemp',
                            options: disabledPickerOptsAfter,
                            rules: [{ required: true, message: '请选择预约日期', trigger: 'blur' }],
                            format: 'yyyy-MM-dd',
                            valueFormat: 'yyyy-MM-dd'
                        },
                        {
                            type: 'selectOptins',
                            name: '预约时间',
                            rules: [{ required: true, message: '请选择预约时间', trigger: 'blur' }],
                            field: 'time',
                            opts: []
                        },
                        {
                            type: 'input',
                            name: '预约内容',
                            field: 'diseaseDescription'
                        },
                        {
                            type: 'select',
                            name: '预约来源',
                            field: 'appointmentMethod',
                            opts: dictMap[30]
                        },
                        {
                            type: 'input',
                            name: '备注',
                            field: 'note',
                            xs: 24,
                            sm: 12,
                            lg: 16
                        }
                    ]
                }
            ]
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    watch: {
        $route() {
            if (this.$route.name === 'detail') {
                this.getPatient()
            }
        },
        dictData(newVal) {
            this.dictData = newVal
        }
    },
  mounted() {
    this._getNowClinicDetail()
    this.getPatient()
  },
  methods: {
    // 根据患者姓名搜索
    searchPatient(val) {
      if (
        val &&
        val.length >= 2 &&
        this.$route.params.id == 0 &&
        this.$route.params.patientId == 0
      ) {
        likeNameGetInfo({
          name: this.form.patientName
        }).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS
            if (d && d.length > 0) {
              d.forEach(item => {
                item.age = getBabyAge(item.birthDate)
                item.temp_sex = formatSex(item.sex)
              })
              this.popoverVisible = true
              this.selectTabData = d
            } else {
              this.popoverVisible = false
            }
          }
        })
      }
    },

    // 关闭选择患者表单
    closeSelectData() {
      if (this.popoverVisible) {
        this.popoverVisible = false
      }
    },

    // 获取诊所可预约时间
    _getNowClinicDetail() {
      getOrgInfo(this.$store.getters.clinic.orgId).then(res => {
        const temp_opts = []
        if (res.STATUS === '1') {
          const d = res.ITEMS.orgInfo
          const morningOpenTime = d.morningOpenTime.split('-')
          const afternoonOpenTime = d.afternoonOpenTime.split('-')
          const nightOpenTime = d.nightOpenTime.split('-')
          temp_opts.push({ label: '上午', options: morningOpenTime })
          temp_opts.push({ label: '下午', options: afternoonOpenTime })
          temp_opts.push({ label: '晚上', options: nightOpenTime })
        }
        this.formDoms[0].items[19].opts = temp_opts
      })
    },

    // 表单赋值
    initFields(obj) {
      for (const key in obj) {
        this.form[key] = obj[key]
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },

    // 点击已有患者行
    clickRow(row, event, column) {
      this.popoverVisible = false
      row.patientId = row.id
      row.id = 0
      const temp_json = {}
      for (var p in this.form) {
        if (this.form.hasOwnProperty(p) && row.hasOwnProperty(p)) {
          temp_json[p] = row[p]
        }
      }
      temp_json.patientName = row.name
      this.initFields(temp_json)
      this.idNumTypeChange(temp_json.idNumType)
    },

    // 转换年纪
    formatAge(val) {
      this.form.age = val ? getBabyAge(val) : ''
    },

    // 保存预约
    handleConfirm() {
      if (!this.form.idNum && !this.form.phone) {
        this.$message.warning('预约时手机号或证件号码必填')
        return false
      }

      if (this.form.idNum && !this.form.idNumType) {
        this.$message.warning('请选择证件类型！')
        return false
      }

      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.appointmentDate = this.form.appointmentDateTemp + ' ' + this.form.time + ':00'
          const form = deepClone(this.form)
          const departmentObj = param2Obj(form.departStr)
          const doctorObj = param2Obj(form.doctorStr)
          const medicalInsuranceObj = param2Obj(form.medicalInsuranceStr) // 医保类型
          const commercialInsuranceObj = param2Obj(form.commercialInsuranceStr) // 用户类型
          const params = Object.assign(
            departmentObj,
            doctorObj,
            medicalInsuranceObj,
            commercialInsuranceObj,
            form
          )
          delete params.age
          delete params.departStr
          delete params.doctorStr
          delete params.medicalInsuranceStr
          delete params.commercialInsuranceStr
          modifyAppointment(params).then(res => {
            if (res.STATUS === '1') {
              this.$message.success('预约成功')
              this.$router.push('/appointment')
            }
          })
        } else {
          this.$message.error('检测到有必填项为空')
        }
      })
    },

    // 点击上传
    uploadAvatar() {
      this.$refs.fileInput.click()
    },

    // 上传头像
    fileChange(e) {
      var files = e.target.files
      var formData = new FormData()
      formData.append('fileType', 40)
      formData.append('file', files[0])
      uploadFile(formData).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS
          this.avatar = this.$store.getters.basic.filePrifix + d[0].filePath
          this.form.attachmentList = d
          this.$message.success('上传成功')
        }
      })
    },

    // 根据路由信息判断是否请求患者、预约信息
    getPatient() {
      const hasPatientId =
        this.$route.params.patientId !== 0 && this.$route.params.patientId !== '0'
      const hasAppointmentId = this.$route.params.id !== 0 && this.$route.params.id !== '0'
      if (hasPatientId) {
        if (hasAppointmentId) {
          // 预约信息
          this.renderPatient(this.$route.params.id, true)
        } else {
          // 患者信息
          this.renderPatient(this.$route.params.patientId)
        }
      }
    },

    // 根据id获取患者、预约信息
    renderPatient(id, flag = false) {
      const requestApi = flag ? appointmentInfo : patientInfo
      requestApi(id).then(res => {
        if (res.STATUS === '1') {
          const d = flag ? res.ITEMS : res.ITEMS ? res.ITEMS.patient || {} : {}
          if (!d) {
            this.$message.error('系统错误，请重试或联系管理员！')
            return
          }
          let obj = {}
          // 预约患者的预约来源
          if (flag) {
            // 患者来源是否妈妈团
            const isMmt = d.appointmentMethod === '01'
            this.formDoms[0].items[12].disabled = isMmt
            this.formDoms[0].items[21].disabled = isMmt
            this.formDoms[0].items[21].opts[0].disabled = !isMmt
            const arrTime = d.appointmentDate.split(' ')[1].split(':')
            obj = {
              time: arrTime[0] + ':' + arrTime[1],
              appointmentDateTemp: d.appointmentDate.split(' ')[0],
              appointmentId: d.id,
              appointmentMethod: d.appointmentMethod || '03',
              departStr: param({
                departId: d.deptId,
                departCode: d.deptCode,
                departName: d.deptName
              }),
              diseaseDescription: d.diseaseDescription,
              doctorStr: param({ doctorId: d.doctorId, doctorCode: '', doctorName: d.doctorName }),
              wechat: d.wechat
            }
          }
          this.avatar = d.headImg
            ? this.$store.getters.basic.filePrifix + d.headImg
            : paramAvatar(d.sex, d.birthDate)
          const obj2 = {
            appointmentClass: d.appointmentClass || '1', // 预约类型
            time: '',
            appointmentDateTemp: '',
            appointmentId: 0, // 预约ID
            appointmentMethod: '03', // 预约方式
            attachmentList: [], // 头像+附件
            birthDate: d.birthDate, // 出生年月
            departStr: '', // 科室
            commercialInsuranceStr:
              d.commercialInsuranceCode &&
              d.commercialInsuranceType &&
              (d.commercialInsuranceCode !== '3' || d.commercialInsuranceType !== '宝无忧')
                ? param({
                    commercialInsuranceCode: d.commercialInsuranceCode,
                    commercialInsuranceType: d.commercialInsuranceType
                  })
                : param({
                    commercialInsuranceCode: 99,
                    commercialInsuranceType: '自费'
                  }), // 用户类型
            diseaseDescription: '', // 预约内容
            doctorStr: '', // 医生
            idNum: flag ? d.idCard : d.idNum, // 证件号码
            idNumType: d.idNumType, // 证件类型
            matrialStatus: d.matrialStatus, // 婚姻状况
            medicalInsuranceStr: d.medicalInsuranceCode
              ? param({
                  medicalInsuranceCode: d.medicalInsuranceCode,
                  medicalInsuranceType: d.medicalInsuranceType
                })
              : '', // 医保类型
            nation: d.nation || '01', // 民族
            note: d.note, // 备注
            occupation: d.occupation, // 职业
            patientId: flag ? d.patientId : d.id, // 患者ID新增时为0
            patientName: flag ? d.patientName : d.name, // 患者姓名
            phone: d.phone, // 患者手机号
            region: d.region || [], // 三级地址
            sex: d.sex, // 患者性别
            wechat: '', // 微信
            workOrg: d.workOrg, // 工作单位
            age: d.birthDate ? getBabyAge(d.birthDate) : '' // -- 前端显示用，不传入后端
          }
          this.form = Object.assign(obj2, obj)
          this.idNumTypeChange(this.form.idNumType)
        }
      })
    },

    // 选择证件类型
    idNumTypeChange(val) {
      const idNumType = this.formDoms[0].items[7].rules[0]
      if (val === '1') {
        idNumType.message = '请输入正确的身份证号'
        idNumType.pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      } else {
        idNumType.message = '请输入正确的出生证号'
        idNumType.pattern = /^[a-zA-Z][0-9]{9}$/
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
  .more {
    margin-top: -15px;
    text-align: center;
  }
  .crop-avatar {
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
}

.submit-btn {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  text-align: right;
}

.small-btn {
  float: left;
  margin-top: 11px;
  height: 16px;
  width: 16px;
}

.small-btn-content {
  float: left;
  font-size: 16px;
  margin: 0px 10px;
  color: #000000;
}

.form-container,
.submit-btn {
  border: none;
}
</style>

<style>
.reservateDetail .el-tabs--card > .el-tabs__header {
  border: none;
}
</style>

