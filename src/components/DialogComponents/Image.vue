<template>
    <el-dialog center :visible.sync="visible" :title="title" class="dialog-image" :width="width">
        <img :src="imgUrl" alt="">
    </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            visible: false
        }
    },
    props: {
        title: {
            type: String,
            default: '系统提示'
        },
        imgUrl: {
            type: String,
            required: true
        },
        width: {
            type: String
        }
    },
    methods: {
        open() {
            this.visible = true
        },

        close() {
            this.visible = false
        }
    }
}
</script>

<style style lang="scss">
    .dialog-image{
        img{
            max-width: 680px;
        }
    }
</style>
