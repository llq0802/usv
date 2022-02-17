<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">{{ HEADER_TITLE }}</div>
      <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
        <el-form-item prop="userName">
          <el-input v-model="param.userName" placeholder="请输入用户名">
            <el-button slot="prepend" icon="iconfont icon-yonghu"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            show-password
            placeholder="请输入密码"
            v-model="param.password"
            @keyup.enter.native="submitForm()"
          >
            <el-button slot="prepend" icon="iconfont icon-mima"></el-button>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm()" :loading="loginLoading">登 录</el-button>
        </div>
        <p class="login-tips">Tips : 请填写正确的用户名和密码</p>
      </el-form>
    </div>
  </div>
</template>

<script>
import jwt_decode from 'jwt-decode';
import { HEADER_TITLE, MESSAGE } from '@/config';
import { apiSigninLogin } from 'api/login';
import { setStorage } from '@/utils/localStorage';
import { focusPoint, clearCavas } from '@/utils/bgBeautify';

export default {
  data() {
    return {
      HEADER_TITLE: Object.freeze(HEADER_TITLE), //系统名称
      param: {
        userName: process.env.VUE_APP_DEFAULT_ACCOUNT,
        password: process.env.VUE_APP_DEFAULT_PASSWORD
      },
      rules: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loginLoading: false
    };
  },
  mounted() {
    focusPoint();
  },
  beforeDestroy() {
    clearCavas();
  },
  methods: {
    submitForm() {
      this.$refs.login.validate(async (valid) => {
        if (valid) {
          const params = this.param;
          this.loginLoading = true;
          try {
            const { data, errorCode } = await apiSigninLogin(params);
            if (+errorCode === 0) {
              if (data && data.token) {
                const objToken = jwt_decode(data.token);
                const arrayToken = [];
                for (let key in objToken) {
                  if (objToken.hasOwnProperty(key)) arrayToken.push(objToken[key]);
                }
                //设置本地存储
                setStorage('token', data.token);
                //过期时间
                setStorage('tokenTime', arrayToken[7] || objToken.nbf);
                //用户名
                setStorage('userName', this.param.userName);
                // 角色
                setStorage('role', arrayToken[4]);
                // 当前用户关联的公司id
                setStorage('organizationId', arrayToken[5]);
                this.loginLoading = false;
                this.$message.success(MESSAGE.loginSuccess);
                this.$router.push('/');
              }
            }
          } catch (error) {
            this.loginLoading = false;
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(../../assets/img/login/login.jpg);
  background-size: 100% 100%;
}
.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #fff;
  border-bottom: 1px solid #ddd;
}
.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 380px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
  z-index: 9;
}
.ms-content {
  padding: 30px 30px;
}
.login-btn {
  text-align: center;
  margin-bottom: 10px;
}
.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}
.login-tips {
  font-size: 12px;
  line-height: 30px;
  color: #f2f2f2;
}
</style>
