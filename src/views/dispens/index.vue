<template>
  <el-row class="page-container">
    <el-row class="page-main" v-show="showIndex">
      <el-tabs v-model="activeName" @tab-click="handleSwitch" type="card">
        <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :label="tab.label">
          <el-row class="toolbar">
            <el-radio-group v-model="listType">
              <el-radio-button label="0">
                <i class="el-icon-tickets"></i>&ensp;列表
              </el-radio-button>
              <el-radio-button label="1">
                <i class="el-icon-picture"></i>&ensp;卡片
              </el-radio-button>
            </el-radio-group>
          </el-row>
          <direct-search ref="form" :label-position=" 'right' " :form-style="{ 'text-align': 'right', 'margin-bottom': '10px'} " :forms="recordSearchList " @handleSearch="handleFormSearch " />
          <panel-card v-if="listType === '1'" :current-page="pageIndex" :panel-ellist="recordElList" :panel-list="recordList" :total-count="totalCount" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />

          <el-table-self v-else :list-loading="listLoading" :current-page="pageIndex" :columns="columns" :table-data="recordList" :total-count="totalCount" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />

        </el-tab-pane>
      </el-tabs>
    </el-row>
    <transition name="fade ">
      <router-view></router-view>
    </transition>
  </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import panelCard from '@/components/Panel/PanelCard'
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import { dispensList, refundList } from '@/api/pharmacy'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { formatSex, pickerOptions } from '@/utils'
export default {
  components: {
    directSearch,
    panelCard,
    elTableSelf
  },
  mixins: [paginationMixin],
  data() {
    const refundProcess = this.commonUtil.getConfigValue('refundProcess')
    const isChargeAndDis = this.commonUtil.getConfigValue('isChargeAndDis')
    return {
      listLoading: false,
      totalCount: 0,
      listType: '1',
      unknownAvatar,
      showIndex: true,
      activeName: 0,
      tabMapOpts: [
        { label: '待发药', name: 0 },
        { label: '已发药', name: 1 },
        { label: '已退药', name: 2 }
      ],
      recordSearchList: [
        {
          type: 'daterange',
          label: '开方时间',
          prop: 'dates',
          placeholder: '开方时间',
          options: pickerOptions,
          dateType: 'datetimerange',
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          type: 'input',
          label: '',
          prop: 'patientName',
          placeholder: '患者姓名',
          slot: {
            slot: 'append',
            type: 'button',
            icon: 'el-icon-search'
          }
        }
      ],
      columns: [
        {
          label: '姓名',
          value: 'patientName'
        },
        {
          label: '性别',
          value: 'sex'
        },
        {
          label: '用户类型',
          value: 'commercialInsuranceType'
        },
        {
          label: '就诊状态',
          value: 'ynDiagnose',
          formatter(row) {
            return row.ynDiagnose === 0 ? '复诊' : '初诊'
          }
        },
        {
          label: '开方时间',
          formatter(row) {
            return row.disStatus === 0
              ? row.prescribingTime
                ? row.prescribingTime.split('.')[0]
                : ''
              : row.disStatus === 2
              ? row.refundTime
              : row.disTime
          }
        },
        {
          label: '操作',
          fixed: 'right',
          align: 'center',
          width: 200,
          operType: 'button',
          operations: [
            {
              func: this.routerDetail,
              formatter(row) {
                return {
                  label: row.disStatus === 0 ? '待发药' : '已完成',
                  type: 'primary'
                }
              }
            }
          ]
        }
      ],
      // 待发药模板
      recordElList: {
        header: {
          nameValue: 'patientName',
          sexValue: 'sex',
          ageValue: 'age'
        },
        statusList: [
          {
            value: 'status',
            formatter(val) {
              if (val === -1) {
                return '已作废'
              }
              return ''
            }
          },
          {
            value: 'refundStatus',
            formatter(val) {
              if (val === 2) {
                return '申请退药'
              }
              return ''
            }
          },
          {
            value: 'deliverSourceCode',
            formatter(val) {
              if (val === 1) {
                return '快速收费'
              }
              return ''
            }
          }
        ],
        list: [
          {
            name: '用户类型',
            value: 'commercialInsuranceType'
          },
          {
            name: '',
            formatter(row) {
              return row.ynDiagnose === 0 ? '复诊' : '初诊'
            }
          },
          {
            formatterName(row) {
              return row.disStatus === 0
                ? '开方时间'
                : row.disStatus === 2
                ? '退药时间'
                : '发药时间'
            },
            formatter(row) {
              return row.disStatus === 0
                ? row.prescribingTime
                  ? row.prescribingTime.split('.')[0]
                  : ''
                : row.disStatus === 2
                ? row.refundTime
                : isChargeAndDis === '0'
                ? row.disTime
                : row.chargeTime
            }
          }
        ],
        btnlist: [
          {
            formatter(row) {
              if (row.disStatus === 0) {
                return `待发药`
              } else {
                return `已完成`
              }
            },
            func: this.routerDetail
          },
          {
            func: this.routerRefund,
            name: '确认退药',
            isHidden(row) {
              return refundProcess && refundProcess !== '4' && refundProcess !== '1'
                ? row.refundStatus !== 2
                : true
            }
          },
          {
            func: this.routerRefund,
            name: '申请退药',
            isHidden(row) {
              return refundProcess && refundProcess === '2' ? row.deliverSourceCode !== 1 : true
            }
          }
        ]
      },
      // 待发药数据
      recordList: [],
      cacheForm: {},
      isChargeAndDis,
      cacheForm1: {}, // 代发药form
      cacheForm2: {}, // 已发药form
      cacheForm3: {}, // 已退药form
      cachePage1: 1, // 代发药页码
      cachePage2: 1, // 已发药页码
      cachePage3: 1 // 已退药页码
    }
  },
  watch: {
    $route() {
      this.routerChange()
    }
  },
  methods: {
    routerChange() {
      this.showIndex = this.$route.name === 'dispens'
      if (this.showIndex) {
        this.handleSearch()
      }
    },

    routerDetail(item) {
      const d = {
        createTime: item.createTime,
        createUserName: item.createUserName,
        depName: item.depName,
        prescribingTime:
          item.disStatus === 0
            ? item.prescribingTime
              ? item.prescribingTime.split('.0')[0]
              : ''
            : item.disStatus === 2
            ? item.refundTime
            : item.disTime
      }
      this.$router.push({
        name: 'dispensDetail',
        params: {
          id: item.id,
          patientId: item.patientId || 0,
          registerId: item.registerId || 0,
          type: this.activeName,
          data: JSON.stringify(d)
        }
      })
    },
    // 退药
    routerRefund(item) {
      const d = {
        createTime: item.createTime,
        createUserName: item.createUserName,
        depName: item.depName
      }
      this.$router.push({
        name: 'dispensDetail',
        params: {
          id: item.id,
          patientId: item.patientId || 0,
          registerId: item.registerId || 0,
          type: item.deliverSourceCode === 1 ? 'isApplyRefund' : 'applyRefund',
          data: JSON.stringify(d)
        }
      })
    },

    // 查询表单
    handleFormSearch(form) {
      // this.cachePage1 = 1
      //     this.cachePage2 = 1
      //     this.cachePage3 = 1
      this.pageIndex = 1
      this.handleSearch(form)
    },

    handleSearch(form) {
      // this.pageIndex = this.activeName === '0' ? this.cachePage1 : this.activeName === '1' ? this.cachePage2 : this.cachePage3
      // if (this.activeName === '0') {
      //     this.cacheForm1 = this.cacheForm1 || form
      //     this.cacheForm = this.cacheForm1
      // } else if (this.activeName === '1') {
      //     this.cacheForm2 = this.cacheForm2 || form
      //     this.cacheForm = this.cacheForm2
      // } else {
      //     this.cacheForm3 = this.cacheForm3 || form
      //     this.cacheForm = this.cacheForm3
      // }
      this.cacheForm = this.cacheForm || form
      const data = Object.assign(this.cacheForm, form)
      // const index = Number(this.activeName)
      // this.$refs.form[index].initforms(data)
      if (this.activeName === '1') {
        data.disStatus = '1,-1'
      } else {
        data.disStatus = this.activeName
      }

      const params = {
        pageNo: this.pageIndex,
        pageSize: this.pageSize
      }
      for (const key in data) {
        if (key === 'dates') {
          if (data[key] && data[key].length > 0) {
            params.startDate = data[key][0]
            params.endDate = data[key][1]
          }
          continue
        }
        if (data[key]) {
          params[key] = data[key]
        }
      }
      if (this.activeName === '2') {
        params.disStatus = 2
        refundList(params).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS
            let total = 0
            if (d && d.totalRecord > 0) {
              d.list.forEach(item => {
                item.sex = formatSex(item.sex)
                let ageStr = ''
                if (item.age) {
                  ageStr = item.age + '岁'
                  if (item.ageMonth) {
                    ageStr = ageStr + item.ageMonth + '月'
                  }
                  if (item.ageDay) {
                    ageStr = ageStr + item.ageDay + '天'
                  }
                }
                item.age = ageStr
                item.avatar = item.headImg
                  ? this.$store.getters.basic.filePrifix + item.headImg
                  : unknownAvatar
                item.status = item.disStatus
              })
              total = d.totalRecord
            }
            this.totalCount = total
            this.recordList = d.list
          }
        })
      } else {
        dispensList(params).then(res => {
          if (res.STATUS === '1') {
            const d = res.ITEMS
            let total = 0
            if (d && d.totalRecord > 0) {
              d.list.forEach(item => {
                item.sex = formatSex(item.sex)
                let ageStr = ''
                if (item.age) {
                  ageStr = item.age + '岁'
                  if (item.ageMonth) {
                    ageStr = ageStr + item.ageMonth + '月'
                  }
                  if (item.ageDay) {
                    ageStr = ageStr + item.ageDay + '天'
                  }
                }
                item.age = ageStr
                item.avatar = item.headImg
                  ? this.$store.getters.basic.filePrifix + item.headImg
                  : unknownAvatar
                item.status = item.disStatus
              })
              total = d.totalRecord
            }
            this.totalCount = total
            this.recordList = d.list
          }
        })
      }
    },

    // 切换pane
    handleSwitch() {
      this.pageIndex = 1
      this.cacheForm = {}
      const label =
        this.activeName === '0' ? '开方时间' : this.activeName === '1' ? '发药时间' : '退药时间'
      this.recordSearchList[0].label = label
      this.columns[4].label = label
      this.handleSearch()
      this.$refs.form.forEach((item, index) => {
        this.$refs.form[index].$refs.form.resetFields()
      })
    }

    // 跳转页码
    // handleCurrentChange(val) {
    //     if (this.activeName === '0') {
    //         this.cachePage1 = val
    //     } else if (this.activeName === '1') {
    //         this.cachePage2 = val
    //     } else {
    //         this.cachePage3 = val
    //     }
    //     this.handleSearch()
    // }
  },
  mounted() {
    this.handleSearch()
    this.routerChange()
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  line-height: 36px;
}
.tb-border {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 20px 0;
}
</style>

