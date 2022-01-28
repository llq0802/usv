<template>
  <div>
    <Dialog
      :isShow="isShow"
      :item="value"
      @handleAddBoxClose="handleAddBoxClose"
      @handleDelete="handleDelete"
      @handleAddEdit="handleAddEdit"
    >
      <template #item-box>
        <div class="item-box-title">
          {{ BASE_CONSTANTS.transitionDirectione(value.direction) }}
          {{ BASE_CONSTANTS.transitionType(value.type) }} }}过渡路径
        </div>

        <!-- 点到泊位,开始点与结束点不相同的时候才显示 -->
        <div v-show="value.type == 1 && value.direction == 1" class="item-box">
          <div>端点</div>
          <div>
            <el-input v-model="value.startMinDisPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type == 1 &&
            value.direction == 1 &&
            value.startMinDisPoint.id != value.endMinDisPoint.id &&
            value.startMinDisPoint.ident != value.endMinDisPoint.ident
          "
        >
          <div>泊位</div>
          <div>
            <el-input v-model="value.endMinDisPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 泊位到点,开始点与结束点不相同的时候才显示 -->
        <div v-show="value.type == 1 && value.direction == 2" class="item-box">
          <div>泊位</div>
          <div>
            <el-input v-model="value.startMinDisPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type == 1 &&
            value.direction == 2 &&
            value.startMinDisPoint.id != value.endMinDisPoint.id &&
            value.startMinDisPoint.ident != value.endMinDisPoint.ident
          "
        >
          <div>端点</div>
          <div>
            <el-input v-model="value.endMinDisPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 点到航标,开始点与结束点不相同的时候才显示 -->
        <div v-show="value.type == 2 && value.direction == 2" class="item-box">
          <div>端点</div>
          <div>
            <el-input v-model="value.startMinDisPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type == 2 &&
            value.direction == 2 &&
            value.startMinDisPoint.id != value.endMinDisPoint.id &&
            value.startMinDisPoint.ident != value.endMinDisPoint.ident
          "
        >
          <div>航标</div>
          <div>
            <el-input v-model="value.endMinDisPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 航标到点 ,开始点与结束点不相同的时候才显示-->
        <div v-show="value.type == 2 && value.direction == 1" class="item-box">
          <div>航标</div>
          <div>
            <el-input v-model="value.startMinDisPoint.ident" disabled size="small" />
          </div>
        </div>

        <div
          class="item-box"
          v-show="
            value.type == 2 &&
            value.direction == 1 &&
            value.startMinDisPoint.id != value.endMinDisPoint.id &&
            value.startMinDisPoint.ident != value.endMinDisPoint.ident
          "
        >
          <div>端点</div>
          <div>
            <el-input v-model="value.endMinDisPoint.ident" disabled size="small" />
          </div>
        </div>

        <div class="item-box">
          <div class="item-left">方向</div>
          <div class="item-select">
            <el-radio-group v-model="value.direction" @change="changeDirection">
              <el-radio :label="2">离港</el-radio>
              <el-radio :label="1">进港</el-radio>
            </el-radio-group>
          </div>
        </div>

        <div class="item-box">
          <div>类型</div>
          <div>
            <el-radio-group v-model="value.type" disabled>
              <el-radio :label="1">泊位</el-radio>
              <el-radio :label="2">航标</el-radio>
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
  name: 'S-addTransitionDialog',
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
      default: 'transition'
    }
  },
  methods: {
    //改变过渡路径的方向
    changeDirection(val) {
      this.value.path = this.value.path.reverse();
      [this.value.startMinDisPoint, this.value.endMinDisPoint] = [
        this.value.endMinDisPoint,
        this.value.startMinDisPoint
      ];
    },
    handleAddBoxClose() {
      this.$emit('handleAddBoxClose', this.type);
    },
    handleAddEdit() {
      this.$emit('handleAddEdit', this.type, this.value);
    }
  }
};
</script>

<style scoped lang="less"></style>
