<template>
  <div class="container">
    <Map></Map>
  </div>
</template>

<script>
import Map from '@/components/amap/Amap.vue' 
export default {
  components: {
    Map
  },
}
</script>

<style scoped>
.container {
  width: 1500px;
  height: 600px;
}
</style>
