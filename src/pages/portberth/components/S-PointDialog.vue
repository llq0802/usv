<template>
  <div>
    <div class="point-point" @click.stop="handleCurrentClick"></div>
    <div class="text-style shadow" @click.stop="handleCurrentClick">
      {{ value.ident }}
    </div>
    <Dialog
      :isShow="isShow"
      :item="value"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
      @handleEdit="handleEdit"
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
            {{
              value.locationObj.latitude.toFixed(6) + '，' + value.locationObj.longitude.toFixed(6)
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
  name: 'S-PointDialog',
  components: { Dialog },
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
      default: 'point'
    }, // 删除的请求接口函数名,在api文件中
    delFunc: {
      type: String,
      default: 'apiDelPoint'
    }
  },
  computed: {
    isShow() {
      return this.currentValue && this.currentValue.id === this.value.id;
    }
  },
  methods: {
    handleCurrentClick() {
      this.$emit('handleCurrentClick', this.type, this.value);
    },
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
