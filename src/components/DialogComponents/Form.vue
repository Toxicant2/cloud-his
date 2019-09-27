<template>
    <el-dialog :title="title" :class="dialogComponent" center :visible.sync="visible" :width="width" :close-on-click-modal="closeModal" @close="close">
        <div class="main">
            <el-form ref="form" :rules="rules" :model="form" :label-width="labelWidth" label-position="right">
                <el-row>
                    <template v-for="(item,index) in formData" v-if="!item.hidden">
                        <el-col :span="item.spanCount?item.spanCount:countLine" :key="item.field" :class="item.class" :style="item.isDash?'border-top:1px dashed #ccc;padding-top:20px;margin:0':''">
                            <el-form-item :key="index" :label="item.name?`${item.name}:`:''" :label-width="item.name?item.labelWidth:'10px'" :prop="item.field" :rules="item.rules" :class="item.className" :style="item.style">
                                <!-- 按钮控制 -->
                                <el-button v-if="item.operation" :type="item.operation.type?item.operation.type:'text'" class="operBtn" @click="item.operation.func">
                                    {{ item.operation.text?item.operation.text:'新增' }}
                                </el-button>

                                <!-- 提示 -->
                                <el-tooltip v-if="item.tips" :content="item.tips" slot="label" effect="dark" placement="top">
                                    <span>{{ item.name }}：</span>
                                </el-tooltip>

                                <!-- 输入框 input -->
                                <el-input v-if="item.type === 'input'" :type="item.inputType?item.inputType:''" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" :resize="item.resize" :maxlength="item.maxlength" @input="item.func" :rows="item.rows" :autosize="item.autosize">
                                    <span v-if="item.unit" :slot="item.slot?item.slot:'append'">{{ item.unit }}</span>
                                </el-input>

                                 <template v-else-if="item.type === 'mixin-input'">
                                    <el-form-item v-for="(c,cIndex) in item.list" :key="cIndex" :prop="c.field" :label="c.name?`${c.name}：`:''" :label-width="c.labelWidth?c.labelWidth:'0'" :rules="c.rules" style="width:33%" :class="{'suffix':c.suffix}">
                                    <!-- 输入框 -->
                                        <el-row>
                                            <el-col :span="18"><el-input v-if="c.type === 'input'" v-model="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder" @change="c.func?c.func(form):{}" /></el-col>
                                            <el-col :span="6"><span v-if="c.suffix">{{ c.suffix }}</span></el-col>
                                        </el-row>
                                    </el-form-item>
                                </template>

                                <!-- 呼吸背景色输入框 background-input -->
                                <el-input v-else-if="item.type === 'background-input'" :type="item.inputType?item.inputType:''" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" :resize="item.resize" :maxlength="item.maxlength" @input="item.func" :rows="item.rows" :autosize="item.autosize"
