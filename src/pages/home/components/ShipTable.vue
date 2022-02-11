<template>
  <div>
    <span class="add-description">添加船舶</span>
    <ship-search 
      :queryShip="true" 
      :autoClear="true"
      :placeholder="'请选择添加的船舶'"
      @selectShip="addShip"
    >
    </ship-search>
    <show-ship-table
      v-if="showList.length"
      :showHeader="false"
      :tableIndex="false"
      :border="false"
      :tableData="showList"
      :tableColumn="tableColumn"
      :tableOption="tableOption"
      @rowClick="viewShip"
      @iconClick="removeShip"
    >
    </show-ship-table>
  </div>
</template>

<script>
import ShipSearch from 'components/common/keyword-search/KeywordSearch';
import ShowShipTable from 'components/common/table/Mytable';
// 工具
import * as signalr from '@/utils/signalR';
import { BASE_CONSTANTS } from '@/config';
import { setStorage, getStorage } from '@/utils/localStorage';
import { turnLngLat } from '@/utils/handleLngLat';
import bus from '@/utils/bus';
// api
import { apiGetShipByQuery, apiGetShipById } from 'api/shipinfo';
import { apiGetPortByQuery } from 'api/port';

export default {
  components: {
    ShipSearch, ShowShipTable
  },
  data() {
    return {
      loading: '',
      shipList: [],
      showList: [],
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'displayName', label: '无人船名称', width: 150 },
        { prop: 'runtimeInfo', label: '无人船状态', width: 50,
          render: val => val.state},
      ]),
      // 图标配置
      tableOption: Object.freeze({
        label: '操作',
        width: 50,
        options: [
          {
            tooltip: true,
            iconClass: 'el-icon-close',
            content: '移除船舶',
            methods: this.removeShip
          }
        ]
      }),
      // 是否订阅websocket回调函数
      isSubsribed: false,
      subscribeId: null,
      // ws连接id
      wsConnectId: null,
      // 船只数据
      shipDataMap: new Map(),
    }
  },
  methods: {
    // 添加显示的船只
    async addShip(ship) {
      if (this.showList.some(v => v.id === ship.id)) {
        this.$message.warning(`需要添加的船只已经在列表中!`);
        return;
      }
      this.showList.unshift(ship);
      this.showShip();
    },
    // 移除船只
    removeShip(options) {
      options.event.stopPropagation();
      this.showList.splice(options.index, 1);
      this.showShip();
    },
    // 查看船只
    viewShip(ship) {
      console.log(ship)
    },

    // 页面重载时恢复数据
    async regainShip() {
      let list = JSON.parse(getStorage('showShipsList'));
      if (list && !list.length) {
        // 默认显示五条在线船只
        const res = await apiGetShipByQuery({ Page: 1, Size: 9999 });
        if (!res.errorCode) return;
        for (let ship of res.data.result) {
          if (list.length === 5) return;
          if (!ship.runtimeInfo.state) {
            list.push(ship);
          }
        }
      }
      else {
        // 更新船只状态
        for(let ship of list) {
          const res = await apiGetShipById(ship.id);
          if (res.errorCode) return ship = null;
          ship = res.data;
        }
      }
      this.showList = list;
      this.showShip();
    },
    // 让选中的船只运动起来
    showShip() {
      // 如果订阅了事件，先取消
      if(this.isSubsribed) {
        this.isSubsribed = false;
        signalr.unsubscribe(this.subscribeId);
        for (let item of this.shipDataMap.values()) {
          if (!this.showList.some(val => val.id === item.id)) {
            this.shipDataMap.delete(item.id);
          }
        }
      }
      // 如果列表中没有选择船只，则清空地图中的船只
      if (!this.showList.length) {
        this.shipDataMap.clear();
      }
      // 定义事件队列
      let eventsList = this.showList.map(ship => ({
        eventName: 'usvRuntimeInfoChanged',
        shipId: ship.id,
        // 事件流回调函数
        callback: async data => {
          console.log(data);
          // 添加无人船名称
          if (this.showList.length) {
            for(let ship of this.showList) {
              if (ship.id === data.id) {
                data.shipName = ship.displayName;
              }
            }
          } else {
            const res = await apiGetShipById(data.id);
            data.shipName = res.displayName;
          }
          // 编译可执行数据
          data.state = BASE_CONSTANTS.usvState(data.state);
          data.calibratedLocation = turnLngLat(data.calibratedLocation);
          // 存放无人船数据
          this.shipDataMap.set(data.id, data);
        }
      }));
    
      // 连接ws,订阅事件
      this.wsConnectId = signalr.connected(()=>{
        // 传入事件名,和所需要的arr参数
        signalr.subscribeAll(eventsList).then(data => {
          this.isSubsribed = true;
          // 保存编码,是取消事件流的唯一标识
          if (data) {
            this.subscribeId = data;
          } else {
            this.$message.error(`指定的无人船不存在或者用户没有访问指定无人船的权限`);
          }
        })
      });
    },
    
  },
  watch: {
    shipDataMap: {
      handler() {
        // 转为数组格式
        let shipDataList = Array.from(this.shipData.values());
        bus.$emit('shipRunningList', shipDataList);
      },
      deep: true,
    }
  },
  // 更新后
  updated() {
    // 本地存储展示船只列表
    setStorage('showShipsList', JSON.stringify(this.showList));
  },
  created() {
    // 复原上次登陆状态的在线船只列表
    this.regainShip();
    // 开启websocket
    signalr.start(true);
  },
  //销毁前
  beforeDestroy() {
    // 关闭事件流
    signalr.unsubscribe(this.subscribeId);
    signalr.unconnected(this.wsConnectId);
  },
}
</script>

<style lang="less" scoped>
.add-description {
  color: rgb(88, 84, 84);
  font-size: 15px;
  padding: 0 15px;
  user-select: none;
}
/deep/ .keyword-search-area {
  width: 160px;
  display: inline-block;
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
    margin-bottom: 0;
  }
}
/deep/ .el-table--small .el-table__cell {
  padding: 2px 0;
  font-size: 14px;
  user-select: none;
  &:hover {
    cursor: pointer;
  }
  .el-icon-close {
    &:hover {
      color: red;
    }
  }
}
</style>