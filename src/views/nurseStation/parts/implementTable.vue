<template>
    <div>
        <!-- 表格部分 -->
        <table border="1" class="gridtable">
            <tbody>
                <tr>
                    <th rowspan="2" style="width:45px;">序号</th>
                    <th colspan="2" style="width:100px">转抄医嘱</th>
                    <th rowspan="2">医嘱内容</th>
                    <th colspan="8">执行</th>
                </tr>
                <tr>
                    <th style="width:150px;">日期时间</th>
                    <th style="width:70px;">开单人</th>
                    <th>日期时间</th>
                    <th>签名</th>
                    <th>日期时间</th>
                    <th>签名</th>
                    <th>日期时间</th>
                    <th>签名</th>
                    <th>日期时间</th>
                    <th>签名</th>
                </tr>
                <template v-for="(obj,parIndex) in dataList">
                    <tr v-for="(itemObj,index) in obj.obj" :key="index">
                        <template v-if="index == 0 ">
                            <td :rowspan="obj.obj.length">{{parIndex+1}}</td>
                        </template>
                        <td>{{itemObj.createTime}}</td>

                        <td>{{itemObj.createUserName}}</td>

                        <td v-if="(itemObj.groupSn || itemObj.groupSn == 0) && ( (index == 0 || itemObj.groupSn!=obj.obj[index-1].groupSn ) )" style="text-align:left">

                            <font v-if="index!=obj.obj.length-1 && itemObj.groupSn == obj.obj[index+1].groupSn"> ┌ </font>

                            {{itemObj.itemName}}&ensp;{{itemObj.dosage}} {{itemObj.dosageUnit}}&ensp;{{itemObj.usage}}&ensp;{{itemObj.frequency}}
                            <font v-if="itemObj.days>1">
                                {{itemObj.days}}天
                            </font>
                        </td>

                        <td v-if="(itemObj.groupSn || itemObj.groupSn == 0)&&(index != 0 &&  itemObj.groupSn==obj.obj[index-1].groupSn )&& (index != obj.obj.length-1 &&  itemObj.groupSn==obj.obj[index+1].groupSn)" style="text-align:left">
                            |
                            {{itemObj.itemName}}&ensp;{{itemObj.dosage}}{{itemObj.dosageUnit}}&ensp;{{itemObj.usage}}&ensp;{{itemObj.frequency}}
                            <font v-if="itemObj.days>1">
                                {{itemObj.days}}天
                            </font>
                        </td>

                        <td v-if="(itemObj.groupSn || itemObj.groupSn == 0)&&  (index!=0 && itemObj.groupSn==obj.obj[index-1].groupSn ) && (index != obj.obj.length-1&& itemObj.groupSn!=obj.obj[index+1].groupSn)" style="text-align:left">
                            └
                            {{itemObj.itemName}}&ensp;{{itemObj.dosage}}{{itemObj.dosageUnit}}&ensp;{{itemObj.usage}}&ensp;{{itemObj.frequency}}
                            <font v-if="itemObj.days>1">
                                {{itemObj.days}}天
                            </font>
                        </td>

                        <td v-if="(itemObj.groupSn || itemObj.groupSn == 0)&&  (index!=0 && itemObj.groupSn==obj.obj[index-1].groupSn ) && index === obj.obj.length-1" style="text-align:left">
                            └
                            {{itemObj.itemName}}&ensp;{{itemObj.dosage}}{{itemObj.dosageUnit}}&ensp;{{itemObj.usage}}&ensp;{{itemObj.frequency}}
                            <font v-if="itemObj.days>1">
                                {{itemObj.days}}天
                            </font>
                        </td>

                        <td v-if="!(itemObj.groupSn || itemObj.groupSn == 0)" style="text-align:left">
                            {{itemObj.itemName}}&ensp;{{itemObj.dosage}}{{itemObj.dosageUnit}}&ensp;{{itemObj.usage}}&ensp;{{itemObj.frequency}}
                            <font v-if="itemObj.days>1">
                                {{itemObj.days}}天
                            </font>
                        </td>

                        <!-- <td  style="text-align:left">
               <font>
                └ {{itemObj.groupSn}}
              </font>

               {{itemObj.itemName}} &ensp; {{itemObj.dosage}}{{itemObj.dosageUnit}}
              <font v-if="itemObj.days>1">
                {{itemObj.days}}天
              </font>
            </td> -->

                        <!-- <td style="text-align:left">
              <font v-if="itemObj.groupSn">
                  │  {{itemObj.groupSn}}
              </font>

               {{itemObj.itemName}} &ensp; {{itemObj.dosage}}{{itemObj.dosageUnit}}
              <font v-if="itemObj.days>1">
                {{itemObj.days}}天
              </font>
            </td> -->

                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </template>
                <template v-if="dataList.length>0">
                    <tr class="fillTable" v-for="i in 31-dataList[dataList.length-1].length">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    props: {
        dataList: {
            type: Array
        }
    }
}
</script>
<style  lang="scss" scoped>
table.gridtable {
    font-family: verdana, arial, sans-serif;
    font-size: 11px;
    width: 100%;
    margin-top: 15px;
    color: #333333;
    border-width: 1px;
    border-color: #666666;
    border-collapse: collapse;
    th {
        border-width: 1px;
        padding: 8px;
        border-style: solid;
        border-color: #666666;
        // background-color: #dedede;
    }
    td {
        border-width: 1px;
        padding: 8px;
        height: 30px;
        text-align: center;
        border-style: solid;
        border-color: #666666;
        background-color: #ffffff;
    }
}
</style>
<style>
@media screen {
    .fillTable {
        display: none;
    }
}

@media print {
    .fillTable {
        display: table-row;
    }
}
</style>

