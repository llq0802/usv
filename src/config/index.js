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

//颜色、船只状态常量
export const constant = {
    usvState: (val) => UsvStates.get(val),
    planState: (val) => PlanStates.get(val),
    channelRouter: (val) => ChannelRouters.get(val),
    returnMode: (val) => ReturnModes.get(val),
    strokeColorList: (val) => strokeColorList.get(val % strokeColorList.size),
    colorArray: (val) => colorArray.get(val)
};
//系统名称
export const HEADER_TITLE = '船舶智能调度管理平台';

export const signalrUrl = process.env.VUE_APP_API_BASE_PATH + '/events';

//侧边栏数组
export const SIDERBAR_TREE = [
    // {
    //     icon: 'el-icon-lx-home',
    //     index: '/',
    //     title: '系统首页'
    // },
    {
        icon: 'el-icon-map-location',
        index: '/',
        title: '运行状态'
    },
    {
        icon: 'el-icon-s-claim',
        index: 'plan',
        title: '计划管理'
    },
    {
        icon: 'el-icon-lx-add',
        index: 'planroute',
        title: '航线管理'
    },
    {
        icon: 'el-icon-lx-global',
        index: 'waterway',
        title: '航标航道管理'
    },
    {
        icon: 'el-icon-lx-info',
        index: 'portberth',
        title: '港口泊位管理'
    },
    {
        icon: 'el-icon-lx-cascades',
        index: 'chart',
        title: '航图展示管理'
    },
    {
        icon: 'el-icon-lx-edit',
        index: 'shipinfo',
        title: '船舶信息管理'
    },
    {
        icon: 'el-icon-user-solid',
        index: 'user',
        title: '用户信息管理'
    },
    {
        icon: 'el-icon-user-solid',
        index: 'organization',
        title: '组织机构管理'
    }

    //后续处理
    // {
    //     icon: 'el-icon-lx-warn',
    //     index: '7',
    //     title: '错误处理',
    //     subs: [
    //         {
    //             index: 'permission',
    //             title: '权限测试'
    //         },
    //         {
    //             index: '404',
    //             title: '404页面'
    //         }
    //     ]
    // }
];
