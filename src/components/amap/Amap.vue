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
      <!--运行状态-->
      <slot name="running"></slot>
      <!--详细运行状态-->
      <slot name="detail_running"></slot>
      <!--计划管理-->
      <slot name="plan"></slot>
      <!--航线管理-->
      <slot name="route"></slot>
      <!--航标航道管理-->
      <slot name="chanel"></slot>
      <!--港口泊位管理-->
      <slot name="port_berth"></slot>
      <!--航图展示管理-->
      <slot name="show"></slot>
    </el-amap>

    <!-- 卫星按钮 -->
    <el-button type="primary" @click="setSateLayer">
      <i :class="isSate ? 'el-icon-s-order' : 'el-icon-aim'"></i>
      <span>{{ isSate ? '路线' : '卫星' }}</span>
    </el-button>
  </div>
</template>

<script>
import { AMAP } from '@/config';
// 引入地图
import VueAMap, { lazyAMapApiLoaderInstance } from 'vue-amap';
// 引入实例懒加载api

export default {
  data() {
    // 定义一个变量指向组件实例
    let self = this;
    return {
      // 地图基本参数
      center: AMAP.center,
      zoom: AMAP.zoom,
      zooms: AMAP.zooms,
      mapLoading: false,
      // 地图实例
      mapInstance: null,
      // 地图实例是否加载完成
      isCompleted: false,
      // 地图实例加载完成后执行的回调函数数组
      completedCallbacks: [],
      // 是否卫星图层
      isSate: false,
      // 卫星图层实例
      sateLayer: null,
      // 地图事件
      amapEvents: {
        // 地图初始化
        init(instance) {
          lazyAMapApiLoaderInstance.load().then(() => {
            // 获取地图实例
            self.mapInstance = instance;
            // 获取卫星图层
            self.sateLayer = new AMap.TileLayer.Satellite();
            //初始化完成时就获取地图可视范围
            self.getMapBounds();
            // 当地图拖动,或者层级改变获取地图可视范围
            self.mapInstance.on('zoomchange', self.getMapBounds);
            self.mapInstance.on('dragend', self.getMapBounds);
            // 设置鼠标样式
            self.mapInstance.setDefaultCursor();
            // 事件队列依次执行
            for (let cb of self.completedCallbacks) {
              cb(self);
            }
            self.isCompleted = true;
          });
        },
        // 点击事件
        click: (e) => {
          if (!this.isEdit) return;
          if (this.preventClickMap) return;
          // 获取坐标点
          let p = e.lnglat;
          p.location = `${p.lat},${p.lng}`;
          p.pointArray = [+p.lng, +p.lat];
          this.$emit('getLngLat', p);
        }
      }
    };
  },
  props: {
    // 是否可点击编辑
    isEdit: {
      type: Boolean,
      default: false
    },
    // 防止误点地图
    preventClickMap: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 设置卫星图层
    setSateLayer() {
      if (this.mapInstance) {
        this.isSate = !this.isSate;
        if (this.isSate) {
          this.mapInstance.add(this.sateLayer);
        } else {
          this.mapInstance.remove(this.sateLayer);
        }
      } else {
        this.$message.error('网速较慢，地图未获取到，请稍后再试');
      }
    },
    // 在地图执行成功后才会去执行，没有成功将函数保存在数组中，等待地图成功后执行数组中的函数
    onCompleted(cb) {
      if (this.isCompleted) {
        return cb();
      } else {
        this.completedCallbacks.push(cb);
      }
    },
    //自定义鼠标样式图标
    setCursor(target = 'default') {
      // 'default' | 'pointer' | 'move' | 'crosshair'
      this.mapInstance.setDefaultCursor(target);
    },
    // 地图自适应范围 默认是展示二维数组线
    async setMapFitView(pathArr, isTwoArray = true) {
      await this.$nextTick();
      if (pathArr) {
        //判断是marker还是line 即是不是二维数组
        const instance = isTwoArray
          ? new AMap.Polyline({ path: pathArr })
          : new AMap.Marker({ position: pathArr });
        this.mapInstance.setFitView(instance);
      } else {
        this.mapInstance.setFitView(); // 无参数，默认包括所有覆盖物的情况
      }
    },
    // 获取地图的可视范围范围, 将地图范围,地图层级,中心点发送
    getMapBounds() {
      if (this.mapInstance) {
        this.$nextTick(() => {
          const mapBounds = this.mapInstance.getBounds();
          let southWest = mapBounds.southwest,
            northEast = mapBounds.northeast;
          const boundPath = [
            [northEast.lng, southWest.lat],
            [southWest.lng, southWest.lat],
            [southWest.lng, northEast.lat],
            [northEast.lng, northEast.lat]
          ];
          this.$emit(
            'getMapBounds',
            boundPath,
            this.mapInstance.getZoom(),
            this.mapInstance.getCenter()
          );
        });
      }
    }
  }
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
