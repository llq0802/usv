import request from '../request';
// 根据IDENT获取港口信息
export const apiGetPortByIdent = (ident) => {
  return request({
    url: `/port/get/${ident}`,
    method: 'get'
  });
};
//根据港口ID查询其所有泊位
export const apiGetBerthById = (id) => {
  return request({
    url: `/port/berths`,
    method: 'get',
    params: { portId: id }
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
// 通过条件查询程序并返回
// Condition.PortId
// Condition.Type  1代表离港，2代表进港
// Condition.IsInEffect
// Condition.Keyword
// Page
// Size
export const apiGetProcedureByQuery = (params) => {
  return request({
    url: `/procedure/search`,
    method: 'get',
    params
  });
};
// 通过条件查询过渡路径
// Condition.id
// Condition.Type
// Condition.IsInEffect
// Condition.Keyword
// Page
// Size
export const apiGetTransitionByQuery = (params) => {
  return request({
    url: `/transition/search`,
    method: 'get',
    params
  });
};
//根据港口ID查询其所有端点
export const apiGetPointById = (id) => {
  return request({
    url: `/procedure/listendpoint`,
    method: 'get',
    params: { id }
  });
};

// 更新港口
// {
//   "id": 0,
//   "name": "string",
//   "bounds": "string",
//   "zoomLevel": 0
// }
export const apiEditPort = (data) => {
  return request({
    url: `/port/update`,
    method: 'post',
    data
  });
};
// 更新泊位
// {
//   "id": 0,
//   "ident": "string",
//   "bounds": "string",
// }
export const apiEditBerth = (data) => {
  return request({
    url: `/port/updateberth`,
    method: 'post',
    data
  });
};
// 更新端点
// {
// Id
// Ident  pattern: ^[A-Z]{3}$
// Location
// }
export const apiEditPoint = (params) => {
  return request({
    url: `/procedure/updateendpoint`,
    method: 'post',
    params
  });
};
// 更新程序
// {
//   "id": 0,
//   "ident": "string",
//   "startId": 0,
//   "endId": 0,
//   "path": "string",
//   "type": 1
// }
export const apiEditProcedure = (data) => {
  return request({
    url: `/procedure/update`,
    method: 'post',
    data
  });
};
// 更新过渡路径
// {
//   "procedureEndpointId": 0,
//   "direction": 1,
//   "path": "string",
//   "targetId": 0
// }
export const apiEditTransition = (data) => {
  return request({
    url: `/transition/update/?id=${data.id}`,
    method: 'post',
    data
  });
};

// 删除港口
export const apiDelPort = (id) => {
  return request({
    url: `/port/delete`,
    method: 'post',
    params: { id }
  });
};
//删除泊位
export const apiDelBerth = (id) => {
  return request({
    url: `/port/deleteberth`,
    method: 'post',
    params: { id }
  });
};
//删除端点
export const apiDelPoint = (id) => {
  return request({
    url: `/procedure/deleteendpoint`,
    method: 'post',
    params: { id }
  });
};
//删除过渡路径
export const apiDelTransition = (id) => {
  return request({
    url: `/transition/delete`,
    method: 'post',
    params: { id }
  });
};
//删除程序
export const apiDelProcedure = (id) => {
  return request({
    url: `/procedure/delete`,
    method: 'post',
    params: { id }
  });
};
