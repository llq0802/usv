<template>
  <div class="container">
    <!--表格区域-->
    <div class="table-part">
      <el-header>table</el-header>
      <el-row>
        <el-col :span="1">&nbsp;</el-col>
        <el-col :span="10">
          <el-input placeholder="请输入计划航线关键字">
            <template slot="append"><i class="el-icon-search"></i></template>
          </el-input>
        </el-col>
        <el-col :span="12" class="col-btn">
          <el-button type="warning">添加航线</el-button>
        </el-col>
      </el-row>
      <MyTable :tableData="tableData"></MyTable>
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
              <p>23</p>
            </div>
          </el-amap-marker>
        </template>
        <!--计划航线-->
        <template>
          <el-amap-polyline :path="[[106.556342, 29.592314], [106.551342, 29.592314]]"> </el-amap-polyline>
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

import axios from 'axios';

export default {
  components: {
    Map, MyTable
  },
  data () {
    return {
      // 表格数据
      tableData: [],

      /********************* 地图相关 *********************/
      // marker偏移量
      offset: [-16, -31]
    }
  },
  methods: {
    clickPoint() {
      console.log('点击了坐标点!');
    }
  },
  created() {
    axios.get('/api/plan/query', {
      params: {
        Page: 1,
        Size: 10
      }
    }).then(res => {
      console.log(res)
    })
  }
}
</script>

<style lang="less" scoped>
@elColor: #409eff;
@markerPath: "../../assets/img/map/marker.png";
@preciseMarkerPath: "../../assets/img/map/precise-marker.png";
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
  width: 600px;
  height: 400px;
  z-index: 1;
  background-color: #e7e7e7;
  .el-header {
    padding: 0;
    height: 30px !important;
    text-align: center;
  }
  /*search input*/
  /deep/ .el-input-group__append,
  .el-input-group__prepend {
    background-color: @elColor;
    color: #fafafa;
    &:hover {
      cursor: pointer;
    }
  }
  .col-btn {
    direction: rtl;
  }
}

/*************** 地图相关 ***************/
/* 坐标点 */
.marker, .precise-marker{
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