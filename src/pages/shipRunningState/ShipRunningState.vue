<template>
  <div class="content" v-loading="setActionLoading">
    <!-- 状态栏 -->
    <div class="ship-status-bar">
      <!-- 船只信息显示 -->
      <ship-panel
        class="ship-panel"
        :setmanned="setmanned"
        :setMeasurement="setMeasurement"
        :usvName="usvName"
        :planName="nowPlanName"
      ></ship-panel>
      <!-- 仪表盘 -->
      <div class="dashboard_module" ref="dashboardModule">
        <!-- 折叠按钮 -->
        <div class="toggleShow" @click="toggleShow" ref="toggleBtn">
          <i class="el-icon-arrow-up" v-show="isShow"></i>
          <i class="el-icon-arrow-down" v-show="!isShow"></i>
        </div>
        <!-- 方位角显示仪表盘（姿态盘） -->
        <div class="actionplan-setyleDashboard">
          <style-dashboard :setmanned="setmanned"></style-dashboard>
        </div>
        <!-- 速度表 -->
        <div class="actionplan-speed" v-if="setmanned">
          <speed-panel class="speedPanel" :setmanned="setmanned"></speed-panel>
        </div>
        <!-- 电池电量 -->
        <div class="actionplan-batteryAndSetyleDashboard">
          <div class="actionplan-battery" v-if="setmanned">
            <!-- && setmanned.battery-->
            <el-progress
              type="dashboard"
              :percentage="parseInt(setmanned.battery * 100)"
              :color="batteryColor"
              :width="150"
            ></el-progress>
            <p>电量</p>
          </div>
        </div>
      </div>
      <!-- 视频显示 -->
      <div v-show="isShowVide" class="online-video" ref="videoDom">
        <online-video
          :accessToken="videoTokenData.token"
          :url="videoTokenData.url"
          :width="400"
          :height="300"
          ref="refOnlineVideo"
        ></online-video>
      </div>
    </div>
    <!-- 地图 -->
    <Map ref="map">
      <template #detail_running>
        <!-- 无人船 -->
        <template v-if="routerTrackLine && shipLine.length > 1">
          <el-amap-marker ref="shipMarker" :position="shipLocation">
            <div class="ship-view-marker" ref="shipViewMarker" :data-id="setmanned.id">
              <img src="@/assets/img/map/ship.png" />
            </div>
          </el-amap-marker>
        </template>
        <!-- 轨迹 -->
        <el-amap-polyline
          v-if="isShowTrack && isShowTrack.isShowTrackOne"
          :path="routerTrackLine"
          stype="solid"
          strokeColor="#999"
          strokeStyle="solid"
          strokeWeight="1"
          geodesic="true"
          editable="true"
          :zIndex="101"
        ></el-amap-polyline>
        <el-amap-polyline
          v-if="isShowTrack && isShowTrack.isShowTrackTwo"
          :path="routerTrackLineTwo"
          stype="solid"
          strokeColor="#000"
          strokeStyle="solid"
          strokeWeight="4"
          geodesic="true"
          editable="true"
          :zIndex="102"
        ></el-amap-polyline>
        <!-- 连接线 -->
        <el-amap-polyline
          :path="targetDistance"
          stype="solid"
          strokeColor="#FF00FF"
          strokeStyle="solid"
          strokeWeight="2"
          geodesic="true"
          editable="true"
          v-if="targetDistance && targetDistance[0]"
          :zIndex="103"
        ></el-amap-polyline>
      </template>
    </Map>
    <!-- 两种轨迹类型 -->
    <div class="track-type-area" v-show="routerTrackLine.length">
      <el-checkbox v-model="isShowTrack.isShowTrackOne">实际轨迹</el-checkbox>
      <el-checkbox v-model="isShowTrack.isShowTrackTwo">平滑轨迹</el-checkbox>
    </div>
    <!-- 底部按钮 -->
    <div class="bottom-btn-part">
      <el-button type="success" icon="el-icon-map-location">船只跟踪</el-button>
      <el-button type="danger" @click="stopPlan">停止执行计划</el-button>
      <el-button v-if="shipStop" type="warning" @click="SuspendedTask">暂停任务</el-button>
      <el-button v-if="!shipStop" type="primary" @click="restoreTask" v-show="!shipStop"
        >恢复任务</el-button
      >
      <el-button v-if="shipStop" type="success" @click="immediatelyReturn">立即返航</el-button>
      <el-button v-if="!isShowVide" type="primary" @click="openVideo">开启监控</el-button>
      <el-button v-else type="warning" @click="closeVideo">关闭监控</el-button>
    </div>
  </div>
