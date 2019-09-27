<template>
  <div class="upload-info">
    <el-form ref="form" :model="form" label-width="120px" :size="size">
      <el-row>
        <el-col
          :span="col.spanCount?col.spanCount:24"
          v-for="(col,c) in columns"
          :key="c"
          v-if="!col.hidden"
        >
          <el-form-item
            :label="col.label?col.label+'：':''"
            :prop="col.prop"
            :rules="col.rules"
            :class="col.className"
          >
            <!-- 上传 -->
            <div class="upload" v-if="isUpload">
              <el-button icon="el-icon-plus" @click="uploadFile" :disabled="disabled">上传文件</el-button>
              <input
                ref="fileInput"
                type="file"
                accept="image/gif, image/jpeg, image/jpg, image/png, image/svg"
                style="display:none"
                @change="fileChange($event)"
              >
              <span>支持gif、jpeg、jpg、png、svg格式上传，每张不超过10M</span>
            </div>
            <div class="img-list">
              <ul class="el-upload-list el-upload-list--picture-card">
                <li
                  class="el-upload-list__item is-success"
                  v-for="(file,fileIndex) in form.attachment"
                  :key="fileIndex"
                >
                  <img
                    class="el-upload-list__item-thumbnail"
                    :src="`${filePrifix}${file.filePath}`"
                  >
                  <a class="el-upload-list__item-name">
                    <i class="el-icon-document"></i>
                    {{file.fileName}}
                  </a>
                  <label class="el-upload-list__item-status-label" v-if="isUpload">
                    <i class="el-icon-upload-success el-icon-check"></i>
                  </label>
                  <span class="el-upload-list__item-actions">
                    <span class="el-upload-list__item-preview" @click="handlePreviewImage(file)">
                      <i class="el-icon-zoom-in"></i>
                    </span>
                    <span
                      v-if="isUpload"
                      class="el-upload-list__item-delete"
                      @click="handleDeleteImage(file,fileIndex)"
                    >
                      <i class="el-icon-delete"></i>
                    </span>
                  </span>
                </li>
              </ul>
              <dialog-image ref="preview" :title="title" :img-url="imgUrl"/>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import dialogImage from '@/components/DialogComponents/Image'
import { uploadFile, getFilePrifix, delFile } from '@/api/api'
import formDialog from '@/components/FormComponents/transfer'

// 检验
import elTableSelf from '@/components/TabComponents/index'

export default {
    components: {
        dialogImage,
        formDialog,
        elTableSelf
    },
    data() {
    // const doctorName = this.$store.state.user.currentUser.name

        return {
            formData: null,
            textWidth: '550px',
            form: {
                attachment: [] // 文件
            },
            title: '',
            imgUrl: '',
            allergyLineCount: 0,
            size: 'small',
            columns: [
                {
                    type: 'upload',
                    label: '文件预览'
                }
            ],
            diagnosisList: [],
            filePrifix: this.$store.getters.basic.filePrifix
        }
    },
    props: {
        patientCase: { type: Array },
        titleType: { type: String },
        isUpload: { type: Boolean, default: true },
        patient: { type: Object },
        disabled: { type: Boolean }
    },
    watch: {
        patient(val) {
            if (val.transferId) {
                this.getFilePrifix()
            }
        }
    },
    methods: {
        getFilePrifix() {
            getFilePrifix().then(res => {
                if (res.STATUS === '1') {
                    this.filePrifix = res.ITEMS
                }
            })
        },

        // 上传文件
        uploadFile() {
            if (this.disabled) return false
            this.$refs.fileInput[0].click()
        },

        // 上传文件
        fileChange(e) {
            var files = e.target.files
            var formData = new FormData()
            formData.append('fileType', 40)
            for (let i = 0, len = files.length; i < len; i++) {
                formData.append('file', files[i])
            }

            if (files.length > 0) {
                uploadFile(formData).then(res => {
                    if (res.STATUS === '1') {
                        this.uploadSuccess(res.ITEMS)
                        this.$message.success('上传成功')
                    }
                })
            }
        },

        // 上传成功
        uploadSuccess(data) {
            this.form.attachment.push(...data)
        },

        // 预览图片
        handlePreviewImage(file) {
            if (this.disabled) return false
            this.title = file.fileName
            this.imgUrl = this.filePrifix + file.filePath
            this.$refs.preview[0].open()
        },

        // 删除图片
        handleDeleteImage(file, index) {
            if (this.disabled) return false
            this.$confirm(`确定移除 ${file.fileName}？`)
                .then(() => {
                    delFile(file.filePath, file.id ? file.id : 0).then(res => {
                        if (res.STATUS === '1') {
                            this.form.attachment.splice(index, 1)
                            this.$message.success('移除成功！')
                        }
                    })
                })
                .catch(() => {})
        },

        // 初始化form
        initForm() {
            this.allergyLineCount = 0
            this.form = {
                history: [],
                isInoculation: 0, // 是否计划接种
                isAllergicHistory: 0, // 过敏史
                Allergyt: [],
                complaint: '',
                diagnose1: []
            }
            const _this = this
            setTimeout(function() {
                _this.$refs.form.clearValidate()
            }, 0)
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
    },
    mounted() {
        this.getFilePrifix()
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
  margin-top: 20px;
  .el-form-item__label {
    width: 100% !important;
    color: #000000;
    text-align: left;
  }
  .el-form-item__content {
    margin-left: 70px !important;
  }
}
</style>





