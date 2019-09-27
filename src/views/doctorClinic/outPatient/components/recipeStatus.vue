<template>
  <div class="recipe-status" :class="recipeAuditMsg.className">
    <div class="recipe">
      <span>{{recipeAuditMsg.msg}}</span>
      <span class="fr">
        <span>状态：{{recipeAuditMsg.statusTxt}}</span>
        <span v-if="recipeAuditMsg.status!==0&&auditMessage.checkedUserName">审核药师：{{auditMessage.checkedUserName}}</span>
      </span>
    </div>
    <div class="note" v-if="recipeAuditMsg.status === 2">
      药剂师反馈备注：{{auditMessage.checkedNote||''}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'recipeStatus',
  props: {
    auditMessage: {
      type: Object
    }
  },
  computed: {
    recipeAuditMsg() {
      const status = this.auditMessage.checkedStatus
      return {
        status,
        className: `status${status}`,
        statusTxt: status === 0 ? '待审核' : status === 1 ? '已通过' : '未通过',
        msg:
          status === 0
            ? '处方已提交药剂师审核'
            : status === 1
            ? '处方药剂师审核已通过'
            : '处方药剂师审核未通过'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.recipe-status {
  width: 100%;
  padding: 10px;
  border: 1px solid;
  margin-bottom: 15px;
  font-size: 14px;
  // 待审核
  &.status0 {
    background-color: #fbe0b3;
    border-color: #eebf72;
  }
  // 已通过
  &.status1 {
    background-color: #ddedbc;
    border-color: #53bf5a;
  }
  // 未通过
  &.status2 {
    background-color: #f3cfd3;
    border-color: #d44661;
  }
  .recipe {
    .fr {
      float: right;
      span {
        &:nth-child(2) {
          margin-left: 10px;
        }
      }
    }
  }
  .note {
    margin-top: 10px;
  }
}
</style>

