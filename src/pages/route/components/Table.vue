<template>
  <div>
    <!-- 搜索框 -->
    <div class="search-part">
      <keyword-search :placeholder="'请选择始发港口'" @selectPort="getPort(0, $event)">
      </keyword-search>
      <keyword-search :placeholder="'请选择目的港口'" @selectPort="getPort(1, $event)">
      </keyword-search><br>
      <el-input v-model="keyword" placeholder="请输入航线名称" clearable></el-input>
      <el-button type="primary" icon="el-icon-search" @click="getRouteList">搜索</el-button>
      <el-button type="success" @click="addRoute">新建航线</el-button>
    </div>
    <div class="table">
      <route-table
        ref="routeTable"
        :tableIndex="false"
        :highlightCurrentRow="true"
        :total="total"
        :tableLoading="tableLoading"
        :tableData="routeList"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        :paginationOptions="paginationOptions"
        @rowClick="handleRowClick"
        @buttonClick="clickButton"
        @pageChange="pageChange"
      >
      </route-table>
    </div>
    
  </div>
</template>

<script>
import KeywordSearch from 'components/common/keyword-search/KeywordSearch';
import RouteTable from 'components/common/table/Mytable';
import { confirmMsg, deepClone } from '@/utils';
// 常量
import { PAGE_SIZE } from '@/config';
// api
import { apiGetRouteQuery, apiPostDeleteRoute } from 'api/route';
export default {
  components: {
    KeywordSearch, RouteTable
  },
  data() {
    return {
      // 港口id
      depPortId: null,
      desPortId: null,
      /********************表格数据**********************/
      tableLoading: false,
      routeList: [],
      total: 0,
      keyword: '',
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'id', label: 'id', width: 60 },
        { prop: 'name', label: '名称', width: 160 },
        { prop: 'departure', label: '始发地', width: 60,
          render: val => val.name
        },
        { prop: 'destination', label: '目的地', width: 60,
          render: val => val.name
        }
      ]),
      // 操作配置
      tableOption: Object.freeze({
        label: '操作',
        width: 55,
        options: [
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.deleteRoute
          }
        ]
      }),
      // 分页配置
      paginationOptions: {
        page: PAGE_SIZE.page,
        size: 5,
      },
    }
  },
  methods: {
    // 获取航线
    async getRouteList() {
      const res = await apiGetRouteQuery({
        Page: this.paginationOptions.page,
        Size: this.paginationOptions.size,
        'Condition.Keyword': this.keyword,
        'Condition.Destination': this.desPortId,
        'Condition.Departure': this.depPortId
      });
      if (res.errorCode) return;
      this.total = res.data.total;
      this.routeList = res.data.result;
      for (let item of this.routeList) {
        if (!item.destination) {
          this.$set(item, 'destination', { name: ''});
        }
        if (!item.departure) {
          this.$set(item, 'departure', { name: ''});
        }
      }
    },
    // 获取港口 a=0始发港口 a=1目的港口
    getPort(a, port) {
      // 始发港口
      if (a === 0) {
        if (!port) return this.depPortId = null;
        this.depPortId = port.id;
      }
      // 目的港口
      else {
        if (!port) return this.desPortId = null;
        this.desPortId = port.id;
      }
    },
    // 点击行
    handleRowClick(row) {
      this.$emit('getRow', row);
    },
    // 点击操作按钮
    clickButton (option) {
      option.event.stopPropagation();
      option.methods.call(this, option.row);
    },
    async deleteRoute(row) {
      const cf = await confirmMsg(this, `即将删除航线${row.name}`);
      if (cf === 'cancel') return;
      const res = await apiPostDeleteRoute(row.id);
      if (res.errorCode) return;
      this.$message.success(`航线${row.name}已删除!`);
      this.getRouteList();
    },
    // 翻页
    pageChange (page) {
      this.paginationOptions.page = page;
      this.getRouteList();
    },
    // 添加航线
    addRoute() {
      this.$emit('getRow', {
        name: '',
        departure: null,
        destination: null,
        segments: []
      });
    }
  },
  created() {
    this.getRouteList();
  },
  watch: {
    'routeList.length'() {
      if (!this.routeList.length) return;
      this.$emit('getRow', this.routeList[0]);
    }
  }
}
</script>

<style lang="less" scoped>
.search-part {
  .el-button--small, .el-button--small.is-round {
    padding: 8px;
  }
  .el-input {
    width: 220px;
  }
  button {
    margin-right: 20px;
  }
  /deep/ .keyword-search-area {
    width: 140px;
    display: inline-block;
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin-bottom: 0;
    }
  }
}
.table {
  /deep/ .el-table {
    margin: 0;
  }
  /deep/ .el-table__body tr.current-row > td.el-table__cell {
    background-color: #add2ff;
    color: #222;
  }
  /deep/ .el-table--small .el-table__cell {
    padding: 3px 0;
    user-select: none;
  }
  /deep/ .el-button--mini,
  .el-button--mini.is-round {
    padding: 5px 3px;
  }
  /deep/ .el-pagination {
    margin-top: 0 !important;
    text-align: center;
  }
  /deep/ .el-pagination__sizes {
    display: none;
  }
}

</style>