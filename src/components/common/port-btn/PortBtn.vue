<template>
  <!-- 按钮 -->
  <div class="port-btn-box">
    <el-button
      type="danger"
      size="mini"
      @click.stop="handleDelete"
      v-show="item.isClick == undefined"
      >删除</el-button
    >
    <el-button type="primary" size="mini" @click.stop="handleEdit"> 保存</el-button>
  </div>
</template>

<script>
export default {
  name: 'port-btn',
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    handleDelete() {
      this.$emit('handleDelete');
    },
    handleEdit() {
      this.$emit('handleEdit');
    }
  }
};
</script>

<style lang="less" scoped>
/**信息框按钮 */
.port-btn-box {
  text-align: center;
  padding-top: 10px;
}
</style>
