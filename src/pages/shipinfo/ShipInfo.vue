<template>
  <div class="ship-content">
    <el-card>
      <!-- 搜索组件 -->
      <table-search
        :buttonName="'添加无人船'"
        @buttonSearch="handleButtonSearch"
        @handleDrag="handleButtonDrag"
        @clear="handleButtonSearch"
      >
      </table-search>
      <el-divider />
      <!-- 封装的表格 -->
      <base-table
        :tableIndex="!!total"
        :total="total"
        :tableData="shipList"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        @buttonClick="tableButtonClick"
        @dropdownChange="dropdownChange"
        @dropdownShow="dropdownShow"
      />
    </el-card>
    <!-- 无人船弹修改添加框组件 -->
    <edit-add
      :isShow.sync="isShowEditAdd"
      :title="title"
      :currentRow="currentRow"
      :organInfoList="organInfoList"
    />
    <!-- 无人船弹运行状态组件 -->
    <state-info :isShow.sync="isShowState" :currentRow="currentRow" />
    <!-- 无人船弹修改配置组件 -->
    <edit-config :isShow.sync="isShowConfig" :currentRow="currentRow" />
  </div>
</template>

<script>
import TableSearch from 'components/common/table-search/TableSearch.vue';
import BaseTable from 'components/common/table/Mytable.vue';
import EditAdd from './components/S-AddOrEdit.vue';
import StateInfo from './components/S-StateInfo.vue';
import EditConfig from './components/S-EditConfig.vue';
import * as shipApi from 'api/shipinfo';
import * as organApi from 'api/organization';
import * as liveApi from 'api/camera';
import { PAGE_SIZE, BASE_CONSTANTS } from '@/config';
import { confirmMsg } from '@/utils';
import { checkTokenTime } from '@/utils/token';

