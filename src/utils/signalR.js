//引入安装的signalr包<br>
import * as signalR from '@aspnet/signalr';
// 定期检查token是否过期
import { checkTokenTime } from '@/utils/token';
// 事件总线
import bus from '@/utils/bus';
import { SIGNALR_Url } from '@/config';
import { getStorage } from '@/utils/localStorage';
const tokenTime = getStorage('tokenTime');
const token = getStorage('token');

let callbackHandle = 0;
// 需要执行的函数集
let connectCallbacks = new Map();
// 连接成功表示
let isconnected = false;

// 通过指定服务器和token 配置连接
let signal;
signal = new signalR.HubConnectionBuilder() //服务器地址
  .withUrl(SIGNALR_Url, { accessTokenFactory: () => token })
  .build();
// 表示获取数据可以开始，但是没有传入需要获取的类型和id
export async function start(reconnect) {
  if (token && !checkTokenTime(tokenTime, 0)) {
    try {
      // 建立连接
      await signal.start();
      // console.log("SignalR Connected.");
      bus.$emit('Disconnect', {});
      // 数据获取
      startStreaming([
        // 在此处限制服务器发送事件的间隔，0表示不限制（由服务器控制）
        // 如果服务器产生事件的间隔小于此处设置的间隔，服务器将按此处设置的间隔限制发送事件的频率
        { eventName: 'usvRuntimeInfoChanged', samplingInterval: 0.5 },
        { eventName: 'planExecutionStateChanged', samplingInterval: 0.0 },
      ]);

      // 建立连接后马上执行一次获取到的函数（用于刷新后，数据马上连接）
      for (let cb of connectCallbacks) {
        cb[1](reconnect);
      }
      isconnected = true;
    } catch (err) {
      // console.log(err);
      // 如果在初试获取失败，则5秒后重连

      setTimeout(() => {
        // console.log('重连中,token正常');
        start(true);
      }, 5000);
    }
  } else {
    // 如果在初试获取失败，则5秒后重连
    setTimeout(() => {
      // console.log('重连中，token错误');
      start(true);
    }, 5000);
  }
}
// 关闭连接时回调
signal.onclose(() => {
  // console.log('关闭连接时');
  bus.$emit('Disconnect', {
    message: '服务器连接已断开，正在尝试重连',
  });
  isconnected = false;

  dataCallbacks.clear();

  setTimeout(() => {
    // console.log('重连中');
    start(true);
  }, 5000);
});

let stream;
let dataCallbacks = new Map();
function startStreaming(streamingOptions) {
  stream = signal.stream('stream', streamingOptions);
  stream.subscribe({
    next: item => {
      // 数据获取地点
      // console.log(dataCallbacks);
      for (let val of dataCallbacks) {
        if (val[1].eventName == item.eventName && val[1].resourceId == item.resourceId) {
          val[1].callback(Object.assign({}, item.data));
        }
      }
    },
    error: err => {
      return err;
    },
    complete: () => {
      // console.log("Stream completed.");
    },
  });
}
// 直接开始连接
export function subscribe(e, id, callback) {
  return signal.invoke('subscribe', { eventName: e, resourceId: id }).then(codingId => {
    dataCallbacks.set(codingId, {
      eventName: e,
      resourceId: id,
      callback: callback,
    });
    return codingId;
  });
}

// 直接开始所有连接
export function subscribeAll(arr) {
  return signal
    .invoke(
      'subscribeAll',
      arr.map(eve => {
        return { eventName: eve.eventName, resourceId: eve.shipId, callback: eve.callback };
      })
    )
    .then(codingId => {
      for (let i = 0; i < codingId.length; i++) {
        dataCallbacks.set(codingId[i], {
          eventName: arr[i].eventName,
          resourceId: arr[i].shipId,
          callback: arr[i].callback,
        });
      }
      return codingId;
    });
}

// 更新token的函数
export function authenticate(token) {
  return signal.invoke('authenticate', token).catch(function(err) {
    return false;
  });
}

// 关闭指定数据连接，每一次重新连接或有相应的编码返回，只有输入对应连接才会关闭
// 两种状况，一种客户端断线，不会有新的编码获取，第二种是服务器断线，会有新的编码获取
export function unsubscribe(subscribeId) {
  if (!subscribeId) {
    signal
      .invoke('unsubscribeAll')
      .catch(function(err) {
        return err.toString();
      })
      .then(() => {
        dataCallbacks.clear();
      });
  } else {
    signal
      .invoke('unsubscribe', subscribeId)
      .catch(function(err) {
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
