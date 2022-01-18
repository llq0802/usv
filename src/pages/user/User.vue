<template>
  <div class="user-content">
    <el-card class="box-card">
      <table-search
        :buttonName="'添加用户'"
        @buttonSearch="handleButtonSearch"
        @handleDrag="handleButtonDrag"
      >
      </table-search>
      <base-table
        :total="total"
        :tableLoading="loading"
        :tableData="tableData"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        @buttonClick="tableButtonClick"
        @dropdownChange="dropdownChange"
        @dropdownShow="dropdownShow"
      />
    </el-card>

    <edit-add :isShow="isShowEditAdd" @cancal="dragCancal" :title="title"></edit-add>
  </div>
</template>

<script>
import { PAGE_SIZE } from '@/config';
import * as userApi from '@/api/user';
import BaseTable from '@/components/common/table/Mytable.vue';
import TableSearch from '@/components/common/table-search/TableSearch.vue';
import EditAdd from './components/S-AddOrEdit.vue';

export default {
  name: 'user',
  components: {
    BaseTable,
    TableSearch,
    EditAdd
  },
  data() {
    return {
      isShowEditAdd: false,
      title: '',
      currentRow: {},
      userParams: {
        Page: PAGE_SIZE.page,
        Size: PAGE_SIZE.size,
        'Condition.Keyword': ''
      },
      total: 0,
      loading: false,
      tableData: [],
      tableColumn: Object.freeze([
        {
          type: 'index',
          label: '序号'
        },
        { prop: 'userName', label: '用户名' },
        {
          prop: 'organization',
          label: '所属机构',
          render: (val) => val.name
        },
        {
          prop: 'role',
          label: '角色',
          tag: true
        }
      ]),
      tableOption: Object.freeze({
        label: '操作',
        options: [
          {
            label: '编辑',
            dropdown: true,
            items: [
              {
                command: 'userInfo',
                label: '修改信息'
              },
              {
                command: 'passWord',
                label: '修改密码'
              }
            ]
          },
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.delUser
          }
        ]
      })
    };
  },
  mounted() {
    this.getUserList();
  },
  methods: {
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    },
    async getUserList() {
      const params = this.userParams;
      let { data } = await userApi.apiGetUserByQuery(params);
      if (data.result.length) {
        this.tableData = data.result;
        this.total = data.total;
      }
    },
    // 删除用户
    delUser(row, index) {
      console.log('delUser');
      console.log(row, index);
    },
    //搜索用户
    handleButtonSearch(val) {
      this.userParams.Page = 1;
      this.userParams['Condition.Keyword'] = val;
      this.getUserList();
    },

    handleButtonDrag(val) {
      console.log('handleButtonDrag');
      this.title = 'add';
      this.isShowEditAdd = true;
    },
    dropdownChange(val) {
      if (val === 'userInfo') {
        console.log('userInfo');
        this.title = 'edit';
        this.isShowEditAdd = true;
      } else if (val === 'passWord') {
        console.log('passWord');
      }
    },
    dropdownShow(row) {
      if (this.currentRow.id === row.id) return;
      this.currentRow = row;
      console.log(this.currentRow);
    },
    dragCancal() {
      this.isShowEditAdd = false;
    }
  }
};
</script>

<style scoped lang="less">
.user-content {
  height: 100%;
  position: relative;
}
/deep/ .el-card {
  height: 100%;
}
</style>
