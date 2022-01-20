import request from '../request';

// 通过返回分页条件查询港口并返回
export const apiGetPlan = (params) => {
  return request({
    url: `/plan/query`,
    method: 'get',
    params
  });
};
