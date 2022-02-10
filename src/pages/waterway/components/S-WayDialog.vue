<template>
  <div class="wayinfo-content shadow">
    <i class="el-icon-close" @click="handleBoxClose"></i>
    <div>
      <div class="item-box-title">{{ currentWay.ident }} 航道</div>
      <!-- <div class="item-box">
        <div class="item-left">航道名称：</div>
        <div>ident</div>
      </div> -->
      <div class="item-box">
        <div class="item-left">航道起点：</div>
        <div>{{ currentWay.departure.navaid.ident }}</div>
      </div>
      <div class="item-box">
        <div class="item-left">航道终点：</div>
        <div>{{ currentWay.destination.navaid.ident }}</div>
      </div>
      <div class="item-box">
        <div class="item-left">航道长度：</div>
        <div>{{ currentWay.totalDistance.toFixed(2) }} m</div>
      </div>
      <div class="item-box">
        <el-button
          v-for="(item, i) in wayList"
          :key="i"
          size="mini"
          type="primary"
          :plain="i !== index"
          @click="handleBtnClick(item, i)"
        >
          {{ item.ident }}
        </el-button>
      </div>
    </div>
    <!-- 按钮 -->
    <div>
      <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit"
        >编辑航道</el-button
      >
      <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete"
        >删除航道</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'S-WayInfo',
  data() {
    return {
      index: 0
    };
  },
  props: {
    wayList: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'way'
    },
    // 删除的请求接口函数名,在api文件下文件中
    delFunc: {
      type: String,
      default: 'apiDelWay'
    }
  },
  computed: {
    currentWay() {
      return this.wayList[this.index];
    }
  },
  methods: {
    handleBtnClick(item, index) {
      this.index = index;
    },
    handleEdit() {
      this.$emit('handleEdit', this.type, this.currentWay);
    },
    handleDelete() {
      this.$emit('handleDelete', this.currentWay.id, this.type, this.delFunc);
    },
    handleBoxClose() {
      this.$emit('handleBoxClose', this.type);
    }
  }
};
</script>

<style scoped lang="less">
/**地图中的公共框中的X*/
.wayinfo-content {
  .el-icon-close {
    padding: 0 3px 3px;
    margin-bottom: 10px;
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 18px;
    &:hover {
      cursor: pointer;
    }
  }
  .item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>
