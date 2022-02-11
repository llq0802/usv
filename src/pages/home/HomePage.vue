<template>
  <div class="content">
    <!-- 船只列表 -->
    <div class="ship-info-part">
      <ship-table></ship-table>
    </div>
    <!-- 地图 -->
    <Map>
      <template #running>
        <!-- 所有实时无人船 -->
        <template v-if="shipDataList.length">
          <el-amap-marker
            ref="shipMarker"
            v-for="(ship, index) in shipDataList"
            :key="ship.id"
            :position="ship.calibratedLocation"
            :extData="ship"
          >
            <div class="ship-box">
              <div>船名：{{ ship.shipName }}</div>
              <div>状态：{{ ship.state }}</div>
              <!-- 状态离线不显示速度 -->
              <div class="speed" v-if="ship.state != '离线'">航行速度：{{ ship.velocity.toFixed(2) }}m/s</div>
            </div>
            <div class="ship-marker-png" @click="goDetail(ship.id)" :data-id="ship.id">
              <img src="@/assets/img/map/ship.png" alt />
            </div>
          </el-amap-marker>
        </template>
        <!-- 轨迹 -->
        <template v-if="isOpenTrack">
          <el-amap-polyline
            stype="solid"
            strokeStyle="solid"
            strokeWeight="4"
            :geodesic="true"
            v-for="(line, index) in allShipTrack"
            :key="index + 'track'"
            :path="line"
            :strokeColor="getColorByIndex(index)"
          ></el-amap-polyline>
        </template>
      </template>
    </Map>
    <!-- 底部按钮 -->
    <div class="track-btn-part">
      <el-button v-if="!isOpenTrack" type="warning" @click="openTrack">开启轨迹</el-button>
      <template v-else>
        <el-button type="success" @click="clearTrack">清除轨迹</el-button>
        <el-button type="danger" @click="closeTrack">关闭轨迹</el-button>
      </template>
    </div>
  </div>
</template>

<script>

import Map from 'components/amap/Amap';
import ShipTable from './components/ShipTable';

import { BASE_CONSTANTS } from '@/config';
// 工具
import bus from '@/utils/bus';
import { objArrToTdArr, tdArrToObjArr, turnLngLat } from '@/utils/handleLngLat';
import { rotate } from '@/utils/rotate';
// api
import { apiSimpleTrack } from 'api/geography';