:class="{'red-background': form[item.field] && form[item.field]>item.up, 'blue-background': form[item.field]&& form[item.field]<item.down}">
                                    <span v-if="item.unit" :slot="item.slot?item.slot:'append'">{{ item.unit }}</span>
                                </el-input>

                                <!-- 数字输入框 -->
                                <el-input-number v-else-if="item.type === 'number'" :min="item.min" :max="item.max" :precision="item.precision" :controls="item.controls || false" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" :maxlength="item.maxlength" @input="item.func" />

                                <!-- 模糊查询输入 -->
                                <el-autocomplete v-else-if="item.type === 9" v-model="form[item.field]" :fetch-suggestions="item.func" popper-class="my-autocomplete" :placeholder="item.placeholder" clearable @select="item.selectfun">

                                    <template slot-scope="{ item }">
                                        <div class="name">{{ item.value }}
                                            <span v-if="item.specification">({{ item.specification }})</span>
                                        </div>
                                        <span class="description">{{ item.description }}</span>
                                    </template>
                                </el-autocomplete>

                                <!-- 快速收费的模糊查询 -->
                                <el-autocomplete v-else-if="item.type === 'autoComplete'" v-model="form[item.field]" :fetch-suggestions="item.func" popper-class="my-autocomplete" :placeholder="item.placeholder" clearable @select="item.selectfun">
                                    <template slot-scope="{ item }">
                                        <span style="display:inline-block;width:120px">{{ item.value }}</span>
                                        <span>{{ formatSex(item.sex) }}</span>
                                        <p style="margin-left:120px">
                                            <span v-if="item.phone">{{ item.phone }}</span>
                                        </p>
                                    </template>
                                </el-autocomplete>

                                <!-- 模糊查询选择 -->
                                <el-select v-else-if="item.type === 'remote'" v-model="form[item.field]" filterable :placeholder="item.placeholder" remote :remote-method="item.remoteFunc" reserve-keyword @change="item.func?item.func($event):{}">
                                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value" />
                                </el-select>

                                <!-- 日期 -->
                                <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.field]" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="item.func?item.func($event,form):{}" />

                                <!-- 单选框 -->
                                <el-radio v-else-if="item.type === 'radio'" v-for="(opt,optIndex) in item.opts" :class="item.class" v-model="form[item.field]" :key="optIndex" :label="opt.value" @change="item.func?item.func($event):{}">{{ opt.label }}
                                </el-radio>

                                <!-- 多选框 -->
                                <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.field]">
                                    <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" />
                                </el-checkbox-group>

                                <!-- 下拉框-输入框 -->
                                <el-input v-else-if="item.type === 'select-input'" v-model="form[item.field2]" placeholder="请输入内容" class="input-with-select">
                                    <el-select slot="prepend" v-model="form[item.field1]" placeholder="请选择">
                                        <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt">
                                            <span style="float: left">{{ opt.label }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                        </el-option>
                                    </el-select>
                                </el-input>

                                <!-- 输入框-输入框 -->
                                <el-input v-else-if="item.type === 'input-input'" v-model="form[item.field1]" placeholder="请输入内容" class="input-with-input">
                                    <el-input v-model="form[item.field2]" slot="prepend" placeholder="请输入内容" class="input-with-input-inner" />
                                </el-input>

                                <!-- 级联 -->
                                <el-cascader v-else-if="item.type === 'cascader'" :options="item.list" v-model="form[item.field]" :clearable="true" :filterable="true" />

                                <!-- 选择器 -->
                                <el-select v-else-if="item.type === 'select'" :multiple="item.multiple" v-model="form[item.field]" :placeholder="item.placeholder?item.placeholder:'请选择'" :value-key="item.key?item.key:'value'" :disabled="item.disabled" @change="item.func?item.func($event):{}">
                                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                                        <span style="float: left">{{ opt.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                    </el-option>
                                </el-select>

                                <img v-else-if="item.type === 'image'" :src="form[item.field]">
                                <span v-else-if="item.type === 'span'">{{ form[item.field] }}</span>

                                <!-- 医生审核  的特殊权限管制-->
                                <template v-else-if="item.type === 'radioMixin'">
                                    <el-row v-for="(col,colIndex) in item.list" :key="colIndex" class="smallRadio">
                                        <span class="name">
                                            {{ col.name }}
                                        </span>
                                        <el-radio-group v-model="form[col.field]">
                                            <el-radio v-for="(opt,optIndex) in col.opts" :label="opt.value" :key="optIndex">{{ opt.label }}</el-radio>
                                        </el-radio-group>

                                    </el-row>
                                </template>
                            </el-form-item>
                        </el-col>
                    </template>
                </el-row>
            </el-form>
        </div>
        <div slot="footer">
            <el-button v-if="btnCancel" size="mini" @click="visible = false;">取消</el-button>
            <el-button :loading="loading" size="mini" type="primary" @click="handleConfirm">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { formatSex } from '@/utils'

export default {
    props: {
        closeModal: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: '系统提示'
        },
        countLine: {
            // 一行排列几个
            default: 24
        },
        width: {
            type: String,
            default: '365px'
        },
        labelWidth: {
            type: String,
            default: '100px'
        },
        btnCancel: {
            type: Boolean,
            default: true
        },
        formData: {
            type: Array
        },
        formEdit: {
            type: Object
        },

        rules: {
            type: Object
        },
        dialogComponent: {
            type: String,
            default: 'dialog-component'
        }
    },
    data() {
        return {
            formatSex,
            loading: false,
            visible: false,
            form: ''
        }
    },
    watch: {
        visible() {
            if (this.visible) {
                this.initforms()
            }
        }
    },
    methods: {
        open(obj) {
            this.visible = true
        },

        close() {
            this.loading = false
            this.visible = false
        },

        handleConfirm() {
            this.loading = true
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.$emit('handleConfirm', this.form)
                } else {
                    this.loading = false
                }
            })
        },

        // 初始化整个表单（可在初始化时赋值）
        initforms(formEdit) {
            const form = {}
            this.formData.forEach(item => {
                if (!item.field || item.hidden) return false
                if (item.type === 'select-input' || item.type === 'input-input') {
                    form[item.field1] = ''
                    form[item.field2] = ''
                } else if (item.type === 'checkbox' || item.type === 'cascader') {
                    form[item.field] = []
                } else {
                    form[item.field] = ''
                }
            })
            if (formEdit) {
                this.form = Object.assign(form, formEdit)
            }
            if (this.formEdit) {
                this.form = Object.assign(form, this.formEdit)
            } else {
                this.form = Object.assign({}, form)
            }
            this.loading = false

            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        // 给表单部分字段赋值（此时表单已初始化）
        initFields(obj) {
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

<style lang="scss">
.dialog-component {
  .input-with-select {
    .el-input__suffix {
      position: relative !important;
      right: 20px;
      font-size: 14px;
    }
    .el-input__inner {
      width: 130px;
    }
    .el-input--mini .el-input__inner {
      text-align: center;
    }
  }
  .el-input-group__prepend {
    padding: 0;
  }
  .input-with-input {
    .el-input-group__prepend {
      background-color: #ffffff;
      width: 120px;
      padding: 0;
      border: 0;
    }
  }
  .red-background .el-input__inner {
    background: #c92639;
    color: #fff;
    border-color: #c30d23 !important;
  }
  .blue-background .el-input__inner {
    background: #0097ff;
    color: #fff;
    border-color: #036eb8 !important;
  }
}
.setLineHeight {
  .el-form-item__label {
    line-height: 18px;
  }
}
</style>

<style lang="scss" scoped>
.avatar-line {
  text-align: center;
  img {
    width: 120px;
  }
}

.my-autocomplete {
  li {
    line-height: normal;
    padding: 7px;
    .name {
      text-overflow: ellipsis;
      overflow: hidden;
      + .description,
      span {
        font-size: 12px;
      }
      + .description {
        color: #b4b4b4;
      }
    }

    .highlighted .description {
      color: #ddd;
    }
  }
}

.dialog-component .el-input__suffix {
  position: relative !important;
}

.el-autocomplete {
  width: 100%;
}
</style>

<style>
.drugDetail .boold .el-form-item__content,
.diagnosis .boold .el-form-item__content {
  margin-left: 0px !important;
}
</style>

