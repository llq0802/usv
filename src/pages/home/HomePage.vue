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
      
    }
  },
  methods: {}
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
</style>
