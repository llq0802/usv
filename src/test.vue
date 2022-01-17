<template>
  <div class="container">
    <Amap></Amap>
  </div>
</template>

<script>

// 引入地图
import Amap from './components/amap/Amap.vue';
// 引入背景特效
// import { focusPoint, clearCavas } from 'utils/bgBeautify';

export default {
  components: {
    Amap,
  },
  mounted() {
    console.log()
  },
}
</script>

<style lang="less" scoped>
.container {
  padding: 0;
  height: 100%;
  width: 100%;
  background: rgb(44, 44, 44);
}
</style>