<template>
  <el-dialog center :visible.sync="visible" :title="title" :width="width">
    <div class="form-item">
      <el-radio v-model="tplType" label="1">个人模板</el-radio>
      <el-radio v-model="tplType" label="0">科室模板</el-radio>
    </div>
    <div class="form-item">
      <el-input v-model="inputValue" placeholder="模板名称" @keyup.enter.native="_getCaseTplList()">
        <el-button slot="append" icon="el-icon-search" @click="_getCaseTplList()"></el-button>
        <!-- <i slot="append" class="el-icon-search" ></i> -->
      </el-input>
    </div>
    <el-scrollbar style="height:500px;">
      <el-row class="op-th">
        <el-col :span="6">序号</el-col>
        <el-col :span="18">病历模板名称</el-col>
      </el-row>
      <template v-if="tplList.length > 0">
        <draggable
          v-model="tplList"
          :options="dragOptions"
          element="ul"
          @change="onChange"
          class="op-tb clearfix"
        >
          <li v-for="(item,index) in tplList" :key="index" class="clearfix">
            <el-col :span="6">{{item.sort}}</el-col>
            <el-col :span="18">
              {{item.templateName}}
              <el-button type="text" @click="handleReference(item)">引用</el-button>
              <el-button type="text" @click="handleDeleteTpl(item)">删除</el-button>
            </el-col>
          </li>
        </draggable>
      </template>

      <template v-else>
        <div class="op-nodata">暂无数据</div>
      </template>
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import {
    getOpdrrecipeTplList,
    deleteOpdrrecipeTpl,
    modifyOpdrrecipeTpl
} from '@/api/outpatient'
import draggable from 'vuedraggable'
export default {
    components: {
        draggable
    },
    data() {
        return {
            visible: false,
            tplType: '1',
            inputValue: '',
            tplList: [],
            activeName: 10,
            recipeClass: '01'
        }
    },
    watch: {
        tplType(newVal) {
            this._getCaseTplList()
        }
    },
    props: {
        title: {
            type: String,
            default: '处方模板'
        },
        width: {
            type: String,
            default: '360px'
        }
    },
    computed: {
        dragOptions() {
            return {
                forceFallback: true,
                animation: 0,
                group: {
                    name: 'dragGroup',
                    pull: false,
                    put: true
                },
                ghostClass: 'ghost',
                onOff: true
            }
        }
    },
    methods: {
        open(activeName, recipeClass, onOff) {
            this.visible = true
            this.tplType = '1'
            this.inputValue = ''
            this.onOff = onOff
            this.activeName = activeName
            this.recipeClass = recipeClass
            this._getCaseTplList()
        },

        close() {
            this.visible = false
        },

        // 查询处方模板
        _getCaseTplList() {
            getOpdrrecipeTplList({
                templateType: this.tplType,
                templateName: this.inputValue,
                catType: this.activeName,
                recipeClass: this.recipeClass
            }).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (d.length > 0) {
                        d.forEach(item => {
                            result.push(this.renderTplRow(item))
                        })
                    }
                    this.tplList = result
                }
            })
        },

        // 生成模板行数据
        renderTplRow(row) {
            const opTpl = row.drRecipeTemplate
            const templateDetailList = []
            if (row.templateDetailList && row.templateDetailList.length > 0) {
                row.templateDetailList.forEach(item => {
                    templateDetailList.push({
                        name: item.itemName,
                        price: item.price,
                        specDose: item.dosage,
                        specDoseUnit: item.dosageUnit,
                        useFrequency: item.frequency,
                        id: item.itemId,
                        userMethod: item.usage,
                        spec: item.spec,
                        note: item.note,
                        unit: item.unit,
                        recQty: item.qty,
                        medicineType: item.medicineType,
                        days: item.days,
                        amt: item.amt,
                        dose: item.dose,
                        footNote: item.footNote
                    })
                })
            }

            return {
                id: opTpl.id,
                templateName: opTpl.templateName,
                sort: opTpl.sort,
                templateDetailList
            }
        },

        // 引用
        handleReference(item) {
            if (this.onOff) {
                this.$emit('repReference', item)
            } else {
                this.$message.warning('收费处方或作废处方不能修改，请添加新处方')
            }
        },

        // 拖动结束
        onChange(evt) {
            const sort = evt.moved.newIndex + 1
            const id = evt.moved.element.id
            const data = [{ id, sort, templateType: this.tplType }]
            modifyOpdrrecipeTpl(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('序号更新成功！')
                    this._getCaseTplList()
                }
            })
        },

        // 删除
        handleDeleteTpl(item) {
            this.$confirm(`确定删除 ${item.templateName}？`, '提示', {
                type: 'warning'
            })
                .then(() => {
                    deleteOpdrrecipeTpl(item.id).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this._getCaseTplList(this.tplType)
                        }
                    })
                })
                .catch(() => {})
        }
    },
    mounted() {}
}
</script>

<style lang="scss" scoped>
.form-item {
  margin: 10px 0;
}
.op-th {
  border: 1px solid #ebeef5;
  background-color: #eef5fd;
  div {
    color: #586276;
    padding: 5px 10px;
    text-align: center;
    &:first-child {
      border-right: 1px solid #ebeef5;
    }
  }
}
.op-tb {
  border-left: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  display: block;
  li {
    border-bottom: 1px solid #ebeef5;
    line-height: 28px;
    div {
      text-align: center;
      vertical-align: middle;
      &:last-child {
        border-left: 1px solid #ebeef5;
      }
    }
  }
}
.op-nodata {
  line-height: 36px;
  text-align: center;
}
</style>

