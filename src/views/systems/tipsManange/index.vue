<template>
    <el-row class="page-container">
        <el-row class="page-main" v-if="listFlag">
          <el-row>
              <div style="width：50%;float:left;font-weight:800">发布记录</div>
              <div style="width：50%;float:right;" v-if="$store.getters.clinic.level==2 ||$store.getters.clinic.level==1 ">
                 <el-button type="primary" @click="editTip(null)">+新增发布</el-button>
              </div>
          </el-row>

          <el-row class="tips-content">
                <el-col :span="17" class="left-content">
                      <div class="first-content">{{tipsObj.title}}</div>
                      <div class="second-content">
                        <span>{{tipsObj.type == '1'?'系统更新':"公告"}}</span>
                        <span>{{tipsObj.name}}</span>
                        <span>{{ tipsObj.updateTime}}</span>
                      </div>
                      <div class="third-content" v-if="$store.getters.clinic.level==2 || $store.getters.clinic.level==1 ">
                        收件人：
                        <template v-for="(item,index) in tipsObj.selectedList">
                              <template v-if="index<5">
                                    {{item.name}}
                              </template>
                              <template v-if="index == 5">
                                  等{{tipsObj.selectedList.length}}个诊所
                              </template>
                          </template>
                      </div>
                      <div class="four-content">
                        {{tipsObj.details}}
                      </div>
                  <div class="bottom-content">
                    <span>
                      附件
                    </span>
                    <div style="margin-top:10px">
                      <upload ref="upload" :fileList="tipsObj.attachmentDTOList" :justShow="true"></upload>
                    </div>
                  </div>
                </el-col>
                <el-col :span="7">
                  <el-row style="padding-right:10px">
                    <list @getObj="getObj"  ref="tipsList" @editTip="editTip"></list>
                  </el-row>
                </el-col>
          </el-row>
        </el-row>
        <add @back="listFlag = true" ref="addTip" v-show="!listFlag"/>
    </el-row>
</template>

<script>
// import partListing from './partListing'
import list from './components/list'
import upload from './components/upload'
import add from './components/add'
export default {
    components: {
        list,
        add,
        upload
    },
    data() {
        return {
            id: '',
            listFlag: true,
            height: '',
            tipsObj: {},
            tabMapOpts: [
                {
                    label: '门诊患者',
                    key: 'tab1'
                }
            ]
        }
    },
    watch: {
        $route(to, from) {
            if (this.$route.params.id == ':id') {
                this.$router.push({
                    name: 'tipsManange',
                    params: {
                        id: 0,
                        type: ' '
                    }
                })
            } else {
                this.$refs.tipsList.init()
            }
        }
    },
    methods: {
        // 点击切换患者
        getObj(obj) {
            if (obj.recipients) {
                obj.selectedList = this.$refs.addTip.getTreeArr(this.$refs.addTip.selectList, obj.recipients.split(','))
            } else {
                obj.selectedList = []
            }
            this.tipsObj = obj
        },

        //  新增发布\编辑
        editTip(obj) {
            this.listFlag = false
            this.$refs.addTip.initform(obj)
        }
    },
    mounted() {
        const offsetHeight = document.body.offsetHeight
        this.height = offsetHeight - 180
    }
}
</script>
<style lang="scss" scoped>
.page-main{
  padding:30px;
  padding-bottom:0px;
  .tips-content{
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    -webkit-transition: .3s;
    transition: .3s;
    margin-top:10px;
    .bottom-content{
      font-weight: 700;
      border-top:1px solid #ebeef5;
      padding-top:10px;
      min-height: 200px;
    }
  }
  .left-content{
    padding:30px;
    padding-bottom:0px;
    div{
      margin-top:20px;
    }
    div:first-child{
      margin-top:0;
    }
    .first-content{
      font-weight:800;
      font-size:20px
    }
    .second-content{
      color:#666;
      font-size:13px;
      span{
        margin-left:10px;
      }
      span:first-child{
        border-radius:100%;
        margin-left:0;
        border:1px solid black;
        padding:3px 6px;
      }
    }
    .third-content{
      color:#666;
      font-size:13px;
    }
    .four-content{
      max-height: 600px;
      min-height: 300px;
      overflow-y: auto;
      line-height: 24px;
      font: 16px/32px "Microsoft Yahei";
      color: #404040;
      word-wrap: break-word; // 只对英文起作用，以单词作为换行依据。
      text-align:justify;  //css英文语句的两端对齐：
      text-justify:inter-ideograph;
    }
  }
}
</style>

