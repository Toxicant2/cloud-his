<template>
  <div class="western-medicine">
    <el-table-self
      :tab-type="'index'"
      :tab-label="'序号'"
      @blurCell="blurCell"
      @remoteMethod="remoteMethod"
      :list-loading="listLoading"
      :table-data="tabList"
      :columns="columns"
      :disabled="disabled"
    />
  </div>
</template>

<script>
// import complexTab from './complex'
import elTableSelf from '@/components/TabComponents/index'
import { getDictByIdList, getChargePageList } from '@/api/catalog'
import { param, formatDictMap } from '@/utils'
export default {
    components: {
        elTableSelf
    },
    props: {
        disabled: { type: Boolean }
    },
    data() {
        const dictData = this.$store.getters.dictData
        const dictMap = {
            144: [], // 西药-用法
            152: [], // 中药-用法
            145: [] // 频率,
        }
        let str = ''
        const usage = []
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        if (item.dictId === 145) {
                            dictMap[item.dictId].push({
                                value: item.name,
                                label: item.name
                            })
                        } else { // 转诊系统要用法的name,code
                            dictMap[item.dictId].push({
                                value: param({
                                    code: item.code,
                                    name: item.name
                                }),
                                label: item.name
                            })
                        }
                    })
                }
            }
        })
        return {
            activeNames: ['medicine-Info'],
            totalPrice: 0,
            size: 'small',
            panelLoading: false,
            listLoading: false,
            headerClass: 'default',
            tab2Active: '0',
            highLight: true,
            tabList: [
                {
                    orderSubNo: 12,
                    drugName: '',
                    dose: '',
                    routeName: '',
                    frequency: '',
                    days: '',
                    groupNo: ''
                }
            ],
            columns: [
                {
                    operType: 'input',
                    label: '组号',
                    value: 'groupNo',
                    maxLength: 20,
                    width: '150px',
                    showInput: true,
                    rules: [
                        {
                            required: true,
                            message: '数字或字母，最多20位',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    operType: 'select',
                    label: '药品名称',
                    showInput: true,
                    value: 'drugName',
                    allowCreate: true,
                    remote: true,
                    remoteMethod: this.remoteMethod,
                    opts: []
                },
                {
                    operType: 'input',
                    value: 'dose',
                    label: '单次剂量',
                    width: '180px',
                    unit: 'dosageUnit',
                    showInput: true
                },
                {
                    operType: 'select',
                    value: 'routeName',
                    width: '180px',
                    label: '用法',
                    showInput: true,
                    opts: []
                },
                {
                    operType: 'select',
                    value: 'frequency',
                    width: '180px',
                    label: '频率',
                    showInput: true,
                    opts: dictMap[145]
                },
                {
                    operType: 'input',
                    value: 'days',
                    min: 0,
                    label: '天数',
                    placeholder: '',
                    precision: 0,
                    max: 90,
                    type: 'number',
                    width: '180px',
                    showInput: true,
                    enterFunc: this.addDrugs
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
            activeName: '',
            dictMap,
            dictData
        }
    },
    computed: {},
    methods: {
    // 验证数据
        blurCell(index, row) {
            var regGroupNo = /^[a-zA-Z0-9]{1,20}$/
            if (row.groupNo && !regGroupNo.test(row.groupNo)) {
                this.$message.warning('组号为字母、数字，最多20位')
                row.groupNo = ''
            }
        },
        remoteMethod(val) {
            this.getProjectDrug(val)
        },
        // 药品下拉
        getProjectDrug(val) {
            const data = { pageNo: 1, pageSize: 10 }
            data.name = val
            getChargePageList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS.list || []
                    const temp_opts = []
                    if (d.length > 0) {
                        d.forEach(item => {
                            if (item.catType === '01' || item.catType === '02') {
                                temp_opts.push({ label: item.name, value: item.name })
                            }
                        })
                    }
                    this.columns[1].opts = temp_opts
                }
            })
        },

        // 添加处方
        addTab() {
            const name = '' + this.tabList.length + ''
            this.tabList.push({
                name: name,
                detailList: [
                    {
                        orderSubNo: 1,
                        drugName: '',
                        dose: '',
                        routeName: '',
                        frequency: '',
                        days: '',
                        groupNo: ''
                    }
                ]
            })
        },

        // 删除处方
        removeTab(targetName) {
            const tabs = this.tabList
            let activeName = this.tab2Active
            tabs.forEach((tab, index) => {
                if (tab.name === targetName) {
                    const nextTab = tabs[index + 1] || tabs[index - 1]
                    if (nextTab) {
                        activeName = nextTab.name
                    }
                }
            })
            this.tab2Active = activeName
            this.tabList = tabs.filter(tab => tab.name !== targetName)
        },

        // 切换处方
        handleTab2Switch() {},

        // 添加药品
        addDrugs(val, index) {
            if (this.tabList[index].drugName) {
                this.tabList.push({
                    drugName: '',
                    orderSubNo: '',
                    dose: '',
                    routeName: '',
                    frequency: '',
                    days: '',
                    groupNo: ''
                })
            } else {
                this.$message.warning('请输入本条记录中的药品名称')
            }
        },

        // 删除药品
        deleteRow(row, index) {
            if (this.tabList.length === 1) {
                this.tabList = [
                    {
                        drugName: '',
                        orderSubNo: '',
                        dose: '',
                        routeName: '',
                        frequency: '',
                        days: '',
                        groupNo: ''
                    }
                ]
            } else {
                this.tabList.splice(index, 1)
            }
        },

        // 初始化form
        initForm() {
            this.tabList = [
                {
                    orderSubNo: 1,
                    drugName: '',
                    dose: '',
                    routeName: '',
                    frequency: '',
                    days: '',
                    groupNo: ''
                }
            ]
        },

        initFields(form) {
            if (form.length > 0) {
                form.forEach(item => {
                    // 没有转诊id时从西药、中药处方过来的数据
                    if (!item.routeCode && item.accountItemCode) {
                        item.frequency = formatDictMap(this.dictData[145], item.frequency)
                        if (item.chara === '10') {
                            item.routeName = param({
                                code: item.routeName,
                                name: formatDictMap(this.dictData[144], item.routeName)
                            })
                        } else {
                            item.routeName = param({
                                code: item.routeName,
                                name: formatDictMap(this.dictData[152], item.routeName)
                            })
                        }
                    }
                })
                this.tabList = form
            }
        }
    },
    mounted() {
        var _this = this
        this.columns[6].hidden = this.disabled
        setTimeout(function() {
            _this.columns[3].opts = _this.dictMap[144].concat(_this.dictMap[152])
        }, 1000)
    }
}
</script>

<style scoped lang="scss">
.footer {
  font-size: 14px;
  text-align: right;
  position: relative;
  margin-top: 20px;
  p {
    line-height: 32px;
    text-align: right;
    color: #e6a23c;
    span {
      color: #e6a23c;
    }
  }
}
</style>

<style>
.western-medicine .el-collapse-item__header {
  height: 40px;
  font-size: 15px;
  font-weight: 700 !important;
}
</style>

