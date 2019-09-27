<template>
  <el-row class="page-main">
    <div class="page-content">
      <span class="title">
        预警设置
        <el-button
          icon="el-icon-arrow-left"
          style="float:right; margin-top: 7px;"
          @click.native="back()"
        >返回</el-button>
      </span>
      <el-row class="first-content">
        <!-- <el-col class="content-item">
          体温曲线的数据分布：
          每&ensp;
          <el-input-number v-model="num" :controls="false" :min="0" :max="100"></el-input-number>&ensp;分
          <el-input-number v-model="num" :controls="false" :min="0" :max="100"></el-input-number>&ensp;次
        </el-col>
        <el-col class="note">说明：持续测量的体温值每1分钟展示多少个体温值，该数量值必须大于硬件采集体温的频次。</el-col>-->
        <el-col class="content-item">
          触发预警时间设置：
          <el-input-number v-model="min" :controls="false" :min="0" :max="100"></el-input-number>&ensp;分
          <el-input-number v-model="second" :controls="false" :min="0" :max="59"></el-input-number>&ensp;秒
        </el-col>
        <el-col class="note">说明：持续超过预警值多长时间后发出警报。</el-col>
        <el-col class="content-item">
          医生再次预警设置：
          <el-input-number v-model="differ" :controls="false" :min="0" :max="100"></el-input-number>&ensp;℃
        </el-col>
        <el-col class="note">说明：解除警报后当患者体温每增加多少度会再次提醒医生。</el-col>
      </el-row>
      <span class="title" style="border:none">预警温度及推送设置</span>
      <el-row class="second-content">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane
            v-for="(tab,index) in tabMapOpts"
            :key="index"
            :name="tab.key"
            :label="tab.label"
          >
            <el-tabs v-model="activeName2" type="card">
              <el-tab-pane
                v-for="(tab,index) in opts"
                :key="index"
                :name="tab.key"
                :label="tab.label"
              >
                <template v-for="(item,warnIndex) in thirdWarnList">
                  <el-row :key="warnIndex">
                    <el-col :style="item.title.style">
                      {{item.title.name}}
                      <el-input-number
                        v-model="settingInfo[warnIndex].temp"
                        controls-position="right"
                        :min="0"
                        :max="100"
                      ></el-input-number>℃
                    </el-col>

                    <el-col :style="item.note.style">说明：触发该温度系统自动提醒家长。</el-col>

                    <el-col style="margin:10px 0;color:#000000">{{item.advice}}</el-col>
                    <el-col style="margin:10px 0;">
                      {{item.msg}}
                      <font style="color:#999">
                        （系统自动发送给<font style="color:red">&ensp;家长&ensp;</font>的短信、微信）
                      </font>
                    </el-col>

                    <el-col>
                      <el-input
                        type="textarea"
                        :autosize="{ minRows: 6, maxRows: 4}"
                        placeholder="请输入护理建议"
                        v-model="settingInfo[warnIndex].note"
                      ></el-input>
                    </el-col>


                    <el-col v-if="warnIndex == 2">
                         <el-col style="margin:10px 0;">
                        三级预警短信/APP通知内容编辑
                        <font style="color:#999">
                          （系统自动发送给<font style="color:red">&ensp;签约医生&ensp;</font>的短信、微信）
                        </font>
                      </el-col>

                      <el-col>
                        <el-input type="textarea"
                          :autosize="{ minRows: 6, maxRows: 4}"
                          placeholder="请输入内容"
                          v-model="settingInfo[warnIndex].message"
                        ></el-input>
                    </el-col>
                    </el-col>
                  </el-row>
                </template>
                <el-row class="btn">
                  <el-button size="small" type="primary" @click="saveSetting">保存</el-button>
                </el-row>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </div>
  </el-row>
</template>

