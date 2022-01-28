<template>
  <div
    class="port-box shadow"
    v-show="isShow"
    @mousemove="eventStopPropagation('div', $event)"
    @mousedown="eventStopPropagation('div', $event)"
    @mouseenter="eventStopPropagation('input')"
  >
    <!-- 右上角X -->
    <i class="el-icon-close" @click.stop="handleBoxClose"></i>
    <!-- 插槽内容 -->
    <slot name="item-box"></slot>
    <!-- 按钮 -->
    <PortBtn :item="item" @handleDelete="handleDelete" @handleEdit="handleEdit" />
  </div>
</template>

<script>
import PortBtn from '../port-btn/PortBtn.vue';
export default {
  name: 'mydialog',
  components: {
    PortBtn
  },
  data() {
    return {};
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    /**
     * 阻止航标信息框以及input冒泡到地图
     */
    eventStopPropagation(el, event) {
      if (el === 'input') {
        const stop = (e) => {
          e.stopPropagation();
        };
        const inps = document.querySelectorAll('input');
        [...inps].map((itemInput) => {
          itemInput.onkeydown = stop;
        });
      } else {
        event.stopPropagation();
      }
    },
    /**
     * 关闭弹窗
     */
    handleBoxClose() {
      this.$emit('handleBoxClose');
    },
    /**
     * 删除
     */
    handleDelete() {
      this.$emit('handleDelete');
    },
    /**
     * 更新
     */
    handleEdit() {
      this.$emit('handleEdit');
    }
  }
};
</script>

<style scoped lang="less"></style>
