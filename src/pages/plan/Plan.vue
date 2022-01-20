<template>
  <div class="container">
    <!--表格区域-->
    <div class="table-part">
      <!-- <el-header>table</el-header> -->
      <!-- 搜索组件 -->
      <table-search
        :buttonName="'添加航线'"
        :placeholder="'请输入计划航线名称'"
        @buttonSearch="handleButtonSearch"
        @handleDrag="handleButtonDrag"
      >
      </table-search>
      <!-- 表格 -->
      <MyTable
        :showHeader="false"
        :tableIndex="false"
        :total="total"
        :tableLoading="tableLoading"
        :tableData="tableData"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        :paginationOptions="paginationOptions"
      ></MyTable>
    </div>

    <!--地图-->
    <Map>
      <template #plan>
        <!--坐标点-->
        <template>
          <el-amap-marker :position="[106.556342, 29.592314]" :draggable="true" :offset="offset">
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
// 导入地图组件
import Map from 'components/amap/Amap';
// 导入表格
import MyTable from 'components/common/table/Mytable';
import TableSearch from 'components/common/table-search/TableSearch';
import { PAGE_SIZE } from '@/config'
import { apiGetPlan } from 'api/plan';

export default {
  components: {
    Map, MyTable, TableSearch
  },
  data () {
    return {
      // 表格搜索框样式
      tableSearchStyle: {
        width: '200px',
        marginRight: '50px'
      },
      // 表格数据
      tableData: [],
      total: 0,
      tableLoading: false,
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'id', label: 'id', width: 60 },
        { prop: 'name',label: 'name', width: 180},
      ]),
      // 操作配置
      tableOption: Object.freeze({
        label: '操作',
        options: [
          {
            label: '修改信息',
            type: 'warning',
            size: 'mini',
            methods: this.handleTableInfo
          },
          {
            label: '编辑航线',
            type: 'primary',
            size: 'mini',
            methods: this.handleTableInfo
          },
          {
            label: '执行计划',
            type: 'success',
            size: 'mini',
            methods: this.handleTableInfo
          },
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.handleTableInfo
          }
        ]
      }),
      // 分页配置
      paginationOptions: {
        page: PAGE_SIZE.page,
        size: PAGE_SIZE.size,
        isSmall: true
      },
      /********************* 地图相关 *********************/
      // marker偏移量
      offset: [-16, -31]
    }
  },
  methods: {
    // 搜索关键字
    handleButtonSearch() {

    },
    // 添加航线弹框信息 
    handleButtonDrag() {

    },
    // 修改表格信息
    handleTableInfo() {
      console.log('修改信息');
    },
    clickPoint () {
      console.log('点击了坐标点!');
    }
  },
  created () {
    apiGetPlan({
      Page: 1,
      Size: 10
    }).then(({ data: res}) => {
      this.tableData = res.result;
      this.total = res.total;
    })
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
}

/***************表格区域***************/
.table-part {
  position: absolute;
  top: 0;
  left: 0;
  width: 500px;
  height: 400px;
  overflow: hidden;
  z-index: 1;
  background-color: #e7e7e7;
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
  /deep/ .el-button--mini, .el-button--mini.is-round {
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