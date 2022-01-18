<template>
  <div>
    <el-dialog
      :title="title === 'add' ? '添加用户' : '修改用户'"
      :visible.sync="isShow"
      width="30%"
      center
      :show-close="false"
      @close="closeDialog"
    >
      <el-form ref="from" label-width="110px" :rules="rules" :model="from">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="from.userName" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="displayName">
          <el-input v-model="from.displayName" placeholder="请输入昵称" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="title === 'add'">
          <el-input
            v-model="from.password"
            placeholder="请输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="title === 'add'">
          <el-input
            v-model="from.confirmPassword"
            placeholder="请确认密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="角色" required prop="role">
          <el-select placeholder="请选择" v-model="from.role" clearable>
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织机构" prop="organizationId">
          <el-select placeholder="请选择" v-model="from.organizationId" clearable>
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
        <el-button @click="cancalClick">取 消</el-button>
        <el-button type="primary" @click="handleClick" :loading="userLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { apiGetOrganAll } from '@/api/organization';
import * as userApi from '@/api/user';

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    roleList: {
      type: Array,
      default: () => []
    },
    userLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 自定义校验规则
    let checkPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}/;
      if (regPassword.test(value)) {
        return cb();
      }
      cb(new Error('密码必须包含数字、大/小写字符、特殊符号且在8位以上'));
    };
    let checkConfirmPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword = this.from.confirmPassword == this.from.password ? true : false;
      if (regPassword) {
        return cb();
      }
      cb(new Error('两次输入密码不一致'));
    };
    let checkEditConfirmPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword =
        this.editPasswordFrom.confirmPassword == this.editPasswordFrom.newPassword ? true : false;
      if (regPassword) {
        return cb();
      }
      cb(new Error('两次输入密码不一致'));
    };

    return {
      organInfoList: [],
      from: {
        userName: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        organizationId: null,
        role: null
      },
      // 验证规则
      rules: Object.freeze({
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 4,
            max: 16,
            message: '用户名必须为4位以上,16位以下',
            trigger: 'blur'
          }
        ],
        displayName: [
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur'
          },
          {
            min: 4,
            max: 16,
            message: '昵称必须为4位以上,16位以下',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: checkPassword,
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          {
            validator: checkConfirmPassword,
            trigger: 'blur'
          }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }]
      })
    };
  },
  methods: {
    closeDialog() {
      console.log('closeDialog');
      this.$refs.from.resetFields();
    },

    handleClick() {
      this.$refs.from.validate(async (valid) => {
        if (valid) {
          let { data } = await userApi.apiAddUser(this.from);
          if (data.errorCode === 0) {
            this.$parent.getUserList();
            this.$message.success('添加用户成功');
          }
        }
      });
    },

    cancalClick() {
      this.$emit('cancal');
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
