<template>
    <el-card class="patient-list" :style="{height:`${height}px`}">
        <el-date-picker
            v-model="form.date"
            type="daterange"
            align="right"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleSearch"
            :format="'yyyy-MM-dd'"
            :value-format="'yyyy-MM-dd'"
            :picker-options="pickerOptions">
        </el-date-picker>
        <div class="line"></div>
        <el-input placeholder="患者姓名/处方单号" v-model="form.inquiry" @input="handleSearch">
            <template slot="append">
                <el-button icon="el-icon-search" @click="handleSearch"></el-button>
            </template>
        </el-input>
        <el-scrollbar :style="{height:`${height - 100}px`}">
            <ul class="list">
                <li v-for="(item,index) in patientList" :key="index">
                    <a href="javascript:void(0);" :class="{'is-active':activeId === item.id}" @click="handleSwitchPt(item.id)">
                        <div>
                            <span class="name">{{item.name}}</span>
                            <span>{{item.sex}}</span>
                            <span>{{item.age}}</span>
                        </div>
                        <div>
                            <span>{{item.regDate?item.regDate.split(' ')[0]:''}}</span>
                            <span>{{item.createUserName}}</span>
                        </div>
                    </a>
                </li>
            </ul>
        </el-scrollbar>
    </el-card>
</template>

<script>
import { pickerOptions } from '@/utils'
import { getCurrentDay } from '@/utils/common'
import { getNurseStationPatientList } from '@/api/outpatient'
import {
    formatSex
} from '@/utils'
export default {
    data() {
        return {
            pickerOptions,
            activeId: 1,
            height: '',
            form: {
                date: [],
                inquiry: ''
            },
            patientList: [
            ]
        }
    },
    methods: {
        // 查询患者列表
        handleSearch() {
            const data = {
                startDate: this.form.date ? this.form.date[0] : '',
                endDate: this.form.date ? this.form.date[1] : '',
                inquiry: this.form.inquiry
            }
            getNurseStationPatientList(data).then(res => {
                if (res.STATUS === '1') {
                    this.patientList = res.ITEMS
                    if (this.patientList.length > 0) {
                        this.patientList.forEach(item => {
                            item.sex = formatSex(item.sex)
                        })
                        this.activeId = this.patientList[0].id
                        this.$emit('getFirstId', this.patientList[0].id)
                    }
                }
            })
        },

        // 切换患者
        handleSwitchPt(id) {
            this.activeId = id
            this.$emit('getFirstId', id)
        }
    },
    created() {
        if (this.form.date || !this.form.date[0]) {
            this.form.date[0] = getCurrentDay().split(' ')[0]
        }
        if (this.form.date || !this.form.date[1]) {
            this.form.date[1] = getCurrentDay().split(' ')[0]
        }
        this.handleSearch()
        const offsetHeight = document.body.offsetHeight
        this.height = offsetHeight - 180
    }
}
</script>

<style lang="scss" scoped>
    $height: 15px;
    .patient-list{
        width: 100%;
        font-size: 14px;
        /deep/
        .el-card__body{
            padding: $height;
        }
        .line{
            height: $height;
        }
        .list{
            li{
                a{
                    display: block;
                    margin-top: $height;
                    width: 100%;
                    border:1px solid #c6c6c6;
                    padding: 5px 10px;
                    border-radius: 3px;
                    background-color: #efefef;
                    &:hover{
                        border: 1px solid #409EFF;
                    }
                    .patient-type{
                        display: inline-block;
                        border: 1px solid #333;
                        padding: 0 2px;
                        border-radius: 3px;
                        line-height: 18px;
                    }
                    &.is-active{
                        border: 1px solid #409EFF;
                        background-color: #409EFF;
                        color: #FFF;
                        .patient-type{
                            border: 1px solid #FFF;
                        }
                    }
                    div{
                        line-height: 28px;
                        .name{
                            display: inline-block;
                            font-size:18px;
                            font-weight: bold;
                            margin-right: 5px;
                            max-width: 120px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        span{
                            display: inline-block;
                            vertical-align: middle;
                            &:not(:last-child){
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>

