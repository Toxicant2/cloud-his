<template>
    <el-row v-loading="loading" class='follow'>
        <!-- 基本信息 -->
        <div class="info">
            <p><span>基<br >本<br >信<br >息</span></p>
            <el-row :gutter="20">
                <el-col v-for="(item,index) in patientInfoColumns" :span="item.spanCount?item.spanCount:8" :key="index">{{ item.label }}：{{ patientInfoData[item.value] }}</el-col>
            </el-row>
        </div>
        <!-- 详细信息 -->
        <div class="info">
            <p><span>详<br >细<br >信<br >息</span></p>
            <el-row>
                <el-col v-for="(item,index) in detailInfoColumns" :span="item.spanCount?item.spanCount:8" :key="index">{{ item.label }}：{{ patientInfoData[item.value] }}</el-col>
            </el-row>
        </div>

        <!-- 亲友关系 -->
        <div class="info">
            <p><span>亲<br >友<br >关<br >系</span></p>
            <el-row>
                <el-button size="mini" @click="handleAddRelation">添加亲友</el-button>
                <el-table-self :columns="friendColumns" :table-data="friendData" :table-height="100"/>
            </el-row>
        </div>

        <el-dialog ref="relationForm" title="新增患者关系" top="300px" :visible.sync="addRelationDialogVisible" width="700px" center class="chargeDetail" append-to-body @close="close">
            <el-form ref="form" :model="form" label-width="100px" inline size="mini">
                <el-form-item v-for="(item,index) in formColumns" :label="item.label?`${item.label}：`:''" :key="index" :prop="item.prop" :rules="item.rules">
                    <!-- 模糊查询 -->
                    <el-autocomplete v-if="item.type === 'autocomplete'" v-model="form[item.prop]" style="width:200px;" :fetch-suggestions="item.func" placeholder="请输入姓名" @select="handleSelect">
                        <template slot-scope="{item}">
                            <span style="font-size:12px">{{ item.name }}</span>
                            <span style="font-size:12px">{{ item.formatSex }}</span>
                            <span style="font-size:12px">{{ item.age }}</span>
                            <span style="font-size:12px">{{ item.phone }}</span>
                        </template>
                    </el-autocomplete>

                    <el-input v-if="item.type==='input'" v-model="form[item.prop]" style="width:200px;"/>
                    <el-select v-if="item.type==='select'" v-model="form[item.prop]" style="width:200px;">
                        <el-option v-for="(opt,o) in item.opts" :key="o" :label="opt.label" :value="opt.value"/>
                    </el-select>

                    <el-date-picker v-if="item.type==='date'" type="date" v-model="form[item.prop]" placeholder="选择日期" :value-format="item.valueFormat" :format="item.format" :picker-options="item.options" style="width:200px;"/>

                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="close">取消</el-button>
                <el-button size="mini" type="primary" @click="handleAddFriend">添加</el-button>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { addFamily, getFamilyList, selectByName, delFamily } from '@/api/arclinic'

import elTableSelf from '@/components/TabComponents/index'
import directSearch from '@/components/FormComponents/directSearch'

