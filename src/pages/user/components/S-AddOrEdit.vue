<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="isShow"
    width="30%"
    center
    :before-close="cancalClick"
    @open="openDialog"
  >
    <el-form
      ref="editPasswordForm"
      label-width="110px"
      :rules="editPasswordRules"
      :model="editPasswordFrom"
      v-show="title === 'editPassword'"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="editPasswordFrom.oldPassword"
          placeholder="请输入旧密码"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="editPasswordFrom.newPassword"
          placeholder="请输入新密码"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="editPasswordFrom.confirmPassword"
          placeholder="请确认密码"
          clearable
        ></el-input>
      </el-form-item>
    </el-form>

    <el-form
      ref="from"
      v-show="title === 'add' || title === 'edit'"
      label-width="110px"
      :rules="rules"
      :model="from"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="from.userName" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="昵称" prop="displayName">
        <el-input v-model="from.displayName" placeholder="请输入昵称" clearable />
      </el-form-item>
      <el-form-item v-if="title === 'add'" label="密码" prop="password">
        <el-input v-model="from.password" placeholder="请输入密码" show-password clearable />
      </el-form-item>
      <el-form-item v-if="title === 'add'" label="确认密码" prop="confirmPassword">
        <el-input v-model="from.confirmPassword" placeholder="请确认密码" show-password clearable />
      </el-form-item>
      <el-form-item label="角色" required prop="role">
        <el-select placeholder="请选择" v-model="from.role" clearable>
          <el-option
            v-for="item in ROLE"
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
    <!-- 底部开始 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">取 消</el-button>
      <el-button type="primary" @click="handleClick" :loading="userLoading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import router from '@/router';
import * as userApi from '@/api/user';
import { ROLE } from '@/config';
import { deepClone } from '@/utils';
import { delStorage } from '@/utils/localStorage';

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'edit' //'edit','add','editPassword'
    },
    organInfoList: {
      type: Array,
      default: () => []
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    dialogTitle() {
      let ret = {
        add: '添加用户',
        edit: '修改用户',
        editPassword: '修改密码'
      };
      return ret[this.title];
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
      userLoading: false,
      ROLE: Object.freeze(ROLE),
      from: {
        userName: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        organizationId: null,
        role: null
      },
      editPasswordFrom: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
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
      }),
      //修改密码验证
      editPasswordRules: Object.freeze({
        oldPassword: [{ required: true, message: '请输入原始密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: checkPassword,
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          {
            validator: checkEditConfirmPassword,
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
          this.from = deepClone(this.currentRow);
        });
      } else if (this.title === 'add') {
        this.$nextTick(() => {
          this.$refs.from.clearValidate();
        });
        this.from = {
          userName: '',
          displayName: '',
          password: '',
          confirmPassword: '',
          organizationId: null,
          role: null
        };
      } else {
        this.$nextTick(() => {
          this.$refs.editPasswordForm.resetFields();
          this.$refs.editPasswordForm.clearValidate();
        });
      }
    },
    /**
     *确定添加或者修改
     */
    handleClick() {
      if (this.title === 'editPassword') {
        this.$refs.editPasswordForm.validate(async (valid) => {
          if (!valid) return;
          this.userLoading = true;
          const { errorCode } = await userApi.apiEditPassword;
          if (+errorCode === 0) {
            this.userLoading = false;
            this.$message.success('修改密码成功,即将重新登录!');
            setTimeout(() => {
              delStorage();
              router.replace('/login');
            }, 1000);
          }
        });
      } else {
        this.$refs.from.validate(async (valid) => {
          if (!valid) return;
          if (this.title === 'edit') {
            this.userLoading = true;
            const { errorCode } = await userApi.apiEditUser(this.from);
            if (+errorCode === 0) this.$message.success('修改成功');
          } else if (this.title === 'add') {
            this.userLoading = true;
            const { errorCode } = await userApi.apiAddUser(this.from);
            if (+errorCode === 0) this.$message.success('添加成功');
          }
          this.userLoading = false;
          this.cancalClick();
          this.$parent.getUserList();
        });
      }
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
