<template>
    <el-row class="page-container">
        <el-row class="page-main" >
             <el-col :span="7">
                 <el-row>
                    <el-col :span="24"></el-col>
                </el-row>
            </el-col>
            <el-col :span="17">
                <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns"   />
                <dialog-form ref="edit" :width="'450px'" :title="basicSettingTitle" :form-data="formData"  :form-edit="formEdit" @handleConfirm="handleConfirm" />
                <div class="addClass">
                    <el-button  type="primary"  @click="handleAdd">保存</el-button>
                </div>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import {
    getBasicSettingData,
    updateBasicSetting,
    addBasicSetting,
    delBasicSetting
} from '@/api/catalog'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import { mapGetters } from 'vuex'
import { getCurrentDay } from '@/utils/common'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm
    },
    data() {
        const propertyList = [
            { value: 1, label: '年' },
            { value: 2, label: '年月' },
            { value: 3, label: '年月日' }
        ]
        return {
            listLoading: false,
            basicSettingTitle: '',
            tabData: [],
            tabColumns: [
                {
                    value: 'name',
                    label: '编号类型',
                    align: 'center'
                },
                {
                    value: 'prefix',
                    label: '前缀',
                    align: 'center'
                },
                {
                    value: 'dateType',
                    label: '日期',
                    align: 'center'
                },
                {
                    value: 'numLength',
                    label: '流水号长度（位）',
                    align: 'center'
                },
                {
                    value: 'initNum',
                    label: '起始流水号',
                    align: 'center'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        },
                        {
                            func: this.handleDel,
                            label: '删除',
                            type: 'danger'
                        }
                    ]
                }
            ],
            formEdit: {},
            temp_formEdit: {
                date: 3,
                dictCode: '',
                initNum: 1,
                numLength: 3,
                prefix: ''
            },
            formData: [
                {
                    type: 'input',
                    name: '参数名称',
                    field: 'name',
                    opts: [],
                    disabled: false
                },
                {
                    type: 'input',
                    name: '默认值',
                    field: 'prefix',
                    func: this.handlePrefix
                },
                {
                    type: 'radio',
                    name: '参数值',
                    field: 'date',
                    opts: propertyList,
                    func: this.handleDate
                },
                {
                    type: 'number',
                    name: '流水号长度',
                    unit: '位',
                    slot: 'append',
                    field: 'numLength',
                    func: this.handleNumLength
                },
                {
                    type: 'input',
                    name: '起始流水号',
                    field: 'initNum',
                    func: this.handleInitNum
                },
                {
                    type: 'input',
                    name: '编号预览',
                    disabled: true,
                    field: 'settingStr'
                }
            ],
            cacheForm: {}
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    methods: {
    // 前缀
        handlePrefix(val) {
            this.formEdit.prefix = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },
        // 日期
        handleDate(val) {
            this.formEdit.date = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },
        // 流水号长度
        handleNumLength(val) {
            this.formEdit.numLength = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },
        // 起始流水号
        handleInitNum(val) {
            this.formEdit.initNum = val
            this.formEdit.settingStr = this.preSetting(this.formEdit)
            this.$refs.edit[0].form = this.formEdit
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        // 查询
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            getBasicSettingData(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d.records.length > 0) {
                        d.records.forEach(item => {
                            this.dictData[480].forEach(element => {
                                if (element.value === item.dictCode) {
                                    item.name = element.label
                                }
                            })
                            item.dateType =
                item.date === 1
                    ? '年'
                    : item.date === 2
                        ? '年月'
                        : item.date === 3
                            ? '年月日'
                            : ''
                        })
                        this.tabData = d.records
                    }
                }
            })
        },

        // 新增
        handleAdd() {
            this.formData[0].disabled = false
            this.formData[0].type = 'remote'
            this.formData[0].opts = this.dictData[480]
            this.formEdit = this.temp_formEdit
            this.basicSettingTitle = '新增规则'
            this.$refs.edit[0].open()
        },

        // 编号预览
        preSetting(obj) {
            var temp = getCurrentDay()
                .split(' ')[0]
                .split('-')
            var dateStr = ''
            for (let index = 0; index < obj.date; index++) {
                const value = temp[index]
                dateStr += value
            }
            var temp_str = ''
            for (let index = 0; index < obj.numLength - 1; index++) {
                temp_str += '0'
            }
            return obj.prefix + dateStr + temp_str + obj.initNum
        },

        // 编辑
        handleEdit(row) {
            this.basicSettingTitle = `编辑${row.name}规则`
            this.formData[0].disabled = true
            this.formData[0].type = 'input'
            var settingStr = this.preSetting(row)
            this.formEdit = {
                date: row.date,
                dictCode: row.dictCode,
                id: row.id,
                initNum: row.initNum,
                numLength: row.numLength,
                prefix: row.prefix,
                name: row.name,
                settingStr: settingStr
            }
            this.$refs.edit[0].open()
        },

        // 修改状态
        handleDel(row) {
            var ids = [row.id]
            delBasicSetting(ids).then(res => {
                this.successCallback(res, '删除成功')
            })
        },

        // 保存
        handleConfirm(form) {
            if (form.id) {
                // 修改
                updateBasicSetting(form).then(res => {
                    this.successCallback(res, '编辑成功')
                })
            } else {
                // 新增
                if (form.name) {
                    form.id = 0
                    form.dictCode = form.name
                    delete form.settingStr
                    delete form.name
                    addBasicSetting(form).then(res => {
                        this.successCallback(res, '新增成功')
                    })
                } else {
                    this.$message.error('编号类型必选')
                }
            }
        },

        // 保存成功
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$message.success(msg)
                this.$refs.edit[0].close()
            }
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>

<style>
.addClass {
  text-align: right;
  margin: 10px 6px 15px 0px;
}
</style>
