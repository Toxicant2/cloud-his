<template>
    <el-row>
        <el-table ref="tab" v-loading="listLoading" :data="tableData" :show-overflow-tooltip="true" :highlight-current-row="highLight" :size="size" :height="tableHeight" :header-row-class-name="headerClass" border style="width: 100%;">
            <el-table-column v-if="tabType" :type="tabType" :label="tabLabel" width="55" align="center" />
            <template v-for="(column,index) in columns" v-if="!column.hidden">
                <el-table-column v-if="column.type" :key="index" :prop="column.value" :fixed="column.fixed" :label="column.label" :min-width="column.minWidth" :width="column.width" :align="column.align?column.align:'center'">
                    <template slot-scope="scope">
                        <template v-if="scope.row[column.value] === 'null'" />
                        <template v-else>
                            <div v-if="scope.row.isInput && column.value === 'qty'">{{ scope.row[column.value] }}</div>

                            <!-- 输入框 -->
                            <el-input v-else-if="column.type === 'input'" v-model="scope.row[column.value]" :size="size" :disabled="!isShow" :maxlength="column.maxlength" :class="{'input-select':column.appendType === 'select'}" @input="column.func?column.func($event,scope.row,scope.$index):{}" @blur="column.blurFunc?column.blurFunc(scope.row[column.value],scope.row,scope.$index):{}">
                                <span v-if="column.unit && scope.row[column.unit]" :slot="column.slot?column.slot:'append'">{{ scope.row[column.unit] }}
                                </span>
                                <el-select v-if="column.appendType === 'select'" slot="append" v-model="scope.row[column.selectValue]" :disabled="column.formatterDisabled?column.formatterDisabled(scope.row):!isShow" placeholder="请选择" @change="column.selectFunc?column.selectFunc($event,scope.row,scope.$index):{}">
                                    <el-option v-for="(opt,optIndex) in scope.row.opts" :key="optIndex" :label="opt.label" :value="opt.value" />
                                </el-select>
                            </el-input>

                            <!-- 数字 -->
                            <el-input-number v-if="column.type === 'number'" v-model="scope.row[column.value]" :size="size" :disabled="!isShow?true:column.value === 'afterRetailPrice'?scope.row['isTiny'] !== 1:!isShow" :min="column.min" :max="column.max" :precision="column.precision" :controls="false" @change="column.func?column.func($event,scope.row):{}" />

                            <!-- 选择器 -->
                            <el-select v-else-if="column.type === 'select'" v-model="scope.row[column.value]" :multiple="column.multiple" :size="size" :disabled="!isShow" placeholder="请选择" @change="column.func?column.func($event,scope.row,scope.$index):{}">
                                <el-option v-for="(opt,optIndex) in column.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                                    <span style="float: left">{{ opt.label }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                </el-option>
                            </el-select>

                            <!-- 按钮 -->
                            <el-button v-else-if="column.type === 'button'" :size="size" :disabled="!isShow" :type="column.btnType||''" :icon="column.icon||''" @click="column.func(scope.row,scope.$index)">{{ column.text }}
                            </el-button>

                            <!-- 药品信息 -->
                            <div v-else-if="column.type === 'spans'" :style="column.style" @click="column.func?column.func(scope.row):{}">
                                {{ column.formatter(scope.row) }}
                            </div>

                        </template>
                    </template>
                </el-table-column>
                <el-table-column v-else :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align||'center'" :sortable="column.sortable" :formatter="column.formatter" :class-name="column.className" />
            </template>
        </el-table>
        <el-row v-if="isShow">
            <el-popover v-model="popoverVisible" :style="params.style" :disabled="disabled" trigger="click">
                <el-input v-model="name" v-focus="focusState" :size="size" @input="handleSearchDB">
                    <el-button slot="append" icon="el-icon-search" @click="handleSearchDB" />
                </el-input>
                <el-table v-loading="searchLoading" :data="gridData" :size="size" max-height="350" @row-click="handleRowClick">
                    <template v-for="(column,index) in addColumns">
                        <template v-if="column.batchPopover">
                            <el-table-column :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align||'center'" :sortable="column.sortable">
                                <template slot-scope="scope">
                                    <el-popover trigger="hover" placement="right">
                                        <div class="batchPopover">
                                            <p class="title">
                                                <span>批次</span>
                                                <span>效期</span>
                                                <span>库存</span>
                                            </p>
                                            <el-scrollbar style="height:320px;">
                                                <p v-for="(sub,subIndex) in scope.row.batchList" :key="subIndex" :class="{'valid-date':new Date(sub.validDate).getTime() - new Date().getTime() <= 0}">
                                                    <span>{{ sub.batchNum }}</span>
                                                    <span>{{ sub.validDate?sub.validDate.split(' ')[0]:'' }}</span>
                                                    <span>{{ sub.qty + (sub.isTiny===1?(sub.isTinyBatch===1?sub.unit:sub.superUnit):sub.unit) }}</span>
                                                </p>
                                            </el-scrollbar>
                                        </div>
                                        <div slot="reference" class="batchReference">{{ scope.row.qty }}</div>
                                    </el-popover>
                                </template>
                            </el-table-column>
                        </template>
                        <template v-else>
                            <el-table-column :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align||'center'" :sortable="column.sortable" :formatter="column.formatter" />
                        </template>
                    </template>
                </el-table>
                <div slot="reference" :class="{'drug-disabled':disabled}" :style="params.style" class="drug-wrapper">{{ params.placeholder }}</div>
            </el-popover>
            <span v-if="disabled" style="font-size: 14px;line-height: 32px;color:#F56C6C;">提示：添加药品及检验检查前请确认是否完善门诊病历和完成西医诊断。</span>
            <!-- 药品限制 -->
            <!-- <span v-if="!disabled && (params.chara===10&&params.insurance&&params.insurance.insuranceCode)" style="font-size: 14px;line-height: 32px;color:#E6A23C;">
                提示：该患者的患者类型是【{{params.insurance.insuranceName}}】且诊所已启用【{{params.insurance.insuranceName}}】用药限制
            </span> -->
        </el-row>
    </el-row>
