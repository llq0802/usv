<template>
  <div class="ampm-Unmanned-ship-information-right" ref="unmanedShipInfo">
    <!-- 折叠按钮 -->
    <div class="toggleShow" @click="toggleShow" ref="toggleBtn">
      <i class="el-icon-arrow-up" v-show="isShow"></i>
      <i class="el-icon-arrow-down" v-show="!isShow"></i>
      
    </div>
    <div class="amap-information-ship-plan-information" v-if="setmanned">
      <li v-if="planName">
        <p><span>当前计划：</span> {{ planName }}</p>
      </li>
      <li>
        <p><span>无人船名称：</span> {{ usvName }}</p>
      </li>
      <li>
        <p><span>无人船状态：</span>{{ BASE_CONSTANTS.usvState(setmanned.state) }}</p>
      </li>
      <li>
        <p><span>电池电量：</span> {{ parseInt(setmanned.battery * 100) }}%</p>
      </li>
      <li>
        <p><span>故障模块：</span> {{ setmanned.moduleFailures }}</p>
      </li>
      <li>
        <p><span>GPS卫星数量：</span> {{ setmanned.gpsSatellites }}</p>
      </li>
      <li>
        <p><span>坐标(GCJ-02)：</span>{{ setmanned.location.longitude.toFixed(7) }} , {{ setmanned.location.latitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>坐标(WGS-84)：</span>{{ setmanned.wgs84Location.longitude.toFixed(7) }} , {{ setmanned.wgs84Location.latitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>方位角：</span> {{ setmanned.yaw.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>俯仰角：</span> {{ setmanned.pitch.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>翻滚角：</span> {{ setmanned.roll.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>当前速度：</span> {{ (setmanned.velocity / (1852 / 3600)).toFixed(1) }} kt</p>
      </li>
      <li>
        <p><span>最大角速度：</span> {{ setmanned.maxAngleSpeed.toFixed(5) }} rad/s</p>
      </li>
      <li>
        <p><span>转向角速度：</span> {{ setmanned.steeringAngleSpeed.toFixed(5) }} rad/s</p>
      </li>
      <li>
        <p><span>目标角度差：</span> {{ setmanned.targetAngleDiff.toFixed(2) }} rad</p>
      </li>
      <li>
        <p><span>舵控制角度：</span> {{ setmanned.rudderControlAngle.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>航线垂直距离：</span> {{ setmanned.perpendicularDistanceToRoute.toFixed(2) }} m</p>
      </li>
      <template v-if="setMeasurement">
        <li>
          <p><span>平均速度：</span> {{ (setMeasurement.averageSpeed / (1852 / 3600)).toFixed(1) }} kt</p>
        </li>
        <!-- 运行状态页面不显示 -->
        <li >
          <p><span>下一个站点：</span> {{ setMeasurement.targetFix }}</p>
        </li>
        <li v-if="setMeasurement.targetFix != 0">
          <p><span>下一个站点距离：</span> {{ setMeasurement.distanceToNextFix.toFixed(1) }} m</p>
        </li>
        <li>
          <p><span>预计航行里程：</span> {{ setMeasurement.estimatedTotalDistance.toFixed(1) }} m</p>
        </li>
        <li>
          <p><span>已航行里程：</span> {{ setMeasurement.accumulatedDistance.toFixed(1) }} m</p>
        </li>
        <li>
          <p><span>计划执行状态：</span>{{ BASE_CONSTANTS.planState(setMeasurement.stage) }}</p>
        </li>
        <li>
          <p><span>返航方式：</span>{{ BASE_CONSTANTS.returnMode(setMeasurement.returnMode) }}</p>
        </li>
      </template>
      
    </div>
    
  </div>
</template>

<script>

import BASE_CONSTANTS from '@/config';

export default {
  props: {
    // 船的信息
    setmanned: Object,
    // 测量计划信息
    setMeasurement: Object,
    usvName: String,
    planName: String
  },
  components: {

  },
  data() {
    return {
      currentRow: null,
      isShow: true,
    };
  },
  methods: {
    // 折叠功能
    toggleShow() {
      if(this.isShow) {
        this.$refs.unmanedShipInfo.style.top = '-550px';
        let timer = setTimeout(()=> {
          this.$refs.toggleBtn.style.top = '550px';
          this.isShow = !this.isShow;
          clearTimeout(timer)
        }, 500)
      } else {
        this.$refs.unmanedShipInfo.style.top = '0';
        this.$refs.toggleBtn.style.top = '0';
        this.isShow = !this.isShow;
        
      }
    }
  },
  created() {}
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
// div通用样式设置
.information {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
}
.ampm-Unmanned-ship-information-right {
  .information;
  width: 100%;
  height: 100%;
  display: flex;
  transition:all .5s;
  -moz-transition:all .5s;
  -webkit-transition:all .5s;
  -o-transition:all .5s;
  .toggleShow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
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
  .amap-information-ship-plan-information {
    display: flex;
    height: 100%;
    overflow: auto;
    justify-content: space-between;
    padding: 10px 5px 5px 10px;
    font-size: 16px;
    box-sizing: border-box;
    border-radius: 10px;
    background: rgba(50, 50, 50, .95);
    flex-wrap: wrap;
    li {
      display: block;
      width: 300px;
      align-items: center;
      p {
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-wrap: break-word;
        overflow: hidden;
        color: #70adeb;
        span {
          color: #fff;
          display: inline-block;
          font-size: 15px;
          width: 120px;
          text-align: right;
        }
      }
    }
  }
}

</style>
