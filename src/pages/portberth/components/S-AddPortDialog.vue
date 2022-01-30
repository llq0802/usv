<template>
  <div>
    <div class="port-maker text-style shadow">
      <i class="iconfont el-icon-gangkou"></i>
      {{ port.name || '港口名' }}
    </div>
    <Dialog
      :isShow="true"
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
            <el-input placeholder="请输入港口名称" v-model="port.name" size="mini" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">标识</div>
          <div>
            <el-input placeholder="请输入四个大写字母" v-model="port.ident" size="mini" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">层级</div>
          <el-input v-model="port.zoomLevel" size="mini" />
        </div>
        <div class="item-box">
          <div class="item-left">面积</div>
          <div>{{ port.area ? port.area : 0 }} ㎡</div>
        </div>
        <div class="item-box">
          <div class="item-left">坐标</div>
          <div>
            {{ port.latitude.toFixed(6) + '，' + port.longitude.toFixed(6) }}
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/common/dialog/Dialog.vue';

export default {
  name: 'S-AddPortDialog',
  components: { Dialog },
  props: {
    port: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'port'
    }
  },
  methods: {
    /**
     * 关闭弹窗
     */
    handleBoxClose() {
      this.$emit('handleAddBoxClose', this.type);
    },
    /**
     * 保存
     */
    handleEdit() {
      this.$emit('handleAddSava', this.type, this.port);
    },
    /**
     * 删除
     */
    handleDelete() {
      this.$emit('handleDelete', this.port.id);
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
