<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span class="title">基本信息</span>
      <div class="fr">
        <el-button v-if="disabled" :size="size" type="text" icon="el-icon-edit" @click="disabled = false;">修改</el-button>
        <template v-else>
          <el-button :size="size" type="text" icon="el-icon-close" @click="handleClose">取消</el-button>
          <el-button :size="size" type="text" icon="el-icon-check" @click="handleSave">保存</el-button>
        </template>
      </div>
    </div>
    <div class="box-body">
      <el-form ref="form" :model="form" :label-position="labelPosition" :label-width="labelWidth" :size="size" :disabled="disabled">
        <el-col :span="item.span?item.span:12" v-for="(item,index) in forms" :key="index" :style="item.style">
          <el-form-item :label="`${item.name}：`" :prop="item.field" :rules="item.rules">
            <span slot="label" v-if="!item.name"></span>
            <!-- 输入框 -->
            <el-input v-if="item.type === 'input'" :type="item.inputType?item.inputType:'input'" v-model="form[item.field]" :readonly="item.readonly" :disabled="item.disabled" :maxlength="item.maxlength" :placeholder="item.placeholder"></el-input>

            <!-- 单选框 -->
            <el-radio v-else-if="item.type === 'radio'" v-model="form[item.field]" v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value">{{opt.label}}</el-radio>

            <!-- 多选框 -->
            <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.field]">
              <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value">{{opt.label}}</el-checkbox>
            </el-checkbox-group>

            <!-- 模糊查询输入 -->
            <el-autocomplete :popper-class="item.popperClass" style="width:100%;" v-else-if="item.type === 'autocomplete'" v-model="form[item.field]" :fetch-suggestions="item.func" :placeholder="item.placeholder" @select="item.selectfun?item.selectfun($event):{}" clearable>
              <template slot-scope="{ item }">
                <div class="name">{{ item.value }}</div>
                <span class="description">{{ item.description }}</span>
              </template>
            </el-autocomplete>

            <!-- 模糊查询选择 -->
            <el-select v-else-if="item.type === 'remote'" v-model="form[item.field]" filterable remote reserve-keyword :placeholder="item.placeholder" :remote-method="item.remoteFunc">
              <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"></el-option>
            </el-select>

            <!-- 日期区间 -->
            <el-date-picker v-else-if="item.type === 'daterange'" v-model="form[item.field]" type="daterange" align="right" unlink-panels range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat"></el-date-picker>

            <!-- 日期 -->
            <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.field]" @change="item.func?item.func($event):{}" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat"></el-date-picker>

            <!-- 下拉框 -->
            <el-select v-else-if="item.type === 'select'" v-model="form[item.field]" placeholder="请选择" @change="item.func?item.func($event):{}">
              <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value"></el-option>
            </el-select>

            <!-- 级联 -->
            <el-cascader v-else-if="item.type === 'cascader'" :options="item.list" v-model="form[item.field]" :props="item.props" :change-on-select="item.changeOnSelect" :clearable="true" filterable></el-cascader>

            <!-- 上传列表 -->
            <!-- <el-upload-row v-else-if="item.type === 'upload'" :file="item.file" :file-list="fileList" :accept="item.accept" @uploadSuccess="uploadSuccess" @deleteUpload="deleteUpload"></el-upload-row> -->
          </el-form-item>
        </el-col>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import elUploadRow from "@/components/Upload/index";
export default {
  components: {
    elUploadRow
  },
  data() {
    return {
      disabled: true,
      form: {},
      fileList: []
    };
  },
  props: {
    size: { type: String, default: "small" },
    labelPosition: { type: String, default: "right" },
    labelWidth: { type: String },
    formEdit: {
      type: Object
    },
    forms: { type: Array } // 表单组
  },
  methods: {
    // 保存
    handleSave() {
      if (this.form.idNum && !this.form.idNumType) {
        this.$message.warning("请选择证件类型！");
        return false;
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit("handleSave", this.form);
        }
      });
    },

    // 取消
    handleClose() {
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
      this.disabled = true;
    },

    // 初始化表单
    initForm(edit) {
      const form = {};
      this.forms.forEach(item => {
        if (!form[item.field]) return false;
        if (
          item.type === "daterange" ||
          item.type === "checkbox" ||
          item.type === "cascader"
        ) {
          form[item.field] = [];
        } else {
          form[item.field] = "";
        }
      });

      if (edit) {
        this.form = Object.assign(form, edit);
        this.form.attachmentList = [];
        this.fileList = edit.attachmentList;
      } else {
        this.form = Object.assign({}, form);
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },

    // 赋值
    initFields(obj) {
      for (const key in obj) {
        this.form[key] = obj[key];
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },

    // 上传成功
    uploadSuccess(fileList, obj) {
      const result = [];
      // 只处理本次上传
      fileList.forEach(item => {
        if (item.response) {
          const col = item.response.ITEMS[0];
          result.push({
            businessType: col.businessType,
            fileName: col.fileName,
            fileNote: "",
            filePath: col.filePath,
            fileSize: col.fileSize,
            fileType: obj.fileType
          });
        }
      });
      this.form.attachmentList = result;
    },

    deleteUpload(file) {
      if (file.response) {
        const col = file.response.ITEMS[0];
        const deleteFile = {
          businessType: col.businessType,
          fileName: col.fileName,
          fileNote: "",
          filePath: col.filePath,
          fileSize: col.fileSize,
          fileType: col.fileType
        };
        this.form.attachmentList.forEach((item, index) => {
          let i = "";
          if (JSON.stringify(item) === JSON.stringify(deleteFile)) {
            i = index;
          }
          this.form.attachmentList.splice(index, 1);
        });
      }
    }
  }
};
</script>
<style lang="scss">
.box-card {
  .el-card__header {
    padding: 5px 15px;
  }
}
</style>

<style lang="scss" scoped>
.box-card {
  .title {
    display: inline-block;
    line-height: 33px;
    font-size: 14px;
  }
}
</style>
