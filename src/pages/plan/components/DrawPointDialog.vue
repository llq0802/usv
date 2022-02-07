<template>
  <!-- 生成航线 -->
  <el-dialog title="生成计划点" :visible="drawPointlogVisible" width="30%" center @close="closeDialog">
    <el-row>
      <el-col :span="10">
        <div style="text-align: right; margin-bottom: 10px">请选择轨迹：</div>
      </el-col>
      <el-col :span="5"><el-radio v-model="pointRadio" label="1">平滑轨迹</el-radio></el-col>
      <el-col :span="5"><el-radio v-model="pointRadio" label="2">实际轨迹</el-radio></el-col>
      <el-col :span="4">&nbsp;</el-col>
    </el-row>
    <el-row>
      <el-col :span="10">
        <div style="text-align: right; line-height: 28px">容差：</div>
      </el-col>
      <el-col :span="8"
        ><el-input style="width: 60px" v-model="tolerance" @blur="validTolerance">
        </el-input>
        m</el-col
      >
      <el-col :span="8">&nbsp;</el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { apiSimpleTrack } from 'api/geography';
import { deepClone, confirmMsg } from "@/utils";
import { strArrToReTdArr } from '@/utils/handleLngLat';
export default {
  props: {
    drawPointlogVisible: {
      type: Boolean,
      default: false
    },
    realRouteTrack: Array,
    smoothRouteTrack: Array
  },
  data() {
    return {
      // 轨迹类型
      pointRadio: '1',
      // 容差值
      tolerance: 1
    }
  },
  methods: {
    // 校验容差值
    validTolerance() {
      if (!this.tolerance) {
        this.tolerance = 1;
      }
    },
    // 生成计划点
    async confirm() {
      let routeTrack = this.pointRadio==='1'?deepClone(this.smoothRouteTrack):deepClone(this.realRouteTrack);
      let arr = [], simplePath = [];
      for (let item of routeTrack) {
        if (Object.prototype.toString.call(item) === '[object Array]') {
          arr.push(item.reverse().toString());
        } else {
          arr.push(item.Q + ',' + item.R);
        }
      }
      const res = await apiSimpleTrack(this.tolerance, arr);
      if (res.errorCode) return;
      simplePath = strArrToReTdArr(res.data.geom);
      this.$parent.drawPointlogVisible = false;
      const cf = await confirmMsg(this, `此操作将覆盖原有计划点`);
      if (cf === 'cancel') return;
      this.$emit('generatePoint', simplePath);
    },
    // 关闭对话框
    closeDialog() {
      this.$parent.drawPointlogVisible = false;
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>