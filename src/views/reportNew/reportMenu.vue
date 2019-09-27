<template>
    <div>
        <div class="round-btn-group">
            <el-radio-group v-model="activeName">
                <el-radio-button v-for="(item,index) in menuList" :label="item.key" :key="index">
                    {{ item.name }}
                </el-radio-button>
            </el-radio-group>
        </div>
        <iframe :src="iframeSrc" frameborder="0" width="100%" :height="`${height}px`"/>
    </div>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
    name: 'ReportMenu',
    props: {
        menuList: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            height: '',
            activeName: '',
            iframeSrc: ''
        }
    },
    watch: {
        activeName(newVal) {
            const baseURL = process.env.VUE_APP_API_ROOT
            const token = getToken()
            this.menuList.forEach(item => {
                if (item.key === newVal) {
                    this.iframeSrc = `${baseURL}/statement/index/${item.path}?access_token=${token}`
                }
            })
        }
    },
    created() {
        const offsetHeight = document.body.offsetHeight
        this.height = offsetHeight - 227
        if (this.menuList.length > 0) {
            this.activeName = this.menuList[0].key
        }
    }
}
</script>

<style lang="scss" scoped>
/deep/
.round-btn-group {
    border-bottom: 1px solid #e4e7ed;
    padding: 0 5px 10px;
    .el-radio-button{
        .el-radio-button__inner {
            border-radius: 20px !important;
            margin-right: 20px;
        }
    }
}
</style>
