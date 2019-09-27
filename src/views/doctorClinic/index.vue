<template>
    <el-row class="page-container">
        <el-row v-if="doctorIndex" class="page-main">
            <!-- <el-row class="tabs-right">
                <el-button :size="size" type="primary" @click="quick">快速接诊</el-button>
            </el-row>-->
            <!-- 快速接诊 -->
            <!-- <dialog-form ref="quick" width="720px" title="快速接诊" :form-data="quickData" :count-line="12" @handleConfirm="handleQuickConfirm" /> -->
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <template v-for="(tab,index) in tabMapOpts">
                    <el-tab-pane v-if="!tab.hidden" :key="index" :name="tab.key" :label="tab.label">
                        <template v-if="tab.key === 'tab3'">
                            <iframe :src="apiAddress" frameborder="0" width="100%" height="780px" scrolling="auto" />
                        </template>
                        <template v-else>
                            <template v-if="tab.key === 'tab1' && isQueueNum">
                                <div v-loading="listLoading" class="queue">
                                    <el-row class="header">
                                        <el-col :span="5">
                                            <el-row>
                                                <el-col :span="8">
                                                    <span>{{ countObj.waitCount }}</span>
                                                    <span>候诊人数</span>
                                                </el-col>
                                                <el-col :span="8">
                                                    <span>{{ countObj.finishCount }}</span>
                                                    <span>已就诊人数</span>
                                                </el-col>
                                                <el-col :span="8">
                                                    <span>{{ countObj.missCount }}</span>
                                                    <span>过号人数</span>
                                                </el-col>
                                            </el-row>
                                        </el-col>
                                        <el-col :span="12" class="center">

                                            <div v-if="nowMessage" class="center">
                                                <div>当前呼叫： </div>
                                                <div>
                                                    <h1>{{ nowMessage.sn }}号患者 {{ nowMessage.name }}</h1>
                                                    <span>叫号时间：{{ nowMessage.callTime }}</span>
                                                </div>
                                            </div>
                                        </el-col>
                                        <el-col :span="5" class="right">
                                            <el-button @click="handleQueueChange(1)">过号</el-button>

                                            <el-button :loading="btnLoading" @click="handleQueueChange(2)">重新叫号</el-button>

                                            <el-button @click="handleQueueChange(3)">下一位</el-button>

                                        </el-col>
                                    </el-row>
                                    <el-tabs v-model="tabActiveName" type="card" @tab-click="handleSubSwitch">
                                        <template v-for="(subTab,subIndex) in tabSubMapOpts">
                                            <el-tab-pane v-if="!subTab.hidden" :key="subIndex" :name="subTab.key" :label="subTab.label">
                                                <direct-search ref="form" :label-width="'120px'" :form-style="{'text-align':'right','margin-top':'10px'}" :forms="formDoms" label-position="'right'" @handleSearch="handleFormSearch" />
                                                <el-table-self :current-page="pageIndex" :columns="queueColumns" :table-data="queueDataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                                            </el-tab-pane>
                                        </template>
                                    </el-tabs>
                                </div>
                                <el-dialog :visible.sync="dialogVisible" title="优先就诊" width="30%" center>
                                    <div style="margin:0 0 30px">
                                        <span>插队到当前就诊患者之后的第</span>
                                        <el-input v-model="jumpNumber" style="width:60px" />
                                        <span>位</span>
                                    </div>
                                    <div>
                                        <span>插队标识：</span>
                                        <el-radio-group v-model="jumpRadio">
                                            <el-radio :label="'急诊'">急诊</el-radio>
                                            <el-radio :label="'特殊'">特殊</el-radio>
                                        </el-radio-group>
                                    </div>
                                    <span slot="footer" class="dialog-footer">
                                        <el-button @click="dialogVisible = false">取 消</el-button>
                                        <el-button v-loading="btnLoading" type="primary" @click="saveJumpQueue">确 定</el-button>
                                    </span>
                                </el-dialog>
                            </template>
                            <template v-else>
                                <el-row class="toolbar">
                                    <el-radio-group v-model="listType">
                                        <el-radio-button label="0">
                                            <i class="el-icon-tickets" />&ensp;列表
                                        </el-radio-button>
                                        <el-radio-button label="1">
                                            <i class="el-icon-picture" />&ensp;卡片
                                        </el-radio-button>
                                    </el-radio-group>
                                    <direct-search ref="form" :label-width="'120px'" :form-style="{'text-align':'right','margin-top':'10px'}" :forms="tabMaps[activeName].searchList" label-position="'right'" @handleSearch="handleFormSearch" />
                                </el-row>
                                <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="tabMaps[activeName].elList" :panel-list="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                                <el-table-self v-else :list-loading="listLoading" :current-page="pageIndex" :columns="tabMaps[activeName].columns" :table-data="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                            </template>
                        </template>
                    </el-tab-pane>
                </template>
            </el-tabs>
        </el-row>
        <transition name="fade" mode="out-in">
            <router-view />
        </transition>
    </el-row>
