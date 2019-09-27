<template>
    <div>
        <el-form ref="form" :model="form" label-position="right" label-width="120px">
            <el-row class="form-container">
                <el-col :sm="18" :md="20">
                    <el-row>
                        <el-col v-for="(col,colIndex) in formDoms" :xs="col.xs?col.xs:24" :key="colIndex" :sm="col.sm?col.sm:12" :lg="col.lg?col.lg:8" style="height:47px;">
                            <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules">
                                <span v-if="!col.name" slot="label" />
                                <!-- 输入框 -->
                                <el-input v-if="col.type === 'input'" v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder">
                                    <template v-if="col.slot" :slot="col.slot.slot">
                                        <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" />
                                    </template>
                                </el-input>

                                <!-- 模糊查询 -->
                                <el-autocomplete v-if="col.type === 'autocomplete'" v-model="form[col.field]" :maxlength="col.maxlength" :fetch-suggestions="col.func" placeholder="请输入姓名" @select="handleSelect" />

                                <!-- 按钮 -->
                                <el-button v-else-if="col.type === 'wechat'" @click="wechat">
                                    <svg-icon icon-class="wechat" style="margin-right: 5px;" />绑定微信
                                </el-button>

                                <!-- 文字 -->
                                <span v-else-if="col.type === 'text'">{{ form[col.field] }}</span>

                                <!-- 日期 -->
                                <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.field]" type="date" @keyup.enter.native="keydown" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat" @change="col.func?col.func($event):{}" />

                                <!-- 单选框 -->
                                <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.field]" :label="opt.value">{{ opt.label }}</el-radio>

                                <!-- 多选框 -->
                                <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                    <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                                </el-checkbox-group>

                                <!-- 选择器 -->
                                <el-select v-else-if="col.type === 'select'" v-model="form[col.field]" :multiple="col.multiple" :filterable="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                                    <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>

                                <!-- 级联 -->
                                <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.field]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" filterable />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row class="addFriend">
                        <el-button type="primary" plain @click="addFriend">添加亲友</el-button>
                        <el-table-self ref="singleTable" :columns="addFriendColumns" :table-data="addFriendList" />
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
                <el-button @click="handleBack">返回</el-button>
                <el-button type="primary" :loading="loading" @click="handleConfirm">保存</el-button>
            </el-row>
        </el-form>
        <dialog-image ref="wechat" title="绑定微信" :img-url="wechatImg" />
    </div>
</template>

<script>
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import { getDictByIdList } from '@/api/catalog'
import elTableSelf from '@/components/TabComponents/index'
import { selectByName, modifyPatient } from '@/api/arclinic'
import { getBabyAge, deepClone, param, param2Obj, paramAvatar, disabledPickerOpts } from '@/utils'
import cityList from '@/common/data/city.js'
import { uploadFile } from '@/api/upload'
import dialogImage from '@/components/DialogComponents/Image'

