<template>
    <el-row class="page-container">
        <el-row class="page-main temperature"  v-if="showIndex">
            <el-col class="first-content">
                <template v-for="(item,index) in firstInfoList">
                        <el-col class="first-content-item" :key="index">
                            <template v-for="(itemObj,indexObj) in item.list">
                                <el-col class="part" :key="indexObj">
                                    <el-col class="content" :style="itemObj.style">{{ itemObj.value }}</el-col>
                                    <el-col class="describe">{{ itemObj.label }}</el-col>
                                </el-col>
                            </template>
                        </el-col>
                </template>
                <el-col class="third-content-item">
                    <el-col  class="part">
                        <el-col class="content">{{tempsettingInfo[0]?tempsettingInfo[0].temp:'0'}}℃</el-col>
                        <el-col class="describe">
                            <img width="25" height="15" src="@/assets/icon_images/first_warn.png" alt="">
                        </el-col>
                    </el-col>
                    <el-col  class="part">
                        <el-col class="content">{{tempsettingInfo[1]?tempsettingInfo[1].temp:'0'}}℃</el-col>
                        <el-col class="describe">
                            <img width="25" height="15" src="@/assets/icon_images/second_warn.png" alt="">
                        </el-col>
                    </el-col>
                    <el-col  class="part">
                        <el-col class="content">{{tempsettingInfo[2]?tempsettingInfo[2].temp:'0'}}℃</el-col>
                        <el-col class="describe">
                            <img width="25" height="15" src="@/assets/icon_images/third_warn.png" alt="">
                        </el-col>
                    </el-col>
                    <el-col  class="part" style="width:30%;">
                        <el-col class="setting-info">
                            <el-button type="primary" @click.stop="handleSetting(false)">
                            <img width="20" height="18" style="margin-bottom: -3px;" src="@/assets/icon_images/warn.png" alt=""> 预警设置
                            </el-button>
                        </el-col>
                    </el-col>
                </el-col>
            </el-col>

            <el-col>
                <direct-search ref="form" :label-position="'center'" :label-width="'85px'" :form-style="{'text-align':'left'}" :forms="searchList" @handleSearch="handleFormSearch"/>
            </el-col>

            <el-col>
                <el-table-self :columns="columns"  :cell-style="cellStyle"  :list-loading="listLoading"  :table-data="dataList"
                    :total-count="total" :page-sizes="pageSizes" :page-size="pageSize"
                    @pageSizeChange="handleSizeChange"
                    @cellClick="cellClick"
                    @currentPageChange="handleCurrentChange"
                />
            </el-col>

            <div class="dialog-line" style="width:500px;">
                <el-dialog title="温度曲线" :visible.sync="dialogVisible" width="500px" @opened="opened"  @closed="closed">
                    <el-row class="line">
                        <el-col class="dialog-first-content">
                            <el-col class="dialog-first-content-item">
                                <img width="70" style="border-radius:50%" height="70" src="@/assets/icon_images/child-avatar.png" alt="">
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">{{lineInfo&&lineInfo.status == '1'?'在线':lineInfo.status == '2'?'异常':'离线'}}</el-col>
                                <el-col class="describe">{{lineInfo?lineInfo.patientName:'-'}}</el-col>
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">身高(cm)</el-col>
                                <el-col class="describe">{{lineInfo?lineInfo.height:'-'}}</el-col>
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">体重(kg)</el-col>
                                <el-col class="describe">{{lineInfo?lineInfo.weight:'-'}}</el-col>
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">测试部位</el-col>
                                <el-col class="describe">{{lineInfo?lineInfo.site:'-'}}</el-col>
                            </el-col>
                        </el-col>

                        <el-col class="dialog-second-content">
                            <el-col class="dialog-first-content-item">
                                <el-col class="content" style="text-align:center">当前温度</el-col>
                                <el-col class="describe" style="color:#0091FF;font-size:22px;text-align:center">{{lineInfo?lineInfo.curTemp:'0'}}</el-col>
                            </el-col>   
                            <el-col class="dialog-first-content-item">
                                <el-col class="content" style="text-align:center">监测时长</el-col>
                                <el-col class="describe" style="color:#909090;font-size:22px;text-align:center">{{lineInfo?lineInfo.duration:'00:00:00'}}</el-col>
                            </el-col>
                              <el-col class="dialog-first-content-item">
                                <el-col class="content" style="text-align:center">设备状态</el-col>
                                <el-col class="describe" style="color:#000000;font-size:20px;text-align:center">{{lineInfo.postureStr}}</el-col>
                            </el-col>
                        </el-col>

                        <el-col class="dialog-third-content">
                            <el-col>最高体温：<font style="color:#E02020">{{lineInfo?lineInfo.maxTemp:'0'}}</font>℃</el-col>
                            <el-col>
                                <div id="container" style="height:300px;width:100%;"></div>
                            </el-col>
                        </el-col>
                        <!-- <el-col class="dialog-four-content">
                            事件处理
                        </el-col> -->
                    </el-row>

                    <span slot="footer" class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                        <el-button type="primary" @click="handle()">干预处理</el-button>
                    </span>
                </el-dialog>
            </div>

            <div class="dialog-handle" style="width:800px;">
                <el-dialog title="干预处理"  :visible.sync="dialogHandleVisible" width="800px" @opened="openedHandle">
                    <el-row class="line">
                        <el-col class="dialog-first-content">
                            <el-col class="dialog-first-content-item" style="width:120px;padding-right:20px;">
                                <img width="80" style="border-radius:50%" height="80" src="@/assets/icon_images/child-avatar.png" alt="">
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">姓名：{{tempInfo.name}}</el-col>
                                <el-col class="describe">性别：{{ tempInfo.sex?formatSex(tempInfo.sex):""}}</el-col>
                                <el-col class="content" style="width:200%">用户类别：{{ tempInfo.packType}}</el-col>
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">年&ensp;&ensp;&ensp;&ensp;龄：{{ tempInfo.birthDay?getBabyAge(tempInfo.birthDay):'' }}</el-col>
                                <el-col class="describe">签约医生：{{tempInfo.doctorName}}</el-col>  
                            </el-col>
                            <el-col class="dialog-first-content-item">
                                <el-col class="content">用户手机号：{{tempInfo.phone?tempInfo.phone:"-"}}</el-col>
                                <el-col class="describe">医生联系方式：{{tempInfo.doctorPhone}}</el-col>
                            </el-col>
                        </el-col>

                        <el-col class="dialog-second-content">
                            <elFormSelf ref="addForm" :forms="formDoms" style="margin-top:10px;" @handleConfirm="handleConfirm"></elFormSelf>
                        </el-col>
                        <!-- <el-col class="dialog-four-content">
                            事件处理
                        </el-col> -->
                    </el-row>

                    <span slot="footer" class="dialog-footer"> 
                        <el-button type="primary" :loading="btnLoading" @click="$refs.addForm.handleConfirm()">保存</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-row>
        <el-row v-else>
            <!-- handleRecords temperatureSetting -->
            <template v-if="showItem">
                <handle-records :patient-id="patientId" @back="handleSetting"></handle-records>
            </template>
            <template v-else>
                <temperature-setting @back="handleSetting"></temperature-setting>
            </template>
        </el-row>
        <transition name="fade" mode="out-in">
        <router-view></router-view>
        </transition>
    </el-row>