</template>

<script>
import { getCharaPageList, getChargePageList } from '@/api/catalog'
import { getChargeItem } from '@/api/outpatient'
import { debounce } from '@/utils/tool'
export default {
    directives: {
        focus: {
            update: function(el, { value }) {
                if (value) {
                    el.children[0].focus()
                }
            }
        }
    },
    props: {
        params: { type: Object },
        listLoading: Boolean, // tab 加载层
        highLight: { type: Boolean, default: false },
        headerClass: { type: String, default: 'default' }, // 头部背景色Class名称，默认default
        tabType: String, // 对应列的类型，selection/index/expand
        tabLabel: String,
        tableHeight: Number, // 表格的高度
        size: { type: String, default: 'small' },
        tableData: Array, // 表格数据
        columns: Array, // 表格列配置数据,{vlaue:对应数据对象中的属性，label：对应的是标题文字，fixed:列是否固定，width:列宽， sortable：是否可排序，formatter:列格式化， className：对应的是列的样式类名}
        addColumns: Array,
        disabled: { type: Boolean, default: true },
        isShow: { type: Boolean, default: true }
    },
    data() {
        return {
            focusState: false,
            popoverVisible: false,
            searchLoading: false,
            name: '',
            gridData: []
        }
    },
    watch: {
        popoverVisible(newVal) {
            if (newVal) {
                this.name = ''
                this.gridData = []
                this.focusState = true
            }
        }
    },
    methods: {
    // 药品行点击
        handleRowClick(row, event, column) {
            this.$emit('addItem', row)
            this.popoverVisible = false
        },

        // 查询药品
        handleSearchDB: debounce(
            function() {
                if (!this.name.trim()) {
                    this.gridData = []
                    return false
                }
                this.searchLoading = true
                const data = { name: this.name, pageNo: 1, pageSize: this.params.pageSize || 10 }
                if (this.params.chara) {
                // 药品限制
                // const insurance = this.params.insurance
                // if (this.params.chara === 10 && insurance.insuranceCode) {
                //     data.insuranceCode = insurance.insuranceCode
                // }
                    getCharaPageList(this.params.chara, data).then(res => {
                        if (res.STATUS === '1') {
                            this.searchLoading = false
                            const d = res.ITEMS
                            this.gridData = d.list || []
                        }
                    })
                } else {
                    if (this.params.type === 'chargeItem') {
                        getChargeItem(this.name).then(res => {
                            if (res.STATUS === '1') {
                                this.searchLoading = false
                                const d = res.ITEMS
                                this.gridData = d || []
                                this.gridData.forEach(item => {
                                    item.price = item.isTiny === 1 ? item.tinyPrice : item.price
                                })
                            }
                        })
                    } else {
                        let obj = {}
                        if (this.params.isAdjustPrice) {
                            obj = Object.assign(data, { isAdjustPrice: 'ddd' })
                        } else {
                            obj = Object.assign({}, data)
                        }
                        getChargePageList(obj).then(res => {
                            this.searchLoading = false
                            const d = res.ITEMS
                            this.gridData = d.list || []
                        // this.gridData.forEach(item => {
                        //     item.price = item.isStock === 1 ? item.retailPrice : item.price
                        // })
                        })
                    }
                }
            },
            500,
            false
        )
    }
}
</script>

<style lang="scss">
.default {
  th {
    background-color: #eef5fd;
    color: #586276;
  }
}

.input-select {
  .el-input-group__append {
    background-color: #fff;
    width: 70px;
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
.batchPopover {
  width: 300px;
  p {
    &.valid-date {
      color: red;
    }
    span {
      display: inline-block;
      width: 32%;
      line-height: 28px;
      text-align: center;
    }
  }
  .title {
    span {
      font-size: 16px;
      font-weight: bolder;
    }
  }
}
.batchReference {
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
.drug-wrapper {
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  padding-left: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  color: #333;
  cursor: pointer;
  &.drug-disabled {
    cursor: disabled;
    color: #999;
  }
}
.el-table__empty-block {
  position: relative;
  min-height: 60px;
  text-align: center;
  width: 100%;
  height: 100%;
}

.el-table__empty-text {
  position: absolute;
  left: 50%;
  width: 110px;
  height: 110px;
  top: 50%;
  line-height: 220px;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  color: #5e7382;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
