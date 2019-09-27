<template>
    <el-menu class="navbar" mode="horizontal">
        <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container"/>

        <breadcrumb class="breadcrumb-container"/>

        <div class="right-menu">
            <el-tooltip :content="'全屏'" :open-delay="500" effect="dark" placement="bottom">
                <screenfull class="screenfull right-menu-item"/>
            </el-tooltip>

            <div class="right-menu-item">
                <el-dropdown ref="messageDrop" trigger="click" @visible-change="test">
                    <span class="el-dropdown-link">
                        <div class="tips-img">
                            <img src="@/assets/system_images/notify.png" width="26px" height="26px" class="screenfull">
                            <span v-if="number>0" class="circular-tips">
                                <span class="circular-tips-item"/>
                            </span>
                        </div>
                    </span>
                    <el-dropdown-menu slot="dropdown" class="tips">
                        <div class="tips-content">
                            <div class="tips-item">
                                <span>
                                    您有{{ number }}条信息尚未处理
                                </span>
                            </div>
                            <div class="tips-list">
                                <div class="list-item-title">
                                    <span>更新发布</span>
                                    <span class="item-more" @click="viewMoreTips(true)">更多</span>
                                </div>
                                <template v-for="(item,index) in updateList">
                                    <div :key="index+'更新发布'" class="list-item-content" @click="viewTips(item)">
                                        <span class="content-detail">{{ item.title }}</span>
                                        <span v-if="item.state == 1" class="tips-tag"> * </span>
                                        <span>{{ item.updateTime }}</span>
                                    </div>
                                </template>
                                <div class="list-item-title">
                                    <span class="content-detail">公告</span>
                                    <span class="item-more" @click="viewMoreTips(false)">更多</span>
                                </div>
                                <template v-for="(item,index) in noticeList">
                                    <div :key="index+'公告'" class="list-item-content" @click="viewTips(item)">
                                        <span class="content-detail">{{ item.title }}</span>
                                        <span v-if="item.state == 1" class="tips-tag"> * </span>
                                        <span>{{ item.updateTime }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>

            <!-- 帮助中心   -->
            <div class="right-menu-item">
                <span class="el-dropdown-link">
                    <div class="tips-img">
                        <img src="@/assets/system_images/help.png" class="screenfull" style="cursor:pointer;margin-top:3px" title="帮助中心" width="20px" height="20px" @click="handleTransition">
                    </div>
                </span>
            </div>

            <!-- <lang-select class="international right-menu-item"></lang-select> -->

            <el-dropdown class="avatar-container right-menu-item" trigger="click" size="-">
                <div class="avatar-wrapper">
                    <span class="user-name">{{ clinic.orgName }}-{{ user.realName }}</span>
                    <img :src="avatar" class="user-avatar">
                    <i class="el-icon-caret-bottom"/>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <a target="_blank" @click="backtoFront">
                        <el-dropdown-item>首页
                            <!-- {{$t('navbar.workbench')}} -->
                        </el-dropdown-item>
                    </a>
                    <a target="_blank" @click="handleModifyInfo">
                        <el-dropdown-item>个人中心
                            <!-- {{$t('navbar.modifyInfo')}} -->
                        </el-dropdown-item>
                    </a>
                    <a target="_blank" @click="switchClinic">
                        <el-dropdown-item>切换诊所
                            <!-- {{$t('navbar.switchClinic')}} -->
                        </el-dropdown-item>
                    </a>
                    <el-dropdown-item divided>
                        <span style="display:block;" @click="logout">退出登录
                            <!-- {{$t('navbar.logOut')}} -->
                        </span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSysInfosList, clickSysnotification } from '@/api/upms'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
// import LangSelect from '@/components/LangSelect'

