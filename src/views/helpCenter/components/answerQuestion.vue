<template>
  <el-row class="tab1 " v-loading="loading">
    <direct-search ref="form" :label-position="'right'" :label-width="'100px'" :form-style="{'text-align':'right','margin-top':'9px'}" :forms="searchlist" @handleSearch="handleSearchFuzzy" />
    <div :class="{isAdmin:isAdmin}">
      <el-button type="primary" class="addBtn" @click="handleAddType" v-if="isAdmin">+ 新增答疑分类</el-button>
      <el-button type="primary" class="addBtn" @click="handleAddQuestion" v-if="isAdmin">+ 新增问题&答案</el-button>

      <el-tabs v-model="activeName" :tab-position="tabPosition" @tab-click="handlePaneClick">
        <el-tab-pane :label="tab.name" :name="tab.value" v-for="(tab,pIndex) in tabPane" :key="pIndex">
          <span slot="label" v-if="tab.value === activeName && isAdmin" class="isEdit">
            <span>{{tab.name}}</span>
            <i class="el-icon-edit-outline" @click.stop="handleAddType(tab)"></i>
            <i class="el-icon-delete" @click.stop="handleDelType(tab)"></i>
          </span>
          <ul class="list">
            <li v-for="(opt,oIndex) in tab.opts" :key="oIndex" @click="isAdmin?handleSelect(pIndex,oIndex):{}" :class="{}">

              <div class="info">
                <p>{{oIndex + 1}}. {{opt.title}}</p>
                <span style="text-indent:1em">{{opt.content}}</span>
              </div>

              <div class="btn" v-if="opt.isShow">
                <div @click.stop="handleAddQuestion(opt)">
                  <el-button type="primary" size="mini" icon="el-icon-edit-outline" circle></el-button>
                  <small style="color:#66b1ff">修改</small>
                </div>
                <div @click.stop="handleDel(opt)">
                  <el-button type="danger" size="mini" icon="el-icon-delete" circle></el-button>
                  <small style="color:#f56c6c">删除</small>
                </div>

              </div>
            </li>
          </ul>
          <p style="height:50px;font-size:14px;line-height:50px;text-align:center" v-if="!tab.opts || tab.opts.length <= 0">无数据</p>
          <div class="pagination-footer">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageIndex" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalCount"></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 新增答疑分类 问题 -->
      <dialog-form ref="dialogForm" :title="title" :formData="formData" :labelWidth="'90px'" :width="'450px'" @handleConfirm="handleConfirm" :close-modal="false"></dialog-form>
    </div>
  </el-row>
