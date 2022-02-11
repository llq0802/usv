<template>
  <div class="content">
    <Map>
      <template #detail_running></template>
    </Map>
  </div>
</template>

<script>
import Map from 'components/amap/Amap';

export default {
  components: {
    Map
  },
  created() {
    console.dir(this.$message)
  }
}
</script>

<style lang="less" scoped>
.content {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>