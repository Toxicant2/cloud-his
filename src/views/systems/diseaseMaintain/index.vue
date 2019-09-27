<template>
  <el-row class="page-container">
    <el-row class="page-main">
      <!-- 首页 -->
      <template v-if="active === 'main'">
        <direct-search
          ref="form"
          :label-position="'center'"
          :label-width="labelWidth?labelWidth:'80px'"
          :form-style="{'text-align':'left','margin':'10px 0px 20px 0'}"
          :forms="searchList"
          @handleSearch="handleFormSearch"
          v-loading="loading"
        />
        <el-table-self
          :list-loading="listLoading"
          :tabType="'index'"
          :tab-label="'序号'"
          :table-data="tabData"
          :columns="tabColumns"
          :total-count="totalCount"
          :page-sizes="pageSizes"
          :current-page="pageIndex"
          :page-size="pageSize"
          @pageSizeChange="handleSizeChange"
          @currentPageChange="handleCurrentChange"
          @handleSearch="handleFormSearch"
        />
      </template>
      <!-- 按疾病类别下载 -->
      <template v-else>
        <p class="title-right">
          <span class="title">疾病下载</span>
          <el-button plain icon="el-icon-arrow-left" @click="backList">返回</el-button>
        </p>
        <download-list :options="options"></download-list>
      </template>
      <!-- 引用其他诊所目录 -->
      <el-dialog
        title="引用其他诊所目录"
        :visible.sync="centerDialogVisible"
        width="30%"
        center
        @close="close"
      >
        <template v-if="orgOptions.length > 0">
          <p class="otherclinicDia">请选择引用的诊所疾病目录：</p>
          <el-radio-group v-model="orgCatalog">
            <el-radio
              :label="item.orgId"
              v-for="(item,index) in orgOptions"
              :key="index"
            >{{item.label}}</el-radio>
          </el-radio-group>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="appointCatalog" :loading="loading">下载</el-button>
          </span>
        </template>
        <template v-else>
          <p style="font-size:16px;text-align:center">暂无可引用的诊所目录</p>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="centerDialogVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-row>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </el-row>
</template>

