<template>
    <el-row class="el-table-self">
        <el-table
            ref="selftab"
            v-loading="listLoading"
            :size="tabSize"
            :summary-method="getSummaries"
            :show-summary="showSummary"
            :span-method="spanMethod"
            :data="tableData"
            border
            :show-overflow-tooltip="true"
            :highlight-current-row="highLight"
            :height="tableHeight"
            :header-row-class-name="headerClass"
            :row-style="rowStyle"
            :cell-style="cellStyle"
            style="width: 100%;"
            @cell-click="cellClick"
            @row-click="rowClick"
            @sort-change="sortChange"
            @select="selectChange"
            @selection-change="selectionChange"
            @select-all="selectAll"
        >
            <el-table-column v-if="tabType" :type="tabType" width="55" align="center" :label="tabLabel" :selectable="selecTable" :index="tabIndex" />

            <template v-for="(column,index) in columns" v-if="!column.hidden">
                <el-table-column v-if="column.operations" :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" align="center">
                    <template slot-scope="scope">
                        <template v-for="(operate,operIndex) in column.operations.formatter?column.operations.formatter(scope.row):column.operations" v-if="!operate.isHidden ||!operate.isHidden(scope.row,scope.$index)">

                            <el-button v-if="column.operType === 'button' " :key="operIndex" :disabled="operate.formatter?operate.formatter(scope.row,scope.$index).disabled:operate.disabled" :type="operate.formatter?operate.formatter(scope.row).type:operate.type||''" :icon="operate.icon" :plain="operate.plain" :style="operate.style" @click="operate.func?operate.func(scope.row,scope.$index):{}">{{ operate.formatter?operate.formatter(scope.row).label:operate.label?operate.label:scope.row[column.value] }}</el-button>

                            <template v-else-if="column.operType === 'svg'">
                                <el-tooltip v-if="operate.tips" :key="operIndex" effect="dark" :open-delay="200" placement="bottom-start">
                                    <span slot="content">{{ operate.tips }}</span>
                                    <svg-icon :style="operate.style" :icon-class="operate.iconClass" class="tab-svg" @click.native="operate.func(scope.row,scope.$index)" />
                                </el-tooltip>
                                <svg-icon v-else :key="operIndex" :style="operate.style" :icon-class="operate.iconClass" class="tab-svg" @click.native="operate.func(scope.row,scope.$index)" />
                            </template>
                            <template v-else-if="column.operType === 'icon'">
                                <el-button type="text" :icon="operate.iconClass" :style="operate.style" @click="operate.func(scope.row,scope.$index)" />
                            </template>
                        </template>
                    </template>
                </el-table-column>

                <el-table-column v-else-if="column.scope" :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" align="center">
                    <template slot-scope="scope">
                        <!-- LOGO -->
                        <template v-if="column.value === 'logo'">
                            <img v-if="scope.row[column.value]" :src="$store.getters.basic.filePrifix + scope.row[column.value]" alt width="40" height="40">
                        </template>
                        <!-- 医生管理-审核状态 -->
                        <template v-else-if="column.value === 'checkedStatus'">
                            <el-tag :type="scope.row[column.value]| statusFilter">{{ scope.row[column.value] ? scope.row[column.value] === 1 ? '已审核' : '已拒绝' : '待审核' }}</el-tag>
                        </template>
                        <!-- 医生管理-启用状态 -->
                        <template v-else-if="scope.row.checkStatus === 1 && column.value === 'isUse'">
                            <el-tag :type="scope.row[column.value]| statusFilter2">{{ scope.row[column.value] ? '已启用' : '已停用' }}</el-tag>
                        </template>
                    </template>
                </el-table-column>

                <el-table-column v-else-if="column.operType" :key="index" :fixed="column.fixed" :prop="column.value" :label="column.label" :width="column.width" :align="column.align || 'center'">
                    <template slot-scope="scope">
                        <template v-if="column.operType === 'input'">
                            <template v-if="column.type === 'number'">
                                <el-input-number v-if="column.showInput?column.showInput:scope.row.showInput" v-model="scope.row[column.value]" :controls="false" :min="column.min|| scope.row['min'] || 0" :precision="column.precision" :disabled="column.disabled || disabled" @change="column.func?column.func(scope.row,scope.$index):{}" @input="handleEdit(scope.$index,scope.row[column.value],scope.row,column.value)" @blur="handleBlur(scope.$index,scope.row[column.value])" @keydown.native.enter="column.enterFunc?column.enterFunc(scope.row,scope.$index):{}" />
                                <span v-else class="tableSpan">{{ scope.row[column.value] }}</span>
                            </template>
                            <template v-else>
                                <el-input v-if="column.showInput?column.showInput:scope.row.showInput" v-model="scope.row[column.value]" :autofocus="scope.row[column.autofocus]" :disabled="column.disabled || disabled" :size="column.size" @input="handleEdit(scope.$index,scope.row[column.value],scope.row,column.value)" @blur="handleBlur(scope.$index,scope.row[column.value])" @keydown.native.enter="column.enterFunc?column.enterFunc(scope.row,scope.$index):{}">
                                    <template v-if="column.slot" slot="append">{{ column.slot }}</template>
                                </el-input>
                                <span v-else class="tableSpan">{{ scope.row[column.value] }}</span>
                            </template>
                        </template>
                        <template v-if="column.operType === 'date'">
                            <el-date-picker
                                v-if="column.showDate"
                                v-model="scope.row[column.value]"
                                align="center"
                                :picker-options="column.options"
                                :type="column.dateType||'date'"
                                :placeholder="scope.row[column.placeholder]"
                                :disabled="disabled"
                                :format="column.format"
                                :value-format="column.valueFormat"
                                :size="column.size"
                                @change="column.func?column.func(scope.row,scope.$index): {}"
                            />
                            <span v-else class="tableSpan">{{ scope.row[column.value] }}</span>
                        </template>
                        <template v-else-if="column.operType === 'select'">
                            <el-select
                                v-model="scope.row[column.value]"
                                filterable
                                placeholder="请选择"
                                no-data-text=" "
                                no-match-text=" "
                                :disabled="column.formatterDisabled?column.formatterDisabled(scope.row):column.disabled || disabled"
                                :remote="column.remote"
                                :allow-create="column.allowCreate"
                                :remote-method="column.remoteMethod"
                                @change="changeProject(scope.row[column.value],scope.$index)"
                                @focus="changeSelect(scope.row)"
                            >
                                <el-option v-for="item in column.opts" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </template>

                        <template v-else-if="column.operType === 'check-inputs'">
                            <el-input v-model="scope.row[column.value]" style="width:33%" @blur="column.bigFunc(scope.row,scope.$index)" />
                            {{ column.formatter1(scope.row) }}
                            <template v-if="scope.row['isTiny'] === 1">
                                <el-input v-model="scope.row[column.value2]" style="width:33%" @blur="column.smallFunc(scope.row,scope.$index)" />
                                {{ column.formatter2(scope.row) }}
                            </template>
                        </template>

                        <template v-else-if="column.operType === 'label'">
                            <span>{{ scope.row[column.value] }}</span>
                            <span v-if="scope.row.followId" class="isPlan">已计划</span>
                        </template>
                        <!-- 优先就诊 -->
                        <template v-else-if="column.operType === 'sort'">
                            <div>
                                <span style="margin-right:10px">{{ scope.row[column.value] }}</span>
                                <div v-if="scope.row.isSort" style="display:flex;align-items: center;float:right">
                                    <img :src="sort" alt="">
                                    <span style="margin:0 5px;color:#B620E0">{{ scope.row.isSort }}</span>
                                </div>

                            </div>
                        </template>

                        <template v-else-if="column.operType === 'radio'">
                            <el-radio v-for="(opt,optIndex) in column.opts" :key="optIndex" v-model="scope.row[column.value]" :label="opt.value">{{ opt.label }}</el-radio>
                        </template>

                        <template v-else-if="column.operType === 'icon'">
                            <i :class="column.icon" :style="column.style" />
                        </template>

                        <template v-else-if="column.operType === 'popover'">
                            <el-popover v-if="scope.row[column.value] && scope.row[column.value].length > 50" placement="top-start" width="500" trigger="hover" :content="scope.row[column.value]">
                                <span slot="reference" style="cursor:pointer">{{ scope.row[column.value].substring(0,50)+'...' }}</span>
                            </el-popover>
                            <span v-else>{{ scope.row[column.value] }}</span>
                        </template>
                    </template>
                </el-table-column>

                <!-- 复杂表头 -->
                <el-table-column v-else-if="column.complex" :key="index" :label="column.label" :width="column.width" align="center">

                    <template v-for="(c2,i2) in column.list">
                        <el-table-column v-if="c2.scope" :key="i2" :sortable="c2.sortable" :label="c2.label" :width="c2.width" :prop="c2.value" align="center" :formatter="c2.formatter">
                            <template slot-scope="scope">
                                <template v-if="c2.type === 'button' || c2.operType === 'button'">
                                    <template v-for="(op, opIndex) in c2.operations">
                                        <el-button :key="opIndex" :disabled="op.formatter ? op.formatter(scope.row).disabled : false" :style="op.style" :type="op.formatter? op.formatter(scope.row).type: op.type || ''" :icon="op.icon" @click="op.func(scope.row, scope.$index)">
                                            {{ op.formatter ? op.formatter(scope.row).label : op.label ? op.label : scope.row[c2.value] }}
                                        </el-button>
                                    </template>
                                </template>
                                <!-- 医生管理-审核状态 -->
                                <el-tag v-else-if="c2.value === 'checkStatus'" :type="scope.row[c2.value]| statusFilter">{{ scope.row[c2.value] ? scope.row[c2.value] === 1 ? '通过' : '未通过' : '待审核' }}</el-tag>
                                <el-tag v-else-if="scope.row.isQaOnline === 1" :type="scope.row[c2.value]| statusFilter">{{ scope.row[c2.value] ? scope.row[c2.value] === 1 ? '通过' : '未通过' : '待审核' }}</el-tag>
                                <span v-else>未开通</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-else-if="c2.icon" :key="i2" :sortable="c2.sortable" :label="c2.label" :width="c2.width" :prop="c2.value" align="center" :formatter="c2.formatter">
                            <template slot-scope="scope">
                                <!-- 医生管理-线上诊疗权 审方发药权 -->
                                <i v-if="scope.row[c2.value] === 1" class="el-icon-check" style="color:#00AC6A;font-size:20px" />
                                <i v-else class="el-icon-close" style="color:#E02020;font-size:20px" />
                            </template>
                        </el-table-column>
                        <el-table-column v-else-if="!c2.isHidden" :key="i2" :sortable="c2.sortable" :label="c2.label" :width="c2.width" :prop="c2.value" align="center" :formatter="c2.formatter" :style="c2.style" @click.native="c2.func()" />
                    </template>

                </el-table-column>

                <el-table-column
                    v-else-if="!column.isHidden"
                    :key="index"
                    :fixed="column.fixed"
                    :prop="column.value"
                    :label="column.label"
                    :width="column.width"
                    :min-width="column.minWidth"
                    align="center"
                    :sortable="column.sortable"
                    :formatter="column.formatter"
                    :style="column.style"
                    :class-name="column.className"
                    @click.native="column.func?column.func:{}"
                />
            </template>
        </el-table>
        <div v-if="pageSize" class="pagination-footer">
            <span class="description">{{ description }}</span>
            <el-pagination :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </el-row>
