<template>
  <div class="patient-info">
    <form-dialog
      ref="patientRequire"
      :form-data="patientInfo"
      @handleConfirm="handleConfirm"
      :form-edit="patientRequireData"
      :disabled="disabled"
    ></form-dialog>
  </div>
</template>

<script>
import formDialog from '@/components/FormComponents/transfer'
export default {
    data() {
        return {
            activeNames: [],
            patientRequireData: {},
            patientFormData: null,
            size: 'small'
        }
    },
    props: {
        patientInfo: { type: Array },
        isMore: { type: Boolean },
        disabled: { type: Boolean }
    },
    components: {
        formDialog
    },
    computed: {
        form: function() {
            return this.$refs.patientRequire.form
        }
    },
    methods: {
        initFields(form) {
            this.$refs.patientRequire.initFields(form)
        },

        validPatientInfo() {
            this.$refs.patientRequire.handleConfirm()
        },

        handleConfirm(flag) {
            this.$emit('handleConfirm', flag)
        }
    }
}
</script>
<style lang="scss" scoped>
.patient-info {
  .title {
    color: black;
    font-size: 16px;
    font-weight: bold;
  }
  .ptin-tip {
    padding-left: 4%;
    color: rgb(245, 108, 108);
    line-height: 30px;
    margin-bottom: 15px;
  }
  .el-collapse {
    border-top: 0;
  }
}
</style>
<style>
.patient-info .el-collapse-item__header {
  height: 40px;
  font-size: 15px;
  font-weight: 700 !important;
}
</style>

