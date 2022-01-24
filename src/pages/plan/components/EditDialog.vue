<template>
  <!-- 修改dialog -->
  <el-dialog title="修改计划信息" :visible="editlogVisible" width="30%" center @close="closeEdit">
    <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="form">
      <el-form-item label="计划名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入计划名称"></el-input>
      </el-form-item>
      <el-form-item v-if="role == 'Administrator'" label="组织机构" prop="organizationId">
        <el-select placeholder="请选择" v-model="form.organization.id">
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
      <el-button size="medium" @click="$parent.editlogVisible = false">取 消</el-button>
      <el-button size="medium" type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import { apiGetOrganAll } from 'api/organization';

export default {
  props: {
    editlogVisible: {
      type: Boolean,
      default: false
    },
    editForm: {
      type: Object,
      default: () => {
        return {
          name: '',
          organizationId: null,
          organization: {
            name: ''
          }
        }
      }
    }
  },
  data () {
    return {
      role: window.localStorage.role,
      form: null,
      // 校验规则
      editRules: {
        name: [
          { required: true, message: '请输入计划名称', trigger: 'blur', },
        ],
        organizationId: [
          { required: true, message: '请选择组织机构', trigger: 'change' }
        ],
      },
      // 组织机构
      organInfoList: [],
    }
  },
  methods: {
    // 获取组织机构数据
    async getOrganList () {
      const { data: res } = await apiGetOrganAll();
      this.organInfoList = res;
    },

    closeEdit () {
      this.$parent.editlogVisible = false;
      this.$refs.editFormRef.resetFields();
    },
    // 确认
    confirm () {
      this.$refs.editFormRef.validate(val => {
        if (!val) return;
        this.$emit('getEditForm', this.form);
      })
    }
  },
  created () {
    this.form = deepClone(this.editForm);
    this.getOrganList();
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