</template>

<script>
    import { getTempinfoList, tempintervention, tempinfo, tempsettingList, getTempinfo } from '@/api/arclinic'
    import echarts from 'echarts'
    import directSearch from '@/components/FormComponents/directSearch'
    import elTableSelf from '@/components/TabComponents/index'
    import { getCurrentDay } from '@/utils/common'
    import paginationMixin from '@/components/TabComponents/mixin'
    import elFormSelf from '@/components/FormComponents/index'
    import { formatSex, getBabyAge, pickerOptions } from '@/utils'
    import { deepClone } from '../../utils'
    import handleRecords from './components/handleRecords'
    import temperatureSetting from './components/temperatureSetting'

    export default {
        components: {
            directSearch,
            elTableSelf,
            elFormSelf,
            handleRecords,
            temperatureSetting
        },
        mixins: [paginationMixin],
        data() {
            return {
                timer: null,
                formatSex,
                getBabyAge,
                showIndex: true,
                showItem: false,
                tempInfo: {
                    status: 0,
                    name: '',
                    height: '',
                    weight: ''
                },
                lineInfo: {},
                dialogVisible: false,
                btnLoading: false,
                listLoading: false,
                cacheForm: {},
                cacheXdata: [],
                cacheYdata: [],
                dialogHandleVisible: false,
                firstInfoList: [
                    {
                        list: [
                            { label: '测温人数', value: 0 },
                            { label: '当前测温人数', value: 0 }
                        ]
                    },
                    {
                        list: [
                            { label: '一级预警人数', value: 0, style: 'color:#FFAA44' },
                            { label: '二级预警人数', value: 0, style: 'color:#FA6400' },
                            { label: '三级预警人数', value: 0, style: 'color:#E02020' }
                        ]
                    }
                ],
                searchList: [
                    {
                        type: 'input',
                        label: '姓名',
                        labelWidth: '80',
                        placeholder: '请输入姓名',
                        prop: 'name',
                        slot: {
                            slot: 'append',
                            type: 'button',
                            icon: 'el-icon-search'
                        }
                    },
                    {
                        type: 'daterange',
                        label: '日期',
                        labelWidth: '80',
                        prop: 'regDateArr',
                        placeholder: '登记日期',
                        options: pickerOptions,
                        format: 'yyyy-MM-dd',
                        valueFormat: 'yyyy-MM-dd'
                    },
                    // {
                    //     type: "date",
                    //     labelWidth:'80',
                    //     placeholder: "请选择时间查询",
                    //     label: "时间",
                    //     prop: "time",
                    //     options: defaultPickOpts.opts,
                    //     format: "yyyy-MM-dd",
                    //     valueFormat: "yyyy-MM-dd",
                    // },
                    {
                        type: 'select',
                        placeholder: '请选择测试状态',
                        label: '测试状态',
                        prop: 'status',
                        opts: [{ label: '在线', value: '1' }, { label: '离线', value: '0' }]
                    },
                    {
                        type: 'select',
                        label: '预警级别',
                        prop: 'levle',
                        placeholder: '请选择预警级别',
                        opts: [{ label: '一级预警', value: '1' }, { label: '二级预警', value: '2' }, { label: '三级预警', value: '3' }]
                    }
                ],
                columns: [
                    {
                        value: 'name',
                        label: '姓名',
                        width: '90px'
                    },
                    {
                        value: 'sex',
                        width: '50px',
                        label: '性别',
                        formatter(row) {
                            return formatSex(row.sex)
                        }
                    },
                    {
                        value: 'birthDay',
                        width: '80px',
                        label: '年龄',
                        formatter(row) {
                            return getBabyAge(row.birthDay)
                        }
                    },
                    // {
                    //     value: "phone",
                    //     label: "用户类型"
                    // },
                    // {
                    //     value: "age",
                    //     label: "用户手机号"
                    // },
                    // {
                    //     value: "sex",
                    //     label: "签约医生"
                    // },
                    // {
                    //     value: "sex",
                    //     label: "医生联系方式"
                    // },
                    {
                        value: 'status',
                        width: 60,
                        label: '状态',
                        formatter(row) {
                            return row.status == '1' ? '在线' : row.status == '0' ? '离线' : row.status == '2' ? '异常' : '-'
                        }
                    },
                    {
                        value: 'dataMode',
                        width: 60,
                        label: '设备',
                        formatter(row) {
                            return row.dataMode == '1' ? '体温枪' : row.dataMode == '0' ? '体温贴' : '-'
                        }
                    },
                    {
                        value: 'isConvulsions',
                        width: 90,
                        label: '发热惊厥史',
                        formatter(row) {
                            return row.isConvulsions == '1' ? '是' : row.isConvulsions == '0' ? '否' : '-'
                        }
                    },
                    {
                        complex: true,
                        label: '实时测温',
                        list: [
                            {
                                value: 'on.start',
                                label: '开始时间'
                            }, {
                                value: 'on.duration',
                                label: '测试时长'
                            }, {
                                value: 'on.temp',
                                label: '最高温度'
                            }, {
                                label: '温度曲线',
                                width: '70px',
                                value: '',
                                scope: {},
                                operType: 'button',
                                operations: [
                                    {
                                        func: this.handleToTempInfo,
                                        formatter(row) {
                                            return {
                                                label: row.on ? '查看' : '',
                                                type: 'text'
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        complex: true,
                        label: '最近测温',
                        list: [
                            {
                                value: 'off.start',
                                label: '开始时间'
                            }, {
                                value: 'off.duration',
                                label: '测试时长'
                            }, {
                                value: 'off.temp',
                                label: '最高温度'
                            }
                        ]
                    },
                    {
                        value: 'level',
                        operType: 'svg',
                        width: '70px',
                        label: '预警状态',
                        operations: {
                            formatter(row) {
                                return [
                                    {
                                        iconClass: row.level == '1' ? 'first-warning' : row.level == '2' ? 'second-warning' : row.level == '3' ? 'third-warning' : '-',
                                        tips: row.level == '1' ? '一级预警' : row.level == '2' ? '二级预警' : row.level == '3' ? '三级预警' : '',
                                        style: 'width:30px;height:30px;'
                                    }
                                ]
                            }
                        }
                    },
                    {
                        value: 'isIntervene',
                        width: '70px',
                        label: '干预记录',
                        formatter(row) {
                            return row.isIntervene > 0 ? '查看' : '无'
                        }
                    },
                    {
                        label: '操作',
                        fixed: 'right',
                        align: 'center',
                        width: 200,
                        operType: 'button',
                        operations: [
                            {
                                label: '干预处理',
                                type: 'primary',
                                func: this.handle
                            },
                            {
                                label: '历史报告',
                                type: 'warning',
                                func: this.historyReport
                            }
                        ]
                    }
                ],
                dataList: [],
                tempsettingInfo: [],
                total: 0,
                formDoms: [
                    {
                        type: 'text',
                        label: '处理人',
                        text: '健管师',
                        md: 24,
                        sm: 24,
                        lg: 24,
                        xl: 24
                    },
                    {
                        type: 'radio',
                        label: '处理方式',
                        prop: 'method',
                        opts: [{ 'label': '持续关注', 'value': 1 }, { 'label': '电话回复', 'value': 2 }],
                        rules: [{ required: true, message: '处理方式必选', trigger: 'blur' }],
                        md: 24,
                        sm: 24,
                        lg: 24,
                        xl: 24
                    },
                    {
                        type: 'textarea',
                        label: '处理描述',
                        rows: 5,
                        prop: 'dispose',
                        rules: [{ required: true, message: '处理描述必填', trigger: 'blur' }],
                        md: 24,
                        sm: 24,
                        lg: 24,
                        xl: 24
                    }
                ]
            }
        },
        beforeRouteLeave(to, from, next) {
            clearInterval(this.timer)
            next()
        },
        methods: {
            closed() {
                this.handleSearch()
            },
            cellStyle({ row, column, rowIndex, columnIndex }) {
                if (columnIndex == 3) {
                    if (row.status == '1') {
                        return { color: '#00AC6A' }
                    } else if ((row.status == '0')) {
                        return { color: '#E02020' }
                    } else {
                        return { color: 'red' }
                    }
                }

                if (columnIndex == 5) {
                    if (row.isConvulsions == '1') {
                        return { color: '#E02020' }
                    } else {
                        return { color: '#000000' }
                    }
                }

                if (columnIndex == 14 && row.isIntervene > 0) {
                    return { color: '#409EFF', cursor: 'pointer' }
                }
            },

            cellClick(row, column, cell, event) {
                if (row.isIntervene > 0 && column.label == '干预记录') {
                    this.patientId = row.patientId
                    this.showIndex = false
                    this.showItem = true
                }
            },

            openedHandle() {
                this.$refs.addForm.handleReset()
            },

            // 查看实时曲线
            handleToTempInfo(row) {
                if (row.on && row.on.start) {
                    this.tempinfo = row
                    this.dialogVisible = true
                }
            },

            // 干预处理
            handle(row) {
                const d = row || this.tempinfo
                this.dialogVisible = false
                this.dialogHandleVisible = true
                this.formDoms[0].text = this.$store.getters.user.realName
                this.tempInfo = d
                // 携带信息
            },

            // 历史报告
            historyReport(row) {
                this.$router.push({
                    name: 'patientDetail',
                    params: {
                        id: row.id,
                        registerId: 0
                    }
                })
            },

            // 路由变化
            routerChange() {
                if (this.showIndex) {
                    const that = this
                    this.timer = setInterval(function() {
                        if (that.dialogVisible) {
                            that.opened()
                        } else {
                            that.handleSearch()
                        }
                    }, 10000)
                }
            },

            // 预警设置
            handleSetting(flag) {
                this.showIndex = flag
                this.showItem = flag
                if (flag) {
                    this.$nextTick(() => {
                        this.$refs.form.initforms(this.cacheForm)
                        this.handleSearch()
                        this.tempsettingList()
                    })
                }
            },

            // 保存干预记录
            handleConfirm(form) {
                this.btnLoading = true
                const data = Object.assign({}, form)
                data.patientId = this.tempInfo.patientId
                tempintervention(data).then(res => {
                    if (res.STATUS == '1') {
                        this.$message.success('保存成功!')
                        this.handleSearch()
                    }
                    this.dialogHandleVisible = false
                    this.btnLoading = false
                })
            },

            handleFormSearch(form) {
                this.pageIndex = 1
                this.handleSearch(form)
            },

            // 查询列表
            handleSearch(form) {
                this.cacheForm = this.cacheForm || form
                const temp_params = Object.assign(this.cacheForm, form)
                const params = deepClone(temp_params)
                // this.$refs.form.initforms(params)
                this.$nextTick(() => {
                    params.pageNo = this.pageIndex
                    params.pageSize = this.pageSize
                    if (!params.regDateArr) {
                        const date = getCurrentDay().split(' ')[0]
                        params.regDateArr = [date, date]
                    }
                    if (params.regDateArr.length == 2) {
                        params.startDate = params.regDateArr[0]
                        params.endDate = params.regDateArr[1]
                        delete params.regDateArr
                        // 调用接口
                        getTempinfoList(params).then(res => {
                            if (res.STATUS === '1') {
                                const d = res.ITEMS
                                this.dataList = d.list
                                this.total = d.totalRecord
                            }
                        })

                        const data = { startDate: params.startDate, endDate: params.endDate }
                        tempinfo(data).then(res => {
                            if (res.STATUS == '1') {
                                const d = res.ITEMS
                                this.firstInfoList[0].list[0].value = d.count
                                this.firstInfoList[0].list[1].value = d.onCount
                                this.firstInfoList[1].list[0].value = d.oneCount
                                this.firstInfoList[1].list[1].value = d.twoCount
                                this.firstInfoList[1].list[2].value = d.threeCount
                            }
                        })
                    } else {
                        this.$message.warning('请选择具体时间段！')
                    }
                })
            },

            // 绘制温度曲线
            opened() {
                const data = { 'id': this.tempinfo.on.tempInfoId, 'effectiveFlag': false }
                getTempinfo(data).then(res => {
                    if (res.STATUS == '1') {
                        const d = res.ITEMS.timeList
                        this.lineInfo = res.ITEMS
                        const status = this.lineInfo.posture
                        this.lineInfo.postureStr = (status == 0 || status == 1) ? '手臂夹紧' : (status == 2 || status == 3) ? '手臂张开' : status == 4 ? '体温贴掉落' : status == -1 ? '充电中' : ''
                        const xdata = []
                        const ydata = []
                        this.$nextTick(function() {
                            if (d && d.length > 0) {
                                d.forEach(item => {
                                    xdata.push(item.time)
                                    ydata.push(item.temp)
                                    this.cacheXdata.push(item.time)
                                    this.cacheYdata.push(item.temp)
                                })
                            }
                            if (this.lineInfo.status == 2) {
                                this.cacheXdata.push(getCurrentDay())
                                this.cacheYdata.push(0)
                            } else {
                                this.cacheXdata = xdata
                                this.cacheYdata = ydata
                            }
                            this.drawLineChart(this.cacheXdata, this.cacheYdata)
                        })
                    }
                })
            },

            drawLineChart(xdata, ydata) {
                var dom = document.getElementById('container')
                var myChart = echarts.init(dom)
                let option = null
                option = {
                    dimension: ['体温'],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        padding: [5, 10]
                    },

                    legend: {
                        data: ['时间']
                    },
                    xAxis: {
                        name: '时间',
                        boundaryGap: false,
                        type: 'category',
                        data: xdata
                    },
                    yAxis: {
                        name: '体温(℃)',
                        type: 'value',
                        min: 30
                    },
                    series: [
                        {
                            name: '体温',
                            smooth: true,
                            symbolSize: 1,
                            type: 'line',
                            lineStyle: {
                                normal: {
                                    color: '#FF7584',
                                    width: 2
                                }
                            },
                            areaStyle: { color: '#FF7584' },
                            data: ydata
                        }
                    ]
                }
                myChart.setOption(option, true)
            },

            // 预警温度
            tempsettingList() {
                const data = { age: 3, isConvulsions: 0 }
                tempsettingList(data).then(res => {
                    if (res.STATUS == '1') {
                        this.tempsettingInfo = res.ITEMS
                    }
                })
            }
        },

        mounted() {
            const date = getCurrentDay().split(' ')[0]
            this.$refs.form.initforms({ regDateArr: [date, date] })
            this.handleSearch({ regDateArr: [date, date] })
            this.routerChange()
            this.tempsettingList()
        }
    }
</script>

<style lang="scss" scoped>
.first-content{
    border-bottom:1px solid #e6e6e6;
    margin-bottom:15px;
    padding-bottom:10px;
    .first-content-item{
        text-align:center;
        width:33%;
        .part{
            width:25%;
            text-align:center;
            .content{
                margin:12px 0;
                text-align:center;
                font-size:22px;
            }
            .describe{
                margin:5px 0;
                text-align:center;
                font-size:14px;
            }
        }
    }
    .third-content-item{
        width:33%;
        .part{
            width:22%;
            text-align:center;
            .content{
                margin:12px 0;
                text-align:center;
                font-size:22px;
            }
            .describe{
                margin:5px 0;
                text-align:center;
                font-size:14px;
            }
            .el-button{
                color:#ffffff;
                padding:10px;
                margin:24px 0;
                border-radius: 5px;
                text-align:center;
                font-size:16px;
            }
        }
    }
}
.line{
    .dialog-first-content{
        padding:10px 0;
    }

    .dialog-second-content{
        padding:10px 0;
        border-top:1px solid #979797;
        .dialog-first-content-item{
            width:33.33%;
        }
    }

    .dialog-third-content{
        padding:10px 0;
        border-top:1px solid #979797;
    }

    .dialog-four-content{
        padding:10px 0;
        border-top:1px solid #979797;
    }

    .el-input__inner{
        width:100px !important;
    }
}

</style>
<style lang="scss">
.dialog-line .el-dialog__body ,.dialog-handle .el-dialog__body{
    padding: 5px 15px;
    .dialog-first-content-item{
        width:20%;
        text-align:center;
        .content{
            margin:11px 0;
            text-align:left;
            font-size:14px;
        }
        .describe{
            text-align:left;
            margin:11px 0;
            font-size:14px;
        }
    }
}
.dialog-handle .el-dialog__body{
     .dialog-first-content-item{
        width:25%;
        .content{
            margin:11px 0 11px 0 !important;
            text-align:left;
            font-size:14px;
        }
     }
}
.dialog-line .el-dialog__header{
     border-bottom:1px solid #979797;
}

.temperature{
 .el-input--small .el-input__inner{
    padding-right:0 !important;
 }
 .el-date-editor .el-range-input{
     width:80px !important;
 }
}
</style>
