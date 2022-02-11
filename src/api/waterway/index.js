import request from '../request';

//通过返回分页条件查询航到并返回
// {
//     Condition.Rect.TopLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.TopRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Keyword
//     Page
//     Size
// }
export const apiGetWayByQuery = (params) => {
  return request({
    url: '/waterway/search',
    method: 'get',
    params
  });
};

/**
 * 根据IDENT获取航道
 * @param {*} ident
 * @returns
 */
export const apiGetWayByIdent = (ident) => {
  return request({
    url: '/waterway/get',
    method: 'get',
    params: { ident }
  });
};

/**
 * 添加航道
 * 
 * @param {*} data  {
  "ident": "string"
}
 * @returns 
 */
export const apiAddWay = (data) => {
  return request({
    url: '/waterway/add',
    method: 'post',
    data
  });
};
/**
 * 删除航道
 * @param {*} id
 * @returns
 */
export const apiDelWay = (id) => {
  return request({
    url: '/waterway/delete',
    method: 'post',
    params: { id }
  });
};

// {
//   "waterwayId": 0,
//   "fixes": [
//     {
//       "id": 0,
//       "telemetryPlanId": 0,
//       "order": 0,
//       "requirePrecisionNavigation": true,
//       "waterwayId": 0,
//       "navaidId": 0,
//       "navaid": {
//         "id": 0,
//         "location": "string",
//         "ident": "string",
//         "radius": 0,
//         "zoomLevel": 0
//       }
//     }
//   ]
// } 更新航道中的航点
export const apiEditWay = (data) => {
  return request({
    url: '/waterway/setfix',
    method: 'post',
    data
  });
};

// 获取指定的航道上任意两点间的路径信息
// id startNavaid endNavaid
export const apiGetWayPathInfo = (params) => {
  return request({
    url: '/waterway/path',
    method: 'get',
    params
  });
};

//获取指定航道与其他航道的交点。航道的ID和识别码二选一填写。
export const apiGetWayIntersections = (params) => {
  return request({
    url: '/waterway/intersections',
    method: 'get',
    params
  });
};

// 为指定的航标查找最短路径
export const apiGetWayBestShort = (params) => {
  return request({
    url: '/navigation/navigatefromnavaid',
    method: 'get',
    params
  });
}

// 根据航标ident查询交叉航道
export const apiGetWaysByIdent = ident => {
  return request({
    url: `/waterway/get?ident=${ident}`,
    method: 'get'
  })
};
