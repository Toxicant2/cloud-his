<template>
    <!-- 收费记录 -->
    <div>
        <el-table-self
            :current-page="pageIndex"
            :list-loading="listLoading"
            :table-data="tabData"
            :columns="tabColumns"
            :total-count="total"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            @pageSizeChange="handleSizeChange"
            @currentPageChange="handleCurrentChange"/>
    </div>
</template>

<script>
import { getChargeList } from '@/api/charge'

import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
export default {
    name: 'charges',
    components: {
        elTableSelf
    },
    mixins: [paginationMixin],
    data() {
        return {
            listLoading: false,
            tabData: [],
            tabColumns: [
                {
                    value: 'patientName',
                    label: '患者姓名'
                }, {
                    value: 'totalAmt',
                    label: '本次费用'
                }, {
                    value: 'receivedCash',
                    label: '实收金额'
                }, {
                    value: 'chargeTypeName',
                    label: '支付方式'
                }, {
                    value: 'chargeTime',
                    label: '收费时间',
                    width: '150'
                }, {
                    label: '收费状态',
                    formatter(row) {
                        if (row.chargeStatus === 0) {
                            return row.refundStatus === 0 ? '已收费' : '已退费'
                        } else if (row.chargeStatus === 1) {
                            return '红冲'
                        }
                    }
                }, {
                    value: 'chargeSource',
                    label: '来源'
                }
            ]
        }
    },
    props: ['patientId', 'registerId'],
    methods: {
        handleSearch() {
            this.listLoading = true
            const data = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize,
                patientId: this.patientId,
                registerId: this.registerId
            }
            getChargeList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.total = d.totalRecord
                    this.tabData = d.list
                    this.listLoading = false
                }
            })
        }
    }
}
</script>