</template>
<script>
import directSearch from '@/components/FormComponents/directSearch'
import paginationMixin from '@/components/TabComponents/mixin'
import dialogForm from '@/components/DialogComponents/Form'
import { getPage, saveQuestion, saveType, getTypeList } from '@/api/upms'
export default {
    components: { dialogForm, directSearch },
    props: {
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    mixins: [paginationMixin],
    data() {
        return {
            searchlist: [
                {
                    type: 'input',
                    label: '',
                    prop: 'title',
                    placeholder: '问题、答案',
                    slot: {
                        slot: 'append',
                        type: 'button',
                        icon: 'el-icon-search'
                    }
                }
            ],
            tabPosition: 'left',
            tabPane: [],
            activeName: '',
            title: '',
            formData: [],
            formQuestionColumns: [
                {
                    type: 'input',
                    autosize: { minRows: 1, maxRows: 3 },
                    inputType: 'textarea',
                    name: '问题名称',
                    field: 'questions',
                    rules: [
                        {
                            required: true,
                            message: '问题名称必填',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'input',
                    name: '问题解答',
                    autosize: { minRows: 1, maxRows: 3 },
                    inputType: 'textarea',
                    field: 'answer',
                    rules: [
                        {
                            required: true,
                            message: '问题解答必填',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            formTypeColumns: [
                {
                    type: 'input',
                    name: '答疑分类',
                    field: 'name',
                    rules: [
                        {
                            required: true,
                            message: '答疑分类必填',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            typeId: 0,
            questionId: 0,
            typeIndex: '',
            totalCount: 0,
            form: {},
            loading: false,
            onOff: false // 判断是否是全局搜索
        }
    },
    methods: {
    // 查询分类
        handleSearch() {
            this.loading = true
            getTypeList().then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.value = item.id.toString()
                            item.opts = []
                        })
                        this.activeName = d[0].value
                        this.handlePaneClick({ index: 0 })
                    }
                    this.tabPane = d
                }
            })
        },
        // 查询分类下的问题答疑
        handlePaneClick(pane) {
            this.loading = true
            this.pageIndex = 1
            this.form = {}
            this.$refs.form.initforms()
            this.handleSearchQuestion(pane)
        },
        handleSearchFuzzy(form) {
            this.loading = true
            this.form = form
            this.handleSearchOnoff()
        },
        handleSearchOnoff() {
            const params = {
                pageNo: this.pageIndex,
                pageSize: this.pageSize
            }
            const data = Object.assign(params, this.form)
            getPage(data).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS.records
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.title = item.questions
                            item.content = item.answer
                            item.isShow = false
                        })
                    }
                    this.tabPane[this.typeIndex].opts = d
                    this.totalCount = res.ITEMS.total
                }
            })
            this.typeIndex = this.typeIndex
            this.onOff = true
        },
        handleSearchQuestion(pane) {
            this.onOff = false
            const params = {
                name: this.activeName,
                pageNo: this.pageIndex,
                pageSize: this.pageSize
            }
            const data = Object.assign(params, this.form)
            getPage(data).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS.records
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.title = item.questions
                            item.content = item.answer
                            item.isShow = false
                        })
                    }
                    this.tabPane[pane.index].opts = d
                    this.totalCount = res.ITEMS.total
                }
            })
            this.typeIndex = pane.index
        },

        // 选中指定的问题
        handleSelect(pIndex, oIndex) {
            this.tabPane.forEach(item => {
                if (item.opts && item.opts.length > 0) {
                    item.opts.forEach(opt => {
                        opt.isShow = false
                    })
                }
            })
            this.tabPane[pIndex].opts[oIndex].isShow = true
        },

        // 新增修改答疑分类
        handleAddType(tab) {
            this.typeId = tab.id
            this.title = this.typeId ? '修改答疑分类' : '新增答疑分类'
            this.formData = this.formTypeColumns
            this.$refs.dialogForm.open()
            this.$nextTick(() => {
                if (this.typeId) {
                    const params = {
                        name: tab.name
                    }
                    this.$refs.dialogForm.initforms(params)
                }
            })
        },

        // 删除答疑分类
        handleDelType(tab) {
            this.$confirm('确认删除该答疑分类吗?', '删除确认').then(() => {
                const data = {
                    id: tab.id,
                    isDeleted: 1
                }
                saveType(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('删除成功')
                    }
                    this.$nextTick(() => {
                        this.handleSearch()
                    })
                })
            })
        },

        // 新增修改问题答疑
        handleAddQuestion(tab) {
            this.questionId = tab.id
            this.title = this.questionId ? '修改问题&答案' : '新增问题&答案'
            this.formData = this.formQuestionColumns
            this.$refs.dialogForm.open()
            this.$nextTick(() => {
                if (this.questionId) {
                    const params = {
                        questions: tab.questions,
                        answer: tab.answer
                    }
                    this.$refs.dialogForm.initforms(params)
                }
            })
        },

        // 删除问题答疑
        handleDel(tab) {
            this.$confirm('确认删除该问题&答案吗?', '删除确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const data = {
                    id: tab.id,
                    questionsType: tab.questionsType,
                    isDeleted: 1
                }
                saveQuestion(data).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success('删除成功')
                    }
                    this.$nextTick(() => {
                        this.handlePaneClick({ index: this.typeIndex })
                    })
                })
            })
        },

        // 保存
        handleConfirm(form) {
            if (this.title === '新增答疑分类' || this.title === '修改答疑分类') {
                form.name = form.name.trim()
                const data = Object.assign({}, form)
                data.id = this.typeId ? this.typeId : 0
                if (!form.name || form.name.trim().length === 0) {
                    this.$message.warning('请输入有效的名字')
                    this.$refs.dialogForm.loading = false
                    return false
                }
                saveType(data)
                    .then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.$refs.dialogForm.close()
                        }
                        this.$nextTick(() => {
                            this.handleSearch()
                        })
                    })
                    .catch(() => {
                        this.$refs.dialogForm.loading = false
                    })
            } else {
                form.answer = form.answer.trim()
                form.questions = form.questions.trim()
                const data = Object.assign({}, form)
                data.id = this.questionId ? this.questionId : 0
                data.questionsType = this.activeName || 0
                if (
                    !form.questions ||
          !form.answer ||
          form.questions.trim().length === 0 ||
          form.answer.trim().length === 0
                ) {
                    this.$message.warning('请输入有效的名字')
                    this.$refs.dialogForm.loading = false
                    return false
                }
                saveQuestion(data)
                    .then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.$refs.dialogForm.close()
                        }
                        this.$nextTick(() => {
                            this.handlePaneClick({ index: this.typeIndex })
                        })
                    })
                    .catch(() => {
                        this.$refs.dialogForm.loading = false
                    })
            }
        },

        // 跳转页码
        handleCurrentChange(val) {
            this.pageIndex = val
            if (this.onOff) {
                this.handleSearchOnoff()
            } else {
                this.handleSearchQuestion({ index: this.typeIndex })
            }
        },

        // 切换页面显示条数
        handleSizeChange(val) {
            this.pageSize = val
            this.handleSearchQuestion({ index: this.typeIndex })
        }
    },
    mounted() {
        this.handleSearch()
    }
}
</script>

