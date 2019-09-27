<template>
    <div class="upload-info">
            <el-form ref="form" :model="form" label-width="120px" :size="size" >
                <el-row>
                    <el-col :span="col.spanCount?col.spanCount:24" v-for="(col,c) in columns" :key="c">
                        <el-form-item :label="col.label?col.label+'：':''" :prop="col.prop" :rules="col.rules" :class="col.className">
                            <!-- 上传 -->
                                <div class="upload" v-if="isUpload && !justShow">
                                      <el-upload-row :file="uploadObj.file" :file-list="form.attachment" :accept="uploadObj.accept" @uploadSuccess="uploadSuccess"></el-upload-row>
                                </div>
                                  <div class="img-list" >
                                      <ul class="el-upload-list el-upload-list--picture-card">
                                          <li class="el-upload-list__item is-success" v-for="(file,fileIndex) in form.attachment"  :key="fileIndex">
                                              <template v-if="file.fileName.match(/\.(png|jpg|jpeg)/)">
                                                <img class="el-upload-list__item-thumbnail" :src="`${filePrifix}${file.filePath}`"/>
                                              </template>

                                              <template v-if="file.fileName.match(/\.(ppt|pptx)/)">
                                                <img class="el-upload-list__item-thumbnail" src="@/assets/system_images/ppt-01.png"/>
                                              </template>

                                              <template v-if="file.fileName.match(/\.(xls|xlsx)/)">
                                                <img class="el-upload-list__item-thumbnail" src="@/assets/system_images/xls-01.png"/>
                                              </template>
                                              <template v-if="file.fileName.match(/\.(doc|docx)/)">
                                                <img class="el-upload-list__item-thumbnail" src="@/assets/system_images/doc-01.png"/>
                                              </template>

                                               <template v-if="file.fileName.match(/\.(txt)/)">
                                                <img class="el-upload-list__item-thumbnail" src="@/assets/system_images/txt-01.png"/>
                                              </template>

                                              <label class="el-upload-list__item-status-label">
                                                  <i class="el-icon-upload-success el-icon-check"></i>
                                              </label>
                                              <span class="el-upload-list__item-actions">
                                                  <span class="el-upload-list__item-preview" @click="handlePreviewImage(file)">
                                                      <i class="el-icon-zoom-in"></i>
                                                  </span>

                                                  <span v-if="!justShow" class="el-upload-list__item-delete" @click="handleDeleteImage(file,fileIndex)" >
                                                      <i class="el-icon-delete"></i>
                                                  </span>

                                              </span>
                                          </li>
                                      </ul>
                                      <dialog-image ref="preview" :title="title" :img-url="imgUrl"/>
                                        <ul class="tips-list">
                                          <li class="el-upload-list__item"  v-for="(file,fileIndex) in form.attachment"  :key="fileIndex">
                                            <div style="width:146px;float:left">
                                              {{commonUtil.getFileSize(file.fileSize)}}
                                            </div>
                                            <div style="width:146px;float:left">
                                              {{file.fileName}}
                                            </div>
                                          </li>
                                        </ul>
                                  </div>

                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
    </div>
</template>

<script>
import dialogImage from '@/components/DialogComponents/Image'
import { uploadFile, deleteAttach } from '@/api/upload'

import elUploadRow from '@/components/Upload/index'
// 检验
import elTableSelf from '@/components/TabComponents/index'

