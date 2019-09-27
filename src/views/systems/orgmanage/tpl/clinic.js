import cityList from '@/common/data/city.js'
import store from '@/store'
import {
    getDictById
} from '@/api/catalog'
import {
    param
} from '@/utils'
const dictData = store.getters.dictData
// 诊疗科目
const subjectList = []
const data = {
    dictId: 132
}
getDictById(data).then(res => {
    if (res.STATUS === '1') {
        const d = res.ITEMS.records
        d.forEach(item => {
            subjectList.push({
                value: param({
                    sort: item.sort,
                    subjectCode: item.code,
                    subjectName: item.name
                }),
                label: item.name
            })
        })
    }
})
export const clinic = [{
    name: '管理员信息',
    basic: 'clinic',
    list: [{
        type: 'input',
        name: '管理员用户名',
        basic: 'username',
        placeholder: '请输入管理员用户名',
        rules: [{
            required: true,
            message: '管理员用户名必填',
            trigger: 'blur'
        }]
    },
    {
        type: 'input',
        name: '管理员手机号',
        basic: 'phone',
        placeholder: '请输入管理员手机号',
        maxlength: 11,
        rules: [{
            required: true,
            message: '管理员手机号必填',
            trigger: 'blur'
        },
        {
            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
        }
        ]
    }
    ]
},
{
    name: '基本信息',
    basic: 'clinic',
    list: [{
        type: 'input',
        name: '医疗机构名称',
        basic: 'name',
        placeholder: '请输入医疗机构名称',
        rules: [{
            required: true,
            message: '医疗机构名称必填',
            trigger: 'blur'
        }]
    },
    {
        type: 'input',
        name: '执业许可证名称',
        basic: 'licenseName',
        placeholder: '请输入执业许可证名称',
        rules: [{
            required: true,
            message: '执业许可证名称必填',
            trigger: 'blur'
        }]
    },
    {
        type: 'input',
        name: '执业许可证登记号',
        basic: 'licenseNum',
        placeholder: '请输入执业许可证登记号',
        rules: [{
            required: true,
            message: '执业许可证登记号必填',
            trigger: 'blur'
        }]
    },
    {
        type: 'input',
        name: '组织机构代码',
        basic: 'code',
        placeholder: '请输入组织机构代码',
        rules: [{
            required: true,
            message: '组织机构代码必填',
            trigger: 'blur'
        }]
    },
    {
        type: 'select',
        name: '组织机构类型',
        basic: 'orgLevel',
        opts: dictData[527],
        rules: [{
            required: true,
            message: '组织机构类型必填',
            trigger: 'change'
        }]
    },
    {
        type: 'input',
        name: '运营机构',
        basic: 'orgName',
        disabled: true,
        rules: [{
            required: true,
            message: '运营机构必选',
            trigger: 'blur'
        }]
    },
    {
        type: 'cascader',
        name: '医疗机构地址',
        basic: 'level3',
        rules: [{
            required: true,
            message: '医疗机构地址必填',
            trigger: 'blur'
        }],
        changeOnSelect: false, // 是否允许选择任意一级的选
        list: cityList
    },
    {
        type: 'input',
        name: '详细地址',
        basic: 'address',
        rules: [{
            required: true,
            message: '医疗机构详细地址必填',
            trigger: 'blur'
        }],
        placeholder: '请输入详细地址'
    }
    ]
},
{
    name: '详细信息',
    basic: 'clinic',
    list: [{
        type: 'radio',
        name: '是否医保定点',
        basic: 'isMedicalInsurance',
        rules: [{
            required: true,
            message: '是否医保定点必选',
            trigger: 'change'
        }],
        opts: [{
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
        type: 'radio',
        name: '是否个人工作室',
        basic: 'isSharePatientInfo',
        rules: [{
            required: true,
            message: '是否个人工作室必选',
            trigger: 'change'
        }],
        opts: [{
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
        type: 'radio',
        name: '是否商保定点',
        basic: 'isCommercialInsurance',
        rules: [{
            required: true,
            message: '是否商保定点必选',
            trigger: 'change'
        }],
        opts: [{
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
        type: 'checkbox',
        basic: 'subjectList',
        name: '诊疗科目',
        opts: subjectList,
        rules: [{
            required: true,
            message: '诊疗科目必选',
            trigger: 'change'
        }],
        className: 'subject'
    },
    {
        type: 'input',
        name: '联系方式',
        basic: 'telephone',
        placeholder: '区号-电话号码，示例021-66666666或者手机号',
        rules: [{
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
        type: 'consultingHour',
        name: '门诊时间',
        rules: [{
            required: true
        }],
        list: [{
            name: '上午',
            start: '06:00',
            end: '12:00',
            step: '00:15',
            basic: 'morning'
        },
        {
            name: '下午',
            start: '12:00',
            end: '18:00',
            step: '00:15',
            basic: 'afternoon'
        },
        {
            name: '晚上',
            start: '18:00',
            end: '22:00',
            step: '00:15',
            basic: 'night'
        }
        ]
    },
    {
        type: 'radio',
        name: '节假日是否开诊',
        basic: 'isHolidayOpen',
        rules: [{
            required: true,
            message: '节假日是否开诊必选',
            trigger: 'change'
        }],
        opts: [{
            value: 1,
            label: '是'
        },
        {
            value: 0,
            label: '否'
        }
        ]
    }
    ]
},
{
    name: '医疗机构',
    basic: 'clinic',
    list: [{
        type: 'upload',
        name: '执业许可证资质文件',
        question: [{
            type: 'item',
            name: '正本',
            fileType: 20,
            limit: 1,
            fileIndex: 'i1'
        },
        {
            type: 'item',
            name: '副本',
            fileType: 21,
            limit: 1,
            fileIndex: 'i2'
        },
        {
            type: 'item',
            name: '副本最新年检页',
            fileType: 22,
            fileIndex: 'i3'
        },
        {
            type: 'item',
            name: '补充信息',
            fileType: 23,
            fileIndex: 'i4'
        }
        ]
    },
    {
        type: 'upload',
        name: '环境照片',
        question: [{
            type: 'item',
            name: '照片',
            fileType: 24,
            fileIndex: 'i5'
        }]
    },
    {
        type: 'upload',
        name: '医院logo',
        question: [{
            type: 'item',
            name: '照片',
            fileType: 28,
            limit: 1,
            fileIndex: 'i6'
        }]
    },
    {
        type: 'input',
        inputType: 'textarea',
        name: '医疗机构简介',
        basic: 'introduction',
        maxlength: '200',
        placeholder: '最多输入200字',
        autosize: {
            minRows: 4,
            maxRows: 8
        }
    }
    ]
}
]
