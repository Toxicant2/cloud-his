<template>
  <el-row class="page-container helpCenter">
    <el-row class="page-main">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane :label="tab.label" :name="tab.value" v-for="(tab,index) in tabPane" :key="index">
          <template v-if="tab.value === 'tab1'">
            <answer-question :isAdmin="isAdmin" ref="answerQuestion"></answer-question>
          </template>
          <template v-else-if="tab.value === 'tab2'">
            <video-teaching :isAdmin="isAdmin" ref="videoTeaching"></video-teaching>
          </template>
          <template v-else-if="tab.value === 'tab3'">
            <guide :isAdmin="isAdmin" ref="guide"></guide>
          </template>
        </el-tab-pane>

      </el-tabs>
    </el-row>
  </el-row>
</template>

<script>
import answerQuestion from './components/answerQuestion'
import videoTeaching from './components/videoTeaching'
import guide from './components/guide'
export default {
    components: {
        answerQuestion,
        videoTeaching,
        guide
    },
    data() {
        return {
            activeName: 'tab1',
            tabPane: [
                {
                    label: '使用答疑',
                    value: 'tab1'
                },
                {
                    label: '视频教学',
                    value: 'tab2'
                },
                {
                    label: '使用手册',
                    value: 'tab3'
                }
            ],
            tabPosition: 'left',
            paneActive: 'tab1Pane1',
            isAdmin: this.$store.getters.clinic.isAdministrator && (this.$store.getters.clinic.orgId === 1 || this.$store.getters.clinic.orgId === 2)
        }
    },
    methods: {
    // 切换
        handleClick() {
            const name = this.activeName
            if (name === 'tab1') {
                this.$refs.answerQuestion[0].handleSearch()
            } else if (name === 'tab2') {
                this.$refs.videoTeaching[0].handleFormSearch()
            } else if (name === 'tab3') {
                this.$refs.guide[0].handleFormSearch()
            }
        }
    }
}
</script>



<style lang="scss">
.helpCenter {
  .el-tabs__content {
    border: 1px solid #eee;
    min-height: 600px;
  }
  .el-tabs--left .el-tabs__active-bar.is-left {
    width: 0px;
  }
  .el-tabs--left .el-tabs__nav-wrap.is-left::after {
    width: 1px;
  }
  .el-tabs--left .el-tabs__item.is-left {
    text-align: left;
    padding-left: 10px;
    padding-right: 10px;
    height:auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
   .el-tabs--left .el-tabs__item.is-left.is-active{
     white-space: normal;
     line-height:20px;
     padding:5px 10px;
   }
}
.isAdmin{
  .el-tabs--left .el-tabs__item.is-left {
    text-align: left;
    padding-left: 10px!important;
    padding-right: 10px;
    height:auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
