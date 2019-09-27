<template>
  <el-row>
    <direct-search ref="form" :label-position="'center'" :label-width="labelWidth?labelWidth:'100px'" :form-style="{'text-align':'left','margin':'10px 0px 20px 0'}" :forms="searchList" @handleSearch="handleFormSearch" />
    <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" :total-count="totalCount" :page-sizes="pageSizes" :current-page="pageIndex" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" @handleSearch="handleFormSearch" :show-summary="isSearchInvoice && pageIndex >= (totalCount/pageSize)" :get-summaries="summaryMethod" />
  </el-row>
</template>
<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import {toFixed} from '@/utils/float'
export default {
    components: {
        directSearch,
        elTableSelf
    },
    mixins: [paginationMixin],
    props: {
    // 搜索列表
        searchList: {
            type: Array
        },
        // 表头
        tabColumns: {
            type: Array
        },
        // 表格数据
        tabData: {
            type: Array
        },
        labelWidth: {
            type: String
        },
        totalCount: {
            type: Number
        },
        summaryPurchasePrice:{
            type:Number
        },
        summaryRetailPrice:{
            type:Number
        },
        isSearchInvoice:{
            type:Boolean
        }
    },
    data() {
        return {
            listLoading: false,
            pageIndex: 1,
            
           
        }
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    methods: {
        routerChange() {
            this.handleSearch()
            this.pageIndex = 1
            // this.showIndex = this.$route.name === 'storage'
        },
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 查询
        handleSearch(form) {
            form = form || {}
            form.pageNo = this.pageIndex
            form.pageSize = this.pageSize
            this.$emit('handleSearch', form)
        },
        

        // 点击审核
        handleAudit(row) {
            this.$router.push({
                name: 'audeStorage'
            })
        },

        // 修改启用状态
        handleStatus(row) {
            this.$router.push({ name: 'updateGetStorage' })
        },

        // 合计行
        summaryMethod(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                const values = data.map(item => Number(item[column.property]))
                if (index === 8) {
                    sums[index] = toFixed(this.summaryPurchasePrice, 4)
                } else if (index === 10) {
                    sums[index] = toFixed(this.summaryRetailPrice, 4)
                } else {
                    sums[index] = ''
                }
            })

            return sums
        }
    },
    mounted() {
        this.handleFormSearch()
    }
}
</script>