export default {
    components: {
        elTableSelf,
        dialogImage
    },
    data() {
        const dictMap = {
            9: [], // 性别
            107: [], // 婚姻状况
            78: [], // 医保类型
            79: [], // 用户类型
            20: [], // 职业
            25: [], // 与患者关系
            '25_redundant': [],
            29: [], // 民族
            30: [], // 患者来源
            6: [], // 卡类型
            60: [], // ABO血型
            125: [], // RH血型
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
                if (d && d.length > 0) {
                    d.forEach(item => {
                        let obj = {}
                        if (item.dictId === 78) {
                            obj = {
                                value: param({
                                    medicalInsuranceCode: item.code,
                                    medicalInsuranceType: item.name
                                }),
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
                        } else {
                            obj = {
                                value: item.code,
                                label: item.name
                            }
                        }
                        if (item.dictId === 30 && item.code === '01') {
                            obj.disabled = true
                        }
                        if (item.dictId === 25) {
                            dictMap['25_redundant'].push({
                                value: param({
                                    relationCode: item.code,
                                    relationName: item.name
                                }),
                                label: item.name
                            })
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
            }
        })
        return {
            unknownAvatar,
            // 新增患者的数据
            form: {
                familyAddr: '', // 详细地址
                birthDate: '', // 出生日期
                cardNum: '', // 卡号
                cardType: '', // 卡类型
                commercialInsuranceStr: '', // 用户类型
                contactMan: '', // 联系人姓名
                contactSex: '', // 联系人性别
                contactManRel: '', // 联系人关系
                contactManTel: '', // 联系人手机
                patientId: 0, // 新增ID为0
                idNum: '', // 身份证件
                matrialStatus: '', // 婚姻状况
                medicalInsuranceStr: '', // 医保类型
                patientName: '', // 姓名
                nation: '01', // 民族
                note: '', // 备注
                occupation: '', // 职业
                patientSources: '03', // 患者来源 1
                phone: '', // 本人手机号
                region: [], // 地址
                sex: '', // 性别
                workOrg: '', // 工作单位
                attachments: [], // 头像
                bloodType: '', // ABO血型
                bloodTypeRh: '', // RH血型
                families: [],
                age: '' // --不传入
            },
            // 患者
            formDoms: [
                {
                    type: 'autocomplete',
                    name: '姓名',
                    field: 'patientName',
                    rules: [{ required: true, message: '患者姓名必填', trigger: 'blur' }],
                    func: this.querySearchAsync
                },
                {
                    type: 'select',
                    name: '性别',
                    field: 'sex',
                    opts: dictMap[9],
                    rules: [{ required: true, message: '性别必填', trigger: 'blur' }]
                },
                {
                    type: 'date',
                    name: '出生日期',
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
                    type: 'input',
                    name: '手机号',
                    field: 'phone',
                    maxlength: 11,
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        },
                        { required: true, message: '请输入手机号', trigger: 'blur' }
                    ]
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
                    opts: dictMap[79]
                },
                {
                    type: 'select',
                    name: '婚姻状况',
                    field: 'matrialStatus',
                    opts: dictMap[107]
                },
                {
                    type: 'cascader',
                    name: '地址',
                    field: 'region',
                    changeOnSelect: false, // 是否允许选择任意一级的选
                    list: cityList
                },
                {
                    type: 'input',
                    name: '详细地址',
                    field: 'familyAddr',
                    lg: 24,
                    sm: 24
                },
                {
                    type: 'select',
                    name: 'ABO血型',
                    field: 'bloodType',
                    opts: dictMap[60]
                },
                {
                    type: 'select',
                    name: 'RH血型',
                    field: 'bloodTypeRh',
                    opts: dictMap[125]
                },
                {
                    type: 'select',
                    name: '民族',
                    field: 'nation',
                    opts: dictMap[29]
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
                    name: '患者来源',
                    field: 'patientSources',
                    opts: dictMap[30]
                },
                {
                    type: 'select',
                    name: '卡类型',
                    field: 'cardType',
                    opts: dictMap[6]
                },
                {
                    type: 'input',
                    name: '卡号',
                    field: 'cardNum'
                },
                {
                    type: 'input',
                    name: '联系人姓名',
                    field: 'contactMan'
                },
                {
                    type: 'select',
                    name: '联系人性别',
                    field: 'contactSex',
                    opts: dictMap[9]
                },
                {
                    type: 'input',
                    name: '联系人手机',
                    field: 'contactManTel',
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
                    type: 'select',
                    name: '与患者关系',
                    field: 'contactManRel',
                    opts: dictMap[25]
                },
                {
                    type: 'select',
                    name: '职业',
                    field: 'occupation',
                    opts: dictMap[20]
                },
                {
                    type: 'input',
                    name: '工作单位',
                    field: 'workOrg'
                },
                {
                    type: 'input',
                    name: '备注',
                    field: 'note'
                },
                {
                    type: 'wechat'
                }
            ],
            loading: false,
            avatar: '',
            wechatImg: '',
            // 添加亲友表单
            addFriendColumns: [
                {
                    value: 'relationStr',
                    label: '关系',
                    align: 'center',
                    operType: 'select',
                    opts: dictMap['25_redundant'],
                    field: 'relationStr'
                },
                {
                    value: 'name',
                    label: '关系人姓名',
                    align: 'center',
                    operType: 'input',
                    field: 'name'
                },
                {
                    value: 'sex',
                    label: '性别',
                    align: 'center',
                    operType: 'select',
                    opts: dictMap[9],
                    field: 'sex'
                },
                {
                    value: 'phone',
                    label: '手机',
                    align: 'center',
                    operType: 'input',
                    field: 'phone',
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    value: 'executiveSection',
                    label: '操作',
                    align: 'center',
                    operations: [
                        {
                            type: 'text',
                            label: '删除',
                            func: this.handleDeleteFriend
                        }
                    ],
                    operType: 'button'
                }
            ],
            addFriendList: [], // 添加亲友的数据
            nameResults: [] // 模糊查询的数据
        }
    },
    methods: {
    // 返回
        handleBack() {
            this.$emit('handleCallBack', 0)
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
            if (files[0]) {
                uploadFile(formData).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.avatar = this.$store.getters.basic.filePrifix + d[0].filePath
                        this.form.attachments = d
                        this.$message.success('上传成功')
                    }
                })
            }
        },

        // 绑定微信弹窗--测试
        wechat() {
            this.wechatImg = 'http://192.168.10.254/his-download/qrcode/qrcode.jpg'
            this.$refs.wechat.open()
        },

        // 添加亲友
        addFriend(event) {
            this.addFriendList.push({
                relationStr: '',
                name: '',
                sex: '',
                phone: '',
                showInput: true
            })
        },

        // 转换年纪
        formatAge(val) {
            this.form.age = val ? getBabyAge(val) : ''
        },

        // 删除亲友
        handleDeleteFriend(r, index) {
            this.addFriendList.splice(index, 1)
        },

        // 选中查询出的患者
        handleSelect(d) {
            if (d) {
                this.avatar = d.headImg
                    ? this.$store.getters.basic.filePrifix + d.headImg
                    : paramAvatar(d.sex, d.birthDate)
                this.form = {
                    familyAddr: d.familyAddr || '', // 详细地址
                    birthDate: d.birthDate || '', // 出生日期
                    cardNum: d.cardNum || '', // 卡号
                    cardType: d.cardType || '', // 卡类型
                    commercialInsuranceStr: d.commercialInsuranceCode
                        ? param({
                            commercialInsuranceCode: d.commercialInsuranceCode,
                            commercialInsuranceType: d.commercialInsuranceType
                        })
                        : '',
                    contactMan: d.contactMan || '', // 联系人姓名
                    contactSex: d.contactSex || '', // 联系人性别
                    contactManTel: d.contactManTel || '', // 联系人手机
                    contactManRel: d.contactManRelation || '', // 与患者关系
                    patientId: d.id,
                    idNum: d.idNum, // 证件号码
                    matrialStatus: d.matrialStatus || '', // 婚姻状况
                    medicalInsuranceStr: d.medicalInsuranceCode
                        ? param({
                            medicalInsuranceCode: d.medicalInsuranceCode,
                            medicalInsuranceType: d.medicalInsuranceType
                        })
                        : '',
                    patientName: d.name, // 姓名
                    nation: d.nation || '01', // 民族
                    note: d.note,
                    occupation: d.occupation || '', // 职业
                    patientSources: d.patientSources || '03', // 患者来源
                    phone: d.phone || '', // 手机号
                    region: d.region || [], //  地址
                    sex: d.sex || '',
                    workOrg: d.workOrg || '', // 工作单位
                    bloodType: d.bloodType || '',
                    bloodTypeRh: d.bloodTypeRh || '',
                    age: getBabyAge(d.birthDate || '')
                }
            }
        },

        // 患者查询
        querySearchAsync(queryString, cb) {
            if (queryString) {
                this.nameResults = []
                selectByName(queryString).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d && d.length > 0) {
                            this.nameResults = Object.assign(d)
                            d.forEach((item, index) => {
                                this.nameResults[index].value = item.name
                            })
                        }
                        cb(this.nameResults)
                    }
                })
            } else {
                cb([])
            }
        },

        // 保存新增、修改
        handleConfirm() {
            if (this.$refs.form.idNum && !this.$refs.form.idNumType) {
                this.$message.warning('请选择证件类型！')
                return false
            }
            this.$refs.form.validate(valid => {
                if (valid) {
                    let flag = true
                    if (this.addFriendList && this.addFriendList.length > 0) {
                        for (let i = 0; i < this.addFriendList.length; i++) {
                            if (!this.addFriendList[i].relationStr) {
                                this.$message.error('请输入患者关系')
                                flag = false
                                break
                            }
                            const relationObj = param2Obj(this.addFriendList[i].relationStr) // 添加亲友与患者关系
                            this.addFriendList[i] = Object.assign(this.addFriendList[i], relationObj)
                        }
                        this.form.familyList = this.addFriendList
                    }
                    if (!flag) return false
                    const form = deepClone(this.form)
                    const medicalInsuranceObj = param2Obj(form.medicalInsuranceStr) // 医保类型
                    const commercialInsuranceObj = param2Obj(form.commercialInsuranceStr) // 用户类型
                    const relationObj = param2Obj(form.relationStr) // 添加亲友与患者关系
                    const data = Object.assign(
                        medicalInsuranceObj,
                        commercialInsuranceObj,
                        relationObj,
                        this.form
                    )
                    modifyPatient(data).then(res => {
                        this.handleSuccessCb(res, data.patientId ? '修改成功' : '新增成功')
                    })
                } else {
                    this.$message.error('检测到有必填项为空')
                    window.scrollTo(0, 0)
                }
            })
        },

        // 修改成功回调
        handleSuccessCb(res, msg) {
            if (res.STATUS === '1') {
                this.$message.success(msg)
                this.$emit('handleCallBack', 1)
            }
        },

        // 选择证件类型
        idNumTypeChange(val) {
            const idNumType = this.formDoms[14].rules[0]
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
.toolbar {
  line-height: 36px;
}
.tb-border {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 20px 0;
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
.addFriend {
  text-align: right;
  padding-bottom: 20px;
  button {
    margin-bottom: 10px;
  }
  .el-table-self {
    margin: 0;
  }
}
.form-container {
  border: none;
}
.el-autocomplete {
  width: 100%;
}
</style>
