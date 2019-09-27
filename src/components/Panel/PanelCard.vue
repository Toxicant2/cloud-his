<template>
    <div>
        <el-row v-if="panelList.length > 0" :gutter="25" >
            <el-col :sm="rowShowNumber === 4?12:8" :md="rowShowNumber === 4?8:6" :xl="rowShowNumber === 4?6:4" v-for="(item,index) in panelList" :key="index">
                <div class="panel">
                    <div class="p-relative" v-if="item.isVip">
                        <span class="icon-vip"></span>
                    </div>
                    <div class="p-relative" style="position:absolute;right:0;top:10px;">
                        <span class="refundComplete" v-if="item.isRefund">已退费</span>
                        <span class="refundComplete" v-if="item.onAccountOrg > 0">记账</span>
                    </div>
                    <div class="panel-heading">
                        <div v-if="rowShowType==='topBottom'">
                            <el-row :gutter="20">
                                <!-- <span class="status" v-if="item.status && panelEllist.statusFormatter">
                                    {{panelEllist.statusFormatter(item.status)}}
                                </span>-->
                                <!-- 状态 -->
                                <span class="status" v-if="span.formatter(item[span.value])" v-for="(span,spanIndex) in panelEllist.statusList" :key="spanIndex" :style="span.formatterStyle && span.formatterStyle(span.value)">{{span.formatter(item[span.value])}}</span>
                                <!-- 头像 -->
                                <el-col :span="12" style="text-align:center;height:84px;">
                                    <a href="javascript:;" v-if="panelEllist.header.link" @click="panelEllist.header.func(item)">
                                        <img :src="item.avatar" class="img-avatar">
                                    </a>
                                    <a href="javascript:;" v-else>
                                        <img :src="item.avatar" class="img-avatar">
                                    </a>
                                </el-col>
                                <!-- 主要内容 -->
                                <el-col :span="12" style="text-align:left;vertical-align:middle;display:table;height:84px;">
                                    <div style="display: table-cell;vertical-align: middle;">
                                        <h3 v-if="panelEllist.header">
                                            <a href="javascript:;" v-if="panelEllist.header.link" @click="panelEllist.header.func(item)">{{item[panelEllist.header.nameValue]}}</a>
                                            <div href="javascript:;" v-else class="name-class">{{item[panelEllist.header.nameValue]}}</div>
                                            <div style="margin-top:10px" class="name-class">
                                                <small>({{item[panelEllist.header.sexValue]}} {{item[panelEllist.header.ageValue]}})</small>
                                            </div>
                                        </h3>
                                    </div>
                                </el-col>
                            </el-row>

                            <!-- for循环，设置number参数控制每行显示几个 -->
                            <!-- 样例在分诊页面 views/diagnosis/index-->
                            <el-row class="line">
                                <el-col v-for="(span,spanIndex) in panelEllist.list" :span="span.number?span.number:24 " :key="spanIndex" style="margin:2px 0;">
                                    <span>{{span.name?span.name+'：':''}}{{span.formatter?span.formatter(item):item[span.value]==='null'||!item[span.value]?'':item[span.value]}}</span>
                                </el-col>
                            </el-row>
                        </div>
                        <div v-else>
                            <el-row :gutter="20">
                                <!-- 状态 -->
                                <span class="status" v-if="span.formatter(item[span.value])" v-for="(span,spanIndex) in panelEllist.statusList" :key="spanIndex" :style="span.formatterStyle && span.formatterStyle(span.value)">{{span.formatter(item[span.value])}}</span>
                                <!-- 头像 -->
                                <el-col :span="8" style="text-align:center">
                                    <a href="javascript:;" v-if="panelEllist.header.func" @click="panelEllist.header.func(item)">
                                        <img :src="item.avatar" class="img-avatar">
                                    </a>
                                    <a href="javascript:;" v-else>
                                        <img :src="item.avatar" class="img-avatar">
                                    </a>
                                </el-col>
                                <!-- 主要内容 -->
                                <el-col :span="16">
                                    <div class="header" v-if="panelEllist.header">
                                        <a href="javascript:;" v-if="panelEllist.header.func" @click="panelEllist.header.func(item)">{{item[panelEllist.header.nameValue]?item[panelEllist.header.nameValue]:(item.chargeSourceCode===1||item.deliverSourceCode === 1?'快速收费':'-')}}</a>
                                        <a href="javascript:;" v-else>{{item[panelEllist.header.nameValue]?item[panelEllist.header.nameValue]:(item.chargeSourceCode===1||item.deliverSourceCode === 1?'快速收费':'-')}}</a>
                                        <span>{{item[panelEllist.header.sexValue]||item[panelEllist.header.ageValue]?`(${item[panelEllist.header.sexValue]}${item[panelEllist.header.ageValue]})`:''}}</span>
                                    </div>
                                    <el-row class="line">
                                        <span v-for="(span,spanIndex) in panelEllist.list" :key="spanIndex" v-if="!span.hidden">{{span.formatterName?span.formatterName(item)+'：':span.name?span.name+'：':''}}{{span.formatter?span.formatter(item):item[span.value]==='null'||!item[span.value]?'':item[span.value]}}</span>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </div>
                    </div>
                    <div class="panel-body text-center">
                        <ul class="photo-meta">
                            <li v-for="li in panelEllist.btnlist" :key="li.name" v-if="!li.isHidden || li.isHidden && !li.isHidden(item)">
                                <template v-if="li.func">
                                    <a href="javascript:;" :style="li.style" @click="li.func(item)">{{li.name}}{{li.formatter?li.formatter(item):''}}</a>
                                </template>
                                <template v-else>
                                    <router-link v-if="li.link" :to="{name:li.link.name,params:{id:item.id}}" append>{{li.name}}{{li.formatter?li.formatter(item):''}}</router-link>
                                    <a v-else href="javascript:;" :style="li.style">{{li.name}}{{li.formatter?li.formatter(item):''}}</a>
                                </template>
                            </li>
                        </ul>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row v-else class="empty-text">暂无数据</el-row>
        <div class="pagination-footer" v-if="pageSize">
            <span class="description">{{description}}</span>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount"></el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        rowShowNumber: {
            type: Number,
            default: 4
        },
        rowShowType: {
            type: String
        },
        panelList: {
            type: Array,
            required: true
        },
        panelEllist: {
            type: Object,
            required: true
        },
        description: String, // 分页脚底左侧的数据说明
        totalCount: Number, // 表格数据总数
        pageSizes: { type: Array }, // 决定每页显示的条数[10,15,20,25]
        pageSize: { type: Number, default: 10 },
        currentPage: { type: Number, default: 1 }
    },
    methods: {
        // 切换页面显示条数
        handleSizeChange(val) {
            this.$emit('pageSizeChange', val)
        },

        // 跳转页码
        handleCurrentChange(val) {
            this.$emit('currentPageChange', val)
        }
    }
}
</script>

