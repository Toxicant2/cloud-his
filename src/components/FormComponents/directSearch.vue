<template>
    <el-form ref="form" :model="form" :label-position="labelPosition" :label-width="labelWidth" :size="size" :style="formStyle" inline class="el-form-self">
        <el-form-item v-for="(item,index) in forms" v-if="!item.hidden&&!item.hiddenItem" :key="index" :label="`${item.label}：`" :prop="item.prop" :style="item.itemStyle" :rules="item.rules" :label-width="item.labelWidth">
            <span v-if="item.labelSpecial&&!item.color" slot="label" style="color:red;">
                {{ item.labelSpecial }}
                <span style="color:#606266;">{{ item.label }}</span>
            </span>

            <span v-if="item.labelSpecial&&item.color" slot="label">{{ item.labelSpecial }}</span>

            <span v-if="!item.label" slot="label"/>
            <!-- 输入框 -->
            <el-input v-if="item.type === 'input'" v-model.trim="form[item.prop]" :clearable="item.clearable!==undefined?item.clearable:true" :disabled="item.disabled" :maxlength="item.maxlength" :placeholder="item.placeholder" :style="itemStyle || item.style" @keyup.enter.native="handleSearch" @clear="handleSearch">
                <template v-if="item.slot" :slot="item.slot.slot">
                    <el-button v-if="item.slot.type === 'button'" :icon="item.slot.icon" @click="handleSearch"/>
                    <span v-else-if="item.slot.type === 'string'">{{ item.slot.str }}</span>
                </template>
            </el-input>

            <!-- 模糊查询输入 -->
            <el-autocomplete v-else-if="item.type === 'autocomplete'" :popper-class="item.popperClass" v-model="form[item.prop]" :fetch-suggestions="item.func" :placeholder="item.placeholder" clearable @select="handleSearch">
                <template slot-scope="{ item }">
                    <div class="name">{{ item.value }}</div>
                    <span class="description">{{ item.description }}</span>
                </template>
            </el-autocomplete>

            <!-- 模糊查询选择 -->
            <el-select v-else-if="item.type === 'remote'" v-model="form[item.prop]" :placeholder="item.placeholder" :remote-method="handleSearch" filterable remote reserve-keyword>
                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"/>
            </el-select>

            <!-- 日期区间 -->
            <el-date-picker
                v-else-if="item.type === 'daterange'"
                v-model="form[item.prop]"
                :type="item.dateType||'daterange'"
                :picker-options="item.options"
                :format="item.format"
                :value-format="item.valueFormat"
                :clearable="item.clearable!==undefined?item.clearable:true"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleSearch"/>

            <!-- 日期 -->
            <el-date-picker
                v-else-if="item.type === 'date'"
                v-model="form[item.prop]"
                :disabled="item.disabled"
                :type="item.dateType?item.dateType:'date'"
                :placeholder="item.placeholder"
                :picker-options="item.options"
                :format="item.format"
                :value-format="item.valueFormat"
                :clearable="item.clearable!==undefined?item.clearable:true"
                :style="itemStyle || item.style"
                @change="handleSearch"/>

            <!-- 下拉框 -->
            <el-select v-else-if="item.type === 'select' && !item.isHidden" v-model="form[item.prop]" :disabled="item.disabled" :placeholder="item.placeholder?item.placeholder:'请选择'" :style="itemStyle || item.style" :multiple="item.multiple" clearable @change="item.func?item.func($event):handleSearch()">
                <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"/>
            </el-select>

            <!-- 单选按钮 -->
            <el-radio-group v-else-if="item.type === 'radioList'" v-model="form[item.prop]" :placeholder="item.placeholder?item.placeholder:'请选择'" :style="itemStyle" @change="handleSearch">
                <el-radio v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">{{ opt.value }}</el-radio>
            </el-radio-group>

            <!-- 多选框 -->
            <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.prop]">
                <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="item.func?item.func($event,opt.value):handleSearch()">
                    {{ opt.label }}
                    <span v-if="opt.lineSuffix" :style="opt.style" class="line-suffix"/>
                </el-checkbox>
            </el-checkbox-group>

            <!-- 级联 -->
            <el-cascader v-else-if="item.type === 'cascader'" v-model="form[item.prop]" :style="'width:'+item.width" :options="item.options" :change-on-select="item.changeSelect" :show-all-levels="item.showLevel" @change="handleSearch"/>

            <!-- 多选框 -->
            <el-checkbox-group v-else-if="item.type === 'checkboxList'" v-model="form[item.prop]">
                <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="item.func?item.func(form,opt.value):{}">{{ opt.label }}</el-checkbox>
            </el-checkbox-group>

            <!-- 按钮 -->
            <el-button v-else-if="item.type === 'button'" :type="item.color" style="float:right;" @click.native="item.func?item.func(form):{}">{{ item.value }}</el-button>

            <!-- 诊断 -->
            <template v-else-if="item.type === 'tab-select'">
                <el-popover v-model="popoverVisible" :visible-arrow="false" :transition="'linear'" trigger="click" width="700">
                    <div class="ds-header">
                        <!-- 诊断名称 -->
                        <el-input v-focus="focusState" v-model="ds.name" @input="handleFormSearch">
                            <el-button slot="append" icon="el-icon-search" @click="handleFormSearch"/>
                        </el-input>
                        <!-- 匹配规则 -->
                        <el-radio-group v-model="ds.likeType" @change="handleFormSearch">
                            <el-radio v-for="(opt,optIndex) in likeTypeList" :key="optIndex" :label="opt.value">{{ opt.label }}</el-radio>
                        </el-radio-group>
                    </div>

                    <el-scrollbar style="max-height:130px;overflow-y: scroll;">
                        <ul class="el-scrollbar__view el-select-dropdown__list">
                            <li v-for="(d,dIndex) in dsList" v-if="dsList.length > 0" :key="dIndex" class="el-select-dropdown__item" @click="handleDsClick(d)" @contextmenu="handleDsContextmenu($event,d)">{{ d.name }}</li>
                            <li v-else>暂无数据</li>
                        </ul>
                    </el-scrollbar>

                    <div class="ds-footer">
                        <el-pagination :current-page="pageIndex" :page-sizes="pageSizes" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
                    </div>

                    <div slot="reference" class="ds-container" style="width:700px">
                        <span v-if="form[item.prop] && form[item.prop].length > 0" style="display: inline-block;width: auto;">
                            <el-tag v-for="(tag,index) in form[item.prop]" :key="index" :type="'info'" :size="'mini'" :hit="false" :closable="true" :disable-transitions="false" @close="handleClose(tag)">{{ tag.diseaseName }}</el-tag>
                        </span>
                        <span v-else class="placeholder">可搜索查询，可右键存疑</span>
                    </div>
                </el-popover>
                <!-- 右键 -->
                <vue-context-menu :menu-data="menuData" :context-menu-data="contextMenuData" @inDoubt="inDoubt" />
            </template>
        </el-form-item>

        <el-collapse v-model="activeName">
            <el-collapse-item name="hiddenForm">
                <el-col v-for="(item,index) in forms" v-if="item.hiddenItem" :xs="item.xs||24" :sm="item.sm||12" :lg="item.lg||6" :key="index">
                    <el-form-item v-if="!item.hidden" :label="`${item.label}：`" :prop="item.prop" :rules="item.rules" :label-width="item.labelWidth">
                        <span v-if="!item.label" slot="label"/>
                        <!-- 输入框 -->
                        <el-input v-if="item.type === 'input'" v-model="form[item.prop]" :disabled="item.disabled" :maxlength="item.maxlength" :placeholder="item.placeholder" :style="itemStyle" @keyup.enter.native="handleSearch">
                            <template v-if="item.slot" :slot="item.slot.slot">
                                <el-button v-if="item.slot.type === 'button'" :icon="item.slot.icon" @click="handleSearch"/>
                                <span v-else-if="item.slot.type === 'string'">{{ item.slot.str }}</span>
                            </template>
                        </el-input>

                        <!-- 模糊查询输入 -->
                        <el-autocomplete v-else-if="item.type === 'autocomplete'" :popper-class="item.popperClass" v-model="form[item.prop]" :fetch-suggestions="item.func" :placeholder="item.placeholder" clearable @select="handleSearch">
                            <template slot-scope="{ item }">
                                <div class="name">{{ item.value }}</div>
                                <span class="description">{{ item.description }}</span>
                            </template>
                        </el-autocomplete>

                        <!-- 模糊查询选择 -->
                        <el-select v-else-if="item.type === 'remote'" v-model="form[item.prop]" :placeholder="item.placeholder" :remote-method="handleSearch" filterable remote reserve-keyword clearable>
                            <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"/>
                        </el-select>

                        <!-- 日期区间 -->
                        <el-date-picker
                            v-else-if="item.type === 'daterange'"
                            v-model="form[item.prop]"
                            :picker-options="item.options"
                            :format="item.format"
                            :value-format="item.valueFormat"
                            type="daterange"
                            align="right"
                            unlink-panels
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            @change="handleSearch"/>

                        <!-- 日期 -->
                        <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.prop]" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="handleSearch"/>

                        <!-- 下拉框 -->
                        <el-select v-else-if="item.type === 'select'" v-model="form[item.prop]" :placeholder="item.placeholder?item.placeholder:'请选择'" :style="itemStyle" @change="handleSearch">
                            <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"/>
                        </el-select>

                        <!-- 单选按钮 -->
                        <el-radio-group v-else-if="item.type === 'radioList'" v-model="form[item.prop]" :placeholder="item.placeholder?item.placeholder:'请选择'" :style="itemStyle" @change="handleSearch">
                            <el-radio v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">{{ opt.value }}</el-radio>
                        </el-radio-group>

                        <!-- 多选框 -->
                        <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.prop]">
                            <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="handleSearch">
                                {{ opt.label }}
                                <span v-if="opt.lineSuffix" :style="opt.style" style="display:inline-block;width:5px;height:16px;vertical-align: text-top;"/>
                            </el-checkbox>
                        </el-checkbox-group>

                        <!-- 级联 -->
                        <el-cascader v-else-if="item.type === 'cascader'" v-model="form[item.prop]" :style="'width:'+item.width" :options="item.options" :change-on-select="item.changeSelect" :show-all-levels="item.showLevel" @change="handleSearch"/>

                        <!-- 多选框 -->
                        <el-checkbox-group v-else-if="item.type === 'checkboxList'" v-model="form[item.prop]">
                            <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="item.func?item.func(form,opt.value):{}">{{ opt.label }}</el-checkbox>
                        </el-checkbox-group>

                        <!-- 按钮 -->
                        <el-button v-else-if="item.type === 'button'" :type="item.color" style="float:right;" size="small" @click.native="item.func">{{ item.value }}</el-button>
                    </el-form-item>
                </el-col>
            </el-collapse-item>
        </el-collapse>
    </el-form>
