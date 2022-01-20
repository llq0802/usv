<template>
  <div class="organ-content">
    <el-card class="box-card">
      <table-search
        :buttonName="'添加组织'"
        @buttonSearch="handleButtonSearch"
        @handleDrag="handleButtonDrag"
        @clear="handleButtonSearch"
      />
      <!-- 封装的表格 -->
      <base-table
        :total="total"
        :tableData="tableData"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        @buttonClick="tableButtonClick"
      />
    </el-card>

    <!-- 弹框组件 -->
    <edit-add :isShow.sync="isShowEditAdd" :title="title" :currentRow="currentRow" />
  </div>
</template>

<script>
import BaseTable from '@/components/common/table/Mytable.vue';
import TableSearch from '@/components/common/table-search/TableSearch.vue';
import EditAdd from './components/S-AddOrEdit.vue';
import { confirmMsg } from '@/utils';
import { PAGE_SIZE } from '@/config';
import * as organApi from '@/api/organization';

export default {
  name: 'organ',
  components: {
    BaseTable,
    TableSearch,
    EditAdd
  },
  data() {
    return {
      currentRow: {},
      isShowEditAdd: false,
      total: 0,
      title: 'add',
      tableData: [],
      tableColumn: Object.freeze([
        {
          prop: 'name',
          label: '机构名称'
        }
      ]),
      tableOption: {
        label: '操作',
        options: [
          {
            label: '编辑',
            type: 'primary',
            methods: this.editOrgan
          },
          {
            label: '删除',
            type: 'danger',
            methods: this.delOrgan
          }
        ]
      }
    };
  },
  created() {
    console.log(organApi);
    this.getOrganList();
  },
  mounted() {},
  methods: {
    //表格按钮事件调用
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    },
    /**
     * 获取组织列表
     */
    async getOrganList() {
      let res = await organApi.apiGetOrganAll();
      if (res.errorCode === 0) {
        this.tableData = res.data;
        this.total = res.data.length;
      }
    },
    /**
     * 搜索组织
     */
    handleButtonSearch() {
      this.getOrganList();
    },
    /**
     * 添加组织
     */
    handleButtonDrag() {
      this.isShowEditAdd = true;
      this.title = 'add';
      console.log('handleButtonDrag');
    },
    /**
     * 修改组织
     */
    editOrgan(row, index) {
      this.currentRow = row;
      this.title = 'edit';
      this.isShowEditAdd = true;
    },
    /**
     * 删除组织
     */
    async delOrgan(row, index) {
      let confirmRes = await confirmMsg(this, row.name);
      if (confirmRes === 'confirm') {
        this.tableData.splice(index, 1);
        this.$message.success('删除成功');
      }
    }
  }
};
</script>

<style scoped lang="less">
.organ-content {
  height: 100%;
  position: relative;
}
/deep/ .el-card {
  height: 100%;
}
</style>
