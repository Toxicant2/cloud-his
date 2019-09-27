<template>
    <div>
        <patient-detail :describe-list="describeList" :describe-data="describeData" />
        <div v-if="tabType === '执行'">
            <implementTable :data-list="dataList"></implementTable>
            <div id="print">
                <div class="storage">
                    <!-- 标题 -->
                    <h1>{{printTitle}}医嘱执行单（输液、注射、雾化）</h1>
                    <!-- 表单部分 -->
                    <ul class="clearfix">
                        <li v-for="(item,index) in describeList" :key="index" style="width:25%;">{{item.label}}：{{describeData[item.value]}}</li>
                    </ul>
                    <implementTable :data-list="dataList"></implementTable>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { remove_ie_header_and_footer } from '@/utils/print'
import patientDetail from '../components/patientDetail'
import { getBabyAge, formatSex, formatDictMap } from '@/utils'
import { getNurseStationMedicalRecordPrint } from '@/api/outpatient'
import implementTable from './implementTable'
import elTableSelf from '@/components/TabComponents/index'
export default {
    props: {
        tabType: {
            type: String
        },
        id: {
            default: ''
        }
    },
    components: {
        patientDetail,
        elTableSelf,
        implementTable
    },
    data() {
        const dictData = this.$store.getters.dictData
        return {
            printTitle: '',
            describeList: [
                {
                    label: '姓名',
                    value: 'name',
                    span: 4
                },
                {
                    label: '性别',
                    value: 'sex',
                    span: 4
                },
                {
                    label: '年龄',
                    value: 'age',
                    span: 4
                },
                {
                    label: '开嘱医生',
                    value: 'doctorName',
                    span: 6
                },
                {
                    label: '挂号单号',
                    value: 'outpatientNum',
                    span: 6
                },
                {
                    label: '西医诊断',
                    value: 'diagnosis'
                }
            ],
            describeData: {},
            columns: [],
            dataList: [],
            temp_tabType: '',
            dictData
        }
    },
    watch: {
        dataList: function(val, oldVal) {
            if (val) {
                val.forEach(element => {
                    // 用法
                    this.$store.getters.dictData[144].forEach(item => {
                        if (element.usage === item.value) {
                            element.usage = item.label
                        }
                    })

                    this.$store.getters.dictData[152].forEach(item => {
                        if (element.usage === item.value) {
                            element.usage = item.label
                        }
                    })

                    // 频率
                    this.$store.getters.dictData[145].forEach(item => {
                        if (element.frequency === item.value) {
                            element.frequency = item.label
                        }
                    })
                })
            }
        },
        id: function(val) {
            if (val) {
                this.getData(val)
            }
        }
    },
    methods: {
        getData(id) {
            this.dataList = []
            this.printTitle = this.$store.getters.clinic.orgName
            getNurseStationMedicalRecordPrint(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    // 病人基本信息
                    this.describeData = Object.assign(
                        d.orgOutpRegisterDTO,
                        d.opDrCaseDTO
                    )
                    this.describeData.sex = formatSex(this.describeData.sex)
                    this.describeData.age = getBabyAge(
                        this.describeData.birthDate.split(' ')[0]
                    )

                    // 诊断
                    this.describeData.diagnosis = ''

                    d.opDrCaseDiagnosisDTOList.forEach((item, index) => {
                        this.describeData.diagnosis +=
                            index + 1 + '、' + item.diseaseName + '，'
                    })

                    this.describeData.diagnosis = this.describeData.diagnosis.substring(
                        0,
                        this.describeData.diagnosis.length - 1
                    )
                    // 表格信息
                    this.dataList = []
                    let length = 0
                    for (var key in d.collectMap) {
                        d.collectMap[key].sort(this.sortGroupSn)
                        length += d.collectMap[key].length
                        this.dataList.push({ index: key, obj: d.collectMap[key], length: length })
                    }
                    this.dataList.forEach(item => {
                        item.obj.forEach(obj => {
                            obj.usage = formatDictMap(this.dictData[144], obj.usage)
                            obj.frequency = formatDictMap(this.dictData[145], obj.frequency)
                        })
                    })
                }
            })
        },

        // 根据组号排序
        sortGroupSn(a, b) {
            return a.groupSn - b.groupSn
        },

        // 打印方法
        print() {
            if (this.dataList.length > 0) {
                if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    remove_ie_header_and_footer()
                }
                const Print = document.getElementById('print')
                const newContent = Print.innerHTML
                var style = `
                    <style type='text/css'>
                        body{
                            width:108% !important;
                        }
                    </style>`
                const oldContent = document.body.innerHTML
                document.body.innerHTML = newContent + style
                window.print()
                window.location.reload()
                document.body.innerHTML = oldContent
                return false
            } else {
                this.$message.warning('暂无相关信息可打印！')
            }
        }
    }
}
</script>
<style>
@media print {
    .clearfix li:last-child {
        width: 75% !important;
    }
}

.nur-patient-detail .content .item-content:last-child {
    width: 100% !important;
}
</style>

