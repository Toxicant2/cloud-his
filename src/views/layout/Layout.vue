<template>
    <div class="app-wrapper" :class="classObj">
        <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
        <sidebar class="sidebar-container" />
        <div class="main-container">
            <audio ref="audio" autoplay="autoplay" preload="auto" />
            <navbar ref="navbar" />
            <tags-view />
            <app-main />
        </div>
    </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import Stomp from 'stompjs'
import mp3 from '@/assets/media/tmp.mp3'
import SockJS from 'sockjs-client'
export default {
    name: 'Layout',
    components: {
        Navbar,
        Sidebar,
        AppMain,
        TagsView
    },
    mixins: [ResizeMixin],
    computed: {
        sidebar() {
            return this.$store.state.app.sidebar
        },
        device() {
            return this.$store.state.app.device
        },
        classObj() {
            return {
                hideSidebar: !this.sidebar.opened,
                openSidebar: this.sidebar.opened,
                withoutAnimation: this.sidebar.withoutAnimation,
                mobile: this.device === 'mobile'
            }
        }
    },
    destroyed() {
        this.disconnect()
    },

    mounted() {
        // auditRecipe
        let result = ''
        this.$store.getters.addRouters.some(item => {
            if (item.path === '/auditRecipe') {
                result = item.path
            }
        })
        if (this.commonUtil.getExplorer() === 'ie') {
            return false
        }
        if (result) {
            this.initWebSocket()
        }
    },
    methods: {
        handleClickOutside() {
            this.$store.dispatch('closeSideBar', { withoutAnimation: false })
        },
        initWebSocket() {
            this.connection()
            const self = this
            // 断开重连机制,尝试发送消息,捕获异常发生时重连
            this.timer = setInterval(() => {
                try {
                    self.stompClient.send('test')
                } catch (err) {
                    this.disconnect()
                    self.connection()
                }
            }, 50000)
        },
        connection() {
            const token = this.$store.state.user.token
            const headers = {
                'Authorization': 'Bearer ' + token
            }
            // 建立连接对象
            // 连接服务端提供的通信接口，连接以后才可以订阅广播消息和个人消息
            // this.socket = new SockJS('/api/upms/ws')

            // if ('WebSocket' in window) {
            //     this.socket = new WebSocket('ws://39.98.82.88:8085')
            // } else {
            //     this.socket = new SockJS('/his-api/upms/ws')
            // }
            this.socket = new SockJS('/his-api/upms/ws')
            // 获取STOMP子协议的客户端对象
            this.stompClient = Stomp.over(this.socket)
            this.stompClient.heartbeat.outgoing = 100000
            this.stompClient.heartbeat.incoming = 0

            // 向服务器发起websocket连接
            this.stompClient.connect(headers, () => {
                // 订阅服务端提供的某个topic;
                // 运营中心id  -- 从登陆用户信息里面去，需要判断是否运营中心
                // const clinicCenterId = this.$store.getters.clinic.isClinicCenter ? this.$store.getters.user.id : this.$store.getters.user.parentId
                if (this.$store.getters.clinic.isClinicCenter) {
                    const topic = 'recipe-check-' + this.$store.getters.user.id
                    this.stompClient.subscribe('/task/' + topic + '/remind', (msg) => {
                        this.$refs.audio.src = mp3
                    })
                }

                this.stompClient.subscribe('/task/' + 4 + '/release', (msg) => {
                    if (JSON.parse(msg.body).date) {
                        this.$refs.navbar.getSysInfosList()
                    }
                })
            }, (err) => {
                console.log('err: + ' + err)
            })
        },
        disconnect() {
            if (this.stompClient != null) {
                this.stompClient.disconnect()
            }
        }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar {
        position: fixed;
        top: 0;
    }
}
.drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
}
</style>
