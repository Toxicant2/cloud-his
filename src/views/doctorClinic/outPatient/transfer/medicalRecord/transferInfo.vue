<template>
  <div class="transfer-info">
    <form-dialog
      ref="transferInfo"
      :form-data="transferInfo"
      @handleConfirm="handleConfirm"
      :form-edit="transferInfoData"
      :disabled="disabled"
    ></form-dialog>
  </div>
</template>
<script>
import formDialog from '@/components/FormComponents/transfer'
import {param} from '@/utils'
export default {
    data() {
        return {
            activeNames: ['transfer-Info'],
            transferInfoData: null,
            size: 'small'
        }
    },
    props: {
        transferInfo: { type: Array },
        cacheProgram1: { type: Array },
        title: { type: String },
        disabled: { type: Boolean }
    },
    watch: {},
    components: {
        formDialog
    },
    methods: {
        validTtransferInfo() {
            this.$refs.transferInfo.handleConfirm()
        },

        handleConfirm(flag) {
            this.$emit('handleConfirm', flag)
        },
        initFields(form) {
            if (this.cacheProgram1 && this.cacheProgram1.length > 0) {
                this.cacheProgram1.forEach(item => {
                    if (item.value === form.hospitalId) {
                        if (item.depts.length > 0) {
                            // this.$refs.transferInfo.form.deptId = ''
                            item.depts.forEach(element => {
                                element.label = element.name
                                // element.value = element.id
                                element.value = param({
                                    label: element.name,
                                    value: element.id
                                })
                            })
                            this.$refs.transferInfo.formData[1].opts = item.depts
                        } else {
                            if (this.$refs.transferInfo.form && this.$refs.transferInfo.form.deptId) {
                                this.$refs.transferInfo.form.deptId = ''
                            }
                            this.$refs.transferInfo.formData[1].opts = []
                        }
                    }
                })
            }
            this.$refs.transferInfo.initFields(form)
        },

        initFieldsOpts(id) {
            if (this.cacheProgram1 && this.cacheProgram1.length > 0) {
                this.cacheProgram1.forEach(item => {
                    if (item.value === id) {
                        if (item.depts.length > 0) {
                            item.depts.forEach(element => {
                                element.label = element.name
                                element.value = element.id
                            })
                            this.$refs.transferInfo.formData[1].opts = item.depts
                        } else {
                            if (
                                this.$refs.transferInfo.form &&
                this.$refs.transferInfo.form.deptId
                            ) {
                                this.$refs.transferInfo.form.deptId = ''
                            }
                            this.$refs.transferInfo.formData[1].opts = []
                        }
                    }
                })
            }
        }
    }
}
</script>
<style>
.transfer-info .el-collapse-item__header {
  height: 40px;
  font-size: 15px;
  font-weight: 700 !important;
}
</style>