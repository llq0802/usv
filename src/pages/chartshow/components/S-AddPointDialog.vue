<template>
  <div>
    <div class="point-point"></div>
    <div class="text-style shadow">
      {{ value.ident }}
    </div>
    <Dialog
      :isShow="true"
      :item="value"
      :isCtrl="isCtrl"
      @handleBoxClose="handleBoxClose"
      @handleEdit="handleEdit"
    >
      <template #item-box>
        <!-- 端点信息框 -->
        <div class="item-box-title">{{ value.Ident || 'ABC' }} 端点</div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="value.Ident" placeholder="请输入三个字母" size="mini" />
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
      default: () => {}
    },
    type: {
      type: String,
      default: 'point'
    },
    isCtrl: {
      type: Boolean,
      default: false
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
      this.$emit('handleAddSava', this.type, this.value);
    }
  }
};
</script>

<style scoped lang="less">
@point-background-color: rgb(29, 57, 136);
/* 端点圆点 */
.point-point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: @point-background-color;
}
.port-box {
  left: -14px;
  top: 36px;
}
</style>
