<template>
  <el-row>
    <el-col :span="6" style="min-width: 160px; margin-right: 10px">
      <el-input
        clearable
        :placeholder="placeholder" 
        v-model="keyWords" 
        @keydown.enter="handleEnter(keyWords)" 
        @clear='handleClear'>
        <el-button slot="append" icon="el-icon-search" @click="handleSearch(keyWords)"></el-button>
      </el-input>
    </el-col>
    <el-col :span="4">
      <el-button v-if="buttonName" type="primary" @click="handleDrag(keyWords)">{{
        buttonName
      }}</el-button>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return { keyWords: '' };
  },
  props: {
    placeholder:{
      type: String,
      default: '请输入内容'
    },
    buttonName:{
      type: String,
      default: ''
    }
  },

  methods: {
    handleEnter(val) {
      console.log(val)
      this.$emit('keydownEnter', val)
    },
    handleSearch(val) {
      this.$emit('buttonSearch', val);
    },
    handleDrag(val) {
      this.$emit('handleDrag', val);
    },
    handleClear() {
      this.$emit('clear');
    }
  }
};
</script>

<style lang="less" scoped>
@elColor: #409eff;
/deep/ .el-input-group__append,
.el-input-group__prepend {
  background-color: @elColor;
  color: #fafafa;
}
</style>
