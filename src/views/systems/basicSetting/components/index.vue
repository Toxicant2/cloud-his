<template>
    <el-row v-loading="loading" class="page-main parameter">
        <el-button size="small" type="primary" style="float:right;margin-bottom:10px" @click="handleFresh">更新参数模板</el-button>
        <p class="left_title">参数类型</p>
        <el-tabs :tab-position="tabPosition" v-model="activeTab" style="height: auto;clear:both;">
            <el-tab-pane v-for="tab in tabList" :label="tab.label" :key="tab.key" :name="tab.key" :id="tab.id">
                <!-- {{tableData}} -->
                <!-- {{tab.key}} -->
                <!-- {{tableData[tab.key]}} -->

                <el-table :data="tableData[tab.key]" border style="width: 100%" header-row-class-name="headerName">
                    <el-table-column type="index" label="序列" width="50" align="center"/>
                    <template v-for="column in tableColumns">

                        <el-table-column v-if="column.isChange" :prop="column.value" :key="column.value" :label="column.label" :width="column.width || 'auto'" :align="column.align">
                            <template slot-scope="scope">
                                <template v-if="scope.row.paramType === 'input'">
                                    <el-input v-model="scope.row[column.value]" :size="size" placeholder="请输入内容" @blur="handleBlur(scope.row,scope.row[column.value])"/>
                                </template>
                                <template v-else-if="scope.row.paramType === 'select'">
                                    <el-select v-model="scope.row[column.value]" :size="size" :multiple="scope.row.paramTypeMutiple" placeholder="请选择">
                                        <el-option v-for="item in scope.row.paramOptions" :key="item.value" :label="item.label" :value="item.value"/>
                                    </el-select>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column v-else :prop="column.value" :key="column.value" :label="column.label" :width="column.width || 'auto'" :align="column.align"/>
                    </template>
                </el-table>

            </el-tab-pane>
        </el-tabs>
        <el-row class="btn">
            <el-button :size="size" type="primary" @click="saveParams">保存</el-button>
        </el-row>

    </el-row>
</template>

