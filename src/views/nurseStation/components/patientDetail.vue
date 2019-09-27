<template>
    <el-row class="nur-patient-detail">
        <el-row v-if="title">
           <span class="right-line">{{title}}</span>
        </el-row>
        <el-col class="content">
            <el-col v-for="(item,index) in describeList" :key="index" :span="item.span?item.span:8" class="item-content">
                <template v-if="item.type==='tabline'">
                    <span style="float:left"> {{item.label}}：</span>
                    <span v-for="(tabitem,tabindex) in describeData[item.value]" :key="tabindex+'tabline'" style="float:left">
                        <span v-if="tabindex === 0">
                            {{tabindex+1}}、{{tabitem|isEmpty}}
                        </span>
                        <span v-else style="padding-left:42px;">
                            {{tabindex+1}}、{{tabitem|isEmpty}}
                        </span>
                    </span>
                </template>
                <template v-else>
                  <span style="max-width:item.width">
                      {{item.label}}：{{describeData[item.value]|isEmpty}}{{item.unit}}
                  </span>
                </template>
            </el-col>
        </el-col>
    </el-row>
</template>

<script>
export default {
    components: {
    },
    data() {
        return {
        }
    },
    props: {
        title: {
            type: String
        },
        describeData: {
            type: Object
        },
        describeList: {
            type: Array
        }
    },
    computed: {
    },
    filters: {
        isEmpty(val) {
            return val || '-'
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>
<style>
.nur-patient-detail{
    font-size: 14px;
}
.nur-patient-detail .right-line{
    padding-left:5px;
    border-left:2px solid #008DFE;
}
.content{
    padding-top: 10px;
    padding-left:40px;
}
.item-content{
    line-height: 30px;
}
</style>
