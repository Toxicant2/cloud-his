<template>
    <el-row class="page-container">
        <el-row class="page-main" v-if="libIndex" >
            <el-tabs v-model="activeName" type='card' @tab-click="handleClick">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <!-- 费用统计 -->
                    <cost-type ref="tab1" v-if="tab.key === 'tab1'" :key="'cost'"></cost-type>
                    <!-- 进销存统计 -->
                    <stock-type ref="tab2" v-else-if="tab.key === 'tab2'" :key="'stock'"></stock-type>
                    <!-- 库存统计 -->
                    <inventory-type ref="tab3" v-else-if="tab.key === 'tab3'" :key="'inventory'"></inventory-type>
                </el-tab-pane>
            </el-tabs>
        </el-row>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </el-row>
</template>
<script>

import costType from './components/cost'
import stockType from './components/stock'
import inventoryType from './components/inventory'

export default {
    components: {
        costType,
        stockType,
        inventoryType
    },
    data() {
        return {
            libIndex: true,
            tabMapOpts: [
                {
                    label: '费用统计',
                    key: 'tab1'
                }, {
                    label: '进销存统计',
                    key: 'tab2'
                }, {
                    label: '库存统计',
                    key: 'tab3'
                }
            ],
            activeName: 'tab1'
        }
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    methods: {
        // 路由变化
        routerChange() {
            this.libIndex = this.$route.name === 'report'
        },

        // 切换TAB
        handleClick(tab, event) {
            if (tab.name === 'tab4') {
                return false
            }
            this.$refs[tab.name][0].handleInitCp()
        }
    },
    mounted() {
        this.routerChange()
    }
}
</script>

<style lang="scss">
.round-btn-group {
    border-bottom: 1px solid #e4e7ed;
    padding: 0 5px 10px;
    .el-radio-button{
        .el-radio-button__inner {
            border-radius: 20px;
            margin-right: 20px;
        }
    }
}
.el-table__footer-wrapper tbody td{
    background: oldlace !important;
}
</style>