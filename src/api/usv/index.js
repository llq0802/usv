import request from '../request';

// 查询各状态船只
/**
 * 
 * @param {States, Keyword, Page, Size} params 
 * @returns 
 */
export const apiGetShip = (params = {
    Page: 1, Size: 10, 'Contion.Keyword': '', 'Contion.State': []
  }) => {
  return request({
    url: `/plan/query`,
    method: 'get',
    params
  });
};