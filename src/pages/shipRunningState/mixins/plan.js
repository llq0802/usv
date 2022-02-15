// api
import { apiGetPlanById, apiGetExecuteInfoByUsvId, apiCancelPlanById } from 'api/plan';
import { apiGetShipById } from 'api/usv';
import { apiPauseShip, apiResumeShip, apiReturnShip, apiResetShip } from 'api/shipinfo';

import { confirmMsg } from '@/utils';
export default {
  data() {
    return {
      // 停止执行计划
      shipStop: true
    }
  },
  methods: {
    // 获取计划标记点
    async getPlanCoor () {
      if (this.planId) {
        const res = await apiGetPlanById(this.planId);
        if (!res.errorCode) {
          // 排序获取信息
          res.data.fixes.sort(function (a, b) {
            return a.order - b.order;
          });
          for (let val of res.data.fixes) {
            val.location = trun(val.location);
          }
          this.pointList = res.data.fixes;
          this.getPreciseLngLat();
          this.nowPlanName = res.data.name;
        }
      }
    },
    // 集合精确点坐标
    getPreciseLngLat () {
      this.precisePointList = [];
      this.pointList.forEach(val => {
        if (val.requirePrecisionNavigation) {
          this.$set(this.precisePointList, this.precisePointList.length, val);
        }
      });
    },
    // 获取船只名字,获取计划id
    async getUsvName () {
      const res = apiGetShipById(this.usvId);
      if (!res.errorCode) {
        // 船只名字
        this.usvName = res.data.displayName;
        // 当前船只是否在执行计划,获取执行计划的id
        if (res.data.isExecutingPlan) {
          if (this.planId != res.data.executingPlanId) {
            this.planId = res.data.executingPlanId;
          }
        } else {
          this.planId = null;
        }
      }
    },
    // 获取计划信息
    async getPlanInfor () {
      const self = this;
      const res = await apiGetExecuteInfoByUsvId(this.usvId);
      if (!res.errorCode) {
        res.data.lastLocation = trun(res.data.lastLocation);
        self.setMeasurement = res.data;
      }
    },
    // 停止计划
    async stopPlan () {
      const cf = await confirmMsg(this, '即将停止执行该计划');
      if (cf === 'cancel') return this.$message.info('已取消!');
      const res = await apiCancelPlanById(this.usvId);
      if (!res.errorCode) {
        this.$message.success('计划已经停止！');
        this.$destroy();
      }
    },
    // 暂停任务
    async SuspendedTask () {
      const res = await apiPauseShip(this.setmanned.id);
      if (!res.errorCode) {
        // console.log(res);
        this.shipStop = false;
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 恢复任务
    async restoreTask () {
      const res = await apiResumeShip(this.setmanned.id);
      if (!res.errorCode) {
        // console.log(res);
        this.shipStop = true;
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 立即返航
    async immediatelyReturn () {
      const res = await apiReturnShip(this.setmanned.id);
      if (!res.errorCode) {
        // console.log(res);
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 无人船软复位
    async softReset () {
      const res = await apiResetShip(this.setmanned.id);
      if (!res.errorCode) {
        // console.log(res);
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
  },
}