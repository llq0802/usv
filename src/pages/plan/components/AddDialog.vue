<template>
  <!-- 添加dialog -->
  <el-dialog title="添加计划" :visible="addlogVisible" width="30%" center @close="closeAdd">
    <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
      <el-form-item label="计划名称" prop="name">
        <el-input v-model="addFrom.name" placeholder="请输入计划名称" clearable></el-input>
      </el-form-item>
      <el-form-item v-if="role == 'Administrator'" label="组织机构" prop="organizationId">
        <el-select placeholder="请选择" v-model="addFrom.organizationId">
          <el-option
            v-for="item in organInfoList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="medium" @click="$parent.addlogVisible = false">取 消</el-button>
      <el-button size="medium" type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { apiGetOrganAll } from 'api/organization';

export default {
  props: {
    addlogVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      role: window.localStorage.role,
      addFrom: {
        name: '',
        organizationId: window.localStorage.organizationId,
      },
      editFrom: {
        name: '',
        organizationId: null,
        organization: {},
      },
      actiomFrom: {
        planId: null,
        usvId: null,
        returnMode: 1,
      },
      routeTrackFrom: {
        planId: null,
        usvId: null,
      },
      // 校验规则
      editRules: {
        name: [
          {
            required: true,
            message: '请输入计划名称',
            trigger: 'blur',
          },
        ],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
      },
      addRules: {
        name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
      },
      actiomRules: {
        usvId: [{ required: true, message: '请选择要执行计划的船只', trigger: 'change' }],
      },
      // 加载loading
      remoteLoading: false,
      // 组织机构
      organInfoList: [],
    }
  },
  methods: {
    // 获取组织机构数据
    async getOrganList () {
      const { data: res } = await apiGetOrganAll();
      this.addFrom.organizationId = this.addFrom.organizationId == 1 ? null : this.addFrom.organizationId;
      if (this.role == 'Administrator') {
        this.addFrom.organizationId = null;
      }
      this.organInfoList = res;
    },
    // 添加计划==对话框关闭==回调事件
    closeAdd () {
      this.$parent.addlogVisible = false;
      this.$refs.addFormRef.resetFields();
    },
    // 确认
    confirm () {
      this.$refs.addFormRef.validate(val => {
        if(!val) return;
        // 传递克隆数据，否则对话框关闭父组件接收到的数据被清空
        this.$emit('getAddForm', deepClone(this.addFrom));
      })
    }
  },
  created () {
    this.getOrganList();
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
