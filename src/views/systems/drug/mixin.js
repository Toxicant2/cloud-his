import { getCatStockList } from '@/api/catalog'
import { param } from '@/utils'

import { debounce } from '@/utils/tool'
const mixin = {
    data() {
        return {
            popoverVisible: false,
            chargeItemForm: {
                name: '',
                manufacturer: ''
            },
            chargeItemList: [],
            chargeItemPageIndex: 1,
            chargeItemPageSizes: [10, 20, 50, 100],
            chargeItemPageSize: 10,
            chargeItemTotal: 0
        }
    },
    methods: {
        // 查询初始化
        handleChargeItemInit() {
            this.chargeItemForm = {
                name: '',
                manufacturer: ''
            }
            this.chargeItemList = []
            this.chargeItemPageIndex = 1
            this.chargeItemPageSize = 10
            this.chargeItemTotal = 0
        },

        // 收费项目查询
        handleChargeItemSearch: debounce(
            function() {
                const data = this.chargeItemForm
                if (data.name || data.manufacturer) {
                    const params = {
                        name: data.name,
                        manufacturer: data.manufacturer,
                        pageNo: this.chargeItemPageIndex,
                        pageSize: this.chargeItemPageSize,
                        isUse: 1
                    }
                    const activeName = this.activeName
                    const notTab4 = activeName !== 'tab4'
                    if (activeName === 'tab5') {
                        params.chara = '99'
                        params.catType = '9902'
                        if (this.otherActiveName === 'tab1') {
                            params.typeCode = '990202'
                            params.isMedicine = 1
                        } else {
                            params.typeCode = '990201'
                            params.isMedicine = 0
                        }
                    } else {
                        params.isMedicine = this.maps[activeName].isMedicine
                        params.chara = this.maps[activeName].chara
                    }
                    this.reomteLoading = true
                    getCatStockList(params, notTab4 ? 'stock' : 'accrual').then(
                        res => {
                            if (res.STATUS === '1') {
                                this.reomteLoading = false
                                const d = res.ITEMS
                                const total = d.totalRecord || d.total
                                const list = d.list || d.records
                                this.chargeItemTotal = total
                                this.chargeItemList = list
                            }
                        }
                    )
                } else {
                    this.chargeItemPageIndex = 1
                    this.chargeItemList = []
                }
            },
            1000,
            false
        ),

        handleChargeItemSizeChange(val) {
            this.chargeItemPageSize = val
            this.handleChargeItemSearch()
        },

        handleChargeItemCurrentChange(val) {
            this.chargeItemPageIndex = val
            this.handleChargeItemSearch()
        },

        // 选中收费项目
        handleChargeItemClick(item) {
            const typeCode = this.activeName === 'tab1' ? item.typeCode ? item.typeCode.split('&') : [] : item.typeCode || ''

            this.formDoms[0].items[0].disabled = true
            this.initForms({
                id: 0,
                sysCatId: item.id,
                name: item.name,
                code: '', // item.code( 编码根据药品类型生成 )
                unit: item.unit || '',
                spec: item.spec || '', // 规格
                specDose: item.specDose || '', // 剂量
                specDoseUnit: item.specDoseUnit || '', // 剂量单位
                specDispUseRatio: item.specDispUseRatio || '', // 制剂数量
                specUnit: item.specUnit || '', //  库存单位
                specUseUnit: item.specUseUnit || '', // 制剂单位
                manufacturerName: item.manufacturerName,
                manufacturerSpellCode: item.manufacturerSpellCode,
                spellCode: item.spellCode,
                tradeSpellCode: item.tradeSpellCode,
                // price: item.price,
                maxPrice: item.maxPrice,
                typeCode,
                standCode: item.standCode || '',
                formName: item.formName || '',
                catType: item.catType || '',
                approvalNum: item.approvalNum || '',
                tradeName: item.tradeName || '',
                chara: item.chara || '',
                isTiny: item.isTiny || 0,
                isPrice: item.isPrice,
                description: item.description || '',
                insuranceCodes: item.insurance || '', // 定向用户insuranceCodes
                accountItemStr: item.accountItemCode
                    ? param({
                        accountItemCode: item.accountItemCode,
                        accountItemName: item.accountItemName
                    })
                    : '', // 会计项目
                invoiceItemStr: item.invoiceItemCode
                    ? param({
                        invoiceItemCode: item.invoiceItemCode,
                        invoiceItemName: item.invoiceItemName
                    })
                    : '', // 发票项目
                // useFrequencyStr: item.useFrequencyCode
                //     ? param({
                //         useFrequencyCode: item.useFrequencyCode,
                //         useFrequencyName: item.useFrequencyName
                //     })
                //     : '', // 默认频率
                // userMethodStr: item.useMethodCode
                //     ? param({
                //         userMethodCode: item.useMethodCode,
                //         userMethodName: item.useMethodName
                //     })
                //     : '', // 默认用法
                // doasge: item.dosage || '',
                // dosage: item.doasge || '',// 默认用量
                yieldlyName: item.yieldlyName,
                url: item.url,
                antiLevel: item.antiLevel || '0', // 是否抗菌药物
                narcoticHempLabeling: item.narcoticHempLabeling || '0' // 是否毒麻药物
            })
            this.typeChange(
                this.activeName === 'tab1' || this.activeName === 'tab4' ? item.catType : typeCode
            )
            this.popoverVisible = false
        }
    }
}
export default mixin
