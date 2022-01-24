<template>
  <div class="container">
    <h3 v-show="isEdit" class="title">{{ currentPlan && currentPlan.name }}</h3>
    <!--表格区域-->
    <div class="table-part" v-show="!isEdit">
      <!-- 搜索组件 -->
      <table-search
        :buttonName="'添加航线'"
        :placeholder="'请输入计划航线名称'"
        @keydownEnter="keywordSearch"
        @buttonSearch="keywordSearch"
        @handleDrag="addPlanDialog"
        @clear="keyword=''"
      >
      </table-search>
      <!-- 表格 -->
      <my-table
        :showHeader="false"
        :tableIndex="false"
        :total="total"
        :tableLoading="tableLoading"
        :tableData="tableData"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        :paginationOptions="paginationOptions"
        @rowClick="handleRowClick"
        @buttonClick="clickButton"
        @pageChange="pageChange"
      ></my-table>
    </div>
    <!-- 编辑按钮区域 -->
    <div class="plan-edit" v-show="isEdit">
      <el-button type="warning" @click="reversePoint">反转航线方向</el-button>
      <el-button type="primary" @click="updateRoute">确认上传</el-button>
      <el-button type="danger" @click="cancelEdit">取消编辑</el-button>
    </div>
    <!--计划对话框-->
    <!-- 添加航线 -->
    <add-dialog 
      :addlogVisible="addlogVisible"
      @getAddForm="addPlan"
    ></add-dialog>
    <!-- 修改计划信息 -->
    <template v-if="editlogVisible">
      <edit-dialog
        :editlogVisible="editlogVisible"
        :editForm="currentPlan"
        @getEditForm="handleTableInfo"></edit-dialog>
    </template>
    <!-- 执行计划 -->
    <template v-if="actionlogVisible">
      <action-dialog
        :actionlogVisible=actionlogVisible
        :planId=currentPlan.id>
      </action-dialog>
    </template>
    
    <!--地图-->
    <Map :isEdit="isEdit" @getLngLat="getLngLat">
      <template #plan>
        <!--坐标点-->
        <template v-if="pointList.length">
          <el-amap-marker
            v-for="point in pointList"
            :key="point.order"
            :draggable="true"
            :offset="offset">
            <div class="marker" @click="clickPoint">
              <p>3</p>
            </div>
          </el-amap-marker>

          <el-amap-marker :position="[106.551342, 29.592314]" :offset="offset">
            <div class="precise-marker" @click="clickPoint">
              <p>299</p>
            </div>
          </el-amap-marker>
        </template>
        <!--计划航线-->
        <template>
          <el-amap-polyline
            :path="[
              [106.556342, 29.592314],
              [106.551342, 29.592314]
            ]"
          >
          </el-amap-polyline>
        </template>
      </template>
    </Map>
  </div>
</template>

<script>
// 地图组件
import Map from 'components/amap/Amap';
// 表格
import MyTable from 'components/common/table/Mytable';
import TableSearch from 'components/common/table-search/TableSearch';
// dialog对话框
import AddDialog from './components/AddDialog.vue';
import EditDialog from './components/EditDialog.vue';
import ActionDialog from './components/ActionDialog.vue';

import { confirmMsg, deepClone } from '@/utils';
// import {  }
// 常量
import { PAGE_SIZE } from '@/config';
// api
import { apiGetPlan, apiPostPlanInfo, apiPostDeletePlan } from 'api/plan';

