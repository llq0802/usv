import axios from 'axios';
import { returnMessage } from '@/utils';
import { getStorage, delStorage } from '@/utils/localStorage';
import { updateToken } from '@/utils/token';
import { API } from '../config';
import router from '@/router';
import { Message } from 'element-ui';
import NProgress from 'nprogress';
import qs from 'qs';
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? API : process.env.VUE_APP_API_BASE_PATH + API, //来判断是否开发环境
  timeout: 5000
});
//请求拦截
service.interceptors.request.use(
  (config) => {
    NProgress.start();
    //如果Authorization中没有token就给他token,否者不能登录系统
    if (!config.headers.Authorization) {
      const token = getStorage('token');
      config.headers.Authorization = `Bearer ${token}`;
    }
    //发送的是登录请求和更新token请求,那么不能更新token函数,否者会进入回调地狱死循环.
    if (config.url == '/auth/refreshtoken' || config.url == '/auth/signin') {
      return config;
    }
    if (config.method === 'get') {
      // 如果是get请求，将params参数中的数组格式类型如arr=[1,2]，转换成arr=1&arr=2
      config.paramsSerializer = (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      };
    }
    // 更新token函数,如果过期时间>0小于30分钟就更新token
    updateToken(1800, config);
    return config;
  },
  (error) => {
    console.log('请求错误', error);
    return Promise.reject();
  }
);
//响应拦截
service.interceptors.response.use(
  (response) => {
    NProgress.done();
    if (response.status === 200 || response.status === 304) {
      if (+response.data.errorCode === 0) {
        return response.data;
      }
      // 响应请求为200,但是有错误提示时,统一提示给用户
      if (response.data.errorCode !== 0 && response.data.message) {
        if (document.getElementsByClassName('el-message').length) return response.data;
        Message({
          message: response.data.message,
          type: 'error'
        });
        return response.data;
      }
    } else {
      return Promise.reject();
    }
  },
  (err) => {
    NProgress.done();
    if (!err.response) return Promise.reject();
    //身份过期
    if (err.response.status && err.response.status === 401) {
      if (!document.getElementsByClassName('el-message').length) {
        Message({
          message: err.response.data.message || '用户身份信息过期，请重新登录！',
          type: 'error',
          duration: 3500
        });
      }
      router.replace('/login');
      delStorage();
    } else {
      console.log('响应错误', err.response);
      if (document.getElementsByClassName('el-message').length) return Promise.reject();
      // 接收错误返回的信息,并提示用户
      if (err.response && err.response.data.message) {
        Message({
          message: err.response.data.message,
          type: 'error'
        });
      } else {
        // 没有收到服务器返回错误信息
        let errorMessage = returnMessage(err.response.status);
        Message({
          message: errorMessage,
          type: 'error'
        });
      }
    }
    return Promise.reject();
  }
);

export default service;
