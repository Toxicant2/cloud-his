<template>
    <el-card class="patient-list" :style="{height:`${height}px`}">
        <el-row v-if="$store.getters.clinic.level==2 || $store.getters.clinic.level==3">
               <el-col :xs="24" :sm="24" :md="24" :lg="8">
                <el-select v-model="form.type" placeholder="请选择" >
                    <el-option label="公告" :value="0">
                    </el-option>
                    <el-option label="系统更新" :value="1">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="16">
                <el-input placeholder="输入关键字搜索" v-model="form.title" @input="handleSearch">
                    <template slot="append">
                        <el-button icon="el-icon-search" @click="handleSearch"></el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row v-else>
            <el-col>
                <el-input placeholder="输入关键字搜索" v-model="form.title" @input="handleSearch">
                    <template slot="append">
                        <el-button icon="el-icon-search" @click="handleSearch"></el-button>
                    </template>
                </el-input>
             </el-col>
        </el-row>
        <el-scrollbar :style="{height:`${height - 100}px`}">
            <ul class="list">
                <li v-for="(item,index) in dataList" :key="index">
                    <a href="javascript:void(0);" :class="{'is-active':activeId === item.id}" @click="handleSwitchPt(item.id)">
                        <div>
                            <span class="name">{{item.title}}</span>
                        </div>
                        <div class="tip-content" >

                             <template v-if="$store.getters.clinic.level==2 && item.type == 0">
                                <span v-if="item.isSend == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/sended.png">
                                    </span>
                                    <span style="color:#6EC472">
                                        已发送
                                    </span>
                                </span>

                                <span v-else-if="item.isCancel == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/canceled.png">
                                    </span>
                                    <span style="color:#668FFE">
                                        已撤回
                                    </span>
                                </span>

                                <span v-else-if="item.isDraft == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/draft.png">
                                    </span>
                                    <span style="color:#FF6600">
                                        草稿
                                    </span>
                                </span>
                            </template>

                            <template v-if=" $store.getters.clinic.level== 1 && item.type == 1">

                                <span v-if="item.isSend == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/sended.png">
                                    </span>
                                    <span style="color:#6EC472">
                                        已发送
                                    </span>
                                </span>

                                <span v-else-if="item.isCancel == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/canceled.png">
                                    </span>
                                    <span style="color:#668FFE">
                                        已撤回
                                    </span>
                                </span>

                                <span v-else-if="item.isDraft == 1">
                                    <span style="line-height:15px;margin-right:0">
                                        <img src="@/assets/system_images/draft.png">
                                    </span>
                                    <span style="color:#FF6600">
                                        草稿
                                    </span>
                                </span>
                            </template>


                            <span class="circle-content">{{item.type == '1'?'系统更新':"公告"}}</span>
                            <span>{{item.name}}</span>
                            <span>{{item.updateTime }}</span>

                            <template v-if="$store.getters.clinic.level==2 && item.type == 0">
                                <span @click="deleteSys(item)" style="color:red;float:right;padding-left:5px;" v-if="item.isCancel == 1 || item.isDraft == 1">删除</span>
                                <span @click="editTip(item)" style="color:#3DAFFD;float:right;padding-left:5px;"  v-if="item.isDraft == 1 || item.isCancel == 1">编辑</span>
                                <span @click="cancleSysnotification(item.id)" style="color:#3465FD;float:right;padding-left:5px;" v-if="item.isSend == 1">撤回</span>
                            </template>

                             <template v-if=" $store.getters.clinic.level== 1 && item.type == 1">
                                <span @click="deleteSys(item)" style="color:red;float:right;padding-left:5px;" v-if="item.isCancel == 1 || item.isDraft == 1">删除</span>
                                <span @click="editTip(item)" style="color:#3DAFFD;float:right;padding-left:5px;"  v-if="item.isDraft == 1 || item.isCancel == 1">编辑</span>
                                <span @click="cancleSysnotification(item.id)" style="color:#3465FD;float:right;padding-left:5px;" v-if="item.isSend == 1">撤回</span>
                            </template>

                        </div>
                    </a>
                </li>
            </ul>
        </el-scrollbar>
    </el-card>
</template>

