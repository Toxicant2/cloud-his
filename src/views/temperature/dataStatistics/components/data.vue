<template>
    <el-row>
        <el-row class="data-statistics">
            <el-row class="header-part" />
            <el-row class="tips-part">
                <el-col v-for="(item,index) in tipsList" :key="index+'tipsList'" class="tips-content">
                    <el-col v-for="(itemContent,idnexContent) in item.list" :key="idnexContent+'list'" class="tips-item">
                        <el-col class="title">
                            {{ itemContent.label }}
                        </el-col>
                        <el-col class="content">
                            {{ itemContent.value }}
                        </el-col>
                    </el-col>
                </el-col>
            </el-row>
            <el-row ref="chartsPart" class="charts-part">
                <el-col class="charts-content">
                    <el-col ref="elememt" class="charts-item">
                        <el-col ref="chartsTitle" class="charts-title">
                            患儿类别
                        </el-col>
                        <el-col class="charts">
                            <template v-for="(item,index) in patientTypeList">
                                <el-col :style="'font-size:'+e/1082*8.5+'px'" :key="index+'label'" class="describe-label">
                                    {{ item.label }}
                                </el-col>
                                <el-col :key="index+'value'" class="describe-value">
                                    <el-progress :percentage="item.value" />
                                </el-col>
                            </template>
                        </el-col>
                    </el-col>
                    <el-col class="charts-item">
                        <el-col class="charts-title">
                            患儿年龄
                        </el-col>
                        <el-col class="charts">
                            <div id="container" :style="'height:'+height+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                    <el-col class="charts-item">
                        <el-col class="charts-title">
                            患儿性别<font style="font-size:1.6vh">（体温超过37.5度）</font>
                        </el-col>
                        <el-col class="charts">
                            <div id="patientAge" :style="'height:'+height+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                </el-col>
                <el-col class="charts-content" style="margin:0 0.5%;width:47%">
                    <el-col :style="'height:'+(topHeight*25.6*1.5+0.5*topHeight*0.5)+'px;'" class="charts-item">
                        <el-col class="charts-title">
                            监测趋势
                        </el-col>
                        <el-col class="charts">
                            <div id="three" :style="'height:'+(height*1.5)+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                    <el-col :style="'height:'+(topHeight*25.6*1.5+0.5*topHeight*0.5)+'px;overflow-y:hidden'" class="charts-item">
                        <el-col class="charts-title">
                            设备分布
                        </el-col>
                        <el-col :style="'height:'+(height*1.5+40)+'px;width:100%'" class="charts">
                            <div id="area" :style="'height:'+(height*1.5+40)+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                </el-col>
                <el-col class="charts-content">
                    <el-col class="charts-item">
                        <el-col class="charts-title">
                            预警级别占比
                        </el-col>
                        <el-col class="charts">
                            <el-col style="width:33%">
                                <div id="firstWarn" :style="'height:'+height+'px;width:100%;'" />
                            </el-col>
                            <el-col style="width:33%">
                                <div id="secondWarn" :style="'height:'+height+'px;width:100%;'" />
                            </el-col>
                            <el-col style="width:33%">
                                <div id="thirdWarn" :style="'height:'+height+'px;width:100%;'" />
                            </el-col>
                        </el-col>
                    </el-col>
                    <el-col class="charts-item">
                        <el-col class="charts-title">
                            使用频次
                        </el-col>
                        <el-col class="charts">
                            <div id="frequency" :style="'height:'+height+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                    <el-col class="charts-item">
                        <el-col class="charts-title">
                            设备趋势<font style="font-size:1.6vh">（累计的已经启用的设备数）</font>
                        </el-col>
                        <el-col class="charts">
                            <div id="trend" :style="'height:'+height+'px;width:100%;'" />
                        </el-col>
                    </el-col>
                </el-col>
            </el-row>
        </el-row>
    </el-row>
