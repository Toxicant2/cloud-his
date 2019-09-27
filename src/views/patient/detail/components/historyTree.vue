<template>
    <el-scrollbar style="height:755px;">
        <div class="steps">
            <div v-for="(item,index) in stepList" :key="index" :style="{'flexBasis':space}" :class="{'is-active':index === active}" class="step" @click="handleClick(item,index)">
                <div class="step_header">
                    <div class="step_line"></div>
                    <div class="step_icon">
                        <div class="step_round"></div>
                    </div>
                </div>
                <div class="step_main">
                    <p>{{ item.regDate }}</p>
                    <p>{{ item.doctorName }}</p>
                    <p>{{ item.orgName }}</p>
                </div>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
export default {
    props: {
        stepList: {
            type: Array
        },
        space: {
            type: String,
            default: '115px'
        }
    },
    data() {
        return {
            active: 0
        }
    },
    methods: {
        handleClick(item, index) {
            if (this.active === index) return false
            this.active = index
            this.$emit('handleClick', item)
        }
    }
}
</script>

<style lang="scss" scoped>
.steps {
    display: flex;
    flex-flow: column;
    height: 100%;
    color: #586276;
    .step {
        display: flex;
        cursor: pointer;
        &:last-child {
        .step_line {
            display: none;
        }
        }
        &.is-active {
        .step_header {
            color: #409eff;
            border-color: #409eff;
            .step_icon .step_round,
            .step_line {
            background-color: #409eff;
            }
        }
        .step_main {
            color: #fff;
            border-color: #409eff;
            background-color: #409eff;
            &:after,
            &:before {
            border-right-color: #409eff;
            }
        }
        }
        .step_header {
        position: relative;
        flex-grow: 0;
        width: 18px;
        color: #b1b1b1;
        border-color: #b1b1b1;
        top: 15px;
        .step_line {
            position: absolute;
            border-color: inherit;
            background-color: #c0c4cc;
            width: 1px;
            top: 14px;
            bottom: -14px;
            left: 9px;
        }
        .step_icon {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            font-size: 14px;
            background: #fff;
            transition: 0.15s ease-out;
            border-radius: 50%;
            border: 1px solid;
            border-color: inherit;
            .step_round {
            width: 6px;
            height: 6px;
            background-color: #b1b1b1;
            border-radius: 50%;
            }
        }
        }
        .step_main {
        position: relative;
        margin-left: 20px;
        margin-bottom: 20px;
        padding: 10px;
        line-height: 24px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        &:after,
        &:before {
            content: "";
            position: absolute;
            width: 0px;
            height: 0px;
            border: transparent solid;
        }
        &:before {
            border-width: 6px;
            border-right-color: #ccc;
            top: 20px;
            left: -12px;
        }
        &:after {
            border-width: 4px;
            border-right-color: #fff;
            top: 22px;
            left: -8px;
        }
        }
    }
}
</style>
