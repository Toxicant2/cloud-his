<template>
  <div class="guide" v-loading="loading">
    <div class="btn" v-if="isAdmin">
      <el-button type="plain" icon="el-icon-delete" @click="handleDel">删除</el-button>

      <el-button type="plain" @click="handleRename">重命名</el-button>
      <el-button type="primary" size="small" icon="el-icon-upload2" style="margin-left:10px" @click="handleUpload">上传</el-button>
    </div>
    <el-row :gutter="40" class="help_item" v-if="pdfLists && pdfLists.length>0">

      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in pdfLists" class="pot" :key="index">
        <template v-if="!isAdmin" style="position:relative">
          <a target="_blank" :href="item.url">
            <div>
              <img :src="`${item.filePath.split('.')[1] === 'docx'?doc:item.filePath.split('.')[1].indexOf('xls')>-1?xls:item.filePath.split('.')[1].indexOf('pdf') >-1?pdf:item.filePath.split('.')[1].indexOf('ppt') >-1?ppt:item.filePath.split('.')[1].indexOf('txt') > -1?txt:doc}`" style="width:120px;display:block;margin:20px auto" />
            </div>
            <p class="help_name">{{item.fileName}}</p>
          </a>
          <el-button type="primary" icon="el-icon-download" @click="handleDownload(item)" size="mini" style="position:absolute;right:20px;top:0">下载</el-button>
        </template>
        <template v-else>
          <div @click="handleSelect(index)">
            <img :src="`${item.filePath.split('.')[1] === 'docx'?doc:item.filePath.split('.')[1].indexOf('xlsx')>-1?xls:item.filePath.split('.')[1].indexOf('pdf') >-1?pdf:item.filePath.split('.')[1].indexOf('ppt') >-1?ppt:item.filePath.split('.')[1].indexOf('txt') > -1?txt:doc}`" style="width:120px;display:block;margin:20px auto" />
            <img src="@/assets/system_images/selected.png" class="selected" v-if="item.selected">
          </div>
          <p class="help_name">{{item.fileName}}</p>

        </template>

      </el-col>

    </el-row>
    <p style="text-align:center;color:#909399;font-size:14px" v-else>无数据</p>
    <video-dialog ref="video" :videoAddress="videoUrl"></video-dialog>
    <!-- 重命名 -->
    <dialog-form ref="dialogForm" title="重命名" :formData="formData" :labelWidth="'90px'" :width="'450px'" @handleConfirm="handleConfirm"></dialog-form>
    <input ref="fileInput" type="file" style="display:none" @change="fileChange($event)" v-if="isShow">
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
import { getHelpList, saveHelp, uploadFile, deleteAttach, downloadZip } from '@/api/upload'
import { exportExcelCb } from '@/utils/exportExcel'
import doc from '@/assets/system_images/doc-01.png'
import xls from '@/assets/system_images/xls-01.png'
import ppt from '@/assets/system_images/ppt-01.png'
import txt from '@/assets/system_images/txt-01.png'
import pdf from '@/assets/system_images/pdf-01.png'
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
            doc,
            xls,
            ppt,
            txt,
            pdf,
            pdfLists: [],
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
            totalCount: 0,
            files: [],
            loading: false,
            isShow: false
        }
    },
    methods: {
        openDialog(video) {
            this.videoUrl = video
            this.$refs.video.open()
        },
        handleFormSearch() {
            this.pageIndex = 1
            this.handleSearch()
        },
        // 查询
        handleSearch(form) {
            this.loading = true
            const data = {
                businessType: 98,
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
                    this.pdfLists = d
                    this.totalCount = res.ITEMS.total
                }
            })
        },
        // 选择
        handleSelect(index) {
            // this.pdfLists[index].selected = !this.pdfLists[index].selected
            this.files = []
            this.pdfLists[index].selected = !this.pdfLists[index].selected
            this.pdfLists.forEach(item => {
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
                if (this.files.length > 1) {
                    this.$message.warning('最多只能选择一个文件')
                } else {
                    this.$refs.dialogForm.open()
                    this.$nextTick(() => {
                        const params = {
                            fileName: this.files[0].fileName.split('.')[0]
                        }
                        this.$refs.dialogForm.initforms(params)
                    })
                }
            } else {
                this.$message.warning('请先选择文件')
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
        handleDownload(item) {
            this.loading = true
            const ids = [item.id]
            downloadZip('blob', ids).then(res => {
                this.loading = false
                exportExcelCb(res, `${item.fileName}.${item.filePath.split('.')[1]}`)
            })
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
            var formData = new FormData()
            if (files[0].type.indexOf('image') > -1) {
                this.$message.warning('不可以上传图片')
                return false
            }
            if (files[0].type.indexOf('video') > -1) {
                this.$message.warning('不可以上传视频')
                return false
            }
            formData.append('fileType', 98)
            formData.append('file', files[0])
            this.loading = true
            uploadFile(formData)
                .then(res => {
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
                .catch(() => {
                    this.loading = false
                })
            this.isShow = false
        },

        // 删除
        handleDel() {
            if (this.files && this.files.length > 0) {
                this.$confirm(`确定移除选中的手册吗？`, '删除确认')
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
                this.$message.warning('请先选择手册')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.guide {
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
      div {
        background: #f2f2f2;
        overflow: hidden;
      }
    }
    // .help_pdf{
    //     text-align: center;
    // }
  }
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