export default {
    components: {
        Breadcrumb,
        Hamburger,
        Screenfull
        // LangSelect
    },
    data() {
        return {
            // 未读消息数量
            number: 0,
            // 更新列表
            updateList: [],
            // 通知列表
            noticeList: []
        }
    },
    computed: {
        ...mapGetters(['basic', 'sidebar', 'user', 'clinic', 'addRouters']),
        avatar() {
            const list = this.user.attachments
            if (list && list.length > 0) {
                return this.basic.filePrifix + list[0].filePath
            }
            return ''
        }
    },
    mounted() {
        this.getSysInfosList()
    },

    methods: {
        test(val) {
            if (val) {
                this.getSysInfosList()
            }
        },
        // 查看更多公告
        viewMoreTips(flag) {
            this.$refs.messageDrop.hide()
            if (flag) {
                this.$router.push({
                    name: 'tipsManange',
                    params: {
                        id: 0,
                        type: 1
                    }
                })
            } else {
                this.$router.push({
                    name: 'tipsManange',
                    params: {
                        id: 0,
                        type: 0
                    }
                })
            }
        },

        // 查看具体某一个公告
        viewTips(item) {
            this.$refs.messageDrop.hide()
            const data = { id: item.id }
            clickSysnotification(data).then(res => {
                if (res.STATUS == 1) {
                    this.getSysInfosList()
                    this.$router.push({
                        name: 'tipsManange',
                        params: {
                            id: item.id,
                            type: item.type
                        }
                    })
                }
            })
        },

        // 切换展开项
        handleChange(val) {
            console.log(val)
        },

        // 切换navbar
        toggleSideBar() {
            this.$store.dispatch('toggleSideBar')
        },

        // 前端 登出
        logout() {
            this.$store.dispatch('LogOut').then(() => {
                location.reload() // In order to re-instantiate the vue-router object to avoid bugs
            })
        },

        // 切换诊所
        switchClinic() {
            this.$router.push({ path: '/clinic' })
        },

        // 首页
        backtoFront() {
            const routers = this.addRouters
            this.$router.push({
                path: routers[0].path ? routers[0].path : routers[0].redirect
            })
        },

        // 修改个人信息
        handleModifyInfo() {
            this.$router.push({
                name: 'modifyInfo'
            })
        },

        // 获取系统通知列表
        getSysInfosList() {
            const data = { versions: null }
            getSysInfosList(data).then(res => {
                if (res.STATUS === '1') {
                    this.number = 0
                    this.updateList = res.ITEMS.update || []
                    this.computeNumber(this.updateList)
                    this.noticeList = res.ITEMS.notice || []
                    this.computeNumber(this.noticeList)
                }
            })
        },

        // 计算未读消息个数
        computeNumber(arr) {
            if (arr.length > 0) {
                arr.forEach(item => {
                    if (item.state === 1) {
                        this.number++
                    }
                })
            }
        },
        // 帮助中心
        handleTransition() {
            this.$router.push({ name: 'helpCenter' })
        }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
    height: 50px;
    line-height: 50px;
    border-radius: 0px !important;

    .hamburger-container {
        line-height: 58px;
        height: 50px;
        float: left;
        padding: 0 10px;
    }
    .breadcrumb-container {
        float: left;
    }

    .right-menu {
        float: right;
        height: 100%;
        &:focus {
            outline: none;
        }
        .right-menu-item {
            display: inline-block;
            margin: 0 8px;
            .tips-img {
                position: relative;
                line-height: 55px;
                pointer-events: cursor !important;
                .circular-tips {
                    position: absolute;
                    border-radius: 50%;
                    height: 10px;
                    top: -1px;
                    left: 18px;
                    width: 10px;
                    display: inline-block;
                    background: #ff002c;
                    vertical-align: top;
                }
                .circular-tips-item {
                    font-size: 13px;
                    display: block;
                    color: #ffffff;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                }
            }
        }
        .screenfull,
        .international {
            vertical-align: top;
        }

        .avatar-container {
            height: 50px;
            margin-right: 30px;
            .avatar-wrapper {
                cursor: pointer;
                margin-top: 5px;
                position: relative;
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                }
                .user-name {
                    display: inline-block;
                    vertical-align: top;
                    margin-top: -5px;
                    margin-right: 5px;
                }
                img{
                    object-fit:cover;
                }
                .el-icon-caret-bottom {
                    position: absolute;
                    right: -20px;
                    top: 25px;
                    font-size: 12px;
                }
            }
        }
    }
}
.tips-content {
    font-size: 14px;
    min-width: 270px;
    .tips-item {
        padding: 0 10px;
        height: 25px;
        color: white;
        width: 100%;
        span {
            float: left;
            padding: 1px 0;
            line-height: 25px;
        }
        .el-button--small,
        .el-button--small.is-round {
            padding: 2px 15px !important;
        }
        .all-ignore {
            height: 25px;
            width: 80px;
            float: right;
            border: #b3dfff;
            background-color: #b3dfff;
            color: black;
            text-align: right;
        }
    }
    .tips-list {
        background-color: white;
        margin-top: 8px;
        padding-bottom: 15px;
        .list-item-title {
            height: 30px;
            border-bottom: 1px solid #ebeef5;
            span:first-child {
                margin: 5px 0;
                font-weight: 800;
                padding-left: 5px;
                line-height: 20px;
                float: left;
                border-left: 2px solid #008aff;
            }
            span:last-child {
                cursor: pointer;
                margin: 5px 0;
                font-size: 12px;
                line-height: 20px;
                float: right;
                color: #999;
                margin-right: 5px;
            }
        }
        .item-more:hover {
            color: rgb(22, 22, 211) !important;
        }
    }
}
.el-dropdown-menu {
    padding-bottom: 0;
}
.tips .el-popper,
.el-dropdown-menu--small {
    background-color: #0097ff;
    top: 34px !important;
}

.list-item-content {
    cursor: pointer;
    height: 35px;
    margin-left: 7px;
    margin-right: 5px;
    border-bottom: 1px solid #ebeef5;
    .content-detail {
        float: left;
        line-height: 35px;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    span {
        vertical-align: middle;
        line-height: 35px;
        &:not(:first-child) {
            color: #999;
            float: right;
            font-size: 12px;
        }
    }
    .tips-tag {
        padding-left: 5px;
        color: red !important;
        font-size: 25px !important;
        line-height: 35px !important;
    }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.tips {
    .popper__arrow::after {
        border-bottom-color: #0097ff !important;
    }
    // .el-collapse-item__header{
    //     font-size:14px;
    //     border-left: 1px solid red;
    //     font-weight: 800;
    //     color:#000000;
    // }
    // .el-collapse-item__arrow{
    //     display: none;
    // }
}
</style>

