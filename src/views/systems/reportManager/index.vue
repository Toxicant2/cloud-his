<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <direct-search
                ref="form"
                :label-position="'right'"
                :label-width="'120'"
                :form-style="{'text-align':'right','margin-bottom':'10px'}"
                :forms="searchList"
                @handleSearch="handleFormSearch"
            />
            <el-table-self
                ref="multipleTable"
                :columns="columns"
                :table-data="list"
                :total-count="count"
                :page-sizes="pageSizes"
                :current-page="pageIndex"
                :page-size="pageSize"
                @pageSizeChange="handleSizeChange"
                @currentPageChange="handleCurrentChange"
                @handleSearch="handleFormSearch"
            />

            <!-- 新增/编辑 -->
            <el-dialog
                :title="title"
                :visible.sync="centerDialogVisible"
                width="30%"
                center
                @close="close"
            >
                <el-row>
                    <el-col :span="4" style="line-height:28px;">报表名称：</el-col>
                    <el-col :span="16"><el-input v-model="reportName" size="mini" placeholder="请输入内容"/></el-col>
                </el-row>
                <el-row style="margin-top:20px;">
                    <el-col :span="4" style="line-height:28px;">报表上传：</el-col>
                    <el-col :span="16"><el-button size="mini" type="primary" style="margin-right:20px" @click="uploadFile">文件上传</el-button><span style="color:red;font-size:12px">* 只能上传cpt文件</span></el-col>
                </el-row>
                <el-row style="margin-top:5px;">
                    <el-col :span="4"/>
                    {{ filePath }}
                </el-row>
                <el-row style="margin-top:20px;">
                    <el-col :span="4" style="line-height:28px;">报表参数：</el-col>
                    <el-col :span="16">
                        <el-select v-model="reportParams" multiple placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
/>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row style="margin-top:20px;">
                    <el-col :span="4" style="line-height:28px;">是否分页：</el-col>
                    <el-col :span="16">
                        <el-radio-group v-model="isPage" style="margin-top:7px;">
                            <el-radio :label="1">是</el-radio>
                            <el-radio :label="0">否</el-radio>
                        </el-radio-group>
                    </el-col>
                </el-row>
                <input ref="fileInput" type="file" style="display:none" v-if="isShow" @change="fileChange($event)">
                <span slot="footer" class="dialog-footer">
                    <el-button @click="centerDialogVisible = false">取 消</el-button>
                    <el-button type="primary" :loading="loading" @click="handleAddReport">保存</el-button>
                </span>
            </el-dialog>

            <!-- 预览窗口 -->
            <el-dialog
title="预览"
                       :visible.sync="previewDialogVisible"
                       width="50%"
                       center
                       @close="handleClosePreview"
            >
                <div v-loading="loading">
                    <iframe :src="previewUrl" width="100%" height="500px" frameborder="0" scrolling="auto"/>
                </div>
            </el-dialog>

        </el-row>
    </el-row>
</template>

<script>
import { getDictByIdList } from '@/api/catalog'
import { getReportList, saveReport, getReportDetail, previewReport, switchReport, delReport } from '@/api/statement'

