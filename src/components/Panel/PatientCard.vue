<template>
    <div class="patient">
        <el-row :gutter="20">
            <el-col :xs="8" :sm="4" :md="24" class="avatar-view">
                <div class="p-relative">
                    <span v-show="patient.vip" class="icon-vip" />
                </div>
                <img v-if="patient.avatar" :src="patient.avatar" alt="头像">
            </el-col>
            <el-col :xs="8" :sm="20" :md="24">
                <template v-if="nameCanClick">
                    <el-button type="text" class="profile-name" @click="handleToPatient">{{ patient.name }}<i class="el-icon-edit-outline" /></el-button>
                </template>
                <template v-else>
                    <h2 class="profile-name-h2">
                        {{ patient.name }}
                    </h2>
                </template>
                <div v-if="panelEllist.btnList" class="btn-list">
                    <el-button v-for="btn in panelEllist.btnList" :key="btn.name" @click="btn.func()">{{ btn.name }}</el-button>
                </div>
                <ul class="li-list" :style="liListStyle">
                    <li v-for="li in panelEllist.liList" :key="li.value">
                        <span>{{ li.name }}：{{ patient[li.value] }}
                            <span v-if="li.unit && patient[li.value]">{{ li.unit }}</span>
                        </span>
                    </li>
                </ul>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    props: {
        patient: { type: Object },
        panelEllist: { type: Object, required: true },
        nameCanClick: { type: Boolean, default: false },
        liListStyle: String
    },
    methods: {
        handleToPatient() {
            this.$emit('panelNameClick')
        }
    }
}
</script>

<style lang="scss" scoped>
h2 {
    width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.patient {
    width: 100%;
    overflow: hidden;
    .avatar-view {
        img {
            display: block;
            width: 200px;
            max-width: 100%;
            height: auto;
            margin: auto;
            margin-bottom: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 4px;
            transition: all 0.2s ease-in-out;
        }
    }
    .profile-name {
        font-size: 18px;
        i{
            margin-left: 10px;
        }
    }
    @media screen and (max-width: 992px) {
        .li-list {
            li {
                border-bottom: 0 !important;
                display: inline-block;
                span {
                    padding-right: 10px;
                }
            }
        }
        .btn-list {
            .el-button + .el-button {
                margin-left: 10px !important;
            }
        }
    }
    @media screen and (max-width: 1027px) {
        .btn-list {
            .el-button + .el-button {
                margin-left: 0;
                margin-top: 5px;
            }
        }
    }
    .li-list {
        font-size: 14px;
        line-height: 1.6;
        margin-top: 10px;
        li {
            padding: 5px 0;
            border-bottom: 1px solid #e7e7e7;
            &:first-child {
                padding-top: 0;
            }
        }
    }
    .btn-list {
        margin: 10px 0;
    }
}
</style>

