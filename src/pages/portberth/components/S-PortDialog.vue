<template>
  <div>
    <div class="port-maker text-style shadow" @click.stop="handleCurrentClick">
      <i class="iconfont el-icon-gangkou"></i>
      {{ port.name }}
    </div>
    <Dialog
      :isShow="isShow"
      :item="port"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
      @handleEdit="handleEdit"
    >
      <template #item-box>
        <!-- 港口信息框-->
        <div class="item-box-title">{{ port.name }} 港口</div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="port.name" size="mini" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">层级</div>
          <el-input type="text" v-model="port.zoomLevel" size="mini" />
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
      isRequired: true,
      default: () => {}
    },
    port: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'port'
    },
    // 删除港口的请求接口函数名,在api文件下port文件中
    delFunc: {
      type: String,
      default: 'apiDelPort'
    }
  },
  computed: {
    isShow() {
      return this.currentPort.isPortEdit && this.currentPort.id === this.port.id;
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
    },
    /**
     * 更新
     */
    handleEdit() {
      this.$emit('handleEdit', this.type, this.port);
    },
    /**
     * 删除
     */
    handleDelete() {
      this.$emit('handleDelete', this.port.id, this.delFunc);
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
