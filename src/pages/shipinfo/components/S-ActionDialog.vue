<template>
  <el-dialog title="执行计划" :visible.sync="isShow" width="30%" center :before-close="actionClose">
    <el-form ref="actiomFrom" label-width="110px" :rules="actiomRules" :model="actiomFrom">
      <el-form-item label="选择计划" prop="planId">
        <el-select placeholder="请选择" v-model="actiomFrom.planId" clearable>
          <el-option
            v-for="item in planList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="返航方式" required>
        <!-- 选择返航方式 -->
        <el-radio v-model="actiomFrom.returnMode" :label="1">直线返航</el-radio>
        <el-radio v-model="actiomFrom.returnMode" :label="2">原路返航</el-radio>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">取 消</el-button>
      <el-button type="primary" @click="actionPlan" :loading="actionPlanLoading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { BASE_CONSTANTS } from '@/config';
import { apiPostExecutePlan, apiGetPlan } from 'api/plan';
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      planList: [],
      actionPlanLoading: false,
      // 执行计划数据
      actiomFrom: {
        planId: null,
        usvId: null,
        returnMode: 1 //1直线返航 , 2原路返航
      },
      // 执行计划校验规则
      actiomRules: Object.freeze({
        planId: [{ required: true, message: '请选择需要执行的计划', trigger: 'change' }]
      })
    };
  },
  async created() {
    const { data } = await apiGetPlan();
    this.planList = data.result;
  },
  methods: {
    /**
     * dialog关闭之前的回调
     */
    actionClose() {
      this.cancalClick();
      this.$nextTick(() => {
        this.$refs.actiomFrom.resetFields();
      });
    },
    /**
     * 执行计划
     */
    async actionPlan() {
      this.$refs.actiomFrom.validate(async (val) => {
        if (val) {
          try {
            this.actionPlanLoading = true;
            const { errorCode } = await apiPostExecutePlan(this.actiomFrom);
            this.actionPlanLoading = false;
            if (+errorCode === 0) {
              this.cancalClick();
              this.$message.success('开始执行计划');
              this.$router.push({
                path: 'runstate',
                query: { usvId: this.actiomFrom.usvId }
              });
            }
          } catch (error) {
            this.actionPlanLoading = false;
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
</style>
