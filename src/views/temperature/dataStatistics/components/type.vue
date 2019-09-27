<template>
    <el-row class="page-container">
        <el-row class="page-main data-month">
            <el-col>
                <direct-search ref="form" :label-position="'center'" :label-width="'85px'" :form-style="{'text-align':'left'}" :forms="searchList" @handleSearch="handleFormSearch"/>
            </el-col>
            <el-col class="charts">
              <div class="partChart" style="width:40%;padding-right:5%;">
                 <div id="typePie" :style="'height:'+height+'px;width:100%;'"></div>
              </div>
              <div class="partChart"  style="width:60%">
                 <div id="typeLine" :style="'height:'+height+'px;width:100%;'"></div>
              </div>
            </el-col>
            <el-col class="table-title">
              <div class="title">
                {{regDateArr[0]}} 至 {{regDateArr[1]}} 患儿分类统计
              </div>
              <div class="btn">
                 <el-button size="small" type="primary" @click="exportData">导出</el-button>
              </div>
            </el-col>
            <el-col>
                <el-table-self :columns="columns"   :list-loading="listLoading"  :table-data="dataList"
                    :total-count="total"
                    :summary-method="getSummaries"
                    :show-summary="true"
                />
            </el-col>
        </el-row>
    </el-row>
</template>
<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import { getCurrentDay, getSevenDays } from '@/utils/common'
import { getTempstatisticsType } from '@/api/arclinic'
import { pickerOptions } from '@/utils'
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
                    value: 'data',
                    label: '日期'
                },
                {
                    value: 'one',
                    label: '新生儿 + 有惊厥史'
                },
                {
                    value: 'oneZero',
                    label: '新生儿 + 无惊厥史'
                },
                {
                    value: 'twoOne',
                    label: '1-3月龄 + 有惊厥史'
                },
                {
                    value: 'twoZero',
                    label: '1-3月龄 + 无惊厥史'
                },
                {
                    value: 'threeOne',
                    label: '大于3月龄 + 有惊厥史'
                },
                {
                    value: 'threeZero',
                    label: '大于3月龄 + 无惊厥史'
                }
            ],
            typeData: [[], []],
            dataList: [],
            pieData: {}
        }
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            const data = { startTime: form.regDateArr[0], endTime: form.regDateArr[1] }
            getTempstatisticsType(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    this.pieData = d.total
                    if (d.region.length > 0) {
                        this.dataList = d.region
                        const data = [] // 时间
                        const warnCOunt = [] // 总数
                        d.region.forEach(item => {
                            data.push(item.data)
                            warnCOunt.push(item.warnCOunt)
                        })
                        this.typeData = [data, warnCOunt]
                    }
                    this.drawTypePie()
                    this.drawEcharts()
                }
            })
        },
        drawEcharts() {
            var MyScatter = echarts.init(document.getElementById('typeLine'))
            const option = {
                color: ['#E02020'],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['患儿趋势']
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
                    data: this.typeData[0]
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
                        name: '患儿趋势',
                        type: 'line',
                        data: this.typeData[1]
                    }
                ]
            }
            MyScatter.setOption(option)
            window.addEventListener('resize', () => { MyScatter.resize() })
        },
        drawTypePie() {
            var myChart = echarts.init(document.getElementById('typePie'))
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    textStyle: {
                        fontSize: 13,
                        padding: 6
                    },
                    type: 'scroll',
                    orient: 'vertical',
                    right: 6,
                    top: '30%',
                    bottom: 20
                },
                graphic: [{ // 环形图中间添加文字
                    type: 'text', // 通过不同top值可以设置上下显示
                    left: '24%',
                    top: '42%',
                    style: {
                        text: '所有患儿' + '\n\n' + (this.pieData.one + this.pieData.oneZero + this.pieData.twoOne + this.pieData.twoZero + this.pieData.threeOne + this.pieData.threeZero) + '人次',
                        textAlign: 'center',
                        width: 30,
                        height: '15%',
                        fontSize: 18,
                        fontFamily: 'Microsoft YaHei'
                    }
                }],
                color: ['#E02020', '#FA6400', '#F7B500', '#00AC6A', '#0091FF', '#B620E0'],
                series: [
                    {
                        name: '男女比例',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        center: ['30%', '50%'],
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            }
                        },
                        avoidLabelOverlap: false,
                        data: [
                            { value: this.pieData.one, name: '新生儿 + 有惊厥史' },
                            { value: this.pieData.oneZero, name: '新生儿 + 无惊厥史' },
                            { value: this.pieData.twoOne, name: '1-3月龄 + 有惊厥史' },
                            { value: this.pieData.twoZero, name: '1-3月龄 + 无惊厥史' },
                            { value: this.pieData.threeOne, name: '大于3月龄 + 有惊厥史' },
                            { value: this.pieData.threeZero, name: '大于3月龄 + 无惊厥史' }
                        ]
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => { myChart.resize() })
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
        window.addEventListener('resize', () => { this.drawTypePie() })
    }

}
</script>
<style lang="scss" scoped>
.charts{
   width:100%;
  .partChart{
    float: left;
  }
}
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