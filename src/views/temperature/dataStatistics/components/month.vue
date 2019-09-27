<template>
    <el-row class="page-container">
        <el-row class="page-main data-month">
            <el-col>
                <direct-search ref="form" :label-position="'center'" :label-width="'85px'" :form-style="{'text-align':'left'}" :forms="searchList" @handleSearch="handleFormSearch"/>
            </el-col>
            <el-col>
                 <div id="container" :style="'height:'+height+'px;width:100%;'"></div>
            </el-col>
            <el-col class="table-title">
              <div class="title">
                {{regDateArr[0]}} 至 {{regDateArr[1]}} 监测报告
              </div>
              <div class="btn">
                 <el-button size="small" type="primary" @click="exportData">导出</el-button>
              </div>
            </el-col>
            <el-col  style="margin-top:15px">
                <el-table-self :columns="columns"   :list-loading="listLoading"  :table-data="dataList"
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
import { getTempstatisticsMonthly } from '@/api/arclinic'
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
            regDateArr: [],
            height: 500,
            total: 0,
            chartData: [[], [], [], [], [], [], [], [], [], []],
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
                    valueFormat: 'yyyy-MM-dd'
                }
            ],
            columns: [
                {
                    value: 'date',
                    label: '日期'
                },
                {
                    value: 'count',
                    label: '测温人数'
                },
                {
                    value: 'levelOne',
                    label: '一级预警次数'
                },
                {
                    value: 'leveltwo',
                    label: '二级预警次数'
                },
                {
                    value: 'levelthree',
                    label: '三级预警次数'
                },
                {
                    value: 'levelCount',
                    label: '总预警次数'
                },
                {
                    value: 'system',
                    label: '系统干预次数'
                },
                {
                    value: 'health',
                    label: '健管干预次数'
                },
                {
                    value: 'doctor',
                    label: '医生干预次数'
                },
                {
                    value: 'interCount',
                    label: '总干预次数'
                }
            ],
            dataList: []
        }
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.regDateArr = form.regDateArr
            const data = { startTime: form.regDateArr[0], endTime: form.regDateArr[1] }
            getTempstatisticsMonthly(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    this.dataList = d
                    this.total = d.length
                    if (d.length > 0) {
                        const date = []
                        const count = []
                        const levelOne = []
                        const leveltwo = []
                        const levelthree = []
                        const levelCount = []
                        const system = []
                        const health = []
                        const doctor = []
                        const interCount = []
                        d.forEach(item => {
                            date.push(item.date)
                            count.push(item.count)
                            levelOne.push(item.levelOne)
                            leveltwo.push(item.leveltwo)
                            levelthree.push(item.levelthree)
                            levelCount.push(item.levelCount)
                            system.push(item.system)
                            health.push(item.health)
                            doctor.push(item.doctor)
                            interCount.push(item.interCount)
                        })
                        this.chartData = [date, count, levelOne, leveltwo, levelthree, levelCount, system, health, doctor, interCount]
                    }
                    this.drawEcharts()
                }
            })
        },
        drawEcharts() {
            var MyScatter = echarts.init(document.getElementById('container'))
            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['测温人数', '一级预警次数', '二级预警次数', '三级预警次数', '总预警次数', '系统干预次数', '健管干预次数', '医生干预次数', '总干预次数'],
                    textStyle: {
                        color: '#000'
                    }
                },
                color: ['#0091FF', '#F7B500', '#FA6400', '#E02020', '#B620E0', '#44D7B6', '#FF979C', '#6DD400', '#6236FF'],
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.chartData[0]
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
                        name: '测温人数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[1]
                    },
                    {
                        name: '一级预警次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[2]
                    },
                    {
                        name: '二级预警次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[3]
                    },
                    {
                        name: '三级预警次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[4]
                    },
                    {
                        name: '总预警次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[5]
                    },
                    {
                        name: '系统干预次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[6]
                    },
                    {
                        name: '健管干预次数',
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
                        type: 'line',
                        smooth: true,
                        data: this.chartData[7]
                    },
                    {
                        name: '医生干预次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[8]
                    },
                    {
                        name: '总干预次数',
                        smooth: true,
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
                        type: 'line',
                        data: this.chartData[9]
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
                }
            })
            return sums
        },
        exportData() {
            this.$message.warning('功能待开发！')
        }
    },
    mounted() {
        //  startDate endDate
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
