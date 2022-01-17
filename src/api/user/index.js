import request from '../request';

// 分页方式查询用户
export const apiGetUserByQuery = (params) => {
    return request({
        url: '/user/query',
        method: 'get',
        params
    });
};
// 通过ID查询指定用户并返回用户信息
export const apiGetUserById = (id) => {
    return request({
        url: `/user/get/${id}`,
        method: 'get'
    });
};

//根据ID删除指定用户
export const apiDelUser = (id) => {
    return request({
        url: `/user/delete/${id}`,
        method: 'post'
    });
};
//修改用户
export const apiEditUser = (data) => {
    return request({
        url: `/user/modifyuser`,
        method: 'post',
        data
    });
};
//添加用户
export const apiAddUser = (data) => {
    return request({
        url: `/user/add/`,
        method: 'post',
        data
    });
};

//根据返回的数据对选择的用户的密码进行修改
export const apiEditPassword = (data) => {
    return request({
        url: `/user/modifypassword/`,
        method: 'post',
        data
    });
};

//获取当前用户有权限查询的公司
export const apiGetCompanyByUser = () => {
    return request({
        url: `/user/getorganizations`,
        method: 'get'
    });
};
