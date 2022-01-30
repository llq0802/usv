<template>
  <div>
    <Dialog :isShow="true" :item="value" @handleBoxClose="handleBoxClose" @handleEdit="handleEdit">
      <template #item-box>
        <div class="item-box-title">
          {{ BASE_CONSTANTS.transitionDirectione(value.direction) }}
          {{ BASE_CONSTANTS.transitionType(value.type) }} 过渡路径
        </div>

        <!-- 点到泊位,开始点与结束点不相同的时候才显示(进港-泊位)-->
        <div v-show="value.type === 1 && value.direction === 1" class="item-box">
          <div class="item-left">端点</div>
          <div>
            <el-input v-model="value.startMinPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type === 1 &&
            value.direction === 1 &&
            value.startMinPoint.id !== value.endMinPoint.id &&
            value.startMinPoint.ident !== value.endMinPoint.ident
          "
        >
          <div class="item-left">泊位</div>
          <div>
            <el-input v-model="value.endMinPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 泊位到点,开始点与结束点不相同的时候才显示 (离港-泊位)-->
        <div v-show="value.type === 1 && value.direction === 2" class="item-box">
          <div class="item-left">泊位</div>
          <div>
            <el-input v-model="value.startMinPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type === 1 &&
            value.direction === 2 &&
            value.startMinPoint.id !== value.endMinPoint.id &&
            value.startMinPoint.ident !== value.endMinPoint.ident
          "
        >
          <div class="item-left">端点</div>

          <div>
            <el-input v-model="value.endMinPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 点到航标,开始点与结束点不相同的时候才显示(离港-航标) -->
        <div v-show="value.type === 2 && value.direction === 2" class="item-box">
          <div class="item-left">端点</div>

          <div>
            <el-input v-model="value.startMinPoint.ident" disabled size="small" />
          </div>
        </div>
        <div
          class="item-box"
          v-show="
            value.type === 2 &&
            value.direction === 2 &&
            value.startMinPoint.id !== value.endMinPoint.id &&
            value.startMinPoint.ident !== value.endMinPoint.ident
          "
        >
          <div class="item-left">航标</div>
          <div>
            <el-input v-model="value.endMinPoint.ident" disabled size="small" />
          </div>
        </div>

        <!-- 航标到点 ,开始点与结束点不相同的时候才显示(进港-航标)-->
        <div v-show="value.type === 2 && value.direction === 1" class="item-box">
          <div class="item-left">航标</div>
          <div>
            <el-input v-model="value.startMinPoint.ident" disabled size="small" />
          </div>
        </div>

        <div
          class="item-box"
          v-show="
            value.type === 2 &&
            value.direction === 1 &&
            value.startMinPoint.id !== value.endMinPoint.id &&
            value.startMinPoint.ident !== value.endMinPoint.ident
          "
        >
          <div class="item-left">端点</div>
          <div>
            <el-input v-model="value.endMinPoint.ident" disabled size="small" />
          </div>
        </div>

        <div class="item-box">
          <div class="item-left">类型</div>
          <div class="item-select">
            <el-radio-group v-model="value.type" disabled>
              <el-radio :label="1">泊位</el-radio>
              <el-radio :label="2">航标</el-radio>
            </el-radio-group>
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
      [this.value.startMinPoint, this.value.endMinPoint] = [
        this.value.endMinPoint,
        this.value.startMinPoint
      ];
    },
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

<style scoped lang="less"></style>
