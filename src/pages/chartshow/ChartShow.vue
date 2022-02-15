<template>
  <div class="show-content">
    <Amap ref="amap" :isEdit="isClickMap" @getLngLat="getMapLngLat" @getMapBounds="getMapBounds">
      <template #show> </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';

export default {
  name: 'ChartShow',
  components: {
    Amap
  },
  data() {
    return {
      isClickMap: false //是否可以点击地图
    };
  },
  methods: {
    getMapBounds() {},
    getMapLngLat() {}
  }
};
</script>

<style scoped lang="less">
.show-content {
  height: 100%;
  position: relative;
}
</style>
