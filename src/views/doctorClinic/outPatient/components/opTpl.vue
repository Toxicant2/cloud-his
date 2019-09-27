<template>
    <div class="op-tpl">
        <div class="form-item">
            <el-radio v-model="tplType" label="0">个人模板</el-radio>
            <el-radio v-model="tplType" label="1">科室模板</el-radio>
        </div>
        <!-- <div class="form-item">
      <el-input v-model="inputValue" placeholder="模板名称">
        <i slot="append" class="el-icon-search"></i>
      </el-input>
    </div>-->
        <el-scrollbar style="height:500px;">
            <el-row class="op-th">
                <el-col :span="6">序号</el-col>
                <el-col :span="18">病历模板名称</el-col>
            </el-row>
            <template v-if="tplList.length > 0">
                <draggable v-model="tplList" :options="dragOptions" element="ul" class="op-tb clearfix" @change="onChange">
                    <li v-for="(item,index) in tplList" :key="index" class="clearfix">
                        <el-col :span="6">{{ item.sort }}</el-col>
                        <el-col :span="18">
                            {{ item.templateName }}
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
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import { getCaseTplList, deleteCaseTpl, updateCaseTplSn } from '@/api/outpatient'
export default {
    components: {
        draggable
    },
    data() {
        return {
            tplType: '0',
            inputValue: '',
            tplList: []
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
                ghostClass: 'ghost'
            }
        }
    },
    watch: {
        tplType(newVal) {
            this._getCaseTplList(newVal)
        }
    },
    mounted() {
        this._getCaseTplList(0)
        this.$root.eventHub.$on('tplSave', type => {
            this.tplType = type
            this._getCaseTplList(type)
        })
    },
    methods: {
    // 获取可选模板
        _getCaseTplList(type) {
            getCaseTplList(type).then(res => {
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
            const opTpl = row.opDrCaseTemplate
            return {
                id: opTpl.id,
                chiefCompliant: opTpl.chiefCompliant,
                healthEducation: opTpl.healthEducation,
                otherBodyExam: opTpl.otherBodyExam,
                pastHistory: opTpl.pastHistory,
                templateName: opTpl.templateName,
                templateType: opTpl.templateType,
                treatPlan: opTpl.treatPlan,
                diagnosisList: row.diagnosisTemplates,
                sort: opTpl.sort,
                presentIllness: opTpl.presentIllness,
                chinsesMedicineDialectical:opTpl.chinsesMedicineDialectical
            }
        },

        // 拖动结束
        onChange(evt) {
            const sn = evt.moved.newIndex + 1
            const id = evt.moved.element.id
            const data = {}
            data[id] = sn
            updateCaseTplSn(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('序号更新成功！')
                    this._getCaseTplList(this.tplType)
                }
            })
        },

        // 引用
        handleReference(item) {
            this.$root.eventHub.$emit('tplReference', item)
        },

        // 删除
        handleDeleteTpl(item) {
            this.$confirm(`确定删除 ${item.templateName}？`, '提示', {
                type: 'warning'
            })
                .then(() => {
                    deleteCaseTpl(item.id).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success('删除成功！')
                            this._getCaseTplList(this.tplType)
                        }
                    })
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
.op-tpl {
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
}
</style>
