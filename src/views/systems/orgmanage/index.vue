<template>
    <div class="page-container orgmanage">
        <el-row class="page-main" :gutter="20">
            <template v-if="orgMain">
                <el-col :span="24" style="margin-bottom: 10px;">
                    <el-col :span="4">
                        <el-input v-model="searchVal" placeholder="请输入平台名" />
                    </el-col>
                </el-col>
                <el-col :span="24">
                    <el-row :gutter="20">
                        <el-col :span="leftSpan"><i class="slideIcon" :class="[leftSpan>1?'el-icon-s-fold' : 'el-icon-s-unfold']" @click="toggleLeft" /></el-col>
                        <el-col :span="centerSpan"><i class="slideIcon" :class="[centerSpan>1?'el-icon-s-fold' : 'el-icon-s-unfold']" @click="toggleCenter" /></el-col>
                    </el-row>
                </el-col>
                <el-col :span="24">
                    <el-row :gutter="20">
                        <el-col :span="leftSpan" style="min-height: 10px;">
                            <el-col v-show="leftSpan>1" :span="24" class="org-list">
                                <el-tree ref="tree" v-loading="treeLoading" :data="platData" node-key="label" default-expand-all highlight-current :filter-node-method="filterNode" :expand-on-click-node="false" @node-click="handleNodeClick" @node-contextmenu="handleRightClick" />
                            </el-col>
                        </el-col>
                        <el-col :span="centerSpan" style="min-height: 10px;">
                            <el-row v-show="centerSpan>1" class="org-list">
                                <el-col v-if="orgInfo.org" :span="24" style="margin-bottom:10px;text-align:right;">
                                    <el-button size="mini" type="primary" style="margin-right: 10px;" :loading="btnLoading" @click="clearCache">清除缓存</el-button>
                                    <el-button v-if=" isCheckOut !== 1" size="mini" type="primary" icon="el-icon-s-check" @click="handleExamine">审核</el-button>
                                    <el-button size="mini" type="primary" icon="el-icon-edit" style="margin-right: 10px;" @click="editOrg">编辑</el-button>
                                </el-col>
                                <el-col v-loading="infoLoading" :span="24" class="org-list-item">
                                    <template v-if="orgInfo.org">
                                        <el-col v-for="(item,idx) in orgInfoList" :key="'org'+idx" style="margin-bottom: 6px;">
                                            <template v-if="item.type==='inlineB'">
                                                <div>{{ item.label }}：</div>
                                                <ul class="imgBox">
                                                    <li v-for="(imgItem,index) in orgInfo[item.value]" v-if="imgItem.businessType === 20 || imgItem.businessType === 21 || imgItem.businessType === 22 || imgItem.businessType === 23" :key="index">
                                                        <img :src="filePrefix+imgItem.filePath" alt="">
                                                    </li>
                                                </ul>
                                            </template>
                                            <template v-else-if="item.type === 'status'">
                                                <span>{{ item.label }}：</span><span>{{ orgSts[orgInfo.org[item.value]] || '待审核' }}</span>
                                            </template>
                                            <template v-else-if="item.type === 'base'">
                                                <span>{{ item.label }}：</span><span>{{ orgInfo.org[item.value] | handleValue }}</span>
                                                <el-button v-if="item.btn" type="text" style="padding:0;margin-left:20px;" @click="item.func(orgInfo.org,item.value)">{{ item.btn }}</el-button>
                                            </template>
                                            <template v-else>
                                                <span>{{ item.label }}：</span><span>{{ orgInfo.orgInfo[item.value] | handleValue }}</span>
                                            </template>

                                        </el-col>
                                    </template>
                                    <template v-else>
                                        <p style="margin-top: 20px;text-align:center;">暂无数据</p>
                                    </template>
                                </el-col>
                            </el-row>
                        </el-col>
                        <el-col :span="rightSpan">
                            <el-row>
                                <el-tabs v-model="activeName" type="card">
                                    <el-tab-pane label="人员" name="people" />
                                    <el-tab-pane label="科室" name="department" />
                                </el-tabs>
                                <el-row>
                                    <v-user v-if="activeName === 'people'" ref="vUser" :org-id="orgId" :org-info="orgInfo" :cur-org-name="curOrgName" :level="level" :is-check-out="isCheckOut" />
                                    <v-depart v-else ref="vDepart" :org-id="orgId" :is-check-out="isCheckOut" />
                                </el-row>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-col>
            </template>
            <template v-else>
                <register-clinic ref="clinic" :org-id="orgId" :parent-id="parentId" :org-name="orgName" :cur-node-data="curNodeData" :org-info="orgInfo" :toggle-sts="toggleSts" :disabled="Formdisabled" @goBack="goBack" @handleSaveClick="saveFormData"
