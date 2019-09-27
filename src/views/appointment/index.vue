<template>
    <el-row class="page-container">
        <el-row class="page-main" v-if="reservationIndex">
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane v-for="(tab,index) in tabMapOpts" :key="index" :name="tab.key" :label="tab.label">
                    <template v-if="tab.key === 'clinicReservation'">
                        <el-row>
                            <el-col>
                                <div v-if="dayOrWeek" style="display:inline-block">
                                    <el-form ref="form" :inline="true" :model="form" label-width="80px">
                                        <el-form-item>
                                            <el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="选择日期" v-model="form.time" style="width: 100%;">
                                            </el-date-picker>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-select v-model="form.departId" placeholder="请选择">
                                                <el-option v-for="item in departmentOptions" :key="item.id" :label="item.name" :value="item.id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </div>
                                <div v-else style="display:inline-block">
                                    <el-form ref="formWeek" :inline="true" :model="formWeek" label-width="80px">
                                        <el-form-item>
                                            <el-button-group>
                                                <el-button type="primary" icon="el-icon-arrow-left" @click.native="preOrAfterWeek(true)">上一周</el-button>
                                                <el-button type="primary" @click.native="preOrAfterWeek(false)">下一周
                                                    <i class="el-icon-arrow-right el-icon--right"></i>
                                                </el-button>
                                            </el-button-group>
                                            <el-button-group style="background-color:#EFEFEF;">
                                                <el-button type="primary" @click.stop="nowWeek(false)">本周</el-button>
                                            </el-button-group>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-select v-model="formWeek.departId" placeholder="请选择">
                                                <el-option v-for="item in departmentOptions" :key="item.id" :label="item.name" :value="item.id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </div>
                                <div style="float:right">
                                    <el-radio-group border="true" v-model="dayOrWeekValue">
                                        <el-radio-button label="日" @click.native="dayOrWeek = true"></el-radio-button>
                                        <el-radio-button label="周" @click.native="dayOrWeek = false"></el-radio-button>
                                    </el-radio-group>
                                </div>
                                <div style="float:right;margin-right:20px;">
                                    <el-button type="primary" icon="el-icon-plus" @click="addReservate">新增预约</el-button>
                                </div>
                            </el-col>
                        </el-row>
                        <!-- 周预约 -->
                        <div v-show="!dayOrWeek">
                            <el-table :data="tableDataWeekly" :span-method="objectSpanMethod" border style="width: 100%;" :header-cell-style="getRowClass" @cell-mouse-leave="cellMouseLeave" @cell-mouse-enter="cellMouseEnter" :row-class-name="tableRowClassName" size="-">
                                <el-table-column v-for="(item,index) in lineDataWeek" :key="index" :prop="item.pro" :label="item.th" header-align=center align=center>
                                    <template slot-scope="scope">
                                        <span v-if="item.th=='诊所班次'">
                                            {{scope.row.type === '1' ? '上午' : scope.row.type === '2' ? '下午' : '晚上'}}
                                        </span>
                                        <span v-else-if="item.th=='科室医生'">{{scope.row.docName}}</span>
                                        <template v-else>
                                            <span v-for="(itemRow,itemRowIndex) in scope.row.list" v-if="itemRow.dateStr== item.th" :key="itemRowIndex">
                                                <span v-for="(itemDoc,itemDocIndex) in itemRow.doctors" v-if="itemDoc.docId== scope.row.docId&&itemDoc.duration == scope.row.type" :key="itemDocIndex">
                                                    {{itemDoc.counts}}
                                                </span>
                                            </span>
                                        </template>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 日预约 -->
                        <div v-show="dayOrWeek">
                            <el-table :data="tableDataDay" :span-method="objectSpanMethod" border style="width: 100%;" :cell-style="cellStyle" :header-cell-style="getRowClass" @cell-mouse-leave="cellMouseLeave" @cell-mouse-enter="cellMouseEnter" :row-class-name="tableRowClassName">
                                <el-table-column v-for="(item,index) in lineDataDay" :key="index" :prop=item.pro :label=item.th header-align=center align=center>
                                    <template slot-scope="scope">
                                        <span v-if="item.th=='诊所班次'">{{scope.row.timeStr < timeRanger[1][timeRanger[1].length-1]? '上午' : scope.row.timeStr< timeRanger[2][timeRanger[2].length-1]? '下午' : '晚上' }}</span> <span v-else-if="item.th=='预约时间段'">{{scope.row.timeStr}}</span>
                                        <span v-else-if="(item.th!='诊所班次'&&item.th!='预约时间段')&&scope.row.list.length!=0">
                                            <template v-for="(itemRow,itemRowIndex) in scope.row.list">
                                                <span :key="itemRowIndex" v-if="item.id === itemRow.id && item.departId === itemRow.departId" @click.stop="showResList(item.id,itemRow.departId,itemRow.appointmentTime,$event)">
                                                    {{itemRow.counts}}
                                                </span>
                                            </template>
                                        </span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 预约信息 -->
                        <dialog-table ref="records" :width="'912px'" :cell-style="infoCellStyle" :row-click="appointmentRowClick" :title="recordTitle" :table-max-height="500" :table-data="recordTabData" :columns="recordColums" />
                    </template>

                    <template v-else>
                        <el-form ref="formWork" :inline="true" :model="formWork" label-width="80px">
                            <el-form-item>
                                <el-button-group>
                                    <el-button type="primary" icon="el-icon-arrow-left" @click.native="preWeek(true)">上一周</el-button>
                                    <el-button type="primary" @click.native="preWeek(false)">下一周
                                        <i class="el-icon-arrow-right el-icon--right"></i>
                                    </el-button>
                                </el-button-group>
                                <el-button-group style="background-color:#EFEFEF;">
                                    <el-button type="primary" @click.stop="nowWeek(true)">本周</el-button>
                                </el-button-group>
                            </el-form-item>
                            <el-form-item>
                                <el-select v-model="formWork.departId" placeholder="请选择">
                                    <el-option v-for="item in departmentOptions" :key="item.id" :label="item.name" :value="item.id">
                                    </el-option>
                                </el-select>

                            </el-form-item>

                            <el-form-item style="float:right;">
                                <div>
                                    <el-button-group>
                                        <el-button type="primary" @click.native="WorkTimeConfigure">工作时间配置</el-button>
                                    </el-button-group>
                                    <el-button-group>
                                        <el-button type="primary" @click.native="quotePreWeek">引用上周</el-button>
                                    </el-button-group>
                                    <el-button-group>
                                        <el-button type="primary" @click.native="saveWrokPlan">保存</el-button>
                                    </el-button-group>
                                </div>
                            </el-form-item>
                        </el-form>

                        <el-table :data="ScheduleList" border style="width: 100%;" :row-style="rowStyle" :header-cell-style="getRowClass">
                            <el-table-column v-for="(item,index) in ScheduleListTh" :key="index" :label="item.th" header-align=center align=center>
                                <template slot-scope="scope">
                                    <span v-if="item.th==''">
                                        {{scope.row[0].list.duration=== 1 ? '上午' : scope.row[0].list.duration === 2 ? '下午' : '晚上'}}
                                    </span>
                                    <span v-else @click.stop="Schedule(scope.$index,index)">
                                        <template v-for="(itemDate,itemDateIndex) in scope.row">
                                            <span :key="itemDateIndex" v-if="itemDate.dateStr === item.th">
                                                <span v-if="itemDate.list.doctors.length ===0">
                                                    点击添加排班
                                                </span>
                                                <span v-else>
                                                    <template v-for="(itemDocotors,indexDoc) in itemDate.list.doctors">
                                                        <span :key="indexDoc">
                                                            <el-tag closable :disable-transitions="false" @close="handleClose(scope.$index,index,indexDoc)">
                                                                {{itemDocotors.docName}}
                                                            </el-tag>
                                                        </span>
                                                    </template>
                                                </span>
                                            </span>
                                        </template>
                                    </span>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="pop-over" style="width:500px;">
                            <el-dialog title="选择医生" :visible.sync="selectDoctor">
                                <el-checkbox-group v-model="checkList">
                                    <el-checkbox v-for="item in temp_doctorList" :label="item" :key="item.id">{{item.docName}}</el-checkbox>
                                </el-checkbox-group>
                                <div class="bottom-text">
                                    <el-button type="text" @click="clickSelectDoctor">确定</el-button>
                                </div>
                            </el-dialog>
                        </div>

                        <div class="pop-over" style="width:500px;">
                            <el-dialog title="工作时间配置" :visible.sync="workTimeConfigureFlag">
                                <div class="selectTime">
                                    <el-row>
                                        <div class="time-select">
                                            上午
                                            <el-time-select v-model="mornStart" :picker-options="{
                                              start: '08:30',
                                              step: '00:30',
                                              end: '12:00' }" placeholder="选择时间">12 18 8.30
                                            </el-time-select>
                                            至
                                            <el-time-select v-model="mornEnd" :picker-options="{
                                              start: '08:30',
                                                step: '00:30',
                                                end: '12:00',
                                                minTime: mornStart
                                            }" placeholder="选择时间">
                                            </el-time-select>
                                        </div>
                                    </el-row>
                                    <el-row>
                                        <div class="time-select">
                                            下午
                                            <el-time-select v-model="afterStart" :picker-options="{
                                              start: '12:00',
                                              step: '00:30',
                                              end: '18:00'
                                            }" placeholder="选择时间">
                                            </el-time-select>
                                            至
                                            <el-time-select v-model="afterEnd" :picker-options="{
                                              start: '12:00',
                                              step: '00:30',
                                              end: '18:00',
                                              minTime: afterStart
                                            }" placeholder="选择时间">
                                            </el-time-select>
                                        </div>
                                    </el-row>
                                    <el-row>
                                        <div class="time-select">
                                            晚上
                                            <el-time-select v-model="evenStart" :picker-options="{
                                              start: '18:00',
                                              step: '00:30',
                                              end: '22:00'
                                            }" placeholder="选择时间">
                                            </el-time-select>
                                            至
                                            <el-time-select v-model="evenEnd" :picker-options="{
                                              start: '18:00',
                                              step: '00:30',
                                              end: '22:00',
                                              minTime: evenStart
                                            }" placeholder="选择时间">
                                            </el-time-select>
                                        </div>
                                    </el-row>
                                    <el-row>
                                        <el-radio v-model="radioType" label="1">法定节假日</el-radio>
                                        <el-radio v-model="radioType" label="0">全年无休</el-radio>
                                    </el-row>
                                </div>
                                <div class="btn-group">
                                    <el-button @click="workTimeConfigureFlag = false">取消</el-button>
                                    <el-button type="primary" @click="saveConfigureWorkTime">保存</el-button>
                                </div>
                            </el-dialog>
                        </div>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </el-row>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </el-row>
