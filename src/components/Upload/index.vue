<template>
    <el-row class="el-upload-row">
        <el-upload
            ref="upload"
            :multiple="file.limit?file.limit === 1 || file.meanwhilelimit === 1?false:true:true"
            :action="action"
            :headers="headers"
            :data="{fileType:file.fileType}"
            :list-type="listType"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            :before-remove="beforeRemove"
            :file-list="fileList"
            :accept="accept"
            :limit="file.limit||9"
        >
            <template v-if="!listType">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">{{ file.tip }}</div>
            </template>
            <template v-else>
                <i class="el-icon-plus" />
                <span class="explain-text">{{ file.name }}</span>
            </template>
        </el-upload>
        <p v-if="file.prompting && btnText === '提交审核'" class="prompting">{{ file.prompting }}</p>
        <div v-if="btnText === '提交审核'&&file.demoImgs && file.demoImgs.length > 0" class="demoImgs">
            <h6>示例：</h6>
            <p v-for="(img,index) in file.demoImgs" :key="index">
                <img :src="img.url" alt="">
                <span>{{ img.name }}</span>
            </p>
        </div>
        <dialog-image ref="imgs" :title="title" :img-url="imgUrl" />
    </el-row>
</template>

<script>
import dialogImage from '@/components/DialogComponents/Image'
import { getToken } from '@/utils/auth'
import { deleteAttach } from '@/api/upload'

export default {
    components: {
        dialogImage
    },
    props: {
        accept: { type: String },
        file: { type: Object },
        fileList: { type: Array },
        listType: { type: String },
        btnText: { type: String }
    },
    data() {
        return {
            imgUrl: '',
            title: '',
            action:
        (process.env.VUE_APP_ENV_CONFIG === 'dev' ? '/api' : process.env.VUE_APP_API_ROOT) +
        '/upload/file/batch/upload'
        }
    },
    computed: {
        headers() {
            return {
                Authorization: `Bearer ${getToken()}`
            }
        }
    },
    methods: {
    // 上传前回调
        beforeUpload(file) {
            return new Promise((resolve, reject) => {
                const size = this.file.size
                if (size && file.size > size) {
                    this.$message.error(this.file.sizeLimitTip)
                    reject()
                }
                resolve()
            })
        },

        // 超出限制
        handleExceed(files, fileList) {
            this.$message.error(`最多可上传${this.file.limit || 9}个文件！`)
        },

        // 上传成功
        handleSuccess(res, file, fileList) {
            const obj = {
                fileType: this.file.fileType,
                fileIndex: this.file.fileIndex || 0
            }
            if (res.STATUS === '1') {
                this.$emit('uploadSuccess', fileList, obj)
            } else {
                this.$message.warning(res.MESSAGE)
            }
        },

        // 移除提醒
        beforeRemove(file, fileList) {
            const size = this.file.size
            if (size && file.size > size) {
                return true
            }
            return this.$confirm(`确定移除 ${file.fileName || file.name}？`)
        },

        // 移除
        handleRemove(file, fileList) {
            const size = this.file.size
            if (!(size && file.size > size)) {
                const result = file.response ? file.response.ITEMS[0] : file
                const url = result.filePath
                const id = result.id || 0
                deleteAttach(url, id).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('移除成功！')
                        this.$emit('handleRemove', result)
                        this.$emit('deleteUpload', result)
                    }
                })
            }
        },

        // 查看
        handlePreview(file) {
            const name = file.fileName || file.name
            this.title = name
            if (name.match(/\.(png|jpg|jpeg)/)) {
                this.imgUrl = file.url
                this.$refs.imgs.open()
            } else {
                const elink = document.createElement('a')
                elink.download = name
                elink.style.display = 'none'
                elink.href = file.url
                document.body.appendChild(elink)
                elink.click()
                URL.revokeObjectURL(elink.href) // 释放URL 对象
                document.body.removeChild(elink)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.el-upload-row {
  font-size: 14px;
  margin-bottom: 25px;
  float: left;
  margin-left: 15px;

  .el-icon-plus,
  .explain-text {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .explain-text {
    top: 60%;
    width: 100%;
    font-size: 12px;
    color: #b1b1b1;
  }
  .prompting {
    position: absolute;
    left: 0;
    z-index: 2;
    width: 300px;
    color: #6d7278;
    font-size: 12px;
  }
  .demoImgs {
    position: absolute;
    left: 500px;
    top: 0;
    width: 500px;
    z-index: 22;
    h6 {
      float: left;
      line-height: 148px;
    }
    p {
      float: left;
      margin-left: 15px;
      img {
        display: block;
        width: 148px;
        height: 148px;
        border-radius: 5px;
        border: 1px dashed #b1b1b1;
        box-sizing: border-box;
      }
      span {
        text-align: center;
        width: 148px;
        display: block;
        color: #6d7278;
        font-size: 12px;
      }
    }
  }
}
</style>

<style lang="scss">
.el-upload-row {
  .el-upload {
    position: relative;
  }
}
</style>
