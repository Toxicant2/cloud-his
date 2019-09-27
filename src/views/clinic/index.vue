<template>
  <el-row class="clinic">
    <el-row>
      <el-col class="head-content">
        <h2 class="title">
          选择诊所
        </h2>
        <span>*点击诊所标志以选择诊所</span>
      </el-col>
    </el-row>
    <el-row class="main-content">
      <el-row class="switch-wrap">
        <el-col class="item" v-for="(item,index) in clinicList" :span="4" :key="index" @click.native="handleSwitch(item.id)">
          <div class="item-content">
            <img :src="item.imgURL" alt="">
            <span>{{item.name}}</span>
            <span class="selected" v-show="currentSelectId == item.id">当前所选</span>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </el-row>
</template>

<script>
import { getUserClinic } from '@/api/org'
import { setUserClinic } from '@/api/upms'
import panelSwitch from '@/components/SmallComponents/panelSwitchClinic'
import personImageUrl from '@/assets/icon_images/person.png'
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            currentSelectId: ''
        }
    },
    components: {
        panelSwitch
    },
    computed: {
        ...mapGetters(['clinic', 'clinicList'])
    },
    methods: {
        // 获取用户所有诊所
        getUserClinic() {
            getUserClinic().then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const result = []
                    if (d && d.length > 0) {
                        d.forEach(item => {
                            result.push({
                                id: item.id,
                                name: item.name,
                                imgURL: personImageUrl
                            })
                        })
                    }
                    this.$store.dispatch('GetUserClinic', result)
                }
            })
        },

        // 切换诊所登录
        handleSwitch(id) {
            setUserClinic(id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d) {
                        this.$store.dispatch('directorLogin', d).then(res => {
                            this.$store.dispatch('delAllViews', d).then(() => {
                                this.currentSelectId = id
                                this.$router.push({
                                    path: res.path ? res.path : res.redirect
                                })
                            })
                        })
                    }
                } else if (res.STATUS === '8') {
                    this.$router.push({
                        path: '/audit/modify'
                    })
                }
            })
        }
    },
    mounted() {
        this.currentSelectId = this.clinic.orgId
        this.getUserClinic()
    }
}
</script>

<style  scoped>
.clinic {
  margin: 5% 20%;
}
.head-content {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e4e4;
}
h2.title {
  margin-bottom: 10px;
}
.head-content span {
  color: red;
}
.main-content {
  padding: 20px 10px;
}
.item-content {
  width: 100px;
  height: 100px;
  text-align: center;
}

.item-content img {
  float: left;
  height: 100px;
  width: 100px;
}
.item {
  margin-top: 20px;
  min-height: 180px;
}
.item-content span {
  text-align: center;
  width: 100%;
  font-size: 16px;
  margin-top: 5px;
  float: left;
}
.item-content .selected {
  font-size: 14px;
  margin: 5px 5px;
  width: 90px;
  height: 20px;
  color: #fff;
  line-height: 20px;
  border-radius: 10px;
  background-color: #0092ff;
}
.switch-wrap {
  padding: 0 20px;
}
</style>