import {
    defaultPickOpts,
    param,
    param2Obj,
    formatSex,
    getBabyAge,
    formatDictMap,
    formatRegion
} from '@/utils'
export default {
    components: {
        elTableSelf,
        directSearch
    },
    data() {
    // const dictMap = {
    //     9: [], // 性别
    //     25: [], // 与患者关系
    //     131: [], // 证件类型
    //     20: [], // 职业
    //     107: [], // 婚姻
    //     29: [], // 民族
    //     60: [], // ABO血型
    //     125: [], // RH血型
    //     30: [] // 来源
    // }
    // let str = ''
    // for (const key in dictMap) {
    //     str += `dictId=${key}&`
    // }
    // str = str.substring(0, str.length - 1)
    // getDictByIdList(str).then(res => {
    //     if (res.STATUS === '1') {
    //         const d = res.ITEMS
    //         if (d && d.length > 0) {
    //             d.forEach(item => {
    //                 if (item.dictId === 25) {
    //                     dictMap[item.dictId].push({
    //                         value: param({
    //                             label: item.name,
    //                             value: item.code
    //                         }),
    //                         label: item.name
    //                     })
    //                 } else {
    //                     dictMap[item.dictId].push({
    //                         value: item.code,
    //                         label: item.name
    //                     })
    //                 }
    //             })
    //         }
    //     }
    // })
        const dictMap = this.$store.getters.dictData

        return {
            loading: false,
            addRelationDialogVisible: false,
            patientInfoColumns: [
                { label: '姓名', value: 'name' },
                { label: '性别', value: 'sex' },
                { label: '病历号', value: 'opCaseNum' },
                { label: '年龄', value: 'age' },
                { label: '手机号', value: 'phone' },
                { label: '来源', value: 'patientSources' },
                { label: '联系人', value: 'contactMan' },
                { label: '联系电话', value: 'contactManTel' }
            ],
            patientInfoData: {},

            detailInfoColumns: [
                { label: '证件类型', value: 'idNumType' },
                { label: '证件号码', value: 'idNum' },
                { label: '病人类别', value: 'commercialInsuranceType' },
                { label: '民族', value: 'nation' },
                { label: '职业', value: 'occupation' },
                { label: '婚姻', value: 'matrialStatus' },
                { label: 'ABO血型', value: 'bloodType' },
                { label: 'RH血型', value: 'bloodTypeRh' },
                { label: '单位名称', value: 'workOrg' },
                { label: '住址', value: 'region', spanCount: 24 }
            ],

            friendColumns: [
                {
                    label: '关系',
                    value: 'relationName'
                },
                {
                    label: '关系人姓名',
                    value: 'name'
                },
                {
                    label: '性别',
                    value: 'sex'
                },
                {
                    label: '手机',
                    value: 'phone'
                },
                {
                    label: '操作',
                    align: 'center',
                    operType: 'button',
                    operations: [
                        {
                            label: '删除',
                            type: 'text',
                            func: this.handleDelRelation
                        }
                    ]
                }
            ],
            friendData: [],
            formColumns: [
                {
                    type: 'autocomplete',
                    label: '姓名',
                    prop: 'name',
                    placeholder: '姓名',
                    rules: [{ required: true, message: '请输入姓名', triger: 'blur' }],
                    func: this.querySearchAsync
                },
                {
                    type: 'select',
                    label: '性别',
                    prop: 'sex',
                    rules: [{ required: true, message: '请选择性别', triger: 'change' }],
                    opts: dictMap[9]
                },
                {
                    type: 'input',
                    label: '手机号',
                    prop: 'phone',
                    rules: [
                        {
                            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                            message: '请输入正确的手机号',
                            trigger: 'blur'
                        },
                        {
                            required: true,
                            message: '请输入手机号',
                            trigger: 'blur'
                        }
                    ]
                },
                {
                    type: 'date',
                    label: '年龄',
                    prop: 'birthDate',
                    rules: [{ required: true, message: '请选择出生年月日', triger: 'blur' }],
                    options: defaultPickOpts.opts,
                    format: defaultPickOpts.format,
                    valueFormat: defaultPickOpts.valueFormat
                },
                {
                    type: 'select',
                    label: '亲友关系',
                    prop: 'relation',
                    opts: dictMap[25]
                }
            ],
            form: {},
            dictMap,
            cacheIdNumType: ''
        }
    },
    methods: {
        close() {
            this.form = {}
            this.addRelationDialogVisible = false
        },
        handleAddRelation() {
            this.addRelationDialogVisible = true
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },
        initInfo(info) {
            this.loading = true
            this.patientFollowInfo = Object.assign(info)
            this.patientInfoData = Object.assign(this.patientFollowInfo.patient)
            this.friendData = this.patientFollowInfo.familyList
            if (this.friendData && this.friendData.length > 0) {
                this.friendData.forEach(item => {
                    item.sex = formatSex(String(item.sex))
                })
            }

            this.patientInfoData.idNumType = formatDictMap(
                this.dictMap[131],
                this.patientInfoData.idNumType
            )
            this.patientInfoData.nation = formatDictMap(this.dictMap[29], this.patientInfoData.nation)
            this.patientInfoData.matrialStatus = formatDictMap(
                this.dictMap[107],
                this.patientInfoData.matrialStatus
            )
            this.patientInfoData.occupation = formatDictMap(
                this.dictMap[20],
                this.patientInfoData.occupation
            )
            this.patientInfoData.bloodType = formatDictMap(
                this.dictMap[60],
                this.patientInfoData.bloodType
            )
            this.patientInfoData.bloodTypeRh = formatDictMap(
                this.dictMap[125],
                this.patientInfoData.bloodTypeRh
            )
            this.patientInfoData.patientSources = formatDictMap(
                this.dictMap[30],
                this.patientInfoData.patientSources
            )
            this.patientInfoData.region =
        formatRegion(this.patientInfoData.region) + this.patientInfoData.familyAddr

            this.$nextTick(() => {
                this.loading = false
            })
        },
        // 添加亲友
        handleAddFriend() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    const data = Object.assign({}, this.form)
                    data.relationName = param2Obj(data.relation).label
                    data.relationCode = param2Obj(data.relation).value
                    data.patientId = this.patientFollowInfo.patient.id
                    data.isShare = 0
                    delete data.relation
                    addFamily(data).then(res => {
                        if (res.STATUS === '1') {
                            this.getFamily()
                            this.$message.success(res.MESSAGE)
                            this.form = {}
                            this.addRelationDialogVisible = false
                        }
                    })
                }
            })
        },

        // 获取亲友关系
        getFamily() {
            this.loading = true
            getFamilyList(this.patientFollowInfo.patient.id).then(res => {
                this.loading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            item.sex = formatSex(String(item.sex))
                        })
                    }
                    this.friendData = d
                }
            })
        },

        // 患者查询
        querySearchAsync(queryString, cb) {
            if (queryString) {
                let nameResults = []
                selectByName(queryString).then(res => {
                    if (res.STATUS === '1') {
                        const d = res.ITEMS
                        if (d && d.length > 0) {
                            nameResults = Object.assign(d)
                            d.forEach((item, index) => {
                                nameResults[index].value = item.name
                                nameResults[index].formatSex = formatSex(item.sex)
                                nameResults[index].age = getBabyAge(item.birthDate)
                            })
                        }
                        cb(nameResults)
                    }
                })
            } else {
                cb([])
            }
        },

        handleSelect(d) {
            if (d) {
                this.form = {
                    name: d.name,
                    sex: d.sex,
                    birthDate: d.birthDate,
                    phone: d.phone
                }
            }
        },
        // 删除患者亲友
        handleDelRelation(row) {
            this.$confirm('确认删除?', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.loading = true
                    delFamily(row.id).then(res => {
                        this.loading = false
                        if (res.STATUS === '1') {
                            this.$message.success(res.MESSAGE)
                            this.getFamily()
                        }
                    })
                })
                .catch(() => {})
        }
    }
}
</script>

