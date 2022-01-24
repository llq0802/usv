import request from '../request';

// 根据IDENT获取港口信息
export const apiGetPortByIdent = (ident) => {
  return request({
    url: `/port/get/${ident}`,
    method: 'get'
  });
};

// 通过返回分页条件查询港口并返回
export const apiGetPortByQuery = (params) => {
  return request({
    url: `/port/search`,
    method: 'get',
    params
  });
};
