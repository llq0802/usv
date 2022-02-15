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
  })
};
// 根据id查询计划
export const apiGetPlanById = id => {
  return request({
    url: `/plan/get?id=${id}`,
    method: 'get'
  })
};
/**
 * 添加计划
 * @param {name, organizationId} data 
 */
export const apiPostAddPlan = data => {
  return request({
    url: `/plan/add`,
    method: 'post',
    data
  })
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
// 取消计划
export const apiCancelPlanById = id => {
  return request({
    url: `/plan/cancel?usvId=${id}`,
    method: 'get'
  })
};
// 根据船只id获取执行任务的信息
export const apiGetExecuteInfoByUsvId = id => {
  return request({
    url: `/plan/getexecutioncontext?usvId=${id}`,
    method: 'get'
  })
};
// 更新计划
/**
 * 
 * @param {telemetryPlanId, fixes} data 
 * @returns
 */
export const apiPostUpdatePlan = data => {
  return request({
    url: `/plan/updatefixes`,
    method: 'post',
    data
  })
}
