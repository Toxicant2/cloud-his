<template>
    <el-row class="switch-wrap">
        <div v-for="(item,index) in switchData"
            :span="12"
            :key="index"
            @click="handleSwitch(item.id)">
            <div class="top">
                <img :src="item.imgURL" alt="">
                <span>{{item.name}}</span>
            </div>
            <p style="color:red;">（{{item.id}}）</p>
        </div>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            active: 0
        }
    },
    props: {
        switchData: { type: Array, required: true }
    },
    methods: {
        handleSwitch(id) {
            this.$emit('handleSwitch', id)
        }
    }
}
</script>

<style lang="scss" scoped>
    .switch-wrap{
        width:100%;
        cursor: pointer;
        text-align: center;
        margin-top: 20px;
        >div{
            display: inline-block;
            width: 300px;
            border:1px solid #CCC;
            background-color: #FFF;
            margin: 0 20px;
            padding:20px;
            &.active{
                border:1px solid #409EFF;
                background-color: rgb(245, 251, 255);
            }
            .top{
                line-height: 50px;
                margin-bottom: 20px;
                img{
                    vertical-align: middle;
                    margin-right: 10px;
                }
            }
            p{
                text-align: left;
            }
        }

    }
</style>

