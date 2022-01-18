
************地图模板*************

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
      <template></template>
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
  mixins: [ mapBase ],
};
</script>

<style scoped lang="less">
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
</style>
