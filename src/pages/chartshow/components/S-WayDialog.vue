<template>
  <div>
    <Dialog :isShow="true" :isDisable="true" :item="way" @handleBoxClose="handleBoxClose">
      <template #item-box>
        <!-- 信息框-->
        <div class="item-box-title">{{ way.ident }} 航道</div>
        <div class="item-box">
          <div class="item-left">起点</div>
          <div>{{ way.departure.navaid.ident }}</div>
        </div>
        <div class="item-box">
          <div class="item-left">终点</div>
          <div>{{ way.destination.navaid.ident }}</div>
        </div>
        <div class="item-box">
          <div class="item-left">长度</div>
          <div>{{ way.totalDistance.toFixed(2) }} m</div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/common/dialog/Dialog.vue';

export default {
  name: 'S-PortDialog',
  components: { Dialog },
  props: {
    way: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'way'
    }
  },

  methods: {
    /**
     * 关闭弹窗
     */
    handleBoxClose() {
      this.$emit('handleBoxClose', this.type);
    }
  }
};
</script>

<style scoped lang="less">
@way-background-color: #1c6db9;
@way-color: #242f42;

/* 港口maker */
.way-maker {
  padding: 0 8px;
  text-align: center;
  border-radius: 18px;
  font-weight: bold;
  font-size: 14px;
  line-height: 25px;
  white-space: nowrap;
  background-color: @way-background-color;
  color: @way-color;
}
/deep/.port-box {
  min-width: 170px !important;
  top: 25px;
}
</style>
