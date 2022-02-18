<template>
  <el-dialog
    title="设置返航点位"
    :visible.sync="isShow"
    width="75%"
    center
    :before-close="handleClose"
  >
    <div class="return-container">
      <Amap ref="amap" class="return-box" :isClickMap="isClickMap">
        <template #return-point>
          <!-- 返航点标记 -->
          <template v-if="returnPointList.length">
            <el-amap-marker
              v-for="(marker, index) in returnPointList"
              :position="[marker.location.longitude, marker.location.latitude]"
              :key="index"
              :draggable="isClickMap"
              :events="retrunEvents"
            >
              <div class="markerImg">返</div>
            </el-amap-marker>
          </template>
        </template>
      </Amap>
      <!-- <div class="return-btn">
        <el-button type="primary" @click="isClickMap = true" v-show="!isClickMap">编辑</el-button>
        <el-button type="primary" @click="updateEdit" v-show="isClickMap" :loading="loading"
          >保存</el-button
        >
        <el-button @click="isClickMap = false" v-show="isClickMap">取消</el-button>
      </div> -->
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="isClickMap = true" v-show="!isClickMap">编辑</el-button>
      <el-button @click="cancalClick" :loading="loading" v-show="isClickMap">取消</el-button>
      <el-button type="primary" @click="handleOk" :loading="loading" v-show="isClickMap"
        >确定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils/handleLngLat';
import { BASE_CONSTANTS } from '@/config';
import { apiPostExecutePlan, apiGetPlan } from 'api/plan';
import Amap from '@/components/amap/Amap.vue';
import { apiGetReturnPointShip, apiSetReturnPointShip } from 'api/shipinfo';
export default {
  components: { Amap },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    returnPointList: {
      type: Array,
      default: () => []
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isClickMap: true, // 返航点信息
      loading: false,
      params: {
        id: null,
        location: ''
      },
      retrunEvents: Object.freeze({})
    };
  },
  created() {},
  methods: {
    /**
     * dialog关闭之前的回调
     */
    handleClose() {
      this.cancalClick();
      this.$nextTick(() => {
        console.log('dialog关闭之前的回调');
      });
    },
    async updateEdit() {
      // this.isClickMap = false;
      // this.loading = true;
      // let location = this.returnPointList[0].location;
      // let params = this.returnPointList[0].location;
      // return;
      // const { data } = await apiSetReturnPointShip();
      // if (+errorCode === 0) {
      //   this.$message.success('更新成功');
      // }
    },
    /**
     * 执行
     */
    async handleOk() {
      this.cancalClick();
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
.return-container {
  .return-box {
    height: 60vh;
  }
  .return-btn {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
