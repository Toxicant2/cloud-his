import {
    toFixed
} from '@/utils/float'
import {
    formatDictMap,
    formatDate
} from '@/utils'
import {
    remove_ie_header_and_footer
} from '@/utils/print'
const mixin = {
    data() {
        return {
            selections: [],
            refundAmt: 0,
            isAllRefund: 0,
            showPrescriptionAmount: this.commonUtil.getConfigValue('showPrescriptionAmount')
        }
    },
    methods: {
        handlePrint() {
            const diagnosisList = []
            const tcmDiagnosisList = []
            let diagnosis = ''
            let tcmDiagnosis = ''
            if (this.opCase.diagnosisList && this.opCase.diagnosisList.length > 0) {
                this.opCase.diagnosisList.forEach((item, index) => {
                    if (item.diagnosisType !== '中医诊断') {
                        diagnosisList.push(item)
                    } else {
                        tcmDiagnosisList.push(item)
                    }
                })
            }
            if (diagnosisList.length > 0) {
                diagnosisList.forEach((item, index) => {
                    diagnosis += `${index + 1}、${item.diseaseName} `
                })
            }
            if (tcmDiagnosisList.length > 0) {
                tcmDiagnosisList.forEach((item, index) => {
                    tcmDiagnosis += `${index + 1}、${item.diseaseName} `
                })
            }
            const list = this.recipeDetail.detailList
            var timer = 0
            if (this.activeName === '10') {
                const westList = []
                const chineseWestList = []

                list.forEach(item => {
                    if (item.itemType === '1001') {
                        westList.push(item)
                    } else {
                        chineseWestList.push(item)
                    }
                })

                
                if (this.commonUtil.getConfigValue('isSeparateCWRecipe') === '1') {
                    if (westList && westList.length > 0) {
                        // this.recipePrint(westList, diagnosis, '西药')
                        // timer += 10
                        let result = []
                        const that = this
                        for (var i = 0; i < westList.length; i += 5) {
                            result = westList.slice(i, i + 5)
                            that.recipePrint(result, diagnosis, '西药')
                            timer += 10
                        }
                    }

                    if (chineseWestList && chineseWestList.length > 0) {
                        // this.recipePrint(chineseWestList, tcmDiagnosis, '中成药')
                        let result = []
                        const that = this
                        for (var i = 0; i < chineseWestList.length; i += 5) {
                            result = chineseWestList.slice(i, i + 5)
                            that.recipePrint(result, tcmDiagnosis, '中成药')
                        }
                    }
                } else {
                    // this.recipePrint(list, diagnosis, '西药')
                    let result = []
                    const that = this
                    for (var i = 0; i < list.length; i += 5) {
                        result = list.slice(i, i + 5)
                        that.recipePrint(result, diagnosis, '西药')
                    }
                }
            } else {
                this.recipePrint(list, tcmDiagnosis, '中药')
            }
            this.timer = timer
        },
        // 处方打印
        recipePrint(list, diagnosis, title) {
            if (this.opCase.opCase) {
                const isShow = this.showPrescriptionAmount == 1
                const sign = this.user.electronicSignature
                let signUrl = ''
                if (sign && sign.length > 0) {
                    signUrl = this.basic.filePrifix + sign[0].filePath
                }
                // 是否ie
                if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    remove_ie_header_and_footer()
                }
                let totalPrice = 0
                const dictMap = this.dictData
                const opCase = this.opCase.opCase

                const obj = {
                    outpatientNum: opCase.outpatientNum,
                    outpatientType: opCase.outpatientType,
                    deptName: opCase.deptName,
                    doctorName: opCase.doctorName,
                    diagnosis: diagnosis,
                    updateTime: opCase.updateTime ? opCase.updateTime.split(' ')[0] : opCase.createTime.split(' ')[0]
                }

                const patient = Object.assign(obj, this.patient)
                // const list = this.recipeDetail.detailList
                let recipes = ''
                let dailySetting = ''
                let recipeClass = ''

                if (list && list.length > 0) {
                    const first = list[0]
                    if (this.activeName === '10') {
                        recipes += '<ul class="western-medicine">'
                        list.forEach((item, index) => {
                            var note = ''
                            if (item.note) {
                                note = `<div class="clearfix" style="color:red;text-indent:1em"><span>备注：${
                                    item.note
                                }</span></div>`
                            }
                            if (item.medicineType !== '09') {
                                totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
                            }
                            item.className = item.medicineType === '09' ? 'isLine' : ''
                            recipes += `
                        <li>
                            <div class="clearfix">
                                <span style="width:4%;" class="${item.className}">${index + 1}.</span>
                                <span style="width:94%;" class="${item.className}">${item.itemName}【${item.spec}】 ${
    item.qty
}${item.unit}</span>
                            </div>
                            <div class="clearfix">
                                <span style="width:15%;text-align:center;" class="${item.className}">Sig.</span>
                                <span style="width:83%;" class="${item.className}">每次${item.dosage}${item.dosageUnit}，${
    item.usage
} ${item.frequency}</span>
                            </div>
                            <div class="${item.className}">${note}</div>
                        </li>
                    `
                        })
                        recipes += '</ul>'
                        recipes += '<div class="slash">/</div>'
                    } else {
                        recipes += '<ul class="chinese-medicine">'
                        list.forEach((item, index) => {
                            if (item.medicineType !== '09') {
                                totalPrice = toFixed(Number(totalPrice) + Number(item.amt), 2)
                            }
                            item.className = item.medicineType === '09' ? 'isLine' : ''
                            recipes += `<li class="${item.className}">
                           <label > ${item.itemName}</label>  &ensp;&ensp;${item.dosage || ''}${
    item.dosageUnit
}
                        </li>`
                        })
                        recipes += '</ul>'
                        recipes += '<div class="slash">/</div>'
                        dailySetting = `
                        <div class="daily-setting">
                            <div>剂数：  一剂 </div>
                            <div style="margin-top:10px;">
                                用法用量：
                                配${first.days}副
                                ${first.frequency}
                                每次${first.dose || ''}${first.doseUnit}
                                ${first.usage}
                            </div>
                        </div>
                    `
                    }
                    recipeClass = formatDictMap(
                        dictMap[this.activeName === '10' ? 484 : 485],
                        this.recipeDetail.recipeClass
                    )
                }

                const content = `
                <div class="print recipe">
                    <div class="page">
                        <div class="recipe-class">
                            <span>${recipeClass}</span>
                        </div>
                        <h1>${this.$store.getters.clinic.orgName}</h1>
                        <h2>${title}处方笺</h2>
                        <div class="main">
                            <div class="item info">
                                <div class="w3">
                                    <span><label>门诊/住院号：</label>${
    patient.outpatientNum
}</span>
                                    <span><label>科室/病区：</label>${patient.deptName}</span>
                                    <span><label>就诊类型：</label>${patient.outpatientType}</span>
                                </div>
                                <div class="w3">
                                    <span><label>姓名：</label>${patient.name}</span>
                                    <span><label>性别：</label>${patient.sex}</span>
                                    <span><label>年龄：</label>${patient.age}</span>
                                </div>
                                <div class="w2">
                                    <span><label>开具时间：</label>${patient.updateTime}</span>
                                </div>
                                <div class="w1">
                                    <span><label>临床诊断：</label>${patient.diagnosis}</span>
                                </div>

                            </div>
                            <div class="item list">
                                <h2 class="rp">RP:</h2>${recipes}
                            </div>
                        </div>

                        <div class="footer">${dailySetting}
                            <div class="item info">
                                <div class="w2">

                                <span><label style="${
    signUrl ? `float:left` : `float:none`
}">医师：</label>${
    signUrl
        ? `<img src="${signUrl}" style="height:40px;width:auto;display:inline-block;float:left;">`
        : patient.doctorName
}</span>

                                    <span style="${!isShow ? 'display:none' : 'display:block'}"><label>金额：</label>${totalPrice}</span>
                                </div>
                                 <div class="w2">
                                    <span><label>药师（审核、核对、发药）：</label>_________</span>
                                    <span><label>药师/士（调配）：</label>_________</span>
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
            var that = this
                setTimeout(function(){
                    that.openNewHtml(content)
                },10)
            }
        },

        // 打开新页面打印
        openNewHtml(content) {
            var style = `
                    <style type='text/css'>
                        body{
                            width:100%
                        }
                        .fade-enter-active,.fade-leave-active{transition:all .28s ease}.fade-enter,.fade-leave-active{opacity:0}.breadcrumb-enter-active,.breadcrumb-leave-active{transition:all .5s}.breadcrumb-enter,.breadcrumb-leave-active{opacity:0;transform:translateX(20px)}.breadcrumb-move{transition:all .5s}.breadcrumb-leave-active{position:absolute}.el-form-item__label{font-size:14px;font-weight:normal}.el-cascader.is-disabled .el-cascader__label span{color:#c0c4cc}.page-container .el-date-editor.el-input,.page-container .el-date-editor.el-input__inner,.page-container .el-select,.page-container .el-cascader,.page-container .el-input-number{width:100%}.page-container .el-input-number .el-input__inner{text-align:left}.page-container .el-radio+.el-radio{margin-left:15px}.page-container .el-select__tags>span{width:100%;display:flex}.page-container .el-select__tags>span .el-tag{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.el-breadcrumb__inner,.el-breadcrumb__inner a{font-weight:400 !important}.el-upload input[type="file"]{display:none !important}.el-upload__input{display:none}.cell .el-tag{margin-right:0px}.small-padding .cell{padding-left:5px;padding-right:5px}.fixed-width .el-button--mini{padding:7px 10px;width:60px}.status-col .cell{padding:0 10px;text-align:center}.status-col .cell .el-tag{margin-right:0px}.el-dialog{transform:none;left:0;position:relative;margin:0 auto}.article-textarea textarea{padding-right:40px;resize:none;border:none;border-radius:0px;border-bottom:1px solid #bfcbd9}.upload-container .el-upload{width:100%}.upload-container .el-upload .el-upload-dragger{width:100%;height:200px}.el-dropdown-menu a{display:block}#app .main-container{min-height:100%;transition:margin-left .28s;margin-left:180px}#app .sidebar-container{transition:width 0.28s;width:180px !important;height:100%;position:fixed;font-size:0px;top:0;bottom:0;left:0;z-index:1001;overflow:hidden}#app .sidebar-container .horizontal-collapse-transition{transition:0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out}#app .sidebar-container .scrollbar-wrapper{overflow-x:hidden !important}#app .sidebar-container .scrollbar-wrapper .el-scrollbar__view{height:100%}#app .sidebar-container .is-horizontal{display:none}#app .sidebar-container a{display:inline-block;width:100%;overflow:hidden}#app .sidebar-container .svg-icon{margin-right:16px}#app .sidebar-container .el-menu{border:none;height:100%;width:100% !important}#app .hideSidebar .sidebar-container{width:36px !important}#app .hideSidebar .main-container{margin-left:36px}#app .hideSidebar .submenu-title-noDropdown{padding-left:10px !important;position:relative}#app .hideSidebar .submenu-title-noDropdown .el-tooltip{padding:0 10px !important}#app .hideSidebar .el-submenu{overflow:hidden}#app .hideSidebar .el-submenu>.el-submenu__title{padding-left:10px !important}#app .hideSidebar .el-submenu>.el-submenu__title .el-submenu__icon-arrow{display:none}#app .hideSidebar .el-menu--collapse .el-submenu>.el-submenu__title>span{height:0;width:0;overflow:hidden;visibility:hidden;display:inline-block}#app .sidebar-container .nest-menu .el-submenu>.el-submenu__title,#app .sidebar-container .el-submenu .el-menu-item{min-width:180px !important}#app .el-menu--collapse .el-menu .el-submenu{min-width:180px !important}#app .mobile .main-container{margin-left:0px}#app .mobile .sidebar-container{transition:transform .28s;width:180px !important}#app .mobile.hideSidebar .sidebar-container{transition-duration:0.3s;transform:translate3d(-180px, 0, 0)}#app .withoutAnimation .main-container,#app .withoutAnimation .sidebar-container{transition:none}.fl{float:left}.fr{float:right}.clearfix:after{clear:both}.clearfix:after,.clearfix:before{display:table;content:""}.text-left,.tl{text-align:left}.text-center,.tc{text-align:center}.text-right,.tr{text-align:right}span{word-wrap:break-word;word-break:break-all}.p-relative{position:relative}.pre-relative{position:relative;padding-left:30px !important}.name-nowrap{display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}.toolbar{margin:20px 0}.tabs-right{float:right;z-index:9;margin-top:4px;margin-right:4px}.mt5{margin-top:5px}.icon-vip{position:absolute;display:block;left:0;top:0;width:32px;height:18px;background:url("~@/assets/icon_images/icon-vip.png") no-repeat;background-size:32px 18px}@page : pseudo-class{size:A4;margin:0}@page{size:auto;margin:4mm}@media screen{#print{display:none}}@media print{*{box-sizing:border-box}.page{margin:0;page-break-after:always}.printReport{font-size:9pt;margin-left:-7%;padding-top:10pt;transform:scale(0.85, 1)}.printReport .select-date{float:left;padding:10px 0}.printReport p{text-align:center;font-weight:bold;font-size:18px;padding-top:10px}.printReport tr td{font-weight:normal !important}.printReport table,.printReport tr,.printReport th,.printReport td{border:1px solid #666;padding:10px;min-height:40px;font-size:9pt}.printReport table.total,.printReport tr.total,.printReport th.total,.printReport td.total{background-color:oldlace}.printReport table{width:100%;margin:auto;text-align:center;border-collapse:collapse;margin-top:20px}.printReport .print-date{float:right;padding-top:15px}.print h1{margin:0}.print .footer{text-align:left;position:absolute;width:calc(100% - 32pt);bottom:35pt}.print .page{height:100%;font-size:14pt;padding-top:5pt;position:relative}.print.outpatient{width:100%;height:100%}.print.outpatient h1,.print.outpatient h2{font-size:18pt;text-align:center;line-height:32pt}.print.outpatient .page .header{border-bottom:1px solid #000}.print.outpatient .page .header div{padding-bottom:5pt}.print.outpatient .page .header div span{display:inline-block}.print.outpatient .page .header div span.w50{width:50%}.print.outpatient .page .header div span.w48{width:48%}.print.outpatient .page .header div span.w24{width:24%}.print.outpatient .page .main .basic{margin:10pt 0}.print.outpatient .page .main .basic span{display:inline-block;width:32%}.print.outpatient .page .main .item{margin-bottom:10pt}.print.outpatient .page .main .item span{line-height:16pt}.print.outpatient .page .main .item span.label{font-size:14pt;font-weight:bold}.print.outpatient .page .main .item span.content{color:#333;font-size:12pt}.print.outpatient .page .main .item code{padding:5px 15px;margin-top:5px;margin-bottom:0}.print.outpatient .page .main .item.allergies span{color:red;font-weight:bold}.print.outpatient .page .main .item .live span{display:inline-block;width:32%}.print.outpatient .page .footer ul>li{display:inline-block;width:38%;height:32pt;line-height:32pt;vertical-align:top}.print.outpatient .page .footer ul>li:first-child,.print.outpatient .page .footer ul>li:last-child{width:30%}.print.outpatient .page .footer ul>li span{display:block;padding:5pt 0;width:100%;line-height:16pt}.print.outpatient .page .footer ul>li span.line{width:150pt;height:26pt;border-bottom:1px solid #000}.print.outpatient .page .qrcode .qrcode-item{width:50%;float:left;text-align:center;margin-bottom:10pt}.print.outpatient .page .qrcode .qrcode-item span{display:block;width:100%;line-height:24pt}.print.recipe{width:100%;height:100%}.print.recipe .page{font-family:'宋体';font-size:15pt}.print.recipe .page .recipe-class{text-align:right;margin-right:20pt}.print.recipe .page .recipe-class span{display:inline-block;border:1px solid #000;padding:5pt 10pt}.print.recipe .page h1,.print.recipe .page h2{font-size:26pt;line-height:35pt;text-align:center}.print.recipe .page .main .card{line-height:32pt}.print.recipe .page .main .info{padding:10pt 0;border-top:1px solid #000;border-bottom:1px solid #000}.print.recipe .page .main .info div{overflow:hidden;zoom:1}.print.recipe .page .main .info span{display:block;float:left;line-height:26pt;font-weight:normal}.print.recipe .page .main .info .w4 span{width:25%}.print.recipe .page .main .info .w1 span{width:100%}.print.recipe .page .main .info .w3 span{width:36%}.print.recipe .page .main .info .w3 span:last-child{width:28%}.print.recipe .page .main .info .w2 span{width:80%}.print.recipe .page .main .list{font-size:22pt}.print.recipe .page .main .list h2{text-align:left;padding:12pt 0}.print.recipe .page .main .list ul.western-medicine li{border-bottom:1px dashed #ccc}.print.recipe .page .main .list ul.western-medicine li div span{display:block;min-height:1px;float:left;line-height:26pt}.print.recipe .page .main .list ul.chinese-medicine{overflow:hidden;zoom:1}.print.recipe .page .main .list ul.chinese-medicine li{float:left;margin-top:10px;min-width:24%}.print.recipe .page .main .list ul.chinese-medicine li label{font-weight:normal}.print.recipe .page .main .list ul.exam li{height:40px;width:100%}.print.recipe .page .main .list ul.exam li div{width:19%;text-align:center;display:inline-block}.print.recipe .page .main .list ul.exam li div span{display:block;min-height:1px;float:left;line-height:22pt}.print.recipe .page .main .list .slash{height:48pt;line-height:48pt;font-size:48pt;font-weight:normal;color:#333;margin-top:5pt;margin-left:50pt}.print.recipe .page .footer{width:100%;bottom:32pt}.print.recipe .page .footer .daily-setting{margin:20px 0;padding:20px 0;border-top:1px solid #000}.print.recipe .page .footer .price{padding-bottom:12pt;margin-bottom:12pt;border-bottom:1px solid #000;text-align:right}.print.recipe .page .footer .info{padding:10pt 0;border-top:1px solid #000;border-bottom:1px solid #000}.print.recipe .page .footer .info div{overflow:hidden;zoom:1}.print.recipe .page .footer .info span{display:block;float:left;line-height:22pt}.print.recipe .page .footer .info .w2 span{width:55%;display:inline-block}.print.recipe .page .footer .info .w2 span:last-child{width:45%}.print.recipe .page .footer .info .w2 span label{font-weight:normal;display:inline-block;margin-top:5px}.print.recipe .isLine{text-decoration:line-through}.printCharge{height:100%;font-weight:normal;padding:10px 20px;-webkit-transform:scale(0.95);transform:scale(0.95)}.printCharge .title{width:100%;font-size:20px;font-weight:bold;text-align:center;height:50px;line-height:50px}.printCharge .patient_info{border-bottom:1px solid #333;height:40px;line-height:40px;font-size:14px;width:100%}.printCharge .patient_info span{float:left;width:25%}.printCharge table{width:100%;margin-top:5px;font-size:14px;border-collapse:collapse}.printCharge table tr:nth-of-type(1){background-color:#e4e4e4;height:40px;text-align:left;font-weight:bold;margin-bottom:10px}.printCharge table .tr-Title{height:40px;font-weight:normal;text-align:left;margin:10px 0}.printCharge table .tr-Title th{margin:0;font-weight:normal;padding:0}.printCharge table tr{height:30px}.printCharge table td,.printCharge table th{padding:0 10px}.printCharge .bottom-Info{position:fixed;width:100%;padding:10px 20px;bottom:0}.printCharge .bottom-Info .chargeInfo{width:100%;border-top:1px solid #1c100d;border-bottom:1px solid #1c100d;height:50px;line-height:50px;margin-top:30px;font-size:14px}.printCharge .bottom-Info .chargeInfo span{display:inline-block;width:32%}.printCharge .bottom-Info .chargeInfo em{font-style:normal}.printCharge .bottom-Info .bottomInfo{width:100%;font-size:14px}.printCharge .bottom-Info .bottomInfo p:nth-of-type(1){height:30px;line-height:30px;margin-top:20px}.printCharge .bottom-Info .bottomInfo p:nth-of-type(1) span{display:inline-block;width:32%}.printCharge .bottom-Info .bottomInfo p:nth-of-type(1) small{border-bottom:1px solid #1c100d;width:100px;display:inline-block;box-sizing:border-box;font-size:14px;height:auto}.printCharge .bottom-Info .bottomInfo p:nth-of-type(2){height:30px;line-height:30px;margin-top:5px}.printCharge .bottom-Info .bottomInfo p:nth-of-type(2) span{display:inline-block;width:48%}.print-charge2{width:120%;margin-left:-10%;-webkit-transform:scale(0.8);transform:scale(0.8);padding:0 5px;font-size:14px}.print-charge2 .title{padding-top:10px;text-align:center}.print-charge2 .detail-info{width:100%;padding:0}.print-charge2 .detail-info div{overflow:hidden;zoom:1;font-weight:normal}.print-charge2 .detail-info span{display:block;float:left;font-weight:normal}.print-charge2 .detail-info .w1{margin:10px 0}.print-charge2 .detail-info .w1 span{width:100%}.print-charge2 .detail-info .w2 span{width:50%}.print-charge2 .detail-info .w3 span{width:33.3333333%}.print-charge2 .table-info{margin:15px 0;margin-right:30px;padding:5px 0;font-weight:normal;border-top:1px solid #000;border-bottom:1px solid #000}.print-charge2 .table-info div{overflow:hidden;zoom:1}.print-charge2 .table-info span{display:block;float:left;font-weight:normal}.print-charge2 .table-info .w1{margin:10px 0}.print-charge2 .table-info .w1 span{width:100%}.print-charge2 .table-info .w1 span label{font-weight:normal}.print-charge2 .table-info .w2 span{width:50%}.print-charge2 .table-info .w2 span label{font-weight:normal}.print-charge2 .table-info .w3 span{width:33.3333333%}.patientRes{width:6.5cm;padding:30px 0 15px 0}.patientRes h2,.patientRes h3{text-align:center;font-weight:normal}.patientRes h3{margin-top:10px}.patientRes .main{padding:10px 0}.patientRes .main .content{border-top:1px solid #000000;padding:10px 0 0 5px}.patientRes .main .content .item{text-align:left;margin-bottom:10px}.patientRes .main .content .item label{padding:10px 0;font-weight:500;font-size:14px}.patientRes .main .content .item label span{font-size:12px;font-weight:normal}.patientRes .main .content .item .beizhu{font-size:12px;font-weight:500}.printStorage{font-size:30px}.printStorage .first-title{margin-left:-50%;font-size:40px;padding-top:40px}.printStorage .second-form{width:38%;font-size:20px;height:60px;margin:2px 34%}.printStorage .second-form ul li{float:left;margin:5px 0;font-size:20px;width:33%}.printStorage .third-table{width:49% !important;-webkit-transform:scale(0.9);transform:scale(0.9);font-size:24px}.printStorage .third-table table{margin-left:-6%;font-size:20px;margin-top:5px;border-collapse:collapse}.printStorage .third-table table th td{font-weight:normal;text-align:center;font-size:20px;border:1px solid #999;padding:5px}.printStorage .third-table table th{padding:10px}.storage{font-size:9pt;margin-left:-7%;padding-top:10pt;transform:scale(0.85, 1)}.storage h1{font-size:16pt;text-align:center}.storage ul{font-size:14px;padding:15px}.storage ul li{float:left;margin:5px 0;width:33%}.storage table{width:100%}.storage table td,.storage table th{text-align:center;padding:5px;word-break:break-all}.printCheck{width:100%;font-size:12px}.printCheck .first-title{font-size:16px;margin:10px auto;text-align:center}.printCheck .second-form{width:100%;font-size:12px;margin:20px;height:auto;overflow:hidden}.printCheck .second-form li{float:left;margin:5px 1.5%;width:30%}.printCheck .third-table{width:100%;margin:10px 0}.printCheck .third-table table td,.printCheck .third-table table th{text-align:center;padding:5px;word-break:break-all}.printCheck .footer-time{float:right;margin:10px 5px}.printStub{width:100%;padding:0 20px}.printStub .title{width:100%;height:80px;line-height:80px;border-bottom:1px solid #333;text-align:center;font-size:23px}.printStub .subTitle{width:100%;text-align:center;margin-top:20px;font-size:23px}.printStub .content{width:100%;margin-top:50px}.printStub .content p span{margin-bottom:40px;margin-top:0;margin-left:4%}.printStub .content p span em{float:left}.printStub .content p small{overflow:hidden;display:block;padding:0 5px}.printStub .content em{font-style:normal}.printStub .content span{font-size:14px;margin-bottom:20px;display:inline-block}.printStub .content small{font-size:16px;border-bottom:1px solid #333;height:20px;display:inline-block;margin-bottom:20px;padding:0 15px;margin:0 5px}.printStub .footer{margin-top:50px}.printStub .footer p{margin-top:20px;text-align:right;margin-right:100px}.printStub .footer p:nth-of-type(2){letter-spacing:50px;margin-right:0}.printTransfer{padding:0 25px;font-size:10px}.printTransfer h1{font-weight:700;margin-top:20px;text-align:center;color:#000}.printTransfer .content{margin-top:15px}.printTransfer .content .title{color:#000;font-weight:600;font-size:17px;margin-bottom:5px}.printTransfer .content div{color:#000}.printTransfer .content div span{margin-bottom:2px;display:inline-block}.printTransfer .content div span span{display:block}.printTransfer .content div span.w100{width:100%}.printTransfer .content div span.w50{width:50%}.printTransfer .content div span.w48{width:48%}.printTransfer .content div span.w24{width:24%}}*{margin:0;padding:0;box-sizing:border-box}ul,li{list-style:none}body{height:100%;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-family:Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif}label{font-weight:700}html{height:100%;box-sizing:border-box}#app{height:100%}.mobile .page-container{min-width:365px}.page-container{min-width:1186px;height:100%;padding:10px;background-color:#f0f2f5}.page-container .page-main{background:#FFF;padding:10px}.page-container .page-main .el-scrollbar__wrap{overflow-x:hidden}.page-container .page-main .fixed-menu{position:fixed;z-index:1999;top:100px;right:0;background-color:#FFF;box-shadow:0px 0px 8px 0px rgba(0,0,0,0.09);border-radius:4px 0px 0px 4px;border:1px solid #D9E0ED;transition:right .2s linear}.page-container .page-main .fixed-menu .aside{width:14px;height:64px;background:url(~@/assets/icon_images/aside.png) 0 0 no-repeat;position:absolute;top:50%;transform:translateY(-50%);left:-14px;cursor:pointer}.page-container .page-main .fixed-main{transition:width .2s linear}*,*:before,*:after{box-sizing:inherit}.no-padding{padding:0px !important}.padding-content{padding:4px 0}a:focus,a:active{outline:none}a,a:focus,a:hover{cursor:pointer;color:inherit;text-decoration:none}div:focus{outline:none}.fr{float:right}.fl{float:left}.pr-5{padding-right:5px}.pl-5{padding-left:5px}.block{display:block}.pointer{cursor:pointer}.inlineBlock{display:block}.clearfix:after{visibility:hidden;display:block;font-size:0;content:" ";clear:both;height:0}code{background:#eef1f6;padding:15px 16px;margin-bottom:20px;display:block;line-height:36px;font-size:15px;font-family:"Source Sans Pro", "Helvetica Neue", Arial, sans-serif}code a{color:#337ab7;cursor:pointer}code a:hover{color:#20a0ff}.warn-content{background:rgba(66,185,131,0.1);border-radius:2px;padding:16px;padding:1rem;line-height:1.6rem;word-spacing:.05rem}.warn-content a{color:#42b983;font-weight:600}.app-container{padding:20px}.components-container{margin:30px 50px;position:relative}.pagination-container{margin-top:30px}.text-center{text-align:center}.sub-navbar{height:50px;line-height:50px;position:relative;width:100%;text-align:right;padding-right:20px;transition:600ms ease position;background:linear-gradient(90deg, #20b6f9 0%, #20b6f9 0%, #2178f1 100%, #2178f1 100%)}.sub-navbar .subtitle{font-size:20px;color:#fff}.sub-navbar.draft{background:#d0d0d0}.sub-navbar.deleted{background:#d0d0d0}.link-type,.link-type:focus{color:#337ab7;cursor:pointer}.link-type:hover,.link-type:focus:hover{color:#20a0ff}.filter-container{padding-bottom:10px}.filter-container .filter-item{display:inline-block;vertical-align:middle;margin-bottom:10px}
                    </style>`
            const oPop = window.open('', 'oPop')
            const str = `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body>${content}</body></html>`
            oPop.document.write(str)
            oPop.print()
            oPop.close()
        }

    }
}
export default mixin
