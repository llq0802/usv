<template>
  <div class="port-content">
    <Amap ref="amap" @getMapBounds="getMapBounds">
      <template #port_berth> </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';
import { apiGetNavaByQuery } from 'api/nava';

export default {
  name: 'portberth',
  components: {
    Amap
  },
  created() {
    // this.getNavaList();
  },
  mounted() {
    // console.log(this.$refs.amap.mapInstance);
    // console.log(window.AMap);
  },
  data() {
    return {
      navaQuery: {
        'Condition.Rect.TopLeft': '',
        'Condition.Rect.TopRight': '',
        'Condition.Rect.BottomLeft': '',
        'Condition.Rect.BottomRight': '',
        'Condition.ZoomLevel': 15,
        'Condition.Keyword': '',
        Page: 1,
        Size: 10
      },
      portList: [], //港口数据
      berthList: [], //泊位数据
      navaList: [] //航标数据 航标
    };
  },
  methods: {
    async getNavaList() {
      let res = await apiGetNavaByQuery(this.navaQuery);
      console.log(res);
    },
    getMapBounds(boundPath, zoom, center) {
      console.log(boundPath);
      // 计算当前map视口面积
      let clitentArea = Math.round(AMap.GeometryUtil.ringArea(boundPath));
      this.navaQuery['Condition.Rect.TopLeft'] = boundPath[3];
      this.navaQuery['Condition.Rect.TopRight'] = boundPath[2];
      this.navaQuery['Condition.Rect.BottomLeft'] = boundPath[1];
      this.navaQuery['Condition.Rect.BottomRight'] = boundPath[0];
      this.navaQuery['Condition.ZoomLevel'] = zoom;
      console.log(clitentArea);
      // console.log(this.navaQuery);
      // this.getNavaList(this.navaQuery);
    }
  }
};
</script>

<style scoped lang="less">
.port-content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
