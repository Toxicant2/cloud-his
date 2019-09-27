<template>
    <div class="page-container">
        <div class="page-main">
            <template v-if="tabMapOpts.length > 0">
                <el-tabs v-model="activeName" type='card'>
                    <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                        <report-menu :menu-list="tab.list"></report-menu>
                    </el-tab-pane>
                </el-tabs>
            </template>
            <div v-else>
                暂无可用统计报表
            </div>
        </div>
    </div>
</template>

<script>
    import { Session } from '@/utils/storage'
    import reportMenu from './reportMenu'
    export default {
        components: {
            reportMenu
        },
        data() {
            return {
                activeName: '',
                tabMapOpts: []
            }
        },
        methods: {
            getTabMaps() {
                const reportMaps = Session.get('reportMaps')
                const result = []
                if (reportMaps.length > 0) {
                    reportMaps.forEach(item => {
                        if (item.children && item.children.length > 0) {
                            result.push({
                                label: item.name,
                                key: item.name,
                                list: item.children
                            })
                        }
                    })
                }
                this.tabMapOpts = result
                if (result.length > 0) {
                    this.activeName = result[0].key
                }
            }
        },
        mounted() {
            this.getTabMaps()
        }
    }
</script>