import axios from 'axios';
import { returnMessage } from '@/utils';
import { getStorage } from '@/utils/localStorage';
import { updateToken } from '@/utils/token';
import { API } from '../config';
import router from '@/router';
import { Message } from 'element-ui';
import NProgress from 'nprogress';

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
    // 更新token函数,如果过期时间>0小于30分钟就更新token
    updateToken(1800, config);
    return config;
  },
  (error) => {
    console.log('request error', error);
    return Promise.reject();
  }
);
//响应拦截
service.interceptors.response.use(
  (response) => {
    NProgress.done();
    if (response.status === 200) {
      // 响应请求为200,但是有错误提示时,统一提示给用户
      if (response.data.errorCode) {
        Message({
          message: response.data.message,
          type: 'error'
        });
      }
      return response.data;
    } else {
      Promise.reject();
    }
  },
  (err) => {
    NProgress.done();

    if (err.response.status === 401) {
      Message({
        message: err.response.data.message || '身份信息过期,请重新登录',
        type: 'error'
      });
      router.replace('/login');
    } else {
      // 接收返回的信息,并提示用户
      if (err.response.data.message) {
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

    console.log('response error', err);
    return Promise.reject();
  }
);

export default service;