export default {
  components: {
    Map, MyTable, TableSearch, AddDialog, EditDialog, ActionDialog
  },
  data () {
    return {
      // 表格数据
      tableData: [],
      total: 0,
      tableLoading: false,
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'id', label: 'id', width: 60 },
        { prop: 'name', label: 'name', width: 180 },
      ]),
      // 操作配置
      tableOption: Object.freeze({
        label: '操作',
        options: [
          {
            label: '执行计划',
            type: 'success',
            size: 'mini',
            methods: this.executePlanConfig
          },
          {
            label: '修改信息',
            type: 'warning',
            size: 'mini',
            methods: this.changePlanInfo
          },
          {
            label: '编辑航线',
            type: 'primary',
            size: 'mini',
            methods: this.editPlanRoute
          },
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.deletePlan
          }
        ]
      }),
      // 分页配置
      paginationOptions: {
        page: PAGE_SIZE.page,
        size: PAGE_SIZE.size,
        isSmall: true
      },
      keyword: '',
      // 是否正在编辑
      isEdit: false,
      // 当前计划
      currentPlan: null,
      // 原始计划数据
      originPlanData: null,
      
      /********************* 计划dialog *********************/
      addlogVisible: false,
      editlogVisible: false,
      actionlogVisible: false,
      /********************* 地图相关 *********************/
      // marker偏移量
      offset: [-16, -31],
      // 坐标点
      pointList: [],
      point: {
        location: {
          latitude: null,
          longitude: null
        },
        order: null,
        requirePrecisionNavigation: false
      },
    }
  },
  methods: {
    // 获取计划列表
    async getPlanList () {
      this.tableLoading = true;
      const { data: res } = await apiGetPlan({
        page: this.paginationOptions.page,
        size: 10,
        'Condition.Keyword': this.keyword
      });
      this.tableLoading = false;
      this.tableData = res.result;
      this.total = res.total;
    },
    // 关键字搜索
    keywordSearch(keyword) {
      this.keyword = keyword;
      this.getPlanList();
    },
    // 翻页
    pageChange(page) {
      this.paginationOptions.page = page;
      this.getPlanList();
    },
    // 添加航线弹框信息 
    addPlanDialog () {
      this.addlogVisible = true;
    },
    // 添加计划
    addPlan (planForm) {
      this.isEdit = true;
      this.addlogVisible = false;
      this.currentPlan = planForm;
      this.currentPlan.fixes = this.pointList;
    },
    // 修改表格信息
    async handleTableInfo (form) {
      const res = await apiPostPlanInfo(form);
      if (!res.errorCode) {
        this.$message.success('计划信息修改成功！');
        this.editlogVisible = false;
        this.getPlanList();
      } else {
        this.$message.warning(res.message);
      }
    },
    // 点击行
    handleRowClick (row) {
      console.log(row)
      this.currentPlan = row;
      this.pointList = row.fixes;
    },
    // 点击操作按钮
    clickButton (option) {
      option.event.stopPropagation();
      option.methods.call(this, option.row);
    },
    // 修改计划信息
    changePlanInfo (row) {
      this.editlogVisible = true;
      this.currentPlan = row;
      this.pointList = row.fixes;
    },
    // 编辑航线
    editPlanRoute (row) {
      console.log(row)
      // 保存初始数据
      this.originPlanData = deepClone(row);
      this.currentPlan = row;
      this.pointList = row.fixes;
      this.isEdit = true;
    },
    // 执行计划
    executePlanConfig (row) {
      this.currentPlan = row;
      this.pointList = row.fixes;
      this.actionlogVisible = true;
    },
    // 删除计划
    async deletePlan (row) {
      const cf = await confirmMsg(this, row.name);
      if (cf === 'cancel') return;
      const res = await apiPostDeletePlan(row.id);
      if (!res.errorCode) {
        this.$message.success(`${row.name} 删除成功！`);
        this.tableData.filter(v => v.id != row.id);
      }
    },
    // 反转航线方向
    reversePoint() {},
    // 更新计划航线
    updateRoute() {},
    // 取消编辑
    cancelEdit() {
      this.isEdit = false;
    },

    /********************* 地图相关 *********************/
    // 获取经纬度
    getLngLat(data) {
      this.point.location.latitude = data.lat;
      this.point.location.longitude = data.lng;
      this.point.order = this.pointList.length + 1;
      this.$set(this.pointList, this.pointList.length, this.point);
    },
    clickPoint () {
      console.log('点击了坐标点!');
    }
  },
  watch: {
  },
  created () {
    this.getPlanList();
  }
}
</script>

<style lang="less" scoped>
@elColor: #409eff;
@markerPath: '../../assets/img/map/marker.png';
@preciseMarkerPath: '../../assets/img/map/precise-marker.png';
@markerSize: 32px;

.container {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
  .title {
    position: absolute;
    top: 0;
    left: 8px;
    z-index: 1;
    color: #f5f0f0;
    text-shadow: 1px 1px 0 #333, -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333;
  }
}

/***************表格区域***************/
.table-part {
  position: absolute;
  top: 0;
  left: 0;
  width: 500px;
  overflow: hidden;
  z-index: 1;
  background-color: #f0f0f0;
  .el-header {
    padding: 0;
    height: 30px !important;
    text-align: center;
  }
  /deep/ .el-row {
    width: 900px;
  }
  /deep/ .el-table--small .el-table__cell {
    padding: 3px 0;
    user-select: none;
  }
  /deep/ .el-button--mini,
  .el-button--mini.is-round {
    padding: 5px 3px;
  }
  /deep/ .el-pagination {
    margin-top: 0 !important;
    text-align: center;
  }
  /deep/ .el-pagination__sizes {
    display: none;
  }
}

/***************编辑按钮区域***************/
.plan-edit {
  position: absolute;
  bottom: 8px;
  left: 90px;
  z-index: 1;
}
/*************** 地图相关 ***************/
/* 坐标点 */
.marker,
.precise-marker {
  position: relative;
  width: @markerSize;
  height: @markerSize;
  background: url(@markerPath);
  p {
    display: inline-block;
    width: 100%;
    font-size: 12px;
    color: #fafafa;
    text-align: center;
  }
}
.precise-marker {
  background: url(@preciseMarkerPath);
}
</style>