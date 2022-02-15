<template>
  <div>
    <Dialog
      :isShow="isShow"
      :item="value"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
      @handleEdit="handleEdit"
    >
      <template #item-box>
        <div class="item-box-title">
          {{ BASE_CONSTANTS.procedureType(value.type) }}程序 {{ value.ident }}
        </div>
        <div class="item-box">
          <div class="item-left">名称</div>
          <div>
            <el-input type="text" v-model="value.ident" size="mini" />
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">起点</div>
          <div class="item-select">
            <el-select v-model="value.startId" placeholder="请选择" size="mini">
              <el-option
                v-for="(point, index) in pointList"
                :key="index + 'ee'"
                :label="point.ident"
                :value="point.id"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">终点</div>
          <div class="item-select">
            <el-select v-model="value.endId" placeholder="请选择" size="mini">
              <el-option
                v-for="(point, index) in pointList"
                :key="index + 'dd'"
                :label="point.ident"
                :value="point.id"
              >
              </el-option>
            </el-select>
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
  name: 'S-ProcedureDialog',
  components: { Dialog },
  data() {
    return {
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS)
    };
  },
  props: {
    currentValue: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    value: {
      type: Object,
      isRequired: true,
      default: () => {}
    },
    type: {
      type: String,
      default: 'procedure'
    },
    // 删除的请求接口函数名,在api文件中
    delFunc: {
      type: String,
      default: 'apiDelProcedure'
    },
    pointList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isShow() {
      return this.currentValue && this.currentValue.id === this.value.id;
    }
  },
  methods: {
    handleBoxClose() {
      this.$emit('handleBoxClose', this.type);
    },
    handleEdit() {
      this.$emit('handleEdit', this.type, this.value);
    },
    handleDelete() {
      this.$emit('handleDelete', this.value.id, this.delFunc);
    }
  }
};
</script>

<style scoped lang="less"></style>
