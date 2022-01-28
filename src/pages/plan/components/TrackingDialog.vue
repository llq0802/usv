<template>
  <!-- 轨迹跟踪 -->
  <el-dialog title="轨迹跟踪" :visible="trackinglogVisible" width="30%" center @close="closeDialog">
    <el-form
      ref="routeTrackFormRef"
      label-width="110px"
      :rules="routeTrackRules"
      :model="routeTrackFrom"
    >
      <el-form-item label="绘制轨迹船只" prop="usvId">
        <el-select
          placeholder="请选择在线船只"
          v-model="routeTrackFrom.usvId"
          clearable
          filterable
          :filter-method="(keyword) => filterShipData(keyword, (states = [0, 1, 2, 3, 4, 5]))"
          @visible-change="getShipData($event, (states = [0, 1, 2, 3, 4, 5]))"
          :loading="remoteLoading"
        >
          <el-option
            v-for="item in shipInfoList"
            :key="item.id"
            :label="item.displayName"
            :value="item.id"
          >
            <span style="float: left">{{ item.displayName }}</span>
            <span
              v-if="item.runtimeInfo.state == 0"
              style="float: right; color: #8492a6; font-size: 13px"
            >
              {{ BASE_CONSTANTS.usvState(item.runtimeInfo.state) }}
            </span>
            <span v-else style="float: right; color: rgba(29, 127, 238, 0.938); font-size: 13px">
              {{ BASE_CONSTANTS.usvState(item.runtimeInfo.state) }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button @click="confirm" type="primary">确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { BASE_CONSTANTS } from '@/config';
import { apiGetShip } from 'api/usv';
export default {
  props: {
    trackinglogVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      BASE_CONSTANTS,
      routeTrackFrom: {
        usvId: null,
      },
      // 选择自动绘制轨迹的船只
      routeTrackRules: {
        usvId: [{ required: true, message: '请选择需要绘制轨迹船只', trigger: 'change' }],
      },
      // 加载loading
      remoteLoading: false,
      // 船只信息
      shipInfoList: []
    }
  },
  methods: {
    //获取在线船只
    async getShipData(flag, states) {
      if (!flag) return this.shipInfoList = [];
      this.remoteLoading = true;
      const { data: res } = await apiGetShip({
        'Page': 1, 'Size': 999, 'Condition.States': states
      })
      if (!res.errorCode) {
        this.shipInfoList = res.result;
      }
      this.remoteLoading = false;
    },
    // 关键字查询船只
    async filterShipData(keyword, states) {
      this.remoteLoading = true;
      const { data: res } = await apiGetShip({
        'Page': 1, 'Size': 999, 'Condition.States': states, 'Condition.Keyword': keyword
      })
      if (!res.errorCode) {
        this.shipInfoList = res.result;
      }
      this.remoteLoading = false;
    },
    // 确认具体船只
    async confirm () {
      this.$refs.routeTrackFormRef.validate(async val => {
        if(!val) return;
        this.$emit('getUsvId', this.routeTrackFrom.usvId)
      })
    },
    // 关闭对话框
    closeDialog () {
      this.$parent.trackinglogVisible = false;
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>