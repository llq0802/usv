<template>
  <div class="content">
    <hr>
    <span>名称</span>
    <el-input v-model="routeInfo.name"></el-input>
    <span>始发地</span>
    <keyword-search 
      :placeholder="routeInfo.departureId ? routeInfo.departure.name : '始发地'"
      @selectPort="getPort(0, $event)"
    >
    </keyword-search>
    <span>目的地</span>
    <keyword-search
      :placeholder="routeInfo.destinationId ? routeInfo.destination.name : '目的地'"
      @selectPort="getPort(1, $event)"
    >
    </keyword-search>
    <!-- VIA - TO -->
    <el-row class="navigation-via-to">
      <el-col :span="12"><div>VIA</div></el-col>
      <el-col :span="12"><div>TO</div></el-col>
    </el-row>
  </div>
</template>

<script>
import KeywordSearch from 'components/common/keyword-search/KeywordSearch';
import { deepClone, clearProperties } from '@/utils';
export default {
  props: {
    routeInfo: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        depPortId: null,
        desPortId: null,
      })
    }
  },
  components: {
    KeywordSearch
  },
  data() {
    return {
      // 始发地、目的地
      depPortId: null,
      desPortId: null,
    }
  },
  methods: {
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
    test() {
      console.log(123)
    }
  },
  watch: {
    // 切换航线
    'routeInfo.id'() {
      // 新建航线
      if (!this.routeInfo.id) {
        this.route = clearProperties(this.route);
      }
      this.route = deepClone(this.routeInfo);
    }
  },
  created() {

  }
}
</script>

<style lang="less" scoped>
.content {
    font-size: 14px !important;
  .el-input {
    width: 100px;
    /deep/ .el-input__inner {
      padding: 0;
    }
  }
  /deep/ .keyword-search-area {
    width: 92px;
    display: inline-block;
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin-bottom: 0;
    }
    .el-input {
      padding: 0;
      .el-input__suffix {
        right: 0;
      }
      /deep/ .el-input__inner {
        padding: 0;
      }
    }
  }
}
/*via-to*/
.navigation-via-to {
  text-align: center;
}
/*航段信息*/

</style>