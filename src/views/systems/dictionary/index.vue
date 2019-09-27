<template>
    <el-row class="page-container dict">
        <el-row class="page-main" :gutter="20">
             <el-col :span="6">
                 <el-row>
                    <el-col :span="24" class="left-content">
                        <el-col :span="24" class="left-title">
                            字典列表
                        </el-col>
                        <el-col :span="24" class="left-search">
                            <el-input v-model="searchVal" :placeholder="placeholder" class="search-class">
                            </el-input>
                        </el-col>
                        <el-col class="dict-list">
                            <el-col v-for="(item,index) in dictList" :key="index" class="dict-item">
                                <span @click="handClick(index,item.id,item.dictName)" :class="{active:index==isActive}" style="cursor:pointer">
                                    {{item.dictName}}
                                </span>
                            </el-col>
                        </el-col>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="18">
                <el-button class="add-class" type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
                <direct-search ref="form" :label-position="'right'" :forms="searchList" @handleSearch="handleFormSearch" :label-width="'100px'" :form-style="{'text-align':'right','float':'right','margin':'10px 0px 20px 0'}"/>
                <div class="type-title"> {{name}}</div>
                <el-table-self :list-loading="listLoading" :tab-type="'index'" :tab-label="'序号'" :table-data="tabData" :columns="tabColumns"   :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                <dialog-form ref="edit" :width="'450px'" :title="dictTitle" :form-data="formData"  :form-edit="formEdit" @handleConfirm="handleConfirm" />
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import {
    getDictList,
    getDictById,
    delDictDetail,
    updateDictStatus,
    updateDictDetail
} from '@/api/catalog'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import { mapGetters } from 'vuex'
import paginationMixin from '@/components/TabComponents/mixin'
export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm
    },
    mixins: [paginationMixin],
    data() {
        return {
            total: 0,
            searchList: [
                {
                    type: 'select',
                    label: '状态',
                    prop: 'is_use',
                    placeholder: '请选择',
                    opts: [
                        {
                            value: '',
                            label: '全部'
                        },
                        {
                            value: 1,
                            label: '启用'
                        },
                        {
                            value: 0,
                            label: '停用'
                        }
                    ]
                },
                {
                    type: 'input',
                    label: '',
                    prop: 'name',
                    placeholder: '编码/名称/拼音码',
                    labelWidth: '0',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            dictTitle: '',
            isActive: -1,
            dictList: [],
            dictId: '',
            searchVal: '',
            placeholder: '请输入字典关键字',
            listLoading: false,
            tabData: [],
            name: '',
            tabColumns: [
                {
                    value: 'code',
                    label: '代码',
                    align: 'center'
                },
                {
                    value: 'name',
                    label: '名称',
                    align: 'center'
                },
                {
                    value: 'spellCode',
                    label: '拼音码',
                    align: 'center'
                },
                {
                    value: 'sort',
                    label: '排序',
                    align: 'center'
                },
                {
                    value: 'note',
                    label: '说明',
                    align: 'center'
                },
                {
                    label: '操作',
                    fixed: 'right',
                    align: 'center',
                    width: 280,
                    operType: 'button',
                    operations: [
                        {
                            func: this.handleStop,
                            formatter(row) {
                                return {
                                    label: row.isUse === 1 ? '停用' : '启用',
                                    type: row.isUse === 1 ? 'danger' : 'primary'
                                }
                            }
                        },
                        {
                            label: '编辑',
                            type: 'primary',
                            func: this.handleEdit
                        },
                        {
                            func: this.handleDel,
                            label: '删除',
                            type: 'danger'
                        }
                    ]
                }
            ],
            formEdit: {},
            formData: [
                {
                    type: 'input',
                    name: '字典名称',
                    field: 'name',
                    rules: [{ required: true, message: '字典名称必填' }]
                },
                {
                    type: 'input',
                    name: '代码',
                    rules: [{ required: true, message: '代码必填' }],
                    field: 'code',
                    disabled: true
                },
                {
                    type: 'input',
                    name: '拼音码',
                    rules: [{ required: true, message: '拼音码必填' }],
                    field: 'spellCode'
                },
                {
                    type: 'input',
                    name: '排序',
                    field: 'sort',
                    rules: [{ required: true, message: '排序必选' }]
                },
                {
                    type: 'input',
                    name: '说明',
                    field: 'note'
                }
            ],
            cacheForm: {}
        }
    },
    computed: {
        ...mapGetters(['dictData'])
    },
    watch: {
        searchVal: function(val, oldVal) {
            if (val !== oldVal) {
                this.getDictList()
            }
        }
    },
    methods: {
    // 获得字典列表
        getDictList() {
            const data = { pageNo: 1, pageSize: 10000 }
            if (this.searchVal) {
                data.dictName = this.searchVal
            }
            getDictList(data).then(res => {
                if (res.STATUS === '1') {
                    this.dictList = res.ITEMS.records
                }
            })
        },

        // 点击左侧列表
        handClick(index, id, name) {
            this.name = name
            this.cacheForm = {}
            this.isActive = index
            this.dictId = id
            this.handleSearch(id)
        },

        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        // 查询 获得字典列表详情-列表
        handleSearch(form) {
            if (this.dictId) {
                this.cacheForm = this.cacheForm || form
                const params = Object.assign(this.cacheForm, form)
                params.pageNo = this.pageIndex
                params.pageSize = this.pageSize
                params.dictId = this.dictId
                getDictById(params).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        this.tabData = d.records
                        this.total = d.total
                    }
                })
            } else {
                this.$message.warning('请选择左侧具体字典')
            }
        },

        // 修改停用、启用状态
        handleStop(row) {
            const data = { id: row.id }
            updateDictStatus(data).then(res => {
                this.successCallback(res, '修改成功')
            })
        },
        // 编辑
        handleEdit(row) {
            this.formData[1].disabled = true
            this.dictTitle = `编辑${this.name}字典`
            this.formEdit = {
                id: row.id,
                code: row.code,
                name: row.name,
                spellCode: row.spellCode,
                sort: row.sort,
                note: row.note
            }
            this.$refs.edit.open()
        },
        // 删除
        handleDel(row) {
            var id = [row.id]
            delDictDetail(id).then(res => {
                this.successCallback(res, '删除成功')
            })
        },

        // 新增
        handleAdd() {
            this.formData[1].disabled = false
            this.dictTitle = `新增${name}字典`
            this.formEdit = {}
            if (this.dictId) {
                this.$refs.edit.open()
            } else {
                this.$message.warning('请选择左侧具体字典')
            }
        },
        // 保存
        handleConfirm(form) {
            var msg = ''
            form.id = form.id ? form.id : 0
            msg = form.id ? '修改成功' : '保存成功'
            form.dictId = this.dictId
            updateDictDetail(form).then(res => {
                this.successCallback(res, msg)
            })
        },

        // 保存成功
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$message.success(msg)
                this.$refs.edit.close()
            }
        }
    },
    mounted() {
        this.getDictList()
    }
}
</script>

<style lang="scss">
.addClass {
  text-align: right;
  margin: 10px 6px 15px 0px;
}
.dict {
  .left-content {
    border: 1px solid #ebeef5;
    .left-title {
      height: 40px;
      line-height: 40px;
      text-align: center;
      background-color: #efefef;
    }
    .left-search {
      font-size: 14px;
      margin: 10px auto;
      text-align: center;
      .search-class {
        width: 90%;
      }
    }
    .dict-list {
      min-height: 600px;
      max-height: 650px;
      overflow-y: auto;
      overflow-x: hidden;
      .dict-item {
        font-size: 14px;
        margin: 0 0 10px 5%;
        text-align: left;
      }
    }
  }
  .active {
    color: #0a98ff;
  }
  .add-class {
    margin: 10px 0px 20px;
  }
  .type-title{
      margin:10px 5px;
      margin-bottom: 20px;
      font-size: 16px;
  }
}
</style>
