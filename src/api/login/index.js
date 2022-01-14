import request from '../request';

export const apiSigninLogin = (params) => {
    return request({
        url: '/auth/signin',
        method: 'post',
        data: params
    });
};
