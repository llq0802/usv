import jwt_decode from 'jwt-decode';
import { getStorage, setStorage } from '@/utils/localStorage';
import { apiRefreshToken } from '@/api/login';

/**
 * 监听token过期时间,更新token
 * @return: Boolean
 */
// 如果用户在操作的时候,token过期时间减去当前的时间小于设置的时间,那么更新token到Authorization,并且重新将token的过期时间设置到localStorage
export const updateToken = async (timer, config) => {
  let nTime = Date.now() / 1000;
  let tokenTime = getStorage('tokenTime');
  let res = +tokenTime - nTime;
  // token过期时间减去当前时间的值是否小于半小时且大于0,如果是就更新token,
  if (res > 0 && res < timer) {
    const { data } = await apiRefreshToken(config.headers.Authorization);
    const objToken = jwt_decode(data.token);
    const arrayToken = [];
    for (let key in objToken) {
      if (objToken.hasOwnProperty(key)) {
        arrayToken.push(objToken[key]);
      }
    }
    //设置本地存储
    setStorage('token', data.token);
    //过期时间
    setStorage('tokenTime', objToken.nbf || arrayToken[7]);
    //用户名
    setStorage('userName', this.param.userName);
    // 角色
    setStorage('role', arrayToken[4]);
    // 当前用户关联的公司id
    setStorage('organizationId', arrayToken[5]);
    config.headers.Authorization = `Bearer ${data.token}`;

    // 事件流更新token
    // authenticate(data.token);
  }
};

/**
 * 检查token是否过期
 * @param {*} expTime  token过期时间 比如3600s
 * @param {*} cTime   一般为0 距离到期的还剩的时间s
 * @returns
 */
export const checkTokenTime = (tokenTime, cTime = 0) => {
  // 现在的时间
  const nowTime = Date.now() / 1000;
  // 如果<=cTime证明过期了
  return tokenTime - nowTime <= cTime ? true : false;
};
