<template>
  <el-row>
    <el-col :span="6" style="min-width: 160px; margin-right: 10px">
      <el-input placeholder="请输入内容" v-model="keyWords" @clear='handleClear' clearable>
        <el-button slot="append" icon="el-icon-search" @click="handleSearch(keyWords)"></el-button>
      </el-input>
    </el-col>
    <el-col :span="4">
      <el-button  v-if="buttonName" type="primary" @click="handleDrag(keyWords)">{{ buttonName }}</el-button>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {keyWords:''}
  },
  props: {
    buttonName:{
      type: String,
      default: ''
    }
      
  },
  
  methods: {
    handleSearch(val){
      this.$emit('buttonSearch', val);
    },
    handleDrag(val){
      this.$emit('handleDrag' ,val);
    },
    handleClear(){
      this.$emit('clear');
        console.log(this.keyWords);

    }
  }
};
</script

<style></style>
