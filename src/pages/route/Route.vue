<template>
  <div class="container">

    <!--地图-->
    <Map>
      <template #route>
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

export default {
  components: {
    Map
  },
  data () {
    return {

      /********************* 地图相关 *********************/
      // marker偏移量
      offset: [-16, -31]
    }
  },
  methods: {}
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