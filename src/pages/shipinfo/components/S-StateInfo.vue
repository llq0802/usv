<template>
  <el-dialog
    title="无人船基本状态信息"
    :visible.sync="isShow"
    width="40%"
    center
    :before-close="handleClose"
    @open="openDialog"
  >
    <el-form ref="form" label-width="100px" :model="form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="无人船状态">
            <el-input v-model="form.stateVal" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="软件版本">
            <el-input v-if="!form.firmwareVersion" :value="`暂无`" disabled />
            <el-input v-else v-model="form.firmwareVersion" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="硬件版本">
            <el-input v-if="!form.hardwareVersion" :value="`暂无`" disabled />
            <el-input v-else v-model="form.hardwareVersion" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="GPS个数">
            <el-input v-model="form.gpsSatellites" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="+form.state !== 0">
        <el-col :span="24">
          <el-form-item label="经纬度">
            <el-input v-if="!form.location" :value="`暂无`" disabled />
            <el-input v-else v-model="form.location" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="异常模块">
            <el-input v-model="form.moduleFailures" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="俯仰角">
            <el-input v-if="form.pitch == undefined" :value="`暂无`" disabled />
            <el-input v-else v-model="form.pitch" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电池电量">
            <el-input v-if="!form.battery" :value="`0`" disabled />
            <el-input v-else v-model="form.battery" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="翻滚角">
            <el-input v-if="form.roll == undefined" :value="`暂无`" disabled />
            <el-input v-else v-model="form.roll" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="方位角">
            <el-input v-if="form.yaw == undefined" :value="`暂无`" disabled />
            <el-input v-else v-model="form.yaw" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="航行速度">
            <el-input v-if="form.velocity == undefined" :value="`0m/s`" disabled />
            <el-input v-else v-model="form.velocity" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 底部开始 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { BASE_CONSTANTS } from '@/config';
import * as shipApi from 'api/shipinfo';
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    currentRow: {
      type: Object,
      default: () => {}
    },
    shipRealTimeStatus: {
      type: Object,
    }
  },
  data() {
    return {
      //无人船状态数据
      form: {
        // 电量
        battery: 0,
        // 瞬时速度
        firmwareVersion: 0,
        // 平均速度
        hardwareVersion: 0,
        // gps个数
        gpsSatellites: 0,
        // 经纬度
        location: {
          longitude: '',
          latitude: ''
        },
        // 异常模块
        moduleFailures: 0,
        // 障碍物
        obstacleInfo: 0,
        // 昂角
        pitch: 0,
        // 翻滚角
        roll: 0,
        // 无人船状态
        state: 0,
        // 航行速度
        velocity: 0,
        // 方位角
        yaw: 0
      }
    };
  },
  methods: {
    /**
     * 组件打开的回调
     */
    openDialog() {
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        const runInfo = deepClone(this.currentRow.runtimeInfo);
        runInfo.stateVal = BASE_CONSTANTS.usvState(runInfo.state);
        runInfo.pitch = +runInfo.pitch.toFixed(2) + `°`;
        runInfo.battery = (runInfo.battery * 100).toFixed(2) + '%';
        runInfo.roll = runInfo.roll.toFixed(2) + `°`;
        runInfo.yaw = runInfo.yaw.toFixed(2) + '°';
        runInfo.velocity = runInfo.velocity.toFixed(2) + 'm/s';
        this.form = runInfo;
      });
    },
    handleClose(){
      this.cancalClick()
      this.$emit('closeWS');
    },
    /**
     * 取消
     */
    cancalClick() {
      this.$emit('update:isShow');
    }
  },
  watch: {
    shipRealTimeStatus: {
      handler() {
        if (this.shipRealTimeStatus) {
          for (let key in this.form) {
            if (!this.shipRealTimeStatus.hasOwnProperty(key)) return
            this.form[key] = this.shipRealTimeStatus[key];
          }
        }
      },
      deep: true
    }
  },
  created() {
    
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
