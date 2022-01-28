<template>
  <div>
    <el-select
      v-model="keyword"
      placeholder="添加显示船舶"
      clearable
      filterable
      remote
      @visible-change="preload"
      :remote-method="keywordSearch"
      @change="addShip"
      :loading="loading"
    >
      <el-option v-for="item in shipList" :key="item.id" :label="item.displayName" :value="item">
        <span style="float: left">{{ item.displayName }}</span>
        <span v-if="item.runtimeInfo.state == '离线'" style="float: right; color: #8492a6; font-size: 13px">
          {{ item.runtimeInfo.state }}
        </span>
        <span v-else style="float: right; color: rgba(29, 127, 238, 0.938); font-size: 13px">
          {{ item.runtimeInfo.state }}
        </span>
      </el-option>
    </el-select>
    <show-ship-table
      :showHeader="false"
      :tableIndex="false"
      :tableData="showList"
      :tableColumn="tableColumn"
      :tableOption="tableOption"
    >
    </show-ship-table>
  </div>
</template>

<script>
import ShowShipTable from 'components/common/table/Mytable';
import { apiGetShip } from 'api/usv';
import { BASE_CONSTANTS } from '@/config';
export default {
  components: {
    ShowShipTable
  },
  data() {
    return {
      loading: '',
      keyword: '',
      shipList: [],
      showList: [],
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'displayName', label: '无人船名称', width: 150 },
        { prop: 'runtimeInfo', label: '无人船状态', width: 50,
          render: val => val.state},
      ]),
      // 图标配置
      tableOption: {
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
      }
    }
  },
  methods: {
    // 获取船只数据
    async getShipList() {
      this.loading = true;
      const res = await apiGetShip({
        Page: 1, Size: 999, 'Condition.Keyword': this.keyword
      });
      if (res.errorCode) return;
      this.loading = false;
      this.shipList = res.data.result;
      for (let item of this.shipList) {
        item.runtimeInfo.state = BASE_CONSTANTS.usvState(item.runtimeInfo.state);
      }
    },
    // 鼠标点击搜索框时，预加载船只信息
    preload(bool) {
      if (bool) {
        this.getShipList();
      }
    },
    // 关键字搜索
    async keywordSearch() {
      await this.getShipList();
    },
    // 添加显示的船只
    async addShip(ship) {
      if (this.showList.some(v => v.id === ship.id)) {
        this.keyword = '';
        this.$message.warning(`需要添加的船只已经在列表中!`);
        return;
      }
      this.showList.unshift(ship);
      this.keyword = '';
      console.log(this.showList)
    },
    // 移除船只
    removeShip(index) {
      console.log(index);
    },
    iconClick(options) {
      option.event.stopPropagation();
      option.methods.call(this, option.index);
    }
  }
}
</script>

<style>

</style>