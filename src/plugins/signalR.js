//引入安装的signalr包
import * as signalR from '@aspnet/signalr';
import { SIGNALR_Url } from '@/config';
import { getStorage } from '@/utils/localStorage';
// 定期检查token是否过期
import { checkTokenTime } from '@/utils/token';
const tokenTime = getStorage('tokenTime');
const token = getStorage('token');
export default class SocketService {
  // signalR实例
  ws = null;
  stream = null;
  instance = null;
  // 连接是否成功
  isConnected = false;
  // 需要执行的函数集
  callbacks = new Map();
  //默认发送类型
  type = 'send';
  //发送延迟次数
  connectCount = 0;
  /**
   * 单例模式
   */
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }
  /**
   *连接signalR
   * @memberof SocketService
   */
  async content() {
    this.ws = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_Url, { accessTokenFactory: () => token })
      .build();

    try {
      const isTokenPast = !checkTokenTime(tokenTime, 0);
      //存在token，并且没有过期
      if (token && isTokenPast) {
        // 开始连接
        await this.ws.start();
        //表示连接成功
        this.isConnected = true;
        console.log('signalR连接成功', this.ws);
        //监听服务器消息接受
        this.onmessage();
      } else {
        console.log('token，ws重连');
        // 如果在初试获取失败，则5秒后重连
        setTimeout(() => {
          this.content();
        }, 5000);
      }
    } catch (error) {
      // 如果在初试获取失败，则5秒后重连
      setTimeout(() => {
        this.content();
      }, 5000);
    }
  }
  /**
   * 监听消息的接收
   */
  onmessage() {
    console.log('监听服务器消息的接收');
    this.ws.on(this.type, (e) => {
      console.log(e);
      if (e.eventType) {
        const cb = this.callbacks.get(e.eventType).callback;
        cb && cb.call(this, e.data);
      }
    });
  }

  /**
   *设置回调函数在map集上
   * @param {*} eventType
   * @param {*} cb
   * @memberof SocketService
   */
  setFn(eventType, data) {
    this.callbacks.set(eventType, {
      eventName: data.eventName,
      resourceId: data.resourceId,
      callback: data.callback
    });
  }
  /**
   *删除回调函数在map集上
   * @param {*} eventName
   * @memberof SocketService
   */
  delFn(eventType) {
    this.callbacks.remove(eventType);
  }
  async send(type = 'send', eventType, data) {
    this.type = type;
    if (this.isConnected) {
      this.setFn(eventType, data);
      return this.ws
        .send(this.type, {
          eventName: data.eventName,
          resourceId: data.resourceId,
          callback: data.callback
        })
        .then((codingId) => {
          console.log(codingId, '发送成功');
          return codingId;
        });
    } else {
      this.connectCount++;
      setTimeout(() => {
        console.log('send重新发送');
        this.send(type, eventType, data);
      }, 1000 * this.connectCount);
    }
  }

  /**
   *  关闭连接时回调
   * @memberof SocketService
   */
  close() {
    this.ws.onclose(() => {
      this.isconnected = false;
      this.callbacks.clear();
      setTimeout(() => {
        this.content();
      }, 5000);
    });
  }

  /**
   *在用户退出登录时调用logout确保退出登录时断开底层WebSocket
   * @memberof SocketService
   */
  logout() {
    this.ws.stop();
  }
}

// SocketService.Instance.content(); //异步

// setTimeout(() => {
//   console.log(SocketService.Instance);

//   SocketService.Instance.send('subscribeAll', 'usvRuntimeInfoChanged', {
//     eventName: 'usvRuntimeInfoChanged',
//     shipId: 1,
//     callback: (data) => {
//       console.log('usvRuntimeInfoChanged', data);
//     }
//   });
// }, 1000);
