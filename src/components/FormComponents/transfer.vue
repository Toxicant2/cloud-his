<template>
    <div class="commonForm">
        <el-form ref="form" :rules="rules" :model="form" label-position="right" :label-width="labelWidth" :disabled="disabled">
            <el-row>
                <template v-for="(item,index) in formData" v-if="!item.hidden">
                    <el-col v-if="!item.isMore" :key="item.field" :xs="item.spanCount?item.spanCount:24" :sm="item.spanCount?item.spanCount:12" :md="item.spanCount?item.spanCount == 8 ?item.spanCount*1.5:item.spanCount*3:12" :lg="item.spanCount?item.spanCount:8" :xl="item.spanCount?item.spanCount:6" :class="item.class">
                        <el-form-item :key="index" :label="item.name?`${item.name}:`:''" :label-width="item.labelWidth" :prop="item.field" :rules="item.rules" :class="item.className" :style="item.style">
                            <!-- 按钮控制 -->
                            <el-button v-if="item.operation" size="small" class="operBtn" :type="item.operation.type?item.operation.type:'text'" @click="item.operation.func?item.operation.func:{}">{{ item.operation.text?item.operation.text:'新增' }}</el-button>

                            <!-- 提示 -->
                            <el-tooltip v-if="item.tips" slot="label" effect="dark" :content="item.tips" placement="top">
                                <span>{{ item.name }}：</span>
                            </el-tooltip>

                            <!-- 输入框 -->
                            <el-input
                                v-if="item.type === 'input'"
                                v-model="form[item.field]"
                                size="small"
                                :type="item.inputType?item.inputType:'text'"
                                :disabled="item.disabled"
                                :placeholder="item.placeholder"
                                :resize="item.resize"
                                :maxlength="item.maxlength"
                                :rows="item.rows"
                                :autosize="item.autosize"
                                @keyup.enter.native="addIndex"
                                @input="item.func"
                            >
                                <template v-if="item.slot" :slot="item.slot.slot">
                                    <el-button v-if="item.slot.type === 'button'" :icon="item.slot.icon" @click="item.btnFunc?item.btnFunc:{}" />
                                    <span v-else-if="item.slot.type === 'string'" style="cursor:pointer;" @click.stop="getHisData">{{ item.slot.str }}</span>
                                </template>
                            </el-input>

                            <!-- 数字输入框 -->
                            <el-input-number
                                v-else-if="item.type === 'number'"
                                v-model="form[item.field]"
                                size="small"
                                :precision="item.precision"
                                :controls="false"
                                :disabled="item.disabled"
                                :placeholder="item.placeholder"
                                :resize="item.resize"
                                :maxlength="item.maxlength"
                                :min="item.min"
                                :rows="item.rows"
                                :autosize="item.autosize"
                                @keyup.enter.native="addIndex"
                                @input="item.func"
                            />

                            <!-- 模糊查询输入 -->
                            <el-autocomplete v-else-if="item.type === 9" v-model="form[item.field]" size="small" popper-class="my-autocomplete" :fetch-suggestions="item.func" :placeholder="item.placeholder" clearable @select="item.selectfun">
                                <template slot-scope="{ item }">
                                    <div class="name">
                                        {{ item.value }}
                                        <span v-if="item.specification">({{ item.specification }})</span>
                                    </div>
                                    <span class="description">{{ item.description }}</span>
                                </template>
                            </el-autocomplete>

                            <!-- 模糊查询选择 -->
                            <el-select
                                v-else-if="item.type === 'remote'"
                                v-model="form[item.field]"
                                size="small"
                                filterable
                                allow-create
                                remote
                                reserve-keyword
                                :placeholder="item.placeholder"
                                :clearable="true"
                                :remote-method="item.remoteFunc"
                                @change="item.func?item.func($event):{}"
                            >
                                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value" />
                            </el-select>

                            <!-- 日期 -->
                            <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.field]" size="small" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="item.func?item.func($event):{}" />

                            <!-- 单选框 -->
                            <el-radio v-for="(opt,optIndex) in item.opts" v-else-if="item.type === 'radio'" :key="optIndex" v-model="form[item.field]" :class="item.class" :label="opt.value" @change="item.func?item.func($event):{}">{{ opt.label }}</el-radio>

                            <!-- 日期区间 -->
                            <el-date-picker
                                v-else-if="item.type === 'daterange'"
                                v-model="form[item.field]"
                                size="small"
                                :type="item.dateType||'daterange'"
                                align="right"
                                unlink-panels
                                range-separator="-"
                                :picker-options="item.options"
                                :format="item.format"
                                :value-format="item.valueFormat"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                            />

                            <!-- 多选框 -->
                            <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.field]">
                                <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" />
                            </el-checkbox-group>

                            <!-- 级联 -->
                            <el-cascader v-else-if="item.type === 'cascader'" v-model="form[item.field]" :options="item.list" size="small" :clearable="true" :filterable="true" />

                            <!-- 日期选择框 -->
                            <el-date-picker v-else-if="item.type === 'datePicker'" v-model="form[item.field]" type="date" size="small" placeholder="选择日期" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="item.func?item.func($event):{}" />

                            <!-- 选择器 -->
                            <el-select v-else-if="item.type === 'select'" v-model="form[item.field]" size="small" :label-width="item.labelWidth" :disabled="item.disabled" :clearable="true" :filterable="true" :multiple="item.multiple" :placeholder="item.placeholder?item.placeholder:'请选择'" @change="item.func?item.func($event):{}">
                                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="item.isLabel?opt.label:opt.value">
                                    <span style="float: left">{{ opt.label }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                </el-option>
                            </el-select>

                            <!-- 上传 -->
                            <el-upload v-else-if="item.type === 'upload'" v-model="form[item.field]" class="avatar-uploader" :action="action" :show-file-list="false" :on-success="handleAvatarSuccess" accept="image/gif, image/jpeg, image/jpg, image/png, image/svg" :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon" />
                            </el-upload>
                            <img v-else-if="item.type === 'image'" :src="form[item.field]">
                        </el-form-item>
                    </el-col>
                </template>
            </el-row>
        </el-form>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: '系统提示'
        },
        countLine: {
            default: 6
        },
        isMoreInfo: {
            type: Boolean,
            default: false
        },
        width: {
            type: String,
            default: '365px'
        },
        labelWidth: {
            type: String,
            default: '140px'
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
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            props: {
                value: 'label',
                label: 'label',
                children: 'children'
            },
            imageUrl: '',
            form: {},
            activeNames: [],
            action:
                (process.env.VUE_APP_ENV_CONFIG === 'dev'
                    ? '/api'
                    : process.env.VUE_APP_API_ROOT) +
                '/resource/file/batch/upload'
        }
    },
    methods: {
        handleAvatarSuccess(res, file) {},
        beforeAvatarUpload(files) {
            this.$emit('upload', files)
            return false
        },
        initforms() {
            const form = {}
            this.formData.forEach(item => {
                if (!item.field || item.hidden) return false
                if (
                    item.type === 'select-input' ||
                    item.type === 'input-input'
                ) {
                    form[item.field1] = ''
                    form[item.field2] = ''
                } else if (
                    item.type === 'checkbox' ||
                    item.type === 'cascader'
                ) {
                    form[item.field] = []
                } else {
                    form[item.field] = ''
                }
            })
            if (this.formEdit) {
                this.form = Object.assign(form, this.formEdit)
            } else {
                this.form = Object.assign({}, form)
            }
        },

        getHisData() {
            this.$emit('getHisData')
        },
        // 给Form赋值
        initFields(obj) {
            this.form = Object.assign({}, this.form, obj)
            //   this.form = obj;
            this.$nextTick(() => {
                if (this.$refs.form && this.$refs.form.clearValidate) {
                    this.$refs.form.clearValidate()
                }
            })
        },

        // 给字段赋值
        initFieldsObj(obj) {
            for (const key in obj) {
                this.form[key] = obj[key]
            }
            this.$nextTick(() => {
                if (this.$refs.form && this.$refs.form.clearValidate) {
                    this.$refs.form.clearValidate()
                }
            })
        },

        handleConfirm() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.$emit('handleConfirm', true)
                } else {
                    this.$emit('handleConfirm', false)
                }
            })
        }
    }
}
</script>

<style>
.commonForm .el-date-editor.el-input,
.el-date-editor.el-input__inner {
    width: 100% !important;
}
.commonForm .el-cascader--small {
    width: 100% !important;
}
.commonForm .el-collapse-item__header {
    height: 40px !important;
}
.commonForm .avatar-uploader .el-upload {
    margin-top: 15px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.commonForm .avatar-uploader .el-upload:hover {
    border-color: #409eff;
}
.commonForm .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
}
.commonForm .avatar {
    width: 120px;
    height: 120px;
    display: block;
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
</style>

