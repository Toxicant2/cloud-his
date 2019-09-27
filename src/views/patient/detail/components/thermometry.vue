<template>
    <div class="thermometry">
        <el-row :gutter="20">
            <el-col :sm="24" :md="7">
                <el-card :style="{height:`${height}px`}" class="patient-list">
                    <!-- <el-select v-model="value" placeholder="测温人员">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>-->
                    <el-scrollbar :style="{height:`${height - 80}px`}">
                        <template v-for="(item,index) in tempList">
                            <a :class="{'is-active':activeId === item.id}" href="javascript:void(0);" :key="index" @click="clickItem(item)">
                                <el-col class="left-info">
                                    <el-col class="time">{{ item.startTime }}</el-col>
                                    <el-col class="info">最高体温：{{ item.maxTemp }} 测试时长：{{ item.duration }}</el-col>
                                </el-col>
                            </a>
                        </template>
                    </el-scrollbar>
                </el-card>
            </el-col>
            <el-col :sm="24" :md="17">
                <el-col class="first-content">
                    <el-col class="first-content-item">
                        <el-col class="content">{{ tempInfo.site }}</el-col>
                        <el-col class="describe">测试部位</el-col>
                    </el-col>
                    <el-col class="first-content-item">
                        <el-col class="content">{{ tempInfo.startTime }}</el-col>
                        <el-col class="describe">测试开始时间</el-col>
                    </el-col>
                    <el-col class="first-content-item">
                        <el-col class="content">{{ tempInfo.duration }}</el-col>
                        <el-col class="describe">测试用时</el-col>
                    </el-col>
                    <el-col class="first-content-item">
                        <el-col class="content">{{ tempInfo.maxTemp }}</el-col>
                        <el-col class="describe">最高温度</el-col>
                    </el-col>
                </el-col>
                <el-col class="second-content">
                    <el-checkbox v-model="effectiveFlag">仅显示有效数据</el-checkbox>
                    <div id="container" style="height: 300px;width:100%;"/>
                </el-col>
                <el-col class="third-content">
                    预警时长：
                    <template v-for="(item,index) in warnList">
                        <el-col :key="index">
                            {{ item.name }}
                            <span :style="item.style">
                                <template v-if="index == 0">
                                    {{ tempInfo.levelOneStr }}
                                </template>
                                <template v-if="index == 1">
                                    {{ tempInfo.leveltwoStr }}
                                </template>
                                <template v-if="index == 2">
                                    {{ tempInfo.levelThreeStr }}
                                </template>
                            </span>
                        </el-col>
                    </template>
                </el-col>
                <el-col class="third-content">
                    事件记录：
                    <template v-if="activities&&activities.length>0">
                        <template v-for="(item,index) in activities">
                            <el-col :key="index">
                                <div class="content">
                                    <template v-if="item.type == 1 && item.pillsList.length>0">
                                        {{ item.name }}：
                                        <template v-for="(itemObj,indexObj) in item.pillsList">
                                            <el-col :key="indexObj" style="margin:5px 0;margin-left:10%">
                                                {{ itemObj.value }}、{{ itemObj.time }}
                                            </el-col>
                                        </template>
                                    </template>
                                    <template v-else>
                                        {{ item.name }}：
                                        <el-col :key="indexObj" style="margin:5px 0;margin-left:10%">
                                            {{ item.value }}
                                        </el-col>
                                    </template>
                                </div>
                            </el-col>
                        </template>
                    </template>
                    <template v-else>
                        <el-col>
                            暂无事件记录
                        </el-col>
                    </template>
                </el-col>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { reportList, getTempinfo, getTempevent } from '@/api/arclinic'
