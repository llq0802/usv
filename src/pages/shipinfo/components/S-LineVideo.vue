<template>
  <el-dialog
    title="实时视频"
    :visible.sync="isShow"
    width="850px"
    center
    :before-close="cancalClick"
    @close="closeDialog"
  >
    <line-video :accessToken="accessToken" :url="url"></line-video>
  </el-dialog>
</template>

<script>
import LineVideo from 'components/common/line-video/OnLineVideo.vue';

export default {
  props: {
    accessToken: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  components: { LineVideo },

  methods: {
    /**
     * 组件关闭的回调
     */
    closeDialog() {
      this.$parent.checkTokenInterval && clearInterval(this.$parent.checkTokenInterval);
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
