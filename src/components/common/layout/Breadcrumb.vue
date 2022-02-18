<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="item in dataList" :key="item.path">{{
        item.meta.title && item.meta.title
      }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
export default {
  name: 'Breadcrumb',
  data() {
    return {};
  },
  props: {
    dataList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  methods: {},
  mounted() {}
};
</script>
<style lang="less" scoped>
/deep/ .el-breadcrumb {
  padding-top: 5px;
  padding-left: 10px;
}
</style>
