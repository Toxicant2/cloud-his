<template>
    <el-row class="register">
        <div v-if="isAccount" class="account">
            <h2>账号信息注册</h2>
            <el-form-panel ref="account" :label-width="'120px'" :btn-text="'立即注册'" :rules="accountRules" :forms="account" @handleClick="handleNext" />
        </div>
        <div v-else class="complete">
            <h2>完善账户信息</h2>
            <div class="line">注册账号手机号：{{ registerUser.phone }}
            </div>
            <div class="line mb20">请选择注册的账号类型
                <panel-switch :switch-data="switchData" @handleSwitch="handleSwitch" />
            </div>
            <el-form-panel v-if="isPerson" ref="person" :label-width="'180px'" :forms="person" :first-page="false" type="register" @handleClick="handleSavePerson" />
            <el-form-panel v-else ref="clinic" :label-width="'180px'" :forms="clinic" :first-page="false" type="clinic" @handleClick="handleSaveClinic" />
        </div>
    </el-row>
</template>

<script>
import {
    regStaff,
    // regUserBasic
    checkUserBasic
} from '@/api/upms'
import { addOrg } from '@/api/org'
import elFormPanel from './components/FormPanel'
import panelSwitch from '@/components/SmallComponents/panelSwitch'
import { account } from './tpl/account'
import { person } from './tpl/person'
import { clinic } from './tpl/clinic'
import personImageUrl from '@/assets/icon_images/person.png'
import clinicImageUrl from '@/assets/icon_images/clinic.png'
import { passwdVailid } from '@/utils'
export default {
    components: {
        elFormPanel,
        panelSwitch
    },
    data() {
        const validatePassword = (rule, value, callback) => {
            passwdVailid(value).then(() => {
                if (this.$refs.account.form.passwordConfirm) {
                    this.$refs.account.$refs.form.validateField('passwordConfirm')
                }
                callback()
            }).catch(res => {
                callback(new Error(res))
            })
        }
        const validateCheckPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (this.$refs.account.form.password && value !== this.$refs.account.form.password) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            isAccount: true,
            isPerson: true,
            account,
            person,
            clinic,
            accountRules: {
                password: [{ required: true, trigger: 'blur', validator: validatePassword }],
                passwordConfirm: [{ required: true, trigger: 'blur', validator: validateCheckPassword }]
            },
            registerUser: {},
            switchData: [
                {
                    name: '个人医生',
                    imgURL: personImageUrl,
                    description:
                        '面向具备执业资格的医生、药师、护士、技师等专业人员注册，可开通在线工作室，可申请加入线下联盟诊所，实现多点执业。'
                },
                {
                    name: '诊所注册',
                    imgURL: clinicImageUrl,
                    description:
                        '面向中、小规模的实体诊所注册，不论单店或是多店，不论民营或者公立，平台提供全流程标准化的诊所管理解决方案，可形成连锁管理。'
                }
            ]
        }
    },
    methods: {
        // 立即注册
        handleNext(form) {
            if (!form.isRead) {
                this.$message.error('请仔细阅读相关协议后再注册')
                this.$refs.account.resetLoading()
                return
            }
            if (form.password !== form.passwordConfirm) {
                this.$message.error('两次输入密码不一致')
                this.$refs.account.resetLoading()
                return
            }
            const params = {
                username: form.username,
                phone: form.phone,
                password: form.password,
                passwordConfirm: form.passwordConfirm,
                randomDTO: {
                    randomCode: form.randomDTO.randomCode,
                    userTxt: form.userTxt
                }
            }
            checkUserBasic(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.registerUser = params
                        this.$message.success('账户信息保存成功！')
                        this.$refs.account.resetLoading()
                        this.isAccount = false
                    }
                })
                .catch(() => {
                    this.$refs.account.resetLoading()
                })
        },

        // 提交审核（个人医生）
        handleSavePerson(form) {
            const user = this.registerUser
            form.base = user
            form.staff.mobile = user.phone
            regStaff(form)
                .then(res => {
                    this.successCallback(res, '个人医生注册成功')
                })
                .catch(() => {
                    this.$refs.person.resetLoading()
                })
        },

        // 提交审核（诊所）
        handleSaveClinic(form) {
            const user = this.registerUser
            form.base = user
            form.orgInfo.contacttPhone = user.phone
            addOrg(form)
                .then(res => {
                    this.successCallback(res, '诊所注册成功')
                })
                .catch(() => {
                    this.$refs.clinic.resetLoading()
                })
        },

        // 注册成功回调
        successCallback(res, msg) {
            if (res.STATUS === '1') {
                this.$confirm(msg, '提示', {
                    confirmButtonText: '登录',
                    cancelButtonText: '继续注册账号',
                    type: 'success'
                })
                    .then(() => {
                        this.$router.push('login')
                    })
                    .catch(() => {
                        location.reload()
                    })
            }
        },

        // 切换账号类型
        handleSwitch(index) {
            this.isPerson = index === 0
        }
    }
}
</script>

<style lang="scss" scoped>
.register {
    > div {
        margin: 20px auto;
        overflow: hidden;
        zoom: 1;
        h2 {
            text-align: center;
            margin-bottom: 30px;
        }
    }
    .account {
        width: 575px;
    }
    .complete {
        width: 1124px;
        .line {
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding: 20px;
            &.mb20 {
                margin-bottom: 20px;
            }
        }
    }
}
</style>

