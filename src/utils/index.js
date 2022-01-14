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
