<template>
    <div class="dashboard-editor-container">
        <el-row :gutter="20">

            <el-col :sm="24" :md="24" :lg="10">
                <div class="todayCount">
                    <el-row>
                        <el-col :span="6">
                            <p>
                                <count-to :start-val="0" :end-val="counts.newPatientCount" class="card-panel-num" :duration="3600" />
                            </p>
                            <span>新增患者</span>
                        </el-col>
                        <el-col :span="6">
                            <p>
                                <count-to :start-val="0" :end-val="counts.appointmentCount" class="card-panel-num" :duration="3600" />
                            </p>
                            <span>今日新增预约</span>
                        </el-col>

                        <el-col :span="6">
                            <p>
                                <count-to :start-val="0" :end-val="counts.receptionCount" class="card-panel-num" :duration="2800" />
                            </p>
                            <span>今日就诊</span>
                        </el-col>
                        <el-col :span="6">
                            <p>
                                <count-to :start-val="0" :end-val="counts.inComeSum" class="card-panel-num" :duration="2800" :decimals="2" />
                            </p>
                            <span>今日实收</span>
                        </el-col>
                    </el-row>

                </div>
            </el-col>

            <el-col :lg="7" :md="12" :sm="24">
                <p>诊所运营趋势</p>
                <line-chart :settings="chartSettings" height="350px" />
            </el-col>

            <el-col :lg="7" :md="12" :sm="24">
                <p>低库存预警</p>
                <bar-chart :extend="extend" v-if="isShow" height="350px" @isShow="handleShow" />
                <div v-else style="height: 300px;line-height: 100px;text-align: center;font-size: 15px;">暂无数据</div>
            </el-col>

        </el-row>
        <el-row :gutter="20" class="bottom">

            <el-col :md="24" :lg="17">
                <p>今日就诊</p>
                <el-table-self :columns="visitColumns" :table-data="visitList" />
            </el-col>

            <el-col :md="24" :lg="7">
                <p>
                    <span>
                        公告栏
                    </span>
                    <span style="float:right;color:#0087ff;font-size:15px;cursor:pointer" @click="viewMoreTips">
                        更多 <i class="el-icon-arrow-right" />
                    </span>
                </p>
                <div class="gonggao">
                    <template v-if="noticeObj.title">
                        <span style="text-align:center;font-weight:700">
                            {{ noticeObj.title }}
                        </span>
                        <span style="text-align:center;color:#999;font-size:13px;">
                            发布日期：{{ noticeObj.updateTime }}
                            发布人：{{ noticeObj.name }}
                        </span>

                        <span style=" max-height: 200px;min-height: 100px;overflow-y: auto;">
                            {{ noticeObj.details }}
                        </span>

                        <span class="bottom-content">
                            <template v-for="(item,index) in noticeObj.attachmentDTOList">
                                <span :key="index" class="file-item">
                                    {{ item.fileName }}
                                    <img src="@/assets/system_images/download.png" alt="" @click.stop="viewFile(item)">
                                </span>
                            </template>
                        </span>
                    </template>
                    <template v-else>
                        <div class="gonggao">
                            <img :src="nomessage" alt="">
                        </div>
                    </template>
                </div>
                <dialog-image ref="preview" :title="title" :img-url="imgUrl" />
            </el-col>

        </el-row>
    </div>
</template>