</template>

<script>
import paginationMixin from '@/components/TabComponents/mixin'
import vueContextMenu from '@/components/ContextMenu'
import { getDiagnosticListByPage } from '@/api/catalog'
export default {
    directives: {
        focus: {
            update: function(el, { value }) {
                if (value) {
                    el.children[0].focus()
                }
            }
        }
    },
    components: { vueContextMenu },
    mixins: [paginationMixin],
    props: {
        size: { type: String, default: 'small' },
        labelPosition: { type: String, default: 'right' },
        labelWidth: { type: String },
        formStyle: { type: Object },
        forms: { type: Array }, // 表单组
        itemStyle: { type: Object }
    },
    data() {
        return {
            form: {},
            activeName: [],
            contextMenuData: {
                menuName: 'contextmenu',
                axios: {
                    x: null,
                    y: null
                },
                menulists: [
                    {
                        fnHandler: 'inDoubt',
                        icoName: 'el-icon-question',
                        btnName: '存疑'
                    }
                ]
            },
            ds: {
                name: '',
                likeType: 0
            },
            popoverVisible: false,
            focusState: false,
            likeTypeList: [
                {
                    value: 0,
                    label: '关键字匹配'
                },
                {
                    value: 1,
                    label: '顺序匹配'
                }
            ],
            total: 0,
            dsList: [],
            menuData: null
        }
    },
    watch: {
        popoverVisible(newVal) {
            if (newVal) {
                this.ds = {
                    name: '',
                    likeType: 0
                }
                this.total = 0
                this.dsList = []
                this.focusState = true
            }
        }
    },
    created() {
        this.initforms()
    },
    methods: {
        // 表单赋值
        initforms(formEdit, name) {
            // this.$nextTick(() => {
            const form = {}
            this.forms.forEach(item => {
                if (!item.prop || item.hidden) return false
                if (
                    item.type === 'daterange' ||
                    item.type === 'checkboxList' ||
                    item.type === 'checkbox' ||
                    item.type === 'cascader' ||
                    item.type === 'tab-select' ||
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
            if (name === 'follow') {
                this.$emit('handleSearch', this.form) // 随访管理的随访用到
            }
            // })
        },

        // 查询
        handleSearch() {
            this.$emit('handleSearch', this.form)
        },

        // 给Form赋值
        initFields(obj) {
            this.form = obj
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

        changeHiddenForm(flag) {
            this.activeName = flag ? ['hiddenForm'] : []
        },

        // 表单查询
        handleFormSearch() {
            this.pageIndex = 1
            this.handleSearchDiagnose()
        },
        // 查询诊断
        handleSearchDiagnose() {
            const form = this.ds
            if (form.name) {
                const params = {
                    pageNo: this.pageIndex,
                    pageSize: this.pageSize,
                    isUse: 1,
                    name: form.name,
                    likeType: form.likeType
                }
                getDiagnosticListByPage(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        let result = []
                        if (d.total > 0) {
                            result = d.records
                        }
                        this.total = d.total
                        this.dsList = result
                    }
                })
            } else {
                this.total = 0
                this.dsList = []
            }
        },

        // 诊断行点击
        handleDsClick(row, isInDoubt = false) {
            const flag = this.form.diagnosisList.some((item, index) => {
                return item.diseaseCode === row.code
            })
            if (flag) {
                this.$message.error('已有西医诊断，无需重复添加！')
                return false
            }
            this.form.diagnosisList.push({
                diagnosisType: row.classValue,
                diseaseCode: row.code,
                diseaseName: row.name + (isInDoubt ? '?' : '')
            })
            this.pageIndex = 1
            this.ds = {
                name: '',
                likeType: 0
            }
            this.popoverVisible = false
        },

        // 诊断右键
        handleDsContextmenu(event, d) {
            event.preventDefault()
            var x = event.clientX
            var y = event.clientY
            this.menuData = d
            this.contextMenuData.axios = { x, y }
        },

        // 存疑诊断
        inDoubt(row) {
            this.handleDsClick(row, true)
        },

        // 移除诊断
        handleClose(tag) {
            this.form.diagnosisList.forEach((item, index) => {
                if (item.diseaseCode === tag.diseaseCode) {
                    this.form.diagnosisList.splice(index, 1)
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.el-form-self {
    .el-form-item {
        margin-bottom: 10px !important;
    }
    .line-suffix{
        display:inline-block;width:5px;height:16px;vertical-align: text-top;
    }
}
.ds-header {
    .el-input-group {
        width: 50%;
    }
    .el-radio-group {
        transform: translate(10px, 5px);
    }
}
.ds-footer {
    text-align: right;
}
.ds-container {
    min-height: 32px;
    padding: 0 15px 0 5px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    color: #606266;
    cursor: pointer;
    > span {
        display: inline-block !important;
        width: auto;
        &.placeholder {
            font-size: 14px;
            color: #c0c4cc;
            padding-left: 10px;
        }
    }
    .el-tag {
        border-color: transparent;
        background-color: #f0f2f5;
        margin: 2px 0 2px 6px;
        &:first-child {
            margin-left: 0;
        }
    }
    .el-tag__close.el-icon-close {
        background-color: #c0c4cc;
        right: -7px;
        top: 0;
        color: #fff;
        vertical-align: 0;
        margin-top: 0;
        &:hover {
            background-color: #909399;
        }
    }
}
</style>

<style>
.el-form-self .el-collapse-item__header {
    height: 0;
    line-height: 0;
}

.el-form-self .el-collapse {
    border: 0 !important;
}
.el-form-self .el-collapse-item__header {
    border: 0 !important;
}
.el-form-self .el-collapse-item__arrow {
    display: none;
}
</style>

