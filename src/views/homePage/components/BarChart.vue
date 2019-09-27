<template>
  <!-- <el-row> -->
  <div :class="className" :style="{height:height,width:width}"></div>
  <!-- </el-row> -->

</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'
import { getWarning } from '@/api/pharmacy'

const animationDuration = 6000

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
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHanlder)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      const nameArr = []
      const qtyArr = []
      getWarning({ isFilter: 1 }).then(res => {
        if (res.STATUS === '1') {
          const d = res.ITEMS
          if (d && d.length > 0) {
            this.$emit('isShow', true)
            d.forEach((item, index) => {
              if (index < 4) {
                nameArr.push(item.catName)
                qtyArr.push(item.qty)
              }
            })
          } else {
            this.$emit('isShow', false)
          }
        }
        this.$nextTick(() => {
          this.chart = echarts.init(this.$el, 'macarons')

          this.chart.setOption({
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            // legend: {
            //   data: ['低库存', '高库存']
            // },
            grid: {
              // top: 10,
              left: 20,
              right: 20,
              // bottom: '3%',
              containLabel: true
            },
            xAxis: [
              {
                type: 'category',
                data: nameArr,
                axisTick: {
                  alignWithLabel: true
                },
                axisLabel: {
                  interval: 0
                  // rotate: 15
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: '盒/瓶/袋 数',
                axisTick: {
                  show: false
                }
              }
            ],
            axisLabel: {
              interval: 0,
              rotate: 40
            },
            series: [
              {
                name: '',
                type: 'bar',
                data: qtyArr,
                animationDuration,
                itemStyle: {
                  normal: {
                    // 每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function(params) {
                      var colorList = ['#c30d23', '#e83828', '#f39800', '#dae000']
                      return colorList[params.dataIndex]
                    }
                  }
                },
                show: true
              }
            ]
          })
        })
      })
    }
  }
}
</script>
