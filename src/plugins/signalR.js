//引入安装的signalr包
import * as signalR from '@aspnet/signalr';
import { SIGNALR_Url } from '@/utils';
import Vue from 'vue';
// 定期检查token是否过期
import { checkTokenTime } from '@/utils/common';
const token = window.localStorage.getItem('token');
export default class SocketService {
    // signalR实例
    ws = null;
    stream = null;
    // 连接是否成功
    isConnected = false;
    // 需要执行的函数集
    callbacks = new Map();

    instance = null;

    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService();
            return this.instance;
        }
        return this.instance;
    }
    //连接
    async content() {
        this.ws = new signalR.HubConnectionBuilder()
            .withUrl(SIGNALR_Url, { accessTokenFactory: () => window.localStorage.getItem('token') })
            .build();
        try {
            if (
                window.localStorage.getItem('token') &&
                window.localStorage.getItem('token') != '' &&
                !checkTokenTime(window.localStorage.getItem('tokenTime'), 0)
            ) {
                await this.ws.start();
                this.startStream([
                    // 在此处限制服务器发送事件的间隔，0表示不限制（由服务器控制）
                    // 如果服务器产生事件的间隔小于此处设置的间隔，服务器将按此处设置的间隔限制发送事件的频率
                    { eventName: 'usvRuntimeInfoChanged', samplingInterval: 0.5 },
                    { eventName: 'planExecutionStateChanged', samplingInterval: 0.0 }
                ]);
                this.isConnected = true;
            } else {
                // 如果在初试获取失败，则5秒后重连
                setTimeout(() => {
                    start();
                }, 5000);
            }
        } catch (error) {
            // 如果在初试获取失败，则5秒后重连
            setTimeout(() => {
                start();
            }, 5000);
        }
    }

    // 订阅函数
    subscribe(e, id, callback) {
        return signal.invoke('subscribe', { eventName: e, resourceId: id }).then((codingId) => {
            this.callbacks.set(codingId, {
                eventName: e,
                resourceId: id,
                callback: callback
            });
            return codingId;
        });
    }

    // 执行函数，获取数据
    startStream(streamOptions) {
        this.stream = this.ws.stream('stream', streamOptions);
        this.stream.subscribe({
            next: (item) => {
                // 数据获取地点
                for (let val of this.callbacks) {
                    if (val[1].eventName === item.eventName && val[1].resourceId === item.resourceId) {
                        val[1].callback({ ...item.data });
                        // val[1].callback(Object.assign({}, item.data));
                    }
                }
            },
            complete: () => {},
            error: (err) => err
        });
    }
    // 关闭连接时回调
    close() {
        this.ws.onclose(() => {
            // console.log('关闭连接时');
            isconnected = false;
            store.commit('updateIsNetworkConnected', false);
            callbacks.clear();
            setTimeout(() => {
                // console.log('重连中');
                start(true);
            }, 5000);
        });
    }
    // 在用户退出登录时调用logout确保退出登录时断开底层WebSocket
    logout() {
        this.signal.stop();
    }
}

let callbackHandle = 0;
// 需要执行的函数集
let connectCallbacks = new Map();
let dataCallbacks = new Map();

// 连接是否成功
let isconnected = false;
const signal = new signalR.HubConnectionBuilder().withUrl(SIGNALR_Url, { accessTokenFactory: () => token }).build();

// 直接开始连接
export function subscribe(e, id, callback) {
    return signal.invoke('subscribe', { eventName: e, resourceId: id }).then((codingId) => {
        dataCallbacks.set(codingId, {
            eventName: e,
            resourceId: id,
            callback: callback
        });
        return codingId;
    });
}

// 直接开始所有连接
export function subscribeAll(arr) {
    return signal
        .invoke(
            'subscribeAll',
            arr.map((eve) => {
                return { eventName: eve.eventName, resourceId: eve.shipId, callback: eve.callback };
            })
        )
        .then((codingId) => {
            for (var i = 0; i < codingId.length; i++) {
                dataCallbacks.set(codingId[i], {
                    eventName: arr[i].eventName,
                    resourceId: arr[i].shipId,
                    callback: arr[i].callback
                });
            }
            return codingId;
        });
}

// 更新token的函数
export function authenticate(token) {
    return signal.invoke('authenticate', token).catch(function (err) {
        return false;
    });
}

// 关闭指定数据连接，每一次重新连接或有相应的编码返回，只有输入对应连接才会关闭
// 两种状况，一种客户端断线，不会有新的编码获取，第二种是服务器断线，会有新的编码获取
export function unsubscribe(subscribeId) {
    if (!subscribeId) {
        signal
            .invoke('unsubscribeAll')
            .catch(function (err) {
                return err.toString();
            })
            .then(() => {
                dataCallbacks.clear();
            });
    } else {
        signal
            .invoke('unsubscribe', subscribeId)
            .catch(function (err) {
                return err.toString();
            })
            .then(() => {
                for (let val of subscribeId) {
                    if (val) {
                        dataCallbacks.delete(val);
                    }
                }
            });
    }
}

export function install() {
    // install方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
    start(false);
    Vue.prototype.signalr = signal;
}

// 注册连接和重连成功后执行的回调函数，如果调用此函数时连接已建立，回调将会被立即执行一次。
// 返回值为用于删除重连回调的句柄。
export function connected(cb) {
    connectCallbacks.set(++callbackHandle, cb);
    // 监测没有连接成功时，函数不会执行
    if (isconnected) {
        cb(false);
    }

    return callbackHandle;
}

// 删除已注册的重连回调。
export function unconnected(handle) {
    connectCallbacks.delete(handle);
}

// 作用未知
export function getSubscriptions() {
    return signal.invoke('getSubscriptions');
}

// 在用户退出登录时调用logout确保退出登录时断开底层WebSocket
export function logout() {
    signal.stop();
}
