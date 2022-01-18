import request from '../request';
//登录获取token
export const apiSigninLogin = (params) => {
  return request({
    url: '/auth/signin',
    method: 'post',
    data: params
  });
};

//更新token
export const apiRefreshToken = (token) => {
  return request({
    url: `/auth/refreshtoken/${token}`,
    method: 'get'
  });
};
