<template>
  <div class="inspection">
    <el-table-self
      :tab-type="'index'"
      :tab-label="'序号'"
      :list-loading="listLoading"
      :table-data="tableData"
      :columns="columns"
      :disabled="disabled"
    />
  </div>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import { getChargePageList } from '@/api/catalog'
export default {
    components: {
        elTableSelf
    },
    props: {
        disabled: { type: Boolean }
    },
    data() {
        return {
            activeNames: [],
            testName: '',
            size: 'small',
            panelLoading: false,
            listLoading: false,
            headerClass: 'default',
            tab2Active: '0',
            highLight: true,
            // 检查单
            columns: [
                {
                    value: 'testName',
                    label: '检查项目名称',
                    width: '250px',
                    operType: 'select',
                    allowCreate: true,
                    remote: true,
                    remoteMethod: this.getChargePage,
                    opts: []
                },
                {
                    value: 'desInfo',
                    label: '描述信息',
                    maxlength: 500,
                    showInput: true,
                    operType: 'input'
                },
                {
                    value: 'proInfo',
                    label: '提示信息',
                    maxlength: 500,
                    operType: 'input',
                    showInput: true,
                    enterFunc: this.addJC
                },
                {
                    value: 'executiveSection',
                    label: '操作',
                    width: '180px',
                    align: 'center',
                    operations: [
                        {
                            type: 'text',
                            label: '删除',
                            func: this.deleteRow
                        }
                    ],
                    operType: 'button',
                    hidden: false
                }
            ],
            tableData: [
                {
                    testName: '',
                    desInfo: '',
                    proInfo: ''
                }
            ],
            activeName: ''
        }
    },
    methods: {
    // 获取检查下拉
        getChargePage(val) {
            const data = { pageNo: 1, pageSize: 10 }
            data.name = val
            getChargePageList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS.list || []
                    const temp_opts = []
                    if (d.length > 0) {
                        d.forEach(item => {
                            if (item.catType === '03') {
                                temp_opts.push({ label: item.name, value: item.name })
                            }
                        })
                    }
                    this.columns[0].opts = temp_opts
                }
            })
        },
        // 新增检查单
        addJC(row, index) {
            if (this.tableData[index].testName) {
                this.tableData.push({
                    testName: '',
                    desInfo: '',
                    proInfo: ''
                })
            } else {
                this.$message.warning('请输入本条记录中检查项目名称')
            }
        },

        // 删除检查单
        deleteRow(index, i) {
            if (this.tableData.length === 1) {
                this.tableData = [
                    {
                        testName: '',
                        desInfo: '',
                        proInfo: ''
                    }
                ]
            } else {
                this.tableData.splice(i, 1)
            }
        },

        // 提交
        submitForm() {
            // 过滤检查单
            const tempList = this.tableData
            const tempArr = []
            let valid = true
            if (tempList && tempList.length > 0) {
                tempList.forEach((item, index) => {
                    if (item.testName || item.desInfo || item.proInfo) {
                        if (!item.testName) {
                            valid = false
                            return
                        } else {
                            tempArr.push(this.tableData[index])
                        }
                    }
                })
            }
            // 过滤检验单

            const tempJYlist = this.bigProgram
            const tempJYarr = []
            let validJY = true
            if (tempJYlist && tempJYlist.length > 0) {
                tempJYlist.forEach((item, index) => {
                    tempJYarr.push({ name: item.name, testNo: item.testNo, data: [] })
                    if (item.data && item.data.length > 0) {
                        item.data.forEach((col, c) => {
                            if (
                                col.unit ||
                col.result ||
                col.reference ||
                col.mark ||
                col.itemName ||
                col.engName
                            ) {
                                if (!col.engName || !col.itemName || !col.result) {
                                    validJY = false
                                    return
                                } else {
                                    tempJYarr[index].data.push(col)
                                }
                            }
                        })
                    }
                })
            }
            this.$emit('inspectData', tempArr, valid) // 检查单

            this.$emit('checkData', tempJYarr, validJY) // 检验单
        },

        // 初始化form
        initForm() {
            this.tableData = [
                {
                    numId: 0,
                    testName: '',
                    desInfo: '',
                    proInfo: ''
                }
            ]
            this.bigProgram = []
        },
        // 检验单赋值
        copyForm(form) {
            if (form.length > 0) {
                this.bigProgram = []
                form.forEach((bigItem, bigIndex) => {
                    this.bigProgram.push({
                        name: bigItem.inspect.testName,
                        testNo: bigItem.inspect.testNo,
                        data: []
                    })
                    if (bigItem.items.length > 0) {
                        bigItem.items.forEach(item => {
                            this.bigProgram[bigIndex].data.push({
                                // numId:0,
                                itemName: item.itemName,
                                engName: item.engName,
                                result: item.result,
                                mark: item.mark,
                                unit: item.unit,
                                reference: item.reference
                            })
                        })
                    }
                })
            }
        },
        // 检查单
        copyForm2(form) {
            if (form.length > 0) {
                this.tableData = []
                form.forEach(item => {
                    this.tableData.push({
                        testName: item.inspect.testName,
                        desInfo: item.inspect.desInfo,
                        proInfo: item.inspect.proInfo,
                        testNo: item.inspect.testNo
                    })
                })
            }
        },

        initFields(form) {
            if (form.length > 0) {
                this.tableData = form
            }
        }
    },
    mounted() {
        this.columns[3].hidden = this.disabled
    }
}
</script>

<style>
.common-title .el-button--small {
  padding: 8px 15px;
}
.jyColumn .el-tabs__item {
  line-height: 20px;
  max-width: 200px;
  height: auto;
  min-height: 40px;
}
.jyColumn .el-tabs__nav {
  white-space: normal;
}
.inspection .el-collapse-item__header {
  height: 40px;
  font-size: 15px;
  font-weight: 700 !important;
}
</style>
