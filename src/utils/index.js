/**
 *防抖
 *
 * @param {*} fn
 * @param {number} [ms=0]
 * @return {*}
 */
export const debounce = (fn, ms = 0) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
};

/**
 *节流
 *
 * @param {*} fn
 * @param {wait} [ms=0]
 * @return {*}
 */
export const throttle = (fn, wait) => {
    let inThrottle, lastFn, lastTime;
    return function () {
        const context = this,
            args = arguments;
        if (!inThrottle) {
            fn.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFn);
            lastFn = setTimeout(function () {
                if (Date.now() - lastTime >= wait) {
                    fn.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};

/**
 *深克隆
 *
 * @param {*} obj
 * @return {*}
 */
export const deepClone = (obj) => {
    let clone = Object.assign({}, obj);
    Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]));
    return Array.isArray(obj) ? (clone.length = obj.length) && Array.from(clone) : clone;
};

/**
 *
 *封装网络状态码
 * @export
 * @param {*} message
 * @return {*}
 */
export function returnMessage(message) {
    let errorMessage;
    switch (message) {
        case 400:
            errorMessage = '请求错误';
            break;
        case 403:
            errorMessage = '权限不可用';
            break;
        case 404:
            errorMessage = '请求错误,未找到资源';
            break;
        case 405:
            errorMessage = '请求方法未允许';
            break;
        case 408:
            errorMessage = '请求超时';
            break;
        case 500:
            errorMessage = '服务器忙，请稍后再试';
            break;
        case 501:
            errorMessage = '网络未实现';
            break;
        case 502:
            errorMessage = '网络发生了错误';
            break;
        case 503:
            errorMessage = '服务暂时不可用';
            break;
        case 504:
            errorMessage = '网络连接超时了';
            break;
        case 505:
            errorMessage = 'http版本不支持该请求';
            break;
        default:
            errorMessage = '网络出现问题,请稍后重试';
            break;
    }
    return errorMessage;
}