@submitCheck="submitCheck" @handleEditClick="editFormData" />
            </template>
        </el-row>
        <div v-show="showSubMenu" ref="SubMenu" class="addSubMenu" @click="addSubMenu"><i class="el-icon-plus" /> 新增子机构</div>
        <dialog-form ref="edit" :width="'720px'" :title="title" :form-data="formData" :form-edit="formEdit" @handleConfirm="handleConfirm" />
    </div>
</template>

<script>
import {
    getOrgTreeList,
    getOrgInfo,
    addOrg,
    editOrg,
    checkOrg,
    updateThird,
    clearOrgCache
} from '@/api/org'
import directSearch from '@/components/FormComponents/directSearch'
import elTableSelf from '@/components/TabComponents/index'
import dialogForm from '@/components/DialogComponents/Form'
import vUser from './components/user'
import vDepart from './components/depart'
import registerClinic from './components/registerClinic'
import paginationMixin from '@/components/TabComponents/mixin'

import { formatRegion, formatDictMap } from '@/utils'
// import hcs from '@/utils/modules/hcs'

export default {
    components: {
        directSearch,
        elTableSelf,
        dialogForm,
        vUser,
        vDepart,
        registerClinic
    },
    filters: {
        handleValue(val) {
            return val || '-'
        }
    },
    mixins: [paginationMixin],
    data() {
        const dictData = this.$store.getters.dictData
        return {
            filePrefix: this.$store.getters.basic.filePrifix,
            orgMain: true,
            showSubMenu: false,
            searchVal: '',
            listIndex: -1,
            activeName: 'people',
            orgId: 0, // 诊所id
            orgName: '', // 运营机构名
            curOrgName: '', // 当前点击平台名
            orgTitle: '',
            leftSpan: 5,
            centerSpan: 5,
            rightSpan: 14,
            listLoading: false,
            level: '', // 诊所level
            isCheckOut: 0, // 判断审核是否通过
            tabData: [],
            orgInfoList: [
                { label: '审核状况', type: 'status', value: 'checkStatus' },
                { label: '医疗机构名称', type: 'base', value: 'name' },
                { label: '执业许可证名称', value: 'licenseName' },
                { label: '执业许可证登记号', value: 'licenseNum' },
                { label: '组织机构代码', type: 'base', value: 'code' },
                {
                    label: '第三方机构代码',
                    type: 'base',
                    value: 'orgRelId',
                    btn: '编辑',
                    func: this.handleEditThird
                },
                {
                    label: '金舵手诊所id',
                    type: 'base',
                    value: 'thirdPartyClinicId',
                    btn: '编辑',
                    func: this.handleEditThird
                },
                { label: '组织机构类型', type: 'base', value: 'orgLevelName' },
                { label: '医疗机构地址', value: 'region' },
                { label: '详细地址', value: 'address' },
                { label: '医疗机构简介', value: 'introduction' },
                { label: '相关资质文件', type: 'inlineB', value: 'attachmentList' }
            ],
            orgInfo: {},
            platData: [],
            curNodeData: {}, // 存储右击列表信息
            infoLoading: false,
            toggleSts: false, // 切换新增编辑
            Formdisabled: false,
            addSubOrg: false, // 新增子机构时为true,用于判断是否调用getOrgPlatList
            orgSts: ['待审核', '通过', '未通过'],
            treeLoading: false,
            parentId: 0,
            dictData,
            formData1: [
                {
                    type: 'input',
                    name: '第三方机构代码',
                    field: 'value',
                    labelWidth: '130px',
                    rules: [
                        {
                            required: true,
                            message: '第三方机构代码必填',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            formData2: [
                {
                    type: 'input',
                    name: '金舵手诊所ID',
                    field: 'value',
                    labelWidth: '130px',
                    rules: [
                        {
                            required: true,
                            message: '金舵手诊所ID',
                            trigger: 'blur'
                        }
                    ]
                }
            ],
            formEdit: {},
            title: '',
            formData: [],
            btnLoading: false
        }
    },
    watch: {
        searchVal(val) {
            this.$refs.tree.filter(val)
        },
        title(newVal, oldVal) {
            this.formData = newVal === '编辑金舵手诊所ID' ? this.formData2 : this.formData1
        }
    },
    created() {
        this.getOrgPlatList()
        // 点击其他区域关闭新增子机构弹出框
        document.addEventListener('click', e => {
            if (e.target !== this.$refs.tree) {
                this.showSubMenu = false
            }
        })
    },
    methods: {
    // 机构编辑
        editOrg() {
            if (!this.orgId) {
                this.$message.warning('请先选择诊所')
                return
            }
            this.orgMain = false // 显示新增编辑组件
            this.toggleSts = true
        },
        // 新增子机构
        addSubMenu() {
            this.orgMain = false // 显示新增编辑组件
            this.showSubMenu = false // 关闭弹出框
            this.toggleSts = false
            this.addSubOrg = true
        },
        goBack() {
            this.orgMain = true
            this.addSubOrg = false
            this.Formdisabled = false // 返回时去掉审核false
            this.$nextTick(function() {
                // 高亮节点树当前选项
                this.$refs.tree.setCurrentKey(this.orgId)
            })
        },
        handleExamine() {
            this.Formdisabled = true
            this.orgMain = false
            this.toggleSts = true
        },
        // 平台点击
        handleNodeClick(obj, node, el) {
            this.showSubMenu = false
            this.orgId = obj.id
            this.parentId = obj.parentId
            this.curOrgName = obj.label
            this.orgName = obj.orgLevel === 2 ? obj.label : obj.orgName
            this.curNodeData = {
                // 存储当前节点信息
                level: node.level,
                id: obj.id
            }
            this.level = obj.orgLevel + ''
            this.getOrgPlatInfo()
        },
        // 右击
        handleRightClick(event, obj, node, el) {
            // 三级诊所没有子菜单
            if (obj.orgLevel !== 3) {
                event.preventDefault()
                this.$refs.SubMenu.style.left = event.pageX + 10 + 'px'
                this.$refs.SubMenu.style.top = event.pageY + 10 + 'px'
                this.orgName = obj.label
                this.orgId = obj.id
                this.parentId = obj.id
                this.curNodeData = {
                    // 存储当前节点信息
                    level: node.level + 1,
                    id: obj.id
                }
                this.showSubMenu = true
            } else {
                this.showSubMenu = false
            }
        },
        // 获取诊所详情
        getOrgPlatInfo() {
            this.infoLoading = true
            getOrgInfo(this.orgId).then(res => {
                this.infoLoading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const orgInfo = d.orgInfo
                    const org = d.org
                    orgInfo.region = formatRegion([orgInfo.province, orgInfo.city, orgInfo.district])
                    org.orgLevelName = formatDictMap(this.dictData[527], String(org.orgLevel))
                    this.isCheckOut = org.checkStatus
                    this.orgInfo = d
                }
            })
        },
        // 切换平台
        toggleLeft() {
            if (this.centerSpan === 1) {
                if (this.leftSpan > 1) {
                    this.centerSpan = 1
                    this.leftSpan = 1
                    this.rightSpan = 22
                } else {
                    this.centerSpan = 1
                    this.leftSpan = 7
                    this.rightSpan = 16
                }
            } else {
                if (this.leftSpan > 1) {
                    this.centerSpan = 7
                    this.leftSpan = 1
                    this.rightSpan = 16
                } else {
                    this.centerSpan = 5
                    this.leftSpan = 5
                    this.rightSpan = 14
                }
            }
        },
        // 切换机构
        toggleCenter() {
            if (this.leftSpan === 1) {
                if (this.centerSpan > 1) {
                    this.centerSpan = 1
                    this.leftSpan = 1
                    this.rightSpan = 22
                } else {
                    this.centerSpan = 7
                    this.leftSpan = 1
                    this.rightSpan = 16
                }
            } else {
                if (this.centerSpan > 1) {
                    this.centerSpan = 1
                    this.leftSpan = 7
                    this.rightSpan = 16
                } else {
                    this.centerSpan = 5
                    this.leftSpan = 5
                    this.rightSpan = 14
                }
            }
        },
        // 获取三级分类
        getOrgPlatList() {
            const options = []
            this.treeLoading = true
            getOrgTreeList().then(res => {
                this.treeLoading = false
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    if (d && d.length > 0) {
                        this.$nextTick(() => {
                            this.platData = this.getOption(d)
                        })
                    }
                }
            })
        },
        getOption(list, parentId) {
            const options = []
            if (list && list.length > 0) {
                parentId = parentId || list[0].parentId
                list.forEach((item, index) => {
                    if (item.parentId === parentId) {
                        options.push({
                            label: item.name,
                            id: item.id,
                            parentId: item.parentId,
                            orgLevel: item.orgLevel,
                            orgName: item.orgName,
                            children: this.getOption(list, item.id)
                        })
                    }
                })
            }
            return options
        },
        // 新增保存
        saveFormData(form) {
            addOrg(form)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.orgMain = true
                        if (this.addSubOrg) {
                            // 此时是新增子机构
                            this.getOrgPlatList()
                            this.addSubOrg = false
                        } else {
                            // 编辑审核
                            this.getOrgPlatInfo() // 重新获取诊所详情
                        }
                        this.$message.success(res.MESSAGE)
                    }
                })
                .catch(() => {})
        },
        // 编辑保存
        editFormData(form) {
            editOrg(form)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.orgMain = true
                        if (this.addSubOrg) {
                            // 此时是新增子机构
                            this.getOrgPlatList()
                            this.addSubOrg = false
                        } else {
                            // 编辑审核
                            this.getOrgPlatInfo() // 重新获取诊所详情
                        }
                        this.$message.success(res.MESSAGE)
                    }
                })
                .catch(() => {})
        },
        // 提交审核
        submitCheck(data) {
            checkOrg(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('操作成功')
                    this.orgMain = true
                    this.getOrgPlatInfo() // 更新诊所详情
                }
            })
        },
        filterNode(value, data) {
            if (!value) return true
            return data.label.indexOf(value) !== -1
        },

        // 第三方机构代码维护 /金舵手诊所id维护
        handleEditThird(row, value) {
            if (value === 'thirdPartyClinicId') {
                this.title = '编辑金舵手诊所ID'
            } else {
                this.title = '编辑第三方机构代码'
            }
            this.formEdit = {
                value: row[value]
            }
            this.$refs.edit.open()
        },

        handleConfirm(form) {
            const params = {
                field: this.title === '编辑第三方机构代码' ? 'orgRelId' : 'thirdPartyClinicId',
                orgId: this.orgId,
                value: form.value
            }
            updateThird(params)
                .then(res => {
                    if (res.STATUS === '1') {
                        this.$message.success(res.MESSAGE)
                        this.$refs.edit.loading = false
                        this.$refs.edit.close()
                        this.getOrgPlatInfo()
                    }
                })
                .catch(() => {
                    this.$refs.edit.loading = false
                })
        },

        // 清除缓存
        clearCache() {
            this.$confirm(`是否确认${'将' + this.orgInfo.org.name || ''}清除缓存？`, '清除缓存提示', {
                type: 'warning'
            })
                .then(() => {
                    this.btnLoading = true
                    clearOrgCache(this.orgId)
                        .then(res => {
                            if (res.STATUS === '1') {
                                this.btnLoading = false
                                this.$message.success('清除成功')
                            }
                        })
                        .catch(() => {
                            this.btnLoading = false
                        })
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss">
.orgmanage {
  .org-list {
    position: relative;
    height: 650px;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #ebeef5;
    .org-list-item {
      color: #606266;
      font-size: 14px;
      .imgBox {
        font-size: 0;
        > li {
          display: inline-block;
          width: 50%;
          padding: 10px;
          box-sizing: border-box;
          font-size: 14px;
          > img {
            width: 100%;
            height: 80px;
            vertical-align: top;
          }
        }
      }
      .editSpan {
        display: inline-block;
        width: 132px;
      }
    }
    .org-item {
      display: inline-block;
      font-size: 14px;
      color: #333;
      padding: 4px 0;
      cursor: pointer;
      &.acitve {
        color: #0a98ff;
      }
    }
  }
  .slideIcon {
    padding: 0 4px;
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }
  .addSubMenu {
    position: fixed;
    top: 0;
    left: 0;
    background: #fff;
    width: 116px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    padding: 12px;
    color: #409eff;
    line-height: 1.4;
    text-align: justify;
    font-size: 14px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    word-break: break-all;
    z-index: 9999;
    cursor: pointer;
  }
}
</style>