<script>
import { pickerOptions } from '@/utils'
import { getSysInfosList, cancleSysnotification, saveSysnotification } from '@/api/upms'
export default {
    data() {
        return {
            pickerOptions,
            id: 0,
            activeId: '',
            height: '',
            form: {
                title: '',
                type: null
            },
            dataList: []
        }
    },
    watch: {
        $route(to, from) {
            if (this.$route.params.id == ':id') {
                this.$router.push({
                    name: 'tipsManange',
                    params: {
                        id: 0,
                        type: ' '
                    }
                })
            } else if (this.id != this.$route.params.id) {
                this.id = this.$route.params.id
                this.handleSearch()
            } else {
                this.form.type = this.form.type ? parseInt(this.$route.params.type) : ' '
            }
        },
        activeId(val) {
            if (this.dataList.length > 0) {
                this.dataList.some(item => {
                    if (item.id == val) {
                        this.$emit('getObj', item)
                    }
                })
            }
        },
        'form.type'(val) {
            this.handleSearch()
        }
    },
    methods: {
        // 删除通知
        deleteSys(obj) {
            this.$confirm('是否确定删除?', '提示', {
                type: 'warning'
            }).then(() => {
                obj.isCancel = 0
                obj.isDraft = 0
                obj.isSend = 0
                obj.isDeleted = 1
                saveSysnotification(obj).then(res => {
                    if (res.STATUS && res.STATUS === '1') {
                        this.$message.success('删除成功')
                        this.handleSearch()
                    }
                })
            })
        },
        // 撤回通知
        cancleSysnotification(id) {
            this.$confirm('是否确定撤回?', '提示', {
                type: 'warning'
            }).then(() => {
                const data = { id: id }
                cancleSysnotification(data).then(res => {
                    if (res.STATUS == '1') {
                        this.$message.success(res.MESSAGE)
                        this.handleSearch()
                    }
                })
            })
        },
        // 编辑
        editTip(obj) {
            this.$emit('editTip', obj)
        },
        // 查询列表
        handleSearch() {
            let data = { 'versions': '11' }
            if (this.$route.params.type != 0) {
                this.form.type = this.form.type ? parseInt(this.$route.params.type) : ' '
            }
            if (window.isNaN(this.form.type)) {
                this.form.type = ''
            }
            data = Object.assign(data, this.form)

            getSysInfosList(data).then(res => {
                if (res.STATUS === '1') {
                    this.dataList = res.ITEMS
                    if (this.dataList.length > 0) {
                        if (this.$route.params.id > 0) {
                            this.activeId = this.$route.params.id
                        } else {
                            this.activeId = this.dataList[0].id
                        }
                    }
                }
            })
        },
        // 切换
        handleSwitchPt(id) {
            this.activeId = id
        },
        // 初始化列表
        init() {
            this.id = this.$route.params.id
            this.handleSearch()
        }
    },
    created() {
        if (this.$route.params.id == ':id') {
            this.$router.push({
                name: 'tipsManange',
                params: {
                    id: 0,
                    type: ' '
                }
            })
        }
        this.id = this.$route.params.id
        this.handleSearch()
        const offsetHeight = document.body.offsetHeight
        this.height = offsetHeight - 180
    }
}
</script>

<style lang="scss" scoped>
    $height: 15px;
    .patient-list{
        width: 100%;
        font-size: 14px;
        /deep/
        .el-card__body{
            padding: $height;
        }
        .line{
            height: $height;
        }
        .list{
            overflow-y: hidden;
            li{
                a{
                    color:black;
                    display: block;
                    margin-top: $height;
                    width: 100%;
                    border:1px solid #c6c6c6;
                    padding: 5px 10px;
                    border-radius: 4px;
                    background-color: #f7f5f5;
                    &:hover{
                        border: 1px solid #409EFF;
                    }
                    .patient-type{
                        display: inline-block;
                        border: 1px solid #333;
                        padding: 0 2px;
                        border-radius: 3px;
                        line-height: 18px;
                    }
                    &.is-active{
                        border: 1px solid #E2F2FF;
                        background-color: #E2F2FF;
                        .patient-type{
                            border: 1px solid #FFF;
                        }
                    }
                    div{
                        line-height: 28px;
                        .name{
                            display: inline-block;
                            font-size:18px;
                            font-weight: bold;
                            margin-right: 5px;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        span{
                            display: inline-block;
                            vertical-align: middle;
                            &:not(:last-child){
                                margin-right: 5px;
                            }
                        }
                    }
                    .tip-content{
                        font-size:13px;
                    }
                }
            }
        }
    }
</style>

<style>
.el-scrollbar__bar.is-vertical>div {
    width: 100%;
    display: none !important;
}
</style>


