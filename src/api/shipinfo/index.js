import request from '../request';

// 分页方式查询无人船
// {
//   'Condition.States': 0, 1, 2, 3, 4, 5,
//   'Condition.Keyword':'',
//    Page: 1,
//    Size: 10
// }
export const apiGetShipByQuery = (params) => {
  return request({
    url: '/usv/search',
    method: 'get',
    params
  });
};

// 根据id获取无人船。
export const apiGetShipById = (id) => {
  return request({
    url: '/usv/get',
    method: 'get',
    params: { id }
  });
};

// 向数据库添加新的无人船信息
// {
//   "id": 0,
//   "serialNumber": "string",
//   "displayName": "string",
//   "cameraSN": "string",
//   "cameraValidationCode": "string",
//   "organizationId": 0,
//   "maximumBatteryVoltage": 0,
//   "minimumBatteryVoltage": 0
// }
export const apiAddShip = (data) => {
  return request({
    url: '/usv/add',
    method: 'post',
    data
  });
};
//删除
export const apiDelShip = (id) => {
  return request({
    url: `/usv/delete?id=${id}`,
    method: 'post'
  });
};
// 更新数据库中的无人船信息
// {
//   "id": 0,
//   "serialNumber": "string",
//   "displayName": "string",
//   "cameraSN": "string",
//   "cameraValidationCode": "string",
//   "organizationId": 0,
//   "maximumBatteryVoltage": 0,
//   "minimumBatteryVoltage": 0
// }
export const apiEditShip = (data) => {
  return request({
    url: '/usv/update',
    method: 'post',
    data
  });
};
//向无人船写入配置信息。
// {
//   "enableServerCommunicationCircuitBreaker": true,
//   "enableRemoteControlCommunicationCircuitBreaker": true,
//   "enableLowBatteryReturn": true,
//   "enableObstacleAvoidance": true,
//   "thresholdBatteryLevel": 0
// }
export const apiSetConfigShip = (id, data) => {
  return request({
    url: `/usv/setconfig?id=${id}`,
    method: 'post',
    data
  });
};
//从无人船读取配置信息。
export const apiGetConfigShip = (id) => {
  return request({
    url: `/usv/getconfig?id=${id}`,
    method: 'get'
  });
};

//将无人船恢复出厂设置。
export const apiFactoryResetShip = (id) => {
  return request({
    url: `/usv/factoryreset?id=${id}`,
    method: 'post'
  });
};
//暂停指定无人船正在执行的任务。
export const apiPauseShip = (id) => {
  return request({
    url: `/usv/pause?id=${id}`,
    method: 'post'
  });
};
//恢复指定无人船已暂停的任务。
export const apiResumeShip = (id) => {
  return request({
    url: `/usv/resume?id=${id}`,
    method: 'post'
  });
};

//停止指定无人船正在执行的任务立即返航
export const apiReturnShip = (id) => {
  return request({
    url: `/usv/return?id=${id}`,
    method: 'post'
  });
};
//立即停止航行并清空航点。
export const apiStopShip = (id) => {
  return request({
    url: `/usv/stop?id=${id}`,
    method: 'post'
  });
};

//将指定的无人船软复位。
export const apiResetShip = (id) => {
  return request({
    url: `/usv/reset?id=${id}`,
    method: 'post'
  });
};

//获取无人船当前设置的返航点的坐标
export const apiGetReturnPointShip = (id) => {
  return request({
    url: `/usv/getreturnpoint`,
    method: 'get',
    params: { id }
  });
};
//设置无人船当前设置的返航点的坐标
// {
//   id,
//   location
// }
export const apiSetReturnPointShip = (params) => {
  return request({
    url: `/usv/setreturnpoint`,
    method: 'post',
    params
  });
};
//设置无人船的托管状态
// {
//    id,
//    isManaged:boolean
// }
export const apiSetisManagedShip = (params) => {
  return request({
    url: `/usv/setismanaged`,
    method: 'post',
    params
  });
};
