<template>
  <div class="keyword-search-area">
    <!-- 船只选择框 -->
    <el-form :model="shipForm" v-if="queryShip">
      <el-form-item prop="usvId">
        <el-select
          clearable
          filterable
          v-loadmore="getNextPageShipList"
          v-model="shipForm.usvId"
          :placeholder="placeholder"
          :loading="remoteLoading"
          :filter-method="(keyword) => filterShipList(keyword, states)"
          @visible-change="getShipList($event, states)"
          @change="selectShip"
        >
          <el-option
            v-for="item in shipList"
            :key="item.id"
            :label="item.displayName"
            :value="item.id"
          >
            <span style="float: left">{{ item.displayName }}</span>
            <span
              v-if="item.runtimeInfo.state == '离线'"
              style="float: right; color: #8492a6; font-size: 13px"
            >
              {{ item.runtimeInfo.state }}
            </span>
            <span v-else style="float: right; color: rgba(29, 127, 238, 0.938); font-size: 13px">
              {{ item.runtimeInfo.state }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 航道页面选择框 -->
    <el-form :model="portForm" v-else-if="isShowWaterway">
      <el-form-item prop="id">
        <el-select
          clearable
          filterable
          v-loadmore="getNextPageNavaAndWayList"
          v-model="wayForm.id"
          :placeholder="placeholder"
          :loading="remoteLoading"
          :filter-method="(keyword) => filterNavaAndWayList(keyword)"
          @visible-change="getNavaAndWayList"
          @change="selectNavaAndWay"
        >
          <el-option
            v-for="item in navaAndWayList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.ident }}</span>
            <span style="float: right; color: #8492a6">{{
              +item.type === 1 ? '航标' : '航道'
            }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 航图页面选择框 -->
    <el-form :model="chartForm" v-else-if="isShowChart">
      <el-form-item prop="id">
        <el-select
          clearable
          filterable
          v-loadmore="getNextPageNavaAndWayList"
          v-model="chartForm.id"
          :placeholder="placeholder"
          :loading="remoteLoading"
          :filter-method="(keyword) => filterNavaAndWayList(keyword)"
          @visible-change="getNavaAndWayList"
          @change="selectNavaAndWay"
        >
          <el-option
            v-for="item in navaAndWayList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ +item.type === 4 ? item.port.name : item.ident }}</span>
            <span style="float: right; color: #8492a6">{{
              +item.type === 1 ? '航标' : +item.type === 2 ? '航道' : '港口'
            }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 港口选择框 -->
    <el-form :model="portForm" v-else>
      <el-form-item prop="usvId">
        <el-select
          clearable
          filterable
          v-loadmore="getNextPagePortList"
          v-model="portForm.portId"
          :placeholder="placeholder"
          :loading="remoteLoading"
          :filter-method="(keyword) => filterPortList(keyword)"
          @visible-change="getPortList"
          @change="selectPort"
        >
          <el-option v-for="item in portList" :key="item.id" :label="item.name" :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right">{{ item.ident }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { apiGetShip } from 'api/usv';
import { apiGetPortByQuery } from 'api/port';
import { apiGetNavaAndWayByQuery } from 'api/waterway';

import { BASE_CONSTANTS, PAGE_SIZE } from '@/config';
export default {
  props: {
    queryShip: {
      type: Boolean,
      default: false
    },
    isShowWaterway: {
      type: Boolean,
      default: false
    },
    isShowChart: {
      type: Boolean,
      default: false
    },
    states: {
      type: Array,
      default: () => [0, 1, 2, 3, 4, 5]
    },
    paramsArray: {
      type: Array,
      default: () => [1, 2]
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    autoClear: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      shipForm: {
        usvId: null
      },
      portForm: {
        portId: null
      },
      wayForm: {
        id: null
      },
      chartForm: {
        id: null
      },
      remoteLoading: '',
      // 搜索条件
      page: PAGE_SIZE.page,
      keyword: '',
      shipList: [],
      total: 0,
      portList: [],
      navaAndWayList: []
    };
  },
  methods: {
    //获取在线船只
    async getShipList(flag, states) {
      if (!flag) {
        // 关闭下拉框
        this.shipList = [];
        this.page = PAGE_SIZE.page;
        this.total = 0;
        return;
      }
      this.remoteLoading = true;
      const res = await apiGetShip({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.States': states
      });
      this.remoteLoading = false;
      if (res.errorCode) return;
      this.shipList = res.data.result;
      this.total = res.data.total;
      for (let item of this.shipList) {
        item.runtimeInfo.state = BASE_CONSTANTS.usvState(item.runtimeInfo.state);
      }
    },
    // 关键字查询船只
    async filterShipList(keyword, states) {
      this.keyword = keyword;
      this.remoteLoading = true;
      const res = await apiGetShip({
        Page: 1,
        Size: 10,
        'Condition.States': states,
        'Condition.Keyword': keyword
      });
      this.remoteLoading = false;
      if (res.errorCode) return;
      this.shipList = res.data.result;
      this.total = res.data.total;
      for (let item of this.shipList) {
        item.runtimeInfo.state = BASE_CONSTANTS.usvState(item.runtimeInfo.state);
      }
    },
    // 获取下一页船只数据
    async getNextPageShipList() {
      if (this.shipList.length === this.total) return;
      this.page++;
      const res = await apiGetShip({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.States': this.states,
        'Condition.Keyword': this.keyword
      });
      if (res.errorCode) return;
      for (let item of res.data.result) {
        item.runtimeInfo.state = BASE_CONSTANTS.usvState(item.runtimeInfo.state);
        this.shipList.push(item);
      }
    },
    // 获取港口
    async getPortList(flag) {
      if (!flag) {
        this.portList = [];
        this.page = PAGE_SIZE.page;
        this.total = 0;
      }
      this.remoteLoading = true;
      const res = await apiGetPortByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size
      });
      this.remoteLoading = false;
      if (res.errorCode) return;
      this.total = res.data.total;
      this.portList = res.data.result;
    },
    // 关键字查询港口
    async filterPortList(keyword) {
      this.keyword = keyword;
      this.remoteLoading = true;
      this.page = 1;
      const res = await apiGetPortByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.Keyword': keyword
      });
      this.remoteLoading = false;
      if (res.errorCode) return;
      this.portList = res.data.result;
      this.total = res.data.total;
    },
    // 获取下一页港口数据
    async getNextPagePortList() {
      if (this.portList.length === this.total) return;
      this.page++;
      const res = await apiGetPortByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.Keyword': this.keyword
      });
      if (res.errorCode) return;
      for (let item of res.data.result) {
        this.portList.push(item);
      }
    },

    // 选中船只
    selectShip(id) {
      let ship = this.shipList.find((v) => v.id === id);
      this.$emit('selectShip', ship);
      if (this.autoClear) {
        this.shipForm.usvId = null;
      }
    },
    // 选中港口
    selectPort(id) {
      let port = this.portList.find((v) => v.id === id);
      this.$emit('selectPort', port);
      if (this.autoClear) {
        this.portForm.portId = null;
      }
    },

    // 获取航道航标港口数据
    async getNavaAndWayList(flag) {
      if (!flag) {
        this.navaAndWayList = [];
        this.page = PAGE_SIZE.page;
        this.total = 0;
        return;
      }
      this.remoteLoading = true;
      const { data, errorCode } = await apiGetNavaAndWayByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.Type': this.paramsArray.toString()
      });
      this.remoteLoading = false;
      if (+errorCode !== 0) return;
      this.total = data.total;
      this.navaAndWayList = data.result;
      console.log(this.navaAndWayList);
    },
    // 关键字航道航标港口数据
    async filterNavaAndWayList(keyword) {
      this.keyword = keyword;
      this.remoteLoading = true;
      this.page = 1;
      const res = await apiGetNavaAndWayByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.Keyword': keyword,
        'Condition.Type': this.paramsArray.toString()
      });
      this.remoteLoading = false;
      if (+res.errorCode !== 0) return;
      this.navaAndWayList = res.data.result;
      this.total = res.data.total;
    },
    // 获取下一页航道航标数据
    async getNextPageNavaAndWayList() {
      if (this.navaAndWayList.length === this.total) return;
      this.page++;
      const res = await apiGetNavaAndWayByQuery({
        Page: this.page,
        Size: PAGE_SIZE.size,
        'Condition.Keyword': this.keyword,
        'Condition.Type': [1, 2].toString()
      });
      if (res.errorCode !== 0) return;
      for (let item of res.data.result) {
        this.navaAndWayList.push(item);
        console.log('获取下一页数据', this.navaAndWayList.length);
      }
    },
    selectNavaAndWay(id) {
      let value = this.navaAndWayList.find((v) => v.id === id);
      this.$emit('selectNavaAndWay', value);
      if (this.autoClear) {
        this.wayForm.id = null;
        this.chartForm.id = null;
      }
    }
  }
};
</script>

<style></style>