</template>

<script>
// 组件
import Map from 'components/amap/Amap';
import ShipPanel from './components/ShipPanel.vue';
import SpeedPanel from './components/SpeedPanel.vue';
import StyleDashboard from './components/StyleDashboard.vue';
import OnlineVideo from 'components/common/line-video/OnLineVideo';
// 常量
import { BASE_CONSTANTS } from '@/config';
// 工具
import { checkTokenTime } from '@/utils/token';
import { objArrToTdArr, tdArrToObjArr } from '@/utils/handleLngLat';
import * as signalr from '@/utils/signalR';
// api
import { apiGetPlanById, apiGetExecuteInfoByUsvId, apiCancelPlanById } from 'api/plan';
import { apiGetShipById } from 'api/usv';
import { apiSimpleTrack } from 'api/geography';
// 混入
import plan from './mixins/plan';
import watchs from './mixins/watch';

export default {
  mixins: [ plan, watchs ],
  components: {
    Map, ShipPanel, SpeedPanel, StyleDashboard, OnlineVideo
  },
  data () {
    return {
      isShow: true,
      // 是否显示路线
      isShowTrack: {
        isShowTrackOne: true,
        isShowTrackTwo: true,
      },
      setActionLoading: false,
      // 计划id
      planId: null,
      // 锚点
      pointList: [],
      precisePointList: [],
      // 船的单独信息
      setmanned: null,
      // 测量计划的信息
      setMeasurement: null,

      // 当前计划名称
      nowPlanName: null,
      // 船只名称
      usvName: '',
      // 定时器
      checkTokenInterval: null,
      TokenUpdateTime: null,
      isgetPlanInfoTime: null,
      // 容差值
      tolerance: 1,
      // 模拟障碍物坐标
      obstaclesCoorFalse: '',
      // 电池颜色
      batteryColor: Object.freeze(BASE_CONSTANTS.powerColors()),
      // 当前坐标到下一个目标点的位置
      targetDistance: [],

      // 订阅id存储
      usvRuntimeInfoChangedId: '',
      planExecutionStateChangedId: '',

      // 是否显示diveo
      isShowVide: false,
      videoTokenData: {
        url: null,
        token: null,
        exp: null,
      },
      /**************************地图***************************/
      // 障碍物坐标
      obstaclesCoor: [],
      // 轨迹绘制
      routerTrack: {
        Line: [],
        Length: 0,
        Time: null,
      },
      routerTrackTwo: {
        Line: [],
        Length: 0,
        Time: null,
      },
      // 实时无人船位置
      shipRealTimeLocation: [],
      shipLine: [],
      shipLocation: [],
      returnHomeRealTimeLocation: [],
      speed: 0,
      isAutoTrack: false,
    }
  },
  methods: {
    // ====================页面加载数据获取==================
    // 获取船信息
    getShipInfo (res) {
      // 不能存放相同的经纬度
      const isLine = this.routerTrack.Line.some(item => {
        return res.location.longitude == item[0] && res.location.latitude == item[1];
      });
      if (!isLine) {
        // 轨迹绘制始终只绘制一小时以内的标记
        if (this.routerTrack.Line.length <= 14400) {
          // 无人船实时位置
          this.$set(this.routerTrack.Line, this.routerTrack.Line.length, [res.location.longitude, res.location.latitude]);
        } else {
          this.routerTrack.Line.shift();
          this.$set(this.routerTrack.Line, this.routerTrack.Line.length, [res.location.longitude, res.location.latitude]);
        }
      }

      // 不能存放相同的第二条经纬度
      const isLineTwo = this.routerTrackTwo.Line.some(item => {
        return res.calibratedLocation.longitude == item[0] && res.calibratedLocation.latitude == item[1];
      });
      if (!isLineTwo) {
        // 轨迹绘制始终只绘制一小时以内的标记
        if (this.routerTrack.Line.length <= 14400) {
          // 无人船实时位置
          this.$set(this.routerTrackTwo.Line, this.routerTrackTwo.Line.length, [
            res.calibratedLocation.longitude,
            res.calibratedLocation.latitude,
          ]);
        } else {
          this.routerTrackTwo.Line.shift();
          this.$set(this.routerTrackTwo.Line, this.routerTrackTwo.Line.length, [
            res.calibratedLocation.longitude,
            res.calibratedLocation.latitude,
          ]);
        }
      }
      // 数据被赋值后，马上使用数据库的信息
      if (this.setMeasurement && this.pointList.length != 0) {
        if (this.setMeasurement.targetFix && this.routerTrack.Line.length != 0) {
          // 将轨迹的最后一个坐标和获取到的指定信息路径存储做虚线指示
          let src = this.isShowTrack.isShowTrackOne && !this.isShowTrack.isShowTrackTwo ? this.routerTrack : this.routerTrackTwo;
          this.targetDistance.splice(0, 1, src.Line[this.routerTrackTwo.Line.length - 1]);
          if (!this.pointList[this.setMeasurement.targetFix - 1]) {
            // console.log('oops');
          }
          this.targetDistance.splice(1, 1, [
            this.pointList[this.setMeasurement.targetFix - 1].location.longitude,
            this.pointList[this.setMeasurement.targetFix - 1].location.latitude,
          ]);
        } else {
          this.targetDistance.splice(0, this.targetDistance.length - 1);
        }
      }
      setTimeout(() => {
        this.setActionLoading = false;
      }, 150);
    },
    // 折叠功能
    toggleShow () {
      if (this.isShow) {
        this.$refs.dashboardModule.style.top = '-315px';
        // console.log('关闭')
        if (this.isShowVide) {
          this.$refs.videoDom.style.top = '0';
        }
        let timer = setTimeout(() => {
          this.$refs.toggleBtn.style.top = '315px';
          this.isShow = !this.isShow;
          clearTimeout(timer)
        }, 500)
      } else {
        this.$refs.dashboardModule.style.top = '0';
        this.$refs.toggleBtn.style.top = '0';
        this.isShow = !this.isShow;
        if (this.isShowVide) {
          this.$refs.videoDom.style.top = '315px';
        }

      }
    },
    // 关闭video
    closeVideo () {
      this.isShowVide = false;
      this.$refs.refOnlineVideo.colseVideo();
    },
    // 开启video
    openVideo () {
      this.isShowVide = true;
      // 调用子组件的开启方法
      this.$refs.refOnlineVideo.openVideo();
      if (!this.$refs.dashboardModule || !this.isShow) {
        this.$refs.videoDom.style.top = '0';
      } else {
        this.$refs.videoDom.style.top = '315px';
      }
    },

    // ======================通过signalr获取信息==========================
    // 同时获取两种信息
    getUsvPlanInfo (reconnect) {
      let self = this;
      function doSubscribe () {
        // 获取船只具体信息
        signalr
          .subscribe('usvRuntimeInfoChanged', self.usvId, data => {
            if (data) {
              data.calibratedLocation = trun(data.calibratedLocation);
              data.location = trun(data.location);
              data.wgs84Location = trun(data.wgs84Location);
              self.setmanned = data;
              data.location && self.getShipInfo(data);
            } else {
              this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
            }
          })
          .then(codingId => {
            self.usvRuntimeInfoChangedId = codingId;
          });
        // 获取计划详细信息
        signalr
          .subscribe('planExecutionStateChanged', self.usvId, data => {
            if (data) {
              data.lastLocation = trun(data.lastLocation);
              self.setMeasurement = data;
            } else {
              this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
            }
          })
          .then(codingId => {
            self.planExecutionStateChangedId = codingId;
          });
      }
      doSubscribe();
    },
    // 查看运行状态只需要一个信息
    getRunStateInfo (reconnect) {
      signalr
        .subscribe('usvRuntimeInfoChanged', this.usvId, data => {
          if (data) {
            data.calibratedLocation = trun(data.calibratedLocation);
            data.location = trun(data.location);
            data.wgs84Location = trun(data.wgs84Location);
            this.setmanned = data;
            data.location && this.getShipInfo(data);
          } else {
            this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
          }
        })
        .then(codingId => {
          this.usvRuntimeInfoChangedId = codingId;
        });
    },
    // 事件流清除
    unsubscribeFun () {
      if (this.planExecutionStateChangedId) {
        signalr.unsubscribe([this.usvRuntimeInfoChangedId, this.planExecutionStateChangedId]);
      } else if (this.usvRuntimeInfoChangedId) {
        signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      }
    },
    // 调用接口，轨迹简化
    async setActionLineSimplified (newLine) {
      if (newLine.Length != newLine.Line.length) {
        // 需要转换的经纬度长度
        let setLocationLength = newLine.Line.length - newLine.Length;
        let setLocation = newLine.Line.slice(newLine.Length, newLine.Line.length);
        let SimLine = tdArrToObjArr(setLocation);
        let SimLineTrun = [];
        for (let val of SimLine) {
          let data = trun(val);
          SimLineTrun.push(data);
        }
        // console.log('简化前====================');
        if (SimLineTrun.length > 1) {
          const res = await apiSimpleTrack(this.tolerance, SimLineTrun);
          if (res.errorCode) return;
          // 简化轨迹
          // console.log(res.geom);
          let trunSimLineOld = JSON.parse(JSON.stringify(res.data.geom));
          let trunSimLine = [];
          for (let val of trunSimLineOld) {
            trunSimLine.push(trun(val));
          }
          // console.log('简化后==================');
          // console.log(trunSimLine);
          let setArrayLocation = objArrToTdArr(trunSimLine);
          // console.log(setArrayLocation);
          newLine.Line.splice(newLine.Length, setLocationLength, ...setArrayLocation);
          newLine.Length = newLine.Length + res.data.outputSize;
        }
      }
    },
    // 执行计划页面
    async actioniPlan () {
      // console.log('执行计划页面数据获取');
      await this.getPlanCoor();
      this.unsubscribeFun();
      // 连接事件流
      signalr.connected(this.getUsvPlanInfo);
    },
    // 查看状态页面
    ViewRunStatus () {
      // console.log('查看状态页面数据获取');
      this.unsubscribeFun();
      signalr.connected(this.getRunStateInfo);
      setTimeout(() => {
        this.setActionLoading = false;
      }, 150);
    },

    // 定时器设置
    ActionPlanTime () {
      // 初试获取计划信息
      this.getPlanInfor();
      if (this.isgetPlanInfoTime) {
        window.clearInterval(this.isgetPlanInfoTime);
      }
      if (this.TokenUpdateTime) {
        window.clearInterval(this.TokenUpdateTime);
      }
      if (this.checkTokenInterval) {
        window.clearInterval(this.checkTokenInterval);
      }
      if (this.routerTrack.Time) {
        window.clearInterval(this.routerTrack.Time);
      }
      if (this.routerTrackTwo.Time) {
        window.clearInterval(this.routerTrackTwo.Time);
      }
      // 5分钟获取一次token
      this.TokenUpdateTime = window.setInterval(() => {
        this.getUsvName();
      }, 300000);
      // 十秒检查一次视频token是否快过期,快过期给新的tokne
      this.checkTokenInterval = window.setInterval(() => {
        if (checkTokenTime(this.videoTokenData.exp, 3600)) {
          // 更新token的函数
          this.isShowVide && getOnlineVideoToken(this.videoTokenData);
        }
      }, 10000);

      //每一分钟简化一次新的轨迹线
      this.routerTrack.Time = window.setInterval(() => {
        this.setActionLineSimplified(this.routerTrack);
      }, 60000);
      this.routerTrackTwo.Time = window.setInterval(() => {
        this.setActionLineSimplified(this.routerTrackTwo);
      }, 60000);
    },
    // 自动跟踪船只位置
    setMapCenter () {
      if (this.setmanned && this.isAutoTrack) {
        this.$refs.map.setMapFitView([
          this.setmanned.calibratedLocation.longitude,
          this.setmanned.calibratedLocation.latitude
        ]);
      }
    },
  },
  
  created () {
    signalr.start(true);
  },
  destroyed () {
    clearInterval(this.isgetPlanInfoTime);
    clearInterval(this.TokenUpdateTime);
    clearInterval(this.checkTokenInterval);
    clearInterval(this.routerTrack.Time);
    clearInterval(this.routerTrackTwo.Time);

    this.routerTrack.Line = [];
    this.routerTrackTwo.Line = [];
    this.unsubscribeFun();
  },
}
</script>

