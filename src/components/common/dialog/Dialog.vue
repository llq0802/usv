<template>
  <div>
    <div class="box-mark" v-if="isCtrl"></div>
    <div
      v-show="isShow"
      :class="{ opacity03: isCtrl, 'port-box': true, shadow: true }"
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
    isCtrl: {
      type: Boolean,
      default: false
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

<style scoped lang="less">
.opacity03 {
  opacity: 0.3;
}
//港口信息框的遮罩层
.box-mark {
  width: 19vw !important;
  height: 40vh !important;
  background-color: transparent;
  position: absolute;
  cursor: url(http://webapi.amap.com/theme/v1.3/openhand.cur), pointer !important;
  z-index: 100;
}
</style>
