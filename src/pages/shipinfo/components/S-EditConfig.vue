<template>
  <el-dialog
    title="配置无人船参数"
    :visible.sync="isShow"
    width="33%"
    center
    :before-close="cancalClick"
    @open="openDialog"
  >
    <el-form ref="form" :model="form" :rules="rules">
      <el-row>
        <el-col :span="12">
          <el-form-item label="服务器通信中断保护：" label-width="160px">
            <el-switch
              v-model="form.enableServerCommunicationCircuitBreaker"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="遥控器通信中断保护：" label-width="160px">
            <el-switch
              v-model="form.enableRemoteControlCommunicationCircuitBreaker"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="自动避障：" label-width="160px">
            <el-switch
              v-model="form.enableObstacleAvoidance"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="低电量返航：" label-width="160px">
            <el-switch
              v-model="form.enableLowBatteryReturn"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="form.enableLowBatteryReturn" prop="thresholdBatteryLevel">
        <div class="progress-title">低电量返航设置</div>
        <div class="progress-box">
          <el-progress
            :width="120"
            style="margin: 0 auto"
            :stroke-width="7"
            type="dashboard"
            :percentage="Number(form.thresholdBatteryLevel)"
            :color="powerColors"
          ></el-progress>
        </div>
        <el-slider v-model="form.thresholdBatteryLevel" show-input :max="99" />
      </el-form-item>
    </el-form>
    <!-- 底部开始 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">取 消</el-button>
      <el-button type="primary" @click="handleClick" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import * as shipApi from 'api/shipinfo';
import { BASE_CONSTANTS } from '@/config';

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'edit'
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    // 检查电量
    let checkPower = (rule, value, cb) => {
      //验证输入的电量范围
      const regPower = /^(([1-8][0-9]?|9[0-8]?)\.\d+|[1-9][0-9]?)$/;
      if (regPower.test(value)) {
        return cb();
      }
      cb(new Error(`请输入 1 - 99 的数值`));
    };
    return {
      powerColors: Object.freeze(BASE_CONSTANTS.powerColors()),
      loading: false,
      //表单数据
      form: {
        enableServerCommunicationCircuitBreaker: true,
        enableRemoteControlCommunicationCircuitBreaker: true,
        enableObstacleAvoidance: true,
        enableLowBatteryReturn: true,
        thresholdBatteryLevel: 0
      },
      rules: Object.freeze({
        thresholdBatteryLevel: [
          { required: true, message: '请输入返航电量', trigger: 'blur' },
          { validator: checkPower, trigger: 'change' }
        ]
      })
    };
  },

  methods: {
    /**
     * 组件打开的回调
     */
    openDialog() {
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        this.$refs.form.clearValidate();
      });
    },
    /**
     *确定
     */
    async handleClick() {
      this.$refs.form.validate(async (valid) => {
        if (valid || !this.form.enableLowBatteryReturn) {
          this.loading = true;
          let { errorCode } = await shipApi.apiSetConfigShip(this.currentRow.id, this.form);
          this.loading = false;
          if (+errorCode === 0) {
            this.$message.success('设置成功');
            this.cancalClick();
          }
        }
      });
    },

    /**
     * 取消
     */
    cancalClick() {
      this.$emit('update:isShow');
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
.progress-title {
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}
.progress-box {
  display: flex;
}
</style>
