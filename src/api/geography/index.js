import request from '../request';

/**
 * GCJ-02坐标和WGS-84坐标互转
 * @param {coord: 'latitude,longitude', srid: 'wgs84' | 'gcj02'} params 
 */
export const convert = params => {
  return request({
    url: `geography/convert`,
    method: 'get',
    params
  })
};
/**
 * 简化轨迹
 * @param {*} tolerance 容差值
 * @param {*} path 轨迹字符串数组
 * @returns 
 */
export const apiSimpleTrack = (tolerance, path) => {
  return request({
    url: `geography/reduce?tolerance=${+tolerance}&algorithmSource=application`,
    method: 'post',
    data: path
  })
}