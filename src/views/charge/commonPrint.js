import {
    toFixed,
    add,
    getFloat
} from '@/utils/float'
import store from '@/store'
import commonUtil from '@/utils'
// 打印收费清单
export function handlePrintDetail(list, chargeInfo) {
    const isShowAdjustAcc = commonUtil.getConfigValue('isShowAdjustAcc')
    const tabMaps = ['西药', '中药处方', '检验/检查', '治疗', '材料', '其他']
    const projectTitle = ['项目名称', '规格', '单位', '数量', '单价', '金额']
    let tbody = ''
    let tb = '<tr>'
    for (let i = 0; i < projectTitle.length; i++) {
        tb += '<th>' + projectTitle[i] + '</th>'
    }
    tb += '</tr>'
    tbody += tb
    if (list.length > 0) {
        const typeInfo = [
            [],
            [],
            [],
            [],
            [],
            []
        ]
        list.forEach(item => {
            if (item.recipeChara === '10') {
                typeInfo[0].push(item)
            }
            if (item.recipeChara === '20') {
                typeInfo[1].push(item)
            }
            if (item.recipeChara === '30') {
                typeInfo[2].push(item)
            }
            if (item.recipeChara === '40') {
                typeInfo[3].push(item)
            }
            if (item.recipeChara === '50') {
                typeInfo[4].push(item)
            }
            if (item.recipeChara === '99') {
                if (isShowAdjustAcc === '1') {
                    typeInfo[5].push(item)
                } else {
                    if (item.name !== '精度调整') {
                        typeInfo[5].push(item)
                    }
                }
            }
        })
        for (let i = 0; i < tabMaps.length; i++) {
            if (typeInfo[i] && typeInfo[i].length > 0) {
                tbody += `<tr class="tr-Title"><th><span style="background-color:#E4E4E4; padding:8px;">${
                    tabMaps[i]
                }：</span> </th></tr>`
                typeInfo[i].forEach(item => {
                    tbody += `<tr>
                    <td>${item.name}</td>
                    <td>${item.spec || ''}</td>
                    <td>${item.unit || ''}</td>
                    <td>${item.num || ''}</td>
                    <td>${item.price || ''}</td>
                    <td>${item.zongAccount || ''}</td>
                  </tr>`
                })
            }
        }
    } else {
        tbody += `<tr><td
          :colspan="6"
          style="text-align:center;height:50px;"
        >暂无数据</td>
      </tr>`
    }
    const newContent = `
        <div class='printCharge'>
            <p class='title'>门诊费用清单</p>
            <div class="patient_info">
                <span style=" width:20%;">
                    <font>姓名：</font>${chargeInfo.patientInfoName} &ensp;
                </span>
                <span style=" width:23%;">
                    <font>收费类别：</font>门诊&ensp;
                </span>
                <span style=" width:27%;">
                    <font>病历号：</font>${chargeInfo.outpatientNumber} &ensp;
                </span>
                <span style=" width:30%;">
                    <font>收费时间：</font>${chargeInfo.clinicTime}
                </span>
            </div>
            <table >${tbody}</table>
            <div class="bottom-Info" >
                <div class='chargeInfo'>
                    <span>
                    <em>应收金额：</em>${toFixed(parseFloat(chargeInfo.chargeAccount), 2)}</span>
                    <span>
                    <em>实收金额：</em>${chargeInfo.receivedCash}
                    </span>
                    <span>
                    <em>付款方式：</em>${chargeInfo.otherName}
                    </span>
                </div>
                <div class='bottomInfo'>
                    <p>
                    <span>收费单位（盖章）</span>
                    <span>医生：${chargeInfo.doctorName && chargeInfo.doctorName !== 'null' ? chargeInfo.doctorName : ''}</span>
                    <span>收银员：${chargeInfo.receiverName}</span>
                    <!-- <span>客户签名：________________</span> -->
                    </p>
                </div>
                <div class='bottomInfo'>
                    <p>
                    <span style="width:100%">打印于：${chargeInfo.currentTime}</span>
                    </p>
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
    document.body.innerHTML = newContent + style

    window.print()
    // window.location.reload()
    document.body.innerHTML = oldContent
    return false
}

// 打印收费清单小票
export function handlePrintDetailxp(list, chargeInfo) {
    const isShowAdjustAcc = commonUtil.getConfigValue('isShowAdjustAcc')
    const tabMaps = ['西药', '中药处方', '检验/检查', '治疗', '材料', '其他']
    let tbody = '<ul class="list">'
    if (list.length > 0) {
        const typeInfo = [
            [],
            [],
            [],
            [],
            [],
            []
        ]
        const costInfo = [0, 0, 0, 0, 0, 0]
        list.forEach(item => {
            if (item.recipeChara === '10') {
                costInfo[0] = add(toFixed(costInfo[0], 2), toFixed(item.zongAccount, 2))
                typeInfo[0].push(item)
            }
            if (item.recipeChara === '20') {
                costInfo[1] = add(toFixed(costInfo[1], 2), toFixed(item.zongAccount, 2))
                typeInfo[1].push(item)
            }
            if (item.recipeChara === '30') {
                costInfo[2] = add(toFixed(costInfo[2], 2), toFixed(item.zongAccount, 2))
                typeInfo[2].push(item)
            }
            if (item.recipeChara === '40') {
                costInfo[3] = add(toFixed(costInfo[3], 2), toFixed(item.zongAccount, 2))
                typeInfo[3].push(item)
            }
            if (item.recipeChara === '50') {
                costInfo[4] = add(toFixed(costInfo[4], 2), toFixed(item.zongAccount, 2))
                typeInfo[4].push(item)
            }
            if (item.recipeChara === '99') {
                if (isShowAdjustAcc === '1') {
                    costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
                    typeInfo[5].push(item)
                } else {
                    if (item.name !== '精度调整') {
                        costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
                        typeInfo[5].push(item)
                    }
                }
            }
        })
        for (let i = 0; i < tabMaps.length; i++) {
            if (typeInfo[i] && typeInfo[i].length > 0) {
                tbody += `<li><div>
                <span>${tabMaps[i]}</span>
                <small>${costInfo[i]}</small>
              </div>`

                typeInfo[i].forEach(item => {
                    tbody += `<div>
                    <span>${item.name} * ${item.num}${item.unit || ''}</span>
                    <small>${item.zongAccount}</small>
                  </div>`
                })
                tbody += '</li>'
            }
        }
        tbody += '</ul>'
    } else {
        tbody += `暂无数据</li>
      </ul>`
    }
    const newContent = `
    <div class="printChargeDetail">
    <h2>${chargeInfo.clinicInfoName}</h2>
    <div class="infos">
      <p>收银员：${chargeInfo.receiverName}</p>
      <p>流水号：${chargeInfo.chargeNum}</p>
      <p>${chargeInfo.currentTime}</p>
      <p style="border-top:1px dashed #ccc;padding-top:8px;margin-top:8px">患者：${chargeInfo.patientInfoName} ${chargeInfo.sex || '-'}</p>
      <p>${chargeInfo.phone || '-'}</p>
    </div>
    <div class="details">
      <p>收费详情</p>
      ${tbody}
      <div class="count">
        <p><span>合 计</span><span>${toFixed(parseFloat(chargeInfo.chargeAccount), 2)}</span></p>
        <p><span>优 惠</span><span>${toFixed(chargeInfo.reductionAmt, 2)}</span></p>
        <p><span>实 收${chargeInfo.isCash ? '(现金)' : ''}</span><span>${chargeInfo.receivedCash}</span></p>
      </div>
      <div class="notice">
        <p>祝早日康复!</p>
        <p>请妥善保管此小票，遗失不补，如需退费，须凭该原始收据办理!</p>
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
    document.body.innerHTML = newContent + style

    window.print()
    // window.location.reload()
    document.body.innerHTML = oldContent
    return false
}