<style lang="less" scoped>
.content {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
/* 船只信息 */
.ship-panel {
  width: 320px;
  height: 550px;
  z-index: 1;
}
/* 仪表盘 */
.dashboard_module {
  position: absolute;
  top: 0;
  right: 0;
  height: 315px;
  width: 400px;
  transition: all 0.5s;
  background: #3d3d3d;
  z-index: 99;
  // 折叠按钮
  .toggleShow {
    z-index: 99;
    position: absolute;
    top: 0;
    right: 50%;
    transform: translateX(50%);
    width: 60px;
    text-align: center;
    background: rgba(77, 77, 77, 0.6);
    opacity: 0.5;
    i {
      line-height: 30px;
      font-size: 30px;
      color: #fff;
    }
    &:hover {
      opacity: 1;
      cursor: pointer;
    }
  }
  //姿态盘
  .actionplan-setyleDashboard {
    position: absolute;
    bottom: 10px;
    left: 15px;
    width: auto;
    height: auto;
    border-radius: 30%;
    //background: rgba(50, 50, 50, .95);
    background: #3d3d3d;
  }
  // 电量和姿态盘
  .actionplan-batteryAndSetyleDashboard {
    position: absolute;
    width: auto;
    height: auto;
    top: 5px;
    right: 15px;
    display: flex;
  }
  .actionplan-battery {
    position: relative;
    padding-top: 5px;
    background: #3d3d3d;
    text-align: center;
    font-size: 12px;
    color: #fff;
    height: 140px;
    width: 160px;
    border-radius: 10%;
    p {
      position: absolute;
      bottom: 5px;
      width: 100%;
      font-size: 14px;
    }
    /deep/.el-progress__text {
      color: #fff;
    }
  }
  // 速度仪样式
  .actionplan-speed {
    position: absolute;
    right: 15px;
    bottom: 5px;
    height: 160px;
    width: 160px;
    box-sizing: content-box;
    border-radius: 10%;
  }
}
.online-video {
  position: absolute;
  right: 0;
  top: 315px;
  width: 400px;
  height: 300px;
  background: #3d3d3d;
  box-sizing: content-box;
  transition: all 0.5s;
  z-index: 1;
}
.track-type-area {
  position: absolute;
  bottom: 50px;
  left: 10px;
  z-index: 1;
  .el-checkbox {
    font-size: 20px;
    margin-right: 20px;
    /deep/ .el-checkbox__label {
      font-size: 15px;
    }
  }
}
/* 底部轨迹按钮 */
.bottom-btn-part {
  position: absolute;
  bottom: 8px;
  left: 90px;
  z-index: 1;
}
</style>