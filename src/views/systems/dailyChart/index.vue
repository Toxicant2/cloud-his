<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleSearch"/>

            <el-row v-loading="mainLoading" class="main">
                <el-col :span="12">
                    <h2>日志状态</h2>
                    <ve-pie :data="logTypeData" :settings="chartSettings"/>
                </el-col>
                <el-col :span="12">
                    <h2>操作类型</h2>
                    <ve-pie :data="methodData" :settings="chartSettings"/>
                </el-col>
                <el-col :span="24">
                    <h2>次数</h2>
                    <ve-line :data="chartData" :legend-visible="false" :grid="grid"/>
                </el-col>
            </el-row>
        </el-row>
    </el-row>
</template>

<script>
import { getLogCensus } from '@/api/upms'
import directSearch from '@/components/FormComponents/directSearch'
import { pickerOptions } from '@/utils'
import { getCurrentDay, getSevenDays } from '@/utils/common'
export default {
    components: {
        directSearch
    },
    data() {
        const dictData = this.$store.getters.dictData
        return {
            dictData,
            searchList: [
                {
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '',
                    prop: 'dates',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    clearable: false
                }
            ],
            mainLoading: false,
            logTypeData: {
                columns: ['label', 'num'],
                rows: [
                    { 'label': '正常', 'num': 0 },
                    { 'label': '异常', 'num': 0 }
                ]
            },
            methodData: {
                columns: ['label', 'num'],
                rows: [
                    { 'label': '新增', 'num': 0 },
                    { 'label': '删除', 'num': 0 },
                    { 'label': '获取', 'num': 0 },
                    { 'label': '修改', 'num': 0 }
                ]
            },
            chartSettings: {
                itemStyle: {
                    normal: {
                        color: function(params) {
                            var colorList = [
                                '#409EFF', '#F56C6C', '#E6A23C', '#909399'
                            ]
                            return colorList[params.dataIndex]
                        }
                    }
                }
            },
            chartData: {
                columns: ['date', '次数'],
                rows: []
            },
            grid: {
                top: '5%',
                left: '3%',
                right: '3%',
                show: true
            }
        }
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        handleSearch(form) {
            this.mainLoading = true
            const defaultDate = [getSevenDays(getCurrentDay(), true), getCurrentDay()]
            let data
            if (form && form.dates && form.dates.length > 0) {
                data = {
                    startTime: form.dates[0],
                    endTime: form.dates[1]
                }
            } else {
                this.$refs.form.initFieldsObj({
                    dates: defaultDate
                })
                data = {
                    startTime: defaultDate[0],
                    endTime: defaultDate[1]
                }
            }
            getLogCensus(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let typeCount1 = 0
                    let typeCount2 = 0
                    let methodCount1 = 0
                    let methodCount2 = 0
                    let methodCount3 = 0
                    let methodCount4 = 0
                    const obj = {}
                    const arr = []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            if (item.logType === '1') {
                                typeCount1++
                            } else if (item.logType === '9') {
                                typeCount2++
                            }
                            if (item.logMethod === 'POST') {
                                methodCount1++
                            } else if (item.logMethod === 'DELETE') {
                                methodCount2++
                            } else if (item.logMethod === 'GET') {
                                methodCount3++
                            } else if (item.logMethod === 'PUT') {
                                methodCount4++
                            }
                            if (item.createTime) {
                                const key = item.createTime.split(' ')[0]
                                if (obj[key]) {
                                    obj[key]++
                                } else {
                                    obj[key] = 1
                                }
                            }
                        })
                        for (const key in obj) {
                            arr.push({
                                date: key,
                                '次数': obj[key]
                            })
                        }
                    }
                    this.logTypeData.rows[0].num = typeCount1
                    this.logTypeData.rows[1].num = typeCount2

                    this.methodData.rows[0].num = methodCount1
                    this.methodData.rows[1].num = methodCount2
                    this.methodData.rows[2].num = methodCount3
                    this.methodData.rows[3].num = methodCount4
                    this.chartData.rows = arr
                    this.mainLoading = false
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .main {
        h2{
            text-align:center;
            line-height: 32px;
            padding:10px 0;
        }
    }
</style>

