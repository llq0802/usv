import request from '../request';

//查看实时视频
export const apiOnlineVideo = (id) => {
  return request({
    url: `/camera/live?usvId=${id}`,
    method: 'get'
  });
};

//获取实时视频token函数
export const apiGetOnlineVideoToken = () => {
  return request({
    url: `/camera/accesstoken`,
    method: 'get'
  });
};
