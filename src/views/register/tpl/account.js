export const account = [{
    name: '',
    list: [{
        type: 'input',
        name: '用户名',
        basic: 'username',
        placeholder: '2至10位字母/数字/下划线',
        maxlength: 10,
        rules: [{
            required: true,
            message: '用户名必填',
            trigger: 'blur'
        },
        {
            min: 2,
            max: 10,
            pattern: /^[a-zA-Z0-9_]{2,10}$/,
            message: '长度在2-10之间， 只能包含字母、数字和下划线',
            trigger: 'blur'
        }
        ]
    }, {
        type: 'input',
        name: '手机号码',
        basic: 'phone',
        placeholder: '请输入手机号',
        maxlength: 11,
        rules: [{
            required: true,
            message: '手机号码必填',
            trigger: 'blur'
        },
        {
            pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
        }
        ]
    }, {
        type: 'input',
        inputType: 'password',
        name: '密码',
        basic: 'password',
        placeholder: '8至20位包含大小写、数字及特殊符号'
        // rules: [
        //     { required: true, message: '密码必填', trigger: 'blur' },
        //     { min: 6, max: 18, pattern: /^[a-zA-Z0-9_]{6,18}$/, message: '长度在6-18之间， 只能包含字母、数字和下划线', trigger: 'blur' }
        // ]
    }, {
        type: 'input',
        inputType: 'password',
        name: '确认密码',
        basic: 'passwordConfirm',
        placeholder: '请重复密码'
        // rules: [
        //     { required: true, message: '确认密码必填', trigger: 'blur' },
        //     { min: 6, max: 18, pattern: /^[a-zA-Z0-9_]{6,18}$/, message: '长度在6-18之间， 只能包含字母、数字和下划线', trigger: 'blur' }
        // ]
    }, {
        type: 'userCode',
        name: '验证码',
        basic: 'userTxt',
        placeholder: '请输入验证码',
        maxlength: 4,
        rules: [{
            required: true,
            message: '验证码必填',
            trigger: 'blur'
        }]
    }, {
        type: 'radio',
        name: '',
        basic: 'isRead',
        labelWidth: '40px',
        opts: [{
            value: 1,
            label: '同意《服务条款》和《用户须知》、《隐私相关政策》协议'
        }]
    }]
}]