export default {
    components: {
        dialogImage,
        elUploadRow,
        elTableSelf
    },
    data() {
        return {
            uploadObj: {
                name: '上传附件',
                type: 'upload',
                accept: 'image/jpeg,image/png,application/pdf,application/msword,application/vnd.ms-excel',
                file: {
                    tip: '支持jpg、png、pdf、doc、xls、ppt、txt格式上传',
                    limit: 5,
                    meanwhilelimit: 1,
                    size: 5242880,
                    sizeLimitTip: '文件大小不可超过5MB',
                    fileType: 99
                }
            },
            activeNames: ['caseInfo'],
            formData: null,
            popperWidth: 0,
            chiefPopperVisible: true,
            inputWidth: '200px',
            inputWidthTwo: '549px',
            textWidth: '550px',
            radio: 2,
            tiwei: '',
            manbo: '',
            huxi: '',
            xueyaone: '',
            xueyatwo: '',
            symbolFlag: 0,
            form: {
                attachment: [] // 文件
            },
            title: '',
            imgUrl: '',
            allergyLineCount: 0,
            size: 'small',
            columns: [
                {
                    type: 'upload'
                }
            ],
            diagnosisList: [],
            filePrifix: this.$store.getters.basic.filePrifix
        }
    },
    props: {
        justShow: { type: Boolean, default: false },
        patientCase: { type: Array },
        titleType: { type: String },
        fileList: { type: Array },
        isUpload: { type: Boolean, default: true }
    },
    watch: {
        fileList(val) {
            this.form.attachment = val
        }
    },
    methods: {
        // 上传成功
        uploadSuccess(data) {
            if (data.length > 0) {
                data.forEach(item => {
                    if (item.response) {
                        this.form.attachment.push(...item.response.ITEMS)
                    }
                })
            }
        },

        // 预览
        handlePreviewImage(file) {
            if (file.fileName.match(/\.(png|jpg|jpeg)/)) {
                this.title = file.fileName
                this.imgUrl = this.filePrifix + file.filePath
                this.$refs.preview[0].open()
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

        // 删除图片
        handleDeleteImage(file, index) {
            this.$confirm(`确定移除 ${file.fileName}？`)
                .then(() => {
                    deleteAttach(file.filePath, file.id ? file.id : 0).then(res => {
                        if (res.STATUS === '1') {
                            this.form.attachment.splice(index, 1)
                            this.$message.success('移除成功！')
                        }
                    })
                }).catch(() => {

                })
        },

        // 图片
        copyForm3(form) {
            this.form.attachment = form
        },

        initFields(form) {
            if (form) {
                this.form = form
            } else {
                this.form = { attachment: [] }
            }
        }
    }
}
</script>

<style  lang='scss' scoped>
.el-select {
  width: 100%;
}
.mixin-select {
  .el-form-item__content {
    > span {
      display: block;
      &:not(:first-child) {
        margin-top: 10px;
      }
      .el-select {
        width: 160px;
        margin-right: 5px;
      }
      .el-button {
        padding: 9px 10px;
        + .el-button {
          margin-left: 5px;
        }
      }
    }
  }
}

.tips-list{
  >li{
    float:left;
    width:146px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    margin-top:10px;
    &:not(:first-child) {
      margin-left: 20px;
    }
  }
}

.mixin-input {
  margin-bottom: 0 !important;
  .el-form-item__content {
    .el-input {
      width: 100px;
    }
    .el-date-editor {
      width: 135px;
    }
    .suffix {
      display: inline-block;
      color: #606266;
      .el-form-item__error {
        left: -36px;
      }
      &:not(:last-child) {
        margin-right: 10px;
      }
      label {
        font-size: 12px;
        padding-right: 0;
      }

      span {
        font-size: 12px;
      }
    }
  }
}
.chief-tell {
  .text-right {
    text-align: right;
  }
  .line {
    font-size: 12px;
    color: #606266;
    border-top: 1px dashed #ccc;
    padding: 10px 0;
    line-height: 1.5;
    overflow: hidden;
    .name {
      width: 65px;
      float: left;
      text-align: right;
    }
    .list {
      width: calc(100% - 65px);
      float: left;
      span {
        display: inline-block;
        cursor: pointer;
        padding: 0 4px;
      }
    }
  }
}
.img-list {
  li {
    position: relative;
  }
}
.zhezhao {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  top: 0;
}
</style>

<style  lang='scss'>
.upload-info {
    margin-top:20px;
    .el-form-item__label{
        width: 100% !important;
        color:#000000;
        text-align: left;
    }
    .el-form-item__content{
        margin-left:0 !important;
    }
    .el-upload-list--picture-card .el-upload-list__item{
          margin: 0 20px 0px 0;
    }
    .el-upload-list__item-name{
      display: none;
    }
    .el-upload-list__item-status-label{
        display: none !important;
    }
    .img-list .el-upload-list__item-status-label{
        display: block !important;
    }
}
</style>





