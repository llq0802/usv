<template>
  <div class="content">
    <h1>首页</h1>
    <p>gshs</p>
  </div>
</template>

<script>
import bus from '@/utils/bus';
export default {
  name: 'dashboard',
  data() {
    return {
      name: localStorage.getItem('ms_username')
    };
  },
  components: {},
  computed: {
    role() {
      return this.name === 'admin' ? '超级管理员' : '普通用户';
    }
  },
  methods: {}
};
</script>

<style scoped lang="less">
.content {
}
</style>
