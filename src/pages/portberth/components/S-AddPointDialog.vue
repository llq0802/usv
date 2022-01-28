<template>
  <div>
    <div class="point-point"></div>
    <div class="text-style shadow">
      {{ value.ident }}
    </div>
    <Dialog
      :isShow="true"
      :item="value"
      @handleAddBoxClose="handleAddBoxClose"
      @handleAddEdit="handleAddEdit"
    >
      <template #item-box>
        <!-- 端点信息框 -->
        <div class="item-box-title">{{ value.ident }} 端点</div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="value.ident" size="mini" />
          </div>
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
  name: 'S-addPointDialog',
  components: { Dialog },
  props: {
    value: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'point'
    }
  },
  methods: {
    handleAddBoxClose() {
      this.$emit('handleAddBoxClose', this.type);
    },
    handleAddEdit() {
      this.$emit('handleAddEdit', this.type, this.value);
    }
  }
};
</script>

<style scoped lang="less">
@point-background-color: rgb(29, 57, 136);
/* 端点圆点 */
.point-point {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: @point-background-color;
}
</style>