</template>

<script>
import {
    appointmentDaily,
    appointmentWeekLy,
    getAppointmentList,
    getworkplanList,
    saveWorkplanList,
    quotePreWeek
} from '@/api/arclinic'
import {
    getOrgClinicStaffList,
    getDepartmentOpts,
    setOpenTime
} from '@/api/org'
import { getCurrentDay, getSevenDays } from '@/utils/common'

import dialogTable from '@/components/DialogComponents/Table'
import ImageCropper from '@/components/ImageCropper'
import { defaultPickOpts, getBabyAge, paramAvatar, formatDate } from '@/utils'

export default {
    components: {
        ImageCropper,
        dialogTable
    },
    data() {
        return {
            reservationIndex: true,
            radioType: '1',
            recordTitle: '预约信息',
            doctorList: [],
            temp_doctorList: [],
            recordTabData: [],
            recordColums: [
                {
                    value: 'avatar',
                    align: 'center',
                    type: 'img',
                    label: '',
                    width: '100px'
                },
                {
                    value: 'sysPatientName',
                    align: 'center',
                    label: '姓名'
                },
                {
                    value: 'sysPatientBirthDate',
                    align: 'center',
                    label: '年龄'
                },
                {
                    value: 'clinicDepartName',
                    align: 'center',
                    label: '预约科室'
                },
                {
                    value: 'doctorName',
                    align: 'center',
                    label: '预约医生'
                },
                {
                    value: 'appointmentDate',
                    align: 'center',
                    width: 180,
                    label: '预约时间'
                },
                {
                    value: 'appointmentStatus',
                    align: 'center',
                    label: '预约状态'
                },
                {
                    value: 'diseaseDescription',
                    align: 'center',
                    label: '预约内容'
                }
            ],
            checkList: [],
            selectDoctor: false,
            workTimeConfigureFlag: false,
            departmentOptions: [],
            value: '',
            nightTime: '',
            dayOrWeek: true,
            dayOrWeekValue: '日',
            // 表头数据
            lineDataWeek: [
                { th: '诊所班次', pro: 'id' },
                { th: '科室医生', pro: 'docName' }
            ],
            tableDataWeekly: [],
            defaultPickOpts,
            avatar: '',
            tabMapOpts: [
                {
                    label: '诊所预约',
                    key: 'clinicReservation'
                },
                {
                    label: '排班管理',
                    key: 'WorkforceManagement'
                }
            ],
            activeName: 'clinicReservation',
            // 日预约患者分布数据
            temp_Data: [],
            timeRanger: [],
            ScheduleList: [],
            ScheduleListTh: [], // 排班表头数据
            lineDataDay: [],
            tableDataDay: [],
            spanArr: [],
            sameRowArr: [],
            curRowArr: [],
            firstIndex: 0,
            secondIndex: 0,
            // 排班时间
            mornStart: '',
            mornEnd: '',
            afterStart: '',
            afterEnd: '',
            evenStart: '',
            evenEnd: '',
            appointmentDailyData: {},
            form: {
                time: formatDate(),
                departId: ''
            },
            // 周预约
            formWeek: {
                date: formatDate(),
                departId: ''
            },
            // 排班
            formWork: {
                date: formatDate(),
                departId: ''
            }
        }
    },
    watch: {
        $route() {
            this.routerChange()
        },
        activeName(val, oldVal) {
            if (val === 'WorkforceManagement') {
                // 调用周预约患者分布方法
                this.getworkplanListData()
            }
        },
        'form.departId': function(val, oldVal) {
            this.getAppointmentDaily()
        },
        'form.time': function(val, oldVal) {
            this.form.time = val
            this.getAppointmentDaily()
        },
        'formWeek.departId': function(val, oldVal) {
            this.getAppointmentWeekLy()
        },
        'formWork.departId': function(val, oldVal) {
            this.getworkplanListData()
        },

        dayOrWeekValue(val, oldVal) {
            val === '日'
                ? this.getAppointmentDaily()
                : this.getAppointmentWeekLy()
        }
    },
    mounted() {
        // this.getDepartmentOpts()
        // this.getOrgClinicStaffListData()
        this.routerChange()
        // this.getAppointmentDaily()
    },
    methods: {
        // 路由切换 模块隐藏
        routerChange() {
            if (this.$route.name === 'appointment') {
                this.getDepartmentOpts()
                this.getOrgClinicStaffListData()
                this.reservationIndex = true
                this.getAppointmentDaily()
            } else {
                this.reservationIndex = false
            }
            // this.reservationIndex = this.$route.name === 'appointment';
        },

        // 新增预约
        addReservate() {
            this.$router.push({
                name: 'detail',
                params: {
                    id: 0,
                    patientId: 0
                }
            })
        },

        // 诊所预约列表，点击行跳转预约详情
        appointmentRowClick(row) {
            this.$router.push({
                name: 'detail',
                params: {
                    id: row.id,
                    patientId: row.sysPatientId
                }
            })
        },

        getworkplanListData() {
            this.ScheduleListTh = []
            getworkplanList(this.formWork).then(res => {
                if (res.STATUS === '1' && res.ITEMS.length > 0) {
                    const d = res.ITEMS
                    var temp_thList = [{ th: '' }]
                    // 数据初始化
                    this._.forEach(d, function(item) {
                        temp_thList.push({ th: item.dateStr })
                    })
                    this.ScheduleListTh = temp_thList
                    this.ScheduleList = temp_thList
                    // 构造表格数据
                    const arrTime = [1, 2, 3] // 与后台保持一致，上午，下午，晚上
                    var arrWork = []
                    const that = this
                    for (let index = 0; index < arrTime.length; index++) {
                        // 以上午、下午、晚上作为区分表格数据中的第一层次项
                        const temp_arr = []
                        this._.forEach(d, function(item) {
                            that._.forEach(item.scheduls, function(element) {
                                if (element.duration === arrTime[index]) {
                                    const temp_json = {
                                        dateStr: item.dateStr,
                                        clinicDate: item.clinicDate,
                                        list: element
                                    }
                                    temp_arr.push(temp_json)
                                }
                            })
                        })
                        arrWork[index] = temp_arr
                    }
                    // 构造表头

                    this.ScheduleList = arrWork
                }
            })
        },

        // 获得排班人员
        getOrgClinicStaffListData() {
            this.doctorList = []
            const data = {
                pageNo: 1,
                pageSize: 100,
                userType: 1,
                isUse: 1
            }
            getOrgClinicStaffList(data).then(res => {
                if (res.STATUS === '1') {
                    const d = res.ITEMS
                    const total = d.totalRecord
                    var that = this
                    if (total > 0) {
                        this._.forEach(d.list, function(item) {
                            if (item.isScheduling === 1) {
                                const temp_json = {
                                    userId: item.userId,
                                    docName: item.userRealName,
                                    deptId: item.departId,
                                    name: item.departName
                                }
                                that.doctorList.push(temp_json)
                            }
                        })
                    }
                }
            })
        },

        // 周预约
        preOrAfterWeek(flag) {
            this.formWeek.date = getSevenDays(this.formWeek.date, flag)
            this.getAppointmentWeekLy()
        },

        // 排班管理
        preWeek(flag, qoute) {
            this.formWork.date = getSevenDays(this.formWork.date, flag)
            if (!qoute) {
                this.getworkplanListData()
            }
        },
        // 本周
        nowWeek(planFlag) {
            if (planFlag) {
                this.formWork.date = getCurrentDay()
                this.getworkplanListData()
            } else {
                this.formWeek.date = getCurrentDay()
                this.getAppointmentWeekLy()
            }
        },

        // 初始化数据-日预约患者分布方法
        initDailyData() {
            this.appointmentDailyData = {}
            this.timeRanger = []
            this.temp_Data = []
            this.tableDataDay = []
            this.sameRowArr = []
            this.spanArr = []
        },

        // 日预约患者分布方法
        getAppointmentDaily() {
            this.initDailyData()
            const data = this.form
            appointmentDaily(data).then(res => {
                if (res.STATUS === '1' && res.ITEMS.doctorList.length !== 0) {
                    this.appointmentDailyData = res.ITEMS
                    this.lineDataDay = [
                        { th: '诊所班次', pro: 'duration' },
                        { th: '预约时间段', pro: 'timeStr' }
                    ]
                    // 拼接表头
                    for (
                        let index = 0;
                        index < res.ITEMS.doctorList.length;
                        index++
                    ) {
                        const temp_json = {
                            th: res.ITEMS.doctorList[index].name,
                            prop: 'duration',
                            id: res.ITEMS.doctorList[index].doctorId,
                            departId: res.ITEMS.doctorList[index].departId
                        }
                        this.lineDataDay.push(temp_json)
                    }
                    this.timeRanger = res.ITEMS.durationTimes // 时间段赋值-方便取值
                    for (var p in res.ITEMS.durationTimes) {
                        this.temp_Data = this.temp_Data.concat(
                            res.ITEMS.durationTimes[p]
                        ) // 连接时间段-构造表格数据
                    }

                    // 表内数据
                    // ------------------------------------------------
                    // 构造数据表格内容
                    /**
                     * 想要达到的数据格式效果如下：
                     * tableData:[{list:Array(1),timeStr:"08:30-09:00",type:"上午"},{list:Array(2),timeStr:"12:00-12:30",type:"下午"},{list:Array(2),timeStr:"18:00-20:00",type:"晚上"}]
                     * 1：list里面的数据：[{appointmentTime:"2018-08-28 09:00:00",counts:"1人",duration:1,id:4,timeStr:"09:00-09:30"},{},{}] 可能会有多条，但最多只能n（医生人数）条
                     * 2：tableData下的子项以timeStr作为区分，在对应的list里只会存在与当前时间段一致的数据，例如tableData的第一项{list:Array(1),timeStr:"08:30-09:00",type:"上午"}，这里面list里面的每条数据的timeStr也一定是08:30-09:00
                     *    根据每列的id与list子项里面的id就可以确定是某个具体单元格内的数据
                     * 3：字段type：方便合并单元格，合并原则-第一列中内容一样的合并
                     */
                    var arr = [] // 临时存储数据
                    for (
                        let index = 0;
                        index < this.temp_Data.length;
                        index++
                    ) {
                        // 以timeStr作为区分表格数据中的第一层次项
                        var temp_time = this.temp_Data[index]
                        var temp_data = {} // tableData中的第一层次子项
                        var temp_list = [] // tableData中第一层次子项的list
                        const that = this
                        this._.forEach(res.ITEMS.doctorList, function(item) {
                            that._.forEach(item.appointmentList, function(
                                item2
                            ) {
                                item2['id'] = item.doctorId // 添加人员id作为比对依据
                                item2['departId'] = item.departId
                            })
                            temp_list = temp_list.concat(item)
                            temp_data = {
                                timeStr: temp_time,
                                list: temp_list,
                                type:
                                    temp_time < that.timeRanger[2][0]
                                        ? '上午'
                                        : temp_time >= that.timeRanger[2][0] &&
                                          temp_time < that.timeRanger[3][0]
                                            ? '下午'
                                            : '晚上'
                            }
                        })

                        arr[index] = temp_data // 添加到tableData中
                    }

                    // 消除无用数据，使得数据满足上述第二条
                    const that = this
                    const _this = this
                    this._.forEach(arr, function(item) {
                        var test_arr = []
                        that._.forEach(item.list, function(listItem) {
                            if (
                                listItem.appointmentList &&
                                listItem.appointmentList.length > 0
                            ) {
                                _this._.forEach(
                                    listItem.appointmentList,
                                    function(appointmentListItem) {
                                        if (
                                            appointmentListItem.timeStr ===
                                            item.timeStr
                                        ) {
                                            test_arr.push(appointmentListItem)
                                        }
                                    }
                                )
                            }
                        })
                        item.list = test_arr
                    })
                    this.tableDataDay = arr // 赋值数据表格
                    // ------------------------------------------------

                    let contactDot = 0 // 合并单元格-数组下标
                    let temp_index = 0 // 改变单元格颜色-数组下标
                    if (arr.length > 0) {
                        arr.forEach((item, index) => {
                            item.index = index
                            if (index === 0) {
                                // 合并单元格
                                this.spanArr.push(1)
                                // 改变选中颜色
                                this.sameRowArr.push([index])
                            } else {
                                if (item.type === arr[index - 1].type) {
                                    // 合并单元格
                                    this.spanArr[contactDot] += 1
                                    this.spanArr.push(0)
                                    // 改变选中颜色
                                    this.sameRowArr[temp_index].push(index)
                                } else {
                                    // 合并单元格
                                    this.spanArr.push(1)
                                    contactDot = index
                                    // 改变选中颜色
                                    temp_index += 1
                                    this.sameRowArr.push([contactDot])
                                }
                            }
                        })
                    }
                }
            })
        },

        // 周预约患者分布方法
        getAppointmentWeekLy() {
            const data = this.formWeek
            appointmentWeekLy(data).then(res => {
                if (res.STATUS === '1') {
                    this.tableDataWeekly = []
                    if (res.ITEMS != null) {
                        this.lineDataWeek = [
                            { th: '诊所班次', pro: 'id' },
                            { th: '科室医生', pro: 'name1' }
                        ]
                        // 拼接表头
                        for (
                            let index = 0;
                            index < res.ITEMS.schedules.length;
                            index++
                        ) {
                            const temp_json = {
                                th: res.ITEMS.schedules[index].dateStr,
                                pro: 'name1'
                            }
                            this.lineDataWeek.push(temp_json)
                        }
                        var docNameList = [] // 医生名称列表
                        for (var key in res.ITEMS.durDoctors) {
                            this._.forEach(res.ITEMS.durDoctors[key], function(
                                item
                            ) {
                                item['type'] = key
                                docNameList.push(item)
                            })
                        }
                        var arrWeekly = []
                        for (
                            let index = 0;
                            index < docNameList.length;
                            index++
                        ) {
                            // 以医生名称作为区分表格数据中的第一层次项
                            var temp_data = {
                                docName: docNameList[index]['docName'],
                                docId: docNameList[index]['docId'],
                                type: docNameList[index]['type'],
                                list: res.ITEMS.schedules
                            }
                            arrWeekly.push(temp_data)
                        }

                        this.tableDataWeekly = arrWeekly

                        if (this.tableDataWeekly.length === 0) {
                            this.lineDataWeek = []
                        }

                        this.spanArr = []
                        this.sameRowArr = []
                        let contactDot = 0 // 合并单元格-数组下标
                        let temp_index = 0 // 改变单元格颜色-数组下标
                        if (arrWeekly.length > 0) {
                            arrWeekly.forEach((item, index) => {
                                item.index = index
                                if (index === 0) {
                                    // 合并单元格
                                    this.spanArr.push(1)
                                    // 改变选中颜色
                                    this.sameRowArr.push([index])
                                } else {
                                    if (
                                        item.type === arrWeekly[index - 1].type
                                    ) {
                                        // 合并单元格
                                        this.spanArr[contactDot] += 1
                                        this.spanArr.push(0)
                                        // 改变选中颜色
                                        this.sameRowArr[temp_index].push(index)
                                    } else {
                                        // 合并单元格
                                        this.spanArr.push(1)
                                        contactDot = index
                                        // 改变选中颜色
                                        temp_index += 1
                                        this.sameRowArr.push([contactDot])
                                    }
                                }
                            })
                        }
                    }
                }
            })
        },

        // 获得下拉框
        getDepartmentOpts() {
            this.departmentOptions = []
            getDepartmentOpts().then(res => {
                if (res.STATUS === '1') {
                    this.departmentOptions = this.departmentOptions.concat(
                        res.ITEMS
                    )
                    if (this.departmentOptions.length != 0) {
                        this.formWork.departId = this.departmentOptions[0].id
                    }
                }
            })
        },

        // 改变选中表格颜色
        tableRowClassName({ row, rowIndex }) {
            const temp_arr = this.curRowArr
            for (let i = 0; i < temp_arr.length; i++) {
                if (rowIndex === temp_arr[i]) {
                    return 'row_class'
                }
            }
        },
        cellMouseEnter(row, column, cell, event) {
            const that = this
            this._.forEach(that.sameRowArr, function(arr) {
                if (arr.indexOf(row.index) !== -1) {
                    that.curRowArr = arr
                }
            })
        },
        cellMouseLeave(row, column, cell, event) {
            this.curRowArr = []
        },

        // 合并单元格-诊所预约-日
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                const _row = this.spanArr[rowIndex]
                const _col = _row > 0 ? 1 : 0
                return {
                    rowspan: _row,
                    colspan: _col
                }
            }
        },

        // 选择排班医生
        clickSelectDoctor() {
            const that = this
            this._.forEach(that.checkList, function(item) {
                that.ScheduleList[that.firstIndex][
                    that.secondIndex
                ].list.doctors.push(item)
            })

            this.checkList = []
            this.selectDoctor = false
        },

        // 删除某一医生
        handleClose(firstIndex, secondIndex, indexDoc) {
            this.ScheduleList[firstIndex][secondIndex - 1].list.doctors.splice(
                indexDoc,
                1
            )
        },

        // 引用上一周
        quotePreWeek() {
            this.preWeek(true, true)
            quotePreWeek(this.formWork).then(res => {
                if (res.STATUS != null && res.STATUS === '1') {
                    this.preWeek(false)
                    this.getworkplanListData()
                } else {
                    this.preWeek(false, true)
                }
            })
        },

        // 保存排班医生
        saveWrokPlan() {
            const workPlanList = []
            var temp_list = []
            this._.forEach(this.ScheduleList, function(item) {
                for (let index = 0; index < item.length; index++) {
                    temp_list.push(item[index])
                    const temp_json = {
                        clinicDate: item[index].clinicDate,
                        dateStr: item[index].dateStr,
                        scheduls: temp_list
                    }
                    workPlanList[index] = temp_json
                }
            })

            for (let index = 0; index < workPlanList.length; index++) {
                workPlanList[index].scheduls = workPlanList[
                    index
                ].scheduls.filter(
                    item => item.clinicDate === workPlanList[index].clinicDate
                )
                if (workPlanList[index].scheduls.length > 0) {
                    workPlanList[index].scheduls.forEach((item, indexItem) => {
                        workPlanList[index].scheduls[indexItem] = item.list
                    })
                }
            }
            const departId = this.formWork.departId
            const data = {
                plans: workPlanList,
                date: this.formWork.date,
                departId: departId
            }
            saveWorkplanList(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('保存成功')
                }
            })
        },

        rowStyle({ row, rowIndex }) {
            return 'height:150px'
        },

        // 工作时间配置弹出
        WorkTimeConfigure() {
            this.workTimeConfigureFlag = true
        },

        // 排班弹出
        Schedule(firstIndex, index) {
            var deptName = ''
            const that = this
            this._.forEach(that.departmentOptions, function(item) {
                if (item.id === that.formWork.departId) {
                    deptName = item.name
                }
            })
            var temp_ScheduleList = this.ScheduleList[firstIndex][index - 1]
                .list.doctors
            var temp_arr = []
            this.temp_doctorList = this.doctorList.concat([])
            this._.forEach(that.temp_doctorList, function(item) {
                if (item.name === deptName) {
                    temp_arr.push(item)
                }
            })
            // 已选择就不再出现在选择框
            if (temp_ScheduleList.length !== 0) {
                var temp_arr2 = []
                this._.forEach(temp_arr, function(item) {
                    let flag = true
                    that._.forEach(temp_ScheduleList, function(itemSecond) {
                        if (itemSecond.docName === item.docName) {
                            flag = false
                        }
                    })
                    if (flag) {
                        temp_arr2.push(item)
                    }
                })
                this.temp_doctorList = temp_arr2
            } else {
                this.temp_doctorList = temp_arr
            }

            if (this.temp_doctorList.length === 0) {
                this.$message.warning('暂无可选择的医生')
            } else {
                this.firstIndex = firstIndex
                this.secondIndex = index - 1
                this.selectDoctor = true
            }
        },
        // 保存排班时间
        saveConfigureWorkTime() {
            const data = {
                morningOpenTime: this.mornStart + '-' + this.mornEnd,
                afternoonOpenTime: this.afterStart + '-' + this.afterEnd,
                nightOpenTime: this.evenStart + '-' + this.evenEnd,
                isHolidayOpen: this.radioType
            }
            setOpenTime(data).then(res => {
                if (res.STATUS === '1') {
                    this.$message.success('保存成功')
                    this.workTimeConfigureFlag = false
                }
            })
        },

        // 打开弹出层-预约列表
        showResList(doctorId, departId, time, event) {
            // 构造参数
            const data = { doctorId: doctorId, departId: departId, time: time }
            if (event.currentTarget.innerHTML != null) {
                // 打开弹出框
                this.$refs.records[0].open()
                getAppointmentList(data).then(res => {
                    if (res.STATUS === '1') {
                        this.recordTabData = res.ITEMS
                        const that = this
                        this._.forEach(that.recordTabData, function(item) {
                            const temp = item.appointmentStatus
                            item.appointmentStatus =
                                temp === 0
                                    ? '预约'
                                    : temp === 1
                                        ? '就诊'
                                        : temp === 2
                                            ? '取消'
                                            : temp === 3
                                                ? '超时'
                                                : '未知'
                            item.avatar =
                                item.avatar ||
                                paramAvatar(
                                    item.sysPatientSex,
                                    item.sysPatientBirthDate
                                )
                            item.sysPatientBirthDate = getBabyAge(
                                item.sysPatientBirthDate
                            )
                        })
                    }
                })
            }
        },

        // 定义图表格式
        cellStyle({ row, column, rowIndex, columnIndex }) {
            if (rowIndex === -1) {
                return 'color:#000000'
            }
            if (columnIndex > 1) {
                if (row.name === '11:30-12:00' || row.name === '12:00-12:30') {
                    return ''
                }
                return 'color:#0099FF;'
            } else {
                return ''
            }
        },

        getRowClass({ row, column, rowIndex, columnIndex }) {
            if (rowIndex === 0) {
                return 'color:#000000;background-color:#FAFDFF;'
            } else {
                return ''
            }
        },

        // 设置预约信息状态颜色
        infoCellStyle({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 6) {
                switch (row.status) {
                    case '已接诊':
                        return 'color:#993399;'
                    case '待诊中':
                        return 'color:#0099FF;'
                    case '已超时':
                        return 'color:#FF6600;'
                    case '退号':
                        return 'color:#C2C2C2;'
                }
            }
            if (columnIndex === 1) {
                return 'color:#0099FF;'
            } else {
                return ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.input-search {
    width: 202px;
}
.input-search {
    width: 202px;
}

.form-container {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
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
    .more {
        margin-top: -15px;
        text-align: center;
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
}

.btn-group {
    margin-bottom: 20px;
    margin-top: 20px;
    text-align: center;
}

.submit-btn {
    border-top: 1px solid #ccc;
    padding-top: 10px;
    text-align: right;
}

.small-btn {
    float: left;
    margin-top: 11px;
    height: 16px;
    width: 16px;
}
.small-btn-content,
.small-content {
    float: left;
    font-size: 14px;
    margin: 0px 10px;
    color: #000000;
}
.small-content {
    font-size: 15px;
}
.el-table thead {
    color: #000000 !important;
}
.appointment {
    width: 37px;
    height: 18px;
    font-size: 16px;
    font-family: MicrosoftYaHei-Bold;
    font-weight: 700;
    color: rgba(0, 0, 0, 1);
}
.color-item {
    display: inline-block;
    border: 1px solid #a3a3a3;
    padding: 6px 10px;
    border-radius: 6px;
    margin: 10px 10px 0 0;
}
.color-item:first-child {
    margin-left: 0;
}
</style>

<style>
.upload-head-img .crop-avatar {
    margin-top: 0 !important;
}
.pop-over .el-checkbox {
    font-size: 36px;
    margin-left: 30px;
    min-width: 200px;
}
.pop-over .el-checkbox__label {
    font-size: 16px;
}
.pop-over .el-checkbox__input {
    line-height: 15px;
}
/* .pop-over .docotor-dialog{
  width: 40%;
  margin: auto;
} */
.selectTime .el-select {
    width: 20% !important;
}
.time-select {
    margin-top: 10px;
}
.selectTime .el-row {
    text-align: center;
}
.pop-over .el-date-editor.el-input {
    width: 20%;
    margin: 10px;
}
.pop-over .bottom-text {
    text-align: right;
}
.pop-over .el-dialog__body {
    padding-bottom: 10px !important;
}
.row_class {
    background-color: #f5f7fa !important;
}
</style>