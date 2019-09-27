<template>
  <el-dialog center :title="title" :visible.sync="visible" :width="width">
    <div>
      <div v-if="formData">
        <el-form :rules="rules" :model="form" ref="form" label-position="right" :label-width="labelWidth">
          <el-row>
            <template v-for="(item,index) in formData" v-if="!item.hidden">
              <el-col :span="item.spanCount?item.spanCount:countLine" :key="item.field" :class="item.class">
                <el-form-item :key="index" :label="item.name?`${item.name}:`:''" :label-width="item.name?item.labelWidth:'10px'" :prop="item.field" :rules="item.rules" :class="item.className" :style="item.style">
                  <!-- 按钮控制 -->
                  <el-button v-if="item.operation" class="operBtn" :type="item.operation.type?item.operation.type:'text'" @click="item.operation.func">
                    {{item.operation.text?item.operation.text:'新增'}}
                  </el-button>

                  <!-- 提示 -->
                  <el-tooltip v-if="item.tips" effect="dark" :content="item.tips" placement="top" slot="label">
                    <span>{{item.name}}：</span>
                  </el-tooltip>

                  <!-- 输入框 input -->
                  <el-input v-if="item.type === 'input'" :type="item.inputType?item.inputType:''" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" @input="item.func" :resize="item.resize" :maxlength="item.maxlength" :rows="item.rows" :autosize="item.autosize">
                    <span :slot="item.slot?item.slot:'append'" v-if="item.unit">{{item.unit}}</span>
                  </el-input>

                  <!-- 呼吸背景色输入框 background-input -->
                  <el-input v-else-if="item.type === 'background-input'" :type="item.inputType?item.inputType:''" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" @input="item.func" :resize="item.resize" :maxlength="item.maxlength" :rows="item.rows" :autosize="item.autosize" :class="{'red-background': form[item.field] && form[item.field]>item.up, 'blue-background': form[item.field]&& form[item.field]<item.down}">
                    <span :slot="item.slot?item.slot:'append'" v-if="item.unit">{{item.unit}}</span>
                  </el-input>

                  <!-- 数字输入框 -->
                  <el-input-number v-else-if="item.type === 'number'" :min="item.min" :max="item.max" :precision="item.precision" :controls="item.controls || false" :disabled="item.disabled" v-model="form[item.field]" :placeholder="item.placeholder" @input="item.func" :maxlength="item.maxlength">
                  </el-input-number>

                  <!-- 模糊查询输入 -->
                  <el-autocomplete v-else-if="item.type === 9" popper-class="my-autocomplete" v-model="form[item.field]" :fetch-suggestions="item.func" :placeholder="item.placeholder" @select="item.selectfun" clearable>

                    <template slot-scope="{ item }">
                      <div class="name">{{ item.value }}
                        <span v-if="item.specification">({{ item.specification }})</span>
                      </div>
                      <span class="description">{{ item.description }}</span>
                    </template>
                  </el-autocomplete>

                  <!-- 快速收费的模糊查询 -->
                  <el-autocomplete v-else-if="item.type === 'autoComplete'" popper-class="my-autocomplete" v-model="form[item.field]" :fetch-suggestions="item.func" :placeholder="item.placeholder" @select="item.selectfun" clearable>
                    <template slot-scope="{ item }">
                      <span style="display:inline-block;width:120px">{{item.value}}</span>
                      <span>{{ formatSex(item.sex) }}</span>
                      <p style="margin-left:120px">
                        <span v-if="item.phone">{{ item.phone }}</span>
                      </p>
                    </template>
                  </el-autocomplete>

                  <!-- 模糊查询选择 -->
                  <el-select v-else-if="item.type === 'remote'" v-model="form[item.field]" filterable remote reserve-keyword :placeholder="item.placeholder" :remote-method="item.remoteFunc" @change="item.func?item.func($event):{}">
                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                    </el-option>
                  </el-select>

                  <!-- 日期 -->
                  <el-date-picker v-else-if="item.type === 'date'" v-model="form[item.field]" :type="item.dateType?item.dateType:'date'" :placeholder="item.placeholder" :picker-options="item.options" :format="item.format" :value-format="item.valueFormat" @change="item.func?item.func($event):{}">
                  </el-date-picker>

                  <!-- 单选框 -->
                  <el-radio :class="item.class" v-else-if="item.type === 'radio'" v-model="form[item.field]" v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.value" @change="item.func?item.func($event):{}">{{opt.label}}
                  </el-radio>

                  <!-- 多选框 -->
                  <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="form[item.field]">
                    <el-checkbox v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label"></el-checkbox>
                  </el-checkbox-group>

                  <!-- 下拉框-输入框 -->
                  <el-input v-else-if="item.type === 'select-input'" placeholder="请输入内容" v-model="form[item.field2]" class="input-with-select">
                    <el-select v-model="form[item.field1]" slot="prepend" placeholder="请选择">
                      <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt">
                        <span style="float: left">{{ opt.label }}</span>
                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                      </el-option>
                    </el-select>
                  </el-input>

                  <!-- 输入框-输入框 -->
                  <el-input v-else-if="item.type === 'input-input'" placeholder="请输入内容" v-model="form[item.field1]" class="input-with-input">
                    <el-input placeholder="请输入内容" v-model="form[item.field2]" slot="prepend" class="input-with-input-inner">
                    </el-input>
                  </el-input>

                  <!-- 级联 -->
                  <el-cascader v-else-if="item.type === 'cascader'" :options="item.list" v-model="form[item.field]" :clearable="true" :filterable="true">
                  </el-cascader>

                  <!-- 选择器 -->
                  <el-select v-else-if="item.type === 'select'" :multiple="item.multiple" v-model="form[item.field]" :placeholder="item.placeholder?item.placeholder:'请选择'" :value-key="item.key?item.key:'value'" @change="item.func?item.func($event):{}">
                    <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                      <span style="float: left">{{ opt.label }}</span>
                      <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                    </el-option>
                  </el-select>

                  <img v-else-if="item.type === 'image'" :src="form[item.field]" />
                  <span v-else-if="item.type === 'span'">{{form[item.field]}}</span>
                  <!-- 按钮 -->
                  <el-button v-else-if="item.type === 'button'" style="float:right;" :type="item.color" @click.native="item.func?item.func(form):{}">{{item.value}}</el-button>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </el-form>
      </div>

      <div v-if="columns">
        <el-table ref="tab" :data="tableData" border :header-row-class-name="'headerClass'" :max-height="tableMaxHeight" :span-method="spanMethod" :cell-style="cellStyle" @row-click="rowClick?rowClick($event):{}">
          <template v-for="(column,index) in columns">
            <!-- 输入框|图片 -->
            <template v-if="column.type">
              <el-table-column :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align?column.align:'center'" :sortable="column.sortable" :formatter="column.formatter">
                <template slot-scope="scope">
                  <el-input v-if="column.type == 'input'" suffix-icon="el-icon-tickets"></el-input>
                  <img v-else-if="column.type == 'img'" :src="scope.row.avatar" style="width: 50px;height: 50px" class="img-avatar">
                </template>
              </el-table-column>
            </template>

            <el-table-column v-else :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align?column.align:'center'" :sortable="column.sortable" :formatter="column.formatter">
            </el-table-column>
          </template>
        </el-table>
      </div>

      <div v-if="describe" class="describe">
        <div>{{describe.label}}：{{describe.value}}</div>
         <el-form :rules="rules" :model="describe.form" ref="describeForm" label-position="right" :label-width="labelWidth">
          <el-row>
            <template v-for="(item,index) in describe.formData">
              <el-col :span="item.spanCount?item.spanCount:countLine" :key="item.field" :class="item.class">
                <el-form-item :key="index" :label="item.name?`${item.name}:`:''" :label-width="item.name?item.labelWidth:'10px'" :prop="item.field" :rules="item.rules" :class="item.className" :style="item.style">
                  <!-- 输入框 input -->
                  <el-input v-if="item.type === 'input'" size="mini" :type="item.inputType?item.inputType:''" :disabled="item.disabled" v-model="describe.form[item.field]" :placeholder="item.placeholder" @input="item.func" :resize="item.resize" :maxlength="item.maxlength" :rows="item.rows" :autosize="item.autosize">
                    <span :slot="item.slot?item.slot:'append'" v-if="item.unit">{{item.unit}}</span>
                  </el-input>

                  <!-- 数字输入框 -->
                  <el-input-number v-else-if="item.type === 'number'" size="mini" :min="item.min" :max="item.max" :precision="item.precision" :controls="item.controls || false" :disabled="item.disabled" v-model="describe.form[item.field]" :placeholder="item.placeholder" @input="item.func" :maxlength="item.maxlength">
                  </el-input-number>

                  <!-- 按钮 -->
                  <el-button v-else-if="item.type === 'button'" style="float:right;" :type="item.color" @click.native="item.func?item.func(form):{}">{{item.value}}</el-button>
                </el-form-item>
              </el-col>
            </template>
             </el-row>
         </el-form>
        <div style="text-align:right;margin:10px 0;">
          <el-button size="mini" @click="visible = false;">取消</el-button>
          <el-button size="mini" type="primary" :loading="loading" @click="describe.func">{{describe.funcName}}</el-button>
        </div>
        <div style="text-align:center" class="des">{{describe.des}}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            form: {},
            describeForm: {},
            loading: false
        }
    },
    props: {
        title: { type: String, default: '系统提示' },
        width: { type: String, width: '700px' },
        headerClass: { type: String, default: 'default' }, // 头部背景色Class名称，默认default
        tableMaxHeight: Number, // 表格的最大高度
        tableData: Array, // 表格数据
        columns: Array, // 表格列配置数据,{vlaue:对应数据对象中的属性，label：对应的是标题文字，fixed:列是否固定，width:列宽， sortable：是否可排序，formatter:列格式化， className：对应的是列的样式类名}
        spanMethod: { type: Function },
        rowClick: { type: Function },
        cellStyle: { type: Function },
        describe: Object,
        // 表单
        formData: Array,
        formEdit: Object,
        countLine: {
            // 一行排列几个
            default: 24
        },
        labelWidth: {
            type: String,
            default: '100px'
        },
        rules: {
            type: Object
        }
    },
    methods: {
        open() {
            this.visible = true
        },
        close() {
            this.visible = false
        },

        // 初始化整个表单（可在初始化时赋值）
        initforms(formEdit) {
            const form = {}
            this.formData.forEach(item => {
                if (!item.field || item.hidden) return false
                if (item.type === 'select-input' || item.type === 'input-input') {
                    form[item.field1] = ''
                    form[item.field2] = ''
                } else if (item.type === 'checkbox' || item.type === 'cascader') {
                    form[item.field] = []
                } else {
                    form[item.field] = ''
                }
            })
            if (formEdit) {
                this.form = Object.assign(form, formEdit)
            }
            if (this.formEdit) {
                this.form = Object.assign(form, this.formEdit)
            } else {
                this.form = Object.assign({}, form)
            }
            this.loading = false

            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        // 给表单部分字段赋值（此时表单已初始化）
        initFields(obj) {
            for (const key in obj) {
                this.form[key] = obj[key]
            }
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        }
    }
}
</script>

<style lang="scss">
.headerClass {
  th {
    background-color: #eef5fd !important;
    color: #586276;
    font-weight: normal;
  }
}
.img-avatar {
  border-radius: 50%;
  border: 0;
  cursor: pointer;
}
.describe {
  margin-top: 10px;
  .des {
    text-align: center;
    color: red;
  }
   .el-form{
     margin-top:10px;
    .el-form-item__label{
      text-align:left;
      padding:0;
    }
  }
}
</style>

