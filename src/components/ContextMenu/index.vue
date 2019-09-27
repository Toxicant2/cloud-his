<template>
    <div :class="'vue-contextmenuName-' + contextMenuData.menuName" class="vue-contextmenu-listWrapper">
        <a v-for="(item, index) in contextMenuData.menulists" :key="index" class="context-menu-list" @click.stop="fnHandler(item)">
            <i :class="item.icoName" />
            <span>{{ item.btnName }}</span>
        </a>
    </div>
</template>
<script>
export default {
    name: 'VueContextMenu',
    props: {
        contextMenuData: {
            type: Object,
            requred: false,
            default() {
                return {
                    menuName: null,
                    axios: {
                        x: null,
                        y: null
                    },
                    menulists: []
                }
            }
        },
        transferIndex: {
            type: Number,
            default: 0
        },
        menuData: {
            type: Object
        }
    },
    watch: {
        'contextMenuData.axios'(val) {
            var x = val.x
            var y = val.y
            var _this = this
            var index = _this.transferIndex
            var menuName = 'vue-contextmenuName-' + _this.contextMenuData.menuName
            var menu = document.getElementsByClassName(menuName)[index]
            menu.style.display = 'block'
            menu.style.left = x + 'px'
            menu.style.top = y + 'px'
            document.addEventListener('mouseup', function () {
                menu.style.display = 'none'
            }, false)
        }
    },
    methods: {
        fnHandler(item) {
            this.$emit(item.fnHandler, this.menuData)
        }
    }
}
</script>
<style lang="scss" scoped>
.vue-contextmenu-listWrapper {
    padding: 10px 0;
    margin: 5px 0;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: fixed;
    display: none;
    z-index: 9999;
    top: 0;
    left: 0;
    background-color: #fff;
    border-radius: 4px;
    .context-menu-list {
        padding-right: 20px;
        line-height: 36px;
        font-size: 14px;
        color: #606266;
        display: block;
        min-width: 100px;
        &:hover {
            background-color: #ecf5ff;
            color: #66b1ff;
        }
        i {
            padding: 0 15px;
        }
    }
}
</style>
