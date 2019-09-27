<template>
    <div class="tags-view-container">
        <scroll-pane ref="scrollPane" class="tags-view-wrapper">
            <template v-for="tag in Array.from(visitedViews)">
                <router-link ref="tag" :key="tag.path" class="tags-view-item" :class="isActive(tag)?'active':''" :to="tagFunc(tag)" @contextmenu.prevent.native="openMenu(tag,$event)">
                    {{ tag.params.type === 'chargeDetail'?'已收费':tag.title }}
                    <span class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
                </router-link>
            </template>
        </scroll-pane>
        <ul v-show="visible" class="contextmenu" :style="{left:left+'px',top:top+'px'}">
            <li @click="closeSelectedTag(selectedTag)">关闭</li>
            <li @click="closeOthersTags">关闭其他</li>
            <li @click="closeAllTags">关闭所有</li>
        </ul>
    </div>
</template>

<script>
import ScrollPane from '@/components/ScrollPane'
export default {
    components: { ScrollPane },
    data() {
        return {
            visible: false,
            top: 0,
            left: 0,
            selectedTag: {}
        }
    },
    computed: {
        visitedViews() {
            // const views = this.$store.state.tagsView.visitedViews
            // views.map(item => {
            //     item.query = Object.assign(item.query, { tabClick: true })
            // })
            return this.$store.state.tagsView.visitedViews
        },
        addRouters() {
            return this.$store.getters.addRouters
        }
    },
    watch: {
        $route() {
            this.addViewTags()
            this.moveToCurrentTag()
        },
        visible(value) {
            if (value) {
                document.body.addEventListener('click', this.closeMenu)
            } else {
                document.body.removeEventListener('click', this.closeMenu)
            }
        }
    },
    mounted() {
        this.addViewTags()
    },
    methods: {
        tagFunc(tag) {
            return {
                path: tag.path,
                query: {
                    tabClick: true
                }
            }
        },
        generateRoute() {
            if (this.$route.name) {
                return this.$route
            }
            return false
        },
        isActive(route) {
            return route.path === this.$route.path
            // if (this.$route.path === route.fullPath || this.$route.matched[0].redirect === route.fullPath) {
            //     return true
            // } else {
            //     return false
            // }
        },
        addViewTags() {
            const route = this.generateRoute()
            if (!route) {
                return false
            }
            this.$store.dispatch('addVisitedViews', route)
        },
        moveToCurrentTag() {
            const tags = this.$refs.tag
            this.$nextTick(() => {
                for (const tag of tags) {
                    if (tag.to.path === this.$route.path) {
                        this.$refs.scrollPane.moveToTarget(tag.$el)
                        break
                    }
                }
            })
        },
        closeSelectedTag(view) {
            this.$store.dispatch('delVisitedViews', view).then((views) => {
                if (this.isActive(view)) {
                    const latestView = views.slice(-1)[0]
                    if (latestView) {
                        this.$router.push(latestView)
                    } else {
                        const routers = this.$store.getters.addRouters
                        this.$router.push({
                            path: routers[0].path ? routers[0].path : routers[0].redirect
                        })
                    }
                }
            })
        },
        closeOthersTags() {
            this.$router.push(this.selectedTag)
            this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
                this.moveToCurrentTag()
            })
        },
        closeAllTags() {
            this.$store.dispatch('delAllViews')
            this.$router.push('/homePage')
        },
        openMenu(tag, e) {
            this.visible = true
            this.selectedTag = tag
            // const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
            // this.left = e.clientX - offsetLeft + 15 // 15: margin right
            this.left = e.clientX
            this.top = e.clientY
        },
        closeMenu() {
            this.visible = false
        }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tags-view-container {
  .tags-view-wrapper {
    background: #fff;
    height: 34px;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
    .tags-view-item {
      display: inline-block;
      position: relative;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 100;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style rel="stylesheet/scss" lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(0.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