<script>
import LineChart from './components/LineChart'
import dialogImage from '@/components/DialogComponents/Image'
import BarChart from './components/BarChart'
import elTableSelf from '@/components/TabComponents/index'
import CountTo from 'vue-count-to'
import { getRegisterList, getNowCount } from '@/api/arclinic'
import nomessage from '@/assets/icon_images/nomessage.png'
import { formatSex, getBabyAge, formatPatientStatus } from '@/utils'
import { getSysInfosList } from '@/api/upms'
export default {
    name: 'DashboardAdmin',
    components: {
        LineChart,
        BarChart,
        dialogImage,
        elTableSelf,
        CountTo
    },
    data() {
        return {
            nomessage,
            imgUrl: '',
            title: '',
            noticeObj: {},
            visitColumns: [
                {
                    value: 'createTime',
                    label: '登记时间',
                    align: 'center'
                },
                {
                    value: 'name',
                    label: '姓名',
                    align: 'center'
                },
                {
                    value: 'age',
                    label: '年龄',
                    align: 'center'
                },
                {
                    value: 'deptName',
                    label: '就诊类型',
                    align: 'center'
                },
                {
                    value: 'doctorName',
                    label: '医生',
                    align: 'center'
                },
                {
                    value: 'patientStatus',
                    label: '就诊状态',
                    align: 'center'
                }
            ],
            visitList: [],
            chartSettings: {},
            extend: {
                'xAxis.0.axisLabel.rotate': 45
            },
            pageIndex: 1,
            pageSize: 12,
            filePrifix: this.$store.getters.basic.filePrifix,
            counts: {
                newPatientCount: 0,
                appointmentCount: 0,
                inComeSum: 0,
                receptionCount: 0
            },
            isShow: true
        }
    },
    mounted() {
        this.getNowCount()
        this.handleSearch()
        this.getDictData()
        this.getSysInfosList()

    // this.handleFresh()
    },
    methods: {
    // 登记记录查询
        handleSearch(form) {
            const params = Object.assign({}, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            getRegisterList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    let result = []
                    let total = 0
                    this._.forEach(d.records, function(item) {
                        item.sex = formatSex(item.sex)
                        item.age = getBabyAge(item.birthDate)
                        item.patientStatus = formatPatientStatus(item.patientStatus)
                    })
                    result = d.records
                    total = d.total
                    this.visitList = result
                    this.total = total
                }
            })
        },
        getDictData() {
            var temp_data = this.$store.state.dict.dictMap
            for (var a in temp_data) {
                if (temp_data[a].length === 0) {
                    this.$store.dispatch('getDictByIdListData', a)
                }
            }
        },
        // 获取系统通知列表
        getSysInfosList() {
            const data = { versions: null }
            getSysInfosList(data).then(res => {
                if (res.STATUS == '1') {
                    if (res.ITEMS.notice && res.ITEMS.notice.length > 0) {
                        this.noticeObj = res.ITEMS.notice[0]
                    }
                }
            })
        },

        // 查看更多公告
        viewMoreTips() {
            this.$router.push({
                name: 'tipsManange',
                params: {
                    id: 0,
                    type: 0
                }
            })
        },

        // 预览文件
        viewFile(file) {
            if (file.fileName.match(/\.(png|jpg|jpeg)/)) {
                this.title = file.fileName
                this.imgUrl = this.filePrifix + file.filePath
                this.$refs.preview.open()
            } else {
                const elink = document.createElement('a')
                elink.download = file.fileName
                elink.style.display = 'none'
                elink.href = this.filePrifix + file.filePath
                document.body.appendChild(elink)
                elink.click()
                URL.revokeObjectURL(elink.href) // 释放URL 对象
                document.body.removeChild(elink)
            }
        },

        // 获取今日统计
        getNowCount() {
            getNowCount().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.counts = d
                }
            })
        },

        handleShow(bool) {
            this.isShow = bool
        }

    // // 更新参数模板
    // handleFresh() {
    //     freshParams().then(res => {})
    // }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
.el-col {
  margin-top: 20px;
}
.todayCount {
  border: 1px solid #ccc;
  height: 300px;
  .el-col {
    text-align: center;
    margin: 0;
    p {
      span {
        font-size: 25px;
        line-height: 180px;
        height: 150px;
        color: #0087ff;
        font-weight: bold;
      }
    }
    span {
      display: block;
      font-size: 16px;
      height: 150px;
      line-height: 120px;
    }
  }
}
.bottom {
  margin-top: 20px;
  .el-table-self {
    margin-top: 20px;
    margin-left: 0;
    margin-right: 0;
  }
  .gonggao {
    border: 1px solid #ebeef5;
    margin-top: 20px;
    padding: 10px;
    min-height: 240px;
    display: block;
    > span {
      display: block;
      width: 100%;
      &:not(:last-child) {
        margin: 10px 0;
      }
      &:last-child {
        line-height: 24px;
        font: 15px/30px 'Microsoft Yahei';
        color: #404040;
        word-wrap: break-word; // 只对英文起作用，以单词作为换行依据。
        text-align: justify; //css英文语句的两端对齐：
        text-justify: inter-ideograph;
      }
    }

    .bottom-content {
      font-weight: 700;
      border-top: 1px solid #ebeef5;
      padding: 10px 0;
      .file-item {
        height: 30px;
        line-height: 30px;
        img {
          cursor: pointer;
          margin-bottom: -5px;
          width: 20px;
          height: 20px;
        }
      }
    }
    .gonggao {
      border: 1px solid #ebeef5;
      margin-top: 20px;
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
