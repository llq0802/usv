<template>
  <div>
    <Dialog
      :isShow="true"
      :item="value"
      :isCtrl="isCtrl"
      @handleBoxClose="handleBoxClose"
      @handleEdit="handleEdit"
    >
      <template #item-box>
        <div class="item-box-title">
          {{ BASE_CONSTANTS.procedureType(value.type) }}程序 {{ value.ident }}
        </div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input v-model="value.ident" size="mini" placeholder="输入大写字母和数字" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">起点</div>
          <div>
            <el-input v-model="value.startPoint.ident" size="mini" disabled />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">终点</div>
          <div>
            <el-input v-model="value.endPoint.ident" size="mini" disabled />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">方向</div>
          <div class="item-select">
            <el-radio-group v-model="value.type">
              <el-radio :label="1">离港</el-radio>
              <el-radio :label="2">进港</el-radio>
            </el-radio-group>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/common/dialog/Dialog.vue';
import { BASE_CONSTANTS } from '@/config';
export default {
  name: 'S-addProcedureDialog',
  components: { Dialog },
  data() {
    return {
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS)
    };
  },
  props: {
    value: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'procedure'
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
.port-box {
  left: -14px;
  top: 35px;
}
</style>
