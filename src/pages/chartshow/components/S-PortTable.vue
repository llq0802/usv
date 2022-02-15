<template>
  <div class="table-content">
    <el-tabs v-model="radio" type="card" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="item in items"
        :key="item.name"
        :label="item.label"
        :name="item.name"
        :disabled="item.disabled"
      >
        <base-table
          v-bind="$attrs"
          v-on="$listeners"
          :tableData="item.tableData"
          :tableColumn="item.tableColumn"
        />
        <el-button
          class="btn"
          v-if="item.name !== 'port'"
          type="primary"
          @click="handleAdd(item.name)"
          >添加{{ item.buttonName }}</el-button
        >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import BaseTable from 'components/common/table/Mytable.vue';
import { BASE_CONSTANTS } from '@/config';
export default {
  name: 's-port-table',
  components: {
    BaseTable
  },
  props: {
    isShowPortDetail: {
      type: Boolean,
      default: true //是否禁用
    },
    portList: {
      type: Array,
      default: () => []
    },
    berthList: {
      type: Array,
      default: () => []
    },
    pointList: {
      type: Array,
      default: () => []
    },
    procedureList: {
      type: Array,
      default: () => []
    },
    transitionList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: Object.freeze([
        {
          name: 'port',
          label: '港口列表',
          disabled: false,
          tableData: [],
          tableColumn: [
            { prop: 'name', label: '名称' },
            {
              prop: 'locationObj',
              label: '坐标',
              render: (val) => `${val.longitude.toFixed(6)}，${val.latitude.toFixed(6)} `
            },
            {
              prop: 'area',
              label: '面积',
              render: (val) => `${val} ㎡`
            }
          ]
        },
        {
          name: 'berth',
          label: '泊位列表',
          disabled: true,
          buttonName: '泊位',
          tableData: [],
          tableColumn: [
            { prop: 'ident', label: '名称' },
            {
              prop: 'area',
              label: '面积',
              render: (val) => `${val} ㎡`
            },
            {
              prop: 'isInEffect',
              label: '是否生效',
              switch: true
            }
            // {
            //   prop: 'locationObj',
            //   label: '坐标',
            //   render: (val) => `${val.longitude.toFixed(6)}，${val.latitude.toFixed(6)} `
            // }
          ]
        },
        {
          name: 'point',
          label: '端点列表',
          disabled: true,
          buttonName: '端点',
          tableData: [],
          tableColumn: [
            { prop: 'ident', label: '名称' },
            {
              prop: 'locationObj',
              label: '坐标',
              render: (val) => `${val.longitude.toFixed(6)}，${val.latitude.toFixed(6)} `
            }
          ]
        },
        {
          name: 'procedure',
          label: '进出港程序',
          disabled: true,
          buttonName: '程序',
          tableData: [],
          tableColumn: [
            { prop: 'showPath', label: '起止点' },
            {
              prop: 'type',
              label: '类型',
              render: (val) => BASE_CONSTANTS.procedureType(val)
            },
            {
              prop: 'isInEffect',
              label: '是否生效',
              switch: true
            }
          ]
        },
        {
          name: 'transition',
          label: '过渡路径',
          disabled: true,
          buttonName: '过渡路径',
          tableData: [],
          tableColumn: [
            { prop: 'showPath', label: '起止点' },
            {
              prop: 'type',
              label: '终端',
              render: (val) => BASE_CONSTANTS.transitionType(val)
            },
            {
              prop: 'isInEffect',
              label: '是否生效',
              switch: true
            }
          ]
        }
      ]),
      radio: 'port'
    };
  },
  computed: {
    items() {
      return this.list.map((item) => {
        switch (item.name) {
          case 'port':
            item.tableData = this.portList;
            break;
          case 'berth':
            item.tableData = this.berthList;
            item.disabled = !this.isShowPortDetail;
            break;
          case 'point':
            item.tableData = this.pointList;
            item.disabled = !this.isShowPortDetail;
            break;
          case 'procedure':
            item.tableData = this.procedureList;
            item.disabled = !this.isShowPortDetail;
            break;
          case 'transition':
            item.tableData = this.transitionList;
            item.disabled = !this.isShowPortDetail;
            break;
        }
        return item;
      });
    }
  },
  methods: {
    handleTabClick(val) {
      this.$emit('handleTabClick', val.name, this.radio);
    },
    handleAdd(val) {
      this.$emit('handleAddBtn', val);
    }
  }
};
</script>

<style scoped lang="less">
.table-content {
  position: absolute;
  top: 0px;
  right: 0;
  z-index: 100;
  width: 400px;
  text-align: right;
  .btn {
    margin: 15px 0px 0 0;
  }
  /deep/.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    border-bottom-color: #409eff;
  }
  /deep/ .el-tabs__nav-prev,
  /deep/.el-tabs__nav-next {
    line-height: 36px;
  }
  /deep/ .el-tabs__item {
    padding: 0 12px;
    height: 33px;
    line-height: 33px;
  }
  /deep/.el-tabs__header {
    margin: 0;
    background: #f5f7fa;
  }
  /deep/ .el-table {
    margin: 0;
  }
  /deep/ .el-table__body tr.current-row > td.el-table__cell {
    background-color: #add2ff;
    color: #fafafa;
  }
  /deep/ .el-table--small .el-table__cell {
    padding: 3px 0;
    user-select: none;
  }
  /deep/ .el-button--mini,
  .el-button--mini.is-round {
    padding: 6px 5px;
  }
  /*/deep/ .el-pagination {
    margin-top: 0 !important;
  }*/
}
</style>
