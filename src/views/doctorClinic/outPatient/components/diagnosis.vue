<template>
    <div class="diagnosis">
        <el-tabs v-model="activeName">
            <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                <template v-if="tab.key === 'tab1'">
                    <!-- <el-input v-model="inputValue">
                        <i slot="append" class="el-icon-search"></i>
                    </el-input> -->
                    <h3 class="tab-title">常见诊断</h3>
                    <el-scrollbar style="height:500px;">
                        <ul class="list">
                            <li v-for="(item,itemIndex) in diseaseList" v-if="diseaseList.length>0" :key="itemIndex">
                                <div class="card">
                                    <h2 @click="handleClick(item.id)">{{item.name}}<span>{{item.diseaseAlias?`（别名：${item.diseaseAlias}）`:''}}</span>
                                    </h2>
                                    <ul class="btn-groups clearfix">
                                        <li v-for="(a,aIndex) in btnGroups" :key="aIndex">
                                            <el-button type="text" @click="openDiseaseDetail(item.id, aIndex)">{{a.name}}</el-button>
                                        </li>
                                    </ul>
                                    <div class="line clearfix">
                                        <div class="name">症状：</div>
                                        <div class="list">
                                            <span v-for="(span,spanIndex) in item.symptomList" :key="spanIndex"
                                                  v-bind:style="content.indexOf(span)>-1?'color:red':''">
                                                {{span}}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="line clearfix">
                                        <div class="name">体征：</div>
                                        <div class="list">
                                            <span v-for="(span,spanIndex) in item.signList" :key="spanIndex">
                                                {{span}}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </el-scrollbar>
                </template>
                <template v-else-if="tab.key === 'tab2'">
                    <op-tpl></op-tpl>
                </template>
            </el-tab-pane>
        </el-tabs>
        <disease-detail ref="diseaseDetail"></disease-detail>
    </div>
</template>

<script>
    import { getSysDiseaseFromES } from '@/api/catalog'
    import diseaseDetail from './diseaseDetail'
    import opTpl from './opTpl'

    export default {
        components: {
            opTpl,
            diseaseDetail
        },
        data() {
            return {
                inputValue: '',
                tabMapOpts: [
                    {
                        label: '智能诊断',
                        key: 'tab1'
                    }, {
                        label: '病历模板',
                        key: 'tab2'
                    }
                    // {
                    //     label: '历史病历',
                    //     key: 'tab3'
                    // }
                ],
                activeName: 'tab1',
                dataList: [],
                btnGroups: [
                    {
                        name: '概述'
                    }, {
                        name: '诊断依据'
                    }, {
                        name: '鉴别诊断'
                    }, {
                        name: '相关检查'
                    }, {
                        name: '处置意见'
                    }, {
                        name: '转诊标准'
                    }
                ],
                diseaseList: [],
                content: ''
            }
        },
        props: {
            disabled: {
                type: Boolean
            }
        },
        methods: {
            // 根据主诉症状获取诊断列表
            getADDiseaseList(content) {
                this.content = content
                const params = {
                    'pageNo': 1,
                    'pageSize': 3,
                    'symptom': content
                }
                getSysDiseaseFromES(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        let result = []
                        if (d.list && d.list.length > 0) {
                            result = d.list
                        }
                        this.diseaseList = result
                    }
                })
            },

            // 弹窗诊断详情
            openDiseaseDetail(diseaseId, index) {
                this.$refs.diseaseDetail.open(diseaseId, index)
            },

            // 点击诊断名称
            handleClick(id) {
                if (this.disabled) return
                this.$emit('handleDiagnosisClick', id)
            }
        }
    }
</script>

<style lang="scss">
    .diagnosis {
        .el-tabs__header {
            margin-bottom: 10px;
        }
    }
</style>


<style lang="scss" scoped>
    .diagnosis {
        width: 100%;
        height: 630px;
        background-color: #FFF;
        border: 1px solid #ebeef5;
        border-radius: 5px;
        font-size: 14px;
        padding: 10px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        .tab-title {
            font-size: 14px;
            font-weight: normal;
            line-height: 28px;
        }
        .list {
            .card {
                background-color: #F5FAFF;
                margin-bottom: 10px;
                border-radius: 5px;
                padding: 5px;
                h2 {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 16px;
                    line-height: 28px;
                    border-bottom: 1px dashed #CCC;
                    cursor: pointer;
                    span {
                        font-size: 14px;
                        font-weight: normal;
                    }
                }
                .btn-groups {
                    li {
                        display: inline-block;
                        .el-button--text {
                            padding-top: 5px;
                            padding-bottom: 5px;
                            padding-right: 2px;
                            font-size: 12px;
                        }
                    }
                }
                .line {
                    font-size: 12px;
                    color: #606266;
                    border-top: 1px dashed #ccc;
                    padding: 10px 0;
                    line-height: 1.5;
                    .name {
                        width: 36px;
                        float: left;
                        text-align: left;
                    }
                    .list {
                        width: calc(100% - 36px);
                        float: left;
                        span {
                            display: inline-block;
                            cursor: pointer;
                            padding: 0 4px;
                        }
                    }
                }
            }
        }
    }
</style>

