import {
    Local
} from '@/utils/storage'

import {
    getDictById
} from '@/api/catalog'
import {
    param
} from '@/utils'
const dict = {
    state: {
        dictMap: {
            1: [], // 收费项目
            6: [], // 卡类型
            9: [], // 性别
            20: [], // 职业
            25: [], // 家庭关系（与患者关系）
            29: [], // 民族
            30: [], // 患者来源
            35: [], // 库存单位
            41: [], // 登记类型
            60: [], // 血型
            70: [], // 就诊方式
            78: [], // 医保类型
            79: [], // 用户类型
            107: [], // 婚姻状况
            125: [], // RH血型
            134: [], // 人员类别
            135: [], // 工作形式
            136: [], // 医生类型
            138: [], // 过敏反应
            139: [], // 过敏源
            140: [], // 过敏程度
            141: [], // 入库方式、出库方式
            142: [], // 体温类型
            143: [], // 预约类型
            144: [], // 用法-西药
            152: [], // 用法-中药
            145: [], // 频率
            146: [], // 药品来源
            149: [], // 药品类型
            487: [], // 药品类型2
            480: [], // 编号类型
            489: [], // 效期类型,
            483: [], // 每日剂量单位
            484: [], // 西药/中成药处方类型
            485: [], // 中药处方类型
            488: [], // 医生头衔
            131: [], // 证件类型,
            520: [], // 其他项目分类
            519: [], // 材料项目分类
            518: [], // 治疗项目分类
            517: [], // 检验检查项目分类
            516: [], // 中药项目分类
            515: [], // 西药项目分类
            523: [], // 保健相关细项分类
            524: [], // 科室
            526: [], // 排队状态
            527: [], // 授权等级
            530: [], // 日志查询状态
            531: [], // 日志类型
            532: [], // 日志区域
            533: [] // 其他相关细项分类
        }
    },
    actions: {
        getDictByIdListData({
            commit,
            state
        },
        params
        ) {
            state.dictMap =
                Local.get('dictMap') == null
                    ? state.dictMap
                    : Local.get('dictMap')
            return new Promise(
                (resolve, reject) => {
                    const data = {
                        dictId: params,
                        isUse: 1
                    }
                    getDictById(data)
                        .then(res => {
                            const d =
                                res.ITEMS.records
                            state.dictMap[
                                params
                            ] = []
                            d.forEach(item => {
                                // if (item.dictId === 25 || item.dictId === 524) {
                                //     state.dictMap[
                                //         params
                                //     ].push({
                                //         value: param({
                                //             label: item.name,
                                //             value: item.code
                                //         }),
                                //         label: item.name
                                //     })
                                // } else {
                                //     state.dictMap[
                                //         params
                                //     ].push({
                                //         value: item.code,
                                //         label: item.name,
                                //         note: item.note
                                //     })
                                // }
                                let obj = {}
                                if (item.dictId === 78) {
                                    obj = {
                                        value: param({
                                            medicalInsuranceCode: item.code,
                                            medicalInsuranceType: item.name
                                        }),
                                        label: item.name
                                    }
                                } else if (item.dictId === 79) {
                                    obj = {
                                        value: param({
                                            commercialInsuranceCode: item.code,
                                            commercialInsuranceType: item.name
                                        }),
                                        label: item.name
                                    }
                                    if (item.code === '3' || item.code === '12') {
                                        obj.disabled = true
                                    }
                                } else if (item.dictId === 70) {
                                    obj = {
                                        value: item.name,
                                        label: item.name
                                    }
                                } else if (item.dictId === 25 || item.dictId === 524) {
                                    obj = {
                                        value: param({
                                            label: item.name,
                                            value: item.code
                                        }),
                                        label: item.name
                                    }
                                } else {
                                    obj = {
                                        value: item.code,
                                        label: item.name,
                                        note: item.note,
                                        isUse: item.isUse
                                    }
                                }
                                if (item.dictId === 30 && (item.code === '01' || item.code === '99')) {
                                    obj.disabled = true
                                }
                                if (item.dictId === 6) {
                                    obj.disabled = false
                                }
                                if (item.dictId === 131) {
                                    if (item.code === '1' || item.code === '7') {
                                        state.dictMap[
                                            params
                                        ].push({
                                            value: item.code,
                                            label: item.name
                                        })
                                    }
                                } else {
                                    state.dictMap[
                                        params
                                    ].push(obj)
                                }
                            })
                            commit('GETDICTDATA') // 持久化保存数据
                            resolve(state.dictMap)
                        })
                        .catch(err => {
                            reject(err)
                        })
                }
            )
        }
    },
    mutations: {
        GETDICTDATA(state) {
            Local.set('dictMap', {})
            Local.set('dictMap', state.dictMap)
        }
    }
}
export default dict
