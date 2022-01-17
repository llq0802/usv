<template>
    <div class="container">
        <el-amap
          class="amap-demo"
          ref="map"
          vid="amapDemo"
          :center="center"
          :zoom="zoom"
          :zooms="zooms"
          :expandZoomRange="true"
        >
        </el-amap>
    </div>
</template>

<script>
import '@/plugins/amap';
export default {
  data() {
    return {
      // 地图基本参数
      center: [106.551842, 29.592214],
      zoom: 12,
      zooms: [2, 20],
    }
  },
  created() { }
};
</script>

<style lang="less" scoped>
.container {
    height: 100%;
    width: 100%;
}
</style>
