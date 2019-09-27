<template>
  <div class="report-header">
    <span class="h1">{{orgName}}</span>
    <span class="h2">{{tabTitle}}</span>
    <span class="h3" v-if="searchDate">查询时间：{{searchDate}}</span>
    <div class="btn-groups" v-if="editAble">
        <el-button type="primary" icon="el-icon-printer" @click="print">打印</el-button>
        <el-button type="primary" icon="el-icon-download" @click="exportExcel">导出</el-button>
    </div>
  </div>
</template>

<script>
export default {
    name: 'report-header',
    props: {
        orgName: { type: String },
        tabTitle: { type: String },
        searchDate: { type: String },
        editAble: { type: Boolean, default: true }
    },
    methods: {
        // 打印
        print() {
            this.$emit('print')
        },

        // 导出
        exportExcel() {
            this.$emit('export')
        }
    }
}
</script>

<style scoped lang='scss'>
.report-header {
    width: 100%;
    position: relative;
    text-align: center;
    span{
        display: block;
    }
    .h1{
        font-size: 18px;
        height: 32px;
        line-height: 32px;
        font-weight: bold;
    }
    .h2{
        margin-top: 5px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .h3{
        text-align: left;
        font-size:14px;
        margin-bottom: 10px;
    }
    .btn-groups{
        position: absolute;
        right: 0;
        top:0;
    }
}
</style>
