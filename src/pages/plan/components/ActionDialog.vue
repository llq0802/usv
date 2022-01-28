<template>
  <!-- 执行计划 -->
      <el-dialog title="执行计划" :visible="actionlogVisible" width="30%" center @close="cancel">
        <el-form ref="actionFormRef" label-width="110px" :rules="actionRules" :model="actionForm">
          <el-form-item label="执行计划船只" prop="usvId">
            <el-select
              placeholder="请选择船只"
              v-model="actionForm.usvId"
              clearable
              filterable
              v-loadmore="getNextPageShipList"
              :filter-method="keyword => filterShipData(keyword, (states = [0, 1, 2, 3, 4, 5]))"
              @visible-change="getShipData($event, (states = [0, 1, 2, 3, 4, 5]))"
              :loading="remoteLoading"
            >
              <el-option v-for="item in shipInfoList" :key="item.id" :label="item.displayName" :value="item.id">
                <span style="float: left">{{ item.displayName }}</span>
                <span v-if="item.runtimeInfo.state == 0" style="float: right; color: #8492a6; font-size: 13px">
                  {{ BASE_CONSTANTS.usvState(item.runtimeInfo.state) }}
                </span>
                <span v-else style="float: right; color: rgba(29, 127, 238, 0.938); font-size: 13px">
                  {{ BASE_CONSTANTS.usvState(item.runtimeInfo.state) }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- 选择返航方式 -->
            <el-radio v-model="actionForm.returnMode" :label="1">{{ BASE_CONSTANTS.returnMode(1) }}</el-radio>
            <el-radio v-model="actionForm.returnMode" :label="2">{{ BASE_CONSTANTS.returnMode(2) }}</el-radio>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="medium" @click="cancel">取 消</el-button>
          <el-button size="medium" type="primary" @click="confirm($event)" :loading="actionPlanLoading">确 定</el-button>
        </span>
      </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { BASE_CONSTANTS } from '@/config';
import { apiGetShip } from 'api/usv';
import { apiPostExecutePlan } from 'api/plan';

export default {
  props: {
    actionlogVisible: {
      type: Boolean,
      default: false
    },
    planId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      BASE_CONSTANTS,
      actionForm: {
        planId: null,
        usvId: null,
        returnMode: 1,
      },
      // 校验规则
      actionRules: {
        usvId: [{ required: true, message: '请选择要执行计划的船只', trigger: 'change' }],
      },
      remoteLoading: false,
      states: [0, 1, 2, 3, 4, 5],
      page: 1,
      total: 0,
      keyword: '',
      shipInfoList: [],
      actionPlanLoading: false
    }
  },
  methods: {
    //获取在线船只
    async getShipData(flag, states) {
      if (!flag) {
        this.shipInfoList = [];
        this.total = 0;
        this.page = 1;
      }
      this.remoteLoading = true;
      const res = await apiGetShip({
        'Page': this.page, 'Size': 10, 'Condition.States': states,
      })
      if (!res.errorCode) {
        this.shipInfoList = res.data.result;
        this.total = res.data.total;
      }
      this.remoteLoading = false;
    },
    // 关键字查询船只
    async filterShipData(keyword, states) {
      this.keyword = keyword;
      this.remoteLoading = true;
      const res = await apiGetShip({
        'Page': this.page, 'Size': 10, 'Condition.States': states, 'Condition.Keyword': keyword
      })
      if (!res.errorCode) {
        this.shipInfoList = res.data.result;
        this.total = res.data.total;
      }
      this.remoteLoading = false;
    },
    // 获取下一页数据
    async getNextPageShipList() {
      if (this.total === this.shipInfoList.length) return;
      this.page++;
      const res = await apiGetShip({
        'Page': this.page, 'Size': 10, 'Condition.States': this.states, 'Condition.Keyword': this.keyword
      });
      if (res.errorCode) return;
      for (let item of res.data.result) {
        this.shipInfoList.push(item);
      }
    },
    // 确认 执行计划
    confirm () {
      this.$refs.actionFormRef.validate(async val => {
        if(!val) return;
        this.actionPlanLoading = true;
        this.actionForm.planId = this.planId;
        const res = await apiPostExecutePlan(this.actionForm);
        if (!res.errorCode) this.$message.success(`计划执行成功`);
        this.actionPlanLoading = false;
      })
    },
    cancel() {
      this.$parent.actionlogVisible = false;
    }
  },
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>