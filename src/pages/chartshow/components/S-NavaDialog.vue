<template>
  <div>
    <div class="nava-maker"></div>
    <div class="nava-box shadow text-style" @click.stop="handleCurrentClick">
      {{ value.ident }}
    </div>
    <Dialog :isShow="isShow" :item="value" :isDisable="true" @handleBoxClose="handleBoxClose">
      <template #item-box>
        <div class="item-box-title">{{ value.ident }} 航标</div>
        <div class="item-box">
          <div class="item-left">半径</div>
          <div>
            <el-input
              type="number"
              v-model="value.radius"
              placeholder="请输入半径"
              size="mini"
              disabled
            />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">层级</div>
          <div>
            <el-input
              type="number"
              v-model="value.zoomLevel"
              placeholder="请输入层级"
              size="mini"
              disabled
            />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">坐标</div>
          <div>
            {{
              value.locationObj.latitude.toFixed(6) + '，' + value.locationObj.longitude.toFixed(6)
            }}
          </div>
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
    currentNava: {
      type: Object,
      default: () => {}
    },
    value: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'nava'
    }
  },
  computed: {
    isShow() {
      return this.currentNava && this.currentNava.id === this.value.id;
    }
  },
  methods: {
    /**
     * 打开弹窗
     */
    handleCurrentClick() {
      this.$emit('handleCurrentClick', this.type, this.value);
    },
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
@nava-background-color: rgba(80, 114, 209, 0.8);
@nava-maker-color: rgba(90, 115, 141, 1);
.port-box {
  left: 1px !important;
  top: 60px !important;
}
/**航标点样式 */
.nava-maker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 3px solid @nava-maker-color;
}
/*航标*/
.nava-box {
  position: absolute;
  top: 26px;
  left: -11px;
  padding: 3px;
  text-align: center;
  border-radius: 3px;
  color: rgb(76, 113, 212);
  background: @nava-background-color;
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-bottom: 8px solid @nava-background-color;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    position: absolute;
    top: -8px;
    left: 15px;
  }
}
/deep/.port-box {
  min-width: 170px !important;
  top: 65px;
  left: 0;
}
</style>
