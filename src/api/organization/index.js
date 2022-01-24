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
    url: `/organization/get/?id=${id}`,
    method: 'get'
  });
};

// 添加
// {
//   "name": "string"
// }
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
    params: { id }
  });
};
//更新
// {
//   "id": 0,
//   "name": "string"
// }
export const apiEditOrgan = (data) => {
  return request({
    url: `/organization/update`,
    method: 'post',
    data
  });
};
