<template>
  <el-row class="page-container">
    <el-row class="page-main">
      <el-button type="primary" @click="handleLeadOut">导出</el-button>
      <direct-search ref="form" :label-position="'right'" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="searchList" @handleSearch="handleFormSearch" />
      <el-table-self  :columns="columns" :current-page="pageIndex" :table-data="tableData" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
    </el-row>
  </el-row>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import {pickerOptions,formatDictMap} from '@/utils'
import {getLogPage,exportLog} from '@/api/upms'
import {getCurrentDay} from '@/utils/common'
import { exportExcelCb } from '@/utils/exportExcel'
export default {
  components:{
    directSearch,
    elTableSelf
  },
  mixins:[paginationMixin],
  data(){
    const dictData = this.$store.getters.dictData
    return{
      dictData,
      searchList:[{
        type:'select',
                  label:'日志区域',
                  prop:'logArea',
                  labelWidth:'100px',
                  opts:dictData['532']
      },{
        type:'select',
                  label:'日志类型',
                  prop:'logType',
                  labelWidth:'100px',
                  opts:dictData['531']
      },{
                  type:'select',
                  label:'状态',
                  prop:'method',
                  labelWidth:'80px',
                  opts:dictData['530']
                },{
                    type: 'daterange',
                    dateType: 'datetimerange',
                    label: '',
                    prop: 'dates',
                    options: pickerOptions,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'yyyy-MM-dd HH:mm:ss'
                },],
      columns:[
        {
          label:"编号",
          value:'id',
          width:'50'
        },{
          label:'日志类型',
          value:'logType',
          width:'80px'
        },{
          label:'日志标题',
          value:"logTitle",
          width:'200'
        },{
          label:'服务ID',
          value:"serviceId",
          width:'80'
        },{
          label:'日志区域',
          value:"logArea",
          width:'80'
        },{
          label:'创建者',
          value:"createBy"
        },{
          label:'创建者账号',
          value:"createNumber",
          width:'100'
        },{
          label:'创建时间',
          value:"createTime",
          width:'150'
        },{
          label:'操作IP地址',
          value:"remoteAddr",
          width:'100'
        },{
          label:'用户代理',
          value:"userAgent",
          width:'200',
          operType:'popover'
        },{
          label:'请求URL',
          value:"requestUri",
          width:'150'
        },{
          label:'操作方式',
          value:"logMethod",
          width:'80'
        },{
          label:'操作提交的数据',
          value:"params",
          width:'120'
        },{
          label:'执行时间',
          value:"executeTime",
          width:'80',
          formatter(row){
            return `${row.executeTime}ms`
          }
        },{
          label:'删除标记',
          value:"isDeleted",
          width:'80'
        },{
          label:'异常信息',
          value:"exception",
          width:'200',
          operType:'popover'
        }
      ],
      tableData:[],
      total:0,
      cacheForm:{
         dates: [getCurrentDay().split(' ')[0]+' 00:00:00', getCurrentDay()]
      },
      exportData:{}
    }
  },
  methods:{
    handleFormSearch(form){
      this.pageIndex = 1
      this.handleSearch(form)
    },
    handleSearch(form){
      this.cacheForm = this.cacheForm || form
      const params = Object.assign(this.cacheForm,form)
      this.exportData = Object.assign(this.cacheForm,form)
      this.$refs.form.initFieldsObj(params)
      params.startTime = params.dates?params.dates[0]:''
      params.endTime = params.dates?params.dates[1]:''
      params.pageNo = this.pageIndex
      params.pageSize = this.pageSize
      const data = Object.assign({},params)
      delete data.dates
      getLogPage(data).then(res =>{
        if(res.STATUS === '1'){
          const d = res.ITEMS
          if(d.records && d.records.length > 0){
            d.records.forEach(item =>{
              item.logType = formatDictMap(this.dictData['531'],item.logType)
              item.logArea = formatDictMap(this.dictData['532'],item.logArea)
              item.logMethod = formatDictMap(this.dictData['530'],item.logMethod.toLowerCase())
            })
          }
          this.tableData = d.records
          this.total = d.total
        }
      })
    },
    handleLeadOut(){
      if (this.tableData && this.tableData.length > 0) {
                if (this.exportData.pageNo) {
                    delete this.exportData.pageNo
                    delete this.exportData.pageSize
                }
                const params = Object.assign({}, this.exportData)
                params.startDate = params.startTime
                params.endDate = params.endTime
                params.logMethod = params.method
                delete params.dates
                delete params.startTime
                delete params.endTime
                delete params.method
                exportLog(params, 'blob').then(res => {
                    exportExcelCb(res, '日志记录.xlsx')
                })
            } else {
                this.$message.error('请导出有数据的内容')
            }
    }
  },
  mounted(){
    this.handleFormSearch()
  }
}
</script>

