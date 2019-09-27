import {
    formatSex,
    paramAvatar,
    param,
    param2Obj
} from '@/utils'
import {
    getDepartmentOpts,
    addDepartmentUser,
    deleteDepartmentUser,
    updateDepartmentUserStatus,
    updateDepartmentUser,
    getOrgOpts
} from '@/api/org'

import {
    getRoleList,
    unlockUser
} from '@/api/upms'
const mixin = {
    data() {
        const dictMap = this.$store.getters.dictData
        const orgList = []
        const checkedOrgList = []
        getOrgOpts({
            type: 1
        }).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        orgList.push({
                            value: param({
                                orgId: item.id,
                                orgName: item.name,
                                areaCode: item.areaCode
                            }),
                            label: item.name
                        })
                        checkedOrgList.push({
                            value: param({
                                orgId: item.id,
                                orgName: item.name
                            }),
                            label: item.name
                        })
                    })
                }
            }
        })

        return {
            formData: [{
                type: 'image',
                name: '',
                field: 'avatar',
                spanCount: 24,
                className: 'avatar-line',
                labelWidth: '0'
            },
            {
                type: 'input',
                name: '员工姓名',
                field: 'userRealName',
                disabled: true
            },
            {
                type: 'input',
                name: '性别',
                field: 'sexTxt',
                disabled: true
            },
            {
                type: 'input',
                name: '运营机构',
                field: 'clinicName',
                rules: [{
                    required: true,
                    message: '运营机构必填',
                    trigger: 'blur'
                }],
                func: this.handleOrgChange,
                disabled: true
            },
            {
                type: 'select',
                name: '员工角色',
                field: 'roleList',
                multiple: true,
                opts: [],
                rules: [{
                    required: true,
                    message: '员工角色必选',
                    trigger: 'change'
                }],
                func: this.handleRolelistChange
            },
            {
                type: 'select',
                name: '科室分配',
                field: 'departStr',
                opts: [],
                rules: [{
                    required: true,
                    message: '科室分配必选',
                    trigger: 'change'
                }]
            },
            {
                type: 'select',
                name: '人员类别',
                field: 'userType',
                opts: dictMap[134],
                rules: [{
                    required: true,
                    message: '人员类别必选',
                    trigger: 'change'
                }]
            },
            {
                type: 'select',
                name: '工作形式',
                field: 'workType',
                opts: dictMap[135],
                rules: [{
                    required: true,
                    message: '工作形式必选',
                    trigger: 'change'
                }]
            },
            {
                type: 'select',
                name: '医生类型',
                field: 'doctorType',
                opts: dictMap[136],
                rules: [{
                    required: true,
                    message: '医生类型必选',
                    trigger: 'change'
                }]
            },
            {
                type: 'select',
                name: '医生头衔',
                field: 'doctorTitle',
                rules: [{
                    required: true,
                    message: '医生头衔必选',
                    trigger: 'change'
                }],
                opts: dictMap[488]
            },
            {
                type: 'input',
                name: '诊疗费',
                field: 'regFee',
                unit: '元',
                rules: [{
                    pattern: /^(\d+|\d+(\.\d{1,2})?)$/,
                    message: '请输入正确的诊疗费'
                }],
                style: 'margin-bottom:19px;'
            },
            {
                type: 'select',
                name: '管辖诊所',
                field: 'checkedOrg',
                opts: checkedOrgList,
                multiple: true,
                rules: [{
                    required: true,
                    message: '管辖诊所必选',
                    trigger: 'change'
                }],
                hidden: true,
                style: 'margin-bottom:17px;'
            },
            {
                type: 'select',
                name: '管辖科室',
                field: 'checkedDept',
                opts: [{
                    label: '儿科',
                    value: param({
                        deptCode: 1,
                        deptId: 57,
                        deptName: '儿科'
                    })
                }],
                rules: [{
                    required: true,
                    message: '科室必选',
                    trigger: 'change'
                }],
                hidden: true
            },
            {
                type: 'select',
                name: '诊所病历审阅人员',
                field: 'hasCaseRead',
                opts: [{
                    label: '是',
                    value: 1
                },
                {
                    label: '否',
                    value: 0
                }
                ],
                rules: [{
                    required: true,
                    message: '诊所病历审阅人员必选',
                    trigger: 'change'
                }],
                className: 'setLineHeight'
            },
            {
                type: 'select',
                name: '麻醉、精神药品处方权',
                field: 'hasToxic',
                opts: [{
                    label: '是',
                    value: 1
                },
                {
                    label: '否',
                    value: 0
                }
                ],
                rules: [{
                    required: true,
                    message: '麻醉、精神药品处方权必选',
                    trigger: 'change'
                }],
                className: 'setLineHeight'
            }, {
                type: 'input',
                name: '金舵手医生ID',
                field: 'thirdPartyDoctorId'
            },
            {
                type: 'radio',
                name: '是否排班',
                field: 'isScheduling',
                opts: [{
                    value: 1,
                    label: '是'
                },
                {
                    value: 0,
                    label: '否'
                }
                ],
                rules: [{
                    required: true,
                    message: '是否排班必选',
                    trigger: 'change'
                }]
            }
            ],
            tempOrgId: ''
        }
    },
    methods: {
        // 选择医生
        chooseDoctor(obj) {
            const row = this.orgInfo ? this.orgInfo.org : this.$store.getters.clinic
            const org = param({
                orgId: row.id || row.orgId,
                orgName: row.name || row.orgName,
                areaCode: row.areaCode
            })
            let avatar = ''
            if (obj.attachments && obj.attachments.length > 0) {
                avatar = this.$store.getters.basic.filePrifix + obj.attachments[0].filePath
            }
            this.formEdit = {
                avatar: avatar || paramAvatar(obj.sex, obj.birthday),
                id: 0,
                sex: obj.sex || '',
                sexTxt: formatSex(obj.sex || ''),
                org,
                clinicName: row.name || row.orgName,
                userId: obj.userId,
                userRealName: obj.realName,
                departStr: '',
                userType: '',
                workType: '',
                doctorType: '',
                doctorTitle: '',
                regFee: '',
                roleList: [],
                isScheduling: ''
            }
            this.formData[11].hidden = true
            this.formData[12].hidden = true
            this.handleOrgChange(org)
            this.getRoleList()
            this.employeesTitle = '新增员工'
            this.$refs.edit.open()
        },
        // 根据机构获取科室
        handleOrgChange(val, flag = true) {
            const org = param2Obj(val)
            this.tempOrgId = param2Obj(val).orgId
            this.handleRolelistChange(this.roleList)
            getDepartmentOpts({
                orgId: org.orgId
            }).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            result.push({
                                value: param({
                                    departId: item.id,
                                    departCode: item.code,
                                    departName: item.name
                                }),
                                label: item.name
                            })
                        })
                    }
                    if (flag) {
                        this.$refs.edit.initFields({
                            departStr: ''
                        })
                    }
                    this.formData[5].opts = result
                }
            })
        },

        handleRolelistChange(val) {
            // 运营机构为运营中心且员工角色有中心药剂师
            this.roleList = val
            if (
                val && val.indexOf(14) > -1 &&
                this.$store.getters.clinic.isAdministrator &&
                this.$store.getters.clinic.isClinicCenter &&
                this.$store.getters.clinic.orgId == this.tempOrgId
            ) {
                this.formData[11].hidden = false
                this.formData[12].hidden = false
            } else {
                this.formData[11].hidden = true
                this.formData[12].hidden = true
            }
        },

        // 保存
        handleConfirm(form) {
            const depart = param2Obj(form.departStr)
            const org = param2Obj(form.org)
            const orgIdList = []
            const checkedDept = form.checkedDept ? param2Obj(form.checkedDept) : {}
            if (form.checkedOrg && form.checkedOrg.length > 0) {
                form.checkedOrg.forEach(item => {
                    const checkedOrg = param2Obj(item)
                    orgIdList.push({
                        checkedDepartCode: checkedDept.deptCode,
                        checkedDepartId: checkedDept.deptId,
                        checkedDepartName: checkedDept.deptName,
                        checkedOrgId: checkedOrg.orgId,
                        checkedOrgName: checkedOrg.orgName,
                        checkedUserId: form.userId,
                        checkedUserName: form.userRealName
                    })
                })
            }
            const obj = {
                id: form.id,
                sex: form.sex,
                userId: form.userId,
                userRealName: form.userRealName,
                userType: form.userType,
                workType: form.workType,
                doctorType: form.doctorType,
                doctorTitle: form.doctorTitle,
                regFee: form.regFee,
                roleList: form.roleList,
                isScheduling: form.isScheduling,
                orgIdList,
                hasCaseRead: form.hasCaseRead,
                hasToxic: form.hasToxic,
                thirdPartyDoctorId: form.thirdPartyDoctorId
            }
            const params = Object.assign(depart, obj, org)
            if (params.id) {
                updateDepartmentUser(params)
                    .then(res => {
                        this.successCallback(res, '编辑成功')
                    })
                    .catch(() => {
                        this.$refs.edit.loading = false
                    })
            } else {
                addDepartmentUser(params)
                    .then(res => {
                        this.successCallback(res, '新增成功')
                    })
                    .catch(() => {
                        this.$refs.edit.loading = false
                    })
            }
        },

        // 保存成功
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.handleSearch()
                this.$message.success(msg)
                this.$refs.edit.close()
                this.$refs.quick.close()
            }
        },

        // 编辑
        handleEdit(row) {
            const org = param({
                orgId: row.orgId,
                orgName: row.orgName,
                areaCode: row.areaCode
            })
            const roleList = []
            if (row.roleList && row.roleList.length > 0) {
                row.roleList.forEach(role => {
                    roleList.push(role.id)
                })
            }
            this.orgId = row.orgId
            this.handleRolelistChange(roleList)
            this.handleOrgChange(org, false)
            this.getRoleList()
            let checkedDept = ''
            const checkedOrg = []
            if (row.orgIdList && row.orgIdList.length > 0) {
                row.orgIdList.forEach(item => {
                    checkedOrg.push(
                        param({
                            orgId: item.checkedOrgId,
                            orgName: item.checkedOrgName
                        })
                    )
                })
                checkedDept = param({
                    deptCode: row.orgIdList[0].checkedDepartCode,
                    deptId: row.orgIdList[0].checkedDepartId,
                    deptName: row.orgIdList[0].checkedDepartName
                })
            }
            this.formEdit = {
                avatar: row.headImg
                    ? this.$store.getters.basic.filePrifix + row.headImg : paramAvatar(row.sex, row.birthday),
                id: row.id,
                sex: row.sex || '',
                sexTxt: formatSex(row.sex || ''),
                userId: row.userId,
                userRealName: row.userRealName,
                departStr: row.departId
                    ? param({
                        departId: row.departId,
                        departCode: row.departCode,
                        departName: row.departName
                    }) : '',
                org,
                clinicName: row.orgName,
                userType: row.userType,
                workType: row.workType,
                doctorType: row.doctorType,
                doctorTitle: row.doctorTitle,
                regFee: row.regFee,
                roleList,
                isScheduling: row.isScheduling,
                checkedDept,
                checkedOrg,
                hasToxic: row.hasToxic,
                hasCaseRead: row.hasCaseRead,
                thirdPartyDoctorId: row.thirdPartyDoctorId
            }

            this.employeesTitle = '编辑员工'

            this.$refs.edit.open()
        },

        // 删除用户
        handleDelete(row) {
            this.$confirm(`是否确认将【${row.userRealName}】删除？`, '提示', {
                type: 'error'
            })
                .then(() => {
                    deleteDepartmentUser([row.id]).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('删除成功')
                        }
                    })
                })
                .catch(() => {})
        },

        // 修改状态
        handleStatus(row) {
            this.$confirm(
                `是否确认将【${row.userRealName}】修改为【${row.isUse === 1 ? '停用' : '启用'}】状态？`,
                '修改状态提示', {
                    type: 'warning'
                }
            )
                .then(() => {
                    updateDepartmentUserStatus(row.id).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('修改成功')
                        }
                    })
                })
                .catch(() => {})
        },
        // 获取角色分类
        getRoleList() {
            const roleList = []
            const level = this.level || this.$store.getters.level
            getRoleList({
                level,
                levelType: 0
            }).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            roleList.push({
                                value: item.id,
                                label: item.name
                            })
                        })
                    }
                }
                this.$nextTick(() => {
                    this.formData[4].opts = roleList
                })
            })
        },

        // 解锁用户
        handleUnlock(row) {
            this.$confirm(`是否确认将【${row.userRealName}】解锁？`, '解锁提示', {
                type: 'warning'
            })
                .then(() => {
                    unlockUser(row.mobile).then(res => {
                        if (res.STATUS === '1') {
                            this.$message.success('解锁成功')
                        }
                    })
                })
                .catch(() => {})
        }
    }
}

export default mixin
