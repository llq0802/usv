<template>
  <div class="way-content">
    <div class="add-nava">
      <el-button type="primary" @click="handleAddNava">添加航标</el-button>
      <el-button type="primary" @click="handleAddWay">添加航道</el-button>
    </div>

    <way-dialog
      v-if="currentWay.length"
      class="way-dialog"
      :wayList="currentWay"
      @handleEdit="handleEdit"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
    />

    <edit-or-add-way
      ref="editaddway"
      class="edit-or-add-way"
      v-if="isShowWayDialog"
      :currentWay="currentWayDialog"
      :isAutoPlan="!wayAddData.plan"
      @handleNavaClick="handleNavaClick"
      @handleDelCurrentWayDialog="handleDelCurrentWayDialog"
      @handleDelWayPrevOrNext="handleDelWayPrevOrNext"
      @handleWaySave="handleWaySave"
      @autoPlanRequest="autoPlanRequest"
      @handleWayCancel="handleWayCancel"
    />

    <Amap ref="amap" :isEdit="isClickMap" @getLngLat="getMapLngLat" @getMapBounds="getMapBounds">
      <template #chanel>
        <!-- 航道 -->
        <template v-if="waterwayList.length">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + 'a'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight"
            :zIndex="50"
            :extData="item"
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>
        <!-- 鼠标经过航道显示dient -->
        <div ref="wayIdent" v-show="isShowWayIdent" class="wayIdent">{{ currentWayIdent }}</div>
        <!-- 当前选中的航道 -->
        <template v-for="(item, index) in currentWay">
          <el-amap-polyline
            v-show="currentWay.length"
            :extData="item"
            :key="index + 'b'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="9"
            :events="currentWayEvents"
            :zIndex="60"
            lineJoin="round"
            ref="currentWay"
          ></el-amap-polyline>
        </template>
        <!-- 航标 -->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="(item, index) in navaList"
            :key="index"
            :position="[item.locationObj.longitude, item.locationObj.latitude]"
            :draggable="currentNava && currentNava.id === item.id"
            :events="navaEvents"
            :extData="item"
            :offset="[-5, -5]"
            :zIndex="9"
          >
            <nava-dialog
              :value="item"
              :currentNava="currentNava"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleEdit="handleEdit"
              @handleDelete="handleDelete"
            />
          </el-amap-marker>
          <template v-for="(nava, index) in navaList">
            <el-amap-circle
              v-if="currentNava && currentNava.id === nava.id"
              :key="index + 'bb'"
              :center="[nava.locationObj.longitude, nava.locationObj.latitude]"
              :radius="nava.radius"
              :fill-opacity="0.5"
              strokeColor="#409eff"
              :strokeWeight="1"
              fillColor="#86D4D8"
              :bubble="true"
              :extData="nava"
              :zIndex="999"
            >
            </el-amap-circle>
          </template>
        </template>
        <!-- 新增航标 -->
        <template v-if="navaAddData && navaAddData.latitude">
          <el-amap-marker
            :position="[navaAddData.longitude, navaAddData.latitude]"
            :draggable="true"
            :offset="[-3, -3]"
            :zIndex="1000"
            :events="navaEvents"
          >
            <AddNavaDialog
              :value="navaAddData"
              @handleAddSave="handleAddSave"
              @handleAddBoxClose="handleAddBoxClose"
            ></AddNavaDialog>
          </el-amap-marker>
          <!-- 新增航标半径 -->
          <el-amap-circle
            :center="[navaAddData.longitude, navaAddData.latitude]"
            :radius="navaAddData.radius"
            :fill-opacity="0.5"
            strokeColor="#75CAE7"
            fillColor="#86D4D8"
            :bubble="true"
          ></el-amap-circle>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';
import WayDialog from './components/S-WayDialog';
import NavaDialog from './components/S-NavaDialog';
import AddNavaDialog from './components/S-AddNavaDialog';
import EditOrAddWay from './components/S-EditOrAddWay';
import * as navaApi from 'api/nava';
import * as wayApi from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { debounce, deepClone } from '@/utils';
import getList from './mixins-js/getList';
import delList from './mixins-js/delList';
import editList from './mixins-js/editList';
import amapEvents from './mixins-js/amapEvents';
import utils from './mixins-js/utils';

