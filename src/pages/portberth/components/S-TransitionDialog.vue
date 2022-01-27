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
          {{ BASE_CONSTANTS.transitionDirectione(value.direction) }}
          {{ BASE_CONSTANTS.transitionType(value.type) }} }}过渡路径
        </div>
        <div v-show="value.type === 2" class="item-box">
          <div class="item-left">航标</div>
          <div class="item-select">
            <el-select v-model="value.navaidId" placeholder="请选择" size="mini">
              <el-option
                v-for="nava in navaList"
                :key="nava.id"
                :label="nava.ident"
                :value="nava.id"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div v-show="value.type == 1" class="item-box">
          <div class="item-left">泊位</div>
          <div class="item-select">
            <el-select v-model="value.berthId" placeholder="请选择" size="mini">
              <el-option
                v-for="berth in berthList"
                :key="berth.id"
                :label="berth.ident"
                :value="berth.id"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">端点</div>
          <div class="item-select">
            <el-select v-model="value.procedureEndpointId" placeholder="请选择" size="mini">
              <el-option
                v-for="point in pointList"
                :key="point.id"
                :label="point.ident"
                :value="point.id"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="item-box">
          <div class="item-left">方向</div>
          <div class="item-select">
            <el-radio-group
              v-model="value.direction"
              @change="(val) => (value.path = value.path.reverse())"
            >
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
  name: 'S-TransitionDialog',
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
      default: 'transition'
    },
    // 删除的请求接口函数名,在api文件中
    delFunc: {
      type: String,
      default: 'apiDelTransition'
    },
    navaList: {
      type: Array,
      default: () => []
    },
    berthList: {
      type: Array,
      default: () => []
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
