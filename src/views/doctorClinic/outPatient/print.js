import {
    formatSex
} from '@/utils'
import {
    getCurrentDay
} from '@/utils/common'
import {
    deepClone,
    param2Obj
} from '../../../utils'

// 打印存根
export function handlePrintStub(info) {
    const currentDay = getCurrentDay().split(' ')[0].split('-')
    const columns = [{
        label: '患者姓名',
        value: 'patientName',
        width: '23%'
    },
    {
        label: '性别',
        value: 'patientSex',
        width: '14%'
    },
    {
        label: '年龄',
        value: 'patientAge',
        width: '19%'
    },
    {
        label: '档案编号',
        value: 'inpNo',
        width: '30%'
    },
    {
        label: '家庭住址',
        value: 'address',
        width: '63%'
    },
    {
        label: '联系电话',
        value: 'patientPhone',
        width: '30%'
    }
    ]

    let newContent =
        '<div class="printStub"><p class="title">双向转诊单</p><p class="subTitle">存根</p><div class="content"><p>'
    columns.forEach(item => {
        if (item.value === 'patientSex') {
            newContent += `<span style="width:${item.width}">
        <em>${item.label}：</em>
        <small>${formatSex(info[item.value]) || ''}</small>
      </span>`
        } else {
            newContent += `<span style="width:${item.width}">
            <em>${item.label}：</em>
            <small>${info[item.value] || ''}</small>
          </span>`
        }
    })

    newContent += `</p>
    <em style="margin-left:4%;"><span>于</span>
    <small>${currentDay[0]}</small><span>年</span>
    <small>${currentDay[1]}</small><span>月</span>
    <small>${currentDay[2]}</small><span>日因病情需要，转入</span></em>

    <small style="width:40%;display:inline">${param2Obj(info.hospitalId).label || ' '}</small><span>单位</span>
    <small style="width:40%">${param2Obj(info.deptId).label || ' '}</small><span>科室</span>
    <small style="width:30%">&nbsp;</small><span>接诊医生。</span>
    </div>
    <div class="footer">
    <p>转诊医生（签字）：</p>
    <p>年月日</p>
  </div>
</div>`

    const oldContent = document.body.innerHTML
    document.body.innerHTML = newContent

    window.print()
    window.location.reload()
    document.body.innerHTML = oldContent
    return false
}

