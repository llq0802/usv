// 引入实例懒加载api
import { lazyAMapApiLoaderInstance } from 'vue-amap';

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
            self.mapInstance.setDefaultCursor('pointer');
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
