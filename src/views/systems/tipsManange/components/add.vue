<template>
    <el-row class="page-main">
        <span class='title'>新增发布
            <el-button icon="el-icon-arrow-left" style="float:right; margin-top: 7px;" @click.native="back">返回</el-button>
        </span>
        <el-form :model="form" ref="form" label-position="right" label-width="150px" v-if="showFlag">
            <el-row class="form-container img">
                <el-form :model="form" ref="form" label-width="100px" size="small" class="demo-dynamic">
                    <el-form-item prop="recipients" label="接收诊所："  :rules="[{ required: true, message: '接收诊所不能为空'}]">
                        <template v-for="(tag,index) in selectedList">
                            <template v-if="index<5">
                                <el-tag
                                    :key="tag.name"
                                    closable
                                    :type="tag.type"
                                    @close="handleClose(tag)"
                                    >
                                    {{tag.name}}
                            </el-tag>
                                </template>
                            <template v-if="index == 5">
                                等{{selectedList.length}}个诊所
                            </template>
                        </template>
                        <el-button class="add-tag" size="small" type="primary" icon="el-icon-plus"  @click.stop="addOrg">添加</el-button>
                    </el-form-item>

                    <el-form-item prop="title" label="发布标题：" :rules="[{ required: true, message: '标题不能为空'}]">
                        <el-input v-model="form.title"></el-input>
                    </el-form-item>

                    <el-form-item prop="type" label="发布类型：" :rules="[{ required: true}]">
                        <el-select v-model="form.type" placeholder="请选择" style="width:110px;">
                            <el-option  v-if="$store.getters.clinic.level==2" label="公告" :value="0"></el-option>
                            <el-option v-if="$store.getters.clinic.level==1" label="系统更新" :value="1"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item prop="versions" label="版本号：" v-if="form.type == 1" :rules="[{ required: true, message: '版本号不能为空'}]">
                        <el-input v-model="form.versions"></el-input>
                    </el-form-item>

                    <el-form-item prop="name" label="发布人：" :rules="[{ required: true, message: '发布人不能为空'}]">
                        <el-input v-model="form.name" style="width:110px;"></el-input>
                    </el-form-item>

                    <el-form-item prop="details" label="发布内容：">
                        <el-input type="textarea" :rows="5" v-model="form.details"></el-input>
                    </el-form-item>

                    <el-form-item prop="details" label="附件：">
                        <upload ref="upload"></upload>
                    </el-form-item>

                </el-form>
            </el-row>
            <el-row class="submit-btn">
                <el-button type="primary" @click.native = "save('立即发布')">立即发布</el-button>
                <el-button type="info" plain @click.native = "save('存为草稿')">存为草稿</el-button>
                <!-- <el-button type="info" plain @click.native = "save">定时发送</el-button> -->
            </el-row>
        </el-form>
         <el-row class="add-dialog">
                <el-dialog
                    title="添加接收诊所"
                    :visible.sync="isShowAddList"
                    width="20%"
                    center
                    :before-close="handleCloseDiago">
                    <span>{{$store.getters.clinic.orgName}}：</span>
                    <div style="margin-top:10px">
                        <el-tree
                            :data="selectList"
                            show-checkbox
                            ref="tree"
                            node-key="id"
                            :default-expanded-keys="[1,2,3]"
                            :default-checked-keys="selectedIdList"
                            :props="defaultProps">
                        </el-tree>
                    </div>

                    <span slot="footer" class="dialog-footer">
                        <el-button @click="isShowAddList = false">取 消</el-button>
                        <el-button type="primary" @click="selectReceive">确 定</el-button>
                    </span>
                </el-dialog>
            </el-row>
    </el-row>
</template>

