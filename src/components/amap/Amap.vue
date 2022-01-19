
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
// 引入地图
import VueAMap, { lazyAMapApiLoaderInstance } from 'vue-amap';
// 引入实例懒加载api

export default {
  data() {
    // 定义一个变量指向组件实例
    let self = this;
    return {
      // 地图基本参数
      center: [106.551842, 29.592214],
      zoom: 12,
      zooms: [2, 20],
      mapLoading: false,
      // 地图实例
      mapInstance: null,
      // 事件队列
      isCompleted: false,
      completedCallbacks: [],
      // 卫星图层
      isSate: false,
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
          // 获取坐标点
          console.log(e.lnglat);
        }
      }
    };
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
