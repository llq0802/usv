<template>
  <div class="container">
    <PlanMap></PlanMap>
  </div>
</template>

<script>
// 导入地图组件
import PlanMap from 'components/amap/PlanMap';

export default {
  components: {
    PlanMap
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 0 !important;
  width: 100%;
  height: 100%;
}
</style>