</template>
<script>
import echarts from 'echarts'
import { getCurrentDay, getSevenDays } from '@/utils/common'
import jsonData from './510100.json'
import {
    getTempstatisticsTotal,
    getTempstatisticsLevel,
    getTempstatisticsPatient,
    getTempstatisticsTrend,
    getTempstatisticsFrequency,
    getTempstatisticsTool
} from '@/api/arclinic'
import { toFixed } from '@/utils/float'
export default {
    data() {
        this.chartSettings = {
            position: 'province/sichuan'
        }
        return {
            getCurrentDay,
            getSevenDays,
            district: [],
            e: 0,
            map: [],
            mapData: [],
            height: 0,
            titleHeight: 0,
            topHeight: 0,
            itemHeight: 0,
            // 预警级别占比
            warnData: {},
            // 性别统计
            sexData: {
                woman: 0,
                man: 0
            },
            // 年龄统计
            ageData: {},
            // 监测趋势
            thredData: [[], [], [], []],
            // 使用频率
            frequencyData: [],
            frequencyTotal: 0,
            // 设备趋势
            toolData: [[], [], []],
            tipsList: [
                {
                    list: [
                        { label: '监测用户量', value: '0' },
                        { label: '监测次数', value: '0' },
                        { label: '监测时长(时)', value: '0' },
                        { label: '预警次数', value: '0' },
                        { label: '干预次数', value: '0' }
                    ]
                },
                {
                    list: [
                        { label: '今日监测人数', value: '0' },
                        { label: '当前在线人数', value: '0' },
                        { label: '一级预警人数', value: '0' },
                        { label: '二级预警人数', value: '0' },
                        { label: '三级预警人数', value: '0' }
                    ]
                }
            ],
            patientTypeList: [
                { label: '新生儿 + 有惊厥史', value: 0 },
                { label: '新生儿 + 无惊厥史', value: 0 },
                { label: '1-3月龄 + 有惊厥史', value: 0 },
                { label: '1-3月龄 + 无惊厥史', value: 0 },
                { label: '大于3月龄 + 有惊厥史', value: 0 },
                { label: '大于3月龄 + 无惊厥史', value: 0 }
            ]
        }
    },
    mounted() {
        this.init()
        this.initData()
        window.addEventListener('resize', () => {
            this.init()
        })
        var opts = {
            subdistrict: 1,
            showbiz: false
        }
        this.district = new AMap.DistrictSearch(opts)
        const that = this
        this.district.search('成都市', function(status, result) {
            if (status == 'complete') {
                that.setSearchOption(result.districtList[0], 'city', 510100)
            }
        })

        this.map = new AMap.Map('area', {
            resizeEnable: true,
            center: [116.30946, 39.937629],
            zoom: 30
        })
    },
    methods: {
        patientTtpe() {
            var dom = document.getElementById('container')
            var myChart = echarts.init(dom)
            let option = null
            const that = this
            option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: ['0-1', '2-3', '4-5', '6-7', '8-9', '10-11', '12-13', '14-15', '16-17'],
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(193,193,193,0.85)'
                            }
                        },
                        nameTextStyle: {
                            fontSize: (this.e / 1082) * 9
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: '#7383A9'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(151, 151, 151, 1)',
                                type: 'dotted'
                            }
                        }
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: '60%',
                        data: [
                            this.ageData.zeroToOne,
                            this.ageData.twoToThree,
                            this.ageData.fourToFive,
                            this.ageData.sixToSeven,
                            this.ageData.eightToNine,
                            this.ageData.tenToEleven,
                            this.ageData.twelveToThirteen,
                            this.ageData.fourteenToFifteen,
                            this.ageData.sixteenToSeventeen
                        ],
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0,
                                    1,
                                    0,
                                    0,
                                    [
                                        {
                                            offset: 0,
                                            color: '#0091FF' // 0% 处的颜色
                                        },
                                        {
                                            offset: 1,
                                            color: '#00D3FF' // 100% 处的颜色
                                        }
                                    ],
                                    false
                                ),
                                label: {
                                    show: true, // 开启显示
                                    position: 'top', // 在上方显示
                                    textStyle: {
                                        // 数值样式
                                        color: '#fff',
                                        fontSize: (this.e / 1082) * 9
                                    },
                                    formatter: function(a) {
                                        if (a.value) {
                                            return (
                                                a.value +
                        '人' +
                        '\n' +
                        '{a|' +
                        ((a.value / that.ageData.total) * 100).toFixed(2) +
                        '%' +
                        '}'
                                            )
                                        } else {
                                            return ''
                                        }
                                    },
                                    rich: {
                                        a: {
                                            color: '#0091FF',
                                            fontSize: (this.e / 1082) * 7,
                                            lineHeight: (this.e / 1082) * 9
                                        }
                                    }
                                    // formatter: function (params,ticket,callback) {

                                    //     console.log(params)
                                    //     var res = 'Function formatter : <br/>' + params[0].name;
                                    //     for (var i = 0, l = params.length; i < l; i++) {
                                    //         res += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
                                    //     }
                                    //     return res;
                                    // }
                                }
                            }
                        }
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        },
        patientAge() {
            var dom = document.getElementById('patientAge')
            var myChart = echarts.init(dom)
            let option = null
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['男性患儿', '女性患儿'],
                    textStyle: {
                        // 图例文字的样式
                        color: '#ccc',
                        fontSize: (this.e / 1082) * 8
                    }
                },
                graphic: [
                    {
                        // 环形图中间添加文字
                        type: 'text', // 通过不同top值可以设置上下显示
                        left: 'center',
                        top: '40%',
                        style: {
                            text: '所有患儿' + '\n\n' + '362人',
                            textAlign: 'center',
                            fill: '#fff', // 文字的颜色
                            width: 30,
                            height: 30,
                            fontSize: (this.e / 1082) * 8,
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                ],
                color: ['rgba(242, 72, 105, 1)', 'rgba(64, 158, 255, 1)'],
                series: [
                    {
                        name: '男女比例',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        label: {
                            normal: {
                                formatter: '{b|{b}：}{c|{c}}\n  {per|{d}%}  ',
                                rich: {
                                    b: {
                                        fontSize: (this.e / 1082) * 8
                                    },
                                    c: {
                                        fontSize: (this.e / 1082) * 8
                                    },
                                    per: {
                                        fontSize: (this.e / 1082) * 8,
                                        color: '#eee',
                                        padding: [0, 0, 0, 15],
                                        lineHeight: 25
                                    }
                                }
                            }
                        },
                        avoidLabelOverlap: false,
                        data: [
                            { value: this.sexData.woman, name: '女性患儿' },
                            { value: this.sexData.man, name: '男性患儿' }
                        ]
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        },
        firstWarn() {
            var dom = document.getElementById('firstWarn')
            var myChart = echarts.init(dom)
            let option = null
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                color: ['#F7B500', 'rgb(66,90,112)'],
                title: {
                    subtext: '一级预警',
                    x: 'center',
                    subtextStyle: {
                        color: 'rgba(193,193,193,1)',
                        fontSize: (this.e / 1082) * 9
                    },
                    bottom: this.e / 1082
                },
                graphic: [
                    {
                        // 环形图中间添加文字
                        type: 'text', // 通过不同top值可以设置上下显示
                        left: 'center',
                        top: '38%',
                        style: {
                            text:
                parseInt((this.warnData.totalOne / this.warnData.totalCount) * 100) +
                '%' +
                '\n\n' +
                this.warnData.totalOne +
                '人次',
                            textAlign: 'center',
                            fill: 'rgba(193,193,193,1)', // 文字的颜色
                            width: 30,
                            height: 30,
                            fontSize: (this.e / 1082) * 9,
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                ],
                series: [
                    {
                        name: '预警级别占比',
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        data: [{ value: 253, name: '一级预警' }, { value: 109, name: '其它' }]
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        },
        secondWarn() {
            var dom = document.getElementById('secondWarn')
            var myChart = echarts.init(dom)
            let option = null
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                title: {
                    subtext: '二级预警',
                    x: 'center',
                    subtextStyle: {
                        color: 'rgba(193,193,193,1)',
                        fontSize: (this.e / 1082) * 9
                    },
                    bottom: this.e / 1082
                },
                graphic: [
                    {
                        // 环形图中间添加文字
                        type: 'text', // 通过不同top值可以设置上下显示
                        left: 'center',
                        top: '38%',
                        style: {
                            text:
                parseInt((this.warnData.totalTwo / this.warnData.totalCount) * 100) +
                '%' +
                '\n\n' +
                this.warnData.totalTwo +
                '人次',
                            textAlign: 'center',
                            fill: 'rgba(193,193,193,1)', // 文字的颜色
                            width: 30,
                            height: 30,
                            fontSize: (this.e / 1082) * 9,
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                ],
                color: ['#FA6400', 'rgb(66,90,112)'],
                series: [
                    {
                        name: '预警级别占比',
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        data: [{ value: 72, name: '二级预警' }, { value: 290, name: '其它' }]
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        },
        thirdWarn() {
            var dom = document.getElementById('thirdWarn')
            var myChart = echarts.init(dom)
            let option = null
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                title: {
                    subtext: '三级预警',
                    x: 'center',
                    subtextStyle: {
                        color: 'rgba(193,193,193,1)',
                        fontSize: (this.e / 1082) * 9
                    },
                    bottom: this.e / 1082
                },
                graphic: [
                    {
                        // 环形图中间添加文字
                        type: 'text', // 通过不同top值可以设置上下显示
                        left: 'center',
                        top: '40%',
                        style: {
                            text:
                parseInt((this.warnData.totalThree / this.warnData.totalCount) * 100) +
                '%' +
                '\n\n' +
                this.warnData.totalThree +
                '人次',
                            textAlign: 'center',
                            fill: 'rgba(193,193,193,1)', // 文字的颜色
                            width: 30,
                            height: 30,
                            fontSize: (this.e / 1082) * 9,
                            fontFamily: 'Microsoft YaHei'
                        }
                    }
                ],
                color: ['#E02020', 'rgb(66,90,112)'],
                series: [
                    {
                        name: '预警级别占比',
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: false,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        data: [{ value: 37, name: '三级预警' }, { value: 325, name: '其它' }]
                    }
                ]
            }
            myChart.setOption(option, true)
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        },
        frequency() {
            var MyScatter = echarts.init(document.getElementById('frequency'))
            const that = this
            const option = {
                xAxis: {
                    splitLine: {
                        show: false
                    },
                    scale: true,
                    type: 'category',
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(193,193,193,0.85)'
                        }
                    },
                    data: ['1-5', '6-10', '11-15', '15以上']
                },
                yAxis: {
                    show: false,
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    }
                },
                series: [
                    {
                        symbolSize: function(data) {
                            return (data / that.frequencyTotal) * 100
                        },
                        data: this.frequencyData,
                        type: 'scatter',
                        itemStyle: {
                            normal: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(120, 36, 50, 0.5)',
                                shadowOffsetY: 5,
                                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                                    {
                                        offset: 1,
                                        color: 'rgba(0,163,255,1)'
                                    },
                                    {
                                        offset: 0,
                                        color: 'rgba(0,89,255,0)'
                                    }
                                ])
                            }
                        }
                    }
                ]
            }

            MyScatter.setOption(option)
            window.addEventListener('resize', () => {
                MyScatter.resize()
            })
        },
        trend() {
            var MyScatter = echarts.init(document.getElementById('trend'))
            const option = {
                color: ['rgba(224, 32, 32, 1)', 'rgba(0, 145, 255, 1)'],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['启用设备数', '新启用设备'],
                    textStyle: {
                        fontSize: (this.e / 1082) * 9,
                        color: 'rgba(191, 191, 191, 0.85)'
                    }
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
                    data: this.toolData[0],
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(193,193,193,0.85)'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#7383A9'
                        }
                    },
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
                        stack: '总量',
                        data: this.toolData[1]
                    },
                    {
                        name: '新启用设备',
                        type: 'line',
                        stack: '总量',
                        data: this.toolData[2]
                    }
                ]
            }
            MyScatter.setOption(option)
            window.addEventListener('resize', () => {
                MyScatter.resize()
            })
        },
        three() {
            var MyScatter = echarts.init(document.getElementById('three'))
            const option = {
                color: ['#0091FF', '#E02020', '#00AC6A'],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['日监测患者人数', '预警次数', '干预次数'],
                    textStyle: {
                        fontSize: (this.e / 1082) * 9,
                        color: 'rgba(191, 191, 191, 0.85)'
                    }
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
                    data: this.thredData[0],
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,0.85)'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(151, 151, 151, 0.85)'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(193,193,193,0.85)',
                            type: 'dotted'
                        }
                    }
                },
                series: [
                    {
                        name: '日监测患者人数',
                        areaStyle: {
                            color: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.5,
                                colorStops: [
                                    {
                                        offset: 0.3,
                                        color: 'rgba(0,128,255,0.3)'
                                    },
                                    {
                                        offset: 0.2,
                                        color: 'rgba(0,128,255,0.3)'
                                    }
                                ],
                                global: false // 缺省为 false
                            },
                            opacity: 0.85
                        },
                        type: 'line',
                        data: this.thredData[1]
                    },
                    {
                        name: '预警次数',
                        // areaStyle: {
                        //     color: {
                        //         type: 'radial',
                        //         x: 0.5,
                        //         y: 0.5,
                        //         r: 0.5,
                        //         colorStops: [{
                        //             offset: 0.3, color: 'rgba(0,128,255,0.3)' // 0% 处的颜色
                        //         }, {
                        //             offset: 0.2, color: 'rgba(0,128,255,0.3)' // 100% 处的颜色
                        //         }],
                        //         global: false // 缺省为 false
                        //     },
                        //     opacity: 0.85
                        // },
                        type: 'line',
                        itemStyle: {
                            normal: {
                                lineStyle: {
                                    width: 2,
                                    type: 'dashed' // 'dotted'虚线 'solid'实线
                                }
                            }
                        },
                        data: this.thredData[2]
                    },
                    {
                        name: '干预次数',
                        // areaStyle: {
                        //     color: {
                        //         type: 'radial',
                        //         x: 0.5,
                        //         y: 0.5,
                        //         r: 0.5,
                        //         colorStops: [{
                        //             offset: 0.3, color: 'rgba(0,128,255,0.3)' // 0% 处的颜色
                        //         }, {
                        //             offset: 0.2, color: 'rgba(0,128,255,0.3)' // 100% 处的颜色
                        //         }],
                        //         global: false // 缺省为 false
                        //     },
                        //     opacity: 0.85
                        // },
                        itemStyle: {
                            normal: {
                                lineStyle: {
                                    width: 2,
                                    type: 'dashed' // 'dotted'虚线 'solid'实线
                                }
                            }
                        },
                        type: 'line',
                        data: this.thredData[3]
                    }
                ]
            }
            MyScatter.setOption(option)
            window.addEventListener('resize', () => {
                MyScatter.resize()
            })
        },

        area() {
            var MyScatter = echarts.init(document.getElementById('area'))
            window.addEventListener('resize', () => {
                MyScatter.resize()
            })
        },

        init() {
            this.e = window.outerWidth
            this.titleHeight = parseInt(this.$refs.chartsTitle.$el.offsetHeight)
            this.topHeight = document.documentElement.clientHeight / 100
            this.height = parseInt(this.$refs.elememt.$el.offsetHeight) - this.titleHeight - 1.5
            this.itemHeight = this.$refs.elememt.$el.offsetHeight
            this.$nextTick(() => {})
        },

        setSearchOption(data, level, adcode) {
            var subList = data.districtList
            if (subList) {
                var curlevel = subList[0].level
                this.mapData = []
                for (var i = 0, l = subList.length; i < l; i++) {
                    var name = subList[i].name
                    var citycode = subList[i].adcode
                    this.mapData.push({
                        name: name,
                        value: Math.random() * 100,
                        cityCode: citycode,
                        level: curlevel
                    })
                }
                this.loadMap('成都市', jsonData)
            }
        },

        loadMap(mapName, data) {
            if (data) {
                echarts.registerMap(mapName, data)
                var myChart = echarts.init(document.getElementById('area'))
                var option = {
                    visualMap: {
                        show: false,
                        type: 'piecewise',
                        pieces: [
                            {
                                max: 30,
                                label: '安全',
                                color: '#435E8D'
                            },
                            {
                                min: 30,
                                max: 60,
                                label: '警告',
                                color: '#435E8D'
                            },
                            {
                                min: 60,
                                label: '危险',
                                color: '#435E8D'
                            }
                        ],
                        color: '#3A3A3A',
                        textStyle: {
                            color: '#3A3A3A'
                        },
                        visibility: 'off'
                    },
                    series: [
                        {
                            name: '数据名称',
                            type: 'map',
                            roam: true,
                            zoom: 3.4,
                            mapType: mapName,
                            selectedMode: 'single',
                            showLegendSymbol: false,
                            visibility: 'off',
                            itemStyle: {
                                normal: {
                                    color: '#ccc',
                                    areaColor: '#fff',
                                    borderColor: '#fff',
                                    borderWidth: 0.5,
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: 'rgb(249, 249, 249)'
                                        }
                                    }
                                },
                                emphasis: {
                                    areaColor: false,
                                    borderColor: '#fff',
                                    areaStyle: {
                                        color: '#fff'
                                    },
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: 'rgb(249, 249, 249)'
                                        }
                                    }
                                }
                            },
                            data: this.mapData
                        }
                    ]
                }
                myChart.setOption(option)
                this.map.setFitView()
                window.addEventListener('resize', () => {
                    myChart.resize()
                })
            }
        },

        initData() {
            this.getTempstatisticsTotal()
            this.getTempstatisticsPatient()
            this.getTempstatisticsTrend()
            this.getTempstatisticsFrequency()
            this.getTempstatisticsTool()
        },
        // 体温累计数据接口
        getTempstatisticsTotal() {
            getTempstatisticsTotal().then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    // 监测用户量
                    this.tipsList[0].list[0].value = d.userCount
                    // 监测次数
                    this.tipsList[0].list[1].value = d.useCount
                    // 监测时长(时)
                    this.tipsList[0].list[2].value = d.useTime
                    // 预警次数
                    this.tipsList[0].list[3].value = d.wranCount
                    // 干预次数
                    this.tipsList[0].list[4].value = d.interventionCount
                }
            })

            getTempstatisticsLevel().then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    this.warnData = d.total
                    // 今日监测人数
                    this.tipsList[1].list[0].value = d.today.count
                    // 当前在线人数
                    this.tipsList[1].list[1].value = d.today.onCount
                    // 一级预警人数
                    this.tipsList[1].list[2].value = d.today.todayOne
                    // 二级预警人数
                    this.tipsList[1].list[3].value = d.today.todayTwo
                    // 三级预警人数
                    this.tipsList[1].list[4].value = d.today.todayThree
                }
                this.firstWarn()
                this.secondWarn()
                this.thirdWarn()
            })
        },

        // 患者数据统计接口
        getTempstatisticsPatient() {
            getTempstatisticsPatient().then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    // 患者性别
                    this.sexData = d.sex
                    this.patientAge()

                    // 患者类别
                    const typeTotal = d.total
                    this.patientTypeList[0].value = toFixed((d.type.one / typeTotal) * 100, 1)
                    this.patientTypeList[1].value = toFixed((d.type.oneZero / typeTotal) * 100, 1)
                    this.patientTypeList[2].value = toFixed((d.type.twoOne / typeTotal) * 100, 1)
                    this.patientTypeList[3].value = toFixed((d.type.twoZero / typeTotal) * 100, 1)
                    this.patientTypeList[4].value = toFixed((d.type.threeOne / typeTotal) * 100, 1)
                    this.patientTypeList[5].value = toFixed((d.type.threeZero / typeTotal) * 100, 1)

                    // 患者年龄
                    this.ageData = d.age
                    this.ageData.total = d.total
                    this.patientTtpe()
                }
            })
        },

        // 监测趋势
        getTempstatisticsTrend() {
            const date = getCurrentDay()
            const data = { startTime: getSevenDays(date, true), endTime: date }
            getTempstatisticsTrend(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    if (d.length > 0) {
                        const trendDate = [] // 时间
                        const interCount = [] // 干预
                        const warnCount = [] // 预警
                        const trendCount = [] // 人数
                        d.forEach(item => {
                            trendDate.push(item.trendDate)
                            interCount.push(item.interCount)
                            warnCount.push(item.warnCount)
                            trendCount.push(item.trendCount)
                        })
                        this.thredData = [trendDate, trendCount, warnCount, interCount]
                    }
                    this.three()
                }
            })
        },

        // 使用频率
        getTempstatisticsFrequency() {
            getTempstatisticsFrequency().then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    this.frequencyData.push(d.oneToFive)
                    this.frequencyData.push(d.sixToTen)
                    this.frequencyData.push(d.elevenToFifteen)
                    this.frequencyData.push(d.sixteenTop)
                    this.frequencyTotal = d.oneToFive + d.sixToTen + d.elevenToFifteen + d.sixteenTop
                    this.frequency()
                }
            })
        },

        // 设备趋势
        getTempstatisticsTool() {
            const date = getCurrentDay()
            const data = { startTime: getSevenDays(date, true), endTime: date }
            getTempstatisticsTool(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    if (d.length > 0) {
                        const date = [] // 时间
                        const useTool = [] // 使用设备数
                        const totalCount = [] // 总数
                        d.forEach(item => {
                            date.push(item.date)
                            totalCount.push(item.totalCount)
                            useTool.push(item.useTool)
                        })
                        this.toolData = [date, totalCount, useTool]
                    }
                    this.trend()
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.data-statistics {
  // height:100%;
  padding: 1vh;
  background: radial-gradient(rgba(11, 68, 147, 1), rgba(15, 34, 66, 1));
  border: 1px solid rgba(151, 151, 151, 1);
  .header-part {
    height: 8vh;
    background: url(~@/assets/system_images/test.png) no-repeat center center;
  }
  .tips-part {
    margin-top: 1vh;
    height: 9vh;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(79, 180, 244, 1);
    .tips-content {
      padding: 1.5vh;
      height: 100%;
      width: 50%;
      .tips-item {
        height: 100%;
        width: 20%;
        text-align: center;
        .title {
          font-size: 1.5vh;
          color: rgba(232, 232, 232, 0.85);
        }
        .content {
          font-size: 2.5vh;
          margin-top: 1.5vh;
          color: #53b1ff;
        }
      }
    }
    .tips-content:before {
      content: '';
      position: absolute;
      width: 1px;
      left: 50%;
      top: 30%;
      height: 40%;
      bottom: 0;
      background-color: #696969;
    }
  }
  .charts-part {
    margin-top: 1vh;
    .charts-content {
      width: 26%;
      .charts-item {
        height: 25.6vh;
        margin-bottom: 0.5vh;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(79, 180, 244, 1);
        .charts-title {
          height: 4.6vh;
          padding: 1vh 0 1vh 1vh;
          color: rgba(0, 160, 255, 1);
          font-size: 2vh;
        }
        .charts {
          height: 21vh;
          .describe-label {
            padding-left: 1vh;
            color: rgba(232, 232, 232, 0.8);
            font-size: 1.6vh;
            line-height: 1.5vh;
            height: 1.5vh;
            margin: 1vh 0;
            width: 38%;
          }
          .describe-value {
            margin: 1vh 0;
            height: 1.5vh;
            line-height: 1.5vh;
            width: 62%;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.data-statistics {
  .el-progress-bar {
    margin-bottom: 1vh !important;
    .el-progress-bar__outer {
      height: 1.5vh !important;
      margin-bottom: 2vh !important;
    }
    .el-progress-bar__inner {
      background: linear-gradient(270deg, rgba(0, 196, 255, 1) 0%, rgba(0, 145, 255, 1) 100%);
    }
    .el-progress-bar__outer {
      background-color: rgba(59, 81, 118, 1);
    }
  }
  .el-progress__text {
    margin-top: -3vh !important;
    color: rgba(0, 145, 255, 1);
  }
  .amap-container {
    background: none !important;
  }
  #area {
    background: none !important;
  }
}
</style>