<script>
import { getParamsType, getParamsList, editParams, getDictById, freshParams } from '@/api/catalog'
import { getOrgOpts, getDepartmentOpts } from '@/api/org'
import {
    param
} from '@/utils'
export default {
    data() {
        return {
            loading: false,
            size: 'small',
            tabPosition: 'left',
            activeTab: 'tab0',
            tabList: [],
            tableColumns: [
                {
                    label: '参数名称',
                    value: 'paramName',
                    width: 300
                },
                {
                    label: '默认值',
                    value: 'default',
                    width: 200,
                    align: 'center'
                },
                {
                    label: '参数值',
                    value: 'paramValue',
                    width: 200,
                    isChange: true
                },
                {
                    label: '参数说明',
                    value: 'paramNote'
                }
            ],
            tableData: {},
            arrData: [],
            isTriageOldVal: '',
            isTriageNewVal: ''
        }
    },
    mounted() {
        this.getParams()
    },
    methods: {
        getParams() {
            this.loading = true
            // 获取参数类型及列表
            const options = []
            const tableData = []
            getParamsType().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach((item, index) => {
                            if (item.confType) {
                                options.push({
                                    label: item.confType,
                                    key: 'tab' + index,
                                    id: item.id
                                })
                            }
                            tableData['tab' + index] = []
                            this.getParamItems(item.id, index)
                        })
                    }
                    Object.assign(this.tableData, tableData)
                    this.tabList = options
                    this.loading = false
                }
            })
        },

        getParamItems(id, index) {
            this.tableData['tab' + index] = []
            this.arrData = []
            const data = {
                parentId: id
            }
            getParamsList(data).then(result => {
                if (result.STATUS === '1') {
                    const d = result.ITEMS
                    if (d && d.length > 0) {
                        d.forEach((paramItem, pindex) => {
                            const options = []
                            if (paramItem.uiType === 'select' || paramItem.uiType === 'multi-select') {
                                if (paramItem.optionDictId) {
                                    getDictById({ dictId: paramItem.optionDictId }).then(dicRes => {
                                        if (dicRes.STATUS === '1') {
                                            const dicData = dicRes.ITEMS.records
                                            dicData.forEach(item => {
                                                options.push({
                                                    label: item.name,
                                                    value: item.code
                                                })
                                            })
                                        }
                                    })
                                } else if (paramItem.dictCode === 'orgOptions') {
                                    getOrgOpts({ type: 0 }).then(dicRes => {
                                        if (dicRes.STATUS === '1') {
                                            const tempData = dicRes.ITEMS
                                            const dicData = tempData.filter(opt => opt.orgLevel === 3)
                                            dicData.forEach(item => {
                                                options.push({
                                                    label: item.name,
                                                    value: item.id
                                                })
                                            })
                                        }
                                    })
                                } else if (paramItem.code === 'defaultRegDepartment') {
                                    getDepartmentOpts().then(dicRes => {
                                        if (dicRes.STATUS === '1') {
                                            const d = dicRes.ITEMS
                                            if (d && d.length > 0) {
                                                d.forEach(item => {
                                                    options.push({
                                                        value: param({
                                                            departId: item.id,
                                                            departCode: item.code,
                                                            departName: item.name
                                                        }),
                                                        label: item.name
                                                    })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                            if (paramItem.id === 140) {
                                this.isTriageOldVal = paramItem.actualValue
                            }
                            this.$nextTick(() => {
                                this.tableData['tab' + index].push({
                                    id: paramItem.id,
                                    paramName: paramItem.name,
                                    default: paramItem.defaultValue,
                                    paramValue:
                                        paramItem.uiType === 'multi-select' && paramItem.actualValue
                                            ? paramItem.dictCode === 'orgOptions'
                                                ? paramItem.actualValue.split(',').map(Number)
                                                : paramItem.actualValue.split(',')
                                            : paramItem.actualValue,
                                    paramNote: paramItem.note,
                                    paramType:
                                        paramItem.uiType === 'multi-select' ? 'select' : paramItem.uiType || 'input',
                                    paramTypeMutiple: paramItem.uiType === 'multi-select',
                                    paramOptions: options
                                })
                            })
                        })
                    }
                }
            })
        },

        // 保存
        saveParams() {
            let flag = true
            const data = []
            const ids = []
            for (var key in this.tableData) {
                if (key === this.activeTab) {
                    const d = this.tableData[key]
                    if (d && d.length > 0) {
                        for (let i = 0; i < d.length; i++) {
                            const item = d[i]
                            // 药品管理加成参数值验证
                            if (key === 'tab1') {
                                const reg = /^([1-9]{1}\d{0,2}(\.\d{1,2})?|0)$/
                                if (!reg.test(item.paramValue)) {
                                    this.$message.error('参数值不规范')
                                    flag = false
                                    break
                                }
                            }
                            ids.push(item.id)
                            let actualValue = ''
                            if (item.paramTypeMutiple) {
                                actualValue = item.paramValue.join(',')
                            } else {
                                actualValue = item.paramValue
                            }
                            data.push({
                                actualValue: actualValue,
                                id: item.id
                            })
                        }
                    }
                    if (ids.indexOf(140) > -1) {
                        data.forEach(item => {
                            if (item.id === 140) {
                                this.isTriageNewVal = item.actualValue
                            }
                        })
                    } else {
                        this.isTriageNewVal = this.isTriageOldVal
                    }
                }
            }
            if (flag) {
                this.loading = true
                editParams(data).then(res => {
                    this.loading = false
                    if (res.STATUS === '1') {
                        this.$message.success('保存成功')
                        // this.$store.dispatch('GetUserInfo', res.ITEMS)
                        this.$store.dispatch('updateClinic', res.ITEMS)
                        if (this.isTriageOldVal !== this.isTriageNewVal) {
                            window.location.reload()
                        }
                    }
                })
            }
        },

        // 更新
        handleFresh() {
            freshParams().then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.getParams()
                }
            })
        },
        // input框修改
        handleBlur(row, val) { }
    }
}
</script>

<style lang="scss" scoped>
.page-main {
    padding: 0 10px 10px;
}
.left_title {
    width: 200px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 14px;
    border: 1px solid #ddd;
    background: #ddd;
    position: absolute;
    top: 42px;
    left: 10px;
}
.btn {
    position: absolute;
    bottom: 15px;
    right: 50px;
    button {
        width: 100px;
    }
}
</style>
<style lang="scss">
.parameter .el-tabs--left .el-tabs__active-bar.is-left,
.parameter .el-tabs--left .el-tabs__nav-wrap.is-left::after {
    width: 0px;
}
.parameter .el-tabs--left .el-tabs__header.is-left {
    width: 200px;
    border: 1px solid #ddd;
    border-top: none;
    padding-bottom: 80px;
    margin-right: 0;
    margin-top: 40px;
    height: 640px;
}
.parameter .el-tabs--left .el-tabs__item.is-left {
    text-align: left;
}
.parameter .headerName {
    th {
        background-color: #eef5fd;
        color: #586276;
        padding: 8px 0;
    }
}
.parameter .el-table td {
    padding: 8px 0;
}
.parameter .el-tabs__content {
    max-height: 630px;
    overflow-y: scroll;
}
</style>
