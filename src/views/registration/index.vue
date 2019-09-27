<template>
    <el-row class="page-container registration">
        <el-row v-if="regIndex" class="page-main">
            <el-tabs v-model="activeName" type="card" @tab-click="handleSwitch">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <!-- activeName不可用于判断显示隐藏 -->
                    <template v-if="tab.key === 'tab1'">
                        <!-- <el-row class="text-right">
                            <el-button type="warning">读身份证</el-button>
                            <el-input v-model="patientCard" placeholder="请输入患者卡号" class="input-search">
                                <el-button slot="append" icon="el-icon-search"></el-button>
                            </el-input>
                        </el-row>-->
                        <el-form ref="form" :model="form" label-position="right" label-width="120px">
                            <el-row class="form-container">
                                <el-col :sm="18" :md="20">
                                    <el-row v-for="(row,rowIndex) in formDoms" v-if="!row.hidden" :key="rowIndex">
                                        <div v-show="showMore?rowIndex === 1:rowIndex === 2" class="more">
                                            <el-button type="text" @click="handleShowMore">
                                                更多信息
                                                <i :class="showMore?'el-icon-arrow-up':'el-icon-arrow-down'" />
                                            </el-button>
                                        </div>
                                        <div v-if="row.name" class="header-line">
                                            <span v-if="rowIndex > 0" class="line" />
                                            <h3>{{ row.name }}</h3>
                                        </div>
                                        <el-col v-for="(col,colIndex) in row.items" :key="colIndex" :xs="col.xs?col.xs:24" :sm="col.sm?col.sm:12" :lg="col.lg?col.lg:8" style="height:47px;">
                                            <el-form-item :label="`${col.name}：`" :prop="col.field" :rules="col.rules" :class="col.className">
                                                <span v-if="!col.name" slot="label" />
                                                <!-- 输入框 -->
                                                <el-input v-if="col.type === 'input'" v-model="form[col.field]" :disabled="col.disabled" :maxlength="col.maxlength" :placeholder="col.placeholder" @change="col.func?col.func($event):{}">
                                                    <template v-if="col.slot" :slot="col.slot.slot">
                                                        <el-button v-if="col.slot.type === 'button'" :icon="col.slot.icon" />
                                                    </template>
                                                </el-input>

                                                <template v-else-if="col.type === 'mixin-input'">
                                                    <el-form-item v-for="(c,cIndex) in col.list" :key="cIndex" :prop="c.field" :label="c.name?`${c.name}：`:''" :label-width="c.labelWidth?c.labelWidth:'0'" :rules="c.rules" :class="{'suffix':c.suffix}" style="width:33%">
                                                        <!-- 输入框 -->
                                                        <el-row>
                                                            <el-col :span="18">
                                                                <el-input v-if="c.type === 'input'" v-model="form[c.field]" :maxlength="c.maxlength" :placeholder="c.placeholder" @change="c.func?c.func($event):{}" />
                                                            </el-col>
                                                            <el-col :span="6"><span v-if="c.suffix">{{ c.suffix }}</span></el-col>
                                                        </el-row>
                                                    </el-form-item>
                                                </template>

                                                <!-- 模糊查询 -->
                                                <el-autocomplete v-else-if="col.type === 'autoComplete'" v-model="form[col.field]" :fetch-suggestions="col.func" :placeholder="col.placeholder" clearable @select="col.selectfun">
                                                    <template slot-scope="{ item }">
                                                        <span style="display:inline-block;width:120px">{{ item.name }}</span>
                                                        <span>{{ item.sex }}</span>
                                                        <p style="margin-left:120px">
                                                            <span v-if="item.phone">{{ item.phone }}</span>
                                                        </p>
                                                    </template>
                                                </el-autocomplete>

                                                <!-- 数字输入框 -->
                                                <el-input-number v-else-if="col.type === 'number'" v-model="form[col.field]" :min="col.min" :max="col.max" :precision="col.precision" :controls="false" :placeholder="col.placeholder" :maxlength="col.maxlength" :disabled="col.disabled" />

                                                <!-- 按钮 -->
                                                <el-button v-else-if="col.type === 'wechat'" @click="wechat">
                                                    <svg-icon icon-class="wechat" style="margin-right: 5px;" />绑定微信
                                                </el-button>

                                                <!-- 文字 -->
                                                <span v-else-if="col.type === 'text'">{{ outpatientNum }}</span>

                                                <!-- 日期 -->
                                                <el-date-picker v-else-if="col.type === 'date'" v-model="form[col.field]" :placeholder="col.placeholder" :picker-options="col.options" :format="col.format" :value-format="col.valueFormat" type="date" @change="col.func?col.func($event):{}" />

                                                <!-- 单选框 -->
                                                <el-radio v-for="(opt,optIndex) in col.opts" v-else-if="col.type === 'radio'" :key="optIndex" v-model="form[col.field]" :label="opt.value" @change="col.func?col.func($event):{}">{{ opt.label }}</el-radio>

                                                <!-- 多选框 -->
                                                <el-checkbox-group v-else-if="col.type === 'checkbox'" v-model="form[col.field]">
                                                    <el-checkbox v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.value">{{ opt.label }}</el-checkbox>
                                                </el-checkbox-group>

                                                <!-- 选择器 -->
                                                <el-select v-else-if="col.type === 'select'" v-model="form[col.field]" :multiple="col.multiple" :filterable="col.filterable" :placeholder="col.placeholder?col.placeholder:'请选择'" @change="col.func?col.func($event):{}">
                                                    <el-option v-for="(opt,optIndex) in col.opts" :key="optIndex" :label="opt.label" :value="opt.value" :disabled="opt.disabled">
                                                        <span style="float: left">{{ opt.label }}</span>
                                                        <span style="float: right; color: #8492a6; font-size: 10px">{{ opt.description }}</span>
                                                    </el-option>
                                                </el-select>

                                                <!-- 级联 -->
                                                <el-cascader v-else-if="col.type === 'cascader'" v-model="form[col.field]" :options="col.list" :props="col.props" :change-on-select="col.changeOnSelect" :clearable="true" filterable />

                                                <!-- 上传列表 -->
                                                <el-upload-row v-else-if="col.type === 'upload'" :file="col.file" :file-list="fileList" :accept="col.accept" @uploadSuccess="uploadSuccess" @handleRemove="handleRemove" />
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-col>
                                <el-col :sm="6" :md="4">
                                    <div class="crop-avatar">
                                        <div class="image-select" @click="uploadAvatar">
                                            <div class="image-preview">
                                                <img :src="avatar?avatar:unknownAvatar" alt>
                                            </div>
                                            <div class="image-upload">
                                                <el-button>上传头像</el-button>
                                            </div>
                                        </div>
                                        <input ref="fileInput" type="file" style="display:none" @change="fileChange($event)">
                                    </div>
                                </el-col>
                            </el-row>
                            <el-row class="submit-btn">
                                <el-button :loading="loading" type="primary" @click="handleConfirm">完成登记</el-button>
                                <el-button :loading="loading" :disabled="!form.chargeItemStr" type="primary" @click="handleConfirm('charge')">完成登记并收费</el-button>
                                <el-checkbox v-model="isPrint">打印票据</el-checkbox>
                                <!-- <el-switch v-model="isPrint"  active-text="打印" inactive-text="不打印"></el-switch> -->
                            </el-row>
                        </el-form>
                        <dialog-image ref="wechat" :img-url="wechatImg" title="绑定微信" width="480px" />
                    </template>
                    <template v-else>
                        <el-radio-group v-model="listType">
                            <el-radio-button label="0">
                                <i class="el-icon-tickets" />&ensp;列表
                            </el-radio-button>
                            <el-radio-button label="1">
                                <i class="el-icon-picture" />&ensp;卡片
                            </el-radio-button>
                        </el-radio-group>
                        <direct-search ref="searchForm" :label-width="'0'" :form-style="{'text-align':'right','margin-bottom':'10px'}" :forms="tabMaps[tab.key]?tabMaps[tab.key].searchList:[]" @handleSearch="handleFormSearch" />
                        <panel-card v-if="listType === '1'" :panel-ellist="tabMaps[tab.key]?tabMaps[tab.key].elList:{}" :panel-list="dataList" :current-page="pageIndex" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                        <el-table-self v-else :list-loading="listLoading" :current-page="pageIndex" :columns="tabMaps[tab.key]?tabMaps[tab.key].columns:[]" :table-data="dataList" :total-count="total" :page-sizes="pageSizes" :page-size="pageSize" @pageSizeChange="handleSizeChange" @currentPageChange="handleCurrentChange" />
                    </template>
                </el-tab-pane>
            </el-tabs>
            <charge ref="chargeDialog" :input-style="'width:300px;'" title="付款" @printRegister="handlePrint" @startCharge="startCharge" />
        </el-row>
        <transition name="fade" mode="out-in">
            <keep-alive>
                <router-view />
            </keep-alive>
        </transition>
    </el-row>
