<template>
  <div class="container">
    <div class="left-panel-part">
      <!-- 表格部分 -->
      <div class="table-part">
        <table-part @getRow="getRouteInfo"></table-part>
      </div>
      <!-- 航线细节 -->
      <div class="route-detail-part">
        <!-- <route-detail></route-detail> -->
        <template v-if="routeInfo">
          <R2 :routeInfo="routeInfo"></R2>
        </template>
        
      </div>
    </div>
    <!--地图-->
    <div class="right-map-part">
      <Map>
        <template #route>
          <!--计划航线-->
          <template>
            <el-amap-polyline :path="[[106.556342, 29.592314], [106.551342, 29.592314]]"> </el-amap-polyline>
          </template>
        </template>
      </Map>
    </div>
    
  </div>
</template>

<script>
// 地图
import Map from 'components/amap/Amap';
// 组件
import TablePart from './components/Table.vue';
import RouteDetail from './components/RouteDetail.vue';
import R2 from './components/r2.vue';
export default {
  components: {
    Map, TablePart, RouteDetail, R2
  },
  data () {
    return {
      routeInfo: null,
      /********************* 地图相关 *********************/
      // marker偏移量
      offset: [-16, -31]
    }
  },
  methods: {
    getRouteInfo(row) {
      this.routeInfo = row;
    }
  },
  created() {
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
  width: 100%;
  height: 100%;
}
.left-panel-part {
  float: left;
  background: #f0f0f0;
  height: 100%;
  padding-right: 10px;
  .table-part {
    min-height: 278px;
  }
}
.right-map-part {
  float: right;
  width: calc(100% - 406px);
  height: 100%;
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