<template>
    <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'
import moment from 'moment'
import { getTendency } from '@/api/arclinic'

export default {
    props: {
        className: {
            type: String,
            default: 'chart'
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '350px'
        },
        autoResize: {
            type: Boolean,
            default: true
        },
        chartData: {
            type: Object
        }
    },
    data() {
        return {
            chart: null
        }
    },
    watch: {
        chartData: {
            deep: true,
            handler(val) {
                this.setOptions(val)
            }
        }
    },
    mounted() {
        this.initChart()
        if (this.autoResize) {
            this.__resizeHanlder = debounce(() => {
                if (this.chart) {
                    this.chart.resize()
                }
            }, 100)
            window.addEventListener('resize', this.__resizeHanlder)
        }

        // 监听侧边栏的变化
        const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
        sidebarElm.addEventListener('transitionend', this.__resizeHanlder)
    },
    beforeDestroy() {
        if (!this.chart) {
            return
        }
        if (this.autoResize) {
            window.removeEventListener('resize', this.__resizeHanlder)
        }

        const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
        sidebarElm.removeEventListener('transitionend', this.__resizeHanlder)

        this.chart.dispose()
        this.chart = null
    },
    methods: {
        setOptions() {
            const startDate = moment()
                .subtract(7, 'days')
                .format('YYYY-MM-DD 00:00:00')
            const endDate = moment().format('YYYY-MM-DD HH:mm:ss')
            const data = {
                startDate,
                endDate
            }
            const patientNumArr = [0, 0, 0, 0, 0, 0, 0, 0]
            const receivedCashArr = [0, 0, 0, 0, 0, 0, 0, 0]
            const receivedArr = [0, 0, 0, 0, 0, 0, 0, 0]
            const date = []
            for (var i = 7; i >= 0; i--) {
                date.push(
                    moment()
                        .subtract(i, 'days')
                        .format('MM.DD')
                )
            }
            getTendency(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    // 就诊人数
                    if (d.ReceptionCountList && d.ReceptionCountList.length > 0) {
                        d.ReceptionCountList.forEach(item => {
                            const index = moment(item.regDate).diff(moment(startDate), 'days')
                            patientNumArr[index] = item.patientsNum
                        })
                    }
                    // 实收金额
                    if (d.inComeSumList && d.inComeSumList.length > 0) {
                        d.inComeSumList.forEach(item => {
                            const index = moment(item.chargeDate).diff(moment(startDate), 'days')
                            receivedArr[index] = item.receivedCash
                        })
                    }
                    // 实收现金
                    if (d.inComeCashList && d.inComeCashList.length > 0) {
                        d.inComeCashList.forEach(item => {
                            const index = moment(item.chargeDate).diff(moment(startDate), 'days')
                            receivedCashArr[index] = item.inComeCash
                        })
                    }
                }
                this.$nextTick(() => {
                    this.chart.setOption({
                        xAxis: {
                            data: date,
                            boundaryGap: false,
                            axisTick: {
                                show: false
                            }
                        },
                        grid: {
                            left: 20,
                            right: 20,
                            containLabel: true
                        },
                        yAxisName: '业务营收',
                        dimension: ['就诊人数', '业务营收'],
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            },
                            padding: [5, 10]
                        },
                        // yAxis: {
                        //     axisTick: {
                        //         show: false
                        //     }
                        // },
                        yAxis: [
                            {
                                name: '就诊人数(人)',
                                type: 'value'
                            },
                            {
                                name: '业务营收(元)',
                                type: 'value'
                            }
                        ],
                        legend: {
                            data: ['就诊人数', '实收金额', '现金收入']
                        },
                        series: [
                            {
                                name: '就诊人数',
                                itemStyle: {
                                    normal: {
                                        color: '#39ba7f',
                                        lineStyle: {
                                            color: '#39ba7f',
                                            width: 2
                                        }
                                    }
                                },
                                smooth: false,
                                type: 'line',
                                data: patientNumArr,
                                animationDuration: 2800,
                                animationEasing: 'cubicInOut'
                            },
                            {
                                name: '实收金额',
                                smooth: false,
                                type: 'line',
                                itemStyle: {
                                    normal: {
                                        color: '#f6a1a8',
                                        lineStyle: {
                                            color: '#f6a1a8',
                                            width: 2
                                        }
                                    }
                                },
                                data: receivedArr,
                                animationDuration: 2800,
                                animationEasing: 'quadraticOut',
                                yAxisIndex: 1
                            },
                            {
                                name: '现金收入',
                                smooth: false,
                                type: 'line',
                                itemStyle: {
                                    normal: {
                                        color: '#f49e10',
                                        lineStyle: {
                                            color: '#f49e10',
                                            width: 2
                                        }
                                    }
                                },
                                data: receivedCashArr,
                                animationDuration: 2800,
                                animationEasing: 'quadraticOut',
                                yAxisIndex: 1
                            }
                        ]
                    })
                })
            })
        },
        initChart() {
            this.chart = echarts.init(this.$el, 'macarons')
            this.setOptions(this.chartData)
        }
    }
}
</script>