export default {
  name: 'WaterWay',
  mixins: [getList, delList, editList, amapEvents, utils],
  components: {
    Amap,
    NavaDialog,
    WayDialog,
    AddNavaDialog,
    EditOrAddWay
  },
  data() {
    return {
      isShowWayDialog: false, // 是否为显示航道操作栏弹窗
      isClickMap: false,
      isRequest: true,
      isShowWayIdent: false,
      currentNava: null,
      currentWay: [],
      currentWayIdent: '',
      currentWayDialog: null,
      mapInstance: null,
      lineInstance: Object.freeze([]), //实例
      publicQuery: {
        //公共的请求参数
        'Condition.Rect.TopLeft': '',
        'Condition.Rect.TopRight': '',
        'Condition.Rect.BottomLeft': '',
        'Condition.Rect.BottomRight': '',
        'Condition.ZoomLevel': null,
        'Condition.Keyword': '',
        Page: 1,
        Size: 1e5
      },
      navaAddData: {
        isClick: false,
        ident: '',
        latitude: null,
        longitude: null,
        radius: 1000,
        zoomLevel: 3
      },
      // 新增航道数据
      wayAddData: {
        isClick: false, // 是否点击了新增航道按钮
        wayDistance: 0,
        // verify: false,
        ident: '', //航道标识
        plan: 1 //0自动规划, 1手动规划
      }
    };
  },
  methods: {
    // 通过新增航道获取航道id
    async getAddWayIdent(ident = this.wayAddData.ident) {
      const { data, errorCode } = await wayApi.apiAddWay({ ident });
      if (+errorCode === 0) return data.id;
    },
    /**
     * 航道操作框新增 修改保存(网络请求)
     */
    async handleWaySave(val) {
      const navaList = val.fixes;
      if (navaList.length >= 2) {
        let waterwayId = val.id;
        let arr = navaList.map((item, i) => {
          item.order = Number.parseInt(i) + 1;
          return {
            order: item.order,
            navaidId: item.navaidId
          };
        });
        const fixes = deepClone(arr);
        let data = { waterwayId, fixes };
        const { errorCode } = await wayApi.apiEditWay(data);
        if (+errorCode === 0) {
          this.$message.success('修改成功');
          data = null;
          this.getNavaList();
          this.getWaterwayList();
        }
      } else {
        this.$message.warning('一条航道必须拥有两个及两个以上的航标');
      }
    },

    /**
     * 点击航道操作框里的航标
     */
    handleNavaClick(nava, index) {
      const editaddway = this.$refs.editaddway;
      const navaid = nava.navaid;
      const autoPlanData = editaddway.autoPlanData;
      const navaLsit = this.currentWayDialog.fixes;
      editaddway.cursorInsertIndex = index;
      //自动规划
      if (this.wayAddData.plan === 0) {
        //查找当前点击航标是否在本航道之中
        const flag = autoPlanData.selectWaterwayId.some((iid) => iid === navaid.id);
        if (autoPlanData.startNava.ident && autoPlanData.endNava.ident) {
          this.$message.warning('如要修改起点或终点航标,请先清除已选择的航标');
          return;
        }
        //将点击的航标赋值给自动规划中的起点和终点(深克隆)
        if (!autoPlanData.isStart) {
          if (autoPlanData.endNava.id && autoPlanData.endNava.id === navaid.id) {
            this.$message.warning('不能选择同一航标进行自动规划');
            return;
          }
          // 查找起点的下标
          let startIndex = navaLsit.findIndex((item) => item.navaidId === navaid.id);
          if (autoPlanData.endNava.id) {
            let index = navaLsit.findIndex((item) => item.navaidId === autoPlanData.endNava.id);
            if (index <= startIndex) {
              this.$message.warning('终点航标不能在起点航标之前');
              return;
            }
          }
          autoPlanData.startNava = deepClone(navaid);
          if (!flag) {
            autoPlanData.selectWaterwayId = [...autoPlanData.selectWaterwayId, navaid.id];
          }
          autoPlanData.isStart = !autoPlanData.isStart;
        } else if (autoPlanData.isStart && !autoPlanData.isEnd) {
          if (autoPlanData.startNava.id === navaid.id) {
            this.$message.warning('不能选择同一航标进行自动规划');
            return;
          }
          // 查找终点的下标
          let endIndex = navaLsit.findIndex((item) => item.navaidId === navaid.id);
          if (autoPlanData.startNava.id) {
            let index = navaLsit.findIndex((item) => item.navaidId === autoPlanData.startNava.id);
            if (index >= endIndex) {
              this.$message.warning('终点航标不能在起点航标之前!!');
              return;
            }
          }
          autoPlanData.endNava = deepClone(navaid);
          // autoPlanData.selectWaterwayId = flag
          //   ? autoPlanData.selectWaterwayId.filter(iid => iid !== navaid.id)
          //   : [...autoPlanData.selectWaterwayId, navaid.id];
          if (!flag) {
            autoPlanData.selectWaterwayId = [...autoPlanData.selectWaterwayId, navaid.id];
          }
          autoPlanData.isEnd = !autoPlanData.isEnd;
        }
      }
    },
    /**
     * 关闭新增的Dialog
     */
    handleAddBoxClose() {
      this.resetNavaAddData();
    },
    /**
     * 重置新增航标数据
     */
    resetNavaAddData() {
      this.isRequest = true;
      this.isClickMap = false;
      this.navaAddData = {
        isClick: false,
        ident: '',
        latitude: null,
        longitude: null,
        radius: 1000,
        zoomLevel: 3
      };
    },
    /**
     * 点击当前航标
     */
    handleCurrentClick(type, value) {
      console.log(value);
      let lng = value.locationObj.longitude,
        lat = value.locationObj.latitude;
      this.currentNava = value;
      for (let way of this.waterwayList) {
        //判断点击的航标所在的航道
        const flag = way.fixesArray.some((item) => {
          let wayLng = +item.lng.toFixed(6),
            wayLat = +item.lat.toFixed(6);
          return wayLat === lat && wayLng === lng;
        });
        if (flag && this.currentWay.every((item) => item.id !== way.id)) {
          this.currentWay.push(way);
        }
        console.log(this.currentWay);
      }
    },
    /**
     * 关闭航道,航标的信息框
     */
    handleBoxClose(type) {
      if (type === 'nava') {
        this.isShowWayDialog = false;
        this.currentNava = null;
        this.currentWay = [];
        this.isRequest = true;
      } else if (type === 'way') {
        this.isShowWayDialog = false;

        this.currentWayDialog = null;
        this.currentNava = null;
        this.currentWay = [];
        this.isRequest = true;
      }
    },
    /**
     * 关闭航道操作栏
     */
    handleWayCancel() {
      this.isShowWayDialog = false;
      this.currentWayDialog = null;
      this.currentWay = [];
      this.currentNava = null;
    },

    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, mapCenter, mapInstance) {
      this.mapInstance = mapInstance;
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath[3]);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath[2]);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath[1]);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath[0]);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      if (!this.isRequest) return;
      await Promise.all([this.getWaterwayList(), this.getNavaList()]);
      if (this.currentNava && !this.navaList.find((item) => item.id === this.currentNava.id)) {
        this.currentNava = null;
      }
    }, 500),

    /**
     * 点击地图获取坐标
     */
    getMapLngLat(p) {
      let lng = p.lng,
        lat = p.lat;
      this.navaAddData.latitude = lat;
      this.navaAddData.longitude = lng;
    },
    /**
     * 点击航标添加
     */
    handleAddNava() {
      this.navaAddData.isClick = true;
      this.isClickMap = true;
      this.isRequest = false;
      this.$message.info('开启了航标新增，请点击地图');
    },
    /**
     * 点击航道添加
     */
    handleAddWay() {
      this.isShowWayDialog = true;
      this.wayAddData.isClick = true;
      this.wayAddData.plan = 0;
    },
    /**
     * 添加航标请求
     */
    async handleAddSave() {
      let data = deepClone(this.navaAddData);
      const regIdent = /^[A-Z0-9]{5}$/;
      const regZoom = /^\d{1,2}$/;
      if (!regIdent.test(data.ident)) {
        this.$message.warning('标识为长度为5的大写字母和数字');
        return;
      }
      if (!regZoom.test(+data.zoomLevel)) {
        this.$message.warning('层级为3-20的数字');
        return;
      }
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await navaApi.apiAddNava(data);
      if (+errorCode === 0) {
        this.resetNavaAddData();
        data = null;
        this.$message.success('添加成功');
        this.getNavaList();
      }
    },
    // 自动航道规划网络请求展示到手动规划中修改
    async autoPlanRequest(StartNavaidId, EndNavaidId) {
      let navaList = this.currentWayDialog.fixes;
      let startIndex = navaList.findIndex((item) => item.navaidId === StartNavaidId);
      let endIndex = navaList.findIndex((item) => item.navaidId === EndNavaidId);
      if (startIndex !== -1 && endIndex !== -1 && startIndex >= endIndex) {
        this.$message.warning('终点航标不能在起点航标之前');
        return;
      }
      const { data, errorCode } = await wayApi.apiGetWayBestShort({ StartNavaidId, EndNavaidId });
      if (+errorCode !== 0) return;
      // 设置航道中的航标数组
      let setFixArray = [];
      // 添加航标 处理数据
      for (let item of data) {
        item.navaid.locationObj = turnLngLatObj(item.navaid.location);
        // 设置手动规划、修改路线
        setFixArray.push({
          navaidId: item.id,
          navaid: item.navaid
        });
      }
      //变成修改模式
      // 替换的项数
      let index = Math.abs(endIndex - startIndex) + 1;
      !navaList.length
        ? (navaList = setFixArray) // 之前没航标就直接赋值
        : navaList.splice(startIndex, index, ...setFixArray); // 替换之前的航标(开始索引,项数)
      //默认插入的航标位置
      this.cursorInsertIndex = navaList.length - 1;
      let pathArr = this.isSplitWaterway();
      this.lineInstance = this.addPolyLine(this.mapInstance, pathArr, this.lineInstance);
      this.currentWayDialog.totalDistance = this.getDistanceOfLine(pathArr);
    }
  }
};
</script>

<style scoped lang="less">
.way-content {
  height: 100%;
  position: relative;
  .way-dialog {
    position: absolute;
    right: 0;
    z-index: 99;
    background: rgba(250, 250, 250, 0.9);
    padding: 10px;
  }
  .add-nava {
    position: absolute;
    left: 0;
    z-index: 99;
  }
  .edit-or-add-way {
    position: absolute;
  }
  .wayIdent {
    position: absolute;
    font-size: 20px;
    cursor: default;
    transform: translate(-50%, -150%);
    font-weight: bold;
    text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
  }
}
</style>
