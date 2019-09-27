<template>
  <div class="inspection">
    <form-dialog ref="costInfo" :form-data="costInfo" :form-edit="costData" :disabled="disabled"></form-dialog>
  </div>
</template>

<script>
import formDialog from '@/components/FormComponents/transfer'
export default {
    components: {
        formDialog
    },
    data() {
        return {
            costData: {
                totalCharge: '',
                isSubsidy: 1,
                moneySubsidy: ''
            },
            commonCostInfo: [
                {
                    type: 'input',
                    name: '总金额',
                    field: 'totalCharge',
                    maxlength: 11,
                    labelWidth: '60px',
                    slot: {
                        slot: 'append',
                        type: 'string',
                        str: '元'
                    },
                    rules: [
                        {
                            pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
                            message: '只能输入数字并且最多保留两位小数',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'radio',
                    name: '是否享受统筹补贴',
                    hidden: true,
                    func: this.changeRadio,
                    field: 'isSubsidy',
                    opts: [
                        {
                            label: '是',
                            value: 1
                        },
                        {
                            label: '否',
                            value: 0
                        }
                    ]
                },
                {
                    type: 'radio',
                    name: '是否享受残联补贴',
                    func: this.changeRadio,
                    hidden: true,
                    field: 'isSubsidy',
                    opts: [
                        {
                            label: '是',
                            value: 1
                        },
                        {
                            label: '否',
                            value: 0
                        }
                    ]
                },
                {
                    type: 'input',
                    labelWidth: '80px',
                    hidden: true,
                    name: '补贴金额',
                    placeholder: '',
                    maxlength: 11,
                    slot: {
                        slot: 'append',
                        type: 'string',
                        str: '元'
                    },
                    field: 'moneySubsidy',
                    rules: [
                        {
                            pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
                            message: '只能输入数字并且最多保留两位小数',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            activeNames: []
        }
    },
    props: {
        flag: { type: Boolean },
        disabled: { type: Boolean }
    },
    computed: {
        costInfo: function() {
            this.commonCostInfo[1].hidden = this.flag
            this.commonCostInfo[2].hidden = !this.flag
            return this.commonCostInfo
        }
    },
    methods: {
        changeRadio(val) {
            this.commonCostInfo[3].hidden = val != 1
            // this.commonCostInfo[3].moneySubsidy = ''
        },
        // 初始化form
        initForm() {
            this.costData = {
                totalCharge: '',
                isSubsidy: 0,
                moneySubsidy: ''
            }
        },
        initFields(form) {
            if (!form) {
                form = {
                    totalCharge: '',
                    isSubsidy: 0,
                    moneySubsidy: ''
                }
                this.commonCostInfo[3].hidden = true
            } else {
                this.commonCostInfo[3].hidden = form.isSubsidy != 1
            }
            this.$refs.costInfo.initFields(form)
        }
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
