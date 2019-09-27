<template>
    <el-row class="page-container">
        <el-row v-show="showIndex" class="page-main">
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :label="tab.label" :name="tab.name">
                    <el-row class="toolbar">
                        <el-radio-group v-model="listType">
                            <el-radio-button label="0">
                                <i class="el-icon-tickets" />&ensp;列表
                            </el-radio-button>
                            <el-radio-button label="1">
                                <i class="el-icon-picture" />&ensp;卡片
                            </el-radio-button>
                        </el-radio-group>
                    </el-row>
                    <direct-search ref="form" :label-position=" 'right' " :form-style="{ 'text-align': 'right', 'margin-bottom': '10px'} " :forms="recordSearchList " @handleSearch="handleFormSearch " />
                    <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="recordElList" :panel-list="recordList" :total-count="totalCount" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />

                    <el-table-self v-else :list-loading="listLoading" :current-page="pageIndex" :columns="columns" :table-data="recordList" :total-count="totalCount" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />

                </el-tab-pane>
            </el-tabs>
        </el-row>
        <transition name="fade ">
            <router-view />
        </transition>
    </el-row>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import panelCard from '@/components/Panel/PanelCard'
import paginationMixin from '@/components/TabComponents/mixin'
import directSearch from '@/components/FormComponents/directSearch'
import { formatSex, pickerOptions } from '@/utils'
import { getNewNurseStationPatientList } from '@/api/outpatient'
import { getCurrentDay } from '@/utils/common'
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
export default {
    components: {
        elTableSelf,
        panelCard,
        directSearch
    },
    mixins: [paginationMixin],
    data() {
        return {
            activeName: 'tab1',
            tabMapOpts: [
                {
                    label: '待执行',
                    name: 'tab1'
                },
                {
                    label: '已执行',
                    name: 'tab2'
                }
            ],
            recordElList: {
                header: {
                    nameValue: 'name',
                    sexValue: 'sex',
                    ageValue: 'age'
                },
                list: [
                    {
                        name: '用户类型',
                        value: 'commercialInsuranceType'
                    },
                    {
                        name: '',
                        formatter(row) {
                            return row.ynDiagnose === 0 ? '复诊' : '初诊'
                        }
                    },
                    {
                        formatterName(row) {
                            return row.execState === 0 ? '开方时间' : '执行时间'
                        },
                        formatter(row) {
                            return row.execState === 0
                                ? row.prescribingTime?row.prescribingTime.split(' ')[0]:'': row.execTime?row.execTime.split(' ')[0]:''
                        }
                    },
                    {
                        name:'执行人',
                        value:'execUserName',
                        hidden:true

                    }
                ],
                btnlist: [
                    {
                        formatter(row) {
                            if (row.execState === 0) {
                                return `待执行（${row.num}）`
                            } else {
                                return `查看`
                            }
                        },
                        func: this.routerDetail
                    }
                ]
            },
            recordList: [],
            totalCount: 0,
            columns: [
                {
                    label: '姓名',
                    value: 'name'
                },
                {
                    label: '性别',
                    value: 'sex'
                },
                {
                    label: '用户类型',
                    value: 'commercialInsuranceType'
                },
                {
                    label: '就诊状态',
                    value: 'ynDiagnose',
                    formatter(row) {
                        return row.ynDiagnose === 0 ? '复诊' : '初诊'
                    }
                },
                {
                    label: '开方时间',
                    formatter(row) {
                        return  row.prescribingTime
                                ? row.prescribingTime.split(' ')[0]
                                : ''
                    }
                },
                {
                    label: '执行时间',
                    value: 'execTime',
                    formatter(row){
                        return `${row.execTime?row.execTime.split(' ')[0]:''}`
                    },
                    hidden: true
                },
                {
                    label: '执行人',
                    value: 'execUserName',
                    hidden: true
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            func: this.routerDetail,
                            formatter(row) {
                                return {
                                    label: row.execState === 0 ? `待执行（${row.num}）` : '查看',
                                    type: 'primary'
                                }
                            }
                        }
                    ]
                }
            ],
            recordSearchList: [
                {
                    type: 'daterange',
                    label: '开方时间',
                    prop: 'date',
                    placeholder: '开方时间',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd'
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'inquiry',
                    placeholder: '患者姓名/处方单号',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            listType: '1',
            listLoading: false,
            showIndex: true,
            cacheForm: {
                date: [getCurrentDay().split(' ')[0], getCurrentDay().split(' ')[0]]
            }
        }
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    created() {
        this.routerChange()
    },
    methods: {
        routerChange() {
            this.showIndex = this.$route.name === 'nurseStation'
            if (this.showIndex) {
                this.$nextTick(() => {
                    this.$refs.form[0].initFieldsObj(this.cacheForm)
                    this.handleSearch()
                })
            }
        },
        handleSwitch(tab) {
            this.recordSearchList[0].label = this.activeName === 'tab1' ? '开方时间' : '执行时间'
            this.columns[5].hidden = this.activeName === 'tab1'
            this.columns[6].hidden = this.activeName === 'tab1'
            this.recordElList.list[3].hidden = this.activeName === 'tab1'
            this.$nextTick(() => {
                const date = [getCurrentDay().split(' ')[0], getCurrentDay().split(' ')[0]]
                this.$refs.form[tab.index].initFieldsObj({ date })

                this.handleFormSearch({ date })
            })
        },
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const data = Object.assign(this.cacheForm, form)
            data.startDate = data.date ? data.date[0] : ''
            data.endDate = data.date ? data.date[1] : ''
            data.isExecute = this.activeName === 'tab1' ? 0 : 1
            data.pageNo = this.pageIndex
            data.pageSize = this.pageSize
            const params = Object.assign({}, data)
            delete params.date
            getNewNurseStationPatientList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS

                    if (d.list && d.totalRecord > 0) {
                        d.list.forEach(item => {
                            item.sex = formatSex(item.sex)
                            let ageStr = ''
                            if (item.age) {
                                ageStr = item.age + '岁'
                                if (item.ageMonth) {
                                    ageStr = ageStr + item.ageMonth + '月'
                                }
                                if (item.ageDay) {
                                    ageStr = ageStr + item.ageDay + '天'
                                }
                            }
                            item.age = ageStr
                            item.avatar = item.headImg
                                ? this.$store.getters.basic.filePrifix + item.headImg
                                : unknownAvatar
                        })
                    }
                    this.recordList = d.list
                    this.totalCount = d.totalRecord
                }
            })
        },
        // 跳转详情
        routerDetail(row) {
            let type = ''
            if(row.execState === 0){
                type = 'noExecute'
            }else{
                type = 'executed'
            }
            this.$router.push({ name: 'nurseDetail', params: { id: row.id,type,status:row.execState }})
        }
    }
}
</script>
