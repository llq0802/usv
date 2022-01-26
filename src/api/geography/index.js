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