</template>

<script>
import sort from '@/assets/icon_images/sort.png'
export default {
    name: 'ElTableSelf',
    filters: {
        statusFilter(status) {
            const typeMap = ['warm', 'success', 'danger']
            return typeMap[status]
        },
        statusFilter2(status) {
            const typeMap = ['danger', 'success']
            return typeMap[status]
        }
    },
    props: {
        listLoading: Boolean, // tab 加载层
        highLight: { type: Boolean, default: true },
        headerClass: { type: String, default: 'default' }, // 头部背景色Class名称，默认default
        tabType: String, // 对应列的类型，selection/index/expand
        tabLabel: String,
        tableHeight: Number, // 表格的高度
        tabSize: { type: String },
        tableData: Array, // 表格数据
        columns: Array, // 表格列配置数据,{vlaue:对应数据对象中的属性，label：对应的是标题文字，fixed:列是否固定，width:列宽， sortable：是否可排序，formatter:列格式化， className：对应的是列的样式类名}
        sortChange: { type: Function, default: () => {} }, // 点击列表头进行排序 { column, prop, order }
        description: String, // 分页脚底左侧的数据说明
        totalCount: Number, // 表格数据总数
        pageSizes: Array, // 决定每页显示的条数[10,15,20,25]
        pageSize: Number,
        spanMethod: Function,
        operType: { type: String, default: 'button' },
        getSummaries: Function,
        showSummary: { type: Boolean, default: false },
        type: { type: String, default: 'text' },
        currentPage: { type: Number, default: 1 },
        selecTable: Function,
        disabled: { type: Boolean, default: false },
        tabIndex: Function,
        cellStyle: Function,
        rowStyle: Function
    },
    data() {
        return {
            sort
        }
    },
    methods: {
        // 切换页面显示条数
        handleSizeChange(val) {
            this.$emit('pageSizeChange', val)
        },

        // 跳转页码
        handleCurrentChange(val) {
            this.$emit('currentPageChange', val)
        },

        // 复选框事件
        selectionChange(selections) {
            this.$emit('selectionChange', selections)
        },
        // 复选框选中当前行事件
        selectChange(selections, row) {
            this.$emit('selectChange', selections, row)
        },

        // 行点击
        rowClick(row, event) {
            this.$emit('rowClick', row, event)
        },

        // 行点击
        cellClick(row, column, cell, event) {
            this.$emit('cellClick', row, column, cell, event)
        },

        // 清除用户选择
        clearSelection() {
            this.$refs.selftab.clearSelection()
        },

        // 单选行高亮
        setCurrentRow(row) {
            this.$refs.selftab.setCurrentRow(row)
        },

        // 收费的输入
        handleEdit(index, value, row, pro) {
            this.$emit('number', index, value, row, pro)
        },
        changeProject(row, index) {
            this.$emit('project', row, index)
        },
        changeSelect(row) {
            this.$emit('changeSelect', row)
        },
        handleBlur(index, value) {
            this.$emit('blurCell', index, value)
        },
        // 全选事件
        selectAll(selections) {
            this.$emit('selectAll', selections)
        },
        // 远程搜索
        remoteMethod(val) {
            this.$emit('remoteMethod', val)
        }
    }
}
</script>

<style lang="scss" scoped>
.el-table-self {
    //   margin-left: 5px;
    //   margin-right: 5px;
    .tab-svg {
        width: 24px;
        height: 24px;
        cursor: pointer;
        vertical-align: middle;
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
.tableSpan {
    display: inline-block;
    width: 100%;
    height: 100%;
    cursor: pointer;
}
.isPlan {
    font-size: 12px;
    color: #fff;
    padding: 2px 5px;
    background: #c1242a;
    border-radius: 3px;
}
/deep/ .default {
    th {
        background-color: #eef5fd !important;
        color: #586276;
    }
}
/deep/ .el-table__footer-wrapper tbody td {
    background: oldlace !important;
}
</style>
