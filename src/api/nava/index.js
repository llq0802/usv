import request from '../request';

//通过返回分页条件查询航标并返回
// {
//     Condition.Rect.TopLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.TopRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.ZoomLevel
//     Condition.Keyword
//     Page
//     Size
// }
export const apiGetNavaByQuery = (params) => {
  return request({
    url: '/navaid/search',
    method: 'get',
    params
  });
};
/**
 * 根据航标的Ident获取单个航标的全部信息
 * @param {*} ident
 * @returns
 */
export const apiGetNavaByIdent = (ident) => {
  return request({
    url: '/navaid/get',
    method: 'get',
    params: { ident }
  });
};

/**
 *
 * @param {*} data
 * @returns
 */
//  {
//   "id": 0,
//   "location": "string",
//   "radius": 0,
//   "zoomLevel": 0
// }
export const apiEditNava = (data) => {
  return request({
    url: '/navaid/update',
    method: 'post',
    data
  });
};

// {
//   "ident": "string",
//   "location": "string",
//   "radius": 0,
//   "zoomLevel": 0
// }
/**
 * 添加
 * @param {*} data
 * @returns
 */
export const apiAddNava = (data) => {
  return request({
    url: '/navaid/add',
    method: 'post',
    data
  });
};

/**
 * 删除
 * @param {} id
 * @returns
 */
export const apiDelNava = (id) => {
  return request({
    url: `/navaid/delete?id=${id}`,
    method: 'post'
  });
};

/**
 * 获取指定航标所在航道的列表。航标的ID和识别码二选一填写。
 * @param {*} params
 * @returns
 */
export const apiGetWayByNava = (params) => {
  return request({
    url: `/navaid/waterways`,
    method: 'post',
    params
  });
};

/**
 * 获取在指定航标的导航范围内的其他所有航标，结果按距离排序。
 * @param {*} params
 * @returns
 */
export const apiGetNavaByFrom = (navaidId) => {
  return request({
    url: `/navaid/from`,
    method: 'get',
    params: { navaidId }
  });
};
/**
 * 获取所有可以直接到达指定航标的其他航标，结果按距离排序
 * @param {*} params
 * @returns
 */
export const apiGetNavaByTo = (navaidId) => {
  return request({
    url: `/navaid/to`,
    method: 'get',
    params: { navaidId }
  });
};

/**
 * 获取可以到达指定地点的所有航标，结果按距离排序
 * @param {*} params
 * @returns
 */
export const apiGetNavaByTolocation = (params) => {
  return request({
    url: `/navaid/tolocation`,
    method: 'get',
    params
  });
};
/**
 * 获取可以到达指定地点的所有航标，结果按距离排序
 * @param {*} params : radius,location
 * @returns
 */
export const apiGetNavaByFromlocation = (params) => {
  return request({
    url: `/navaid/fromlocation`,
    method: 'get',
    params
  });
};
