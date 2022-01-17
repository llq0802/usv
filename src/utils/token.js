import jwt_decode from 'jwt-decode';

/**
 * 监听token过期时间,更新token
 * @return: Boolean
 */
// 如果用户在操作的时候,token过期时间减去当前的时间小于设置的时间,那么更新token到Authorization,并且重新将token的过期时间设置到localStorage
export const updateToken = async (timer, config) => {
    let date = new Date();
    let tokenTime = localStorage.getItem('tokenTime');
    let countTime = Number(tokenTime) - parseInt(date.getTime() / 1000);
    // 过期时间减去当前时间的值是否小于半小时且大于0,如果是就更新token,如果不是就不用
    if (countTime > 0 && countTime < timer) {
        const { data: res } = await axios.get('/auth/refreshtoken', config.headers.Authorization);
        // 解析token并且遍历取出数据
        let objToken = jwt_decode(res.data.token);
        let arrayToken = [];
        for (let item of objToken) {
            arrayToken.push(item);
        }
        // 更新token
        window.localStorage.setItem('token', res.data.token);
        // 重新将token的过期时间设置到localStorage,否者时间不刷新,会一直获取新的token,导致用户永久在线
        window.localStorage.setItem('tokenTime', arrayToken[7]);
        config.headers.Authorization = `Bearer ${res.data.token}`;
        // 事件流更新token
        authenticate(res.data.token);
    }
};

/**
 * 检查token是否过期
 * @param {*} expTime  token过期时间 比如3600s
 * @param {*} cTime   一般为0 距离到期的还剩的时间s
 * @returns
 */
export const checkTokenTime = (expTime, cTime = 0) => {
    // 现在的时间
    const nowTime = Date.now() / 1000;
    // 如果<=cTime证明过期了
    return expTime - nowTime <= cTime ? true : false;
};