<style lang="scss" scoped>
.empty-text {
    text-align: center;
    font-size: 14px;
    color: #909399;
    line-height: 36px;
}
.panel {
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: relative;

    .panel-heading {
        padding: 10px 15px;
        border-bottom: 1px solid transparent;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        background-color: #fefefe !important;
        border: 1px solid #e3e3e3;
        border-bottom: none;
        color: #888 !important;
        .header {
            width: 100%;
            margin: 5px 0;
            color: #409eff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            a {
                display: inline-block;
                font-size: 18px;
                font-weight: 700;
            }
            span {
                font-size: 14px;
                font-weight: 400;
                color: #888;
            }
        }
        .line {
            span {
                display: block;
                font-size: 14px;
                opacity: 0.8;
                padding: 3px 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        h3 {
            margin: 5px 0;
            font-size: 18px;
            font-weight: 700;
            color: #409eff;
            small {
                font-size: 14px;
                font-weight: 400;
                color: #888;
            }
        }
        .status {
            display: inline-block;
            min-width: 10px;
            font-size: 12px;
            font-weight: 400;
            line-height: 1;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            background-color: #777;
            border-radius: 10px;
            padding: 4px 6px;
            position: absolute;
            right: 5px;
            &:first-child {
                top: 0px;
            }
            &:nth-child(2) {
                top: 25px;
            }
            &:nth-child(3) {
                top: 50px;
            }
            &:nth-child(4) {
                top: 75px;
            }
        }

        .img-avatar {
            width: 80px;
            height: 80px;
            // border: 2px solid #fff;
            border-radius: 50%;
        }
    }
    .name-class {
        float: left;
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 10px;
    }
    .panel-body {
        border: 1px solid #e7eaec;
        border-top: 0;
        .photo-meta {
            border-top: 0;
            border-top: 1px solid #e3e3e3;
            background-color: #f7f7f7;
            li {
                &:first-child {
                    border-left: 0;
                }
                display: table-cell;
                width: 1%;
                text-align: center;
                border-left: 1px solid #e7eaec;
                .btn,
                a {
                    display: block;
                    padding: 15px 5px;
                    max-height: 51px;
                    overflow: hidden;
                    font-size: 14px;
                    color: #888;
                    cursor: pointer;
                    &:hover {
                        color: #333;
                    }
                }
            }
        }
    }
    .refundComplete {
        display: block;
        width: 54px;
        height: 22px;
        background: #ea5514;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        font-size: 12px;
        text-align: center;
        line-height: 22px;
        color: #fff;
        margin-bottom: 10px;
    }
    // .panel-footer {
    //     padding: 10px 15px;
    //     background-color: #f5f5f5;
    //     border-top: 1px solid #ddd;
    //     border-bottom-right-radius: 3px;
    //     border-bottom-left-radius: 3px
    // }

    // .panel-default {
    //     border-color: #ddd;
    //     >.panel-heading {
    //         color: #333;
    //         background-color: #f5f5f5;
    //         border-color: #ddd;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #ddd
    //         }
    //         .badge {
    //             color: #f5f5f5;
    //             background-color: #333
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #ddd
    //     }
    // }

    // .panel-primary {
    //     border-color: #428bca;
    //     >.panel-heading {
    //         color: #fff;
    //         background-color: #428bca;
    //         border-color: #428bca;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #428bca
    //         }
    //         .badge {
    //             color: #428bca;
    //             background-color: #fff
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #428bca
    //     }
    // }

    // .panel-success {
    //     border-color: #d6e9c6;
    //     >.panel-heading {
    //         color: #3c763d;
    //         background-color: #dff0d8;
    //         border-color: #d6e9c6;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #d6e9c6
    //         }
    //         .badge {
    //             color: #dff0d8;
    //             background-color: #3c763d
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #d6e9c6
    //     }
    // }

    // .panel-info {
    //     border-color: #bce8f1;
    //     >.panel-heading {
    //         color: #31708f;
    //         background-color: #d9edf7;
    //         border-color: #bce8f1;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #bce8f1;
    //         }
    //         .badge {
    //             color: #d9edf7;
    //             background-color: #31708f
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #bce8f1
    //     }
    // }

    // .panel-warning {
    //     border-color: #faebcc;
    //     >.panel-heading {
    //         color: #8a6d3b;
    //         background-color: #fcf8e3;
    //         border-color: #faebcc;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #faebcc;
    //         }
    //         .badge {
    //             color: #fcf8e3;
    //             background-color: #8a6d3b
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #faebcc
    //     }
    // }

    // .panel-danger {
    //     border-color: #ebccd1;
    //     >.panel-heading {
    //         color: #a94442;
    //         background-color: #f2dede;
    //         border-color: #ebccd1;
    //         +.panel-collapse>.panel-body {
    //             border-top-color: #ebccd1
    //         }
    //         .badge {
    //             color: #f2dede;
    //             background-color: #a94442
    //         }
    //     }
    //     >.panel-footer+.panel-collapse>.panel-body {
    //         border-bottom-color: #ebccd1
    //     }
    // }
}
.pagination-footer {
    .description {
        float: left;
        margin-left: 20px;
        margin-top: 12px;
        font-size: 14px;
    }
    .el-pagination {
        float: right;
        margin-top: 8px;
        margin-bottom: 8px;
    }
}
</style>
