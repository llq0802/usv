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
import { confirmMsg } from '@/utils';
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
      tableData: [],
      organInfoList: [],
      tableColumn: Object.freeze([
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
    /**
     *  表格操作项调用事件
     */
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    },
    /**
     *  获取用户列表
     */
    async getUserList() {
      const params = this.userParams;
      let { data } = await userApi.apiGetUserByQuery(params);
      if (data.result.length) {
        this.tableData = data.result;
        this.total = data.total;
      }
    },
    /**
     *  获取组织列表
     */
    async getOrganList() {
      let { data } = await organApi.apiGetOrganAll();
      if (data) {
        this.organInfoList = data;
      }
    },
    /**
     *  删除用户
     */
    async delUser(row, index) {
      let confirmRes = await confirmMsg(this, row.userName);
      if (confirmRes === 'confirm') {
        const { data } = await userApi.apiDelUser;
        if (+data.errorCode === 0) {
          this.tableData.splice(index, 1);
          this.$message.success('删除成功');
        }
      }
    },
    /**
     *  搜索用户
     */
    handleButtonSearch(val) {
      this.userParams.Page = 1;
      this.userParams['Condition.Keyword'] = val;
      this.getUserList();
    },
    /**
     *  点击添加用户按钮
     */
    handleButtonDrag(val) {
      this.title = 'add';
      this.isShowEditAdd = true;
    },
    /**
     *  点击下拉菜单事件
     */
    dropdownChange(val) {
      this.title = val === 'userInfo' ? 'edit' : 'editPassword';
      this.isShowEditAdd = true;
    },
    /**
     *  获取当前行的值
     */
    dropdownShow(row) {
      if (this.currentRow.id === row.id) return;
      this.currentRow = row;
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