import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
// import axios from 'axios'
export default {
    components: {
        directSearch,
        elTableSelf
    },
    mixins: [paginationMixin],
    computed: {
        ...mapGetters([
            'clinic'
        ])
    },
    data() {
        const dictMap = {
            494: [] // 报表参数
        }
        let str = ''
        for (const key in dictMap) {
            str += `dictId=${key}&`
        }
        str = str.substring(0, str.length - 1)
        getDictByIdList(str).then(res => {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                if (d && d.length > 0) {
                    d.forEach(item => {
                        dictMap[item.dictId].push({
                            value: item.code,
                            label: item.name
                        })
                    })
                }
            }
        })
        return {
            loading: false,
            searchList: [{
                type: 'input',
                label: '',
                prop: 'name',
                placeholder: '请输入名称',
                slot: {
                    slot: 'append',
                    type: 'button',
                    icon: 'el-icon-search'
                }
            },
            {
                type: 'button',
                color: 'primary',
                value: '+ 新增',
                func: this.handleOpenAdd
            }],
            columns: [
                {
                    label: '名称',
                    value: 'reportName',
                    width: 200
                }, {
                    label: '唯一名称',
                    value: 'reportUrl'
                }, {
                    label: '文件路径',
                    value: 'filePath'
                }, {
                    label: '文件大小',
                    value: 'fileSize',
                    width: 100
                }, {
                    label: '状态',
                    formatter(row) {
                        return row.isUse === 1 ? '启用' : '停用'
                    },
                    width: 80
                }, {
                    label: '操作',
                    align: 'center',
                    width: 200,
                    operType: 'button',
                    operations: [
                        {
                            label: '预览',
                            type: 'text',
                            func: this.handlePreview
                        }, {
                            label: '编辑',
                            type: 'text',
                            func: this.handleEdit
                        }, {
                            label: '删除',
                            type: 'text',
                            func: this.handleDel
                        },
                        {
                            formatter(row) {
                                return { label: row.isUse === 1 ? '停用' : '启用', type: 'text' }
                            },

                            func: this.handleSwitch
                        }
                    ]
                }
            ],
            list: [],
            count: 0,
            centerDialogVisible: false,
            previewDialogVisible: false,
            cacheForm: {},
            title: '',
            filePath: '',
            reportName: '',
            files: {},
            reportParams: [],
            options: dictMap[494],
            reportInfo: {},
            isPage: 0,
            previewUrl: '',
            isShow: false
        }
    },
    mounted() {
        this.handleSearch()
    },
    methods: {
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },
        handleSearch(form) {
            this.cacheForm = this.cacheForm || form
            const params = Object.assign(this.cacheForm, form)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            getReportList(params).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.list = d.records
                    this.count = d.total
                }
            })
        },
        // 上传文件
        uploadFile() {
            this.$refs.fileInput.click()
        },
        fileChange(e) {
            this.files = e.target.files
            this.filePath = this.files[0].name
        },
        // 编辑
        handleEdit(row) {
            this.centerDialogVisible = true
            this.isShow = true
            this.title = '编辑'
            this.reportInfo = row
            this.reportParams = []
            getReportDetail(row.id).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    this.reportName = d.report.reportName
                    this.isPage = d.report.isPage
                    this.filePath = d.reportPrefix
                    if (d.params && d.params.length > 0) {
                        d.params.forEach(item => {
                            this.reportParams.push(item.paramCode)
                        })
                    }
                }
            })
        },
        // 预览
        handlePreview(row) {
            this.loading = true
            const baseURL = process.env.VUE_APP_API_ROOT
            const token = `${getToken()}`
            this.previewUrl = `${baseURL}statement/index/${row.id}?access_token=${token}`
            this.previewDialogVisible = true
            setTimeout(() => {
                this.loading = false
            }, 1000)
        },
        // 删除
        handleDel(row) {
            this.$confirm(`是否确定删除?`, '提示', {
                type: 'warning'
            }).then(() => {
                const ids = [row.id]
                delReport(ids).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.handleSearch()
                    }
                })
            }).catch(() => {

            })
        },
        // 启用停用
        handleSwitch(row) {
            this.$confirm(`是否确定将${row.reportName}设为${row.isUse === 1 ? '停用' : '启用'}状态?`, '提示', {
                type: 'warning'
            }).then(() => {
                switchReport(row.id).then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.handleSearch()
                    }
                })
            }).catch(() => {

            })
        },
        // 添加
        handleOpenAdd() {
            this.reportName = ''
            this.isPage = 0
            this.reportParams = []
            this.files = {}
            this.reportInfo = {}
            this.filePath = ''
            this.centerDialogVisible = true
            this.title = '新增'
            this.isShow = true
        },
        close(){
            this.isShow = false
        },
        // 保存
        handleAddReport() {
            this.loading = true
            const id = this.reportInfo && this.reportInfo.id ? this.reportInfo.id : 0
            const params = []
            if (this.reportParams && this.reportParams.length > 0) {
                this.reportParams.forEach(item => {
                    params.push({
                        paramCode: item,
                        reportId: id
                    })
                })
            }

            const data = {
                params,
                report: {
                    reportName: this.reportName,
                    id,
                    isPage: this.isPage
                }
            }
            var formData = new FormData()
            formData.append('file', this.files[0])
            formData.append('dto', JSON.stringify(data))
            let flag = false
            if(this.title === '新增'){
                if (this.files && this.files[0]) {
                    flag = true
                } else {
                    this.$message.error('请添加报表')
                    this.loading = false
                }
            }else{
                flag = true
            }
            if(flag){
                saveReport(formData).then(res => {
                    this.loading = false
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.centerDialogVisible = false
                        this.reportName = ''
                        this.isPage = 0
                        this.reportParams = []
                        this.filePath = ''
                        this.handleSearch()
                    }
                })
            }

        },
        handleClosePreview() {
            this.previewUrl = ''
        }
    }
}
</script>

