<template>
  <el-dialog center :title="title" :visible.sync="visible" :width="width">
    <div class="main">
      <direct-search ref="form" v-if="quickSearchlist.length > 0" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="quickSearchlist" @handleSearch="handleSearch" />
      <el-scrollbar class="card-list" :style="{height:scrollHeight}">
        <el-row :gutter="20">
          <template v-if="dataList.length > 0">
            <el-col :span="elList.spanCol?elList.spanCol:6" v-for="(item,index) in dataList" :key="index">
              <div class="card-item" @click="handleQuickClick(item)">
                <img :src="item.avatar" width="140" height="140" alt="AVATAR">
                <span v-for="span in elList.list" :key="span.value">
                  {{span.formatter?span.formatter(item):item[span.value]}}
                </span>
              </div>
            </el-col>
          </template>
          <el-col v-else class="list-empty"> {{emptyTxt}} </el-col>
        </el-row>
      </el-scrollbar>
    </div>
    <div slot="footer" v-if="pageSize">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="pageSizes" :page-size="pageSize" :current-page="pageIndex" :total="total" layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import directSearch from '@/components/FormComponents/directSearch'
import { paramAvatar } from '@/utils'
export default {
    name: 'quick-click',
    components: {
        directSearch
    },
    data() {
        return {
            visible: false,
            total: 0,
            pageIndex: 1,
            pageSize: 12,
            pageSizes: [12, 24, 36, 48],
            dataList: []
        }
    },
    props: {
        title: {
            type: String,
            default: '系统提示'
        },
        width: {
            type: String,
            default: '365px'
        },
        scrollHeight: {
            type: String,
            default: '478px'
        },
        btnCancel: {
            type: Boolean,
            default: true
        },
        quickSearchlist: {
            type: Array
        },
        elList: {
            type: Object,
            required: true
        },
        getData: {
            type: Function
        },
        params: {
            type: Object,
            default: {}
        },
        emptyTxt: {
            type: String,
            default: '暂无数据'
        }
    },
    methods: {
        open() {
            this.visible = true
        },

        close() {
            this.visible = false
        },

        handleSearch(form) {
            const params = Object.assign(this.params, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            this.getData(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const total = d.total ? d.total || 0 : d.totalRecord || 0
                    const records = total > 0 ? (d.total ? d.records : d.list) : []
                    this.total = total
                    if (records.length > 0) {
                        const filePrifix = this.$store.getters.basic.filePrifix
                        records.map(item => {
                            item.avatar = item.headImg
                                ? filePrifix + item.headImg
                                : paramAvatar(item.sex, item.birthday)
                        })
                    }
                    this.dataList = records
                }
            })
        },

        // 跳转页码
        handleCurrentChange(val) {
            this.pageIndex = val
            this.handleSearch()
        },

        // 切换页面显示条数
        handleSizeChange(val) {
            this.pageSize = val
            this.handleSearch()
        },

        // 快速点击
        handleQuickClick(item) {
            this.$emit('quickClick', item)
        }
    },
    watch: {
        visible() {
            if (this.visible) {
                this.pageIndex = 1
                this.handleSearch()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.card-list {
  .card-item {
    border-radius: 3px;
    background-color: #fff;
    cursor: pointer;
    border: 1px solid #ddd;
    padding: 5px;
    margin-bottom: 20px;
    min-height: 218px;
    span {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 18px;
    }
    img {
      object-fit:cover;
    }
  }
  .list-empty {
    text-align: center;
  }
}
</style>
