<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane  :lazy="true"  v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="tab.key === 'month'">
                        <month-page ref="month"></month-page>
                    </template>
                     <template v-if="tab.key === 'type'">
                        <type-page ref="type"></type-page>
                    </template>
                     <template v-if="tab.key === 'tool'">
                        <tool-page ref="tool"></tool-page>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-row>
</template>
<script>
import monthPage from './components/month'
import typePage from './components/type'
import toolPage from './components/tool'
export default {
    components: {
        monthPage,
        typePage,
        toolPage
    },
    data() {
        return {
            activeName: 'month',
            tabMapOpts: [
                {
                    label: '监测月报',
                    key: 'month'
                },
                {
                    label: '患儿类别',
                    key: 'type'
                },
                {
                    label: '设备统计',
                    key: 'tool'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
</style>