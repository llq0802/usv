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
        :tableLoading="loading"
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

    <action-dialog :isShow.sync="isShowAction" ref="actionDialog" />

    <!-- 视频组件 -->
    <on-video :isShow.sync="isShowVideo" :accessToken="videoData.token" :url="videoData.url" />
  </div>
</template>

<script>
import TableSearch from 'components/common/table-search/TableSearch.vue';
import BaseTable from 'components/common/table/Mytable.vue';
import EditConfig from './components/S-EditConfig.vue';
import ActionDialog from './components/S-ActionDialog.vue';
import StateInfo from './components/S-StateInfo.vue';
import EditAdd from './components/S-AddOrEdit.vue';
import OnVideo from './components/S-LineVideo.vue';
import * as organApi from 'api/organization';
import * as shipApi from 'api/shipinfo';
import * as liveApi from 'api/camera';
import { PAGE_SIZE, BASE_CONSTANTS } from '@/config';
import { checkTokenTime } from '@/utils/token';
import { confirmMsg } from '@/utils';

export default {
  name: 'shipinfo',
  components: {
    TableSearch,
    BaseTable,
    EditAdd,
    StateInfo,
    EditConfig,
    OnVideo,
    ActionDialog
  },
  data() {
    return {
      checkTokenInterval: null,
      total: 0,
      title: 'add',
      /**组件是否弹窗 */
      isShowEditAdd: false,
      isShowState: false,
      isShowConfig: false,
      isShowVideo: false,
      isShowAction: false,
      loading: false,
      currentRow: {}, // 当前表格行的信息
      organInfoList: [],
      shipList: [],
      // 视频组件信息
      videoData: {
        url: null,
        token: null,
        exp: null,
        cTime: null
      },
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
                command: 'editInfo',
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
                command: 'setReturnPoint',
                label: '设置返航点'
              },
              {
                command: 'actionPlan',
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
    this.getShipList();
    this.getOrganList();
  },
  deactivated() {
    this.checkTokenInterval && clearInterval(this.checkTokenInterval);
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
      this.loading = true;
      const items = this.tableOption.options[0].items;
      const { data, errorCode } = await shipApi.apiGetShipByQuery(this.shipParams);
      if (+errorCode === 0) {
        this.loading = false;
        this.shipList = data.result;
        this.total = data.result.length;
        for (let item of this.shipList) {
          // 当无人船的状态为0(离线) 不渲染下拉菜单中的一些项
          if (+item.runtimeInfo.state === 0) {
            items.find((val) => val.command === 'reset').state = 0;
            items.find((val) => val.command === 'onlineVideo').state = 0;
            items.find((val) => val.command === 'setReturnPoint').state = 0;
            items.find((val) => val.command === 'config').state = 0;
            items.find((val) => val.command === 'actionPlan').state = 0;
            items.find((val) => val.command === 'viewStatusInfo').state = 0;
            items.find((val) => val.command === 'viewRunStatus').state = 0;
          }
        }
      }
    },
    /**
     *  获取组织列表
     */
    async getOrganList() {
      const { data, errorCode } = await organApi.apiGetOrganAll();
      if (+errorCode !== 0) return;
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
      if (val === 'editInfo') {
        this.title = 'edit';
        this.isShowEditAdd = true;
      } else if (val === 'reset') {
        this.handleFactoryResetShip();
      } else if (val === 'setReturnPoint') {
        this.handleSetReturnHome();
      } else if (val === 'viewStatusInfo') {
        this.isShowState = true;
      } else if (val === 'config') {
        this.getConfigShip();
      } else if (val === 'viewRunStatus') {
        this.toRunStatus();
      } else if (val === 'onlineVideo') {
        this.contentLineVideo();
        // //30秒检查一次token是否快过期,还有3600秒,给新的token
        this.checkTokenInterval = setInterval(() => {
          if (checkTokenTime(this.videoData.cTime, 3600)) getOnlineVideoToken();
          console.log('checkTokenInterval');
        }, 3e4);
      } else if (val === 'actionPlan') {
        console.log('actionPlan');
        this.$refs.actionDialog.actiomFrom.usvId = this.currentRow.id;
        this.isShowAction = true;
      }
    },
    /**
     * 获取视频地址
     */
    async contentLineVideo() {
      this.isShowVideo = true;
      let { errorCode, data } = await liveApi.apiOnlineVideo(this.currentRow.id, this.currentRow);
      if (+errorCode === 0) {
        let videoUrl = data;
        this.videoData.url = videoUrl;
        await this.getOnlineVideoToken();
      }
    },
    /**
     * 获取视频token ,time
     */
    async getOnlineVideoToken() {
      let result = await liveApi.apiGetOnlineVideoToken();
      if (+result.errorCode === 0) {
        this.videoData.exp = result.data.expiry;
        this.videoData.cTime = +(new Date(result.data.expiry).getTime() / 1000);
        this.videoData.token = result.data.token;
        console.log(this.videoData);
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
      const { data, errorCode } = await shipApi.apiGetReturnPointShip(currentShip.id);
      if (+errorCode === 0) {
        console.log(data);
      }
      // 开启事件流
      // this.wsReturnHome = signalr.connected(this.showShipStatusInfo);
    },

    // 跳转显示查看无人船状态
    async toRunStatus() {
      const confirmRlust = await confirmMsg(this, '此操作将跳转到无人船运行状态界面');
      if (confirmRlust == 'confirm') {
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
.ship-content {
  height: 100%;
  position: relative;
}
/deep/ .el-card {
  height: 100%;
}
</style>
