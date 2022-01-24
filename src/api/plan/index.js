import request from '../request';

/**
 * 通过返回分页条件查询计划并返回
 * @param { Page, Size, 'Condition.Keyword' } params 
 * @returns 
 */
export const apiGetPlan = (params = { Page: 1, Size: 10, 'Contion.Keyword': '' }) => {
  return request({
    url: `/plan/query`,
    method: 'get',
    params
  });
};

// 修改计划名称和机构
export const apiPostPlanInfo = data => {
  return request({
    url: `/plan/modify`,
    method: 'post',
    data
  })
};
// 删除计划
export const apiPostDeletePlan = id => {
  return request({
    url: `/plan/delete?id=${id}`,
    method: 'post',
  })
};
// 执行计划
export const apiPostExecutePlan = data => {
  return request({
    url: `/plan/execute`,
    method: 'post',
    data
  })
};
