import jwt_decode from 'jwt-decode';
import { getStorage, setStorage } from '@/utils/localStorage';
import { apiRefreshToken } from '@/api/login';

/**
 * 监听token过期时间,更新token
 * @return: Boolean
 */
// 如果用户在操作的时候,token过期时间减去当前的时间小于设置的时间,那么更新token到Authorization,并且重新将token的过期时间设置到localStorage
export const updateToken = async (timer = 1800, config) => {
  const nTime = Date.now() / 1000;
  let tokenTime = getStorage('tokenTime');
  let res = +tokenTime - nTime;
  // token过期时间减去当前时间的值大于0 表示没过期,并且离过期时间还有1800秒时就更新token,
  if (res > 0 && res < timer) {
    const { data, errorCode } = await apiRefreshToken(config.headers.Authorization);
    console.log('执行了更新token的请求', data);
    if (+errorCode !== 0) return;
    if (data && data.token) {
      //解析token
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
      setStorage('tokenTime', arrayToken[7] || objToken.nbf);
      // 角色
      setStorage('role', arrayToken[4]);
      // 当前用户关联的公司id
      setStorage('organizationId', arrayToken[5]);
      config.headers.Authorization = `Bearer ${data.token}`;
      // signalR连接更新token
      // authenticate(data.token);
    }
  }
};

/**
 * 检查token是否过期
 * @param {*} expTime  token过期时间 比如3600s
 * @param {*} cTime   一般为0 距离到期的还剩的时间s
 * @returns true为过期
 */
export const checkTokenTime = (tokenTime, cTime = 0) => {
  // 现在的时间 单位秒
  const nowTime = Number.parseInt(Date.now() / 1000);
  // console.log('token时间还剩:', (tokenTime - nowTime) / 60 + '分钟');
  // 如果<=0证明过期了
  return tokenTime - nowTime <= cTime ? true : false;
};
