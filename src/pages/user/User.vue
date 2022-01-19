<template>
  <div class="user-content">
    <el-card class="box-card">
      <!-- 搜索组件 -->
      <table-search
        :buttonName="'添加用户'"
        @buttonSearch="handleButtonSearch"
        @handleDrag="handleButtonDrag"
        @clear="handleButtonSearch"
      >
      </table-search>
      <!-- 封装的表格 -->
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
    <!-- 弹框组件 -->
    <edit-add
      :isShow.sync="isShowEditAdd"
      :title="title"
      :organInfoList="organInfoList"
      :currentRow="currentRow"
    />
  </div>
</template>

<script>
import { PAGE_SIZE } from '@/config';
import * as userApi from '@/api/user';
import * as organApi from '@/api/organization';
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
      organInfoList: [],
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
    this.getOrganList();
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

    async getOrganList() {
      let { data } = await organApi.apiGetOrganAll();
      if (data) {
        this.organInfoList = data;
      }
    },
    // 删除用户
    async delUser(row, index) {
      const confirmRlust = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err);
      if (confirmRlust === 'confirm') {
        const { data } = await userApi.apiDelUser;
        if (+data.errorCode === 0) {
          this.tableData.splice(index, 1);
        }
      }
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
        this.title = 'edit';
      } else if (val === 'passWord') {
        this.title = 'editPassword';
      }
      this.isShowEditAdd = true;
    },
    dropdownShow(row) {
      if (this.currentRow.id === row.id) return;
      this.currentRow = row;
      console.log(this.currentRow);
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
