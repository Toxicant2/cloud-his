<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <stroage-comp v-if="!isAdd" :search-list="searchList" :total-count='supplierData.length' :tab-columns="tabColumns" @handleSearch="handleFormSearch" :tab-data="supplierData"></stroage-comp>
            <add-supplier v-else @addSupplier="changeAdd" :supplierItem="supplierItem"></add-supplier>
        </el-row>
    </el-row>
</template>

<script>
 import { getOpSkDealer, deleteOpSkDelivery, handleOpSkDealer } from '@/api/pharmacy'
 import elTableSelf from '@/components/TabComponents/index'
 import stroageComp from '@/views/inventory/components/stroage'
 import directSearch from '@/components/FormComponents/directSearch'
 import addSupplier from '@/views/systems/supplier/components/addSupplier'
 import paginationMixin from '@/components/TabComponents/mixin'
 export default {
     components: {
         elTableSelf,
         directSearch,
         stroageComp,
         addSupplier
     },
     mixins: [paginationMixin],
     data() {
         return {
             totalCount: 0,
             tabData: [],
             // 供应商表单
             searchList: [
                 {
                     type: 'input',
                     label: '',
                     prop: 'dealerName',
                     placeholder: '名称/拼音码',
                     labelWidth: '0',
                     slot: {
                         slot: 'append',
                         type: 'button',
                         icon: 'el-icon-search'
                     }
                 }, {
                     type: 'button',
                     color: 'primary',
                     value: '+新增供应商',
                     func: this.addSupplier
                 }
             ],

             // 供应商表头
             tabColumns: [
                 {
                     value: 'dealerCode',
                     label: '供应商编号',
                     align: 'center'
                 }, {
                     value: 'dealerName',
                     label: '供应商名称',
                     align: 'center'
                 }, {
                     value: 'legalPerson',
                     label: '法定代表人',
                     align: 'center'
                 }, {
                     value: 'linkMan',
                     label: '联系人',
                     align: 'center'
                 }, {
                     value: 'tel',
                     label: '电话',
                     align: 'center'
                 }, {
                     value: 'address',
                     label: '地址',
                     align: 'center'
                 },
                 {
                     label: '操作',
                     fixed: 'right',
                     align: 'center',
                     width: 280,
                     operType: 'button',
                     operations: [
                         {
                             label: '编辑',
                             type: 'primary',
                             func: this.handleUpdate
                         }, {
                             func: this.handleStatus,
                             formatter(row) {
                                 return {
                                     label: row.isUse === 1 ? '停用' : '启用',
                                     type: row.isUse === 1 ? 'danger' : 'primary'
                                 }
                             }
                         }, {
                             label: '删除',
                             type: 'danger',
                             func: this.handleDelete
                         }
                     ]
                 }
             ],
             // 供应商数据
             supplierData: [],
             isAdd: false,
             supplierItem: { 'id': 0 },
             cacheForm: {}
         }
     },
     methods: {
         // 新增供应商
         addSupplier() {
             this.isAdd = true
             this.supplierItem = { 'id': 0 }
         },

         // 修改
         handleUpdate(item) {
             this.isAdd = true
             this.supplierItem = item
         },

         // 修改状态
         handleStatus(row) {
             const txt = `确认将${row.dealerName}改为【${row.isUse === 1 ? '停用' : '启用'}】状态？`
             this.$confirm(txt, '提示', {
                 type: 'warning'
             }).then(() => {
                 const data = { 'id': row.id, 'isUse': row.isUse === 1 ? 0 : 1 }
                 handleOpSkDealer(data).then(res => {
                     if (res.STATUS === '1') {
                         this.handleSearch()
                         this.$message.success('状态修改成功')
                     }
                 })
             }).catch(() => {

             })
         },

         // 删除
         handleDelete(row, index) {
             const data = { 'id': row.id }
             this.$confirm('确认删除？', '提示', {
                 type: 'warning'
             }).then(() => {
                 deleteOpSkDelivery(data).then(res => {
                     if (res.STATUS === '1') {
                         this.$message.success('删除成功！')
                         this.supplierData.splice(index, 1)
                     } else {
                         this.$message.error('删除失败！')
                     }
                 })
             }).catch(() => {

             })
         },

         handleFormSearch(form) {
             this.pageIndex = 1
             this.handleSearch(form)
         },

         // 获得供应商列表
         handleSearch(form) {
             this.cacheForm = this.cacheForm || form
             const params = Object.assign(this.cacheForm, form)
             if (!form) {
                 params.pageNo = this.pageIndex
                 params.pageSize = 10
             }
             getOpSkDealer(params).then(res => {
                 this.supplierData = res.ITEMS.records
                 this.totalCount = res.ITEMS.total
             })
         },

         // 从新增供应商返回
         changeAdd(val) {
             this.isAdd = val
             this.handleSearch()
         }
     },
     mounted() {
         this.handleSearch()
     }
 }
</script>