// 打印票据单
export function handlePrintCount(list, chargeInfo) {
    // ${chargeInfo.isCash ? getFloat(chargeInfo.total, '6') : toFixed(parseFloat(chargeInfo.total), 2)}   实收金额
    const isShowAdjustAcc = commonUtil.getConfigValue('isShowAdjustAcc')
    const types = ['西药费', '中药费', '检验/检查', '治疗费', '材料费', '其他']
    const costInfo = [0, 0, 0, 0, 0, 0]
    let tb = `<div class="table-info">
    <div
      class="w2"
      style="margin-bottom:15px;background-color:#E4E4E4"
    >
      <span><label>分类名称</label></span>
      <span style="text-align:right;background-color:#E4E4E4"><label style="text-align:right;">分类金额</label></span>
    </div>`
    list.forEach(item => {
        if (item.recipeChara === '10') {
            costInfo[0] = add(toFixed(costInfo[0], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '20') {
            costInfo[1] = add(toFixed(costInfo[1], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '30') {
            costInfo[2] = add(toFixed(costInfo[2], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '40') {
            costInfo[3] = add(toFixed(costInfo[3], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '50') {
            costInfo[4] = add(toFixed(costInfo[4], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '99') {
            if (isShowAdjustAcc === '1') {
                costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
            } else {
                if (item.name !== '精度调整') {
                    costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
                }
            }
        }
    })
    for (let i = 0; i < types.length; i++) {
        if (costInfo[i] !== 0) {
            tb += ` <div
            class="w2"
            style="margin-bottom:15px"
          >
            <span>
              <font>${types[i]}</font>
            </span>
            <span style="text-align:right;">
            <label style="text-align:right;font-weight:normal;">
            ${costInfo[i]}</label>
            </span>
          </div>`
        }
    }
    tb += '</div>'
    const newContent = `
    <div class="print-charge2">
        <div class="title">
          <font>${chargeInfo.clinicInfoName}</font>
        </div>
        <div class="title">
          <font>收费票据单</font>
        </div>
        <div class="detail-info">
          <div class="w1">
            <span><label>收费时间：</label>${chargeInfo.clinicTime}</span>
          </div>
          <div class="w1">
            <span><label>患者姓名：</label>${chargeInfo.patientInfoName}</span>
          </div>

          <div class="w1">
            <span><label>费别：</label>门诊</span>
          </div>
        </div>
        ${tb}
        <div class="detail-info">
            <div class="w1">
                <span>
                <font>应收金额：</font>￥
                ${toFixed(parseFloat(chargeInfo.total), 2)}
                </span>
            </div>
            <div class="w1">
                <span>
                <font>实收金额${chargeInfo.isCash ? '(现金)' : ''}：</font>￥
                ${chargeInfo.receivedCash}
                </span>
            </div>
            <div class="w1">
                <span>
                <font>医生：</font>${chargeInfo.doctorName && chargeInfo.doctorName !== 'null' ? chargeInfo.doctorName : ''}
                </span>
            </div>
            <div class="w1">
                <span>
                <font>收费员：</font>${chargeInfo.receiverName}
                </span>
            </div>
            <div class="w1">
                <span>
                <font>打印于：</font>${chargeInfo.currentTime}
                </span>
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
    document.body.innerHTML = newContent + style
    window.print()
    // window.location.reload()
    document.body.innerHTML = oldContent
    return false
}

// 打印发票明细
export function handlePrintBillmx(list, chargeInfo) {
    const currentTime = chargeInfo.currentTime ? chargeInfo.currentTime.split(' ')[0] : ''
    const timeArr = currentTime ? currentTime.split('-') : ['', '', '']
    const projectTitle = ['名称', '数量', '单位', '合计']
    let tbody = ''
    let tb = '<tr>'
    let len = 1
    if (list && list.length > 1) {
        len = 2
    } else {
        len = 1
    }
    for (var t = 0; t < len; t++) {
        tb = '<tr class="title">'
        for (let i = 0; i < projectTitle.length; i++) {
            tb += '<th><span>' + projectTitle[i] + '</span></th>'
        }
        tb += '</tr>'
        tbody += tb
    }
    if (len === 1) {
        tbody += '<tr class="title" style="height:16px"><td></td></tr>'
    }
    if (list.length > 0) {
        list.forEach(item => {
            tbody += `<tr>
                    <td><span>${item.name}</span></td>
                    <td><span>${item.num || ''}</span></td>
                    <td><span>${item.unit || ''}</span></td>
                    <td><span>${item.zongAccount || ''}</span></td>
                  </tr>`
        })
    } else {
        tbody += `<tr><td
          :colspan="6"
          style="text-align:center;height:50px;"
        >暂无数据</td>
      </tr>`
    }
    const newContent = `
        <div class='printBill'>
            <div class='pro'>${chargeInfo.patientInfoName}</div>
            <div class='pro'><span>${timeArr[0]}</span>  <span>${timeArr[1]}</span> <span>${timeArr[2]}</span> </div>
            <div class='detail'>
                <table >${tbody}</table>
                <p>费用合计：${toFixed(parseFloat(chargeInfo.chargeAccount), 2)} ${commonUtil.toChineseNum(toFixed(parseFloat(chargeInfo.chargeAccount), 2))}</p>
            </div>
            <div class='pro'>${store.getters.user.realName}</div>
        </div>
    `
    var style = `
                    <style type='text/css'>
                        body{
                            width:100% !important;
                        }
                    </style>`
    const oldContent = document.body.innerHTML
    document.body.innerHTML = newContent + style

    window.print()
    // window.location.reload()
    document.body.innerHTML = oldContent
    return false
}

// 打印发票小票
export function handlePrintBillxp(list, chargeInfo) {
    const currentTime = chargeInfo.currentTime ? chargeInfo.currentTime.split(' ')[0] : ''
    const timeArr = currentTime ? currentTime.split('-') : ['', '', '']
    const isShowAdjustAcc = commonUtil.getConfigValue('isShowAdjustAcc')
    const types = ['西药费', '中药费', '检验/检查', '治疗费', '材料费', '其他']
    const costInfo = [0, 0, 0, 0, 0, 0]
    let tb = `<div class="table-info">
    <div
      class="w2"
      style="margin-bottom:15px;"
    >
      <span><label>分类名称</label></span>
      <span style="text-align:right;><label style="text-align:right;">分类金额</label></span>
    </div>`
    list.forEach(item => {
        if (item.recipeChara === '10') {
            costInfo[0] = add(toFixed(costInfo[0], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '20') {
            costInfo[1] = add(toFixed(costInfo[1], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '30') {
            costInfo[2] = add(toFixed(costInfo[2], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '40') {
            costInfo[3] = add(toFixed(costInfo[3], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '50') {
            costInfo[4] = add(toFixed(costInfo[4], 2), toFixed(item.zongAccount, 2))
        }
        if (item.recipeChara === '99') {
            if (isShowAdjustAcc === '1') {
                costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
            } else {
                if (item.name !== '精度调整') {
                    costInfo[5] = add(toFixed(costInfo[5], 2), toFixed(item.zongAccount, 2))
                }
            }
        }
    })
    for (let i = 0; i < types.length; i++) {
        if (costInfo[i] !== 0) {
            tb += ` <div
            class="w2"
            style="margin-bottom:15px"
          >
            <span>
              <font>${types[i]}</font>
            </span>
            <span style="text-align:right;">
            <label style="text-align:right;font-weight:normal;">
            ${costInfo[i]}</label>
            </span>
          </div>`
        }
    }
    tb += '</div>'
    const newContent = `
    <div class="printBill">
        <div class='pro'>${chargeInfo.patientInfoName}</div>
        <div class='pro'><span>${timeArr[0]}</span>  <span>${timeArr[1]}</span>  <span>${timeArr[2]} </span></div>
        <div class='detail'>
        ${tb}
        <p>费用合计：${toFixed(parseFloat(chargeInfo.total), 2)} ${commonUtil.toChineseNum(toFixed(parseFloat(chargeInfo.total), 2))}</p>
        </div>
        <div class='pro'>${store.getters.user.realName}</div>
    </div>
    `
    var style = `
                    <style type='text/css'>
                        body{
                            width:100% !important;
                        }
                    </style>`
    const oldContent = document.body.innerHTML
    document.body.innerHTML = newContent + style
    window.print()
    // window.location.reload()
    document.body.innerHTML = oldContent
    return false
}