export default {
  name: 'shipinfo',
  components: {
    TableSearch,
    BaseTable,
    EditAdd,
    StateInfo,
    EditConfig
  },
  data() {
    return {
      checkTokenInterval: null,
      total: 0,
      title: 'add',
      isShowEditAdd: false,
      isShowState: false,
      isShowConfig: false,
      currentRow: {},
      organInfoList: [],
      shipList: [],
      tableColumn: [],
      // 视频信息
      videoData: {
        url: null,
        token: null,
        exp: null,
        cTime: null
      },
      tableOption: {},
      shipParams: {
        // 'Condition.States': [0, 1, 2, 3, 4, 5].join(','),
        'Condition.Keyword': '',
        Page: PAGE_SIZE.page,
        Size: PAGE_SIZE.size
      },
      tableColumn: Object.freeze([
        { prop: 'displayName', label: '无人船名称', width: 200 },
        { prop: 'serialNumber', label: '序列号' },
        { prop: 'cameraSN', label: '摄像机序列号', width: 120 },
        { prop: 'cameraValidationCode', label: '摄像机验证码', width: 120 },
        {
          prop: 'runtimeInfo',
          label: '无人船状态',
          render: (val) => BASE_CONSTANTS.usvState(val.state),
          width: 180
        },
        {
          prop: 'organization',
          label: '所属机构',
          render: (val) => val.name
        }
      ]),
      tableOption: {
        label: '操作',
        width: 200,
        options: [
          {
            label: '编辑',
            dropdown: true,
            items: [
              {
                command: 'info',
                label: '修改信息'
              },
              {
                command: 'config',
                label: '修改参数配置'
              },
              {
                command: 'reset',
                label: '恢复出厂设置'
              },
              {
                command: 'returnHome',
                label: '设置返航点'
              },
              {
                command: 'action',
                label: '执行计划'
              },
              {
                command: 'viewStatusInfo',
                label: '基本状态信息'
              },
              {
                command: 'viewRunStatus',
                label: '运行状态信息'
              },
              {
                command: 'onlineVideo',
                label: '实时视频'
              }
            ]
          },
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.handleDelShip
          }
        ]
      }
    };
  },
  created() {
    console.log(shipApi);
    this.getShipList();
    this.getOrganList();
  },
  beforeDestroy() {
    clearInterval(this.checkTokenInterval);
  },
  methods: {
    //表格按钮事件调用
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    },
    /**
     * 菜单显示的时候事件
     */
    dropdownShow(row) {
      if (row.id === this.currentRow.id) return;
      this.currentRow = row;
    },
    /**
     *  获取无人船列表
     */
    async getShipList() {
      const { data } = await shipApi.apiGetShipByQuery(this.shipParams);
      this.shipList = data.result;
      this.total = data.result.length;
      for (let item of this.shipList) {
        // 当无人船的状态为0(离线) 不渲染下拉菜单中的一些项
        if (+item.runtimeInfo.state === 0) {
          const items = this.tableOption.options[0].items;
          items.find((val) => val.command === 'reset').state = 0;
          items.find((val) => val.command === 'onlineVideo').state = 1;
          items.find((val) => val.command === 'returnHome').state = 0;
          items.find((val) => val.command === 'config').state = 0;
          items.find((val) => val.command === 'viewStatusInfo').state = 0;
        }
      }
    },
    /**
     *  获取组织列表
     */
    async getOrganList() {
      const { data } = await organApi.apiGetOrganAll();
      if (data) this.organInfoList = data;
    },
    async getConfigShip() {
      this.isShowConfig = true;
      let { errorCode, data } = await shipApi.apiGetConfigShip(this.currentRow.id);
      if (+errorCode === 0) this.form = deepClone(data);
    },
    /**
     * 删除无人船
     */
    async handleDelShip(row, index) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await shipApi.apiDelShip(row.id);
        if (+errorCode === 0) {
          this.shipList.splice(index, 1);
          this.$message.success('删除成功');
        }
      }
    },
    /**
     * 搜索无人船
     */
    handleButtonSearch(val) {
      this.shipParams['Condition.Keyword'] = val;
      console.log(this.shipParams);
      this.getShipList();
    },
    /**
     * 添加无人船
     */
    handleButtonDrag() {
      this.isShowEditAdd = true;
      this.title = 'add';
    },
    /**
     * 点击下拉菜单项
     */
    dropdownChange(val) {
      if (val === 'info') {
        this.title = 'edit';
        this.isShowEditAdd = true;
      } else if (val === 'reset') {
        this.handleFactoryResetShip();
      } else if (val === 'returnHome') {
        this.handleSetReturnHome();
      } else if (val === 'viewStatusInfo') {
        this.isShowState = true;
      } else if (val === 'config') {
        this.getConfigShip();
      } else if (val === 'viewRunStatus') {
        this.toRunStatus();
      } else if (val === 'onlineVideo') {
        this.contentLineVideo();

        // //十秒检查一次token是否快过期,还有3600秒,给新的token
        this.checkTokenInterval = setInterval(() => {
          if (checkTokenTime(this.videoData.cTime, 3600)) {
            getOnlineVideoToken();
          }
        }, 10000);
      } else if (val === 'action') {
        console.log('action');
      }
    },

    async getOnlineVideoToken() {
      let result = await liveApi.apiGetOnlineVideoToken();
      if (+result.errorCode === 0) {
        this.videoData.exp = result.data.expiry;
        this.videoData.cTime = +(new Date(result.data.expiry).getTime() / 1000);
        this.videoData.token = result.data.token;
        console.log(this.videoData);
      }
    },
    async contentLineVideo() {
      let { errorCode, data } = await liveApi.apiOnlineVideo(this.currentRow.id, this.currentRow);
      if (+errorCode === 0) {
        let videoUrl = data;
        this.videoData.url = videoUrl;
        await this.getOnlineVideoToken();
      }
    },

    /**
     * 恢复出厂设置
     */
    async handleFactoryResetShip() {
      const currentShip = this.currentRow;
      const confirmRlust = await confirmMsg(this, '此操作将会把该无人船恢复出厂设置');
      if (confirmRlust === 'confirm') {
        const { errorCode } = await shipApi.apiFactoryResetShip(currentShip.id);
        if (+errorCode === 0) {
          this.$message.success('恢复出厂设置成功');
          this.getShipList();
        }
      }
    },
    /**
     * 设置返航点
     */
    async handleSetReturnHome() {
      const currentShip = this.currentRow;
      // 开启事件流
      // this.wsReturnHome = signalr.connected(this.showShipStatusInfo);
    },

    // 跳转显示查看无人船状态
    async toRunStatus() {
      const confirmRlust = await confirmMsg(this, '此操作将跳转到无人船运行状态界面');
      if (confirmRlust == 'confirm') {
        console.log(this.currentRow.id);
        return;
        this.$router.push({
          path: 'runstate',
          query: { usvId: this.currentRow.id }
        });
      }
    }
  }
};
</script>

<style scoped lang="less">
@w100: 100%;
.ship-content {
  height: @w100;
  position: relative;
}
/deep/ .el-card {
  height: @w100;
}
</style>
