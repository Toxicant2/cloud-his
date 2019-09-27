<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <audit-recipe :ref="tab.key"/>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-row>
</template>
<script>
import auditRecipe from './components/index'
export default {
    components: {
        auditRecipe
    },
    data() {
        return {
            tabMapOpts: [
                {
                    label: '待审方',
                    key: 'tab1'
                }, {
                    label: '已审方',
                    key: 'tab2'
                }
            ],
            activeName: 'tab1'
        }
    },
    watch: {
        activeName(newVal) {
            this.$refs[newVal][0].initCp(newVal)
        },
        $route() {
            this.routerChange()
        }
    },
    mounted() {
        this.routerChange()
    },
    methods: {
        // 路由变化
        routerChange() {
            this.activeName = 'tab1'
            this.$refs['tab1'][0].initCp('tab1')
        }
    },
}
</script>