<script>
import upload from './upload'
import { getOrgOpts } from '@/api/org'
import { saveSysnotification } from '@/api/upms'
export default {
    props: ['supplierItem'],
    data() {
        return {
            showFlag: true,
            selectList: [],
            selectedList: [],
            selectedIdList: [],
            defaultProps: {
                children: 'sysOrganizationList',
                label: 'name'
            },
            isShowAddList: false,
            title: '',
            form: {
                recipients: '', // 接收人
                title: '', // 发布标题
                versions: '', // 版本号
                type: this.$store.getters.clinic.level == 1? 1 : 0, // 发布类型
                name: '', // 发布人
                details: '', // 发布内容
                attachmentDTOList: [] // 附件
            }
        }
    },
    components: {
        upload
    },
    methods: {
        addOrg() {
            this.isShowAddList = true
            this.$nextTick(() => {
                if (this.$refs.tree) {
                    this.$refs.tree.setCheckedKeys(this.selectedIdList)
                }
            })
        },
        // 递归取值
        getTreeArr(selectedList, temp_arr) {
            const arr = []
            const te = function(selectedList, temp_arr) {
                temp_arr.forEach((element, index) => {
                    selectedList.forEach(item => {
                        if (item.id == element) {
                            arr.push({ id: item.id, name: item.name })
                            temp_arr.splice(index, 1)
                            te(selectedList, temp_arr)
                        } else if (item.sysOrganizationList && item.sysOrganizationList.length > 0) {
                            te(item.sysOrganizationList, temp_arr)
                        }
                    })
                })
            }
            te(selectedList, temp_arr)
            return arr
        },

        // 获取选中的值
        selectReceive(flag = true) {
            this.isShowAddList = false
            let temp_arr = []
            if (flag) {
                temp_arr = this.$refs.tree.getCheckedKeys()
                this.selectedIdList = this.$refs.tree.getCheckedKeys()
            } else {
                this.getSysOrgList()
                this.form.recipients.split(',').forEach(item => {
                    temp_arr.push(+item)
                })
            }
            if (temp_arr.length > 0) {
                this.selectedList = this.getTreeArr(this.selectList, temp_arr)
            } else {
                this.selectedList = []
            }
        },

        back() {
            this.form = {
                recipients: '', // 接收人
                title: '', // 发布标题
                versions: '', // 版本号
                type: this.$store.getters.clinic.level == 1? 1 : 0 , // 发布类型
                name: '', // 发布人
                details: '' // 发布内容
            }
            this.$refs.upload.copyForm3([])
            this.selectedList = []
            this.selectedIdList = []
            this.$emit('back')
        },

        // 查找父节点
        selectParent(id) {
            const temp_arr = this.selectList
            const arr = []
            const select = function(temp_list, id) {
                for (let index = 0; index < temp_list.length; index++) {
                    if (temp_list[index].id == id) {
                        arr.push(id)
                        break
                    } else if (temp_list[index].sysOrganizationList && temp_list[index].sysOrganizationList.length > 0) {
                        arr.push(temp_list[index].id)
                        select(temp_list[index].sysOrganizationList, id)
                    }
                }
            }

            select(temp_arr, id)
            return arr
        },

        // 关闭tag
        handleClose(tag) {
            let temp_arr = []
            if (this.$refs.tree) {
                temp_arr = this.$refs.tree.getCheckedKeys()
            } else {
                this.form.recipients.split(',').forEach(item => {
                    temp_arr.push(+item)
                })
            }

            // 清除选中的tag
            this.selectedList.splice(this.selectedList.indexOf(tag), 1)

            // 查找当前选中的节点是否有父节点
            const temp_arrId = this.selectParent(tag.id)
            this.selectedIdList = Array.from(new Set([... new Set(temp_arr)].filter(x => !new Set(temp_arrId).has(parseInt(x)))))
            if (this.$refs.tree) {
                this.$refs.tree.setCheckedKeys(this.selectedIdList)
            }
        },

        // 关闭选中
        handleCloseDiago(done) {
            this.isShowAddList = false
            this.selectedIdList = this.$refs.tree.getCheckedKeys()
        },

        // 保存
        save(text) {
            this.form.attachmentDTOList = this.$refs.upload.form.attachment
            if (this.selectedIdList.length == 0 || this.selectedIdList[0] == 0) {
                this.$message.warning('接收诊所必选')
                return
            } else if (this.$refs.tree && this.$refs.tree.getCheckedKeys().length > 0) {
                this.form.recipients = this.$refs.tree.getCheckedKeys().join(',')
            }
            if (text === '立即发布') {
                this.form.isSend = 1
                this.form.isCancel = 0
                this.form.isDraft = 0
            } else if (text === '存为草稿') {
                this.form.isDraft = 1
                this.form.isCancel = 0
                this.form.isSend = 0
            }

            if (!this.form.name.trim()) {
                this.$message.warning('发布人不能为空')
                return
            }

            if (!this.form.title.trim()) {
                this.$message.warning('标题不能为空')
                return
            }

            if (this.form.type == 1 && !this.form.versions.trim()) {
                this.$message.warning('版本号不能为空')
                return
            }

            saveSysnotification(this.form).then(res => {
                if (res.STATUS && res.STATUS === '1') {
                    this.$message.success('保存成功')
                    this.back()
                }
            })
        },

        // 获得数据
        _initFields(obj) {
            for (const key in obj) {
                this.form[key] = obj[key]
            }
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        // 可选择诊所list
        getSysOrgList() {
            getOrgOpts({type:1}).then(res => {
                if (res.STATUS == '1') {
                    const d = res.ITEMS
                    this.selectList = d
                }
            })
        },

        // 初始化form
        initform(obj) {
            if (obj) {
                this.form = obj
                this.selectedIdList = []
                this.form.recipients.split(',').forEach(item => {
                    this.selectedIdList.push(+item)
                })
                this.$refs.upload.copyForm3(obj.attachmentDTOList)
                this.selectReceive(false)
            } else {
                this.showFlag = false
                this.$nextTick(() => {
                    this.showFlag = true
                })
                this.getSysOrgList()
            }
        }
    },
    mounted() {
        this.getSysOrgList()
    }
}
</script>

<style scoped lang='scss'>

.title {
  font-size: 18px;
  font-weight: bold;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: block;
  margin-bottom: 20px;
  line-height: 50px;
}
.submit-btn {
  border-top: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.el-tag--small {
    height: 28px;
    padding: 0 8px;
    line-height: 27px;
    &:not(:first-child){
       margin-left:10px;
    }
}
.add-tag {
    padding: 6px 9px !important;
}

</style>
<style lang='scss'>
.add-dialog{
    .el-dialog__wrapper{
        .el-dialog{
            .el-dialog__header{
                height:50px;
                background-color: #0097FF !important;
            }
            .el-dialog__title{
                font-size:16px;
                line-height:20px;
                color:white !important;
            }
            .el-dialog__headerbtn .el-dialog__close{
                color:white;
            }
        }
    }
}
</style>