<script>
import directSearch from "@/components/FormComponents/directSearch";
import elTableSelf from "@/components/TabComponents/index";
import paginationMixin from "@/components/TabComponents/mixin";
import downloadList from "./components/downloadList";
import {
  getDiagnosticListByPage,
  enable,
  getDiseaseListByType,
  downloadByClinic
} from "@/api/catalog";
import { getUserClinic } from "@/api/org";
export default {
  components: {
    directSearch,
    elTableSelf,
    paginationMixin,
    downloadList
  },
  mixins: [paginationMixin],
  data() {
    return {
      centerDialogVisible: false,
      radio2: 3,
      searchList: [
        {
          type: "cascader",
          prop: "type",
          label: "分类",
          showLevel: false,
          width: "400px",
          changeSelect: true,
          options: []
        },
        {
          type: "input",
          slot: {
            type: "button",
            slot: "append",
            icon: "el-icon-search"
          },
          prop: "name",
          label: "",
          placeholder: "疾病名称",
          labelWidth: "auto"
        },
        {
          type: "select",
          prop: "status",
          label: "状态",
          opts: [
            {
              value: "",
              label: "全部"
            },
            {
              value: 1,
              label: "启用"
            },
            {
              value: 0,
              label: "停用"
            }
          ],
          width: "100px"
        },
        {
          type: "button",
          value: "+ 疾病下载",
          color: "primary",
          labelWidth: "auto",
          func: this.download,
          itemValue: "byType"
        },

        {
          type: "button",
          value: "+ 引用目录",
          color: "primary",
          labelWidth: "auto",
          func: this.open
        }
      ],
      listLoading: false,
      tabData: [],
      tabColumns: [
        {
          label: "主要编码",
          value: "code",
          width: 100
        },
        {
          label: "疾病名称",
          value: "name"
        },
        {
          label: "拼音码",
          value: "pyCode"
        },
        {
          label: "说明",
          value: "note"
        },
        //   {
        //       label: '排序',
        //       operType: 'button',
        //       operations: [
        //           {
        //               label: '上移',
        //               type: 'text',
        //               func: this.handleDelete
        //           },
        //           {
        //               label: '下移',
        //               type: 'text',
        //               func: this.handleDelete
        //           },
        //           {
        //               label: '置顶',
        //               type: 'text',
        //               func: this.handleDelete
        //           },
        //           {
        //               label: '置底',
        //               type: 'text',
        //               func: this.handleDelete
        //           }
        //       ],
        //       width: 200
        //   },
        {
          label: "操作",
          operType: "button",
          operations: [
            {
              func: this.handleEnable,
              formatter(row) {
                return {
                  label: row.isUse === 1 ? "停用" : "启用",
                  type: row.isUse === 1 ? "danger" : "primary"
                };
              }
            }
          ],
          width: 100
        }
      ],
      labelWidth: "",
      totalCount: 1,
      active: "main",
      smallTitle: "",
      cacheForm: {},
      options: [],
      orgOptions: [],
      orgCatalog: "",
      loading: false
    };
  },
  methods: {
    handleFormSearch(form) {
      this.pageIndex = 1;
      this.handleSearch(form);
    },
    handleSearch(form) {
      this.cacheForm = form || this.cacheForm;
      const d = Object.assign(this.cacheForm, form);
      let params = {};
      if (d) {
        params = {
          code:
            d.type && d.type.length > 0 && d.type[d.type.length - 1]
              ? d.type[d.type.length - 1]
              : "",
          name: d.name,
          isUse: d.status
        };
      }

      this.tabData = [];
      params.pageNo = this.pageIndex;
      params.pageSize = this.pageSize;
      getDiagnosticListByPage(params).then(res => {
        if (res.STATUS === "1") {
          const d = res.ITEMS;
          const result = [];
          let total = 0;
          if (d.total > 0) {
            total = d.total;
            d.records.forEach(item => {
              result.push({
                code: item.classCode,
                name: item.name,
                pyCode: item.spellCode,
                note: item.note,
                isUse: item.isUse,
                id: item.id
              });
            });
          }

          this.tabData = result;
          this.totalCount = total;
        }
      });
    },

    // 下载 按钮
    download() {
      this.active = "downLoad";
      this.options = this.searchList[0].options;
    },
    // 返回
    backList() {
      this.active = "main";
      this.cacheForm = {};
      this.pageIndex = 1;
      this.handleSearch();
    },
    open() {
      this.getOptions();
      this.centerDialogVisible = true;
    },
    close() {
      this.orgCatalog = "";
      this.loading = false;
    },
    //   引用目录下载
    appointCatalog() {
      if (this.orgCatalog) {
        this.loading = true;
        downloadByClinic(this.orgCatalog).then(res => {
          if (res.STATUS === "1") {
            this.loading = false;
            this.$message.success(res.MESSAGE);
            this.orgCatalog = "";
            this.centerDialogVisible = false;
            this.handleSearch();
          }
        });
      } else {
        this.$message.warning("请先选择要引用的诊所");
        return;
      }
    },
    // 启用停用
    handleEnable(row) {
      this.$confirm(
        `是否确认将【${row.name}】修改为【${
          row.isUse === 1 ? "停用" : "启用"
        }】状态？`,
        "修改状态提示",
        {
          type: "warning"
        }
      )
        .then(() => {
          const data = {
            id: row.id,
            isUse: row.isUse === 1 ? 0 : 1
          };
          enable(data).then(res => {
            if (res.STATUS === "1") {
              this.handleSearch();
              this.$message.success("修改成功");
            }
          });
        })
        .catch(() => {});
    },

    // 获取三级分类
    getTypeList() {
      const options = [];
      let list = JSON.parse(localStorage.getItem("diseaseTypeList"));
      if (!list) {
        this.loading = true;
        getDiseaseListByType().then(res => {
          this.loading = false;
          if (res.STATUS === "1") {
            const d = res.ITEMS;
            if (d && d.length > 0) {
              localStorage.setItem("diseaseTypeList", JSON.stringify(d));
              list = JSON.parse(localStorage.getItem("diseaseTypeList"));
            }
          }
          this.$nextTick(() => {
            this.recursion(list, options);
          });
        });
      } else {
        this.recursion(list, options);
      }
    },

    // 分类
    recursion(row, options) {
      if (row && row.length > 0) {
        row.forEach((firstD, fIndex) => {
          if (firstD.childList && firstD.childList.length > 0) {
            options.push({
              value: firstD.code,
              label: firstD.name,
              children: []
            });
            firstD.childList.forEach((secondD, sIndex) => {
              if (secondD.childList && secondD.childList.length > 0) {
                options[fIndex].children.push({
                  value: secondD.code,
                  label: secondD.name,
                  children: []
                });
                secondD.childList.forEach(thirdD => {
                  if (thirdD.childList && thirdD.childList.length > 0) {
                    options[fIndex].children[sIndex].children.push({
                      value: thirdD.code,
                      label: thirdD.name,
                      children: []
                    });
                  } else {
                    options[fIndex].children[sIndex].children.push({
                      value: thirdD.code,
                      label: thirdD.name
                    });
                  }
                });
              } else {
                options[fIndex].children.push({
                  value: secondD.code,
                  label: secondD.name
                });
              }
            });
          } else {
            options.push({
              value: firstD.code,
              label: firstD.name
            });
          }
        });
      }

      this.searchList[0].options = options;
    },

    //   获取其他诊所目录
    getOptions() {
      this.orgOptions = [];
      const id = this.$store.getters.clinic.orgId;
      getUserClinic().then(res => {
        if (res.STATUS === "1") {
          const d = res.ITEMS;
          if (d && d.length > 0) {
            d.forEach(item => {
              if (item.id !== id) {
                this.orgOptions.push({
                  orgId: item.id,
                  label: item.name
                });
              }
            });
          }
        }
      });
    }
  },
  mounted() {
    this.handleSearch();
    this.getTypeList();
  }
};
</script>

<style scoped lang='scss'>
.title-right {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}
.otherclinicDia {
  font-size: 16px;
  height: 30px;
  line-height: 30px;
  margin-top: -20px;
}
.el-radio {
  display: block;
  margin-top: 13px;
  margin-left: 5px !important;
}
</style>

