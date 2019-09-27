<template>
  <el-row>
    <el-table-self
      :columns="chargeRecordColumns"
      :table-data="chargeRecordData"
      :total-count="totalCount"
      :page-sizes="pageSizes"
      :current-page="pageIndex"
      :page-size="pageSize"
      @pageSizeChange="handleSizeChange"
      @currentPageChange="handleCurrentChange"
      @handleSearch="handleFormSearch"
    ></el-table-self>
  </el-row>
</template>

<script>
    import elTableSelf from '@/components/TabComponents/index'
    import paginationMixin from '@/components/TabComponents/mixin'
    export default {
        components: {
            elTableSelf
        },
        mixins: [paginationMixin],
        data() {
            return {
                chargeRecordColumns: [
                    {
                        label: '病人姓名',
                        value: 'name'
                    },
                    {
                        label: '单据类型',
                        value: 'name'
                    },
                    {
                        label: '本次费用',
                        value: 'name'
                    },
                    {
                        label: '实收金额',
                        value: 'name'
                    },
                    {
                        label: '退费金额',
                        value: 'name'
                    },
                    {
                        label: '支付方式',
                        value: 'name'
                    },
                    {
                        label: '收费时间',
                        value: 'name'
                    },
                    {
                        label: '结账状态',
                        value: 'name'
                    },
                    {
                        label: '来源',
                        value: 'name'
                    }
                ],
                chargeRecordData: [],
                totalCount: 1
            }
        },
        methods: {
            handleFormSearch() {

            }
        }
    }
</script>

<style lang="scss" scoped>
.scoped {
  margin-bottom: 20px;
}
</style>