<style scoped lang="scss">
.info {
  height: 120px;
  width: 100%;
  margin: auto;
  border: 1px solid #d8dcdf;
  overflow: hidden;
  background: #fff;
  margin-bottom: 15px;
  p {
    text-align: center;
    width: 4%;
    float: left;
    overflow: hidden;
    height: 100%;
    background: #0097ff;
    display: table;
    span {
      color: #fff;
      font-size: 14px;
      display: table-cell;
      vertical-align: middle;
    }
  }
  .el-row {
    float: left;
    width: 96%;
    padding: 0 2%;

    height: 100%;
    .el-col {
      //   margin: 0 2.5%;
      margin-top: 20px;
      font-size: 12px;
    }
  }
}
.info:nth-of-type(2) {
  p {
    background: #24ac89;
  }
  .el-col {
    margin-top: 14px;
  }
}
.info:nth-of-type(3) {
  height: 150px;
  margin-bottom: 0;
  p {
    background: #f8931f;
  }
  button {
    float: right;
    margin: 5px 0;
  }
  .el-row {
    .el-row {
      padding: 0;
      width: 100%;
    }
  }
}
</style>
<style>
.follow .el-table-self {
  max-height: 100px;
}

.follow .el-table--small td,
.follow table th {
  padding: 0;
}

.follow .el-table__empty-block {
  min-height: 25px;
}
.follow .el-table::before {
  height: 0;
}
</style>
