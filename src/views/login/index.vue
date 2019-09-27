<template>
    <div class="login">
        <div class="login-banner">
            <div class="main-content">
                <div class="left-content">
                    <img src="~@/assets/login_images/logo.png" alt>
                    <div class="first-title">儿科联盟</div>
                    <div class="second-title">儿科壹联盟-儿童健康维护组织</div>
                </div>
                <div class="right-content">
                    <el-form ref="loginForm" :model="loginForm" :rules="rules" label-width="0px" class="login-container" size="mini">
                        <el-form-item prop="username">
                            <img src="~@/assets/login_images/user.png" alt style="float:left;">
                            <el-input v-model="loginForm.username" type="text" maxlength="11" auto-complete="off" placeholder="用户名" />
                        </el-form-item>
                        <el-form-item prop="password">
                            <img src="~@/assets/login_images/pwd.png" alt>
                            <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码" @keyup.enter.native="handleLogin" />
                        </el-form-item>
                        <el-row class="line">
                            <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
                            <span class="register">
                                <router-link :to="'register'" style="margin-right:10px;">立即注册</router-link>
                                <router-link :to="'register'">忘记密码</router-link>
                            </span>
                        </el-row>
                        <el-form-item style="margin-top:0;width:100%;text-align:right;">
                            <el-button :loading="loading" class="login-btn" @click.native.prevent="handleLogin">登录</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <!-- <div class="bottom-content">
                <div>Copyright &#169 2000-2018 DXY All Rights Reserved 浙B2-20070219(含BBS) （浙）-经营性-2017-0006 </div>
                <div style="text-align:center;">浙公网安备 33010802004314 号</div>
      </div>-->
        </div>
    </div>
</template>

<script>
import { getUserClinic } from '@/api/org'
// import { freshParams } from '@/api/catalog'
import personImageUrl from '@/assets/icon_images/person.png'
import { getServerDate } from '@/api/upms'
import { formatDate } from '@/utils' // passwdVailid
export default {
    name: 'Login',
    data() {
        const user = window.sessionStorage.getItem('user')
        // const validatePassword = (rule, value, callback) => {
        //     passwdVailid(value, callback).then(() => {
        //         callback()
        //     }).catch(res => {
        //         callback(new Error(res))
        //     })
        // }
        return {
            loading: false,
            loginForm: {
                username: user ? JSON.parse(user).mobile : '',
                password: ''
            },
            rules: {
                username: [
                    {
                        required: true,
                        message: '请输入账号！',
                        trigger: 'blur'
                    },
                    {
                        pattern: /^(13[0-9]|14[5-9]|15[012356789]|16[67]|17[0-8]|18[0-9]|19[189])[0-9]{8}$/,
                        message: '请输入正确的手机号',
                        trigger: 'blur'
                    }
                ],
                // password: [{ required: true, trigger: 'blur', validator: validatePassword }]
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                    // {
                    //     min: 6,
                    //     max: 18,
                    //     pattern: /^[a-zA-Z0-9_]{6,18}$/,
                    //     message: '长度在6-18之间， 只能包含字母、数字和下划线',
                    //     trigger: 'blur'
                    // }
                ]
            },
            checked: true
        }
    },
    methods: {
    // 登录
        handleLogin() {
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                    getServerDate().then(res => {
                        if (res.STATUS === '1') {
                            const localDate = new Date().getTime()
                            const serverDate = new Date(res.ITEMS).getTime()
                            if (Math.abs(localDate - serverDate) > 10 * 60 * 1000) {
                                this.$message.warning(
                                    `您的电脑时间【${formatDate(null, false)}】与服务器时间【${
                                        res.ITEMS
                                    }】不匹配，请校准后登陆！`
                                )
                            } else {
                                this.loading = true
                                this.$store
                                    .dispatch('LoginByUsername', this.loginForm)
                                    .then(() => {
                                        this.getUserClinicData()
                                    })
                                    .catch(() => {
                                        this.loading = false
                                    })
                            }
                        }
                    })
                }
            })
        },

        // 获取用户所有诊所
        getUserClinicData() {
            getUserClinic().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            result.push({
                                id: item.id,
                                name: item.orgName,
                                imgURL: personImageUrl
                            })
                        })
                    }
                    this.$store.dispatch('GetUserClinic', result)
                    this.loading = false
                    this.$router.push({ path: '/' })
                }
            })
        }
    }
}
</script>

<style lang="scss">
.login-container {
  .el-form-item {
    margin-top: 20px;
    margin-bottom: 0;
  }
  .el-input__inner {
    font-size: 14px;
    height: 54px;
    line-height: 54px;
    color: #72787a;
    background: none;
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #666666;
    padding-left: 0;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  background: url(~@/assets/login_images/bgImg.png) no-repeat center center;
  background-size: cover;
  overflow: hidden;
  position: relative;
  .login-banner {
    background-color: rgba(61, 62, 73, 0.5);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .main-content {
      overflow: hidden;
      height: 100%;
    }
    .bg {
      padding: 4% 0 0 3%;
    }
    .login-container {
      .line {
        margin: 30px 0px;
        margin-bottom: 20px;
        .register {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7) !important;
          float: right;
          a {
            &:hover {
              color: #ffffff;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
.left-content,
.right-content {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  color: #fff;
  transition: all 0.2s linear;
}
.left-content {
  left: 10%;
}
.right-content {
  right: 10%;
}
.first-title {
  margin-top: 10px;
  font-size: 48px;
  letter-spacing: 2px;
  font-family: PingFangSC-Medium;
  font-weight: 500;
  color: rgba(255, 255, 255, 1);
}
.second-title {
  margin-top: 10px;
  height: 42px;
  font-size: 30px;
  letter-spacing: 2px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  width: 450px;
  color: rgba(255, 255, 255, 1);
  line-height: 42px;
}
// .bottom-content {
//   position: absolute;
//   bottom: 4%;
//   width: 100%;
//   height: 40px;
//   text-align: center;
//   letter-spacing: 1px;
//   font-size: 14px;
//   font-family: PingFangSC-Regular;
//   font-weight: 400;
//   color: rgba(255, 255, 255, 0.6) !important;
//   line-height: 23px;
// }
</style>

<style>
.login-container .el-input__inner,
.login-container .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #ffffff;
}
.login-container .el-input__inner {
  border-bottom: 1px solid #ffffff;
  height: 40px;
}
.login-container .el-checkbox {
  color: #ffffff;
}
.login-container .el-form-item__content img {
  position: absolute;
}
.login-container .el-form-item.is-success .el-input__inner {
  border-color: #ffffff !important;
  padding-left: 35px !important;
}
.login-container .login-btn {
  width: 130px;
  height: 45px;
  border: none;
  color: #ffffff;
  background: rgba(0, 169, 113, 1);
  border-radius: 4px;
  font-size: 18px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 1);
  line-height: 25px;
}
.login-container .el-input__inner {
  padding-left: 35px !important;
}
form.el-form.login-container {
  width: 300px;
  padding-top: 35%;
}

@media screen and (max-width: 768px) {
  .first-title {
    display: none;
  }
  .second-title {
    display: none;
  }
  .left-content {
    color: red !important;
    top: 80px !important;
    left: 50px !important;
  }
}
</style>
