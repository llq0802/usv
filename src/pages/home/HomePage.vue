<template>
  <div class="content">
    <!-- 船只列表 -->
    <div class="ship-info-part">
      <ship-table></ship-table>
    </div>
    <!-- 地图 -->
    <Map>
      <template #running>
      </template>
    </Map>
    <!-- 底部按钮 -->
    <div class="track-btn-part">
      <el-button v-if="!isShowTrack" type="warning" @click="drawTrack">开启轨迹</el-button>
      <template v-else>
        <el-button type="success" @click="clearTrack">清除轨迹</el-button>
        <el-button type="danger" @click="closeTrack">关闭轨迹</el-button>
      </template>
    </div>
  </div>
</template>

<script>

import Map from 'components/amap/Amap';
import ShipTable from './components/ShipTable';
export default {
  props: {},
  components: {
    Map, ShipTable
  },
  data() {
    return {
      // 展示轨迹
      isShowTrack: false,
    }
  },
  methods: {
    // 开启轨迹
    drawTrack() {
      this.isShowTrack = true;
    },
    // 清除轨迹
    clearTrack() {

    },
    // 关闭轨迹
    closeTrack() {
      this.isShowTrack = false;
    }
  }
};
</script>

<style scoped lang="less">
.content {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
}
.ship-info-part {
  position: absolute;
  top: 0;
  left: 0;
  width: 250px;
  background: #f0f0f0;
  z-index: 1;
}
/**底部按钮区域 */
.track-btn-part {
  position: absolute;
  bottom: 8px;
  left: 90px;
  z-index: 1;
}
</style>
