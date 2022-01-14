import Vue from 'vue';
// 引入vue-amap
import VueAMap from 'vue-amap';

Vue.use(VueAMap);

// 初始化vue-amap
VueAMap.initAMapApiLoader({
  // 高德的key
  key: '8733dcdfa0e7bf4591471788c4dcac9c',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.Geocoder',
  ],
  // plugin: [ 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor'],

  // 高德 sdk 版本，默认为 1.4.4
  v: '1.4.4',
});
// console.info(`启用高德地图 版本:1.4.4`);

console.info(
  `%c高德地图%c  SDK版本 %c1.4.4`,
  'padding: 5px; color: #fafafa; background: #40b0ff; border-radius: 2px; text-align: center; font-size: 15px; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; cursor: pointer',
  'color: #333',
  'color: grey; font-style: oblique'
);