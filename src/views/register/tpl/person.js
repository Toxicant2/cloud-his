import { disabledPickerOpts } from '@/utils'
import { getDictByIdList } from '@/api/catalog'
import { getAreaOrgOpts } from '@/api/org'

import zczs from '@/assets/system_images/zczs.png'
import zgfz from '@/assets/system_images/zgfz.png'
import zgzy from '@/assets/system_images/zgzy.png'
import zyfz from '@/assets/system_images/zyfz.png'
import zyxq from '@/assets/system_images/zyxq.png'

const dictMap = {
    9: [], // 性别
    73: [], // 职称
    131: [], // 证件类型
    132: [] // 所学专业
}
let str = ''
for (const key in dictMap) {
    str += `dictId=${key}&`
}
str = str.substring(0, str.length - 1)
getDictByIdList(str).then(res => {
    if (res.STATUS === '1') {
        const d = res.ITEMS
        if (d && d.length > 0) {
            d.forEach(item => {
                // if (item.dictId === 131) {
                //     if (item.code === '1' || item.code === '7') {
                //         dictMap[item.dictId].push({
                //             value: item.code,
                //             label: item.name
                //         })
                //     }
                // } else {
                dictMap[item.dictId].push({
                    value: item.code,
                    label: item.name
                })
                // }
            })
        }
    }
})
// 运营机构
const orgList = []
getAreaOrgOpts().then(res => {
    if (res.STATUS === '1') {
        const d = res.ITEMS
        if (d && d.length > 0) {
            d.forEach(item => {
                orgList.push({
                    value: item.id,
                    label: item.name
                })
            })
        }
    }
})
export const person = [
    {
        name: '基本信息',
        list: [
            {
                type: 'input',
                name: '姓名',
                basic: 'realName',
                maxlength: 50,
                placeholder: '请输入姓名',
                rules: [
                    {
                        required: true,
                        message: '姓名必填',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'select',
                name: '性别',
                basic: 'sex',
                rules: [
                    {
                        required: true,
                        message: '性别必填',
                        trigger: 'change'
                    }
                ],
                opts: dictMap[9]
            },
            {
                type: 'date',
                name: '出生日期',
                basic: 'birthday',
                rules: [
                    {
                        required: true,
                        message: '出生日期必填',
                        trigger: 'change'
                    }
                ],
                options: disabledPickerOpts,
                format: 'yyyy-MM-dd',
                valueFormat: 'yyyy-MM-dd 00:00:00'
            },
            {
                type: 'select',
                basic: 'certType',
                name: '证件类型',
                placeholder: '请选择证件类型',
                opts: dictMap[131],
                rules: [
                    {
                        required: true,
                        message: '证件类型必选',
                        trigger: 'change'
                    }
                ]
            },
            {
                type: 'input',
                basic: 'certCode',
                name: '证件号码',
                placeholder: '请输入证件号码',
                maxlength: 18,
                rules: [
                    {
                        required: true,
                        message: '证件号码必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: '',
                        message: '',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'select',
                name: '所学专业',
                basic: 'specialtyCode',
                opts: dictMap[132],
                rules: [
                    {
                        required: true,
                        message: '所学专业必填',
                        trigger: 'change'
                    }
                ]
            },
            {
                type: 'select',
                name: '运营机构',
                basic: 'orgId',
                opts: orgList,
                rules: [
                    {
                        required: true,
                        message: '运营机构必选',
                        trigger: 'change'
                    }
                ],
                isHidden: false
            },
            {
                type: 'input',
                name: '所属医院',
                basic: 'hospital',
                placeholder: '请选择所属医院'
            },
            {
                type: 'input',
                name: '',
                basic: 'position',
                maxlength: 20,
                placeholder: '请输入所属医院职务'
            },
            {
                type: 'input',
                name: '所属科室',
                basic: 'depart',
                maxlength: 20,
                placeholder: '请输入所属科室'
            },
            {
                type: 'select',
                name: '职称',
                basic: 'title',
                opts: dictMap[73],
                rules: [
                    {
                        required: true,
                        message: '职称必填',
                        trigger: 'change'
                    }
                ]
            },
            {
                type: 'input',
                name: '医护人员职称证书编号',
                basic: 'titleCertCode',
                placeholder: '请输入医护人员职称证书编号',
                rules: [
                    {
                        required: false,
                        message: '医护人员职称证书编号必填',
                        trigger: 'blur'
                    }
                ]
                // isHidden: true
            },
            {
                type: 'upload',
                name: '医护人员职称证书照片',
                smallName: '(仅限为认证使用,不会公开)',
                question: [
                    {
                        type: 'item',
                        name: '发证日期和执业地点页',
                        fileType: 5,
                        limit: 1,
                        fileIndex: 'i10',
                        prompting: '上传带有发证日期和执业地点的图片',
                        demoImgs: [
                            {
                                url: zczs,
                                name: '发证日期和执业地点页'
                            }
                        ]
                    }
                ],
                rules: [
                    {
                        required: false,
                        message: '医护人员职称证书照片必填',
                        trigger: 'change'
                    }
                ]
                // isHidden: true
            },
            {
                type: 'input',
                inputType: 'textarea',
                name: '擅长',
                basic: 'specialSkill',
                placeholder: '最多输入200字',
                autosize: {
                    minRows: 4,
                    maxRows: 8
                },
                rules: [
                    {
                        max: 200,
                        message: '最多输入200字',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'upload',
                name: '医生个人工作照',
                question: [
                    {
                        type: 'item',
                        name: '正本',
                        fileType: 1,
                        limit: 1,
                        fileIndex: 'i1'
                    }
                ]
            },
            {
                type: 'input',
                name: '医护人员资格证书编号',
                basic: 'certificateCode',
                maxlength: 50,
                placeholder: '请输入资格证书编号',
                rules: [
                    {
                        required: false,
                        message: '医护人员资格证书编号必填',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'upload',
                name: '医护人员资格证书照片',
                smallName: '(仅限为认证使用,不会公开)',
                question: [
                    {
                        type: 'item',
                        name: '发证日期页',
                        fileType: 3,
                        fileIndex: 'i2',
                        limit: 1,
                        prompting: '上传带有发证日期和执业地点的图片',
                        demoImgs: [
                            {
                                url: zgfz,
                                name: '发证日期页'
                            },
                            {
                                url: zgzy,
                                name: '执业地点页'
                            }
                        ]
                    },
                    {
                        type: 'item',
                        name: '执业地点页',
                        fileType: 6,
                        fileIndex: 'i11',
                        limit: 1
                    }
                ],
                rules: [
                    {
                        required: false,
                        message: '医护人员资格证书照片必填',
                        trigger: 'change'
                    }
                ]
            },
            {
                type: 'input',
                name: '医护人员执业证书编号',
                basic: 'practiceCode',
                maxlength: 32,
                placeholder: '请输入执业证书编号',
                rules: [
                    {
                        required: false,
                        message: '医护人员执业证书编号必填',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'upload',
                name: '医护人员执业证书照片',
                smallName: '(仅限为认证使用,不会公开)',
                question: [
                    {
                        type: 'item',
                        name: '发证日期页',
                        fileType: 4,
                        fileIndex: 'i3',
                        limit: 1,
                        prompting: '上传带有发证日期和执业地点的图片',
                        demoImgs: [
                            {
                                url: zyfz,
                                name: '发证日期页'
                            },
                            {
                                url: zyxq,
                                name: '详情信息页'
                            }
                        ]
                    },
                    {
                        type: 'item',
                        name: '详情信息页',
                        fileType: 7,
                        fileIndex: 'i12',
                        limit: 1
                    }
                ],
                rules: [
                    {
                        required: false,
                        message: '医护人员执业证书照片片必填',
                        trigger: 'change'
                    }
                ]
            },
            {
                type: 'upload',
                name: '电子签名照片',
                question: [
                    {
                        type: 'item',
                        name: '建议上传190*60的图片',
                        fileType: 9,
                        fileIndex: 'i9',
                        limit: 1
                    }
                ]
            }
        ]
    },
    {
        name: '详细信息',
        list: [
            {
                type: 'radio',
                name: '是否开展互联网诊疗',
                basic: 'isQaOnline',
                rules: [
                    {
                        required: true,
                        message: '是否开展互联网诊疗必填',
                        trigger: 'change'
                    }
                ],
                opts: [
                    {
                        value: 1,
                        label: '是'
                    },
                    {
                        value: 0,
                        label: '否'
                    }
                ]
            },
            {
                type: 'input',
                name: '联系方式',
                basic: 'officeTelephone',
                placeholder: '区号-电话号码，示例021-66666666或者手机号',
                rules: [
                    {
                        required: true,
                        message: '联系方式必填',
                        trigger: 'blur'
                    },
                    {
                        pattern: /(^(0\d{2,3}-)?\d{7,8}$)|(^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$)/,
                        message: '请输入正确的联系方式',
                        trigger: 'blur'
                    }
                ]
            },
            {
                type: 'radio',
                name: '工作年限',
                basic: 'workYears',
                rules: [
                    {
                        required: true,
                        message: '工作年限必填',
                        trigger: 'change'
                    }
                ],
                opts: [
                    {
                        label: '3年以上独立临床工作经验',
                        value: '1'
                    },
                    {
                        label: '0-3年(含)独立临床工作经验',
                        value: '2'
                    }
                ],
                isHidden: true
            }
        ]
    }
    // {
    //     name: '',
    //     list: [
    //         {
    //             type: 'switch',
    //             name: '',
    //             basic: 'isOpenPersionalStudio',
    //             labelWidth: '0',
    //             activeText: '开通医生个人工作室（可在线上进行诊疗服务） 【根据实际情况选择是否开通】',
    //             activeValue: 1,
    //             inactiveValue: '0'
    //         }
    //     ]
    // }
]