</template>

<script>
import {
    getTodayPatient,
    getHistoryPatient,
    offlineBespeakHX,
    getQueueList,
    getNowMessage,
    earlyQueue,
    getNextSort,
    callSn,
    saveMissSort,
    updatePatientStatus,
    editQueueStatus
} from '@/api/arclinic'
// import { getDepartmentOpts } from '@/api/org'
import { getDictById } from '@/api/catalog'
import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'

import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import MD5 from '@/utils/MD5'
import dialogForm from '@/components/DialogComponents/Form'
import {
    formatDictMap,
    formatSex,
    getBabyAge,
    formatPatientStatus,
    formatChargeStatus,
    formatRefundedStatus,
    formatTransferStatus,
    formatTime,
    defaultPickOpts,
    paramAvatar
    // param
} from '@/utils'
// import cityList from '@/common/data/city.js'
export default {
    components: {
        directSearch,
        panelCard,
        elTableSelf,
        dialogForm
    },
    mixins: [paginationMixin],
    data() {
        const dictData = this.$store.getters.dictData
        // let queueStatusOpts = [
        //     {
        //         label: '全部',
        //         value: ''
        //     }
        // ]
        // queueStatusOpts = queueStatusOpts.concat(dictData[526])
        // 性别
        const sex = []
        const data = { dictId: 9 }
        getDictById(data).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS.records
                if (d && d.length > 0) {
                    d.forEach(item => {
                        sex.push({
                            value: item.code,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            listLoading: false,
            listType: '1',
            cacheForm: {},
            doctorIndex: true, // 就诊
            tabMapOpts: [
                {
                    label: '今日病人',
                    key: 'tab1'
                },
                {
                    label: '历史记录',
                    key: 'tab2'
                },
                {
                    label: '建档',
                    key: 'tab3',
                    hidden: true
                }
            ],
            activeName: 'tab1',
            dataList: [], // 今日|历史数据
            // 对应关系图
            tabMaps: {
                tab1: {
                    searchList: [
                        {
                            type: 'input',
                            label: '',
                            prop: 'condition',
                            placeholder: '输入患者姓名/手机号/病案号',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'name',
                            label: '姓名',
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleToPatient
                                }
                            ]
                        },
                        {
                            value: 'sex',
                            label: '性别'
                        },
                        {
                            value: 'age',
                            label: '年龄'
                        },
                        {
                            value: 'commercialInsuranceType',
                            label: '用户类型'
                        },
                        {
                            value: 'regDate',
                            label: '登记日期'
                        },
                        {
                            label: '登记科室',
                            value: 'deptName'
                        },
                        {
                            label: '排队序号',
                            value: 'sn'
                        },
                        {
                            label: '登记状态',
                            formatter(row) {
                                if (row.status === 1 || row.status === 2) {
                                    const txt = row.status === 1 ? '等待' : '已接诊'
                                    const time =
                    row.status === 1 ? formatTime(row.createTime) : formatTime(row.clinicTime)
                                    return `${txt} ${time}${row.isFirstClinic === 1 ? '（初诊）' : ''}`
                                } else {
                                    return '已完成'
                                }
                            }
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 250,
                            operType: 'button',
                            operations: [
                                {
                                    func: this.handleAccepts,
                                    formatter(row) {
                                        return {
                                            label: row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : '重新接诊',
                                            type: 'primary'
                                        }
                                    }
                                },
                                {
                                    label: '取消接诊',
                                    func: this.cancleHandle,
                                    isHidden(row) {
                                        return row.status !== 2
                                    }
                                },
                                {
                                    label: '详情',
                                    func: this.handleDone,
                                    isHidden(row) {
                                        return row.status !== 3
                                    }
                                }
                            ]
                        }
                    ],
                    elList: {
                        header: {
                            nameValue: 'name',
                            sexValue: 'sex',
                            ageValue: 'age',
                            func: this.handleToPatient
                        },
                        statusList: [
                            {
                                value: 'status', // 接诊状态
                                formatter(val) {
                                    return formatPatientStatus(val)
                                }
                            },
                            {
                                value: 'chargeStatus', // 收费状态
                                formatter(val) {
                                    return formatChargeStatus(val)
                                },
                                formatterStyle(val) {
                                    const backgroundColor = val === 0 ? '#F4A460' : val === 1 ? 'blue' : 'green'
                                    return {
                                        backgroundColor
                                    }
                                }
                            },
                            {
                                value: 'isRefunded', // 退费状态
                                formatter(val) {
                                    return formatRefundedStatus(val)
                                },
                                formatterStyle(val) {
                                    return {
                                        backgroundColor: 'red'
                                    }
                                }
                            },
                            {
                                value: 'transferStatus', // 转诊状态
                                formatter(val) {
                                    return formatTransferStatus(val)
                                },
                                formatterStyle(val) {
                                    const backgroundColor = val === -1 ? 'red' : val === 0 ? 'blue' : 'green'
                                    return {
                                        backgroundColor
                                    }
                                }
                            }
                        ],
                        list: [
                            {
                                name: '用户类型',
                                value: 'commercialInsuranceType'
                            },
                            {
                                name: '登记日期',
                                value: 'regDate'
                            },
                            {
                                name: '登记科室',
                                value: 'deptName'
                            },
                            {
                                name: '排队序号',
                                value: 'sn'
                            },
                            {
                                formatter(row) {
                                    if (row.status === 1 || row.status === 2) {
                                        const txt = row.status === 1 ? '等待' : '已接诊'
                                        const time =
                      row.status === 1 ? formatTime(row.createTime) : formatTime(row.clinicTime)
                                        return `${txt} ${time}${row.isFirstClinic === 1 ? '（初诊）' : ''}`
                                    } else {
                                        return '已完成'
                                    }
                                }
                            }
                        ],
                        btnlist: [
                            {
                                formatter(row) {
                                    return row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : '重新接诊'
                                },
                                func: this.handleAccepts
                            },
                            {
                                name: '取消接诊',
                                func: this.cancleHandle,
                                isHidden(row) {
                                    return row.status !== 2
                                }
                            },
                            {
                                name: '详情',
                                func: this.handleDone,
                                isHidden(row) {
                                    return row.status !== 3
                                }
                            }
                        ]
                    }
                },
                tab2: {
                    searchList: [
                        {
                            type: 'daterange',
                            label: '登记日期',
                            prop: 'dates',
                            options: defaultPickOpts.opts2,
                            format: 'yyyy-MM-dd',
                            valueFormat: 'yyyy-MM-dd 00:00:00'
                        },
                        {
                            type: 'input',
                            label: '',
                            prop: 'condition',
                            placeholder: '输入患者姓名/手机号/病案号',
                            labelWidth: '0',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'name',
                            label: '姓名',
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleToPatient
                                }
                            ]
                        },
                        {
                            value: 'sex',
                            label: '性别'
                        },
                        {
                            value: 'age',
                            label: '年龄'
                        },
                        {
                            value: 'commercialInsuranceType',
                            label: '用户类型'
                        },
                        {
                            value: 'rphone',
                            label: '手机号'
                        },
                        {
                            label: '就诊日期',
                            formatter(row) {
                                return row.updateTime || row.regDate
                            }
                        },
                        {
                            label: '西医诊断',
                            value: 'diseaseName'
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 300,
                            operType: 'button',
                            operations: [
                                {
                                    formatter(row) {
                                        return {
                                            label: row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : '',
                                            type: 'primary'
                                        }
                                    },
                                    func: this.handleAccepts,
                                    isHidden(row) {
                                        return row.status === 3
                                    }
                                },
                                {
                                    label: '详情',
                                    type: 'primary',
                                    func: this.handleDone,
                                    isHidden(row) {
                                        return row.status !== 3
                                    }
                                },
                                {
                                    label: '预约',
                                    type: 'success',
                                    func: this.handleAppoint
                                },
                                {
                                    label: '新增随访',
                                    type: 'warning',
                                    plain: true,
                                    func: this.handleFollow,
                                    isHidden(row) {
                                        return row.status === 1
                                    }
                                }
                            ]
                        }
                    ],
                    elList: {
                        header: {
                            nameValue: 'name',
                            sexValue: 'sex',
                            ageValue: 'age',
                            func: this.handleToPatient
                        },
                        statusList: [
                            {
                                value: 'status', // 接诊状态
                                formatter(val) {
                                    return formatPatientStatus(val)
                                }
                            },
                            {
                                value: 'transferStatus', // 转诊状态
                                formatter(val) {
                                    return formatTransferStatus(val)
                                },
                                formatterStyle(val) {
                                    const backgroundColor = val === -1 ? 'red' : val === 0 ? 'blue' : 'green'
                                    return {
                                        backgroundColor
                                    }
                                }
                            }
                        ],
                        list: [
                            {
                                name: '用户类型',
                                value: 'commercialInsuranceType'
                            },
                            {
                                name: '手机号',
                                value: 'phone'
                            },
                            {
                                name: '就诊日期',
                                formatter(row) {
                                    return row.updateTime || row.regDate
                                }
                            },
                            {
                                name: '西医诊断',
                                value: 'diseaseName'
                            }
                        ],
                        btnlist: [
                            {
                                formatter(row) {
                                    return row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : ''
                                },
                                func: this.handleAccepts,
                                isHidden(row) {
                                    return row.status === 3
                                }
                            },
                            {
                                name: '详情',
                                func: this.handleDone,
                                isHidden(row) {
                                    return row.status !== 3
                                }
                            },
                            {
                                name: '预约',
                                func: this.handleAppoint
                            },
                            {
                                name: '新增随访',
                                func: this.handleFollow,
                                isHidden(row) {
                                    return row.status === 1
                                }
                            }
                        ]
                    }
                }
                // tab3: {
                //     searchList: [
                //         {
                //             type: 'daterange',
                //             label: '登记日期',
                //             prop: 'regDate',
                //             options: defaultPickOpts.opts2,
                //             format: 'yyyy-MM-dd',
                //             valueFormat: 'yyyy-MM-dd'
                //         },
                //         {
                //             type: 'input',
                //             label: '',
                //             prop: 'condition',
                //             placeholder: '输入患者姓名/手机号/病案号',
                //             labelWidth: '0',
                //             slot: {
                //                 slot: 'append',
                //                 type: 'button',
                //                 icon: 'el-icon-search'
                //             }
                //         }
                //     ],
                //     columns: [
                //         {
                //             value: 'name',
                //             label: '姓名',
                //             operType: 'button',
                //             operations: [
                //                 {
                //                     type: 'text',
                //                     func: this.handleToPatient
                //                 }
                //             ]
                //         },
                //         {
                //             value: 'sex',
                //             label: '性别'
                //         },
                //         {
                //             value: 'age',
                //             label: '年龄'
                //         },
                //         {
                //             value: 'commercialInsuranceType',
                //             label: '用户类型'
                //         },
                //         {
                //             value: 'rphone',
                //             label: '手机号'
                //         },
                //         {
                //             label: '就诊日期',
                //             formatter(row) {
                //                 return row.updateTime || row.regDate
                //             }
                //         },
                //         {
                //             label: '西医诊断',
                //             value: 'diseaseName'
                //         },
                //         {
                //             label: '操作',
                //             fixed: 'right',
                //             align: 'center',
                //             width: 300,
                //             operType: 'button',
                //             operations: [
                //                 {
                //                     formatter(row) {
                //                         return {
                //                             label: row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : '',
                //                             type: 'primary'
                //                         }
                //                     },
                //                     func: this.handleAccepts,
                //                     isHidden(row) {
                //                         return row.status === 3
                //                     }
                //                 },
                //                 {
                //                     label: '详情',
                //                     type: 'primary',
                //                     func: this.handleDone,
                //                     isHidden(row) {
                //                         return row.status !== 3
                //                     }
                //                 },
                //                 {
                //                     label: '预约',
                //                     type: 'success',
                //                     func: this.handleAppoint
                //                 },
                //                 {
                //                     label: '新增随访',
                //                     type: 'warning',
                //                     plain: true,
                //                     func: this.handleFollow,
                //                     isHidden(row) {
                //                         return row.status === 1
                //                     }
                //                 }
                //             ]
                //         }
                //     ],
                //     elList: {
                //         header: {
                //             nameValue: 'name',
                //             sexValue: 'sex',
                //             ageValue: 'age',
                //             func: this.handleToPatient
                //         },
                //         statusList: [
                //             {
                //                 value: 'status', // 接诊状态
                //                 formatter(val) {
                //                     return formatPatientStatus(val)
                //                 }
                //             },
                //             {
                //                 value: 'transferStatus', // 转诊状态
                //                 formatter(val) {
                //                     return formatTransferStatus(val)
                //                 },
                //                 formatterStyle(val) {
                //                     const backgroundColor = val === -1 ? 'red' : val === 0 ? 'blue' : 'green'
                //                     return {
                //                         backgroundColor
                //                     }
                //                 }
                //             }
                //         ],
                //         list: [
                //             {
                //                 name: '用户类型',
                //                 value: 'commercialInsuranceType'
                //             },
                //             {
                //                 name: '手机号',
                //                 value: 'phone'
                //             },
                //             {
                //                 name: '就诊日期',
                //                 formatter(row) {
                //                     return row.updateTime || row.regDate
                //                 }
                //             },
                //             {
                //                 name: '西医诊断',
                //                 value: 'diseaseName'
                //             }
                //         ],
                //         btnlist: [
                //             {
                //                 formatter(row) {
                //                     return row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : ''
                //                 },
                //                 func: this.handleAccepts,
                //                 isHidden(row) {
                //                     return row.status === 3
                //                 }
                //             },
                //             {
                //                 name: '详情',
                //                 func: this.handleDone,
                //                 isHidden(row) {
                //                     return row.status !== 3
                //                 }
                //             },
                //             {
                //                 name: '预约',
                //                 func: this.handleAppoint
                //             },
                //             {
                //                 name: '新增随访',
                //                 func: this.handleFollow,
                //                 isHidden(row) {
                //                     return row.status === 1
                //                 }
                //             }
                //         ]
                //     }
                // }
            },
            // tab对应
            tabSubMapOpts: [
                {
                    label: '候诊',
                    key: 'subTab1'
                },
                {
                    label: '已就诊',
                    key: 'subTab2'
                },
                {
                    label: '需回诊',
                    key: 'subTab3'
                }
            ],
            tabActiveName: 'subTab1',
            apiAddress: '',

            // 排队叫号
            isQueueNum: this.commonUtil.getConfigValue('isUseFunction') === '1',
            formDoms: [
                // {
                //     type: 'select',
                //     label: '排队状态',
                //     prop: 'queueStatus',
                //     opts: queueStatusOpts
                // },
                {
                    type: 'input',
                    label: '',
                    prop: 'condition',
                    placeholder: '输入患者姓名/手机号/病案号',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            queueDataList: [],
            queueColumns: [
                {
                    label: '序号',
                    value: 'sort',
                    width: 80
                },
                {
                    label: '姓名',
                    value: 'name',
                    operType: 'sort',
                    width: 180,
                    align: 'left'
                },
                {
                    label: '性别',
                    value: 'sex',
                    width: 80
                },
                {
                    label: '年龄',
                    value: 'age'
                },
                {
                    label: '用户类型',
                    value: 'commercialInsuranceType'
                },
                {
                    label: '登记科室',
                    value: 'deptName',
                    width: 150
                },
                {
                    label: '登记时间',
                    value: 'regDate'
                },
                {
                    label: '排队号',
                    value: 'sn'
                },
                {
                    label: '登记类别',
                    value: 'regSort'
                },
                {
                    label: '登记状态',
                    formatter(row) {
                        if (row.status === 1 || row.status === 2) {
                            const txt = row.status === 1 ? '等待' : '已接诊'
                            const time =
                row.status === 1 ? formatTime(row.createTime) : formatTime(row.clinicTime)
                            return `${txt} ${time}${row.isFirstClinic === 1 ? '（初诊）' : ''}`
                        } else {
                            return '已完成'
                        }
                    },
                    width: 180
                },
                {
                    label: '排队状态',
                    value: 'queueStatus'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 300,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleAccepts,
                            formatter(row) {
                                return {
                                    label: row.status === 1 ? '接诊' : row.status === 2 ? '接诊中' : '重新接诊',
                                    type: 'primary'
                                }
                            }
                        },
                        {
                            label: '取消接诊',
                            func: this.cancleHandle,
                            isHidden(row) {
                                return row.status !== 2
                            }
                        },
                        {
                            label: '优先就诊',
                            func: this.jumpQueue,
                            style: 'background:#B620E0;color:#fff;border-color:#B620E0'
                        }
                    ]
                }
            ],
            dialogVisible: false,
            jumpNumber: '',
            jumpRadio: '急诊',
            patientInfo: {},
            countObj: {
                waitCount: 0,
                finishCount: 0,
                missCount: 0
            },
            nowMessage: null,
            btnLoading: false,
            dictData
        }
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    mounted() {
        this.routerChange()
    },
    methods: {
    // 取消接诊
        cancleHandle(row) {
            this.$confirm(`是否确认取消接诊${row.name}?`, '提示', {
                type: 'warning'
            })
                .then(() => {
                    updatePatientStatus({
                        registerId: row.id,
                        cardNum: row.cardNum,
                        status: 1
                    }).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                        }
                    })
                })
                .catch(() => {})
        },
        // 路由切换 模块隐藏
        routerChange() {
            this.doctorIndex = this.$route.name === 'doctorClinic'
            if (this.doctorIndex) {
                if (this.isQueueNum) {
                    this.getNowMessage()
                }
                this.handleSearch()
            }

            // 建档
            const idCard = this.$store.getters.user.certCode
                ? this.$store.getters.user.certCode
                : '030DAF54-8D43-46A7-960A-498A13F5D8E0'
            const appId = 'senxiang'
            const secret = 'sxsecretsx'
            let hash = ''
            for (let i = 0; i < 6; i++) {
                hash += Math.floor(Math.random() * 10)
            }
            const sign = MD5(`${appId}${secret}${hash}`)
            if (
                this.commonUtil.getConfigValue('transferType') === '1' &&
        this.commonUtil.getConfigValue('transferApiAddress')
            ) {
                this.tabMapOpts[2].hidden = false
                this.apiAddress =
          this.commonUtil.getConfigValue('transferApiAddress') +
          '/#/hisInsuranceList?idCard=' +
          idCard +
          `&appId=${appId}&hash=${hash}&sign=${sign}`
            } else {
                this.tabMapOpts[2].hidden = true
            }
        },

        // 切换pane
        handleSwitch(tab) {
            if (tab.name !== 'tab3') {
                this.cacheForm = {}
                this.pageIndex = 1
                this.listType = '1'
                if (tab.name === 'tab1') {
                    this.tabActiveName = 'subTab1'
                }
                this.handleSearch()
                this.$refs.form[tab.index].$refs.form.resetFields()
            }
        },

        // 切换子panle
        handleSubSwitch(tab) {
            this.handleSearch()
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        // 查询
        handleSearch(form) {
            if (this.activeName === 'tab1' || this.activeName === 'tab2') {
                this.listLoading = true
                if (!this.doctorIndex) return false
                this.cacheForm = form || this.cacheForm
                const params = Object.assign(this.cacheForm, form)
                if (this.activeName === 'tab1') {
                    this.$nextTick(() => {
                        this.$refs.form[0].initforms(params)
                    })
                }

                params.pageNo = this.pageIndex
                params.pageSize = this.pageSize
                if (this.activeName === 'tab1') {
                    if (this.isQueueNum) {
                        const tabActiveName = this.tabActiveName
                        params.revisitingStatus = tabActiveName === 'subTab3' ? 1 : 0
                        params.queueStatus =
              tabActiveName === 'subTab1' ? '01,02,03' : tabActiveName === 'subTab2' ? '04' : ''
                        getQueueList(params).then(res => {
                            this.queueSearchSuccessCb(res)
                        })
                    } else {
                        getTodayPatient(params).then(res => {
                            this.searchSuccessCb(res)
                        })
                    }
                } else {
                    getHistoryPatient(params).then(res => {
                        this.searchSuccessCb(res, false)
                    })
                }
            }
        },

        // 列表查询成功回调
        searchSuccessCb(res, flag = true) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                const total = flag ? d.total || 0 : d.totalRecord || 0
                const records = total > 0 ? (flag ? d.records : d.list) : []
                if (total > 0) {
                    records.map(item => {
                        item.avatar = item.headImg
                            ? this.$store.getters.basic.filePrifix + item.headImg
                            : paramAvatar(item.sex, item.birthDate)
                        item.sex = formatSex(item.sex)
                        item.age = getBabyAge(item.birthDate)
                        item.regDate = item.regDate ? item.regDate.split(' ')[0] : ''
                        item.status = item.patientStatus
                        item.isCurrentDay = flag
                    })
                }
                this.listLoading = false
                this.total = total
                this.dataList = records
            }
        },

        // 排队叫号列表查询成功回调
        queueSearchSuccessCb(res, flag = true) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                const total = d.totalRecord || 0
                const records = d.list || []
                if (total > 0) {
                    records.map(item => {
                        item.avatar = item.headImg
                            ? this.$store.getters.basic.filePrifix + item.headImg
                            : paramAvatar(item.sex, item.birthDate)
                        item.sex = formatSex(item.sex)
                        item.age = getBabyAge(item.birthDate)
                        item.regDate = item.regDate ? item.regDate.split(' ')[0] : ''
                        item.status = item.patientStatus
                        item.isSort = item.jumpAQueueReason
                        item.isCurrentDay = flag
                        item.queueStatus = formatDictMap(this.dictData[526], item.queueStatus)
                    })
                }
                this.listLoading = false
                this.total = total
                this.queueDataList = records
            }
        },

        // 跳转至患者详情
        handleToPatient(item) {
            this.$router.push({
                name: 'patientDetail',
                params: {
                    id: item.sysPatientId || item.patientId,
                    registerId: item.id ? item.id : 0
                }
            })
        },

        // 判断年龄是否满18周岁 return true:18岁及以上，false: 0-17岁
        judgeAge(birth) {
            if (!birth) return true
            const birthDate = birth.split(' ')[0].split('-')
            const birthYear = Number(birthDate[0])
            const birthMonth = Number(birthDate[1])
            const birthDay = Number(birthDate[2])
            const d = new Date()
            const nowYear = d.getFullYear()
            const nowMonth = d.getMonth() + 1
            const nowDay = d.getDate()
            if (nowYear === birthYear) {
                return false
            } else {
                const ageDiff = nowYear - birthYear
                if (ageDiff > 17) {
                    return true
                } else {
                    if (ageDiff === 17) {
                        if (nowMonth > birthMonth) {
                            return true
                        } else if (nowMonth === birthMonth) {
                            if (nowDay >= birthDay) {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            return false
                        }
                    } else {
                        return false
                    }
                }
            }
        },
        // abcd
        // 判断患者类型
        judgePtType(item) {
            // his --- his病历，无转诊
            // mmt --- mmt病历，有转诊
            // hx  --- hx病历，无转诊
            const clinic = this.$store.getters.clinic
            // 接口地址
            const apiAddress = this.commonUtil.getConfigValue('transferApiAddress')
            // 转诊类型
            const transferType = this.commonUtil.getConfigValue('transferType')
            // 诊所code
            const orgCode = clinic.orgCode
            if (!orgCode || !transferType || transferType !== '1' || !apiAddress) {
                return 'his'
            }
            const isTodayAfter = new Date(item.regDate).getTime() - new Date('2018-12-07').getTime() > 0
            if (item.patientSources === '01' && isTodayAfter) {
                return 'mmt'
            }
            if (!this.judgeAge(item.birthDate) && isTodayAfter) {
                return 'hx'
            }

            return 'his'
        },

        // 接诊
        handleAccepts(item) {
            const type = this.judgePtType(item)
            const patientId = item.sysPatientId || item.patientId
            const isCurrentDay = item.isCurrentDay
            const sn = item.sn || 0
            const queueId = item.queueId || 0
            const patientStatus = item.patientStatus
            // const routerParams = JSON.stringify({
            // isCurrentDay: item.isCurrentDay,
            // sn: item.sn,
            // regDate: item.regDate,
            // patientSources: item.patientSources,
            // patientStatus: item.patientStatus,
            // birthDate: item.birthDate
            // })
            // 接诊1、重新接诊3
            if (item.status === 1 || item.status === 3) {
                if (this.isQueueNum && (item.queueStatus === '等待' || item.queueStatus === '过号')) {
                    editQueueStatus(item.queueId).then(res => {})
                }
                offlineBespeakHX(item.id).then(res => {
                    if (res.STATUS === '1') {
                        this.$router.push({
                            name: 'outpatientDetail',
                            params: {
                                patientId,
                                regId: item.id,
                                type,
                                activeName: 'tab1',
                                sn,
                                isCurrentDay,
                                patientStatus,
                                queueId
                                // routerParams
                            }
                        })
                    }
                })
            } else {
                this.$router.push({
                    name: 'outpatientDetail',
                    params: {
                        patientId,
                        regId: item.id,
                        type,
                        activeName: 'tab1',
                        sn,
                        isCurrentDay,
                        patientStatus,
                        queueId
                        // routerParams
                    }
                })
            }
        },

        // 详情
        handleDone(item) {
            const type = this.judgePtType(item)
            this.$router.push({
                name: 'outpatientDone',
                params: {
                    patientId: item.sysPatientId || item.patientId,
                    regId: item.id,
                    type
                }
            })
        },

        // 预约
        handleAppoint(item) {
            this.$router.push({
                name: 'detail',
                params: {
                    id: 0,
                    patientId: item.patientId
                }
            })
        },

        // 新建随访
        handleFollow(item) {
            const type = this.judgePtType(item)
            const patientId = item.sysPatientId || item.patientId
            const isCurrentDay = item.isCurrentDay
            const sn = item.sn || 0
            const queueId = item.queueId || 0
            const patientStatus = item.patientStatus
            // const routerParams = JSON.stringify({
            //     isCurrentDay: item.isCurrentDay,
            //     sn: item.sn,
            //     regDate: item.regDate,
            //     patientSources: item.patientSources,
            //     patientStatus: item.patientStatus,
            //     birthDate: item.birthDate
            // })
            this.$router.push({
                name: 'outpatientDetail',
                params: {
                    patientId,
                    regId: item.id,
                    type,
                    activeName: 'tab8',
                    sn,
                    isCurrentDay,
                    patientStatus,
                    queueId
                }
            })
        },
        // 获取当前叫号用户
        getNowMessage() {
            getNowMessage().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.countObj = {
                            waitCount: d.waitCount,
                            finishCount: d.finishCount,
                            missCount: d.missCount
                        }
                        // if (d.nowMessage) {
                        this.nowMessage = d.nowMessage
                        // }
                    }
                }
            })
        },

        // 优先就诊
        jumpQueue(row) {
            if (row.queueStatus !== '呼叫中') {
                // if (row.regSort === '预约' && (row.queueStatus !== '已完成' && row.queueStatus !== '爽约')) {
                this.jumpNumber = ''
                this.jumpRadio = '急诊'
                this.patientInfo = row
                this.dialogVisible = true
            } else {
                this.$message.warning('此患者不可以优先就诊')
            }
        },
        // 保存优先就诊
        saveJumpQueue() {
            var re = /^[1-9]+[0-9]*]*$/
            if (!re.test(this.jumpNumber)) {
                this.$message.warning('请输入正整数')
                return
            }
            const data = {
                jumpAQueueReason: this.jumpRadio,
                nsort: this.jumpNumber,
                queueId: this.patientInfo.queueId
            }
            this.btnLoading = true
            earlyQueue(data)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.btnLoading = false
                        this.dialogVisible = false
                        this.handleSearch()
                    }
                })
                .catch(() => {
                    this.btnLoading = false
                })
        },

        // 排队叫号按钮  下一位、过号、重新叫号
        handleQueueChange(type) {
            this.listLoading = true
            if (type === 1) {
                saveMissSort()
                    .then(res => {
                        if (res.STATUS === '1') {
                            if (res.ITEMS) {
                                this.getNowMessage()
                                this.handleFormSearch({})
                            } else {
                                this.$message.warning('当前已是最后一位')
                                this.listLoading = false
                            }
                        }
                    })
                    .catch(() => {
                        this.listLoading = false
                    })
            } else if (type === 2) {
                this.listLoading = false
                this.btnLoading = true
                const id = this.nowMessage ? this.nowMessage.id : 0
                callSn(id)
                    .then(res => {
                        this.btnLoading = false
                    })
                    .catch(() => {
                        this.btnLoading = false
                    })
            } else {
                getNextSort()
                    .then(res => {
                        if (res.STATUS === '1') {
                            this.getNowMessage()
                            this.handleFormSearch({})
                            if (!res.ITEMS) {
                                this.$message.warning('当前已是最后一位')
                                this.listLoading = false
                            }
                        }
                    })
                    .catch(() => {
                        this.listLoading = false
                    })
            }
        }

        // // 快速接诊
        // quick() {
        //     this.$refs.quick.open()
        // },

        // // 快速接诊确定
        // handleQuickConfirm() {

    // }
    }
}
</script>

<style lang="scss" scoped>
.queue {
  .header {
    border-bottom: 1px dashed #979797;
    padding-bottom: 5px;
    margin-bottom: 10px;
    .el-col-8 span {
      display: block;
      text-align: center;
      line-height: 28px;
      margin-top: 10px;
      font-size: 14px;
    }
    .el-col-8 span:nth-of-type(1) {
      font-size: 28px;
    }
    .center {
      display: flex;
      align-items: center;
      justify-content: center;
      div:nth-of-type(2) {
        margin-left: 20px;
        text-align: center;
        h1 {
          color: #0091ff;
          margin: 7px 0;
        }
        span {
          font-size: 14px;
          margin-top: 10px;
        }
      }
    }
    .right {
      margin-right: 20px;
      float: right;
      text-align: right;
      button {
        margin-top: 20px;
        color: #fff;
      }
      button:nth-of-type(1) {
        background: #e02020;
        border-color: #e02020;
      }
      button:nth-of-type(2) {
        background: #ff6e02;
        border-color: #ff6e02;
      }
      button:nth-of-type(3) {
        background: #00ac6a;
        border-color: #00ac6a;
      }
    }
  }
}
</style>
