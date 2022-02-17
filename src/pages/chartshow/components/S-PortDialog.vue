<template>
  <div>
    <div class="port-maker text-style shadow" @click.stop="handleCurrentClick">
      <i class="iconfont el-icon-gangkou"></i>
      {{ port.name }}
    </div>
    <Dialog :isShow="isShow" :item="port" :isDisable="true" @handleBoxClose="handleBoxClose">
      <template #item-box>
        <!-- 港口信息框-->
        <div class="item-box-title">{{ port.name }} 港口</div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="port.name" size="mini" disabled />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">层级</div>
          <el-input type="text" v-model="port.zoomLevel" size="mini" disabled />
        </div>
        <div class="item-box">
          <div class="item-left">面积</div>
          <div>{{ port.area.toFixed(2) }} ㎡</div>
        </div>
        <div class="item-box">
          <div class="item-left">坐标</div>
          <div>
            {{
              port.locationObj.latitude.toFixed(6) + '，' + port.locationObj.longitude.toFixed(6)
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
    currentPort: {
      type: Object,
      default: () => {}
    },
    port: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'port'
    }
  },
  computed: {
    isShow() {
      return this.currentPort && this.currentPort.id === this.port.id;
    }
  },
  methods: {
    /**
     * 打开弹窗
     */
    handleCurrentClick() {
      this.$emit('handleCurrentClick', this.type, this.port);
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
@port-background-color: #1c6db9;
@port-color: #242f42;

/* 港口maker */
.port-maker {
  padding: 0 8px;
  text-align: center;
  border-radius: 18px;
  font-weight: bold;
  font-size: 14px;
  line-height: 25px;
  white-space: nowrap;
  background-color: @port-background-color;
  color: @port-color;
}
</style>
