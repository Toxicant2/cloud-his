<template>
  <div class="inspection">
    <el-table-self
      :tab-type="'index'"
      :tab-label="'序号'"
      @blurCell="blurCell"
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
            columns: [
                {
                    value: 'testName',
                    label: '项目名称',
                    operType: 'select',
                    foucFunc: this.foucFunc,
                    opts: [],
                    allowCreate: true,
                    remote: true,
                    remoteMethod: this.getChargePage
                },
                {
                    value: 'engName',
                    width: '130px',
                    label: '子项目代号',
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'itemName',
                    label: '子项目名称',
                    width: '300px',
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'result',
                    label: '检验结果',
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'mark',
                    label: '提示',
                    operType: 'input',
                    showInput: true
                },
                {
                    value: 'reference',
                    label: '参考值',
                    operType: 'input',
                    type: 'number',
                    showInput: true
                },
                {
                    value: 'unit',
                    label: '单位',
                    operType: 'input',
                    showInput: true,
                    enterFunc: this.addJC
                },
                {
                    value: 'executiveSection',
                    label: '操作',
                    width: '135px',
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
                    engName: '',
                    itemName: '',
                    result: '',
                    reference: '',
                    mark: '',
                    unit: '',
                    testNo: ''
                }
            ],
            activeName: ''
        }
    },
    methods: {
        foucFunc(value, index) {
            this.getChargePage()
        },
        // 验证数据
        blurCell(index, row) {
            var regEngName = /^[a-zA-Z0-9]{1,100}$/
            if (row.engName && !regEngName.test(row.engName)) {
                this.$message.warning('子项目代号为字母、数字')
                row.engName = ''
            }
        },
        remoteMethod(val) {
            this.getChargePage(val)
        },
        // 获取检验下拉
        getChargePage(val) {
            const data = { pageNo: 1, pageSize: 10 }
            data.name = val
            getChargePageList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS.list || []
                    const temp_opts = []
                    if (d.length > 0) {
                        d.forEach(item => {
                            if (item.catType === '04') {
                                temp_opts.push({
                                    label: item.name,
                                    value: item.code + ',' + item.name
                                })
                            }
                        })
                    }
                    this.columns[0].opts = temp_opts
                }
            })
        },
        // 新增检验单
        addJC(row, index) {
            if (
                this.tableData[index].testName &&
        this.tableData[index].itemName &&
        this.tableData[index].result
            ) {
                this.tableData.push({
                    testName: this.tableData[index].testName,
                    engName: '',
                    itemName: '',
                    result: '',
                    reference: '',
                    mark: '',
                    unit: '',
                    testNo: this.tableData[index].testNo
                })
            } else {
                this.$message.warning(
                    '请输入本条记录中检验项目名称、子项目名称、检验结果'
                )
            }
        },

        // 删除检验单
        deleteRow(index, i) {
            if (this.tableData.length === 1) {
                this.tableData = [
                    {
                        testName: '',
                        engName: '',
                        itemName: '',
                        result: '',
                        reference: '',
                        mark: '',
                        unit: '',
                        testNo: ''
                    }
                ]
            } else {
                this.tableData.splice(i, 1)
            }
        },

        // 初始化form
        initForm() {
            this.tableData = [
                {
                    testName: '',
                    engName: '',
                    itemName: '',
                    result: '',
                    reference: '',
                    mark: '',
                    unit: '',
                    testNo: ''
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
                        proInfo: item.inspect.proInfo,
                        testNo: item.inspect.testNo
                    })
                })
            }
        },
        // 删除检验单大项目
        removeTab(index) {
            this.bigProgram.splice(index, 1)
            this.jyTabs = String(this.bigProgram.length - 1)
        },
        // 转诊详情赋值
        initFields(form) {
            if (form.length > 0) {
                const temp = []
                form.forEach(item => {
                    item.items.forEach(element => {
                        const temp_obj = element
                        temp_obj.testName = item.inspect.testName
                        temp_obj.testNo = item.inspect.testNo

                        temp.push(temp_obj)
                    })
                })
                this.tableData = temp
            }
        },
        // 非转诊详情赋值
        initField(form) {
            if(form.length > 0){
                this.tableData = form
            }

        }
    },
    mounted() {
        this.columns[7].hidden = this.disabled
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
