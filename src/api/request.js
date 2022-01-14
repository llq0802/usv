import axios from 'axios';
import { returnMessage } from '@/utils';

const service = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '/api' : 'http://192.168.110.234:8766', //来判断是否开发环境
    timeout: 5000
});
//请求拦截
service.interceptors.request.use(
    (config) => {
        //发送的是登录请求和更新token请求,那么不能发起请求否者会进入回调地狱死循环.
        if (config.url == '/auth/refreshtoken' || config.url == '/auth/signin') {
            return config;
        }
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject();
    }
);
//响应拦截
service.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response.data;
        } else {
            Promise.reject();
        }
    },
    (error) => {
        console.log(error);
        return Promise.reject();
    }
);

export default service;
