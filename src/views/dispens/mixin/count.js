import {toFixed} from '@/utils/float'
const mixin = {
  data(){
    return {
      selections:[],
      refundAmt:0,
      isAllRefund:0
    }
  },
  methods:{

// 输入退费数量失去焦点时计算
changeNum(index, val) {
  const refundList=this.tableData
  val = isNaN(val) || val <= 0 ? 0: val > refundList[index].qty? refundList[index].qty: val
  if (val <= 0) {
      this.$refs.multipleTable.$refs.selftab.toggleRowSelection(refundList[index], false)
  }
  // 更改对应的退药数量、退药金额
  refundList[index].refundNum = val
  // refundList[index].refundAccount = toFixed(
  //     refundList[index].price * refundList[index].refundNum,
  //     4
  // ) // 退费金额
  // this.freshAccount()
},



// 获取选中的退费项目
handleSelectChange(selections, row) {
if (JSON.stringify(selections).indexOf(JSON.stringify(row)) > -1) {
    row.refundNum = row.qty
    row.refundAccount = toFixed(row.qty * row.price, 4)
    row.showInput = true
} else {
    row.refundNum = 0
    row.refundAccount = 0
    row.showInput = false
}
this.selections = selections
this.freshAccount()
},

// 设置某些行不可选
handleSelecTable(row) {
if (row.disabled) {
    return false
} else {
    return true
}
},

// 全选
handleSelectAll(selection) {
  // const n = this.tab2Active.replace(/[^0-9]/ig,"") - 1
  // const refundList = this.tab2List[n].detailList
  const refundList=this.tableData
if (selection && selection.length > 0) {
    selection.forEach(item => {
        item.refundNum = item.qty
        item.refundAccount = toFixed(item.qty * item.price, 4)
        item.showInput = true
    })
} else {
    if (refundList && refundList.length > 0) {
        refundList.forEach(item => {
            item.refundNum = 0
            item.refundAccount = 0
            item.showInput = false
        })
    }
}
this.selections = selection
this.freshAccount()
},

// 统计各类合计
  freshAccount() {
    // const index = this.tab2Active.replace(/[^0-9]/ig,"") - 1
    // const refundList = this.tab2List[index].detailList
    const refundList=this.tableData
    this.refundAmt = 0
    let selectCount = 0
    let lastCount = 0
    for (var i = 0; i < this.selections.length; i++) {
        this.refundAmt += Number(this.selections[i].refundAccount)
        selectCount += Number(this.selections[i].refundNum)
    }
    for (var j = 0; j < refundList.length; j++) {
        lastCount += Number(refundList[j].num)
    }
    this.refundAmt = toFixed(this.refundAmt, 2) // 应退金额

    this.isAllRefund = selectCount === lastCount // 是否全退
    }
  },
  
}
export default mixin