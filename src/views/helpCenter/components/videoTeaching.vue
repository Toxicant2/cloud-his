<template>
  <div class="page-help" v-loading="loading">
    <div class="btn" v-if="isAdmin">
      <el-button type="plain" icon="el-icon-delete" @click="handleDel">删除</el-button>
      <!-- <el-button type="plain" icon="el-icon-download" @click="handleDownload">下载</el-button> -->
      <el-button type="plain" @click="handleRename">重命名</el-button>
      <el-button type="primary" size="small" icon="el-icon-upload2" style="margin-left:10px" @click="handleUpload">上传</el-button>
    </div>

    <el-row :gutter="40" class="help_item" v-if="videoLists && videoLists.length > 0">

      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in videoLists" :key="index" class="pot" :style="index === 4?{float: 'inherit;'}: {}">
        <template v-if="!isAdmin">
          <img :src="loginUrl" style="width:40%;cursor:pointer;" @click="openDialog(item)" />
        </template>

        <template v-else>
          <img :src="loginUrl" style="width:40%;cursor:pointer" @click="handleSelect(index)" />
          <img src="@/assets/system_images/selected.png" class="selected" v-if="item.selected">
        </template>
        <p class="help_name">{{item.fileName}}</p>
      </el-col>
    </el-row>
    <p style="text-align:center;color:#909399;font-size:14px" v-else>无数据</p>
    <video-dialog ref="video" :videoAddress="videoUrl"></video-dialog>
    <!-- 重命名 -->
    <dialog-form ref="dialogForm" title="重命名" :formData="formData" :labelWidth="'90px'" :width="'450px'" @handleConfirm="handleConfirm"></dialog-form>
    <input ref="fileInput" type="file" style="display:none" multiple @change="fileChange($event)" v-if="isShow">
    <!-- <a download="download" ref="download">下载</a> -->

    <div class="pagination-footer">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageIndex" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount"></el-pagination>
    </div>
  </div>

</template>

<script>
import paginationMixin from '@/components/TabComponents/mixin'
import videoDialog from './videoDialog'
import dialogForm from '@/components/DialogComponents/Form'
import { uploadFile, getHelpList, saveHelp, deleteAttach, downloadZip } from '@/api/upload'
import { exportExcelCb } from '@/utils/exportExcel'
import loginUrl from '@/assets/system_images/video.png'
export default {
    components: {
        videoDialog,
        dialogForm
    },
    props: {
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    mixins: [paginationMixin],
    data() {
        return {
            loginUrl,
            videoLists: [],
            files: [],
            totalCount: 0,
            videoUrl: {},
            formData: [
                {
                    type: 'input',
                    name: '重命名为',
                    field: 'fileName',
                    rules: [
                        {
                            required: true,
                            message: '名称必填',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            loading: false,
            isShow: false
        }
    },
    methods: {
    // 查询
        handleSearch() {
            this.loading = true
            const data = {
                businessType: 97,
                pageNo: this.pageIndex,
                pageSize: this.pageSize
            }
            getHelpList(data).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS.records
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.url = this.$store.getters.basic.filePrifix + item.filePath
                            item.fileName = item.fileName ? item.fileName.split('.')[0] : ''
                            item.selected = false
                        })
                    }
                    this.videoLists = d
                    this.totalCount = res.ITEMS.total
                }
            })
        },
        handleFormSearch() {
            this.pageIndex = 1
            this.handleSearch()
        },
        // 查看视频
        openDialog(video) {
            this.videoUrl = video
            this.$refs.video.open()
        },

        // 管理员选择文件
        handleSelect(index) {
            this.files = []
            this.videoLists[index].selected = !this.videoLists[index].selected
            this.videoLists.forEach(item => {
                if (item.selected) {
                    this.files.push({
                        path: item.filePath,
                        id: item.id,
                        fileName: item.fileName
                    })
                }
            })
        },

        // 重命名
        handleRename() {
            if (this.files && this.files.length > 0) {
                if (this.files.length === 1) {
                    this.$refs.dialogForm.open()
                    this.$nextTick(() => {
                        const params = {
                            fileName: this.files[0].fileName.split('.')[0]
                        }
                        this.$refs.dialogForm.initforms(params)
                    })
                } else {
                    this.$message.warning('最多只能选择一个文件')
                }
            } else {
                this.$message.warning('请先选择视频')
            }
        },
        // 重命名保存名字
        handleConfirm(form) {
            if (!form.fileName || form.fileName.trim().length === 0) {
                this.$message.warning('请输入有效的名字')
                this.$refs.dialogForm.loading = false
                return false
            }
            const data = Object.assign(this.files[0], form)
            saveHelp(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success(res.MESSAGE)
                    this.$refs.dialogForm.close()
                    this.handleSearch()
                }
            })
        },
        // 下载
        handleDownload() {
            if (this.files && this.files.length > 0) {
                this.loading = true
                const ids = []
                this.files.forEach(item => {
                    ids.push(item.id)
                })
                downloadZip('blob', ids).then(res => {
                    this.loading = false
                    exportExcelCb(res, `${this.files[0].fileName}`)
                })
            } else {
                this.$message.warning('请先选择视频')
            }
        },
        // 上传
        handleUpload() {
            this.isShow = true
            this.$nextTick(() => {
                this.$refs.fileInput.click()
            })
        },
        fileChange(e) {
            var files = e.target.files
            if (files[0].type.indexOf('video') > -1) {
                var formData = new FormData()
                formData.append('fileType', 97)
                formData.append('file', files[0])
                this.loading = true
                uploadFile(formData).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        saveHelp(d[0])
                            .then(res1 => {
                                this.loading = false
                                if (res1.STATUS === '1') {
                                    this.$message.success('上传成功')
                                    this.handleSearch()
                                }
                            })
                            .catch(() => {
                                this.loading = false
                            })
                    }
                })
                this.isShow = false
            } else {
                this.$message.warning('只能上传视频文件')
            }
        },

        // 删除
        handleDel() {
            if (this.files && this.files.length > 0) {
                this.$confirm(`确定移除选中的视频吗？`, '删除确认')
                    .then(() => {
                        this.files.forEach(item => {
                            deleteAttach(item.path, item.id ? item.id : 0).then(res => {})
                        })
                        this.$nextTick(() => {
                            this.$message.success('删除成功')
                            this.files = []
                            this.handleSearch()
                        })
                    })
                    .catch(() => {})
            } else {
                this.$message.warning('请先选择视频')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.page-help {
  padding: 20px 30px 30px;
  .btn {
    text-align: right;
    margin-bottom: 20px;
    button {
      margin: 0;
    }
  }
  .help_item {
    margin-bottom: 20px;
    .help_name {
      line-height: 28px;
      font-size: 14px;
      text-align: left;
      margin-bottom: 20px;
      svg {
        float: right;
        margin-top: 10px;
      }
    }
    .selected {
      position: absolute;
      top: 5px;
      left: 25px;
      width: 20px;
    }
    .pot {
      position: relative;
    }
    // .help_pdf{
    //     text-align: center;
    // }
  }
}
.bgImg {
  background: url(~@/assets/login_images/bgImg.png) no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100%;
}
.pagination-footer {
  .description {
    float: left;
    margin-left: 20px;
    margin-top: 12px;
    font-size: 14px;
  }
  .el-pagination {
    float: right;
    margin-top: 8px;
    margin-bottom: 8px;
  }
}
</style>