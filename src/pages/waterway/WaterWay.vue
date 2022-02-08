<template>
  <div class="way-content">
    <div class="add-way">
      <el-button type="primary" @click="handleAddNava">添加航标</el-button>
    </div>
    <way-dialog
      v-if="currentWay.length"
      class="way-dialog"
      :currentWay="currentWay"
      @handleEdit="handleEdit"
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
import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { debounce, deepClone } from '@/utils';
import { confirmMsg } from '@/utils';
import getList from './mixins-js/getList';

export default {
  name: 'WaterWay',
  mixins: [getList],
  components: {
    Amap,
    NavaDialog,
    WayDialog,
    AddNavaDialog
  },
  data() {
    return {
      isClickMap: false,
      isRequest: true,
      isShowWayIdent: false,
      currentNava: null,
      currentWay: [],
      currentWayIdent: '',
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
      waterwayEvents: Object.freeze({
        mouseover: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 9;
          e.target.setOptions({ showDir: true });
          const wayIdent = this.$refs.wayIdent;
          wayIdent.style.top = e.originEvent.offsetY + 'px';
          wayIdent.style.left = e.originEvent.offsetX + 'px';
          wayIdent.style.color = waterway.color;
          this.currentWayIdent = waterway.ident;
          this.isShowWayIdent = true;
        },
        mouseout: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 4;
          e.target.setOptions({ showDir: false });
          this.isShowWayIdent = false;
          this.currentWayIdent = '';
        },
        click: (e) => {
          const waterway = e.target.getExtData();
          // 获得父组件航道信息框是否打开
          this.currentWay = [];
          this.currentWay.push(waterway);
        }
      }),
      navaEvents: Object.freeze({
        // 航标拖动事件
        dragging: async (e) => {
          this.isRequest = false;
          const isAddNava = e.target.getExtData();
          if (!isAddNava.id) {
            //添加时
            this.navaAddData.longitude = e.lnglat.lng;
            this.navaAddData.latitude = e.lnglat.lat;
          } else {
            this.currentNava.locationObj.longitude = e.lnglat.lng;
            this.currentNava.locationObj.latitude = e.lnglat.lat;
          }
        }
      }),
      currentWayEvents: Object.freeze({})
    };
  },
  methods: {
    /**
     * 点击航标新增
     */
    handleAddNava() {
      this.navaAddData.isClick = true;
      this.isClickMap = true;
      this.isRequest = false;
      this.$message.info('开启了航标新增，请点击地图');
    },
    /**
     * 添加航标请求
     */
    async handleAddSave() {
      let data = deepClone(this.navaAddData);
      const regIdent = /^[A-Z0-9]{5}$/;
      const regZoom = /^\d{1,2}$/;
      if (!regIdent.test(data.ident)) {
        this.$message.error('标识为长度为5的大写字母和数字');
        return;
      }
      if (!regZoom.test(+data.zoomLevel)) {
        this.$message.error('层级为3-20的数字');
        return;
      }
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await apiNava.apiAddNava(data);
      if (+errorCode === 0) {
        this.resetNavaAddData();
        data = null;
        this.$message.success('添加成功');
        this.getNavaList();
      }
    },

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
     * 关闭Dialog
     */
    handleBoxClose() {
      console.log('handleBoxClose');
      this.currentNava = null;
      this.currentWay = [];
      this.isRequest = true;
    },

    /**
     * 航标 航道 的更新
     */
    async handleEdit(type, val) {
      if (type === 'nava') {
        this.editNava(val);
      } else if (type === 'way') {
        console.log(type);
      }
    },
    /**
     * 航标更新请求
     */
    async editNava(val) {
      let data = deepClone(val);
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
      data.location = turnLngLat(data.locationObj);
      const { errorCode } = await apiNava.apiEditNava(data);
      if (+errorCode !== 0) return;
      this.$message.success('修改成功');
      this.currentNava = null;
      data = null;
      this.isRequest = true;
      this.getNavaList();
    },

    /**
     * 删除航标
     */
    async handleDelete(id, func) {
      const confirmResult = await confirmMsg(this);
      if (confirmResult === 'confirm') {
        const { errorCode } = await apiNava[func](id);
        if (+errorCode !== 0) return;
        let index = this.navaList.findIndex((item) => item.id === id);
        this.navaList.splice(index, 1);
        this.$message.success('删除成功');
      }
    },
    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, center) {
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath[3]);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath[2]);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath[1]);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath[0]);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      if (!this.isRequest) return;
      this.getWaterwayList();
      this.getNavaList();
    }, 500),

    /**
     * 点击地图获取坐标
     */
    getMapLngLat(p) {
      let lng = p.lng,
        lat = p.lat;
      this.navaAddData.latitude = lat;
      this.navaAddData.longitude = lng;
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
  .add-way {
    position: absolute;
    left: 0;
    z-index: 99;
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
