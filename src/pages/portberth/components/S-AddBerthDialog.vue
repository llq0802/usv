<template>
  <div>
    <div class="port-maker text-style shadow">
      <i class="iconfont el-icon-gangkou"></i>
      {{ value.ident || '泊位名' }}
    </div>
    <Dialog
      :isShow="true"
      :item="value"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
      @handleEdit="handleEdit"
    >
      <template #item-box>
        <!-- 泊位信息框 -->
        <div class="item-box-title">{{ value.ident }} 泊位</div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="value.ident" size="mini" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">面积</div>
          <div>{{ value.area ? value.area : 0 }} ㎡</div>
        </div>
        <div class="item-box">
          <div class="item-left">坐标</div>
          <div>
            {{ value.latitude.toFixed(6) + '，' + value.longitude.toFixed(6) }}
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/common/dialog/Dialog.vue';

export default {
  name: 'S-AddBerthDialog',
  components: { Dialog },
  props: {
    value: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'berth'
    }
  },
  methods: {
    /**
     * 关闭弹窗
     */
    handleBoxClose() {
      this.$emit('handleAddBoxClose', this.value);
    },
    /**
     * 保存
     */
    handleEdit() {
      this.$emit('handleAddSava', this.type, this.value);
    },
    /**
     * 删除
     */
    handleDelete() {
      this.$emit('handleDelete', this.value.id);
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
