//USV：本地存储的key
import { USV } from '../config';
/**
 * 设置本地存储
 * @param {*} key
 * @param {*} value
 */
export const setStorage = (key, value) => {
    let data = localStorage.getItem(USV);
    data = !data ? {} : JSON.parse(data);
    data[key] = value;
    localStorage.setItem(USV, JSON.stringify(data));
};
/**
 * 获取本地存储
 * @param {*} key
 * @returns
 */
export const getStorage = (key) => {
    let data = localStorage.getItem(USV);
    if (!data) return null;
    data = JSON.parse(data);
    return data[key] || null;
};
/**
 * 删除本地存储
 * @param {*} key
 * @returns
 */
export const delStorage = (key) => {
    if (!key) {
        localStorage.removeItem(USV);
        return;
    }
    let data = JSON.parse(localStorage.getItem(USV));
    data[key] && delete data[key];
};
