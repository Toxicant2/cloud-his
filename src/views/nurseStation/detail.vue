<template>
    <el-row class="page-container">
        <el-row class="page-main">
            <el-col :span="20">
                <partListing :id="id"/>
            </el-col>
            <el-col :span="4">
                <patient-list @getFirstId="getFirstId"/>
            </el-col>
        </el-row>
    </el-row>
</template>

<script>
import partListing from './partListing'
import patientList from './components/patientList'
export default {
    components: {
        partListing,
        patientList
    },
    data() {
        return {
            id: '',
            tabMapOpts: [
                {
                    label: '门诊患者',
                    key: 'tab1'
                }
            ]
        }
    },
    methods: {
    // 点击切换患者
        getFirstId(id) {
            this.id = id
        }
    }
}
</script>