<style scoped lang="scss">
.tab1 {
  position: relative;
  .addBtn {
    position: absolute;
    top: 9px;
    z-index: 4;
  }
  .addBtn:nth-of-type(1) {
    left: 10px;
    width: 160px;
    text-align: center;
  }
  .addBtn:nth-of-type(2) {
    right: 260px;
  }
  .isEdit {
    span {
      width: 100px;
      display: inline-block;
      white-space: pre-wrap;
      line-height: 20px;
      padding: 5px 0;
      i {
        margin-right: 5px;
      }
    }
  }
}

.list {
  list-style: none;

  li {
    border-bottom: 1px solid #ccc;
    padding: 10px 10px;
    overflow: hidden;
    // background: #f3f3f3;
    .info {
      float: left;
      width: 90%;
      p {
        color: #303030;
        font-weight: bold;
        margin: 5px 0;
        font-size: 14px;
      }
      span {
        display: block;
        color: #4e4e4e;
        margin: 7px 0;
        font-size: 12px;
        line-height: 18px;
      }
    }

    .btn {
      float: right;
      div {
        float: left;
        text-align: center;
        margin-right: 10px;
      }
      button {
        position: relative;
        width: auto;
        display: block;
        left: 0;
        top: 5px;
      }
      small {
        display: block;
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }
}
.isAdmin {
  li:nth-of-type(1) {
    border-top: 1px dashed #ccc;
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
<style lang="scss">
.tab1 {
  .el-tabs__header.is-left {
    margin-right: 0;
  }
  .el-tabs__content {
    border: none;
  }
  .el-tabs__nav.is-left {
    padding: 10px;
    padding-bottom: 5px;
    min-height: 600px;
    width: 180px;
  }
  .is-active {
    width: 100%;
    height: auto;
    background: rgb(226, 242, 255);
    color: rgb(4, 153, 252);
    margin: auto;
    border-radius: 5px;
  }
  .el-tabs__item {
    line-height: 34px;
    height: 34px;
    margin-bottom: 5px;
  }
}
.isAdmin {
  .el-tabs--left .el-tabs__nav-wrap.is-left,
  .el-tabs__content {
    // padding-top: 50px;
  }
  .el-tabs__content {
    border-bottom: none !important;
  }
}
</style>
