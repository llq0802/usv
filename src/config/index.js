//无人船状态
let UsvStates = new Map([
  [0, '离线'],
  [1, '空闲'],
  [2, '手动巡航'],
  [3, '自动巡航'],
  [4, '返航'],
  [5, '锁定']
]);
let PlanStates = new Map([
  [0, '已创建'],
  [1, '就绪'],
  [2, '巡航中'],
  [3, '返航中'],
  [4, '已完成']
]);
let ReturnModes = new Map([
  [1, '直线返航'],
  [2, '原路返航']
]);
let ChannelRouters = new Map([
  [0, '自动规划'],
  [1, '手动规划']
]);
// 港口泊位页面常量
let procedureType = new Map([
  [1, '离港'],
  [2, '进港']
]);
let transitionType = new Map([
  [1, '泊位'],
  [2, '航标']
]);
let transitionDirectione = new Map([
  [1, '进港'],
  [2, '离港']
]);
let isEffect = new Map([
  [true, '生效'],
  [false, '不生效']
]);
// 多条船只显示不同的颜色数组
let strokeColorList = new Map([
  [0, '#ff3838a0'],
  [1, '#2ecc71a0'],
  [2, '#2980b9a0'],
  [3, '#16a085a0'],
  [4, '#8e44ada0'],
  [5, '#2c3e50a0'],
  [6, '#f1c40fa0'],
  [7, '#e74c3ca0'],
  [8, '#67e6dca0'],
  [9, '#3d3d3da0']
]);
let colorArray = new Map([
  ['A', '#f44336bb'],
  ['B', '#E91E63bb'],
  ['C', '#9C27B0bb'],
  ['D', '#673AB7bb'],
  ['E', '#3F51B5bb'],
  ['F', '#2196F3bb'],
  ['G', '#03A9F4bb'],
  ['H', '#00BCD4bb'],
  ['I', '#009688bb'],
  ['J', '#4CAF50bb'],
  ['K', '#8BC34Abb'],
  ['L', '#CDDC39bb'],
  ['M', '#546E7Abb'],
  ['N', '#FFC107bb'],
  ['O', '#FF9800bb'],
  ['P', '#FF5722bb'],
  ['Q', '#795548bb'],
  ['R', '#9E9E9Ebb'],
  ['S', '#607D8Bbb'],
  ['T', '#FF80ABbb'],
  ['U', '#AEEA00bb'],
  ['V', '#18FFFFbb'],
  ['W', '#B388FFbb'],
  ['X', '#004D40bb'],
  ['Y', '#E65100bb'],
  ['Z', '#FFEB3Bbb']
]);
//电量百分比进度条的颜色样式
let powerColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 99 }
];
//航线颜色、船状态等一些列常量
export const BASE_CONSTANTS = {
  usvState: (val) => UsvStates.get(val),
  planState: (val) => PlanStates.get(val),
  channelRouter: (val) => ChannelRouters.get(val),
  returnMode: (val) => ReturnModes.get(val),
  strokeColorList: (val) => strokeColorList.get(val),
  colorArray: (val) => colorArray.get(val),
  powerColors: () => powerColors,
  procedureType: (val) => procedureType.get(val),
  transitionDirectione: (val) => transitionDirectione.get(val),
  transitionType: (val) => transitionType.get(val),
  isEffect: (val) => isEffect.get(val)
};
//系统名称
export const HEADER_TITLE = '船舶智能调度管理平台';
//signalr地址
export const SIGNALR_Url = process.env.VUE_APP_API_BASE_PATH + '/events';
//跨域配置
export const API = '/api';
// localStorage存储的项目名key
export const USV = 'usv';
//page和size
export const PAGE_SIZE = {
  page: 1,
  size: 10,
  page_sizes: [10, 20, 30, 50]
};
//地图常数
export const AMAP = {
  center: [106.551842, 29.592214],
  zoom: 12,
  zooms: [2, 20]
};

//权限对应表
export const ROLE = [
  {
    value: 1,
    label: '系统管理员',
    type: 'success'
  },
  {
    value: 2,
    label: '单位管理员',
    type: 'info'
  },
  {
    value: 4,
    label: '普通用户'
  }
];

//提示信息
export const MESSAGE = {
  success: '设置成功',
  error: '设置失败',
  loginSuccess: '登录成功',
  loginError: '请输入正确的账号和密码'
};
