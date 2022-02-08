<template>
  <div class="wayinfo-content shadow" ref="wayinfoBox">
    <i class="el-icon-close" @click="handleBoxClose"></i>
    <div>
      <div class="item-box-title">{{ currentWay[0].ident }}航道</div>
      <!-- <div class="item-box">
        <div class="item-left">航道名称：</div>
        <div>ident</div>
      </div> -->
      <div class="item-box">
        <div class="item-left">航道起点：</div>
        <div>{{ currentWay[0].departure.navaid.ident }}</div>
      </div>
      <div class="item-box">
        <div class="item-left">航道终点：</div>
        <div>{{ currentWay[0].destination.navaid.ident }}</div>
      </div>
      <div class="item-box">
        <div class="item-left">航道长度：</div>
        <div>{{ currentWay[0].totalDistance.toFixed(2) }} m</div>
      </div>
      <div class="item-box">
        <el-tag v-for="(item, i) in currentWay" :key="i">
          {{ item.ident }}
        </el-tag>
      </div>
    </div>
    <!-- 按钮 -->
    <div>
      <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit"
        >修改航道</el-button
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
    return {};
  },
  props: {
    currentWay: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleEdit() {
      console.log('handleEdit');
      this.$emit('handleEdit', 'way');
    },
    handleDelete() {
      console.log('handleDelete');
      this.$emit('handleDelete');
    },
    handleBoxClose() {
      console.log('handleBoxClose');
      this.$emit('handleBoxClose');
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