<script>
import { tempsettingList, saveTempsetting } from '@/api/arclinic'
export default {
    data() {
        return {
            initInfo: [
                { temp: 38.5, note: '', level: 1, message: null },
                { temp: 39.5, note: '', level: 2, message: null },
                { temp: 40.5, note: '', level: 3, message: null }
            ],
            settingInfo: [{ temp: '' }, { temp: '' }, { temp: '' }],
            differ: 0,
            min: 0,
            second: 0,
            num: 0,
            thirdWarnList: [
                {
                    title: {
                        name: '一级（黄色）预警温度：',
                        style: 'padding-left:10px; border-left:3px solid #F7B500;'
                    },
                    note: { style: 'margin:10px 0;color:#F7B500' },
                    advice: '一级预警护理建议推送',
                    msg: '一级预警短信/微信内容编辑'
                },
                {
                    title: {
                        name: '二级（橙色）预警温度：',
                        style:
              'padding-left:10px; border-left:3px solid #FA6400;margin:10px 0;'
                    },
                    note: { style: 'margin:10px 0;color:#FA6400' },
                    advice: '二级预警护理建议推送',
                    msg: '二级预警短信/微信内容编辑'
                },
                {
                    title: {
                        name: '三级（红色）预警温度：',
                        style:
              'padding-left:10px; border-left:3px solid #E02020;margin:10px 0;'
                    },
                    note: { style: 'margin:10px 0;color:#E02020' },
                    advice: '三级预警护理建议推送',
                    msg: '三级预警短信/微信内容编辑'
                }
            ],

            textarea2: '',
            activeName: '1',
            activeName2: '0',
            tabMapOpts: [
                {
                    label: '新生儿',
                    key: '1'
                },
                {
                    label: '1-3月龄',
                    key: '2'
                },
                {
                    label: '大于3月龄',
                    key: '3'
                }
            ],
            opts: [
                {
                    label: '无惊厥史',
                    key: '0'
                },
                {
                    label: '有惊厥史',
                    key: '1'
                }
            ]
        }
    },
    watch: {
        activeName(val, oldVal) {
            this.handSearch()
        },
        activeName2(val, oldVal) {
            this.handSearch()
        }
    },
    methods: {
    // 返回
        back() {
            this.$emit('back', true)
        },
        // 查询
        handSearch() {
            const data = { age: this.activeName, isConvulsions: this.activeName2 }
            this.settingInfo = this.initInfo.concat([])
            tempsettingList(data).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    if (d.length > 0) {
                        d.forEach((item, index) => {
                            this.settingInfo.forEach((element, eleIndex) => {
                                if (item.level == element.level) {
                                    this.settingInfo.splice(eleIndex, 1, item)
                                }
                            })
                        })
                        this.differ = d[0].differ
                        this.min = parseInt(d[0].sustain / 60)
                        this.second = d[0].sustain % 60
                    } else {
                        this.settingInfo = this.initInfo.concat([])
                        this.differ = 0
                        this.second = 0
                        this.min = 0
                    }
                }
            })
        },

        // 保存
        saveSetting() {
            const data = {
                sustain: this.min * 60 + this.second,
                differ: this.differ
            }
            this.settingInfo.forEach(item => {
                item.age = this.activeName
                item.isConvulsions = this.activeName2
            })
            data.settingList = this.settingInfo
            const params = []
            params.push(data)
            saveTempsetting(params).then(res => {
                if (res.STATUS == '1') {
                    this.$message.success('保存成功！')
                }
            })
        }
    },
    mounted() {
        this.handSearch()
    }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  margin-left: 16px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  line-height: 50px;
}
.first-content .el-input-number--small {
  width: 50px !important;
  line-height: 30px;
}
.second-content {
  font-size: 14px;
  .el-input-number--small {
    width: 100px !important;
    line-height: 30px;
  }
}
.first-content {
  border-bottom: 1px solid #e1e1e1;
  font-size: 14px;
  padding: 10px;
  .content-item {
    margin: 10px 0;
  }
  .note {
    color: #42506d;
    padding: 5px;
  }
}
.btn {
  margin: 15px 0;
  text-align: center;
}
</style>