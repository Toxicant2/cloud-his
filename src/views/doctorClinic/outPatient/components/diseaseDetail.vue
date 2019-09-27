<template>
    <el-dialog 
        :visible.sync="visible"
        :width="width"
        :height="height"
        :title="title"
        class="dialogTitle">
        <div>
            <el-tabs v-model="activeName">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="tab.key === 'disease'">
                        {{ITEMS[tab.key]?ITEMS[tab.key].diseaseSummary:''}}
                    </template>
                    <template v-else-if="tab.key === 'diagnosisList'">
                        <div v-for="(item,itemIndex) in ITEMS[tab.key]" v-if="ITEMS[tab.key].length>0" :key="itemIndex" class="text item clearfix">
                            <span class="itmeDot" style="float: left"></span>
                            <div class="name">{{item.name }}：</div>
                            <div class="list">
                                <span v-for="(opt,optIndex) in item.detailList" v-if="item.detailList.length>0" :key="optIndex">
                                    {{optIndex+1}}、{{opt.name}}
                                </span>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="(item,itemIndex) in ITEMS[tab.key]" v-if="ITEMS[tab.key].length > 0" :key="`${tab.key}_${itemIndex}`" class="text item">
                            <span class="itmeDot"></span>{{item.name }}
                        </div>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </div>

    </el-dialog>
</template>

<script>
    import { getSysDiseaseDetail } from '@/api/catalog'

    export default {
        name: 'diseaseDetail',
        data() {
            return {
                title: '',
                activeName: '',
                tabMapOpts: [
                    {
                        label: '概述',
                        key: 'disease'
                    }, {
                        label: '诊断依据',
                        key: 'diagnosisBasisList'
                    }, {
                        label: '鉴别诊断',
                        key: 'diagnosisList'
                    }, {
                        label: '相关检查',
                        key: 'examList'
                    }, {
                        label: '处置意见',
                        key: 'opinionList'
                    }, {
                        label: '转诊提要',
                        key: 'transferReasonList'
                    }
                ],
                ITEMS: {},
                visible: false
            }
        },
        methods: {
            open(diseaseId, index) {
                this.visible = true
                this.activeName = this.tabMapOpts[index].key
                this._getDiseaseDetail(diseaseId)
            },
            _getDiseaseDetail(diseaseId) {
                getSysDiseaseDetail(diseaseId).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.ITEMS = d
                        const disease = d.disease
                        this.title = disease.name + (disease.diseaseAlias ? `（别名：${disease.diseaseAlias}）` : '')
                    }
                })
            }
        },
        props: {
            width: {
                type: String,
                default: '630px'
            },
            height: {
                type: String,
                default: '425px'
            }
        }
    }
</script>

<style lang="scss">
    .dialogTitle {
        .el-dialog__title {
            display: inline-block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 34px;
        }
        .el-dialog__body{
            padding-top: 0;
            min-height: 420px;
        }
        .el-tab-pane{
            padding-left: 15px;
        }
        .text {
             font-size: 14px;
        }
        .item {
            margin-bottom: 18px;
            .name {
                width: 95px;
                float: left;
                text-align: left;
            }
            .list {
                width: calc(100% - 120px);
                float: left;
                span {
                    display: block;
                    cursor: pointer;
                    padding: 0 4px;
                }
            }
        }
        .itmeDot{
            width: 5px;
            display: inline-block;
            height: 5px;
            background: #666;
            border-radius: 50%;
            margin-right: 10px;
            padding-bottom: 5px;
            margin-top: 5px;
        }
    }
</style>