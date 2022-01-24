<template>
  <el-dialog
    :title="this.title === 'add' ? '添加组织' : '修改组织'"
    :visible.sync="isShow"
    width="30%"
    center
    :before-close="cancalClick"
    @open="openDialog"
  >
    <el-form ref="from" label-width="80px" :rules="rules" :model="from">
      <el-form-item label="组织名" prop="name">
        <el-input v-model="from.name" placeholder="请输入组织名" clearable />
      </el-form-item>
    </el-form>
    <!-- 底部开始 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">取 消</el-button>
      <el-button type="primary" @click="handleClick" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import * as organApi from 'api/organization';

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'edit' //'edit','add'
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    // 自定义校验规则
    let checkChinese = (rule, value, cb) => {
      //验证机构名称是否合法
      const regChinese = /^[\u4E00-\u9FA5]+$/; //匹配中文字符
      if (regChinese.test(value)) {
        return cb();
      }
      cb(new Error('请输入中文的组织名称'));
    };
    return {
      loading: false,
      from: {
        name: ''
      },
      // 验证规则
      rules: Object.freeze({
        name: [
          { required: true, message: '请输入组织名称', trigger: 'blur' },
          {
            validator: checkChinese,
            trigger: 'blur'
          }
        ]
      })
    };
  },
  methods: {
    /**
     * 编辑模式打开的回调
     */
    openDialog() {
      if (this.title === 'edit') {
        this.$nextTick(() => {
          this.$refs.from.clearValidate();
          this.from.name = this.currentRow.name;
        });
      } else {
        this.$nextTick(() => {
          this.from.name = '';
        });
      }
    },
    /**
     *确定添加或者修改
     */
    async handleClick() {
      this.loading = true;
      if (this.title === 'add') {
        let res = await organApi.apiAddOrgan(this.from);
        if (+res.errorCode === 0) {
          this.$message.success('添加成功');
        }
      } else {
        let res = await organApi.apiEditOrgan(this.from);
        if (+res.errorCode === 0) {
          this.$message.success('修改成功');
        }
      }
      this.cancalClick();
      this.loading = false;
      this.$parent.getOrganList();
    },
    /**
     * 取消
     */
    cancalClick() {
      this.$emit('update:isShow');
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
