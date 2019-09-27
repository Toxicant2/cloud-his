<template>
  <el-row class="page-main">
    <template v-if="type === 'addNew' ||type === 'addGo' || type === 'edit'">
      <add-check :type="type"></add-check>
    </template>
    <template v-else>
      <audit-check :type="type"></audit-check>
    </template>
  </el-row>
</template>
<script>
  import addCheck from './addCheck'
  import auditCheck from './auditCheck'
  export default {
      components: {
          addCheck,
          auditCheck
      },
  
      data() {
          return {
              type: this.$route.params.checkType
          }
      },
      methods: {
  
      },
      mounted() {
      }
  }
  
</script>
<style lang="scss" scoped>
</style>