export default {
  props: {},
  components: {
    Map, ShipTable
  },
  data() {
    return {
      shipDataList: [{
        id: 1,
        calibratedLocation: [106.551842, 29.592214],
        shipName: '无人船',
        state: '在线',
        velocity: 30.34964576
      }],
      // 所有船只的移动轨迹
      allShipTrack: [],
      // 定时器
      timer: null,
      // 简化轨迹时，开始的索引
      extent: 0,
      // 是否开始轨迹
      isOpenTrack: false,
      // 轨迹颜色
      getColorByIndex: BASE_CONSTANTS.strokeColorList,
    }
  },
  methods: {
    // 简化函数
    async simpleLine(allShipTrack) {
      for (let line of allShipTrack) {
        if (this.extent != allShipTrack) {
          // console.log(this.extent);
          let setLocationLength = line.length - 1 - this.extent;
          let setLocation = line.slice(this.extent + 1, line.length - 1);
          setLocation.shift();
          // console.log('简化前=======================');
          // console.log(setLocation);
          let SimLine = tdArrToObjArr(setLocation);
          let SimLineTrun = [];
          for (let val of SimLine) {
            let data = turnLngLat(val);
            SimLineTrun.push(data);
          }
          // console.log(SimLineTrun);
          if (SimLineTrun.length > 1) {
            const res = await apiSimpleTrack(SimLineTrun);
            if (!res.errorCode) {
              // 简化轨迹
              // console.log(res.geom);
              let trunSimLineOld = JSON.parse(JSON.stringify(res.data.geom));
              let trunSimLine = [];
              for (let val of trunSimLineOld) {
                trunSimLine.push(turnLngLat(val));
              }
              // console.log('轨迹简化==================');
              // console.log(trunSimLine);
              let setArrayLocation = objArrToTdArr(trunSimLine);
              // console.log(setArrayLocation);
              line.splice(this.extent, setLocationLength, ...setArrayLocation);
              this.extent = this.extent + res.data.outputSize;
            }
          }
        }
      }
    },
    // 船只移动动画
    shipMoveAnimation() {
      for (let M of this.$refs.shipMarker) {
        const shipMarker = M.$$getInstance();
        let shipData = this.shipDataList.find(item => item.id === shipMarker.getExtData().id);
        if (!shipData) return;
        let [location, speed] = [shipData.calibratedLocation, shipData.velocity];
        let toDistance = {};
        toDistance.lat = +location[1].toString();
        toDistance.lng = +location[0].toString();
        let distance = shipMarker.getPosition().distance(toDistance);
        // 误差大于1米,直接移动到实际位置
        if (distance / (speed * 4 * 0.5) > 1) {
          // console.warn(`误差过大(${distance}m),跳过动画直接移至实际点`)
          shipMarker.moveTo(location, 36000000);
        }
        // 误差小于1米,执行移动动画
        else {
          shipMarker.moveTo(location, speed * 4);
          let shipDom = document.querySelectorAll('.ship-marker-png');
          // 根据元素id设置正确旋转动画角度
          for (let item of shipDom) {
            for (let ship of this.shipDataList.length) {
              if (item.getAttribute('data-id') == ship.id) {
                rotate(item, ship.yaw, 200);
              }
            }
          }
        }
      }
    },
    // 开启轨迹
    openTrack() {
      this.isOpenTrack = true;
    },
    // 关闭轨迹
    closeTrack() {
      this.isOpenTrack = false;
    },
    // 清除轨迹
    clearTrack() {
      this.allShipTrack = [];
      this.extent = 0;
    },
    // 跳转详情
    goDetail(usvId) {
      this.$router.push({path:'runstate', query:{usvId}});
    }
  },
  watch: {
    shipDataList: {
      handler(newValue, oldValue) {
        if (!this.shipDataList.length) return;
        // 在开启轨迹的时候,绘制所有船只轨迹
        if (this.isOpenTrack) {
          // 先判断是否为点击'开启轨迹'而促发的脚本,即第一次绘制轨迹时调用
          if (this.allShipTrack.length == 0) {
            // 打开定时器的条件
            this.timer = 'startSimple';
            for (let i = 0; i < this.shipDataList.length; i++) {
              if (this.allShipTrack[i] == undefined) {
                this.allShipTrack[i] = [];
              }
              this.allShipTrack[i] = new Array();
              // 设置id，方便清除对应船只轨迹
              this.allShipTrack[i].id = this.shipDataList[i].id;
            }
            // console.log(this.allShipTrack);
          }
          // 显示船只减少
          if (oldValue.length === this.shipDataList.length + 1 && newValue.length === this.shipDataList.length) {
            for (let i = this.allShipTrack.length - 1; i >= 0; i--) {
              if (!this.shipDataList.some(val => val.id == this.allShipTrack[i].id)) {
                this.allShipTrack.splice(i, 1);
              }
            }
          }
          // 显示船只增加
          if (oldValue.length === this.shipDataList.length - 1 && newValue.length === this.shipDataList.length) {
            for (let i = 0; i < this.shipDataList.length; i++) {
              if (!this.allShipTrack.some(val => val.id == this.shipDataList[i].id)) {
                var item = [];
                item.id = this.shipDataList[i].id;
                this.allShipTrack.push(item);
              }
            }
          }
          // 限制轨迹点数量
          for (let i = 0; i < this.shipDataList.length; i++) {
            let track = this.allShipTrack.find(val => val.id === this.shipDataList[i].id);
            let lastPoint = track.length > 0 ? track[track.length - 1] : null;
            let currentPoint = this.shipDataList[i].calibratedLocation;
            if (lastPoint == null || lastPoint[0] != currentPoint[0] || lastPoint[1] != currentPoint[1]) {
              track.push(currentPoint);
              // 每条轨迹线最多10000个点
              if (track.length > 10000) {
                track.shift();
              }
            }
          }
          // 强制刷新轨迹数据触发渲染
          this.allShipTrack = Array.from(this.allShipTrack);
          if (this.timer === 'startSimple') {
            this.timer = setInterval(() => {
              this.simpleLine(this.allShipTrack);
            }, 60000);
          }
        }
        // 关闭轨迹清空之前保存的轨迹数据，避免下次开启会有重复轨迹
        else {
          this.allShipTrack = [];
          clearInterval(this.timer);
        }
        // 有新的船只添加或者第一次进入页面时候,自适应一下地图
        if (newValue.length != oldValue.length) {
          this.$refs.map.setMapFitView(this.shipDataList[0].calibratedLocation);
        }
        // 添加无人船移动函数
        this.shipMoveAnimation();
      },
      deep: true
    }
  },
  created() {

  },
  mounted() {
    // 接收船只数据
    bus.$on('shipRunningList', shipDataList => {
      this.shipDataList = shipDataList;
    });
  },
  beforeDestroy() {
    bus.$off('shipRunningList');
  }
};
</script>

<style scoped lang="less">
.content {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
}
.ship-info-part {
  position: absolute;
  top: 0;
  left: 0;
  width: 250px;
  background: #f0f0f0;
  z-index: 1;
}
/* 底部轨迹按钮 */
.track-btn-part {
  position: absolute;
  bottom: 8px;
  left: 90px;
  z-index: 1;
}
/* 地图上的无人船 */
.ship-box {
  padding: 5px;
  font-size: 10px;
  position: absolute;
  bottom: 0;
  right: -70px;
  background: rgba(96, 151, 253, 0.5);
  border-radius: 10px;

  .speed {
    width: 110px;
  }
}

.ship-marker-png {
  height: 50px;
  position: absolute;
  top: 5px;
  left: 0;
  z-index: 999;
  transition: all 0.5s !important;
  img {
    height: 100%;
    vertical-align: middle;
  }
}
</style>
