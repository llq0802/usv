
<template>
  <div class="map-container" v-loading="mapLoading">
    <el-amap
      ref="map"
      vid="amapDemo"
      :center="center"
      :zoom="zoom"
      :zooms="zooms"
      :events="amapEvents"
      :expandZoomRange="true"
    >
      <!--坐标点-->
      <template>
          <el-amap-marker :position="center" :offset=[-16,-28]>
            <div class="marker" @click="clickPoint">
              <p>123</p>
            </div>
          </el-amap-marker>
      </template>

    </el-amap>

    <!-- 卫星按钮 -->
    <el-button type="primary" @click="setSateLayer">
      <i :class="isSate ? 'el-icon-s-order' : 'el-icon-aim'"></i>
      <span>{{ isSate ? '路线' : '卫星' }}</span>
    </el-button>
  </div>
</template>

<script>
// 引入地图
import VueAMap from 'vue-amap';
// 引入地图基本配置
import mapBase from '@/mixins/amap.base';

export default {
  mixins: [mapBase],
  methods: {
    clickPoint() {
      console.log('点击了坐标点!');
    }
  }
};
</script>

<style scoped lang="less">

@markerPath: '../../assets/img/map/point.png';
@priciseMarkerPath: '../../assets/img/map/point.png';

.map-container {
  position: relative;
  height: 100%;
  width: 100%;
  .el-button {
    position: absolute;
    left: 8px;
    bottom: 8px;
  }
}
/* 地图相关 */
.marker {
  position: relative;
  width: 32px;
  height: 32px;
  background: url(@markerPath);
  p {
    position: absolute;
    top: -12px;
    display: inline-block;
    width: 100%;
    font-size: 14px;
    color: #444;
    text-align: center;
  }
}
</style>
