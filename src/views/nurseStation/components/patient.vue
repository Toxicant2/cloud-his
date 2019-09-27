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
            :value-format="'yyyy-MM-dd 00:00:00'"
            :picker-options="pickerOptions">
        </el-date-picker>
        <div class="line"></div>
        <el-input placeholder="患者姓名/处方单号" v-model="form.name" @input="handleSearch">
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
                            <span class="patient-type">{{item.patientType}}</span>
                            <span>{{item.regDate}}</span>
                            <span>{{item.doctorName}}</span>
                        </div>
                    </a>
                </li>
            </ul>
        </el-scrollbar>
    </el-card>
</template>

<script>
import { pickerOptions } from '@/utils'
export default {
    data() {
        return {
            pickerOptions,
            activeId: 1,
            height: '',
            form: {
                date: [],
                name: ''
            },
            patientList: [
                {
                    id: 1,
                    name: '刘梦刘梦刘梦刘梦刘梦刘梦刘梦刘梦刘梦刘梦刘梦',
                    sex: '女',
                    age: '20岁',
                    regDate: '2018-08-17 09:35:21',
                    doctorName: '刘行宇',
                    patientType: '初'
                }, {
                    id: 2,
                    name: '刘梦2',
                    sex: '女',
                    age: '20岁',
                    regDate: '2018-08-17 09:35:21',
                    doctorName: '刘行宇',
                    patientType: '复'
                }, {
                    id: 3,
                    name: '刘梦3',
                    sex: '女',
                    age: '20岁',
                    regDate: '2018-08-17 09:35:21',
                    doctorName: '刘行宇',
                    patientType: '初'
                }, {
                    id: 4,
                    name: '刘梦4',
                    sex: '女',
                    age: '20岁',
                    regDate: '2018-08-17 09:35:21',
                    doctorName: '刘行宇',
                    patientType: '初'
                }, {
                    id: 5,
                    name: '刘梦5',
                    sex: '女',
                    age: '20岁',
                    regDate: '2018-08-17 09:35:21',
                    doctorName: '刘行宇',
                    patientType: '初'
                }
            ]
        }
    },
    methods: {
        // 查询患者列表
        handleSearch() {
            const data = {
                startDate: this.form.date[0],
                endDate: this.form.date[1],
                name: this.form.name
            }
        },

        // 切换患者
        handleSwitchPt(id) {
            this.activeId = id
        }
    },
    created() {
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

