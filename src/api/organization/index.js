import request from '../request';

// 获取数据库所有可用的单位信息
export const apiGetOrganAll = () => {
  return request({
    url: `/organization/all`,
    method: 'get'
  });
};
// 通过id查
export const apiGetOrganById = (id) => {
  return request({
    url: `/organization/get/${id}`,
    method: 'get'
  });
};

// 添加
export const apiAddOrgan = (data) => {
  return request({
    url: `/organization/add`,
    method: 'post',
    data
  });
};
// del
export const apiDelOrgan = (id) => {
  return request({
    url: `/organization/delete`,
    method: 'post',
    data: { id }
  });
};
//更新
export const apiEditOrgan = (data) => {
  return request({
    url: `/organization/update`,
    method: 'post',
    data
  });
};
