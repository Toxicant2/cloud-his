<template>
    <el-breadcrumb class="app-breadcrumb" separator="/">
        <transition-group name="breadcrumb">
            <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path" v-if='item.meta.title'>
                <span v-if='item.redirect==="noredirect"||index==levelList.length-1' class="no-redirect">{{item.meta.title}}</span>
                <span v-else @click="redirectUrl(item.redirect,item.path)" class="redirect-link">{{item.meta.title}}</span>
            </el-breadcrumb-item>
        </transition-group>
    </el-breadcrumb>
</template>

<script>
export default {
    created() {
        this.getBreadcrumb()
    },
    data() {
        return {
            levelList: null
        }
    },
    watch: {
        $route() {
            this.getBreadcrumb()
        }
    },
    methods: {
        getBreadcrumb() {
            const matched = this.$route.matched.filter(item => item.name)
            this.levelList = matched
        },
        redirectUrl(redirect, path) {
            this.$router.push(redirect || path)
        }
    }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 10px;
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
  .redirect-link {
    &:hover {
      color: #409eff;
      cursor: pointer;
    }
  }
}
</style>
