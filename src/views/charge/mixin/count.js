import {
    getFloat,
    add,
    multiply,
    toFixed
} from '@/utils/float'
const mixin = {
    data() {
        const dictMap = this.$store.getters.dictData
        return {
            isAddOther: false,
            otherChargeList: [],
            otherChargeColumns: [{
                value: 'groupSn',
                label: '组号',
                type: 'input',
                width: 80,
                func: this.handleEditGroupNum
            }, {
                value: 'name',
                label: '项目名称',
                width: 200
            }, {
                value: 'spec',
                label: '规格'
            }, {
                value: 'qtySum',
                label: '库存'
            },
            // {
            //     value: 'specDose',
            //     label: '剂量',
            //     type: 'input',
            //     blurFunc: this.handleBlurDose
            // }, {
            //     value: 'days',
            //     label: '剂数',
            //     type: 'input',
            //     blurFunc: this.handleBlurNum
            // }, {
            //     value: 'userMethod',
            //     label: '中药煎法',
            //     type: 'select',
            //     opts: dictMap[152]
            // },
            {
                value: 'unit',
                label: '单位'
            }, {
                value: 'price',
                label: '单价'
            }, {
                value: 'qty',
                label: '总量',
                type: 'input',
                func: this.handleChangeTotalNum,
                blurFunc: this.handleBlurChangeTotalNum
            }, {
                value: 'amt',
                label: '金额'
            }, {
                value: 'medicineType',
                label: '药品来源',
                type: 'select',
                opts: dictMap[146],
                func: this.handleChangeSource
            }, {
                value: 'executiveSection',
                label: '操作',
                width: 108,
                fixed: 'right',
                btnType: 'danger',
                func: this.delProject,
                text: '删除',
                type: 'button'
            }
            ],
            addColumns: [{
                label: '类型',
                width: '50',
                formatter(row) {
                    return row.chara === '10'
                            ? '西药'
                            : row.chara === '20'
                            ? '中药'
                            : row.chara === '30'
                            ? '检验/检查'
                            : row.chara === '40'
                            ? '治疗'
                            : row.chara === '50'
                            ? '材料'
                            : row.chara === '99'
                            ? '其他'
                            : ''
                }
            },
            {
                value: 'name',
                label: '名称',
                width: '250'
            },
            {
                value: 'spec',
                label: '规格',
                width: '100'
            },
            {
                value: 'price',
                label: '单价',
                width: '100'
            },
            {
                value: 'manufacturerName',
                label: '厂商',
                width: '250'
            }
            ]
        }
    },
    methods: {
        // 增加收费项目
        addItem(row) {
            let flag = false
            if (this.otherChargeList.length > 0) {
                this.otherChargeList.forEach(item => {
                    if (item.id === row.id) {
                        flag = true
                    }
                })
            }
            if (flag) {
                this.$message.error('已存在的项目，无需重复添加')
                return
            }

            let specDose = ''
            let days = '' // 剂数
            let userMethod = ''
            let qty = ''

            const unitPrice = row.isTiny === 1 ? row.tinyPrice : row.price
            const isWestM = row.chara !== '20'

            userMethod = isWestM ? 'null' : row.userMethod || '152'
            specDose = isWestM ? 'null' : row.specDose || 100
            days = isWestM ? 'null' : row.days || 1
            qty = isWestM ? 1 : days * specDose

            const pro = Object.assign({}, row)
            pro.isInput = !isWestM
            pro.qtySum = row.qty

            pro.specDose = specDose
            pro.days = days
            pro.userMethod = userMethod
            pro.qty = qty
            pro.unitPrice = unitPrice
            pro.amt = getFloat(unitPrice * qty, 2)
            pro.groupSn = this.otherChargeList.length + 1
            pro.medicineType = '01'
            pro.frequency = row.useFrequency

            this.otherChargeList.push(pro)
            // 收费汇总
            this.quickSum = 0
            this.construtList.forEach(constr => {
                if (pro.chara === constr.chara) {
                    constr.money = add(constr.money, pro.amt)
                }
                this.quickSum = add(this.quickSum, constr.money)
            })
        },

        // 修改快速收费的项目总量 计算金额（blur）
        handleBlurChangeTotalNum(val, row, index) {
            row.qty = row.qtySum ? (isNaN(val) || val <= 0 ? 1 : val > row.qtySum ? row.qtySum : val) : isNaN(val) || val <= 0 ? 1 : val
            this.frashAmt(row, index)
        },
        // 修改快速收费的项目总量 计算金额(input)
        handleChangeTotalNum(val, row, index) {
            this.frashAmt(row, index)
        },

        // 更新收费汇总等金额
        frashAmt(row, index) {
            let charaAmt = 0
            let total = 0
            this.chargeList.forEach((item, i) => {
                if (row.chara === item.chara) {
                    charaAmt = add(charaAmt, item.amt)
                }
            })
            this.otherChargeList.forEach((item, i) => {
                if (item.medicineType !== '09') {
                    if (i === index) {
                        item.amt = multiply(item.unitPrice, item.qty)
                    }
                    if (row.chara === item.chara) {
                        charaAmt = add(charaAmt, item.amt)
                    }
                }
            })
            this.construtList.forEach(obj => {
                if (row.chara === obj.chara) {
                    obj.money = charaAmt
                }
                total = add(total, obj.money)
            })
            this.quickSum = total
        },
        // 快速收费的删除
        delProject(row, index) {
            this.otherChargeList.splice(index, 1)
            this.freshGroupNum()
            this.frashAmt(row, index)
        },

        // 快速收费的组号更新
        freshGroupNum() {
            this.otherChargeList.forEach((item, index) => {
                item.groupSn = index + 1
            })
        },
        // 取消添加其他收费项
        cancelOtherCharge() {
            this.otherChargeList = []
            this.isAddOther = false
            let total = 0
            this.construtList = [{
                chara: '10',
                money: 0,
                project: '西药费'
            },
            {
                chara: '20',
                money: 0,
                project: '中药费'
            },
            {
                chara: '30',
                money: 0,
                project: '检验/检查'
            },
            {
                chara: '40',
                money: 0,
                project: '治疗费'
            },
            {
                chara: '50',
                money: 0,
                project: '材料费'
            },
            {
                chara: '99',
                money: 0,
                project: '其他'
            }
            ]
            this.chargeList.forEach((item, i) => {
                if (item.chara === '10') {
                    this.construtList[0].money = add(
                        toFixed(this.construtList[0].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '20') {
                    this.construtList[1].money = add(
                        toFixed(this.construtList[1].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '30') {
                    this.construtList[2].money = add(
                        toFixed(this.construtList[2].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '40') {
                    this.construtList[3].money = add(
                        toFixed(this.construtList[3].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '50') {
                    this.construtList[4].money = add(
                        toFixed(this.construtList[4].money, 2),
                        toFixed(item.amt, 2)
                    )
                } else if (item.chara === '99') {
                    this.construtList[5].money = add(
                        toFixed(this.construtList[5].money, 2),
                        toFixed(item.amt, 2)
                    )
                }
                total = add(total, item.amt)
            })
            this.quickSum = total
        },
        // 修改药品来源
        handleChangeSource(event, row, index) {
            this.frashAmt(row, index)
        }

    }
}

export default mixin