// 打印转诊单
export function handlePrintTransfer(data, dictMap) {
    const transferInfo = [{
        title: '转诊信息',
        children: [{
            label: '转诊医院',
            value: 'hospitalId'
        }, {
            label: '期望科室',
            value: 'deptId'
        }, {
            label: '期望转诊日期',
            value: 'transferTimeArr'
        }, {
            label: '转入医院就诊卡号',
            value: 'patientCardNo'
        }, {
            label: '转诊原因',
            value: 'cause',
            className: 'w100'
        }, {
            label: '状态',
            value: 'appState'
        }]
    },
    {
        title: '病历首页',
        children: [{
            label: '住院号/门诊号',
            value: 'inpNo'
        }, {
            label: '患儿姓名',
            value: 'patientName'
        }, {
            label: '身份证号',
            value: 'patientIdCard'
        }, {
            label: '出生日期',
            value: 'patientBirth'
        }, {
            label: '性别',
            value: 'patientSex'
        }, {
            label: '联系电话',
            value: 'patientPhone'
        }]
    },
    {
        title: '门诊病历',
        children: [{
            label: '发病时间',
            value: 'morbidity'
        }, {
            label: '就诊时间',
            value: 'visitTime'
        }, {
            label: '接诊医生',
            value: 'doctorName'
        }, {
            label: '主诉',
            value: 'chiefCompliant',
            className: 'w100'
        }, {
            label: '现病史',
            value: 'presentIllness',
            className: 'w100'
        }, {
            label: '既往史',
            value: 'pastHistory',
            className: 'w100'
        }, {
            label: '手术史',
            value: 'operation',
            className: 'w100',
            historyIndex: 5,
            name: 'mixin'
        }, {
            label: '输血史',
            value: 'blood',
            className: 'w100',
            historyIndex: 6,
            name: 'mixin'
        }, {
            label: '出生史',
            value: 'birth',
            className: 'w100',
            historyIndex: 7,
            name: 'mixin'
        }, {
            label: '喂养史',
            value: 'feed',
            className: 'w100',
            historyIndex: 8,
            name: 'mixin'
        }, {
            label: '个人史',
            value: 'personalHistory',
            className: 'w100',
            historyIndex: 9,
            name: 'mixin'
        }, {
            label: '家族史',
            value: 'familyHistory',
            className: 'w100',
            historyIndex: 10,
            name: 'mixin'
        }, {
            label: '月经史',
            value: 'menstrualHistory',
            className: 'w100',
            historyIndex: 11,
            name: 'mixin'
        }, {
            label: '过敏史',
            value: 'allergytList',
            className: 'w100'
        }, {
            label: '是否计划接种',
            value: 'isPlanInoculate',
            className: 'w100'
        }, {
            label: '体格检查',
            value: 'mixin',
            className: 'w100'
        }, {
            label: '其他体格检查',
            value: 'otherBodyExam',
            className: 'w100'
        }, {
            label: '辅助检查结果',
            value: 'assistantExamResult',
            className: 'w100'
        }, {
            label: '西医诊断',
            value: 'diagnosisList',
            className: 'w100'
        }, {
            label: '诊疗意见',
            value: 'treatPlan',
            className: 'w100'
        }]
    },
    {
        title: '费用',
        children: [{
            label: '总金额',
            value: 'totalCharge',
            className: 'w24'
        }, {
            label: '是否享受统筹补贴',
            value: 'isSubsidy',
            className: 'w24'
        }, {
            label: '补贴金额',
            value: 'moneySubsidy',
            className: 'w24'
        }]
    }
    ]
    let newContent = `<div class="printTransfer">
    <div class="page">
      <h1>通用科转诊单</h1>`
    let str = ''
    transferInfo.forEach(item => {
        str += `<div class="content">
    <div class="title">${item.title}</div>
    <div>`

        // 诊疗意见
        const clinicRecord = [{
            title: '处置',
            tableData: data.prescriptions,
            columns: [
                'drugName', 'dose', 'routeName', 'frequency', 'days'
            ]

        }, {
            title: '检查',
            tableData: data.analysisList,
            columns: [
                'testName', 'desInfo', 'proInfo'
            ]
        }, {
            title: '检验',
            tableData: data.examList,
            columns: [
                'testName', 'engName', 'itemName', 'result', 'mark', 'reference', 'unit'
            ]
        }]
        let treatStr = '<span style="width:100%;display:block;margin-left:65px;margin-top:-12px">'
        clinicRecord.forEach(item => {
            if (item.tableData && item.tableData.length > 0 && (item.tableData[0].testName || item.tableData[0].drugName)) {
                treatStr += `<font>${item.title}</font>`
                item.tableData.forEach((itemContent, indexColumn) => {
                    treatStr += `<span style="margin-top:0"><span style="display:block;margin-left:35px;margin-right: 66px;text-align: justify;margin-top:0;margin-bottom:10px">${indexColumn + 1} 、`
                    item.columns.forEach(column => {
                        treatStr += `<span style="display:inline-block;margin-left:10px;margin-top:0;">
                                        ${itemContent[column] ? column === 'routeName' ? param2Obj(itemContent[column]).name : itemContent[column] : ''}
                                    </span>`
                    })
                    treatStr += '</span></span>'
                })
            }
        })
        treatStr += '</span>'

        let strItem = ''
        item.children.forEach(col => {
            let tempData = data[col.value] === 0 || data[col.value] ? data[col.value] : ''
            if (col.name !== 'mixin' || (col.name === 'mixin' && (data.historyList).indexOf(col.historyIndex) > -1)) {
                if (col.value === 'transferTimeArr') {
                    tempData = tempData && tempData.length > 0 ? tempData[0].split(' ')[0] + ' 至 ' + tempData[1].split(' ')[0] : '-'
                } else if (col.value === 'patientBirth') {
                    tempData = tempData ? tempData.split(' ')[0] : '-'
                } else if (col.value === 'patientSex') {
                    tempData = formatSex(tempData)
                } else if (col.value === 'isPlanInoculate') { // 是否计划接种
                    tempData = tempData === 1 ? '是' : '否'
                } else if (col.value === 'allergytList') { // 过敏史
                    let allergytStr = ''
                    if (tempData && tempData.length > 0) {
                        tempData.forEach(item => {
                            dictMap[139].forEach(dic => {
                                if (item.allergyName === dic.label) {
                                    allergytStr += dic.label + ', '
                                }
                            })
                            dictMap[138].forEach(dic => {
                                if (item.reactionName === dic.label) {
                                    allergytStr += dic.label + ', '
                                }
                            })
                            dictMap[140].forEach(dic => {
                                if (item.degreeName === dic.label) {
                                    allergytStr += dic.label + '; '
                                }
                            })
                        })
                        tempData = allergytStr
                    } else {
                        tempData = '否认'
                    }
                } else if (col.value === 'mixin') { // 体格检查
                    tempData = `<span class="inline">体温：${data.bodyTemperature || '-'} ℃ </span><span class="inline">呼吸：${data.respirationRate || '-'} 次/分 </span><span class="inline">心率：${data.pulse || '-'} 次/分 </span><span class="inline">血压：${data.sbp || '-'} / ${data.dbp || '-'} mmHg </span>`
                } else if (col.value === 'diagnosisList') { // 诊断
                    const diagnosisList = deepClone(tempData)
                    tempData = ''
                    if (diagnosisList && diagnosisList.length > 0) {
                        diagnosisList.forEach(item => {
                            tempData += item.diseaseName + ';'
                        })
                    } else {
                        tempData = '暂无'
                    }
                } else if (col.value === 'isSubsidy') { // 是否享受补贴
                    tempData = tempData === 1 ? '是' : '否'
                } else if (col.value === 'hospitalId' || col.value === 'deptId') {
                    tempData = param2Obj(tempData).label
                } else if (col.value === 'morbidity' || col.value === 'visitTime') {
                    tempData = tempData ? tempData.split(' ')[0] : ''
                } else if (col.value === 'totalCharge' || col.value === 'moneySubsidy') {
                    tempData = tempData ? tempData + '元' : ''
                } else if (col.value === 'treatPlan') {
                    tempData = treatStr
                } else if (col.value === 'appState') {
                    tempData = tempData === -1 ? '转诊失败' : tempData === 0 ? '暂存' : tempData === 1 ? '申请待处理' : tempData === 2 ? '申请通过' : tempData === 3 ? '已就诊' : tempData === 4 ? '未就诊' : ''
                }
                strItem += `<span class="${col.className ? col.className : 'w48'}">
            <font style="font-weight:600">${col.label}</font>
            ：${tempData || '-'}
          </span>`
            }
        })
        str += strItem
    })
    newContent += `${str}</div>
    </div></div>
    </div>`

    var style = `
                    <style type='text/css'>
                        body{
                            width:100% !important;
                        }
                    </style>`
    const oldContent = document.body.innerHTML
    document.body.innerHTML = newContent + style

    window.print()
    window.location.reload()
    document.body.innerHTML = oldContent
    return false
}
