<template>
    <el-row class="page-main">
        <span class="title">{{ title }}
            <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="back">返回</el-button>
        </span>
        <el-form ref="form" :model="form" label-position="right" label-width="150px">
            <el-row class="form-container img">
                <el-col :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" v-for="(col,colIndex) in formDoms" :lg="col.lg?col.lg:8" :key="colIndex">
                    <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules">
                        <!-- 输入框 -->
                        <el-input v-if="col.type === 'input'" v-model.trim="form[col.field]" :disabled="col.disabled" :placeholder="col.placeholder"/>

                        <!-- 选择器 -->
                        <el-select v-else-if="col.type === 'select'" :multiple="col.multiple" v-model="form[col.field]" :filterable="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                            <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                <span style="float: left">{{ opt.label }}</span>
                                <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                            </el-option>
                        </el-select>

                        <!-- 级联 -->
                        <el-cascader v-else-if="col.type === 'cascader'" id="cascader" v-model="form[col.field]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" :filterable="true"/>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row class="submit-btn">
                <el-button @click.native="back">取消</el-button>
                <el-button type="primary" @click.native="save">保存</el-button>
            </el-row>
        </el-form>
    </el-row>
</template>

<script>
import { createSysNum } from '@/api/catalog'
import { addOpSkDealer, updateOpSkDealer } from '@/api/pharmacy'
import cityList from '@/common/data/city.js'
export default {
    props: ['supplierItem'],
    data() {
        return {
            title: '',
            formDoms: [
                {
                    type: 'input',
                    name: '供应商名称',
                    field: 'dealerName',
                    rules: [{ required: true, message: '供应商名称必填', trigger: 'blur' }]
                },
                {
                    type: 'input',
                    disabled: true,
                    name: '供应商编码',
                    field: 'dealerCode',
                    rules: [{ required: true, message: '供应商编码必填', trigger: 'blur' }]
                },
                {
                    type: 'input',
                    name: '联系人',
                    field: 'linkMan'
                },
                {
                    type: 'input',
                    name: '法定代表人',
                    field: 'legalPerson'
                },
                {
                    type: 'input',
                    name: '电话',
                    field: 'tel',
                    placeholder: '请输入手机号或固定电话',
                    rules: [
                        {
                            pattern: /(^(0\d{2,3}-?)\d{7,8}$)|(^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$)/,
                            message: '请输入正确的手机号或固定电话',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    name: 'email',
                    field: 'email',
                    placeholder: '请输入邮箱',
                    rules: [
                        {
                            pattern: /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/,
                            message: '请输入正确的邮箱',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'cascader',
                    name: '注册住址',
                    field: 'temp_addressCode',
                    changeOnSelect: false, // 是否允许选择任意一级的选
                    list: cityList
                }
            ],
            form: {
                dealerCode: '', // 供应商编码
                dealerName: '', // 供应商名称
                legalPerson: '', // 法定代表人
                tel: '', // 电话
                email: '', // email
                address: '',
                addressCode: '',
                temp_addressCode: [] // 注册住址
            }
        }
    },
  mounted() {
    this.title = '新增供应商'
    if (this.supplierItem.id !== 0) {
      this.supplierItem.temp_addressCode = this.supplierItem.addressCode.split('-')
      this._initFields(this.supplierItem)
      this.title = '修改供应商'
    } else {
      createSysNum('dealerCode').then(res => {
        if (res.STATUS === '1') {
          this.form.dealerCode = res.ITEMS
        }
      })
    }
  },
  methods: {
    // 保存
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.address = document
            .getElementById('cascader')
            .children[0].children[0].getAttribute('value')
          if (this.form.temp_addressCode && this.form.temp_addressCode.length > 0) {
            this.form.temp_addressCode.forEach((item, index) => {
              if (index === 0) {
                this.form.addressCode = item
              } else {
                this.form.addressCode = this.form.addressCode + '-' + item
              }
            })
          }
          if (this.supplierItem === 0 || this.supplierItem.id === 0) {
            addOpSkDealer(this.form).then(res => {
              if (res.STATUS && res.STATUS === '1') {
                this.$message.success('保存成功')
                this.back()
              }
            })
          } else {
            this.form.id = this.supplierItem.id
            updateOpSkDealer(this.form).then(res => {
              if (res.STATUS && res.STATUS === '1') {
                this.$message.success('保存成功')
                this.back()
              }
            })
          }
        } else {
          this.$message.error('检测到有必填项为空')
          window.scrollTo(0, 0)
        }
      })
    },

    // 返回
    back() {
      this.$emit('addSupplier', false)
    },

    // 获得数据
    _initFields(obj) {
      for (const key in obj) {
        this.form[key] = obj[key]
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.title {
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  margin-bottom: 20px;
  line-height: 50px;
}
.submit-btn {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  text-align: right;
}
</style>

