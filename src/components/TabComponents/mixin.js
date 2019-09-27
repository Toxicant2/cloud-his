const mixin = {
    data() {
        return {
            total: 0,
            pageIndex: 1,
            pageSize: 12,
            pageSizes: [12, 24, 36, 48, 1000]
        }
    },
    methods: {
        // 跳转页码
        handleCurrentChange(val) {
            this.pageIndex = val
            this.handleSearch()
        },

        // 切换页面显示条数
        handleSizeChange(val) {
            this.pageSize = val
            this.handleSearch()
        }
    }
}
export default mixin
