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
import { apiGetShipByQuery, apiGetShipById } from 'api/shipinfo';
import { BASE_CONSTANTS } from '@/config';
import { setStorage, getStorage } from '@/utils/localStorage';

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
      })
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
    },
    // 移除船只
    removeShip(options) {
      options.event.stopPropagation();
      this.showList.splice(options.index, 1);
    },
    // 查看船只
    viewShip(ship) {
      console.log(ship)
    },

    // 页面重载时恢复数据
    async regainShip() {
      let list = JSON.parse(getStorage('showShipsList'));
      if (!list.length) {
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
    }
  },
  updated() {
    setStorage('showShipsList', JSON.stringify(this.showList));
  },
  created() {
    this.regainShip();
  }
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