<template>
  <div>
    <!-- 打印 -->
        <div id="print">
            <div class="storage">
                <!-- 标题 -->
                <h1>{{this.tabData[0]?this.tabData[0].orgName:''}}{{printTitle}}</h1>
                <!-- 表单部分 -->
                <ul class="clearfix">
                    <li v-for="(item,index) in printDescribeList" :key="index">{{item.label}}：{{describeData[item.value]}}</li>
                </ul>
                <!-- 表格部分 -->
                <table border="1" cellspacing="0" align="center">
                    <tr>
                        <th v-for="(item,index) in tabColumns" :key="index">{{ item.label }}</th>
                    </tr>
                    <template v-if="tabData.length > 0">
                        <tr v-for="(item,index) in tabData" :key="index">
                            <td v-for="(itemContent,indexContent) in tabColumns" :key="indexContent">
                            {{ itemContent.value === 'expiryDate'? item[itemContent.value].split(' ')[0]:item[itemContent.value] }}
                            </td>
                        </tr>
                        <tr>
                            <td v-for="(item,index) in tabColumns" :key="index">{{total[index]}}</td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td :colspan="tabColumns.length">暂无数据</td>
                    </tr>
                </table>
            </div>
        </div>
  </div>
</template>
<script>
import { remove_ie_header_and_footer } from '@/utils/print'
export default {
    props: {
        printDescribeList: {
            type: Array
        },
        describeData: {
            type: Object
        },
        tabColumns: {
            type: Array
        },
        tabData: {
            type: Array
        }
    },
    methods: {
        // 打印方法
        handlePrint() {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                remove_ie_header_and_footer()
            }
            const Print = document.getElementById('print')
            const newContent = Print.innerHTML
            var style = `
                    <style type='text/css'>
                        body{
                            width:108% !important;
                        }
                    </style>`
            const oldContent = document.body.innerHTML
            document.body.innerHTML = newContent + style
            window.print()
            window.location.reload()
            document.body.innerHTML = oldContent
            return false
        }
    }
}
</script>
<style>

</style>
