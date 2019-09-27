<template>
    <el-row class="page-container">
        <el-row class="page-main data-month">
            <el-col>
                <direct-search ref="form" :label-position="'center'" :label-width="'85px'" :form-style="{'text-align':'left'}" :forms="searchList" @handleSearch="handleFormSearch"/>
            </el-col>
            <el-col>
                 <div id="tool" :style="'height:'+height+'px;width:100%;'"></div>
            </el-col>

             <el-col class="table-title">
              <div class="title">
                {{regDateArr[0]}} 至 {{regDateArr[1]}} 设备启动统计
              </div>
              <div class="btn">
                 <el-button size="small" type="primary" @click="exportData">导出</el-button>
              </div>
            </el-col>

            <el-col style="margin-top:15px">
                <el-table-self :columns="columns" :list-loading="listLoading"  :table-data="dataList"
                    :total-count="total"
                    :show-summary="true"
                    :summary-method="getSummaries"
                />
            </el-col>
        </el-row>
    </el-row>
</template>
<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { pickerOptions } from '@/utils'
import { getTempstatisticsTool } from '@/api/arclinic'
import { getCurrentDay, getSevenDays } from '@/utils/common'
import paginationMixin from '@/components/TabComponents/mixin'
import echarts from 'echarts'
export default {
    components: {
        directSearch,
        elTableSelf
    },
    mixins: [paginationMixin],
    data() {
        return {
            height: 500,
            regDateArr: [],
            total: 0,
            listLoading: false,
            searchList: [
                {
                    type: 'daterange',
                    label: '监测时间',
                    labelWidth: '80',
                    prop: 'regDateArr',
                    placeholder: '登记日期',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd',
                    valueFormat: 'yyyy-MM-dd 00:00:00'
                }
            ],
            columns: [
                {
                    value: 'date',
                    label: '日期'
                },
                {
                    value: 'useTool',
                    label: '启用设备数'
                },
                {
                    value: 'newToolCount',
                    label: '新启用设备'
                },
                {
                    label: '新设备占比（%）',
                    formatter(row) {
                        return row.newToolCount / row.useTool * 100
                    }
                },
                {
                    value: 'totalCount',
                    label: '累计启用设备'
                }
            ],
            dataList: [],
            toolData: []
        }
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            const data = { startTime: form.regDateArr[0], endTime: form.regDateArr[1] }
            getTempstatisticsTool(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    if (d.length > 0) {
                        this.dataList = d
                        this.total = d.length
                        const date = [] // 时间
                        const useTool = [] // 使用设备数
                        const newToolCount = [] // 总数
                        d.forEach(item => {
                            date.push(item.date)
                            newToolCount.push(item.newToolCount)
                            useTool.push(item.useTool)
                        })
                        this.toolData = [date, useTool, newToolCount]
                        this.drawEcharts()
                    }
                }
            })
        },
        drawEcharts() {
            var MyScatter = echarts.init(document.getElementById('tool'))
            const option = {
                color: ['rgba(224, 32, 32, 1)', 'rgba(0, 145, 255, 1)'],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['启用设备数', '新启用设备']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.toolData[0]
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(151, 151, 151, 1)',
                            type: 'dotted'
                        }
                    }
                },
                series: [
                    {
                        name: '启用设备数',
                        type: 'line',
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: '#32C5FF' // 0% 处的颜色
                                }, {
                                    offset: 0.37, color: '#C5E6FF'
                                }],
                                global: false // 缺省为 false
                            }
                        },
                        data: this.toolData[1]
                    },
                    {
                        name: '新启用设备',
                        type: 'line',
                        areaStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: '#32C5FF' // 0% 处的颜色
                                }, {
                                    offset: 0.37, color: '#C5E6FF'
                                }],
                                global: false // 缺省为 false
                            }
                        },
                        data: this.toolData[2]
                    }
                ]
            }
            MyScatter.setOption(option)
            window.addEventListener('resize', () => { MyScatter.resize() })
        },
        getSummaries(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                const values = data.map(item => Number(item[column.property]))
                if (!values.every(value => isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                        const value = Number(curr)
                        if (!isNaN(value)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0)
                    sums[index] += ' 元'
                } else {
                    sums[index] = 'N/A'
                }
            })

            return sums
        },
        exportData() {
            this.$message.warning('功能待开发！')
        }
    },
    mounted() {
        const endDate = getCurrentDay().split(' ')[0]
        const startDate = getSevenDays(endDate, true).split(' ')[0]

        this.regDateArr = [startDate, endDate]
        this.$refs.form.initforms({ regDateArr: [startDate, endDate] })
        this.handleSearch({ regDateArr: [startDate, endDate] })
        window.addEventListener('resize', () => { this.drawEcharts() })
    }
}
</script>
<style lang="scss" scoped>
.table-title{
  margin-top:15px;
  height:40px;
  line-height: 40px;
  .title{
    float:left;
    width:90%;
    text-align: center;
  }
  .btn{
    float:left;
    width:10%;
    text-align: right;
  }
}
</style>