</template>

<script>
import { cancelRegister, getRegisterList, getDailyAppointList, cancelAppoint } from '@/api/arclinic'
import { mapGetters } from 'vuex'
import directSearch from '@/components/FormComponents/directSearch'
import dialogImage from '@/components/DialogComponents/Image'
import panelCard from '@/components/Panel/PanelCard'
import elUploadRow from '@/components/Upload/index'
import charge from '@/views/charge/components/charge'
import elTableSelf from '@/components/TabComponents/index'
import paginationMixin from '@/components/TabComponents/mixin'
import formMixin from './mixin'
import {
    formatDate,
    paramAvatar,
    formatSex,
    getBabyAge,
    deepClone,
    defaultPickOpts,
    pickerOptions,
    formatPatientStatus
} from '@/utils'
// import elEnterNext from '@/directive/el-enterNext' // base on element-ui
export default {
    components: {
        directSearch,
        panelCard,
        dialogImage,
        elUploadRow,
        elTableSelf,
        charge
    },
    // directives: { elEnterNext },
    mixins: [paginationMixin, formMixin],
    data() {
        const defaultShowType = this.commonUtil.getConfigValue('defaultShowType') // 列表展示样式
        return {
            listLoading: false,
            listType: defaultShowType,
            isPrint: this.commonUtil.getConfigValue('isPrintRegistrationForm ') === '1',
            regIndex: true,
            defaultPickOpts,
            tabMapOpts: [
                {
                    label: '新增登记',
                    key: 'tab1'
                },
                {
                    label: '今日预约',
                    key: 'tab2'
                },
                {
                    label: '登记记录',
                    key: 'tab3'
                }
            ],
            activeName: 'tab1',
            dataList: [],
            // 对应关系图
            tabMaps: {
                tab2: {
                    searchList: [
                        {
                            type: 'input',
                            label: '',
                            prop: 'condition',
                            placeholder: '请输入姓名、卡号、手机号后4位',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'index',
                            label: '序号'
                        },
                        {
                            value: 'name',
                            label: '姓名'
                            // operType: 'button',
                            // operations: [
                            //     {
                            //         type: 'text',
                            //         func: this.handleToPatient
                            //     }
                            // ]
                        },
                        {
                            value: 'sex',
                            label: '性别'
                        },
                        {
                            value: 'age',
                            label: '年龄'
                        },
                        {
                            value: 'commercialInsuranceType',
                            label: '用户类型'
                        },
                        {
                            value: 'createTime',
                            label: '创建时间',
                            width: 150
                        },
                        {
                            value: 'doctorName',
                            label: '预约医生'
                        },
                        {
                            value: 'appointmentDate',
                            label: '预约时间',
                            width: 150,
                            sortable: true
                        },
                        {
                            value: 'diseaseDescription',
                            label: '预约内容'
                        },
                        {
                            value: 'note',
                            label: '备注'
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 250,
                            operType: 'button',
                            operations: [
                                {
                                    func: this.regOnAppointId,
                                    formatter(row) {
                                        return {
                                            label: '登记',
                                            type: 'primary'
                                        }
                                    },
                                    isHidden(row) {
                                        return row.appointmentStatus === 1
                                    }
                                },
                                {
                                    func: this._cancelAppoint,
                                    formatter(row) {
                                        return {
                                            label: '取消预约',
                                            type: 'danger'
                                        }
                                    },
                                    isHidden(row) {
                                        return row.appointmentStatus === 1
                                    }
                                },
                                {
                                    formatter(row) {
                                        return {
                                            label: '已登记',
                                            type: 'danger',
                                            disabled: true
                                        }
                                    },
                                    isHidden(row) {
                                        return row.appointmentStatus !== 1
                                    }
                                }
                            ]
                        }
                    ],
                    elList: {
                        header: {
                            nameValue: 'name',
                            sexValue: 'sex',
                            ageValue: 'age'
                        },
                        list: [
                            {
                                name: '用户类型',
                                value: 'commercialInsuranceType'
                            },
                            {
                                name: '创建时间',
                                value: 'createTime'
                            },
                            {
                                name: '预约医生',
                                value: 'doctorName'
                            },
                            {
                                name: '预约时间',
                                value: 'appointmentDate'
                            },
                            {
                                name: '预约内容',
                                value: 'diseaseDescription'
                            },
                            {
                                name: '备注',
                                value: 'note'
                            }
                        ],
                        btnlist: [
                            {
                                name: '登记',
                                func: this.regOnAppointId,
                                isHidden(row) {
                                    return row.appointmentStatus === 1
                                }
                            },
                            {
                                name: '取消预约',
                                style: { color: 'red' },
                                func: this._cancelAppoint,
                                isHidden(row) {
                                    return row.appointmentStatus === 1
                                }
                            },
                            {
                                name: '已登记',
                                style: { color: 'red' },
                                isHidden(row) {
                                    return row.appointmentStatus !== 1
                                }
                            }
                        ]
                    }
                },
                tab3: {
                    searchList: [
                        {
                            type: 'daterange',
                            label: '',
                            prop: 'regDateArr',
                            placeholder: '登记日期',
                            options: pickerOptions,
                            format: 'yyyy-MM-dd',
                            valueFormat: 'yyyy-MM-dd 00:00:00'
                        },
                        {
                            type: 'input',
                            label: '',
                            prop: 'condition',
                            placeholder: '输入姓名/手机号/病案号',
                            slot: {
                                slot: 'append',
                                type: 'button',
                                icon: 'el-icon-search'
                            }
                        }
                    ],
                    columns: [
                        {
                            value: 'index',
                            label: '序号'
                        },
                        {
                            value: 'name',
                            label: '姓名',
                            operType: 'button',
                            operations: [
                                {
                                    type: 'text',
                                    func: this.handleToPatient
                                }
                            ]
                        },
                        {
                            value: 'sex',
                            label: '性别'
                        },
                        {
                            value: 'age',
                            label: '年龄'
                        },
                        {
                            value: 'commercialInsuranceType',
                            label: '用户类型'
                        },
                        {
                            label: '接诊类型',
                            formatter(row) {
                                return row.isFirstClinic === 1 ? '初诊' : '非初诊'
                            }
                        },
                        {
                            label: '登记科室',
                            value: 'deptName'
                        },
                        {
                            label: '接诊医生',
                            value: 'doctorName'
                        },
                        {
                            label: '登记人员',
                            value: 'createUserName'
                        },
                        {
                            label: '登记时间',
                            value: 'regDate'
                        },
                        {
                            label: '排队序号',
                            value: 'sn'
                        },
                        {
                            label: '就诊状态',
                            formatter(row) {
                                const hasPause =
                  formatPatientStatus(row.patientStatus) && row.revisitingStatus === 1
                                return (
                                    formatPatientStatus(row.patientStatus) +
                  (hasPause ? '、' : '') +
                  (row.revisitingStatus === 1 ? '需回诊' : '')
                                )
                            }
                        },
                        {
                            label: '操作',
                            fixed: 'right',
                            align: 'center',
                            width: 300,
                            operType: 'button',
                            operations: [
                                {
                                    label: '已取消',
                                    isHidden(row) {
                                        return row.isCanceled !== 1
                                    }
                                },
                                {
                                    label: '打印挂号单',
                                    func: this.handlePrint,
                                    isHidden(row) {
                                        return row.isCanceled === 1
                                    }
                                },
                                {
                                    label: '修改',
                                    type: 'primary',
                                    func: this.regOnRegisterId,
                                    isHidden(row) {
                                        return row.isCanceled === 1
                                    }
                                },
                                {
                                    label: '取消登记',
                                    type: 'danger',
                                    func: this._cancelRegister,
                                    isHidden(row) {
                                        return (
                                            row.isCanceled === 1 ||
                      !(
                          (row.patientStatus === 0 || row.patientStatus === 1) &&
                        row.chargeStatus === 0
                      )
                                        )
                                    }
                                }
                            ]
                        }
                    ],
                    elList: {
                        header: {
                            nameValue: 'name',
                            sexValue: 'sex',
                            ageValue: 'age',
                            func: this.handleToPatient
                        },
                        statusList: [
                            {
                                value: 'patientStatus',
                                formatter(val) {
                                    return formatPatientStatus(val)
                                }
                            },
                            {
                                value: 'revisitingStatus',
                                formatter(val) {
                                    return val === 1 ? '需回诊' : ''
                                }
                            }
                        ],
                        list: [
                            {
                                name: '用户类型',
                                value: 'commercialInsuranceType'
                            },
                            {
                                name: '接诊类型',
                                formatter(item) {
                                    return item.isFirstClinic === 1 ? '初诊' : '非初诊'
                                }
                            },
                            {
                                name: '登记科室',
                                value: 'deptName'
                            },
                            {
                                name: '接诊医生',
                                value: 'doctorName'
                            },
                            {
                                name: '登记人员',
                                value: 'createUserName'
                            },
                            {
                                name: '登记时间',
                                value: 'regDate'
                            },
                            {
                                name: '排队序号',
                                value: 'sn'
                            }
                        ],
                        btnlist: [
                            {
                                name: '已取消',
                                isHidden(row) {
                                    return row.isCanceled !== 1
                                }
                            },
                            {
                                name: '打印挂号单',
                                func: this.handlePrint,
                                isHidden(row) {
                                    return row.isCanceled === 1
                                }
                            },
                            {
                                name: '修改',
                                func: this.regOnRegisterId,
                                isHidden(row) {
                                    return row.isCanceled === 1
                                }
                            },
                            {
                                name: '取消登记',
                                style: { color: 'red' },
                                func: this._cancelRegister,
                                isHidden(row) {
                                    return (
                                        row.isCanceled === 1 ||
                    !(
                        (row.patientStatus === 0 || row.patientStatus === 1) &&
                      row.chargeStatus === 0
                    )
                                    )
                                }
                            }
                        ]
                    }
                }
            }
        }
    },
    computed: {
        ...mapGetters(['clinic'])
    },
    watch: {
        $route() {
            this.routerChange()
        }
    },
    mounted() {
        this.routerChange()
    },
    methods: {
        // 切换路由
        routerChange() {
            this.regIndex = this.$route.name === 'registration'
            if (this.regIndex && (this.activeName === 'tab3' || this.activeName === 'tab2')) {
                this.$nextTick(() => {
                    this.handleSwitch({
                        name: this.activeName
                    })
                })
            }
        },
        enterClick() {
            console.log('enter')
        },

        // 切换pane
        handleSwitch(tab) {
            if (tab.name !== 'tab1') {
                this.pageIndex = 1
                if (tab.name === 'tab3') {
                    const now = formatDate() + ' 00:00:00'
                    this.cacheForm = {
                        regDateArr: [now, now]
                    }
                } else {
                    this.cacheForm = {}
                }
                // this.listType = '1'
                this.handleSearch()
                this.$refs.searchForm.forEach((item, index) => {
                    this.$refs.searchForm[index].$refs.form.resetFields()
                })
            }
            this.isPrint = this.commonUtil.getConfigValue('isPrintRegistrationForm ') === '1'
        },

        // 表单查询
        handleFormSearch(form) {
            this.pageIndex = 1
            this.handleSearch(form)
        },

        // 今日预约|登记记录查询
        handleSearch(form) {
            this.listLoading = true
            this.cacheForm = form || this.cacheForm
            const temp_params = Object.assign(this.cacheForm, form)
            const params = deepClone(temp_params)
            params.pageNo = this.pageIndex
            params.pageSize = this.pageSize
            // 今日预约
            if (this.activeName === 'tab2') {
                getDailyAppointList(params).then(res => {
                    this.searchSuccessCb(res)
                })
            } else {
                // 登记记录
                if (this.$refs.searchForm[1]) {
                    this.$refs.searchForm[1].initforms(params)
                    const params1 = deepClone(params)
                    if (params1 && params1.regDateArr && params1.regDateArr.length > 1) {
                        params1.startDate = params1.regDateArr[0]
                        params1.endDate = params1.regDateArr[1]
                        delete params1.regDateArr
                    }
                    getRegisterList(params1).then(res => {
                        this.searchSuccessCb(res, false)
                    })
                }
            }
        },

        // 列表查询成功回调
        searchSuccessCb(res, flag = true) {
            if (res.STATUS === '1') {
                const d = res.ITEMS
                let result = []
                let total = 0
                if (d.total && d.total > 0) {
                    d.records.forEach((item, index) => {
                        const sex = flag ? item.sysPatientSex : item.sex
                        const birth = flag ? item.sysPatientBirthDate : item.birthDate
                        item.avatar = item.headImg
                            ? this.$store.getters.basic.filePrifix + item.headImg
                            : paramAvatar(sex, birth)
                        item.sex = formatSex(sex)
                        item.age = getBabyAge(birth)
                        item.regDate = item.regDate ? item.regDate.split(' ')[0] : ''
                        item.commercialInsuranceType = item.commercialInsuranceType
                            ? item.commercialInsuranceType
                            : ''
                        item.name = flag ? item.sysPatientName || '' : item.name || ''

                        item.index = d.size * (d.current - 1) + index + 1
                    })
                    result = d.records
                    total = d.total
                }
                this.listLoading = false
                this.total = total
                this.dataList = result
            }
        },

        // 取消预约
        _cancelAppoint(item) {
            cancelAppoint(item.id, '').then(res => {
                if (res.STATUS === '1') {
                    this.handleSearch()
                    this.$message.success('取消预约成功')
                }
            })
        },

        // 今日预约去登记
        regOnAppointId(item) {
            if (item.orgOutpRegisterId) {
                this.$message('患者已登记，无需重复登记！')
                return false
            }
            this.$router.push({
                name: 'regDetail',
                params: {
                    type: 'appoint',
                    id: item.id
                }
            })
        },

        // 登记记录修改
        regOnRegisterId(item) {
            this.$router.push({
                name: 'regDetail',
                params: {
                    type: 'record',
                    id: item.id
                }
            })
        },

        // 取消登记
        _cancelRegister(item) {
            this.$confirm(`是否确认取消【${item.name}】的挂号？`, '提示', {
                type: 'warning'
            })
                .then(() => {
                    cancelRegister(item.id).then(res => {
                        if (res.STATUS === '1') {
                            this.handleSearch()
                            this.$message.success('取消成功')
                        }
                    })
                })
                .catch(() => {})
        },

        // 跳转病人库
        handleToPatient(item) {
            if (item.isCanceled === 1) return
            this.$router.push({
                name: 'patientDetail',
                params: {
                    id: item.sysPatientId,
                    registerId: item.id
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.input-search {
  width: 202px;
}

.form-container {
  // margin-top: 10px;
  // padding-top: 10px;
  // border-top: 1px dashed #ccc;
  .header-line {
    line-height: 36px;
    .header {
      margin-left: 10px;
      h3 {
        display: inline-block;
        font-size: 14px;
        color: #666;
      }
    }
    .line {
      display: block;
      border-bottom: 1px dashed #ccc;
      margin: 10px 0;
      margin-top: 0;
    }
  }
  .crop-avatar {
    margin-top: 36px;
    margin-left: 20px;
    .image-select {
      border: 1px solid #ddd;
      text-align: center;
      background: #fff;
      padding: 10px;
      cursor: pointer;
      .image-preview {
        width: auto;
        overflow: hidden;
        text-align: center;
        img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 0 auto;
        }
      }
      .image-upload {
        margin-top: 10px;
        .el-button {
          width: 100%;
        }
      }
    }
  }
  .more {
    // margin-top: -15px;
    text-align: center;
  }
}

.submit-btn {
  border-top: 1px solid #ccc;
  padding-top: 10px;
  text-align: right;
}
</style>
<style lang="scss">
.el-autocomplete {
  width: 100%;
}
.registration {
  .mixin-input {
    margin-bottom: 0 !important;
    .el-form-item__content {
      height: 32px;
      .el-input {
        width: 100% !important;
      }
      .suffix {
        display: inline-block;
        color: #606266;
        &:not(:last-child) {
          margin-right: 0 !important;
        }
        label {
          font-size: 12px;
          padding-right: 0;
        }

        span {
          font-size: 12px;
          display: inline-block;
          text-align: center;
          width: 100%;
        }
      }
    }
  }
}
</style>

