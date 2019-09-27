<template>
    <el-dialog center :title="title" :visible.sync="visible" :width="width">
        <div class="main">
            <el-form ref="form" :model="form" label-position="right" label-width="100px" size="mini">
                <el-form-item v-for="(item,index) in formData" :key="index" :label="item.name?`${item.name}:`:''" :prop="item.field" :rules="item.rules">
                    <!-- 输入框 -->
                    <el-input v-if="item.type === 'input'" v-model="form[item.field]" :placeholder="item.placeholder" />

                    <!-- 选择器 -->
                    <el-select v-else-if="item.type === 'select'" v-model="form[item.field]" :disabled="item.disabled" :multiple="item.multiple" :placeholder="item.placeholder?item.placeholder:'请选择'" :value-key="item.key?item.key:'value'" @change="item.func?item.func($event):{}">
                        <el-option v-for="(opt,optIndex) in item.opts" :key="optIndex" :label="opt.label" :value="opt.value">
                            <span style="float: left">{{ opt.label }}</span>
                            <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                        </el-option>
                    </el-select>

                    <!-- 树菜单 -->
                    <el-tree v-else-if="item.type === 'tree'" ref="tree" :data="menuMap" show-checkbox node-key="id" />
                </el-form-item>
            </el-form>
        </div>
        <div slot="footer">
            <el-button size="mini" @click="visible = false;">取消</el-button>
            <el-button size="mini" type="primary" :loading="loading" @click="handleConfirm">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { getMenuList } from '@/api/upms'

export default {
    props: {
        title: {
            type: String,
            default: '系统提示'
        },
        width: {
            type: String,
            default: '365px'
        },
        handleOk: {
            type: String,
            default: 'confirm'
        },
        btnCancel: {
            type: Boolean,
            default: true
        },

        formData: {
            type: Array
        },

        formEdit: {
            type: Object
        }
    },
    data() {
        const menuMap = []
        getMenuList().then(res => {
            if (res.STATUS === '1') {
                const data = res.ITEMS
                data.forEach(v => {
                    if (v.parentId < 0) {
                        menuMap.push({
                            id: v.id,
                            label: v.title,
                            children: []
                        })
                    }
                })
                menuMap.forEach(a => {
                    data.forEach(m => {
                        if (a.id === m.parentId) {
                            a.children.push({
                                id: m.id,
                                label: m.title,
                                children: []
                            })
                        }
                    })
                    if (a.children.length > 0) {
                        a.children.forEach(b => {
                            data.forEach(m => {
                                if (b.id === m.parentId) {
                                    b.children.push({
                                        id: m.id,
                                        label: m.title,
                                        children: []
                                    })
                                }
                            })
                            if (b.children.length > 0) {
                                b.children.forEach(c => {
                                    data.forEach(m => {
                                        if (c.id === m.parentId) {
                                            c.children.push({
                                                id: m.id,
                                                label: m.title,
                                                children: []
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        })
        return {
            menuMap,
            visible: false,
            loading: false,
            form: {}
        }
    },
    watch: {
        visible() {
            if (this.visible) {
                this.initforms()
            }
        }
    },
    methods: {
        open() {
            this.visible = true
        },

        close() {
            this.visible = false
        },

        initforms() {
            const form = {}
            this.formData.forEach(item => {
                if (item.type !== 'tree') {
                    form[item.field] = ''
                }
            })
            if (this.formEdit) {
                this.form = Object.assign(form, this.formEdit)
                this.$nextTick(() => {
                    this.$refs.tree[0].setCheckedKeys([])
                    this.form.menuIdList.forEach(item => {
                        this.$refs.tree[0].setChecked(item, true)
                    })
                })
            } else {
                this.form = Object.assign({}, form)
            }
            this.loading = false
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },

        handleConfirm() {
            const halfChecks = this.$refs.tree[0].getHalfCheckedKeys()
            const checks = this.$refs.tree[0].getCheckedKeys()
            // 2019-09-17 by ssj
            // this.form.menuIdList = new Set(checks.concat(halfChecks))
            this.form.menuIdList = [
                ...new Set(checks.concat(halfChecks))
            ]
            this.$emit('handleConfirm', this.form)
        }
    }
}
</script>
