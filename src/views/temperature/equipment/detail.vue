<template>
    <el-row class="page-main">
        <el-row class="page-content">
            <el-row>
                <span class="title">
                    设备详情
                    <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="back">返回</el-button>
                </span>
            </el-row>
            <el-row class="item" v-for="(item,index) in objList" :key="index">
                <el-row>
                    <el-col class="itemTitle">{{item.name}}</el-col>
                    <el-col class="itemContent">
                        <el-col v-for="(itemObj,indexObj) in item.list" :key="indexObj">
                            {{itemObj.name}}：
                            <template v-if="index==0">
                                {{obj['tool'][itemObj.value]}}
                            </template>
                            <template v-else>
                                {{obj['toolInfo'][itemObj.value]}}
                            </template>
                        </el-col>
                    </el-col>
                </el-row>
            </el-row>
        </el-row>
    </el-row>
</template>

<script>
    import { getTemptoolmanageDetail } from '@/api/arclinic'
    export default {
        props: ['id'],
        data() {
            return {
                objList: [
                    {
                        name: '设备信息',
                        list: [
                            {
                                name: '设备编号',
                                value: 'code'
                            },
                            {
                                name: '设备名称',
                                value: 'name'
                            },
                            {
                                name: '体温贴类型',
                                value: 'pasteType'
                            },
                            {
                                name: '体温贴版本',
                                value: 'pasteVersion'
                            },
                            {
                                name: '底座类型',
                                value: 'baseType'
                            },
                            {
                                name: '底座版本',
                                value: 'baseVersion'
                            },
                            {
                                name: '体温mac地址',
                                value: 'pasteMac'
                            }
                        ]
                    },
                    {
                        name: '设备去向',
                        list: [
                            {
                                name: '宝宝姓名',
                                value: 'patientName'
                            },
                            {
                                name: '套餐名称',
                                value: 'packType'
                            },
                            {
                                name: '联系人',
                                value: 'contactsName'
                            },
                            {
                                name: '联系电话',
                                value: 'contactsPhone'
                            }
                        ]
                    }
                ],
                obj: {}
            }
        },
        methods: {
            back() {
                this.$emit('back', true)
            },
            getDetail() {
                const data = { id: this.id }
                getTemptoolmanageDetail(data).then(res => {
                    if (res.STATUS == '1') {
                        this.obj = res.ITEMS
                    }
                })
            }
        },
        mounted() {
            this.getDetail()
        }
    }
</script>

<style lang="scss" scoped>
.title{
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  padding-left: 16px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  line-height: 50px;
}
.item{
    font-size: 16px;
    margin-left: 16px;
    .itemTitle{
        font-weight: normal;
        border:none;
        margin: 15px 0 10px 0;
    }
    .itemContent{
         font-size: 14px;
         border-bottom: 1px solid #e1e1e1;
         padding-bottom: 20px;
         .el-col{
             width:33.33%;
             margin:8px 0;
         }
    }
}
</style>