import echarts from 'echarts'
export default {
    props: ['patientId'],
    data() {
        return {
            effectiveFlag: true,
            id: null,
            activeId: '',
            warnList: [
                { name: '超过一级预警(38.5℃)温度时长：', style: 'color:#F7B500', value: '00:00:00' },
                { name: '超过二级预警(39.5℃)温度时长：', style: 'color:#FF6E02', value: '00:00:00' },
                { name: '超过三级预警(40.5℃)温度时长：', style: 'color:#E02020', value: '00:00:00' }
            ],
            options: [],
            dataList: [],
            value: '',
            height: '',
            tempInfo: {},
            tempList: [],
            activities: []
        }
    },
    watch: {
        effectiveFlag() {
            this.getTempinfo()
        }
    },
  created() {
    const offsetHeight = document.body.offsetHeight
    this.height = offsetHeight
  },
  methods: {
    handleSearch() {
      const data = { id: this.patientId }
      reportList(data).then(res => {
        if (res.STATUS == '1') {
          this.tempList = res.ITEMS
          if (this.tempList.length > 0) {
            this.activeId = this.tempList[0].id
            this.tempInfo = this.tempList[0]
            this.tempInfo.levelOneStr = this.convertTime(this.tempInfo.levelOneTime)
            this.tempInfo.leveltwoStr = this.convertTime(this.tempInfo.levelTwoTime)
            this.tempInfo.levelThreeStr = this.convertTime(this.tempInfo.levelThreeTime)
            this.getTempinfo(this.activeId)
          }
        }
      })
    },
    convertTime(time) {
      return time
        ? (parseInt(time / 60) ? parseInt(time / 60) + '分' : '') + parseInt(time % 60) + '秒'
        : '暂无'
    },
    clickItem(row) {
      this.activeId = row.id
      this.tempInfo = row
      this.tempInfo.levelOneStr = this.convertTime(this.tempInfo.levelOneTime)
      this.tempInfo.leveltwoStr = this.convertTime(this.tempInfo.levelTwoTime)
      this.tempInfo.levelThreeStr = this.convertTime(this.tempInfo.levelThreeTime)
      this.getTempinfo(row.id)
    },

    getTempinfo(id) {
      this.id = id || this.id
      if (this.id) {
        const data = { id: this.id, effectiveFlag: this.effectiveFlag }
        getTempinfo(data).then(res => {
          if (res.STATUS == '1') {
            this.$nextTick(function() {
              const d = res.ITEMS.timeList
              const xdata = []
              const ydata = []
              if (d && d.length > 0) {
                d.forEach(item => {
                  xdata.push(item.time)
                  ydata.push(item.temp)
                })
              }
              this.drawLineChart(xdata, ydata)
            })
          }
        })

        getTempevent(data).then(res => {
          if (res.STATUS == '1') {
            this.activities = res.ITEMS
          }
        })
      }
    },
    drawLineChart(xdata, ydata) {
      var dom = document.getElementById('container')
      var myChart = echarts.init(dom)
      var app = {}
      let option = null
      option = {
        dimension: ['体温'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },

        legend: {
          data: ['时间']
        },
        xAxis: {
          name: '时间',
          boundaryGap: false,
          type: 'category',
          data: xdata
        },
        yAxis: {
          name: '体温(℃)',
          type: 'value',
          min: 32
        },
        series: [
          {
            name: '体温',
            smooth: true,
            symbolSize: 1,
            type: 'line',
            lineStyle: {
              normal: {
                color: '#FF7584',
                width: 2
              }
            },
            areaStyle: { color: '#FF7584' },
            data: ydata
          }
        ]
      }
      myChart.setOption(option, true)
      window.onresize = myChart.resize
    }
  },
    mounted() {}
}
</script>

<style lang="scss" scoped>
.thermometry {
  $height: 15px;
  .left-info {
    padding: 0 !important;
    margin: 5px 0;
    font-size: 14px;
    .time {
      margin: 5px 0;
      padding: 0 !important;
    }
    .info {
      margin: 5px 0;
      font-size: 13px;
      padding: 0 !important;
    }
  }
  .first-content {
    .first-content-item {
      text-align: center;
      width: 50%;
      .content {
        margin: 12px 0;
        text-align: center;
        font-size: 18px;
        color: #0091ff;
      }
      .describe {
        margin: 5px 0;
        text-align: center;
        font-size: 14px;
      }
    }
  }
  .third-content {
    .el-col {
      font-size: 14px;
      margin: 10px 0;
      margin-left: 25%;
    }
  }
  a {
    &.is-active {
      .left-info {
        background-color: rgb(222, 225, 230);
        border-radius: 2px;
      }
    }
  }
}
</style>
