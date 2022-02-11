import request from '../request';

/**
 * 通过返回分页条件查询航线并返回
 * @param { Page, Size, 'Condition.Keyword', 'Condition.Departure', 'Condition.Destination' } params 
 * @returns 
 */
export const apiGetRouteQuery = (params = {
    Page: 1,
    Size: 10,
    'Contion.Keyword': '',
    'Condition.Destination': '',
    'Condition.Departure': ''
  }) => {
  return request({
    url: `/route/search`,
    method: 'get',
    params
  })
};
// 删除航线
export const apiPostDeleteRoute = id => {
  return request({
    url: `/route/delete?id=${id}`,
    method: 'post'
  })
};

/**
 * 更新航线
 * @param {id, name, departure, destination, segments} data 
 * @returns 
 */
export const apiPostUpdateRoute = data => {
  return request({
    url: `/route/update`,
    method: 'post',
    data
  })
};
/**
 * 新增航线
 * @param {departure, destination, segments} data 
 * @returns 
 */
export const apiAddRoute = data => {
  return request({
    url: `/route/add`,
    method: 'post',
    data
  })
};
// 以字符串的形式返回指定航线的航段信息
export const apiGetRouteString = id => {
  return request({
    url: `/route/stringify?id=${id}`,
    method: 'get'
  })
};

/**
 * 验证航线连续性
 * @param {*} data 航线字符串路径
 * @returns 
 */
export const apiPostValidRoute = data => {
  return request({
    url: `/route/validatecontinuity`,
    method: 'post',
    data
  })
};

export const apiPostParseRouteStr = data => {
  return request({
    url: `/route/parse`,
    method: 'post',
    data
  })
};

export const apiPostParsePath = data => {
  return request({
    url: `/route/path`,
    method: 'post',
    data
  })
};