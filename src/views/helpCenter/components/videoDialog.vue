<script>
export default {
    components: {},
    props: {
        videoAddress: {
            type: Object
        }
    },
    data: () => ({
        visible: false
    }),
    methods: {
        handleClose(done) {
            this.$confirm('确认关闭？')
                .then(_ => {
                    this.$refs.myVideo.pause()
                    done()
                })
                .catch(_ => {})
        },
        open() {
            this.visible = true
        }
    }
}
</script>

<template>
  <div>
    <el-dialog :title="videoAddress.name" :visible.sync="visible" width="50%" :before-close="handleClose">
      <video :src="videoAddress.url" controls style="width:100%;height:500px" ref="myVideo">
        您的浏览器不支持 video 标签。
      </video>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>
