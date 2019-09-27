<template>
    <div v-if="tabType !== '门诊收费清单'&&tabType !== '执行'" class="outpatientBill">
        <patient-detail :describe-list="describeList" :describe-data="describeData" />
        <el-tabs v-if="tabType == '门诊处方'" v-model="activeName" style="margin-top:15px;" @tab-click="handleSwitch">
            <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                <el-table-self ref="multipleTable" :columns="columns" :table-data="dataList" :tab-type="tabTypes" @selectionChange="selectionChange"/>
            </el-tab-pane>
        </el-tabs>
        <div style="margin-top:15px;">
            <el-table-self v-if="tabType !== '门诊处方'" ref="multipleTable" :columns="columns" :table-data="dataList" :tab-type="tabTypes" @selectionChange="selectionChange" />
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import patientDetail from '../components/patientDetail'
import { remove_ie_header_and_footer } from '@/utils/print'
import elTableSelf from '@/components/TabComponents/index'
import { getNurseStationthreeDetail,nurseStationExecute } from '@/api/outpatient'
import { formatDictMap } from '@/utils'
import { formatSex, getBabyAge,deepClone } from '@/utils'
export default {
    components: {
        patientDetail,
        elTableSelf
    },
    props: {
        tabType: {
            type: String
        },
        id: {
            default: ''
        },
        status:{
            default:''
        }
    },
    data() {
        return {
            tabTypes:this.$route.params.type === 'noExecute'?'selection':'',
            tabMapOpts: [],
            activeName: 'tab1',
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
                    label: '西医诊断',
                    value: 'allergyName',
                    span: 6
                },
                {
                    label: '过敏史',
                    value: 'allergyStr',
                    span: 6
                }
            ],
            // 门诊处方
            prescriptionsColumns: [
                {
                    value: 'groupSn',
                    width: 80,
                    label: '组号'
                },
                {
                    value: 'itemName',
                    label: '项目名称'
                },
                {
                    value: 'spec',
                    label: '规格'
                },
                {
                    value: 'usage',
                    label: '用法',
                    width: 100
                },
                {
                    value: 'aaa',
                    label: '滴/每分钟',
                    width: 80
                },
                {
                    value: 'dosage',
                    label: '剂量'
                },
                {
                    value: 'frequency',
                    label: '频率',
                    width: 120
                },
                {
                    value: 'days',
                    label: '天数',
                    width: 80
                },
                {
                    value: 'qty',
                    label: '总量',
                    width: 80
                },
                {
                    value: 'note',
                    label: '备注'
                },
                {
                    value: 'skinTest',
                    label: '皮试'
                }
            ],

            // 治疗单
            TreatmentColumns: [
                {
                    value: 'groupSn',
                    width: 80,
                    label: '组号'
                },
                {
                    value: 'itemName',
                    label: '项目名称'
                },
                {
                    value: 'qty',
                    label: '数量'
                },
                {
                    value: 'unit',
                    label: '单位'
                },
                {
                    value: 'note',
                    label: '说明'
                }
            ],

            // 检查检验
            examColumns: [
                {
                    value: 'groupSn',
                    width: 80,
                    label: '组号'
                },
                {
                    value: 'itemName',
                    label: '项目名称'
                },
                {
                    value: 'aaaa',
                    label: '标本'
                },
                {
                    value: 'price',
                    label: '单价'
                }
            ],
            injectionColumns: [],
            temp_tabType: '',
            columns: [],
            printObj: {},
            result: [],
            tableDataList: [],
            dataList: [],
            opDrRecipeDetailList: [],
            totalAmt: 0,
            describeData: {},
            recipeListMap: [],
            reload: true,
            showPrescriptionAmount: this.commonUtil.getConfigValue('showPrescriptionAmount'),
            selections:[],
            index:0
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
        tabType(val) {
            this.temp_tabType = val
            this.changeTabType(val)
        },
        id: function(val) {
            if (val && (this.status === 0|| this.status === 1)) {
                this.getData(val,this.status)
            }
        },
        status:function(val){
            if((val === 0 || val === 1) && this.id){
                 this.getData(this.id,val)
            }
        }
    },
    methods: {
        changeTabType(val) {
            this.tabMapOpts = []
            switch (val) {
                case '门诊处方':
                    this.columns = this.prescriptionsColumns
                    this.tableDataList = this.result['10']
                    if (this.tableDataList && this.tableDataList.length > 0) {
                        this.dataList = this.tableDataList[this.index]
                        this.toggleSelection(this.dataList, this.index)
                        this.tableDataList.forEach((item, index) => {
                            this.tabMapOpts.push({ label: '处方' + (index + 1), key: 'tab' + (index + 1) })
                        })
                    }
                    // if (this.result['10'] && this.result['10'].length > 0) {
                    //     this.dataList = this.result['10'][0]
                    //     this.toggleSelection(this.dataList, 0)
                    //     this.result['10'].forEach((item, index) => {
                    //         this.tabMapOpts.push({ label: '处方' + (index + 1), key: 'tab' + (index + 1) })
                    //     })
                    // }
                    break
                case '注射单':
                    this.columns = this.prescriptionsColumns
                    this.dataList = this.opDrRecipeDetailList
                    this.$nextTick(() =>{
                        this.toggleSelection(this.dataList)
                    })
                    
                    break
                case '治疗单':
                    this.columns = this.TreatmentColumns
                    this.dataList = this.result['40']
                    this.toggleSelection(this.dataList)
                    break
                case '检查检验':
                    this.columns = this.examColumns
                    this.dataList = this.result['30']
                    this.toggleSelection(this.dataList)
                    break
            }
        },
        handleSwitch(val) {
            this.index = val.index
            this.dataList = this.tableDataList[val.index]
            this.toggleSelection(this.dataList, val.index)
        },

        getData(id,status) {
            getNurseStationthreeDetail(id,status).then(res => {
                if (res.STATUS === '1') {
                    this.changeTabType('')
                    this.tabMapOpts = []
                    this.columns = []
                    this.result = []
                    this.tableDataList = []
                    this.dataList = []
                    this.recipeListMap = []

                    this.describeData = res.ITEMS.orgOutpRegisterDTO
                    this.describeData.age = getBabyAge(res.ITEMS.orgOutpRegisterDTO.birthDate)
                    this.describeData.sex = formatSex(this.describeData.sex)

                    // 处理过敏信息
                    let allergyStr = ''
                    if (res.ITEMS.allergyDTOList && res.ITEMS.allergyDTOList.length > 0) {
                        res.ITEMS.allergyDTOList.forEach(item => {
                            allergyStr += item.allergyName + ','
                        })
                        allergyStr = allergyStr.substring(0, allergyStr.length - 1)
                    } else {
                        allergyStr = '无'
                    }
                    // 诊断
                    let allergyName = ''
                    const diagnosisList = []
                    const tcmDiagnosisList = []
                    let tcmDiagnosis = ''
                    if (res.ITEMS.opDrCaseDiagnosisDTOList && res.ITEMS.opDrCaseDiagnosisDTOList.length > 0) {
                        res.ITEMS.opDrCaseDiagnosisDTOList.forEach(item => {
                            if (item.diagnosisType !== '中医诊断') {
                                diagnosisList.push(item)
                            } else {
                                tcmDiagnosisList.push(item)
                            }
                        })
                    } else {
                        allergyName = '无'
                    }
                    if (diagnosisList.length > 0) {
                        diagnosisList.forEach((item, index) => {
                            allergyName += `${index + 1}、${item.diseaseName} `
                        })
                    }
                    if (tcmDiagnosisList.length > 0) {
                        tcmDiagnosisList.forEach((item, index) => {
                            tcmDiagnosis += `${index + 1}、${item.diseaseName} `
                        })
                    }

                    this.describeData.allergyName = allergyName
                    this.describeData.tcmDiagnosis = tcmDiagnosis
                    this.describeData.allergyStr = allergyStr
                    const dictMap = this.$store.getters.dictData
                    this.tableDataList = res.ITEMS.opDrRecipeDetailList
                    this.printObj = res.ITEMS.opDrRecipeValue
                    this.opDrRecipeDetailList = []
                    if (res.ITEMS.opDrRecipeDetailList && res.ITEMS.opDrRecipeDetailList.length > 0) {
                        res.ITEMS.opDrRecipeDetailList.forEach(item => {
                            if (item.length > 0) {
                                item.forEach(element => {
                                    if (element.skinTest == '1') {
                                        element.skinTest = element.skinTestResults == '1' ? '阴性' : '阳性'
                                    } else {
                                        element.skinTest = '-'
                                    }
                                    this.opDrRecipeDetailList.push(element)
                                })
                            }
                        })
                    }
                    const recipeListMap = res.ITEMS.recipeListMap
                    const result = { '10': [], '30': [], '40': [], '50': [], '99': [] }
                    for (const key in recipeListMap) {
                        if (key === '10' || key === '20') {
                            recipeListMap[key].forEach(item => {
                                const temp1 = []
                                if (item.detailList.length > 0) {
                                    item.detailList.forEach(detail => {
                                        if (detail.skinTest == '1') {
                                            detail.skinTest = detail.skinTestResults == '1' ? '阴性' : '阳性'
                                        } else {
                                            detail.skinTest = '-'
                                        }
                                        temp1.push({
                                            chara: detail.chara,
                                            amt: detail.amt,
                                            skinTest: detail.skinTest,
                                            groupSn: detail.groupSn,
                                            itemName: detail.itemName,
                                            spec: detail.spec,
                                            unit: detail.unit,
                                            usage: formatDictMap(dictMap[key === '10' ? 144 : 152], detail.usage),
                                            frequency: formatDictMap(dictMap[145], detail.frequency),
                                            days: detail.days,
                                            price: detail.price,
                                            qty: detail.qty,
                                            dosage: detail.dosage,
                                            dosageUnit: detail.dosageUnit,
                                            dose: detail.dose,
                                            doseUnit: formatDictMap(dictMap[483], detail.doseUnit),
                                            note: detail.note,
                                            itemType: detail.itemType,
                                            medicineType: detail.medicineType,
                                            medicineNote:
                        key === '20'
                            ? `${formatDictMap(dictMap[152], detail.usage)}，${formatDictMap(
                                dictMap[145],
                                detail.frequency
                            )}，
                                                    每次${detail.dose || ''}${formatDictMap(
    dictMap[483],
    detail.doseUnit
)}，共${detail.days}剂`
                            : '',
                            id:detail.id
                                        })
                                    })
                                }
                                result[10].push(temp1)
                            })
                        } else {
                            const detailList = recipeListMap[key][0].detailList
                            detailList.forEach(item => {
                                result[key].push({
                                    itemName: item.itemName,
                                    qty: item.qty,
                                    price: item.price,
                                    groupSn: item.groupSn,
                                    unit: item.unit,
                                    note: item.note,
                                    id:item.id
                                })
                            })
                        }
                    }
                    this.result = result
                        this.dataList = this.tableDataList[this.index]
                    this.changeTabType(this.temp_tabType)
                    
                    // } else {
                    // }
                }
            })
        },
        

        print() {
            if (this.tabType === '门诊处方') {
                if (this.tableDataList && this.tableDataList.length > 0) {
                    this.tableDataList.forEach(item => {
                        this.handlePrint(item,'处方')
                        this.totalAmt += item.price * item.qty
                    })
                    if (this.reload) {
                        window.location.reload()
                    }
                } else {
                    this.handlePrint(this.dataList)
                    if (this.reload) {
                        window.location.reload()
                    }
                }
            } else {
                this.handleRecipePrint()
                if (this.reload) {
                    window.location.reload()
                }
            }
        },

        // 处方打印
        handlePrint(obj,type) {
            const list = obj || this.dataList
            const westList = []
            const chineseWestList = []
            if (list && list.length > 0) {
                list.forEach(item => {
                    if (item.itemType === '1001') {
                        westList.push(item)
                    } else {
                        chineseWestList.push(item)
                    }
                })
            }else if(type === '处方'){
                this.$message.warning('暂无相关信息可打印！')
                return false
            } else if(type !=='处方') {
                this.$message.warning('暂无相关信息可打印！')
                this.reload = false
                return false
            }
            const that = this
            if (that.commonUtil.getConfigValue('isSeparateCWRecipe') === '1') {
                if (list[0].chara === '10') {
                    if (westList && westList.length > 0) {
                        // this.handleRecipePrint(westList, this.describeData.allergyName)
                        let result = []
                        for (var i = 0; i < westList.length; i += 5) {
                            result = westList.slice(i, i + 5)
                            this.handleRecipePrint(result, this.describeData.allergyName)
                        }
                    }
                    if (chineseWestList && chineseWestList.length > 0) {
                        // this.handleRecipePrint(chineseWestList, this.describeData.tcmDiagnosis)
                        let result = []
                        for (var i = 0; i < chineseWestList.length; i += 5) {
                            result = chineseWestList.slice(i, i + 5)
                            this.handleRecipePrint(result, this.describeData.tcmDiagnosis)
                        }
                    }
                } else if (list[0].chara === '20') {
                    this.handleRecipePrint(list, this.describeData.tcmDiagnosis)
                    // let result = []
                    // for (var i = 0; i < list.length; i += 5) {
                    //     result = list.slice(i, i + 5)
                    //     this.handleRecipePrint(result, this.describeData.tcmDiagnosis)
                    // }
                }
            } else {
                if (list[0].chara === '10') {
                    // this.handleRecipePrint(list, this.describeData.allergyName)
                    let result = []
                    for (var i = 0; i < list.length; i += 5) {
                        result = list.slice(i, i + 5)
                        this.handleRecipePrint(result, this.describeData.allergyName)
                    }
                } else if (list[0].chara === '20') {
                    this.handleRecipePrint(list, this.describeData.tcmDiagnosis)
                    // let result = []
                    // for (var i = 0; i < list.length; i += 5) {
                    //     result = list.slice(i, i + 5)
                    //     this.handleRecipePrint(result, this.describeData.tcmDiagnosis)
                    // }
                }
            }
        },

        // 处方打印
        handleRecipePrint(obj, diagnosis) {
            const isShow = this.showPrescriptionAmount == 1
            obj = obj || this.dataList
            this.reload = true
            if (this.tabType !== '门诊处方') {
                diagnosis = this.describeData.allergyName
            }
            // 是否ie
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }

            const dictMap = this.$store.getters.dictData
            let recipeClass = ''
            if (this.printObj && this.printObj.recipeClass) {
                recipeClass =
          formatDictMap(dictMap[484], this.printObj.recipeClass) ||
          formatDictMap(dictMap[485], this.printObj.recipeClass)
            }
            let recipes = ''
            if (!obj || !obj.length > 0) {
                this.$message.warning('暂无相关信息可打印！')
                this.reload = false
                return false
            }
            if (this.tabType === '门诊处方' || this.tabType === '注射单') {
                recipes += '<ul class="western-medicine">'
                obj.forEach((item, index) => {
                    item.className = item.medicineType === '09' ? 'isLine' : ''
                    var note = ''
                    if (item.note) {
                        note = `<div class="clearfix" style="color:red;text-indent:1em"><span>备注：${
                            item.note
                        }</span></div>`
                    }
                    recipes += `
                        <li>
                            <div class="clearfix">
                                <span class="${item.className}">${index + 1}.${item.itemName}【${
    item.spec
}】 ${item.qty}${item.unit}</span>
                            </div>
                            <div class="clearfix">
                                <span style="width:15%;text-align:center;" class="${
    item.className
}">Sig.</span>
                                <span style="width:83%;" class="${item.className}">每次${
    item.dosage
}${item.dosageUnit}，${item.usage} ${item.frequency}</span>
                            </div>
                           <div class="${item.className}"> ${note}</div>
                        </li>
                    `
                })
                recipes += '</ul>'
                recipes += '<div class="slash"></div>'
            } else if (this.tabType === '检查检验' || this.tabType === '治疗单') {
                recipes += '<ul class="exam">'
                recipes += `
                        <li>
                            <div>
                                组号
                            </div>
                            <div>
                                项目名称
                            </div>
                            <div>
                                标本
                            </div>
                            <div>
                                单价（元）
                            </div>
                            <div style="${this.tabType === '检查检验' ? 'display:none;' : ''}">
                                说明
                            </div>
                        </li>
                    `
                obj.forEach((item, index) => {
                    recipes += `
                        <li>
                           <div>
                                ${item.groupSn ? item.groupSn : ''}
                            </div>
                            <div>
                                 ${item.itemName ? item.itemName : ''}
                            </div>
                            <div>
                                 ${item.aaaa ? item.aaaa : ''}
                            </div>
                            <div>
                                 ${item.price ? item.price : ''}
                            </div>
                            <div style="${this.tabType === '检查检验' ? 'display:none;' : ''}">
                                 ${item.note ? item.note : ''}
                            </div>
                        </li>
                    `
                })
                recipes += '</ul>'
                recipes += '<div class="slash"></div>'
            }
            const content = `
                <div class="print recipe">
                    <div class="page">
                        <div class="recipe-class">
                            <span>${this.printObj.deptName ? this.printObj.deptName : ''}</span>
                        </div>
                        <h1>${this.$store.getters.clinic.orgName}</h1>
                        <h2>${this.tabType}</h2>
                        <div class="main">
                            <div class="item info">
                                <div class="w3">
                                    <span><label>门诊/住院号：</label>${
    this.describeData.outpatientNum
        ? this.describeData.outpatientNum
        : ''
}</span>
                                    <span><label>科室/病区：</label>${
    this.printObj.deptName ? this.printObj.deptName : ''
}</span>
                                    <span><label>就诊类型：</label>${recipeClass}</span>
                                </div>
                                <div class="w3">
                                    <span><label>姓名：</label>${this.describeData.name}</span>
                                    <span><label>性别：</label>${this.describeData.sex}</span>
                                    <span><label>年龄：</label>${this.describeData.age}</span>
                                </div>
                                <div class="w2">
                                    <span><label>开具时间：</label>${
    this.printObj.prescribingTime
        ? this.printObj.prescribingTime.split(' ')[0]
        : ''
}</span>
                                </div>
                                <div class="w1">
                                    <span><label>临床诊断：</label>${diagnosis}</span>
                                </div>
                            </div>
                            <div class="item list">
                                <h2 class="rp">RP:</h2>${recipes}
                            </div>
                        </div>

                        <div class="footer">
                            <div class="item info">
                                <div class="w2">
                                    <span><label>医师：</label>${
    this.printObj.doctorName ? this.printObj.doctorName : ''
}</span>
                                </div>

                                 <div class="w2">
                                    <span><label>药师（审核、核对、发药）：</label>_______________</span>
                                    <span><label>药师/士（调配）：</label>_______________</span>
                                </div>
                            </div>
                             <div style="font-size:14px;margin-top:10px;">
                                <div style="float:left;">
                                    <div style="float:left;width:7%;">特别提示：</div>
                                    <ul style="float:left;width:93%;">
                                        <li style="float:left;width:100%;"> <span>1、</span><span>本处方2日内有效</span></li>
                                        <li style="width:1200px;float:left;padding-top:5px;line-height:22px;">
                                            <span  style="float:left;">2、</span>
                                            <span style="float:left; width:1000px;"> 根据卫生部国家中医药管理局【2011】11号文件规定，除药品质量原因外，药品一经发出，概不退换</span></li>
                                        <li style="float:left;width:100%;padding-top:5px;"> <span> 3、</span>取药时请您当面核对药品名称、规格、数量</li>
                                        <li style="float:left;width:100%;padding-top:5px;"> <span>4、</span>延长处方用量时间原因：慢性病  老年病  外地  其他</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            var style = `
                    <style type='text/css'>
                        body{
                            width:100% !important;
                        }
                    </style>`
            const oldContent = document.body.innerHTML
            document.body.innerHTML = content + style

            window.print()
            document.body.innerHTML = oldContent
            return false
        },

        toggleSelection(rows, index) {
            
            if (rows) {
                this.selections = deepClone(rows)
                rows.forEach(row => {
                    this.$nextTick(() => {
                        if(index >= 0){
                            this.$refs.multipleTable[index].$refs.selftab.toggleRowSelection(row)
                        }else{
                            this.$refs.multipleTable.$refs.selftab.toggleRowSelection(row)
                        }
                        
                    })
                })
            } 
        },

        selectionChange(selections){
            this.selections =deepClone(selections)
        },

        // 执行
        execute(index){
            const data = []
            if(this.selections && this.selections.length > 0){
                this.selections.forEach(item =>{
                    data.push({id:item.id})
                })
                nurseStationExecute(data).then(res =>{
                    if(res.STATUS === '1'){
                        this.$message.success('执行成功')
                        this.getData(this.id,this.status)
                        this.dataList = this.tableDataList[index]
                        this.toggleSelection(this.dataList, index)
                    }
                })
            }else{
                 this.$message.warning('暂无相关信息可执行！')
            }
            
        }
    }
}
</script>

<style scoped>
</style>
