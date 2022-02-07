import request from '../request';
// 根据IDENT获取港口信息
export const apiGetPortByIdent = (ident) => {
  return request({
    url: `/port/get?ident=${ident}`,
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
    url: `/transition/update?id=${data.id}`,
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

// 添加港口
// {
//   "name": "string",
//   "ident": "string",
//   "bounds": "string",
//   "zoomLevel": 0
// }
export const apiAddPort = (data) => {
  return request({
    url: `/port/add`,
    method: 'post',
    data
  });
};
// 添加泊位
// {
//   "portId": 0,
//   "ident": "string",
//   "bounds": "string"
// }
export const apiAddBerth = (data) => {
  return request({
    url: `/port/addberth`,
    method: 'post',
    data
  });
};
// 添加端点
// {
// Id
// Ident
// Location
// }
export const apiAddPoint = (params) => {
  ///procedure/addendpoint
  return request({
    url: `/procedure/addendpoint`,
    method: 'post',
    params
  });
};
// 添加程序
// {
//   "id": 0,
//   "ident": "string",
//   "startId": 0,
//   "endId": 0,
//   "path": "string",
//   "type": 1
// }
export const apiAddProcedure = (data) => {
  return request({
    url: `/procedure/add`,
    method: 'post',
    data
  });
};
// 添加过渡路径
// {
//   "procedureEndpointId": 0,
//   "direction": 1,
//   "path": "string",
//   "targetId": 0
// }
export const apiAddTransition = (data) => {
  return request({
    url: `/transition/add?type=${data.type}`,
    method: 'post',
    data
  });
};

// 将泊位设置为”生效“的状态
export const apiEnBerth = (id) => {
  return request({
    url: `/port/enableberth`,
    method: 'post',
    params: { id }
  });
};
// 将泊位设置为”不生效“的状态
export const apiDisBerth = (id) => {
  return request({
    url: `/port/disableberth`,
    method: 'post',
    params: { id }
  });
};
// 将过渡路径设置为”生效“的状态
export const apiEnTransition = (id) => {
  return request({
    url: `/transition/enable`,
    method: 'post',
    params: { id }
  });
};
// 将过渡路径设置为”不生效“的状态
export const apiDisTransition = (id) => {
  return request({
    url: `/transition/disable`,
    method: 'post',
    params: { id }
  });
};
// 将程序设置为”生效“的状态
export const apiEnProcedure = (id) => {
  return request({
    url: `/procedure/enable`,
    method: 'post',
    params: { id }
  });
};

// 将程序设置为”不生效“的状态
export const apiDisProcedure = (id) => {
  return request({
    url: `/procedure/disable`,
    method: 'post',
    params: { id }
  });
};
/**
 * 查询过渡路径
 * @param { port:Number, type: Number } params 
 * @returns 
 */
export const apiGetTransition = params => {
  return request({
    url: `/port/transitions`,
    method: 'get',
    params
  })
};
/**
 * 查询过渡路径上的航点
 * @param { port:Number, type: Number } params 
 * @returns 
 */
export const apiGetTransitionNavaids = params => {
  return request({
    url: `/port/transitionnavaids`,
    method: 'get',
    params
  })
};
