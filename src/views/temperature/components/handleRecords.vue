<template>
  <el-row class="page-main">
    <div class="page-content">
      <span class="title">
        干预记录
        <el-button
          icon="el-icon-arrow-left"
          style="float:right; margin-top: 7px;"
          @click.native="back"
        >返回</el-button>
      </span>
      <el-row>
        <el-col class="first-content">
          <el-col style="width:120px;">
            <img
              width="70"
              style="border-radius:50%"
              height="70"
              src="@/assets/icon_images/child-avatar.png"
              alt
            />
          </el-col>
          <el-col class="first-content-item">
            <el-col class="content">姓名：{{  tempInfo.userName }}</el-col>
            <el-col class="describe">性别：{{  formatSex(tempInfo.sex) }}</el-col>
          </el-col>
          <el-col class="first-content-item">
            <el-col class="content">年&ensp;&ensp;&ensp;&ensp;龄：{{  getBabyAge(tempInfo.birthDate) }}</el-col>  
            <el-col class="describe">用户手机号：{{  tempInfo.userPhone?tempInfo.userPhone:"-" }} </el-col>  
          </el-col>
          <el-col class="first-content-item">  
            <el-col class="content">医生联系方式：{{  tempInfo.doctorPhone?tempInfo.doctorPhone:"-" }}</el-col>
            <el-col class="describe" style="width:200%">用户类别：{{  tempInfo.packType }}</el-col>
          </el-col>
          <el-col class="first-content-item">
            <el-col class="content">签约医生：{{  tempInfo.doctorName?tempInfo.doctorName:"-" }} </el-col>
            <el-col class="describe"></el-col>
          </el-col>
        </el-col>
        <el-col style="margin-top:15px">
          <el-table-self :list-loading="listLoading" :table-data="tabData" :columns="tabColumns" />
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script>
import elTableSelf from '@/components/TabComponents/index'
import { tempinterventionList, tempPatientInfo } from '@/api/arclinic'
import paginationMixin from '@/components/TabComponents/mixin'
import { formatSex, getBabyAge } from '@/utils'
export default {
    components: {
        elTableSelf
    },
    props: ['patientId'],
    mixins: [paginationMixin],
    data() {
        return {
            formatSex,
            getBabyAge,
            tabData: [],
            tempInfo: {
                userName: '',
                sex: '',
                packType: '',
                birthDate: '',
                userPhone: '',
                doctorName: '',
                doctorPhone: ''
            },
            listLoading: false,
            total: 0,
            tabColumns: [
                {
                    value: 'createTime',
                    width: 140,
                    label: '干预时间'
                },
                {
                    value: 'createUserName',
                    width: 100,
                    label: '处理人'
                },
                {
                    value: 'method',
                    width: 100,
                    label: '处理方式',
                    formatter(row) {
                        return row.method == '1' ? '持续关注' : row.method == '2' ? '电话回复' : row.method == '3' ? '短信回复' : ''
                    }
                },
                {
                    value: 'dispose',
                    label: '处理描述'
                }
            ]
        }
    },

    watch: {},
    methods: {
    // 查询列表
        handleSearch(form) {
            this.listLoading = true
            const params = {}
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            params.patientId = this.patientId

            // 调用接口
            tempinterventionList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.tabData = d.records
                    this.total = d.total
                }
                this.listLoading = false
            })

            const data = { patientId: this.patientId }
            tempPatientInfo(data).then(res => {
                if (res && res.STATUS == '1') {
                    this.tempInfo = res.ITEMS
                }
            })
        },
        back() {
            this.$emit('back', true)
        }
    },
    mounted() {
        this.handleSearch()
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
  margin-bottom: 20px;
  line-height: 50px;
}

.first-content {
  padding: 10px 0;
  padding: 5px 15px;
  .first-content-item {
    width: 20%;
    font-size: 14px;
    text-align: left;
    .content {
      margin: 12px 0;
      text-align: left;
    }
    .describe {
      text-align: left;
    }
  }
}
</style>