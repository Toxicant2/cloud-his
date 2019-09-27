<template>
    <el-form ref="form" :model="form" :label-position="labelPosition" :inline="inlineFlag" :label-width="labelWidth" :size="size" @submit.native.prevent="handleSearch()" class="el-form-self" :style="formStyle">
        <el-col :xs="item.xs?item.xs:24" :sm="item.sm?item.sm:12" :md="item.md?item.md:8" :lg="item.lg?item.lg:8" :xl="item.xl?item.xl:6"  v-for="(item,index) in forms" :key="index" v-if="!item.hidden">
            <el-form-item :label="item.label?item.label+(item.hiddenColon?'':'：'):''" :prop="item.prop" :rules="item.rules" :label-width="item.labelWidth || '110px'">
                <!-- 输入框 --> 
                <el-input v-if="item.type === 'input'" :id="item.id?item.id:''" v-model="form[item.prop]" :readonly="item.readonly" :disabled="item.disabled" :placeholder="item.placeholder" @focus="item.focusFunc?item.focusFunc($event):{}" @change="item.func?item.func($event):{}">
                    <span :slot="item.slot?item.slot:'append'" v-if="item.unit">{{item.unit}}</span>
                </el-input>

                <template v-if="item.type === 'textarea'">
                    <el-input type="textarea" :placeholder="item.placeholder" :rows="item.rows" :autosize="item.autosize" v-model="form[item.prop]" :minlength="item.minlength" :maxlength="item.maxlength" :show-word-limit="item.showLimit"></el-input>
                </template>

                <!-- 模糊查询输入 -->
                <el-autocomplete :popper-class="item.popperClass" style="width:100%;" v-else-if="item.type === 'autocomplete'" v-model="form[item.prop]" :fetch-suggestions="item.func" :placeholder="item.placeholder" @select="item.selectfun?item.selectfun($event):{}" clearable>
                    <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span class="description">{{ item.description }}</span>
                    </template>
                </el-autocomplete>

                <!-- 模糊查询选择 -->
                <el-select v-else-if="item.type === 'remote'" v-model="form[item.prop]" filterable remote reserve-keyword :placeholder="item.placeholder" :remote-method="item.remoteFunc">
                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="item.isSelect?opt.selectValue:opt.value">
                    </el-option>
                </el-select>

                <!-- 日期区间 -->
                <el-date-picker v-else-if="item.type === 'daterange'" v-model="form[item.prop]" type="daterange" align="right" unlink-panels range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat">
                </el-date-picker>

                <!-- 日期 -->
                <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.prop]" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat">
                </el-date-picker>

                <!-- 下拉框 -->
                <el-select v-else-if="item.type === 'select'" clearable filterable :disabled="item.disabled" v-model="form[item.prop]" :placeholder="item.placeholder?item.placeholder:'请选择'" @change="item.func?item.func($event):{}">
                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="item.isSelect?opt.selectValue:opt.value">
                    </el-option>
                </el-select>

                 <!-- 单选框 -->
                <el-radio :class="item.class" v-else-if="item.type === 'radio'" v-model="form[item.prop]" v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="item.func?item.func($event):{}">{{opt.label}}
                </el-radio>

                <!-- 级联 -->
                <el-cascader v-else-if="item.type === 'cascader'" v-model="form[item.prop]" :style="'width:'+item.width" :options="item.list" :change-on-select="item.changeSelect" :show-all-levels="item.showLevel"></el-cascader>

                <!-- 文字 -->
                <span v-else-if="item.type === 'text'">
                    {{item.text?item.text:form[item.prop]}}
                </span>

                <!-- 数字输入框 -->
                <el-input-number v-else-if="item.type === 'number'" :controls="false" :min="item.min || 0" :precision="item.precision" v-model="form[item.prop]" :disabled="item.disabled || disabled" />

                <!-- 图标 -->
                <span v-else-if="item.type === 'svg'">
                    <svg-icon :style="item.style" :icon-class="item.iconClass" @click.native="clickSvg(item.func)" class="form-svg"></svg-icon>
                </span>

            </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :lg="24" v-if="lists" style="padding-left:120px;">
            <el-button v-for="(btn,index) in lists" :key="index" :type="btn.type" :size="size" :icon="btn.icon" @click="btn.func" :style="btn.style">
                {{btn.btnText}}
            </el-button>
        </el-col>
    </el-form>
</template>

<script>
export default {
    data() {
        const form = {}
        const { forms } = this.$props
        forms.forEach(item => {
            if (!item.prop || item.hidden) return false
            if (
                item.type === 'daterange' ||
                item.type === 'checkboxList' ||
                item.type === 'checkbox' ||
                item.type === 'cascader' ||
                (item.type === 'select' && item.multiple)
            ) {
                form[item.prop] = []
            } else {
                form[item.prop] = ''
            }
        })
        return {
            form
        }
    },
    props: {
        size: { type: String, default: 'small' },
        labelPosition: { type: String, default: 'right' },
        labelWidth: { type: String },
        formStyle: { type: Object },
        inlineFlag: { type: Boolean, default: false },
        forms: { type: Array }, // 表单组,
        lists: { type: Array } // 按钮组
    },
    methods: {

        // 查询
        handleSearch() {
            this.$emit('handleSearch', this.form)
        },

        // 重置
        handleReset() {
            this.$refs.form.resetFields()
            this.handleSearch()
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

        // 表单赋值
        initforms(formEdit) {
            this.$nextTick(() => {
                const form = {}
                this.forms.forEach(item => {
                    if (!item.prop || item.hidden) return false
                    if (
                        item.type === 'daterange' ||
                        item.type === 'checkboxList' ||
                        item.type === 'checkbox' ||
                        item.type === 'cascader' ||
                        (item.type === 'select' && item.multiple)
                    ) {
                        form[item.prop] = []
                    } else {
                        form[item.prop] = ''
                    }
                })
                if (formEdit) {
                    this.form = Object.assign(form, formEdit)
                } else {
                    this.form = Object.assign({}, form)
                }
                this.loading = false
                if (this.$refs.form && this.$refs.form.clearValidate) {
                    this.$refs.form.clearValidate()
                }
            })
        },

        // 绑定部分值(此时表单已渲染)
        initfields(obj) {
            this.form = Object.assign(this.form, obj)
        },

        // 点击图标
        clickSvg(str) {
            this.$emit(str)
        }
    }
}
</script>

<style lang="scss" scoped>
.el-form-self {
    margin: 20px 0;
    overflow: hidden;
    zoom: 1;
    .el-input,
    .el-select,
    .el-cascader,
    .el-date-editor {
        width: 100%;
    }
    .form-svg {
        cursor: pointer;
    }
}
</style>